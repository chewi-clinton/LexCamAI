'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Flag, History, FileCheck, AlertTriangle,
  Search, Eye, Ban, RefreshCw, Loader2,
} from 'lucide-react';
import { feedback } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const FLAG_REASON_STYLES = {
  Hallucination:  'bg-red-50 text-red-600 border-red-100/60',
  'Outdated Law': 'bg-amber-50 text-amber-700 border-amber-100/60',
  'Off-topic':    'bg-orange-50 text-orange-700 border-orange-100/60',
  Incorrect:      'bg-rose-50 text-rose-700 border-rose-100/60',
};

const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200/50',
  dismissed: 'bg-gray-100 text-gray-500 border-gray-200/80',
  escalated: 'bg-red-50 text-red-600 border-red-100/60',
  blocked:   'bg-slate-800 text-white border-slate-700',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AIMonitoringDashboard() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total_flagged: 0, pending: 0, dismissed: 0, escalated: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const hasAutoExpanded = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [items, s] = await Promise.all([feedback.flagged(), feedback.stats()]);
      setRows(items);
      setStats(s);
      if (items.length > 0 && !hasAutoExpanded.current) {
        setExpandedRow(items[0].id);
        hasAutoExpanded.current = true;
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function applyAction(id, action) {
    setActionLoading((prev) => ({ ...prev, [id]: action }));
    try {
      const updated = await feedback.review(id, action);
      setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      // update stats
      setStats((prev) => {
        const next = { ...prev };
        next.pending = Math.max(0, next.pending - 1);
        if (action === 'dismiss') next.dismissed++;
        else if (action === 'escalate') next.escalated++;
        return next;
      });
    } catch { /* silent */ } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  }

  const reasons = [...new Set(rows.map((r) => r.flag_reason).filter(Boolean))];

  const filteredRows = rows.filter((row) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!row.user_id?.toLowerCase().includes(q) && !row.session_id?.toLowerCase().includes(q)) return false;
    }
    if (reasonFilter && row.flag_reason !== reasonFilter) return false;
    if (statusFilter && row.review_status !== statusFilter) return false;
    return true;
  });

  const analyticsCards = [
    { label: T.totalFlagged,  value: stats.total_flagged, icon: Flag,          ringColor: 'border-l-slate-300' },
    { label: T.pendingReview, value: stats.pending,        icon: History,       ringColor: 'border-l-amber-500' },
    { label: T.dismissed,     value: stats.dismissed,      icon: FileCheck,     ringColor: 'border-l-slate-400' },
    { label: T.escalated,     value: stats.escalated,      icon: AlertTriangle, ringColor: 'border-l-red-600', textRed: true },
  ];

  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.aiMonitoringTitle}</h2>
          <p className="text-muted text-sm mt-1">{T.aiMonitoringDesc}</p>
        </div>
        <button onClick={load} className="text-xs font-bold text-accent-dark hover:underline flex items-center gap-1">
          <RefreshCw size={12} /> Refresh
        </button>
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
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-white">
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
              {['pending', 'dismissed', 'escalated', 'blocked'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            {rows.length === 0 ? 'No flagged AI responses yet.' : 'No results match your filters.'}
          </div>
        ) : (
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
                  const statusStyle = STATUS_STYLES[row.review_status] ?? STATUS_STYLES.pending;
                  const reasonStyle = FLAG_REASON_STYLES[row.flag_reason] ?? 'bg-gray-100 text-gray-600 border-gray-200';
                  const isActioning = actionLoading[row.id];
                  const actionDone = row.review_status !== 'pending';

                  return (
                    <React.Fragment key={row.id}>
                      <tr className="bg-white">
                        <td className="py-4 px-6 font-semibold text-gray-900 font-mono">
                          {row.session_id ? `#${row.session_id.toUpperCase().slice(0, 10)}` : `#FB-${row.id}`}
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-600 select-all">{row.user_id || 'anonymous'}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${reasonStyle}`}>
                            {row.flag_reason || 'Flagged'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400">{fmtDate(row.created_at)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${statusStyle}`}>
                            • {row.review_status.charAt(0).toUpperCase() + row.review_status.slice(1)}
                          </span>
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
                        <tr className="bg-gray-50/40">
                          <td colSpan={6} className="p-6 border-b border-gray-100">
                            <div className="bg-white border border-gray-200/70 rounded-xl p-5 shadow-sm max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                              <div className="md:col-span-7 space-y-4">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{T.userAsked}</span>
                                  <p className="text-xs text-gray-700 border border-gray-200/80 rounded-lg p-3 bg-[#FAFAFA] leading-relaxed">
                                    {row.text}
                                  </p>
                                </div>
                                <div className="flex gap-3 text-xs text-gray-500">
                                  <span>Session: <span className="font-mono text-gray-700">{row.session_id || '—'}</span></span>
                                  {row.message_index != null && <span>Msg #{row.message_index}</span>}
                                  <span>Flags: <span className="font-bold text-gray-700">{row.flag_count}</span></span>
                                </div>
                              </div>
                              <div className="md:col-span-5 flex flex-col justify-between h-full space-y-6">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{T.flagNote}</span>
                                  <p className="text-xs text-gray-700 border border-red-200/60 rounded-lg p-3 bg-red-50/20 leading-relaxed font-semibold">
                                    {row.flag_reason ? `Reported as: ${row.flag_reason}` : 'No specific reason provided.'}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                                  {isActioning ? (
                                    <span className="flex items-center gap-2 text-xs text-gray-400">
                                      <Loader2 size={12} className="animate-spin" /> Saving…
                                    </span>
                                  ) : actionDone ? (
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl">
                                      {row.review_status.charAt(0).toUpperCase() + row.review_status.slice(1)}
                                    </span>
                                  ) : (
                                    <>
                                      <button onClick={() => applyAction(row.id, 'dismiss')}
                                        className="border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                        {T.dismissBtn}
                                      </button>
                                      <button onClick={() => applyAction(row.id, 'escalate')}
                                        className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                                        {T.escalateBtn}
                                      </button>
                                      <button onClick={() => applyAction(row.id, 'block')}
                                        className="bg-primary-dark hover:bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5">
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
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-[#FAFAFA] border-t border-gray-100 px-6 py-4 flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>{T.showing} {filteredRows.length} of {stats.total_flagged} entries</span>
        </div>

      </div>
    </div>
  );
}
