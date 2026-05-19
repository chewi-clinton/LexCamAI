'use client';
import { useState } from 'react';
import {
  Calendar, Filter, Eye, UserX, CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function UserManagementAdmin() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [cityFilter, setCityFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [accessStates, setAccessStates] = useState({});

  const usersData = [
    {
      name: 'Amadou Ly',
      email: 'amadou.ly@example.cm',
      city: 'Douala',
      language: 'FR',
      joinedDate: '12 Oct 2023',
      documents: '24 Generated',
      status: 'ACTIVE',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      initials: 'AL',
      avatarBg: 'bg-emerald-900/10 text-emerald-800',
      access: true,
      verified: false,
    },
    {
      name: 'Chantal Etoa',
      email: 'c.etoa@gmail.com',
      city: 'Yaoundé',
      language: 'EN',
      joinedDate: '05 Jan 2024',
      documents: '3 Generated',
      status: 'INACTIVE',
      statusColor: 'bg-gray-100 text-gray-500 border-gray-200',
      initials: 'CE',
      avatarBg: 'bg-slate-200 text-slate-700',
      access: false,
      verified: false,
    },
    {
      name: 'Jean-Pierre Ngu',
      email: 'jp.ngu@business.cm',
      city: 'Garoua',
      language: 'FR',
      joinedDate: '22 Nov 2023',
      documents: '58 Generated',
      status: 'ACTIVE',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      initials: 'JN',
      avatarBg: 'bg-blue-900/10 text-blue-800',
      verified: true,
      access: true,
    },
  ];

  const filteredUsers = usersData.filter((u) => {
    if (cityFilter && u.city !== cityFilter) return false;
    if (langFilter && u.language !== langFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    if (emailVerifiedFilter === 'yes' && !u.verified) return false;
    if (emailVerifiedFilter === 'no' && u.verified) return false;
    return true;
  });

  function toggleAccess(email) {
    setAccessStates((prev) => ({
      ...prev,
      [email]: prev[email] === undefined ? !usersData.find((u) => u.email === email).access : !prev[email],
    }));
  }

  function getAccess(user) {
    return accessStates[user.email] === undefined ? user.access : accessStates[user.email];
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
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              >
                <option value="">{T.allCities}</option>
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Garoua">Garoua</option>
                <option value="Bamenda">Bamenda</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.languageLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
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
                onChange={(e) => setStatusFilter(e.target.value)}
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
                onChange={(e) => setEmailVerifiedFilter(e.target.value)}
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
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8"
              />
              <Calendar size={14} className="text-gray-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={() => { setCityFilter(''); setLangFilter(''); setStatusFilter(''); setEmailVerifiedFilter(''); setDateFilter(''); }}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Filter size={14} className="text-gray-400" /> {T.clearAll}
          </button>
        </div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-400 col-span-full text-center py-8">No users match the current filters.</p>
        ) : filteredUsers.map((user, idx) => (
          <div key={idx} className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${user.avatarBg} font-bold text-xs flex items-center justify-center flex-shrink-0 select-none`}>
                    {user.initials}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900 leading-snug flex items-center gap-1">
                      {user.name}
                      {user.verified && (
                        <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-600" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${user.statusColor}`}>
                  {user.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-t border-gray-50 text-xs">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">{T.cityLabel}</span>
                  <span className="text-gray-700 font-medium mt-0.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    {user.city}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">{T.languageLabel}</span>
                  <span className="text-gray-700 font-medium mt-0.5 block uppercase">{user.language}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">{T.joinedDate}</span>
                  <span className="text-gray-500 font-normal mt-0.5 block">{user.joinedDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">{T.documents}</span>
                  <span className="text-amber-700 font-bold mt-0.5 block">{user.documents}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={getAccess(user)}
                    onChange={() => toggleAccess(user.email)}
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
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400 pt-4 border-t border-gray-200/60">
        <span>{T.showing} 1 to {filteredUsers.length} of 42 entries</span>
        <div className="flex items-center gap-1 select-none font-bold text-gray-600">
          <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs font-bold">{T.prev}</button>
          <button className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm text-xs">1</button>
          <button className="w-8 h-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors text-xs">2</button>
          <button className="w-8 h-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors text-xs">3</button>
          <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-xs font-bold">{T.next}</button>
        </div>
      </div>

    </div>
  );
}
