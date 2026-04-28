"use client";
import { ClientLayout } from '@/components/dashboard/ClientDashboard';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '@/lib/api';
import { StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const rev = months.map((_,i)=>15000+i*3200+Math.sin(i)*4000);
  const maxR = Math.max(...rev);
  return (
    <ClientLayout title="Analytics" subtitle="Visual reports and business intelligence">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon="📊" label="YTD Revenue" value={formatCurrency(rev.reduce((a,b)=>a+b,0))} color="#2563eb" />
        <StatCard icon="📈" label="Growth Rate" value="+23.4%" changeDir="up" change="vs last year" color="#059669" />
        <StatCard icon="💰" label="Avg Monthly" value={formatCurrency(rev.reduce((a,b)=>a+b,0)/12)} color="#7c3aed" />
        <StatCard icon="⚡" label="Active Modules" value="6/6" color="#d97706" />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-5">
        <div className="font-bold text-base mb-5">Monthly Revenue — Current Year</div>
        <div className="flex items-end gap-1.5 h-48">
          {rev.map((v,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-slate-400">${Math.round(v/1000)}k</span>
              <div className="w-full rounded-t" style={{ height:`${(v/maxR)*160}px`, background: i===new Date().getMonth()?'linear-gradient(to top,#2563eb,#7c3aed)':'#dbeafe', minHeight:4 }} />
              <span className="text-[10px] text-slate-400">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
