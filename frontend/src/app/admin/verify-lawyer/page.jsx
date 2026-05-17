'use client';
import {
  ChevronDown, Calendar, SlidersHorizontal, FolderOpen, MoreVertical,
} from 'lucide-react';

export default function LawyerVerificationQueue() {
  const applicants = [
    {
      name: 'Me. Valerie Nanga',
      initials: 'VN',
      id: '#CBA-2023-891',
      email: 'v.nanga@example.cm',
      city: 'Douala',
      dateApplied: 'Applied: Oct 24, 2024',
      tags: ['Corporate Law', 'Tech'],
      filesCount: 3,
    },
    {
      name: 'Me. Jean-Paul Mbarga',
      initials: 'JM',
      id: '#CBA-2018-442',
      email: 'jp.mbarga@legal.cm',
      city: 'Yaoundé',
      dateApplied: 'Applied: Oct 25, 2024',
      tags: ['Family Law'],
      filesCount: 2,
    },
  ];

  return (
    <div className="p-8 space-y-6">

      {/* Page title */}
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">Lawyer Verification Queue</h2>
        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100/60 uppercase flex items-center gap-1">
          <span className="text-sm leading-none">•</span> 3 Pending
        </span>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 flex-1">
          <div className="w-48">
            <label className="block mb-1.5 font-bold">Status</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">Pending Approval</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
          <div className="w-48">
            <label className="block mb-1.5 font-bold">City</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-gray-800">All Cities</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
          <div className="w-56">
            <label className="block mb-1.5 font-bold">Date Applied</label>
            <div className="relative bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-gray-400 font-normal">mm/dd/yyyy</span>
              <Calendar size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
        <button className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors shadow-sm">
          <SlidersHorizontal size={12} /> More Filters
        </button>
      </div>

      {/* Applicant cards */}
      <div className="space-y-4 max-w-5xl">
        {applicants.map((applicant, idx) => (
          <div key={idx} className="bg-white border border-gray-200/60 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100/60">

            <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm flex-shrink-0 select-none">
                  {applicant.initials}
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-primary tracking-tight">{applicant.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h10"/></svg>
                      ID: {applicant.id}
                    </span>
                    <span>•</span>
                    <span className="select-all">{applicant.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {applicant.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right space-y-1.5 self-start sm:self-auto">
                <p className="text-[11px] font-bold text-gray-400">{applicant.dateApplied}</p>
                <div className="flex flex-wrap sm:justify-end gap-1">
                  {applicant.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-200/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-white flex items-center justify-between gap-4">
              <button className="inline-flex items-center gap-2 text-xs font-bold text-accent-dark hover:underline">
                <FolderOpen size={14} /> View {applicant.filesCount} Files
              </button>
              <div className="flex items-center gap-2">
                <button className="border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors bg-white">
                  Reject
                </button>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors">
                  Approve
                </button>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
