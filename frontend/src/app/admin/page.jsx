'use client';
import {
  Users, ShieldCheck, FileText, Wallet,
  ArrowUpRight, AlertTriangle, MoreVertical, Bot,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const metricCards = [
    { label: T.totalUsers,       value: '12,450', change: '+12% this month',   icon: Users },
    { label: T.verifiedLawyers,  value: '342',    change: '+5 new',            icon: ShieldCheck },
    { label: T.docsGenerated,    value: '8,921',  change: 'This Month',        icon: FileText },
    { label: T.revenue,          value: '4.2M',   change: '+8% vs last month', icon: Wallet },
  ];

  const barChartHeights = [67, 120, 95, 172, 133, 200, 158];

  return (
    <div className="p-8 space-y-6">

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-gray-200/60 shadow-sm rounded-xl p-5 lg:col-span-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 leading-tight max-w-[65px]">{card.label}</span>
                <Icon size={16} className="text-gray-400" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <ArrowUpRight size={10} /> {card.change}
                </p>
              </div>
            </div>
          );
        })}

        {/* Pending Verifications Alert */}
        <div className="bg-red-50 border border-red-200/60 rounded-xl p-5 lg:col-span-1 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-red-800">
            <span className="text-xs font-bold leading-tight max-w-[70px]">{T.pendingVerification}</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-red-900">3</p>
            <a href="/admin/verify-lawyer" className="text-[10px] font-bold text-red-600 underline hover:text-red-800 mt-1 block">{T.reviewNow}</a>
          </div>
        </div>

        {/* Flagged AI Alert */}
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 lg:col-span-1 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-amber-800">
            <span className="text-xs font-bold leading-tight max-w-[70px]">{T.flaggedAI}</span>
            <Bot size={16} className="text-accent" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-amber-900">12</p>
            <a href="/admin/ai-monitoring" className="text-[10px] font-bold text-amber-700 underline hover:text-amber-900 mt-1 block">{T.checkLogs}</a>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-lg font-bold text-primary">{T.docsChartTitle}</h3>
            <button className="text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical size={16} /></button>
          </div>

          <div className="relative h-64 flex items-end justify-between px-4 pb-6 border-b border-gray-100 overflow-hidden">
            <div className="absolute left-0 right-0 top-0 border-t border-gray-100 text-[10px] text-gray-400 pt-1">400</div>
            <div className="absolute left-0 right-0 top-1/4 border-t border-gray-100 text-[10px] text-gray-400 pt-1">300</div>
            <div className="absolute left-0 right-0 top-1/2 border-t border-gray-100 text-[10px] text-gray-400 pt-1">200</div>
            <div className="absolute left-0 right-0 top-3/4 border-t border-gray-100 text-[10px] text-gray-400 pt-1">100</div>
            <div className="absolute left-0 right-0 bottom-6 border-t border-gray-100 text-[10px] text-gray-400 pt-1">0</div>

            {barChartHeights.map((height, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group relative z-10">
                {i === 3 && (
                  <span className="absolute -top-7 bg-white border border-gray-100 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm text-gray-800">Peak</span>
                )}
                <div
                  style={{ height: `${height}px` }}
                  className={`w-8 rounded-t-md transition-all ${i === 3 ? 'bg-primary-light' : 'bg-primary/30 group-hover:bg-primary/50'}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-bold text-gray-400 px-10 pt-3 select-none">
            <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
          </div>
        </div>

        {/* Right Sidebar Charts */}
        <div className="space-y-6">

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">{T.paymentMethods}</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="w-24 h-24 rounded-full border-[10px] border-accent border-l-primary rotate-45 flex items-center justify-center flex-shrink-0 relative select-none">
                <span className="text-xs font-bold text-gray-900 -rotate-45">100%</span>
              </div>
              <div className="space-y-2 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent block" />
                  <span>Orange <span className="text-gray-400 font-normal">(65%)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary block" />
                  <span>MTN <span className="text-gray-400 font-normal">(35%)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* New Registrations Sparkline */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">{T.newRegistrations}</h3>
            <div className="h-16 flex items-end justify-between gap-1.5 px-2 select-none">
              <div className="bg-gray-100 w-full h-[20%] rounded-sm" />
              <div className="bg-gray-100 w-full h-[40%] rounded-sm" />
              <div className="bg-primary/30 w-full h-[65%] rounded-sm" />
              <div className="bg-primary w-full h-[90%] rounded-sm" />
              <div className="bg-gray-100 w-full h-[45%] rounded-sm" />
            </div>
          </div>

        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <h3 className="font-serif text-lg font-bold text-primary">{T.recentActivity}</h3>
          <a href="/admin/audit-log" className="text-xs font-bold text-primary hover:underline">{T.viewAllLogs}</a>
        </div>

        <table className="w-full text-left text-xs text-gray-600 font-medium">
          <thead>
            <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 font-semibold">{T.timestamp}</th>
              <th className="pb-3 font-semibold">{T.admin}</th>
              <th className="pb-3 font-semibold">{T.action}</th>
              <th className="pb-3 font-semibold">{T.target}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-800">
            <tr className="align-middle">
              <td className="py-3.5 text-gray-400 font-normal">Oct 24, 14:32</td>
              <td className="py-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-emerald-900/10 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[9px] select-none">A</span>
                  <span className="font-bold">Alice M.</span>
                </div>
              </td>
              <td className="py-3.5">
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-100">{T.approved}</span>
              </td>
              <td className="py-3.5 text-gray-500 font-semibold">Lawyer Profile: Jean D.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
