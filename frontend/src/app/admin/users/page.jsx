'use client';
import {
  ChevronDown, Calendar, Filter, Eye, UserX, CheckCircle2,
} from 'lucide-react';

export default function UserManagementAdmin() {
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

  return (
    <div className="p-8 space-y-6">

      <div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">User Management</h2>
        <p className="text-muted text-sm mt-1">Manage all registered users, monitor their activity, and handle GDPR compliance tasks.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-gray-500">
          {[
            { label: 'City', placeholder: 'All Cities' },
            { label: 'Language', placeholder: 'All' },
            { label: 'Status', placeholder: 'Any Status' },
            { label: 'Email Verified', placeholder: 'Any' },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="block mb-1.5 font-bold">{label}</label>
              <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-gray-800">{placeholder}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pt-2">
          <div className="flex-1 text-xs font-semibold text-gray-500">
            <label className="block mb-1.5 font-bold">Date Range</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between max-w-xl">
              <span className="text-gray-400 font-normal">mm/dd/yyyy</span>
              <Calendar size={14} className="text-gray-400" />
            </div>
          </div>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors">
            <Filter size={14} className="text-gray-400" /> Apply
          </button>
        </div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersData.map((user, idx) => (
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
                  <span className="block text-[10px] text-gray-400 font-bold">City</span>
                  <span className="text-gray-700 font-medium mt-0.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    {user.city}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">Language</span>
                  <span className="text-gray-700 font-medium mt-0.5 block uppercase">{user.language}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">Joined Date</span>
                  <span className="text-gray-500 font-normal mt-0.5 block">{user.joinedDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold">Documents</span>
                  <span className="text-amber-700 font-bold mt-0.5 block">{user.documents}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" defaultChecked={user.access} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
                <span className="text-xs font-bold text-gray-500">Access</span>
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
        <span>Showing 1 to 3 of 42 entries</span>
        <div className="flex items-center gap-1 select-none font-bold text-gray-600">
          <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs font-bold">Prev</button>
          <button className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm text-xs">1</button>
          <button className="w-8 h-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors text-xs">2</button>
          <button className="w-8 h-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors text-xs">3</button>
          <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-xs font-bold">Next</button>
        </div>
      </div>

    </div>
  );
}
