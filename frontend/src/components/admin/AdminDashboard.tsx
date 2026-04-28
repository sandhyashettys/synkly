"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { adminApi, usersApi, modulesApi, pricingApi, blogApi, contactApi, settingsApi } from '@/lib/api';
import {
  Button, Modal, DataTable, Badge, StatCard, Skeleton,
  Card, CardHeader, CardBody, Avatar, Spinner, ProgressBar, toast, Toaster
} from '@/components/ui';
import { blogSchema, planSchema, moduleSchema, createUserSchema, type BlogFormData, type PlanFormData, type ModuleFormData } from '@/lib/validations';
import { cn, formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════
   ADMIN NAV CONFIG
═══════════════════════════════════════════════════════════ */
const ADMIN_NAV = [
  { id: 'dashboard', href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'users',     href: '/admin/users',     icon: '👥', label: 'User Management' },
  { id: 'modules',   href: '/admin/modules',   icon: '📦', label: 'Modules' },
  { id: 'pricing',   href: '/admin/pricing',   icon: '💰', label: 'Pricing Plans' },
  { id: 'blog',      href: '/admin/blog',      icon: '📝', label: 'Blog Management' },
  { id: 'contacts',  href: '/admin/contacts',  icon: '📬', label: 'Contact Leads' },
  { id: 'settings',  href: '/admin/settings',  icon: '⚙️',  label: 'Settings' },
];

/* ═══════════════════════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════════════════════ */
const AdminSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const doLogout = () => { logout(); toast.info('Signed out'); router.push('/'); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 bottom-0 w-64 bg-[#0f172a] flex flex-col z-50 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span className="text-lg font-black text-white tracking-tight">Synkly<span className="text-blue-400"> ERP</span></span>
          </div>
          <div className="px-2 py-1 rounded-md bg-amber-500/15 border border-amber-500/20 text-center">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/20">Management</div>
          {ADMIN_NAV.map(item => (
            <Link key={item.id} href={item.href} onClick={onClose}
              className={cn('sidebar-item', pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : '')}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="px-5 py-2.5 mt-2 text-[10px] font-bold uppercase tracking-widest text-white/20">Quick Links</div>
          <Link href="/" className="sidebar-item">
            <span className="text-base">🌐</span><span>View Website</span>
          </Link>
          <Link href="/client/dashboard" className="sidebar-item">
            <span className="text-base">🏢</span><span>Client Demo</span>
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar name={user?.fullName || ''} size={34} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{user?.fullName}</div>
              <div className="text-xs text-amber-400 font-semibold">Super Admin</div>
            </div>
          </div>
          <button onClick={doLogout}
            className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminTopBar = ({ title, subtitle, onMenuClick }: { title: string; subtitle?: string; onMenuClick: () => void }) => (
  <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-7 sticky top-0 z-30 flex-shrink-0">
    <div className="flex items-center gap-3">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div>
        <div className="font-bold text-base text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="amber" className="hidden sm:flex">⚡ Super Admin</Badge>
    </div>
  </header>
);

export const AdminLayout = ({ children, title, subtitle }: {
  children: React.ReactNode; title: string; subtitle?: string;
}) => {
  const [sideOpen, setSideOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'super_admin') { router.push('/client/dashboard'); }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" className="text-blue-600" /></div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <AdminTopBar title={title} subtitle={subtitle} onMenuClick={() => setSideOpen(true)} />
        <main className="flex-1 p-5 lg:p-7 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN OVERVIEW
═══════════════════════════════════════════════════════════ */
export const AdminDashboardPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.stats() });
  const stats = data?.data?.data;

  const KPI = [
    { icon:'👥', label:'Total Users',       value: stats?.users?.total     ?? '—', color:'#2563eb', bgColor:'#eff6ff' },
    { icon:'🏢', label:'Companies',         value: stats?.companies?.total ?? '—', color:'#7c3aed', bgColor:'#f5f3ff' },
    { icon:'💰', label:'Paid Subscriptions',value: stats?.companies?.paid  ?? '—', color:'#059669', bgColor:'#ecfdf5' },
    { icon:'📬', label:'New Inquiries',     value: stats?.contacts?.new    ?? '—', color:'#d97706', bgColor:'#fffbeb' },
    { icon:'📝', label:'Blog Posts',        value: stats?.blogs?.published ?? '—', color:'#0891b2', bgColor:'#ecfeff' },
    { icon:'🔄', label:'Trial Companies',   value: stats?.companies?.trial ?? '—', color:'#ec4899', bgColor:'#fdf2f8' },
  ];

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = stats?.charts?.monthlySignups || [];
  const maxVal = Math.max(...chartData.map((d: any) => d.count), 1);

  return (
    <AdminLayout title="Dashboard" subtitle="Platform overview and key metrics">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {KPI.map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: k.bgColor }}>
              {k.icon}
            </div>
            <div className="text-2xl font-black tracking-tight" style={{ color: k.color }}>
              {isLoading ? <Skeleton className="h-7 w-12" /> : k.value}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Monthly signups chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-base">Monthly New Signups</div>
            <Badge variant="blue">Last 6 months</Badge>
          </div>
          {isLoading ? (
            <div className="flex items-end gap-2 h-28">
              {[...Array(6)].map((_,i) => <Skeleton key={i} className="flex-1 h-full rounded-t" />)}
            </div>
          ) : chartData.length ? (
            <div className="flex items-end gap-2 h-28">
              {chartData.map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-slate-400">{d.count}</span>
                  <div className="w-full rounded-t transition-all"
                    style={{ height: `${(d.count / maxVal) * 88}px`, background: i === chartData.length-1 ? 'linear-gradient(to top,#2563eb,#7c3aed)' : '#dbeafe', minHeight: 4 }} />
                  <span className="text-xs text-slate-400">{months[d._id.month - 1]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center text-slate-400 text-sm">No signup data yet</div>
          )}
        </div>

        {/* Plan distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="font-bold text-base mb-4">Plan Distribution</div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <div className="space-y-3.5">
              {(stats?.charts?.planDistribution || []).map((p: any) => {
                const total = stats?.users?.total || 1;
                const pct = Math.round((p.count / total) * 100);
                const colors: Record<string,string> = { free:'#64748b', starter:'#2563eb', growth:'#7c3aed', enterprise:'#059669' };
                return (
                  <div key={p._id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="capitalize font-medium">{p._id || 'free'}</span>
                      <span className="font-bold" style={{ color: colors[p._id] || '#64748b' }}>{p.count}</span>
                    </div>
                    <ProgressBar value={pct} color={colors[p._id] || '#64748b'} />
                  </div>
                );
              })}
              {!stats?.charts?.planDistribution?.length && (
                <p className="text-sm text-slate-400 text-center py-4">No data yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent companies */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-sm">Recent Companies</span>
          <Link href="/admin/users"><Button variant="ghost" size="xs">View All</Button></Link>
        </div>
        <RecentCompaniesTable />
      </div>
    </AdminLayout>
  );
};

const RecentCompaniesTable = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', 1],
    queryFn: () => adminApi.companies({ page: 1, limit: 8 }),
  });
  const companies = data?.data?.data || [];

  if (isLoading) return <div className="p-4 space-y-2">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full">
        <thead><tr><th>Company</th><th>Industry</th><th>Plan</th><th>Status</th><th>Joined</th></tr></thead>
        <tbody>
          {companies.map((c: any) => (
            <tr key={c._id}>
              <td><div className="font-semibold text-sm">{c.name}</div><div className="text-xs text-slate-400">{c.email}</div></td>
              <td className="text-sm text-slate-500">{c.industry || '—'}</td>
              <td><Badge variant={({free:'gray',starter:'blue',growth:'purple',enterprise:'green'} as any)[c.plan] || 'gray'} className="capitalize">{c.plan}</Badge></td>
              <td><Badge variant={c.subscriptionStatus === 'active' ? 'green' : c.subscriptionStatus === 'trial' ? 'amber' : 'gray'}>{c.subscriptionStatus}</Badge></td>
              <td className="text-xs text-slate-400">{formatDate(c.createdAt)}</td>
            </tr>
          ))}
          {!companies.length && <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No companies yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   USER MANAGEMENT
═══════════════════════════════════════════════════════════ */
export const AdminUsersPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => usersApi.list({ page, limit: 20, search, role: roleFilter || undefined }),
  });
  const users = data?.data?.data || [];
  const total = data?.data?.count || 0;
  const pages = Math.ceil(total / 20);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'client_admin' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => usersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User created'); setModal(false); reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create user'),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: any) => usersApi.update(id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User status updated'); },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.info('User deleted'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Cannot delete user'),
  });

  const ROLE_COLORS: Record<string, any> = { super_admin: 'amber', client_admin: 'blue', staff: 'purple', viewer: 'gray' };

  return (
    <AdminLayout title="User Management" subtitle="Manage all platform users and permissions">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm">Users</span>
            <Badge variant="blue">{total}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 w-48"
                placeholder="Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500"
              value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All roles</option>
              {['super_admin','client_admin','staff','viewer'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button size="sm" onClick={() => setModal(true)}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add User
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead><tr><th>User</th><th>Role</th><th>Company</th><th>Plan</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_,i) => <tr key={i}><td colSpan={7}><Skeleton className="h-10 w-full" /></td></tr>)
              ) : users.map((u: any) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${u.firstName} ${u.lastName}`} size={32} />
                      <div>
                        <div className="font-semibold text-sm">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge variant={ROLE_COLORS[u.role] || 'gray'}>{u.role}</Badge></td>
                  <td className="text-sm text-slate-500">{u.companyName || '—'}</td>
                  <td><Badge variant="gray" className="capitalize">{u.plan || 'free'}</Badge></td>
                  <td>
                    <button onClick={() => toggleStatus.mutate({ id: u._id, isActive: !u.isActive })}
                      className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors cursor-pointer',
                        u.isActive ? 'bg-emerald-500' : 'bg-slate-300')}>
                      <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        u.isActive ? 'translate-x-4' : 'translate-x-0')} />
                    </button>
                  </td>
                  <td className="text-xs text-slate-400">{u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteUser.mutate(u._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && !users.length && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <span className="text-xs text-slate-400">{total} total users</span>
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>← Prev</Button>
              <span className="px-3 py-1 text-xs font-bold">{page}/{pages}</span>
              <Button size="xs" variant="ghost" onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}>Next →</Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); reset(); }} title="Add New User"
        footer={<><Button variant="ghost" onClick={() => { setModal(false); reset(); }}>Cancel</Button><Button loading={isSubmitting || createMutation.isPending} onClick={handleSubmit(d => createMutation.mutate(d))}>Create User</Button></>}>
        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name <span className="text-red-500">*</span></label>
              <input className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500', errors.firstName?'border-red-400 bg-red-50':'border-slate-200')} placeholder="John" {...register('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{String(errors.firstName.message)}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500', errors.lastName?'border-red-400 bg-red-50':'border-slate-200')} placeholder="Smith" {...register('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{String(errors.lastName.message)}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500', errors.email?'border-red-400 bg-red-50':'border-slate-200')} placeholder="user@company.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{String(errors.email.message)}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password <span className="text-red-500">*</span></label>
            <input type="password" className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500', errors.password?'border-red-400 bg-red-50':'border-slate-200')} placeholder="Min 8 chars + number + symbol" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{String(errors.password.message)}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role <span className="text-red-500">*</span></label>
            <select className="w-full h-10 px-3 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500" {...register('role')}>
              <option value="client_admin">Client Admin</option>
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
            <input type="tel" className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="+1 (555) 000-0000" {...register('phone')} />
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

/* ═══════════════════════════════════════════════════════════
   BLOG MANAGEMENT
═══════════════════════════════════════════════════════════ */
export const AdminBlogPage = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog', page, search, statusFilter],
    queryFn: () => blogApi.list({ page, limit: 15, search, status: statusFilter || undefined }),
  });
  const posts = data?.data?.data || [];
  const total = data?.data?.count || 0;
  const pages_count = data?.data?.pages || 1;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: { status: 'draft', category: '' },
  });

  const openAdd = () => { reset({ status:'draft', category:'' }); setEditPost(null); setModal(true); };
  const openEdit = (post: any) => {
    reset({ title: post.title, excerpt: post.excerpt, content: post.content, category: post.category, status: post.status });
    setEditPost(post); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditPost(null); reset(); };

  const saveMutation = useMutation({
    mutationFn: (d: BlogFormData) => editPost ? blogApi.update(editPost._id, d) : blogApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog'] }); toast.success(editPost ? 'Post updated' : 'Post created'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog'] }); toast.info('Post deleted'); },
  });

  const CATEGORIES = ['Industry Insights','Guides','Tips','Comparison','Tutorial','News','Case Study'];
  const statusColor: Record<string, any> = { published:'green', draft:'amber', archived:'gray' };

  return (
    <AdminLayout title="Blog Management" subtitle="Create and manage blog posts">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[{l:'Total Posts',v:total,i:'📝',c:'#2563eb'},{l:'Published',v:posts.filter((p:any)=>p.status==='published').length,i:'✅',c:'#059669'},{l:'Drafts',v:posts.filter((p:any)=>p.status==='draft').length,i:'📋',c:'#d97706'},{l:'Total Views',v:posts.reduce((a:number,p:any)=>a+(p.views||0),0),i:'👁',c:'#7c3aed'}].map(s=>(
          <div key={s.l} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-2">{s.i}</div>
            <div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div>
            <div className="text-xs text-slate-400">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-sm">All Posts</span>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 w-44" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {['draft','published','archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button size="sm" onClick={openAdd}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Post
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Published</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(4)].map((_,i)=><tr key={i}><td colSpan={6}><Skeleton className="h-9 w-full" /></td></tr>) : posts.map((p: any) => (
                <tr key={p._id} onClick={() => openEdit(p)}>
                  <td>
                    <div className="font-semibold text-sm max-w-xs truncate">{p.title}</div>
                    {p.excerpt && <div className="text-xs text-slate-400 truncate max-w-xs">{p.excerpt}</div>}
                  </td>
                  <td><Badge variant="blue">{p.category}</Badge></td>
                  <td><Badge variant={statusColor[p.status]}>{p.status}</Badge></td>
                  <td className="text-sm text-slate-500">{p.views || 0}</td>
                  <td className="text-xs text-slate-400">{p.publishedAt ? formatDate(p.publishedAt) : '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteMutation.mutate(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !posts.length && <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No posts found</td></tr>}
            </tbody>
          </table>
        </div>
        {pages_count > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <span className="text-xs text-slate-400">{total} posts total</span>
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>← Prev</Button>
              <span className="px-3 py-1 text-xs font-bold">{page}/{pages_count}</span>
              <Button size="xs" variant="ghost" onClick={() => setPage(p => Math.min(pages_count,p+1))} disabled={page===pages_count}>Next →</Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={closeModal} title={editPost ? 'Edit Blog Post' : 'New Blog Post'} size="lg"
        footer={<><Button variant="ghost" onClick={closeModal}>Cancel</Button><Button loading={isSubmitting || saveMutation.isPending} onClick={handleSubmit(d => saveMutation.mutate(d))}>Save Post</Button></>}>
        <form className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title <span className="text-red-500">*</span></label>
            <input className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500', errors.title?'border-red-400 bg-red-50':'border-slate-200')} placeholder="Post title…" {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
              <select className={cn('w-full h-10 px-3 rounded-lg border-[1.5px] text-sm outline-none appearance-none cursor-pointer focus:border-blue-500', errors.category?'border-red-400 bg-red-50':'border-slate-200')} {...register('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select className="w-full h-10 px-3 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Excerpt</label>
            <textarea className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none resize-none h-16 focus:border-blue-500" placeholder="Short description…" {...register('excerpt')} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Content <span className="text-red-500">*</span></label>
            <textarea className={cn('w-full px-3.5 py-2.5 rounded-lg border-[1.5px] text-sm outline-none resize-none h-48 focus:border-blue-500', errors.content?'border-red-400 bg-red-50':'border-slate-200')} placeholder="Write your blog content here…" {...register('content')} />
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SEO Title</label>
              <input className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="SEO-optimized title" {...register('seo.metaTitle')} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Meta Description</label>
              <input className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="SEO meta description" {...register('seo.metaDescription')} />
            </div>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

/* ═══════════════════════════════════════════════════════════
   CONTACT LEADS
═══════════════════════════════════════════════════════════ */
export const AdminContactsPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewLead, setViewLead] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts', page, search, statusFilter],
    queryFn: () => contactApi.list({ page, limit: 20, search, status: statusFilter || undefined }),
  });
  const leads = data?.data?.data || [];
  const total = data?.data?.count || 0;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => contactApi.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-contacts'] }); toast.success('Status updated'); },
  });

  const deleteLead = useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-contacts'] }); toast.info('Lead deleted'); setViewLead(null); },
  });

  const statusColor: Record<string,any> = { new:'blue', contacted:'amber', converted:'green', closed:'gray' };

  const exportCSV = () => {
    const rows = [['Name','Email','Phone','Company','Message','Status','Date']];
    leads.forEach((l: any) => rows.push([l.name, l.email, l.phone, l.company||'', l.message.replace(/,/g,' '), l.status, formatDate(l.createdAt)]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${formatDate(new Date())}.csv`;
    a.click();
    toast.success('Exported to CSV');
  };

  return (
    <AdminLayout title="Contact Leads" subtitle="Manage website inquiries and sales leads">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {['new','contacted','converted','closed'].map((s,i)=>{
          const colors=['#2563eb','#d97706','#059669','#64748b'];
          return (
            <div key={s} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{['📬','📞','✅','🔒'][i]}</div>
              <div className="text-2xl font-black" style={{color:colors[i]}}>{leads.filter((l:any)=>l.status===s).length}</div>
              <div className="text-xs text-slate-400 capitalize">{s}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm">Inquiries</span>
            <Badge variant="blue">{total}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 w-44" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {['new','contacted','converted','closed'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <Button size="sm" variant="ghost" onClick={exportCSV}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(4)].map((_,i)=><tr key={i}><td colSpan={7}><Skeleton className="h-9 w-full" /></td></tr>) :
              leads.map((l: any) => (
                <tr key={l._id} onClick={() => setViewLead(l)}>
                  <td className="font-semibold text-sm">{l.name}</td>
                  <td className="text-sm text-slate-500">{l.email}</td>
                  <td className="text-sm text-slate-500">{l.phone}</td>
                  <td className="text-sm text-slate-400">{l.company || '—'}</td>
                  <td>
                    <select className={cn('text-xs font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none appearance-none',
                      {new:'bg-blue-100 text-blue-700',contacted:'bg-amber-100 text-amber-700',converted:'bg-green-100 text-green-700',closed:'bg-slate-100 text-slate-600'}[l.status as string]
                    )} value={l.status} onChange={e => { e.stopPropagation(); updateStatus.mutate({ id: l._id, status: e.target.value }); }}>
                      {['new','contacted','converted','closed'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="text-xs text-slate-400">{formatDate(l.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteLead.mutate(l._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && !leads.length && <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No inquiries found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead detail modal */}
      <Modal open={!!viewLead} onClose={() => setViewLead(null)} title="Lead Details"
        footer={<><Button variant="ghost" onClick={() => setViewLead(null)}>Close</Button><Button variant="danger" onClick={() => deleteLead.mutate(viewLead._id)}>Delete Lead</Button></>}>
        {viewLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[['Name',viewLead.name],['Email',viewLead.email],['Phone',viewLead.phone],['Company',viewLead.company||'—'],['Subject',viewLead.subject||'—'],['Source',viewLead.source||'website']].map(([k,v])=>(
                <div key={k}><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{k}</p><p className="text-sm font-medium">{v}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">{viewLead.message}</div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Status:</p>
              <div className="flex gap-2">
                {['new','contacted','converted','closed'].map(s=>(
                  <button key={s} onClick={() => { updateStatus.mutate({id:viewLead._id,status:s}); setViewLead({...viewLead,status:s}); }}
                    className={cn('px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all',viewLead.status===s?'bg-blue-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRICING MANAGEMENT
═══════════════════════════════════════════════════════════ */
export const AdminPricingPage = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin-plans'], queryFn: () => pricingApi.list() });
  const plans = data?.data?.data || [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlanFormData>({ resolver: zodResolver(planSchema) });

  const openAdd  = () => { reset({ isPopular:false, isActive:true }); setEditPlan(null); setModal(true); };
  const openEdit = (p: any) => { reset(p); setEditPlan(p); setModal(true); };

  const saveMutation = useMutation({
    mutationFn: (d: PlanFormData) => editPlan ? pricingApi.update(editPlan._id, d) : pricingApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); toast.success(editPlan?'Plan updated':'Plan created'); setModal(false); reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pricingApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); toast.info('Plan deleted'); },
  });

  return (
    <AdminLayout title="Pricing Plans" subtitle="Manage subscription tiers and features">
      <div className="flex justify-end mb-5">
        <Button onClick={openAdd}><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Plan</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_,i)=><Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {plans.map((p: any) => (
            <div key={p._id} className={cn('bg-white border rounded-2xl p-6 shadow-sm relative', p.isPopular?'border-blue-400 shadow-blue-600/10':'border-slate-200')}>
              {p.isPopular && <div className="absolute top-0 right-4 -translate-y-1/2 bg-blue-600 text-white text-xs font-black px-3 py-0.5 rounded-full">Popular</div>}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-black text-xl">{p.name}</div>
                  <div className="text-sm text-slate-400 mt-0.5">{p.description}</div>
                </div>
                <Badge variant={p.isActive ? 'green' : 'gray'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-black">${p.monthlyPrice}</span><span className="text-slate-400">/mo</span>
                <div className="text-sm text-slate-400">${p.yearlyPrice}/mo billed yearly</div>
              </div>
              <div className="space-y-1.5 mb-5 max-h-32 overflow-auto">
                {p.features?.map((f: any) => (
                  <div key={f.name} className="flex items-center gap-2 text-sm">
                    <span className={f.included ? 'text-emerald-500' : 'text-slate-300'}>{f.included ? '✓' : '✕'}</span>
                    <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>{f.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => openEdit(p)}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteMutation.mutate(p._id)}>Delete</Button>
              </div>
            </div>
          ))}
          {!plans.length && <div className="col-span-3 text-center py-16 text-slate-400">No plans created yet</div>}
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); reset(); }} title={editPlan?'Edit Plan':'New Plan'}
        footer={<><Button variant="ghost" onClick={() => { setModal(false); reset(); }}>Cancel</Button><Button loading={isSubmitting||saveMutation.isPending} onClick={handleSubmit(d=>saveMutation.mutate(d))}>Save Plan</Button></>}>
        <form className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Plan Name <span className="text-red-500">*</span></label>
            <input className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500',errors.name?'border-red-400 bg-red-50':'border-slate-200')} placeholder="e.g. Growth" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <input className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="Short plan description" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monthly Price ($) <span className="text-red-500">*</span></label>
              <input type="number" className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500',errors.monthlyPrice?'border-red-400 bg-red-50':'border-slate-200')} placeholder="99" {...register('monthlyPrice')} />
              {errors.monthlyPrice && <p className="mt-1 text-xs text-red-500">{errors.monthlyPrice.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Yearly Price ($) <span className="text-red-500">*</span></label>
              <input type="number" className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none focus:border-blue-500',errors.yearlyPrice?'border-red-400 bg-red-50':'border-slate-200')} placeholder="79" {...register('yearlyPrice')} />
              {errors.yearlyPrice && <p className="mt-1 text-xs text-red-500">{errors.yearlyPrice.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Users <span className="text-red-500">*</span></label>
              <input type="number" className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="25" {...register('maxUsers')} />
              {errors.maxUsers && <p className="mt-1 text-xs text-red-500">{errors.maxUsers.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Storage Limit <span className="text-red-500">*</span></label>
              <input className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="50GB" {...register('maxStorage')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPopular" className="w-4 h-4 rounded accent-blue-600" {...register('isPopular')} />
            <label htmlFor="isPopular" className="text-sm font-medium cursor-pointer">Mark as Most Popular</label>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

/* ═══════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════════ */
export const AdminSettingsPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-settings-all'], queryFn: () => settingsApi.getAll() });
  const settings = data?.data?.data || [];
  const [vals, setVals] = useState<Record<string,any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.length) {
      const m: Record<string,any> = {};
      settings.forEach((s: any) => { m[s.key] = s.value; });
      setVals(m);
    }
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await settingsApi.update(vals);
      qc.invalidateQueries({ queryKey: ['admin-settings-all'] });
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  };

  const GROUPS = ['general','seo','social','email'];

  return (
    <AdminLayout title="Settings" subtitle="Platform configuration and branding">
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : (
        <div className="max-w-2xl space-y-5">
          {GROUPS.map(group => {
            const groupSettings = settings.filter((s: any) => s.group === group);
            if (!groupSettings.length) return null;
            return (
              <div key={group} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <span className="font-bold text-sm capitalize">{group} Settings</span>
                </div>
                <div className="p-5 space-y-4">
                  {groupSettings.map((s: any) => (
                    <div key={s.key}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{s.label || s.key}</label>
                      {s.type === 'boolean' ? (
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => setVals(p => ({...p,[s.key]:!vals[s.key]}))}
                            className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors cursor-pointer', vals[s.key]?'bg-blue-600':'bg-slate-200')}>
                            <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', vals[s.key]?'translate-x-4':'')} />
                          </button>
                          <span className="text-sm text-slate-600">{vals[s.key] ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      ) : s.type === 'color' ? (
                        <div className="flex items-center gap-2.5">
                          <input type="color" value={vals[s.key] || '#2563eb'} onChange={e => setVals(p=>({...p,[s.key]:e.target.value}))} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" />
                          <input className="flex-1 h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500" value={vals[s.key] || ''} onChange={e => setVals(p=>({...p,[s.key]:e.target.value}))} />
                        </div>
                      ) : (
                        <input type={s.type === 'url' ? 'url' : 'text'}
                          className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500"
                          value={vals[s.key] || ''} onChange={e => setVals(p=>({...p,[s.key]:e.target.value}))} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <Button onClick={save} loading={saving} size="lg">Save All Settings</Button>
        </div>
      )}
    </AdminLayout>
  );
};
