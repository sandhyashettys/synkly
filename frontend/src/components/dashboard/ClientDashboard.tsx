"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { clientApi } from '@/lib/api';
import { Avatar, Badge, Spinner, toast, ProgressBar } from '@/components/ui';
import { cn, formatRelativeTime } from '@/lib/utils';

// ── Nav items — universal industry-agnostic modules
const NAV_ITEMS = [
  { id: 'overview',  href: '/client/dashboard',  icon: '📊', label: 'Overview' },
  { id: 'finance',   href: '/client/finance',     icon: '💰', label: 'Finance' },
  { id: 'people',    href: '/client/people',      icon: '👥', label: 'People & HR' },
  { id: 'projects',  href: '/client/projects',    icon: '📁', label: 'Projects & Tasks' },
  { id: 'contacts',  href: '/client/contacts',    icon: '🤝', label: 'Contacts & CRM' },
  { id: 'documents', href: '/client/documents',   icon: '📄', label: 'Documents' },
  { id: 'analytics', href: '/client/analytics',   icon: '📈', label: 'Analytics' },
  { id: 'settings',  href: '/client/settings',    icon: '⚙️',  label: 'Settings' },
];

// ─── Sidebar
const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully');
    router.push('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 bottom-0 w-64 bg-[#0f172a] flex flex-col z-50 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span className="text-lg font-black text-white tracking-tight">Synkly<span className="text-blue-400"> ERP</span></span>
          </div>
          <div className="px-2 py-1 rounded-md bg-blue-600/15 border border-blue-600/20 text-center">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Client Admin Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/20">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <Link key={item.id} href={item.href} onClick={onClose}
              className={cn('sidebar-item',
                pathname.startsWith(item.href) && item.href !== '/client/dashboard'
                  ? 'active'
                  : pathname === item.href ? 'active' : ''
              )}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-3 min-w-0">
            <Avatar name={user?.fullName || user?.firstName || ''} size={34} className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{user?.fullName || user?.firstName}</div>
              <div className="text-xs text-white/40 truncate">{user?.companyName}</div>
            </div>
          </div>
          <button onClick={handleLogout}
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

// ─── Top Bar
const TopBar = ({ onMenuClick, title, subtitle }: { onMenuClick: () => void; title: string; subtitle?: string }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const NOTIFS = [
    { t: 'Trial expires in 14 days', sub: 'Upgrade to keep access', type: 'warning' },
    { t: 'New contact added', sub: 'PulseMedia inquiry received', type: 'info' },
    { t: 'Task deadline approaching', sub: 'Q2 Report due Apr 30', type: 'alert' },
    { t: 'Document approved', sub: 'Q1 Financial Report', type: 'success' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-7 sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <div className="text-base font-bold text-slate-900">{title}</div>
          {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-bold text-sm">Notifications</span>
                <button onClick={() => setNotifOpen(false)} className="text-xs text-blue-600 font-semibold">Clear all</button>
              </div>
              {NOTIFS.map((n, i) => (
                <div key={i} onClick={() => setNotifOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer last:border-0">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    {'warning':'bg-amber-400','info':'bg-blue-500','alert':'bg-orange-500','success':'bg-emerald-500'}[n.type]
                  )} />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{n.t}</div>
                    <div className="text-xs text-slate-400">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button onClick={() => router.push('/client/settings')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* User */}
        <button onClick={() => router.push('/client/settings')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <Avatar name={user?.fullName || ''} size={28} />
          <div className="hidden sm:block text-left">
            <div className="text-sm font-bold text-slate-900 max-w-[100px] truncate">{user?.firstName}</div>
            <div className="text-xs text-slate-400">Admin</div>
          </div>
        </button>
      </div>
    </header>
  );
};

// ─── Client Dashboard Layout
export const ClientLayout = ({ children, title, subtitle }: {
  children: React.ReactNode; title: string; subtitle?: string;
}) => {
  const [sideOpen, setSideOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" className="text-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <TopBar onMenuClick={() => setSideOpen(true)} title={title} subtitle={subtitle} />
        <main className="flex-1 p-5 lg:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// ─── Overview / Dashboard Page
export const ClientDashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: () => clientApi.dashboard(),
  });
  const dash = data?.data?.data;

  const MODULE_STATS = [
    { n:'Finance',  v: dash?.moduleCounts?.finance   || 0, icon:'💰', color:'#2563eb' },
    { n:'People',   v: dash?.moduleCounts?.hr        || 0, icon:'👥', color:'#7c3aed' },
    { n:'Projects', v: dash?.moduleCounts?.projects  || 0, icon:'📁', color:'#059669' },
    { n:'Contacts', v: dash?.moduleCounts?.crm       || 0, icon:'🤝', color:'#d97706' },
    { n:'Inventory',v: dash?.moduleCounts?.inventory || 0, icon:'📦', color:'#0891b2' },
    { n:'Support',  v: dash?.moduleCounts?.support   || 0, icon:'🎧', color:'#ec4899' },
  ];

  const MODULE_HEALTH = [
    { n:'Finance & Accounting', v:98, c:'#2563eb' },
    { n:'People & HR',          v:96, c:'#7c3aed' },
    { n:'Contacts & CRM',       v:99, c:'#059669' },
    { n:'Projects & Tasks',     v:94, c:'#d97706' },
    { n:'Analytics Engine',     v:97, c:'#0891b2' },
    { n:'Documents',            v:91, c:'#ec4899' },
  ];

  const ACTIVITY = [
    { msg: 'Transaction recorded: Client Payment — $12,400', time: '2 min ago', type: 'g' },
    { msg: 'New member James Wilson added to Engineering',    time: '1 hour ago',type: 'b' },
    { msg: 'Task updated: Redesign onboarding → In Progress', time: '3 hours ago',type:'b' },
    { msg: 'Contact added: Anna White from PulseMedia',       time: '5 hours ago',type:'g' },
    { msg: 'Document approved: Q1 2025 Financial Report',     time: 'Yesterday', type: 'g' },
    { msg: 'Task completed: CRM integration setup',           time: 'Yesterday', type: 'g' },
  ];

  const typeColor: Record<string,string> = { g:'#059669', b:'#2563eb', a:'#d97706', r:'#dc2626' };

  return (
    <ClientLayout title="Overview" subtitle={`${user?.companyName || 'My Company'} · ${dash?.company?.industry || 'General'}`}>
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white mb-1">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-white/50 text-sm">
            {user?.companyName} · {user?.role === 'client_admin' ? 'Admin' : 'Staff'} · {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
          </p>
        </div>
        <div className="flex gap-2.5 flex-shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-300 text-sm font-semibold">
            Trial: {dash?.trialDaysLeft ?? 14} days left
          </div>
          <Link href="/client/settings">
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {MODULE_STATS.map(s => (
          <div key={s.n} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{isLoading ? '—' : s.v}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.n} records</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Revenue mini chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-base">Revenue Overview</div>
            <Badge variant="green" className="text-xs">● Live</Badge>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {[38,55,42,70,52,84,61,90,68,88,74,96].map((h,i) => {
              const months=['J','F','M','A','M','J','J','A','S','O','N','D'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t transition-all" style={{
                    height: `${h * 0.96}px`,
                    background: i === new Date().getMonth()
                      ? 'linear-gradient(to top,#2563eb,#7c3aed)'
                      : '#dbeafe'
                  }} />
                  <span className="text-[9px] text-slate-400">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="font-bold text-base mb-4">Recent Activity</div>
          <div className="space-y-3">
            {ACTIVITY.slice(0,5).map((a, i) => (
              <div key={i} className="flex gap-2.5 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: typeColor[a.type] }} />
                <div>
                  <div className="text-sm text-slate-700 leading-snug">{a.msg}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module health + Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="font-bold text-base mb-4">System Modules</div>
          <div className="space-y-3.5">
            {MODULE_HEALTH.map(m => (
              <div key={m.n}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{m.n}</span>
                  <span className="text-xs font-bold" style={{ color: m.c }}>{m.v}%</span>
                </div>
                <ProgressBar value={m.v} color={m.c} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="font-bold text-base mb-4">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l:'+ New Transaction', href:'/client/finance',   c:'#2563eb' },
              { l:'+ Add Member',      href:'/client/people',    c:'#7c3aed' },
              { l:'+ Create Task',     href:'/client/projects',  c:'#059669' },
              { l:'+ New Contact',     href:'/client/contacts',  c:'#d97706' },
              { l:'📊 View Reports',   href:'/client/analytics', c:'#0891b2' },
              { l:'⚙️ Settings',       href:'/client/settings',  c:'#6b7280' },
            ].map(a => (
              <Link key={a.l} href={a.href}>
                <button className="w-full py-2.5 px-3 rounded-xl text-left text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ background:`${a.c}10`, color:a.c, border:`1.5px solid ${a.c}22` }}>
                  {a.l}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

// ─── Convenience re-export
export default ClientDashboardPage;
