'use client';
import { useState, useEffect } from 'react';
import {
  Calendar, SlidersHorizontal, FolderOpen, MoreVertical, Check, X, Loader2,
} from 'lucide-react';
import { admin } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function LawyerVerificationQueue() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [lawyers, setLawyers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter]   = useState('pending');
  const [cityFilter, setCityFilter]       = useState('');

  useEffect(() => { load(); }, [statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const params = { verification_status: statusFilter };
      const data = await admin.lawyers(params);
      setLawyers(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  async function decide(lawyerId, status) {
    setActionLoading(lawyerId + status);
    try {
      await admin.verifyLawyer(lawyerId, status);
      setLawyers((prev) => prev.filter((l) => l.id !== lawyerId));
    } catch { /* silent */ } finally {
      setActionLoading(null);
    }
  }

  const filtered = cityFilter ? lawyers.filter((l) => l.city === cityFilter) : lawyers;
  const pendingCount = lawyers.filter((l) => l.verification_status === 'pending').length;

  function initials(name) {
    return (name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  return (
    <div className="p-8 space-y-6">

      <div className="flex items-center gap-3">
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.verifyQueueTitle}</h2>
        {pendingCount > 0 && (
          <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100/60 uppercase flex items-center gap-1">
            <span className="text-sm leading-none">•</span> {pendingCount} {T.pendingLabel}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 flex-1">
          <div className="w-48">
            <label className="block mb-1.5 font-bold">{T.status}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="pending">{T.pendingApproval}</option>
                <option value="verified">{T.approve}</option>
                <option value="rejected">{T.reject}</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <div className="w-48">
            <label className="block mb-1.5 font-bold">{T.cityLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="">{T.allCities}</option>
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Bamenda">Bamenda</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">No lawyers found for this filter.</div>
      ) : (
        <div className="space-y-4 max-w-5xl">
          {filtered.map((lawyer) => (
            <div key={lawyer.id} className="bg-white border border-gray-200/60 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100/60">

              <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm flex-shrink-0 select-none">
                    {initials(lawyer.full_name)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-primary tracking-tight">{lawyer.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-400">
                      <span className="select-all">{lawyer.email}</span>
                      {lawyer.city && <><span>•</span><span>{lawyer.city}</span></>}
                      {lawyer.phone && <><span>•</span><span>{lawyer.phone}</span></>}
                    </div>
                    {lawyer.bio && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-md">{lawyer.bio}</p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right space-y-1.5 self-start">
                  <p className="text-[11px] font-bold text-gray-400">
                    {new Date(lawyer.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap sm:justify-end gap-1">
                    {lawyer.specializations?.map((s) => (
                      <span key={s.id} className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-200/30">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-white flex items-center justify-end gap-2">
                {lawyer.verification_status === 'pending' ? (
                  <>
                    <button
                      onClick={() => decide(lawyer.id, 'rejected')}
                      disabled={!!actionLoading}
                      className="border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors bg-white disabled:opacity-60 flex items-center gap-1"
                    >
                      {actionLoading === lawyer.id + 'rejected' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                      {T.reject}
                    </button>
                    <button
                      onClick={() => decide(lawyer.id, 'verified')}
                      disabled={!!actionLoading}
                      className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-1"
                    >
                      {actionLoading === lawyer.id + 'verified' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      {T.approve}
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                    lawyer.verification_status === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {lawyer.verification_status}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
