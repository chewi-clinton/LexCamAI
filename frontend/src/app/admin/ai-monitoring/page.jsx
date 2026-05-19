'use client';
import { useState } from 'react';
import {
  Flag, History, FileCheck, AlertTriangle,
  Search, SlidersHorizontal, Eye, Ban,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const INITIAL_ROWS = [
  {
    id: '#SID-892A-4F',
    user: 'user123@example.com',
    flagReason: 'Hallucination',
    flagReasonStyle: 'bg-red-50 text-red-600 border-red-100/60',
    flaggedAt: 'Oct 24, 14:32',
    status: 'Pending',
    statusStyle: 'bg-amber-50 text-amber-700 border-amber-200/50',
    conversation: {
      question: 'What are the penalties for a minor traffic violation under the new 2024 penal code revision in Yaoundé?',
      answer: 'Under the 2024 revision, minor traffic violations result in immediate vehicle impoundment and a fine of 500,000 FCFA.',
      note: 'The AI cited a completely fabricated penalty amount. The actual fine is 25,000 FCFA.',
    },
  },
  {
    id: '#SID-910B-2C',
    user: 'anon_882',
    flagReason: 'Off-topic',
    flagReasonStyle: 'bg-orange-50 text-orange-700 border-orange-100/60',
    flaggedAt: 'Oct 24, 11:15',
    status: 'Dismissed',
    statusStyle: 'bg-gray-100 text-gray-500 border-gray-200/80',
    conversation: {
      question: 'Can you help me write a poem about justice?',
      answer: 'Of course! Here is a poem about justice...',
      note: 'User asked for creative content outside legal scope.',
    },
  },
  {
    id: '#SID-445C-1A',
    user: 'm.kamga@law.cm',
    flagReason: 'Outdated Law',
    flagReasonStyle: 'bg-amber-50 text-amber-700 border-amber-100/60',
    flaggedAt: 'Oct 23, 09:45',
    status: 'Escalated',
    statusStyle: 'bg-red-50 text-red-600 border-red-100/60',
    conversation: {
      question: 'What is the current minimum wage in Cameroon?',
      answer: 'The minimum wage in Cameroon is 28,216 FCFA per month as of 2018.',
      note: 'AI cited the 2018 minimum wage. The current rate has been updated to 41,875 FCFA.',
    },
  },
];

export default function AIMonitoringDashboard() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState('#SID-892A-4F');
  const [rowStatuses, setRowStatuses] = useState({});

  const analyticsCards = [
    { label: T.totalFlagged,  value: '1,248', icon: Flag,          ringColor: 'border-l-slate-300' },
    { label: T.pendingReview, value: '342',   icon: History,       ringColor: 'border-l-amber-500' },
    { label: T.dismissed,     value: '856',   icon: FileCheck,     ringColor: 'border-l-slate-400' },
    { label: T.escalated,     value: '50',    icon: AlertTriangle, ringColor: 'border-l-red-600', textRed: true },
  ];

  function getStatus(row) {
    return rowStatuses[row.id] ?? row.status;
  }

  function getStatusStyle(row) {
    const s = getStatus(row);
    if (s === 'Dismissed') return 'bg-gray-100 text-gray-500 border-gray-200/80';
    if (s === 'Escalated') return 'bg-red-50 text-red-600 border-red-100/60';
    if (s === 'Blocked') return 'bg-slate-800 text-white border-slate-700';
    return 'bg-amber-50 text-amber-700 border-amber-200/50';
  }

  function applyAction(id, action) {
    setRowStatuses((prev) => ({ ...prev, [id]: action }));
  }

  const reasons = [...new Set(INITIAL_ROWS.map((r) => r.flagReason))];
  const statuses = ['Pending', 'Dismissed', 'Escalated', 'Blocked'];

  const filteredRows = INITIAL_ROWS.filter((row) => {
    if (searchQuery && !row.user.toLowerCase().includes(searchQuery.toLowerCase()) && !row.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (reasonFilter && row.flagReason !== reasonFilter) return false;
    if (statusFilter && getStatus(row) !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6">

      <div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.aiMonitoringTitle}</h2>
        <p className="text-muted text-sm mt-1">{T.aiMonitoringDesc}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {analyticsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white border border-gray-200/60 shadow-sm rounded-xl p-5 border-l-4 ${card.ringColor} flex items-center justify-between`}>
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <p className={`text-3xl font-bold tracking-tight ${card.textRed ? 'text-red-800' : 'text-gray-900'}`}>{card.value}</p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T.searchPlaceholder}
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold text-gray-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="">{T.allReasons}</option>
                {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold text-gray-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="">{T.allStatuses}</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <button className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={12} /> {T.moreFilters}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-bold text-gray-500 uppercase tracking-wider">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px]">
                <th className="py-3 px-6 font-semibold w-[15%]">{T.sessionId}</th>
                <th className="py-3 px-6 font-semibold w-[22%]">{T.user}</th>
                <th className="py-3 px-6 font-semibold w-[15%]">{T.flagReason}</th>
                <th className="py-3 px-6 font-semibold w-[15%]">{T.flaggedAt}</th>
                <th className="py-3 px-6 font-semibold w-[15%]">{T.status}</th>
                <th className="py-3 px-6 font-semibold text-right w-[18%]">{T.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium normal-case">
              {filteredRows.map((row) => {
                const isExpanded = expandedRow === row.id;
                const currentStatus = getStatus(row);
                const actionDone = rowStatuses[row.id];
                return (
                  <>
                    <tr key={row.id} className="bg-white">
                      <td className="py-4 px-6 font-semibold text-gray-900">{row.id}</td>
                      <td className="py-4 px-6 font-semibold text-gray-600 select-all">{row.user}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${row.flagReasonStyle}`}>{row.flagReason}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-400">{row.flaggedAt}</td>
                      <td className="py-4 px-6">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusStyle(row)}`}>• {currentStatus}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                          className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${row.id}-inspector`} className="bg-gray-50/40">
                        <td colSpan={6} className="p-6 border-b border-gray-100">
                          <div className="bg-white border border-gray-200/70 rounded-xl p-5 shadow-sm max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-7 space-y-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{T.userAsked}</span>
                                <p className="text-xs text-gray-700 border border-gray-200/80 rounded-lg p-3 bg-[#FAFAFA] leading-relaxed">{row.conversation.question}</p>
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{T.aiResponded}</span>
                                <p className="text-xs text-red-800 border border-red-100/60 rounded-lg p-3 bg-red-50/30 leading-relaxed italic">{row.conversation.answer}</p>
                              </div>
                            </div>
                            <div className="md:col-span-5 flex flex-col justify-between h-full space-y-6">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{T.flagNote}</span>
                                <p className="text-xs text-gray-700 border border-red-200/60 rounded-lg p-3 bg-red-50/20 leading-relaxed font-semibold">{row.conversation.note}</p>
                              </div>
                              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                                {actionDone ? (
                                  <span className="text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl">
                                    {actionDone}
                                  </span>
                                ) : (
                                  <>
                                    <button onClick={() => applyAction(row.id, 'Dismissed')} className="border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                      {T.dismissBtn}
                                    </button>
                                    <button onClick={() => applyAction(row.id, 'Escalated')} className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                                      {T.escalateBtn}
                                    </button>
                                    <button onClick={() => applyAction(row.id, 'Blocked')} className="bg-primary-dark hover:bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5">
                                      <Ban size={14} /> {T.blockResponse}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-[#FAFAFA] border-t border-gray-100 px-6 py-4 flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>{T.showing} {filteredRows.length} of 1,248 entries</span>
          <div className="flex items-center gap-1.5 text-gray-600 select-none">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-bold text-gray-500">{T.prev}</button>
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700">{T.next}</button>
          </div>
        </div>

      </div>
    </div>
  );
}
