'use client';
import {
  Flag, History, FileCheck, AlertTriangle,
  Search, ChevronDown, SlidersHorizontal, Eye, Ban,
} from 'lucide-react';

const analyticsCards = [
  { label: 'Total Flagged',  value: '1,248', icon: Flag,          ringColor: 'border-l-slate-300' },
  { label: 'Pending Review', value: '342',   icon: History,        ringColor: 'border-l-amber-500' },
  { label: 'Dismissed',      value: '856',   icon: FileCheck,      ringColor: 'border-l-slate-400' },
  { label: 'Escalated',      value: '50',    icon: AlertTriangle,  ringColor: 'border-l-red-600', textRed: true },
];

export default function AIMonitoringDashboard() {
  return (
    <div className="p-8 space-y-6">

      <div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">AI Monitoring</h2>
        <p className="text-muted text-sm mt-1">Review and manage flagged AI interactions.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {analyticsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white border border-gray-200/60 shadow-sm rounded-xl p-5 border-l-4 ${card.ringColor} flex items-center justify-between`}>
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <p className={`text-3xl font-bold tracking-tight ${card.textRed ? 'text-red-800' : 'text-gray-900'}`}>
                  {card.value}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 shadow-inner flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-56">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Session ID or User..."
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-gray-700 bg-white cursor-pointer select-none">
              <span>All Reasons</span> <ChevronDown size={12} className="text-gray-400" />
            </div>
            <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-gray-700 bg-white cursor-pointer select-none">
              <span>All Statuses</span> <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
          <button className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={12} /> More Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-bold text-gray-500 uppercase tracking-wider">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px]">
                <th className="py-3 px-6 font-semibold w-[15%]">Session ID</th>
                <th className="py-3 px-6 font-semibold w-[22%]">User</th>
                <th className="py-3 px-6 font-semibold w-[15%]">Flag Reason</th>
                <th className="py-3 px-6 font-semibold w-[15%]">Flagged At</th>
                <th className="py-3 px-6 font-semibold w-[15%]">Status</th>
                <th className="py-3 px-6 font-semibold text-right w-[18%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium normal-case">

              {/* Expanded row */}
              <tr className="bg-white">
                <td className="py-4 px-6 font-semibold text-gray-900">#SID-892A-4F</td>
                <td className="py-4 px-6 font-semibold text-gray-600 select-all">user123@example.com</td>
                <td className="py-4 px-6">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100/60 uppercase">Hallucination</span>
                </td>
                <td className="py-4 px-6 text-gray-400">Oct 24, 14:32</td>
                <td className="py-4 px-6">
                  <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-amber-200/50">• Pending</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-1.5 hover:bg-gray-100 text-primary rounded-lg transition-colors"><Eye size={16} /></button>
                </td>
              </tr>

              {/* Inspector panel */}
              <tr className="bg-gray-50/40">
                <td colSpan={6} className="p-6 border-b border-gray-100">
                  <div className="bg-white border border-gray-200/70 rounded-xl p-5 shadow-sm max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                    <div className="md:col-span-7 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">User Asked</span>
                        <p className="text-xs text-gray-700 border border-gray-200/80 rounded-lg p-3 bg-[#FAFAFA] leading-relaxed">
                          What are the penalties for a minor traffic violation under the new 2024 penal code revision in Yaoundé?
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">AI Responded</span>
                        <p className="text-xs text-red-800 border border-red-100/60 rounded-lg p-3 bg-red-50/30 leading-relaxed italic">
                          Under the 2024 revision, minor traffic violations result in immediate vehicle impoundment and a fine of 500,000 FCFA.
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Flag Note</span>
                        <p className="text-xs text-gray-700 border border-red-200/60 rounded-lg p-3 bg-red-50/20 leading-relaxed font-semibold">
                          The AI cited a completely fabricated penalty amount. The actual fine is 25,000 FCFA.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                        <button className="border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                          Dismiss
                        </button>
                        <button className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                          Escalate
                        </button>
                        <button className="bg-primary-dark hover:bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5">
                          <Ban size={14} /> Block Response
                        </button>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>

              <tr className="bg-white">
                <td className="py-4 px-6 font-semibold text-gray-500">#SID-910B-2C</td>
                <td className="py-4 px-6 text-gray-500 font-semibold select-all">anon_882</td>
                <td className="py-4 px-6">
                  <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100/60 uppercase">Off-topic</span>
                </td>
                <td className="py-4 px-6 text-gray-400">Oct 24, 11:15</td>
                <td className="py-4 px-6">
                  <span className="bg-gray-100 text-gray-500 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-gray-200/80">• Dismissed</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><Eye size={16} /></button>
                </td>
              </tr>

              <tr className="bg-white">
                <td className="py-4 px-6 font-semibold text-gray-500">#SID-445C-1A</td>
                <td className="py-4 px-6 text-gray-500 font-semibold select-all">m.kamga@law.cm</td>
                <td className="py-4 px-6">
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100/60 uppercase">Outdated Law</span>
                </td>
                <td className="py-4 px-6 text-gray-400">Oct 23, 09:45</td>
                <td className="py-4 px-6">
                  <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-red-100/60">• Escalated</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><Eye size={16} /></button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <div className="bg-[#FAFAFA] border-t border-gray-100 px-6 py-4 flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>Showing 1 to 3 of 1,248 entries</span>
          <div className="flex items-center gap-1.5 text-gray-600 select-none">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-bold text-gray-500">Prev</button>
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
