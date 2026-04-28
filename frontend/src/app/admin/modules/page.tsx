"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { modulesApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminDashboard';
import { Button, Modal, Badge, Skeleton, toast } from '@/components/ui';
import { moduleSchema, type ModuleFormData } from '@/lib/validations';
import { cn, formatDate } from '@/lib/utils';

export default function AdminModulesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editMod, setEditMod] = useState<any>(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-modules'], queryFn: () => modulesApi.list({ active: undefined }) });
  const modules = data?.data?.data || [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { category: 'core', isActive: true, isPremium: false },
  });

  const openAdd  = () => { reset({ category:'core', isActive:true, isPremium:false }); setEditMod(null); setModal(true); };
  const openEdit = (m: any) => { reset(m); setEditMod(m); setModal(true); };

  const saveMutation = useMutation({
    mutationFn: (d: ModuleFormData) => editMod ? modulesApi.update(editMod._id, d) : modulesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-modules'] }); toast.success(editMod?'Module updated':'Module created'); setModal(false); reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modulesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-modules'] }); toast.info('Module deleted'); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: any) => modulesApi.update(id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-modules'] }); },
  });

  const CATS = ['core','business','analytics','hr','finance','crm','operations'];

  return (
    <AdminLayout title="Modules" subtitle="Manage ERP modules and their features">
      <div className="flex justify-end mb-5">
        <Button onClick={openAdd}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Module
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_,i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((m: any) => (
            <div key={m._id} className={cn('bg-white border rounded-xl p-5 shadow-sm', m.isActive?'border-slate-200':'border-slate-200 opacity-60')}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{m.icon || '📦'}</div>
                  <div>
                    <div className="font-black text-base">{m.name}</div>
                    <div className="flex gap-1.5 mt-0.5">
                      <Badge variant="gray" className="capitalize text-xs">{m.category}</Badge>
                      {m.isPremium && <Badge variant="purple" className="text-xs">Premium</Badge>}
                    </div>
                  </div>
                </div>
                <button onClick={() => toggleActive.mutate({ id: m._id, isActive: !m.isActive })}
                  className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors cursor-pointer flex-shrink-0', m.isActive?'bg-emerald-500':'bg-slate-300')}>
                  <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', m.isActive?'translate-x-4':'')} />
                </button>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{m.description}</p>
              {m.features?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Features ({m.features.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {m.features.slice(0,3).map((f: any) => <span key={f.name} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg">{f.name}</span>)}
                    {m.features.length > 3 && <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">+{m.features.length-3} more</span>}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button size="xs" variant="ghost" className="flex-1" onClick={() => openEdit(m)}>Edit</Button>
                <Button size="xs" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteMutation.mutate(m._id)}>Delete</Button>
              </div>
            </div>
          ))}
          {!modules.length && <div className="col-span-3 text-center py-16 text-slate-400">No modules created yet</div>}
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); reset(); }} title={editMod?'Edit Module':'New Module'}
        footer={<><Button variant="ghost" onClick={() => { setModal(false); reset(); }}>Cancel</Button><Button loading={isSubmitting||saveMutation.isPending} onClick={handleSubmit(d => saveMutation.mutate(d))}>Save Module</Button></>}>
        <form className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Module Name <span className="text-red-500">*</span></label>
            <input className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500', errors.name?'border-red-400 bg-red-50':'border-slate-200')} placeholder="e.g. Finance & Accounting" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500" {...register('category')}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Icon (emoji)</label>
              <input className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="💰" {...register('icon')} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea className={cn('w-full px-3.5 py-2.5 rounded-lg border-[1.5px] text-sm outline-none resize-none h-20 focus:border-blue-500', errors.description?'border-red-400 bg-red-50':'border-slate-200')} placeholder="Module description…" {...register('description')} />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" {...register('isActive')} />
              <span className="text-sm font-medium">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-purple-600" {...register('isPremium')} />
              <span className="text-sm font-medium">Premium</span>
            </label>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
