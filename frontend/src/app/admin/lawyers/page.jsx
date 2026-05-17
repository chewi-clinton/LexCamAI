'use client';
import {
  Plus, SlidersHorizontal, Download, Printer,
  ChevronDown, X, Eye, Pencil, Ban, Check, Trash2, RotateCcw,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function AdminLawyerDirectory() {
  const tableData = [
    {
      name: 'Me. Ndoumbe Marcel',
      barId: 'Bar ID: CM-2015-849',
      email: 'm.ndoumbe@lexfirm.cm',
      phone: '+237 677 12 34 56',
      location: 'Douala',
      type: 'Self-registered',
      status: 'Verified',
      dateJoined: 'Oct 12, 2023',
      initials: 'MN',
      avatarBg: 'bg-emerald-800/10 text-emerald-800',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      actions: ['view', 'edit', 'ban'],
    },
    {
      name: 'Me. Ekoka Alice',
      barId: 'Bar ID: CM-2021-112',
      email: 'alice.e@gmail.com',
      phone: '+237 699 88 77 66',
      location: 'Yaoundé',
      type: 'Self-registered',
      status: 'Pending',
      dateJoined: 'Nov 05, 2023',
      initials: 'EA',
      avatarBg: 'bg-slate-200 text-slate-700',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
      actions: ['view', 'edit', 'approve'],
    },
    {
      name: 'Me. Biyong Thomas',
      barId: 'Bar ID: Unknown',
      email: 'Not provided',
      phone: '+237 670 00 11 22',
      location: 'Bamenda',
      type: 'Scraped DB',
      status: 'Unclaimed',
      dateJoined: 'System Import',
      initials: 'BT',
      avatarBg: 'bg-slate-200 text-slate-700',
      statusClass: 'bg-gray-100 text-gray-600 border-gray-200/80',
      actions: ['view', 'edit', 'delete'],
    },
    {
      name: 'Me. Siewe Fabrice',
      barId: 'License Suspended',
      email: 'f.siewe@avocat.cm',
      phone: '+237 655 44 33 22',
      location: 'Buea',
      type: 'Self-registered',
      status: 'Suspended',
      dateJoined: 'Jan 10, 2022',
      initials: 'SF',
      avatarBg: 'bg-red-50 text-red-800',
      statusClass: 'bg-red-50 text-red-600 border-red-200/60',
      actions: ['view', 'history', 'delete'],
      isSuspended: true,
    },
  ];

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">Lawyer Directory</h2>
        <button className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Add Lawyer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-1">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Filter Records</span>
          <button className="text-xs font-bold text-muted hover:text-gray-600 flex items-center gap-1">
            <SlidersHorizontal size={12} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-gray-500">
          <div>
            <label className="block mb-1.5 font-bold">Status</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">All Statuses</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 font-bold">City</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">All Cities</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 font-bold">Practice Domain (Multi)</label>
            <div className="bg-white border border-gray-200 rounded-lg p-1.5 flex flex-wrap items-center gap-1.5 min-h-[38px]">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] border border-gray-200/40 font-medium">
                Corporate Law <X size={10} className="mt-0.5 cursor-pointer text-gray-400" />
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] border border-gray-200/40 font-medium">
                Family Law <X size={10} className="mt-0.5 cursor-pointer text-gray-400" />
              </span>
              <span className="text-gray-400 font-normal pl-0.5">Add domain...</span>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 font-bold">Origin Type</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">All Types</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

        <div className="px-6 py-4 bg-[#FAFAFA] border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">Showing 1-15 of 248 records</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-500">
              <Download size={14} />
            </button>
            <button className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-500">
              <Printer size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                <th className="py-4 px-6 w-12"><input type="checkbox" className="rounded border-gray-300 accent-primary" /></th>
                <th className="py-4 px-4">Lawyer Name</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Date Joined</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6">
                    <input type="checkbox" className="rounded border-gray-300 accent-primary" />
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${row.avatarBg} font-bold text-[11px] flex items-center justify-center flex-shrink-0`}>
                        {row.initials}
                      </div>
                      <div>
                        <p className={`font-bold text-sm text-gray-900 ${row.isSuspended ? 'line-through text-gray-400' : ''}`}>
                          {row.name}
                        </p>
                        <p className={`text-[10px] mt-0.5 font-bold ${row.isSuspended ? 'text-red-500' : 'text-gray-400'}`}>
                          {row.barId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <p className={`font-semibold text-gray-800 ${row.email === 'Not provided' ? 'italic font-normal text-gray-400' : ''}`}>
                      {row.email}
                    </p>
                    <p className="text-gray-400 font-normal mt-0.5">{row.phone}</p>
                  </td>

                  <td className="py-4 px-6 text-gray-600 font-semibold">{row.location}</td>

                  <td className="py-4 px-4">
                    <span className="bg-gray-100 text-gray-500 border border-gray-200/50 px-2 py-0.5 rounded text-[10px]">
                      {row.type}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                      <span className="text-[14px] leading-none mb-0.5">•</span> {row.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-gray-500 font-normal">{row.dateJoined}</td>

                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-1.5 text-gray-400">
                      {row.actions.includes('view') && (
                        <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"><Eye size={14} /></button>
                      )}
                      {row.actions.includes('edit') && (
                        <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"><Pencil size={14} /></button>
                      )}
                      {row.actions.includes('ban') && (
                        <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Ban size={14} /></button>
                      )}
                      {row.actions.includes('approve') && (
                        <button className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors"><Check size={14} strokeWidth={2.5} /></button>
                      )}
                      {row.actions.includes('history') && (
                        <button className="p-1.5 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"><RotateCcw size={14} /></button>
                      )}
                      {row.actions.includes('delete') && (
                        <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-[#FAFAFA] border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-gray-500">
            <span>Rows per page:</span>
            <div className="bg-white border border-gray-200 rounded px-2 py-1 flex items-center gap-2 cursor-pointer text-gray-800">
              <span>15</span> <ChevronDown size={12} />
            </div>
          </div>

          <div className="flex items-center gap-1 select-none font-semibold text-gray-600">
            <button disabled className="p-1.5 border border-gray-200 bg-white rounded disabled:opacity-40 cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 bg-primary text-white font-bold rounded flex items-center justify-center shadow-sm">1</button>
            <button className="w-7 h-7 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center transition-colors">2</button>
            <button className="w-7 h-7 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center transition-colors">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-7 h-7 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center transition-colors">17</button>
            <button className="p-1.5 border border-gray-200 bg-white rounded hover:bg-gray-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
