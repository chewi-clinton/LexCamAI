'use client';
import { useState, useEffect } from 'react';
import {
  Calendar, Filter, Eye, UserX, CheckCircle2, Loader2,
} from 'lucide-react';
import { admin } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const AVATAR_COLORS = [
  'bg-emerald-900/10 text-emerald-800',
  'bg-blue-900/10 text-blue-800',
  'bg-purple-900/10 text-purple-800',
  'bg-amber-900/10 text-amber-800',
  'bg-pink-900/10 text-pink-800',
  'bg-slate-200 text-slate-700',
];

function initials(name, email) {
  const src = name || email || '?';
  return src.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PAGE_SIZE = 9;

export default function UserManagementAdmin() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [accessOverrides, setAccessOverrides] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await admin.userList();
      setUsers(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    if (cityFilter && u.city !== cityFilter) return false;
    if (langFilter && u.preferred_language !== langFilter) return false;
    if (statusFilter) {
      const active = statusFilter === 'ACTIVE';
      if (u.is_active !== active) return false;
    }
    if (emailVerifiedFilter === 'yes' && !u.is_email_verified) return false;
    if (emailVerifiedFilter === 'no' && u.is_email_verified) return false;
    if (dateFilter) {
      const joined = u.created_at ? u.created_at.slice(0, 10) : '';
      if (joined < dateFilter) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getAccess(user) {
    return accessOverrides[user.id] === undefined ? user.is_active : accessOverrides[user.id];
  }

  function toggleAccess(id) {
    setAccessOverrides((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? !users.find((u) => u.id === id).is_active : !prev[id],
    }));
  }

  const cities = [...new Set(users.map((u) => u.city).filter(Boolean))].sort();

  function clearFilters() {
    setCityFilter(''); setLangFilter(''); setStatusFilter('');
    setEmailVerifiedFilter(''); setDateFilter(''); setPage(1);
  }

  return (
    <div className="p-8 space-y-6">

      <div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.userManagement}</h2>
        <p className="text-muted text-sm mt-1">{T.userManagementDesc}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-gray-500">

          <div>
            <label className="block mb-1.5 font-bold">{T.cityLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={cityFilter}
                onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="">{T.allCities}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.languageLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={langFilter}
                onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="">{T.allLanguages}</option>
                <option value="FR">FR</option>
                <option value="EN">EN</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.statusLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="">{T.anyStatus}</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.emailVerified}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={emailVerifiedFilter}
                onChange={(e) => { setEmailVerifiedFilter(e.target.value); setPage(1); }}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="">{T.anyOption}</option>
                <option value="yes">{T.verified}</option>
                <option value="no">{T.unverified}</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pt-2">
          <div className="flex-1 text-xs font-semibold text-gray-500">
            <label className="block mb-1.5 font-bold">{T.dateRange}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg flex items-center max-w-xl">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              />
              <Calendar size={14} className="text-gray-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Filter size={14} className="text-gray-400" /> {T.clearAll}
          </button>
        </div>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : paginated.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No users match the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((user, idx) => {
            const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const inits = initials(user.full_name, user.email);
            const active = getAccess(user);
            const status = user.is_active ? 'ACTIVE' : 'INACTIVE';
            const statusColor = user.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              : 'bg-gray-100 text-gray-500 border-gray-200';

            return (
              <div key={user.id} className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full ${avatarBg} font-bold text-xs flex items-center justify-center flex-shrink-0 select-none`}>
                        {inits}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-gray-900 leading-snug flex items-center gap-1">
                          {user.full_name || user.email}
                          {user.is_email_verified && (
                            <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-600" />
                          )}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${statusColor}`}>
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-t border-gray-50 text-xs">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold">{T.cityLabel}</span>
                      <span className="text-gray-700 font-medium mt-0.5 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        {user.city || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold">{T.languageLabel}</span>
                      <span className="text-gray-700 font-medium mt-0.5 block uppercase">{user.preferred_language}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold">{T.joinedDate}</span>
                      <span className="text-gray-500 font-normal mt-0.5 block">{fmtDate(user.created_at)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold">Role</span>
                      <span className="text-amber-700 font-bold mt-0.5 block capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleAccess(user.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                    <span className="text-xs font-bold text-gray-500">{T.access}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <button className="p-1.5 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors"><Eye size={16} /></button>
                    <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><UserX size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400 pt-4 border-t border-gray-200/60">
          <span>{T.showing} {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-1 select-none font-bold text-gray-600">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs font-bold"
            >
              {T.prev}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs ${p === page ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs font-bold"
            >
              {T.next}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
