'use client';
import { useState, useEffect } from 'react';
import {
  Plus, SlidersHorizontal, Download, Printer,
  X, Eye, Pencil, Ban, Check, Trash2, RotateCcw,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { admin } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function AddLawyerModal({ T, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', barId: '', email: '', phone: '', location: '', type: 'Self-registered', status: 'Pending' });

  function handleSubmit(e) {
    e.preventDefault();
    const initials = form.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    onAdd({
      ...form,
      barId: form.barId || 'Bar ID: Pending',
      initials,
      avatarBg: 'bg-slate-200 text-slate-700',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
      dateJoined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      actions: ['view', 'edit', 'approve'],
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">{T.addLawyerTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.lawyerName}</label>
              <input required type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="Me. Jean Dupont" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Bar ID</label>
              <input type="text" value={form.barId} onChange={(e) => setForm((p) => ({ ...p, barId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="CM-2024-001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.cityLabel}</label>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <select value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                  <option value="">— Select —</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Bamenda">Bamenda</option>
                  <option value="Garoua">Garoua</option>
                  <option value="Buea">Buea</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.emailLabel}</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="lawyer@example.cm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.phone}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="+237 6XX XX XX XX" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.originType}</label>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                  <option value="Self-registered">Self-registered</option>
                  <option value="Scraped DB">Scraped DB</option>
                  <option value="Admin Added">Admin Added</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              {T.cancel}
            </button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors">
              {T.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toRow(l) {
  const s = l.verification_status;
  return {
    id: l.id,
    name: l.full_name,
    email: l.email,
    phone: l.phone || '—',
    location: l.city,
    type: l.type === 'scraped' ? 'Scraped DB' : 'Self-registered',
    status: s === 'verified' ? 'Verified' : s === 'rejected' ? 'Rejected' : s === 'suspended' ? 'Suspended' : 'Pending',
    dateJoined: l.created_at ? new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    initials: (l.full_name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    avatarBg: s === 'verified' ? 'bg-emerald-800/10 text-emerald-800' : s === 'suspended' ? 'bg-red-50 text-red-800' : 'bg-slate-200 text-slate-700',
    statusClass: s === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : s === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : s === 'suspended' || s === 'rejected' ? 'bg-red-50 text-red-600 border-red-200/60' : 'bg-gray-100 text-gray-600 border-gray-200/80',
    actions: s === 'pending' ? ['approve', 'ban'] : s === 'verified' ? ['ban'] : ['approve'],
  };
}

export default function AdminLawyerDirectory() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [showAddModal, setShowAddModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('15');

  useEffect(() => {
    admin.lawyers()
      .then((data) => setTableData(data.map(toRow)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function applyRowAction(id, action) {
    setActionLoading(id + action);
    try {
      if (action === 'approve') {
        await admin.verifyLawyer(id, 'verified');
        setTableData((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Verified', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', actions: ['ban'] } : r));
      } else if (action === 'ban') {
        await admin.verifyLawyer(id, 'suspended');
        setTableData((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Suspended', statusClass: 'bg-red-50 text-red-600 border-red-200/60', actions: ['approve'] } : r));
      }
    } catch { /* silent */ } finally {
      setActionLoading(null);
    }
  }

  function removeDomain() {}

  const filtered = tableData.filter((row) => {
    if (statusFilter && row.status !== statusFilter) return false;
    if (cityFilter && row.location !== cityFilter) return false;
    return true;
  });

  const uniqueStatuses = [...new Set(tableData.map((r) => r.status))];
  const uniqueCities = [...new Set(tableData.map((r) => r.location))];
  const uniqueTypes = [...new Set(tableData.map((r) => r.type))];

  return (
    <div className="p-8 space-y-6">

      {showAddModal && (
        <AddLawyerModal T={T} onClose={() => setShowAddModal(false)} onAdd={(newRow) => setTableData((prev) => [newRow, ...prev])} />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.lawyerDirectory}</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> {T.addLawyer}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-1">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{T.filterRecords}</span>
          <button
            onClick={() => { setStatusFilter(''); setCityFilter(''); setTypeFilter(''); setDomains([]); }}
            className="text-xs font-bold text-muted hover:text-gray-600 flex items-center gap-1"
          >
            <SlidersHorizontal size={12} /> {T.clearAll}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-gray-500">

          <div>
            <label className="block mb-1.5 font-bold">{T.status}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8">
                <option value="">{T.allStatuses}</option>
                {uniqueStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.cityLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8">
                <option value="">{T.allCities}</option>
                {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.practiceDomain}</label>
            <div className="bg-white border border-gray-200 rounded-lg p-1.5 flex flex-wrap items-center gap-1.5 min-h-[38px]">
              {domains.map((d) => (
                <span key={d} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] border border-gray-200/40 font-medium">
                  {d}
                  <button type="button" onClick={() => removeDomain(d)}>
                    <X size={10} className="mt-0.5 text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              ))}
              <span className="text-gray-400 font-normal pl-0.5">{T.addDomain}</span>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold">{T.cityLabel}</label>
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-8">
                <option value="">{T.allCities}</option>
                {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

        <div className="px-6 py-4 bg-[#FAFAFA] border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">{T.showing} 1–{Math.min(Number(rowsPerPage), filtered.length)} of {filtered.length} records</span>
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
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted text-sm">No lawyers found.</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                <th className="py-4 px-6 w-12"><input type="checkbox" className="rounded border-gray-300 accent-primary" /></th>
                <th className="py-4 px-4">{T.lawyerName}</th>
                <th className="py-4 px-6">{T.contactInfo}</th>
                <th className="py-4 px-6">{T.location}</th>
                <th className="py-4 px-4">{T.type}</th>
                <th className="py-4 px-4">{T.status}</th>
                <th className="py-4 px-4">{T.dateJoined}</th>
                <th className="py-4 px-6 text-right">{T.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {filtered.map((row) => {
                const isSuspended = row.status === 'Suspended';
                return (
                  <tr key={row.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <input type="checkbox" className="rounded border-gray-300 accent-primary" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${row.avatarBg} font-bold text-[11px] flex items-center justify-center flex-shrink-0`}>
                          {row.initials}
                        </div>
                        <div>
                          <p className={`font-bold text-sm text-gray-900 ${isSuspended ? 'line-through text-gray-400' : ''}`}>{row.name}</p>
                          <p className="text-[10px] mt-0.5 font-bold text-gray-400">{row.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-800">{row.email}</p>
                      <p className="text-gray-400 font-normal mt-0.5">{row.phone}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-semibold">{row.location}</td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-100 text-gray-500 border border-gray-200/50 px-2 py-0.5 rounded text-[10px]">{row.type}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                        <span className="text-[14px] leading-none mb-0.5">•</span> {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-normal">{row.dateJoined}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 text-gray-400">
                        {row.actions.includes('ban') && (
                          <button onClick={() => applyRowAction(row.id, 'ban')} disabled={!!actionLoading} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors disabled:opacity-40">
                            {actionLoading === row.id + 'ban' ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                          </button>
                        )}
                        {row.actions.includes('approve') && (
                          <button onClick={() => applyRowAction(row.id, 'approve')} disabled={!!actionLoading} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors disabled:opacity-40">
                            {actionLoading === row.id + 'approve' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-[#FAFAFA] border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-gray-500">
            <span>{T.rowsPerPage}</span>
            <div className="relative bg-white border border-gray-200 rounded overflow-hidden">
              <select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)}
                className="appearance-none bg-transparent px-2 py-1 pr-6 text-xs text-gray-800 outline-none cursor-pointer">
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
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
