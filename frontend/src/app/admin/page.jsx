'use client';
import { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, FileText, Wallet,
  ArrowUpRight, AlertTriangle, MoreVertical, Bot, Loader2,
} from 'lucide-react';
import { admin } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      admin.lawyers(),
      admin.lawyers({ verification_status: 'pending' }),
      admin.lawyers({ verification_status: 'verified' }),
      admin.stats(),
    ])
      .then(([all, pending, verified, globalStats]) => {
        setStats({
          totalLawyers:    all.length,
          pending:         pending.length,
          verified:        verified.length,
          totalUsers:      globalStats.total_users,
          totalDocuments:  globalStats.total_documents,
          totalRevenueXaf: globalStats.total_revenue_xaf,
        });
        const sorted = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecent(sorted.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function fmtRevenue(xaf) {
    if (xaf >= 1_000_000) return `${(xaf / 1_000_000).toFixed(1)}M XAF`;
    if (xaf >= 1_000)     return `${(xaf / 1_000).toFixed(0)}K XAF`;
    return `${xaf} XAF`;
  }

  const metricCards = [
    { label: T.totalUsers,      value: loading ? '…' : String(stats?.totalUsers ?? 0),          icon: Users },
    { label: T.verifiedLawyers, value: loading ? '…' : String(stats?.verified ?? 0),             icon: ShieldCheck },
    { label: T.docsGenerated,   value: loading ? '…' : String(stats?.totalDocuments ?? 0),       icon: FileText },
    { label: T.revenue,         value: loading ? '…' : fmtRevenue(stats?.totalRevenueXaf ?? 0),  icon: Wallet },
  ];

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
                {card.change && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <ArrowUpRight size={10} /> {card.change}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Pending Verifications */}
        <div className="bg-red-50 border border-red-200/60 rounded-xl p-5 lg:col-span-1 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-red-800">
            <span className="text-xs font-bold leading-tight max-w-[70px]">{T.pendingVerification}</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-red-400" />
            ) : (
              <p className="text-3xl font-bold text-red-900">{stats?.pending ?? 0}</p>
            )}
            <a href="/admin/verify-lawyer" className="text-[10px] font-bold text-red-600 underline hover:text-red-800 mt-1 block">{T.reviewNow}</a>
          </div>
        </div>

        {/* Total Lawyers */}
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 lg:col-span-1 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-amber-800">
            <span className="text-xs font-bold leading-tight max-w-[70px]">Total Lawyers</span>
            <Bot size={16} className="text-accent" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-amber-400" />
            ) : (
              <p className="text-3xl font-bold text-amber-900">{stats?.totalLawyers ?? 0}</p>
            )}
            <a href="/admin/lawyers" className="text-[10px] font-bold text-amber-700 underline hover:text-amber-900 mt-1 block">View all</a>
          </div>
        </div>
      </div>

      {/* Recent Lawyers */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <h3 className="font-serif text-lg font-bold text-primary">{T.recentActivity}</h3>
          <a href="/admin/lawyers" className="text-xs font-bold text-primary hover:underline">{T.viewAllLogs}</a>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No lawyers registered yet.</p>
        ) : (
          <table className="w-full text-left text-xs text-gray-600 font-medium">
            <thead>
              <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-semibold">{T.timestamp}</th>
                <th className="pb-3 font-semibold">Lawyer</th>
                <th className="pb-3 font-semibold">City</th>
                <th className="pb-3 font-semibold">{T.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-800">
              {recent.map((l) => {
                const s = l.verification_status;
                const statusClass = s === 'verified'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : s === 'rejected'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100';
                const initials = (l.full_name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr key={l.id} className="align-middle">
                    <td className="py-3.5 text-gray-400 font-normal">
                      {new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[9px] select-none">{initials}</span>
                        <span className="font-bold">{l.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-gray-500">{l.city || '—'}</td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${statusClass}`}>{s}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
