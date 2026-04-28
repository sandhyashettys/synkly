"use client";
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { clientApi } from '@/lib/api';
import { ClientLayout } from './ClientDashboard';
import { Button, Modal, DataTable, Badge, StatCard, Skeleton, toast } from '@/components/ui';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// ─── MODULE CONFIG defines each module's UI
const MODULE_CONFIGS: Record<string, {
  title: string; subtitle: string; icon: string;
  columns: Array<{ key: string; label: string; render?: (r:any)=>React.ReactNode }>;
  formFields: Array<{ name: string; label: string; type: string; required?: boolean; options?: string[] }>;
  stats: Array<{ label: string; icon: string; color: string; fn: (records:any[])=>string|number }>;
  emptyIcon: string; emptyMsg: string;
}> = {
  finance: {
    title: 'Finance', subtitle: 'Track income, expenses and financial records',
    icon: '💰',
    columns: [
      { key:'data.date',        label:'Date',        render:r=>formatDate(r.data?.date||r.createdAt) },
      { key:'data.description', label:'Description', render:r=><span className="font-medium">{r.data?.description||'—'}</span> },
      { key:'data.category',    label:'Category',    render:r=><Badge variant="gray">{r.data?.category||'—'}</Badge> },
      { key:'data.type',        label:'Type',        render:r=><Badge variant={r.data?.type==='income'?'green':'red'}>{r.data?.type||'—'}</Badge> },
      { key:'data.amount',      label:'Amount',      render:r=><span className={cn('font-bold',r.data?.type==='income'?'text-emerald-600':'text-red-500')}>{r.data?.type==='income'?'+':'-'}${Number(r.data?.amount||0).toLocaleString()}</span> },
    ],
    formFields: [
      { name:'description', label:'Description', type:'text', required:true },
      { name:'amount',      label:'Amount ($)',  type:'number', required:true },
      { name:'type',        label:'Type',        type:'select', required:true, options:['income','expense'] },
      { name:'category',    label:'Category',    type:'select', required:true, options:['Sales Revenue','Service Fee','Consulting','Subscription','Salaries','Rent','Utilities','Marketing','Travel','Software','Equipment','Other'] },
      { name:'date',        label:'Date',        type:'date', required:true },
      { name:'notes',       label:'Notes',       type:'textarea' },
    ],
    stats: [
      { label:'Total Income',  icon:'📈', color:'#059669', fn:r=>formatCurrency(r.filter((x:any)=>x.data?.type==='income').reduce((a:number,x:any)=>a+Number(x.data?.amount||0),0)) },
      { label:'Total Expenses',icon:'📉', color:'#dc2626', fn:r=>formatCurrency(r.filter((x:any)=>x.data?.type==='expense').reduce((a:number,x:any)=>a+Number(x.data?.amount||0),0)) },
      { label:'Net Balance',   icon:'💵', color:'#2563eb', fn:r=>formatCurrency(r.reduce((a:number,x:any)=>a+(x.data?.type==='income'?1:-1)*Number(x.data?.amount||0),0)) },
      { label:'Transactions',  icon:'🔢', color:'#7c3aed', fn:r=>r.length },
    ],
    emptyIcon:'💳', emptyMsg:'No transactions yet. Add your first one.',
  },

  people: {
    title: 'People & HR', subtitle: 'Manage team members, roles and departments',
    icon: '👥',
    columns: [
      { key:'name',        label:'Name',       render:r=><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(r.data?.name||'?').split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}</div><div><div className="font-medium text-sm">{r.data?.name}</div><div className="text-xs text-slate-400">{r.data?.email}</div></div></div> },
      { key:'department',  label:'Dept',       render:r=><span className="text-sm">{r.data?.department||'—'}</span> },
      { key:'role',        label:'Role',       render:r=><span className="text-sm text-slate-500">{r.data?.role||'—'}</span> },
      { key:'status',      label:'Status',     render:r=><Badge variant={r.data?.status==='Active'?'green':r.data?.status==='On Leave'?'amber':'gray'}>{r.data?.status||'Active'}</Badge> },
      { key:'salary',      label:'Salary',     render:r=>r.data?.salary?formatCurrency(r.data.salary):'—' },
      { key:'startDate',   label:'Joined',     render:r=>r.data?.startDate?formatDate(r.data.startDate):'—' },
    ],
    formFields: [
      { name:'name',       label:'Full Name',    type:'text',   required:true },
      { name:'email',      label:'Email',        type:'email',  required:true },
      { name:'department', label:'Department',   type:'select', required:true, options:['Engineering','Finance','Sales','Marketing','Operations','HR','Design','Legal','Customer Support','Management'] },
      { name:'role',       label:'Role / Title', type:'text',   required:true },
      { name:'phone',      label:'Phone',        type:'tel' },
      { name:'status',     label:'Status',       type:'select', options:['Active','On Leave','Probation','Terminated'] },
      { name:'salary',     label:'Salary ($/yr)',type:'number' },
      { name:'startDate',  label:'Start Date',   type:'date' },
    ],
    stats: [
      { label:'Total Members', icon:'👥', color:'#7c3aed', fn:r=>r.length },
      { label:'Active',        icon:'✅', color:'#059669', fn:r=>r.filter((x:any)=>x.data?.status==='Active').length },
      { label:'On Leave',      icon:'🏖️', color:'#d97706', fn:r=>r.filter((x:any)=>x.data?.status==='On Leave').length },
      { label:'Est. Payroll',  icon:'💵', color:'#2563eb', fn:r=>formatCurrency(r.reduce((a:number,x:any)=>a+Number(x.data?.salary||0),0)) },
    ],
    emptyIcon:'👤', emptyMsg:'No team members yet. Add your first member.',
  },

  projects: {
    title: 'Projects & Tasks', subtitle: 'Track tasks, deadlines and team progress',
    icon: '📁',
    columns: [
      { key:'title',      label:'Task',     render:r=><div><div className="font-medium text-sm">{r.data?.title}</div>{r.data?.description&&<div className="text-xs text-slate-400">{r.data.description}</div>}</div> },
      { key:'status',     label:'Status',   render:r=><Badge variant={{' To Do':'gray','In Progress':'blue','In Review':'amber','Done':'green'}[r.data?.status as string]||'gray'}>{r.data?.status||'To Do'}</Badge> },
      { key:'priority',   label:'Priority', render:r=><Badge variant={{Low:'gray',Medium:'blue',High:'amber',Urgent:'red'}[r.data?.priority as string]||'gray'}>{r.data?.priority||'Medium'}</Badge> },
      { key:'assignee',   label:'Assignee', render:r=><span className="text-sm text-slate-500">{r.data?.assignee||'Unassigned'}</span> },
      { key:'dueDate',    label:'Due',      render:r=>r.data?.dueDate?formatDate(r.data.dueDate):'—' },
    ],
    formFields: [
      { name:'title',       label:'Task Title',    type:'text', required:true },
      { name:'description', label:'Description',   type:'textarea' },
      { name:'status',      label:'Status',        type:'select', options:['To Do','In Progress','In Review','Done'] },
      { name:'priority',    label:'Priority',      type:'select', options:['Low','Medium','High','Urgent'] },
      { name:'assignee',    label:'Assignee',      type:'text' },
      { name:'dueDate',     label:'Due Date',      type:'date' },
      { name:'category',    label:'Category',      type:'select', options:['Feature','Bug Fix','Task','Improvement','Research','Other'] },
    ],
    stats: [
      { label:'To Do',       icon:'📋', color:'#64748b', fn:r=>r.filter((x:any)=>x.data?.status==='To Do').length },
      { label:'In Progress', icon:'⚡', color:'#2563eb', fn:r=>r.filter((x:any)=>x.data?.status==='In Progress').length },
      { label:'In Review',   icon:'👁',  color:'#d97706', fn:r=>r.filter((x:any)=>x.data?.status==='In Review').length },
      { label:'Done',        icon:'✅', color:'#059669', fn:r=>r.filter((x:any)=>x.data?.status==='Done').length },
    ],
    emptyIcon:'📋', emptyMsg:'No tasks yet. Create your first task.',
  },

  contacts: {
    title: 'Contacts & CRM', subtitle: 'Manage leads, clients, partners and vendors',
    icon: '🤝',
    columns: [
      { key:'name',    label:'Contact', render:r=><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(r.data?.name||'?').split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}</div><div><div className="font-medium text-sm">{r.data?.name}</div><div className="text-xs text-slate-400">{r.data?.email}</div></div></div> },
      { key:'company', label:'Company', render:r=><span className="text-sm text-slate-600">{r.data?.company||'—'}</span> },
      { key:'type',    label:'Type',    render:r=><Badge variant={{Lead:'amber',Client:'green',Partner:'purple',Vendor:'cyan',Prospect:'blue'}[r.data?.type as string]||'gray'}>{r.data?.type||'Lead'}</Badge> },
      { key:'status',  label:'Status',  render:r=><Badge variant="gray">{r.data?.status||'New'}</Badge> },
      { key:'value',   label:'Value',   render:r=>r.data?.value?formatCurrency(r.data.value):'—' },
      { key:'location',label:'Country', render:r=><span className="text-sm text-slate-400">{r.data?.location||'—'}</span> },
    ],
    formFields: [
      { name:'name',     label:'Full Name',     type:'text',   required:true },
      { name:'email',    label:'Email',         type:'email',  required:true },
      { name:'company',  label:'Company',       type:'text' },
      { name:'phone',    label:'Phone',         type:'tel' },
      { name:'type',     label:'Contact Type',  type:'select', required:true, options:['Lead','Client','Partner','Vendor','Prospect'] },
      { name:'status',   label:'Status',        type:'select', options:['New','Contacted','Qualified','Proposal','Won','Lost','Active','Inactive','Negotiating','Engaged'] },
      { name:'value',    label:'Deal Value ($)',  type:'number' },
      { name:'location', label:'Country',       type:'text' },
      { name:'notes',    label:'Notes',         type:'textarea' },
    ],
    stats: [
      { label:'Total',    icon:'🎯', color:'#2563eb', fn:r=>r.length },
      { label:'Leads',    icon:'📊', color:'#d97706', fn:r=>r.filter((x:any)=>x.data?.type==='Lead').length },
      { label:'Clients',  icon:'✅', color:'#059669', fn:r=>r.filter((x:any)=>x.data?.type==='Client').length },
      { label:'Pipeline', icon:'💰', color:'#7c3aed', fn:r=>formatCurrency(r.filter((x:any)=>!['Won','Lost'].includes(x.data?.status||'')).reduce((a:number,x:any)=>a+Number(x.data?.value||0),0)) },
    ],
    emptyIcon:'🤝', emptyMsg:'No contacts yet. Add your first contact.',
  },

  documents: {
    title: 'Documents', subtitle: 'Store, organize and track business documents',
    icon: '📄',
    columns: [
      { key:'name',        label:'Document',   render:r=><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">📄</div><div><div className="font-medium text-sm">{r.data?.name}</div>{r.data?.description&&<div className="text-xs text-slate-400">{r.data.description}</div>}</div></div> },
      { key:'type',        label:'Type',       render:r=><Badge variant="blue">{r.data?.type||'Other'}</Badge> },
      { key:'status',      label:'Status',     render:r=><Badge variant={{Draft:'amber','Under Review':'blue',Approved:'green',Archived:'gray'}[r.data?.status as string]||'gray'}>{r.data?.status||'Draft'}</Badge> },
      { key:'createdAt',   label:'Created',    render:r=>formatDate(r.createdAt) },
    ],
    formFields: [
      { name:'name',        label:'Document Name', type:'text',   required:true },
      { name:'type',        label:'Type',          type:'select', required:true, options:['Contract','Invoice','Report','Proposal','Policy','Manual','Agreement','Other'] },
      { name:'description', label:'Description',   type:'textarea' },
      { name:'status',      label:'Status',        type:'select', options:['Draft','Under Review','Approved','Archived'] },
      { name:'tags',        label:'Tags (comma-separated)', type:'text' },
    ],
    stats: [
      { label:'Total',       icon:'📄', color:'#2563eb', fn:r=>r.length },
      { label:'Draft',       icon:'📝', color:'#d97706', fn:r=>r.filter((x:any)=>x.data?.status==='Draft').length },
      { label:'Under Review',icon:'🔍', color:'#7c3aed', fn:r=>r.filter((x:any)=>x.data?.status==='Under Review').length },
      { label:'Approved',    icon:'✅', color:'#059669', fn:r=>r.filter((x:any)=>x.data?.status==='Approved').length },
    ],
    emptyIcon:'📄', emptyMsg:'No documents yet. Add your first document.',
  },
};

// ─── Generic Module Page
export const ModulePage = ({ module }: { module: string }) => {
  const cfg = MODULE_CONFIGS[module];
  if (!cfg) return null;

  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'list'|'board'>('list');

  const { data, isLoading } = useQuery({
    queryKey: ['records', module, page, search],
    queryFn: () => clientApi.records.list(module, { page, limit: 20, search }),
  });

  const records  = data?.data?.data    || [];
  const total    = data?.data?.count   || 0;
  const pages    = data?.data?.pages   || 1;

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();

  const openAdd  = () => { reset({}); setEditRecord(null); setModalOpen(true); };
  const openEdit = (row: any) => {
    reset(row.data || {});
    setEditRecord(row);
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditRecord(null); reset({}); };

  const saveMutation = useMutation({
    mutationFn: (formData: any) =>
      editRecord
        ? clientApi.records.update(module, editRecord._id, formData)
        : clientApi.records.create(module, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', module] });
      qc.invalidateQueries({ queryKey: ['client-dashboard'] });
      toast.success(editRecord ? 'Record updated' : 'Record created successfully');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientApi.records.delete(module, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', module] });
      toast.info('Record deleted');
    },
  });

  const onSubmit = (data: any) => saveMutation.mutate(data);

  // Add action column to config columns
  const columns = [
    ...cfg.columns,
    {
      key: '_actions', label: 'Actions',
      render: (row: any) => (
        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => deleteMutation.mutate(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const isKanban = module === 'projects' && view === 'board';
  const STATUSES = ['To Do','In Progress','In Review','Done'];

  return (
    <ClientLayout title={cfg.title} subtitle={cfg.subtitle}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {cfg.stats.map(s => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={isLoading ? '—' : s.fn(records)} color={s.color} />
        ))}
      </div>

      {/* Table / Kanban card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm">{cfg.title}</span>
            <Badge variant="blue">{total}</Badge>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 w-44"
                placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {/* View toggle for projects */}
            {module === 'projects' && (
              <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                {(['list','board'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={cn('px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all',
                      view===v ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700')}>
                    {v}
                  </button>
                ))}
              </div>
            )}
            <Button size="sm" onClick={openAdd}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add {cfg.icon}
            </Button>
          </div>
        </div>

        {/* Kanban board for projects */}
        {isKanban ? (
          <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATUSES.map(status => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold">{status}</span>
                  <Badge variant="gray">{records.filter((r:any) => r.data?.status === status).length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {records.filter((r:any) => r.data?.status === status).map((r:any) => (
                    <div key={r._id} onClick={() => openEdit(r)}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="text-sm font-semibold mb-2 leading-snug">{r.data?.title}</div>
                      {r.data?.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{r.data.description}</p>}
                      <div className="flex items-center justify-between">
                        <Badge variant={{'Low':'gray','Medium':'blue','High':'amber','Urgent':'red'}[r.data?.priority as string]||'gray'} className="text-[10px]">
                          {r.data?.priority}
                        </Badge>
                        {r.data?.dueDate && <span className="text-xs text-slate-400">{formatDate(r.data.dueDate)}</span>}
                      </div>
                    </div>
                  ))}
                  {!records.filter((r:any) => r.data?.status === status).length && (
                    <div className="py-5 rounded-xl border-2 border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={records}
            loading={isLoading}
            emptyMessage={cfg.emptyMsg}
            emptyIcon={cfg.emptyIcon}
            onRowClick={openEdit}
          />
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {records.length} of {total}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1.5 text-xs font-bold">{page}/{pages}</span>
              <button onClick={() => setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen} onClose={closeModal}
        title={`${editRecord ? 'Edit' : 'Add'} ${cfg.icon} ${cfg.title.split(' ')[0]}`}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button loading={isSubmitting || saveMutation.isPending} onClick={handleSubmit(onSubmit)}>
              {editRecord ? 'Save Changes' : `Add ${cfg.title.split(' ')[0]}`}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {cfg.formFields.map((field, i) => {
            const isEven = cfg.formFields.length > 2 && i < cfg.formFields.length - (cfg.formFields.length % 2 === 0 ? 0 : 1);
            return (
              <div key={field.name}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none min-h-[80px]"
                    placeholder={field.label} {...register(field.name, { required: field.required ? `${field.label} is required` : false })} />
                ) : field.type === 'select' ? (
                  <select className="w-full h-10 px-3 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    {...register(field.name, { required: field.required ? `${field.label} is required` : false })}>
                    <option value="">Select {field.label}</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type} placeholder={field.label}
                    className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                      (errors as any)[field.name] ? 'border-red-400 bg-red-50':'')}
                    {...register(field.name, {
                      required: field.required ? `${field.label} is required` : false,
                      ...(field.type === 'email' ? { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter valid email' } } : {}),
                    })} />
                )}
                {(errors as any)[field.name] && (
                  <p className="mt-1 text-xs text-red-500">{(errors as any)[field.name]?.message}</p>
                )}
              </div>
            );
          })}
        </form>
      </Modal>
    </ClientLayout>
  );
};
