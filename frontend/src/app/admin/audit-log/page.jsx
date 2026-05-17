'use client';
import {
  ChevronDown, Calendar, Filter, Download, Printer, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function AuditLogAdmin() {
  const auditLogs = [
    {
      timestamp: 'Oct 24, 2023 14:32:10',
      admin: 'Alice M.',
      initials: 'AM',
      avatarBg: 'bg-emerald-900/10 text-emerald-800',
      action: 'Approve Lawyer',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      target: 'Lawyer Profile: Jean D.',
      ipAddress: '197.244.140.32',
    },
    {
      timestamp: 'Oct 24, 2023 11:15:44',
      admin: 'Bob T.',
      initials: 'BT',
      avatarBg: 'bg-blue-900/10 text-blue-800',
      action: 'Dismiss AI Flag',
      badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200',
      target: 'AI Log: SES-441-K',
      ipAddress: '197.244.140.105',
    },
    {
      timestamp: 'Oct 23, 2023 16:48:22',
      admin: 'Alice M.',
      initials: 'AM',
      avatarBg: 'bg-emerald-900/10 text-emerald-800',
      action: 'Update Template',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/60',
      target: 'Doc: Employment CDI',
      ipAddress: '197.244.140.32',
    },
    {
      timestamp: 'Oct 22, 2023 09:12:05',
      admin: 'System Event',
      initials: 'SE',
      avatarBg: 'bg-purple-900/10 text-purple-800',
      action: 'Scraper Executed',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200/60',
      target: 'Source: Bar Registry',
      ipAddress: 'localhost',
    },
    {
      timestamp: 'Oct 21, 2023 10:30:15',
      admin: 'Chantal E.',
      initials: 'CE',
      avatarBg: 'bg-pink-900/10 text-pink-800',
      action: 'Suspend Lawyer',
      badgeStyle: 'bg-red-50 text-red-700 border-red-200/60',
      target: 'Lawyer: Me. Siewe F.',
      ipAddress: '41.204.82.17',
    },
  ];

  return (
    <div className="p-8 space-y-6">

      <div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">Security Audit Log</h2>
        <p className="text-muted text-sm mt-1">Track system configurations, user alterations, permissions modifications, and critical background procedures.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold text-gray-500">
          <div>
            <label className="block mb-1.5 font-bold">Admin/Actor Type</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">All Operators</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 font-bold">Action Category</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">All Action Groups</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 font-bold">Date Scope</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-gray-400 font-normal">Select timeframe...</span>
              <Calendar size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors">
            <Filter size={14} className="text-gray-400" /> Filter Log
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Showing 1-5 of 1,420 security updates</span>
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
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-[#FAFAFA]">
                <th className="py-4 px-6 font-semibold w-[22%]">Timestamp</th>
                <th className="py-4 px-6 font-semibold w-[20%]">Admin/Actor</th>
                <th className="py-4 px-4 font-semibold w-[18%]">Action</th>
                <th className="py-4 px-6 font-semibold w-[25%]">Target Object</th>
                <th className="py-4 px-6 font-semibold text-right w-[15%]">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6 font-normal text-gray-400">{log.timestamp}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full ${log.avatarBg} font-bold text-[9px] flex items-center justify-center flex-shrink-0 select-none`}>
                        {log.initials}
                      </div>
                      <span className="font-bold text-gray-900">{log.admin}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${log.badgeStyle}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-600 truncate max-w-xs">{log.target}</td>
                  <td className="py-4 px-6 text-right font-mono text-gray-400 font-normal">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-[#FAFAFA] border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-gray-400 font-medium">Page 1 of 284</span>
          <div className="flex items-center gap-1 select-none font-semibold text-gray-600">
            <button className="p-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-400 disabled:opacity-40 cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 bg-primary text-white font-bold rounded-lg flex items-center justify-center shadow-sm">1</button>
            <button className="w-7 h-7 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center transition-colors">2</button>
            <button className="w-7 h-7 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center transition-colors">3</button>
            <span className="px-1 text-gray-400 font-normal">...</span>
            <button className="w-7 h-7 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center transition-colors">284</button>
            <button className="p-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
