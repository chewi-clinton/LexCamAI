'use client';
import { useState } from 'react';
import {
  Plus, Play, ChevronRight, CheckCircle2, XCircle, X, Loader2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function AddSourceModal({ T, onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', url: '', type: 'bar' });

  function handleSubmit(e) {
    e.preventDefault();
    onAdd({
      ...form,
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      lastRun: 'Not yet run',
      result: '—',
      resultColor: 'text-gray-400',
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">{T.addSourceTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceNameLabel}</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              placeholder="e.g. National Bar Registry"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceUrlLabel}</label>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceTypeLabel}</label>
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8"
              >
                <option value="bar">Bar Registry</option>
                <option value="court">Court Directory</option>
                <option value="firm">Law Firm Listing</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
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

function EditSourceModal({ T, source, onClose, onSave }) {
  const [form, setForm] = useState({ title: source.title, url: source.url, type: source.type });

  function handleSubmit(e) {
    e.preventDefault();
    onSave(source.title, form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">{T.edit}: {source.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceNameLabel}</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceUrlLabel}</label>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceTypeLabel}</label>
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8"
              >
                <option value="bar">Bar Registry</option>
                <option value="court">Court Directory</option>
                <option value="firm">Law Firm Listing</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
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

export default function ScraperManagement() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [runningIds, setRunningIds] = useState(new Set());
  const [sources, setSources] = useState([
    { title: 'National Bar Registry', url: 'https://api.barreau.cm/public/lawyers', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', lastRun: 'Today, 08:30 AM', result: 'Success (1,245 profiles)', resultColor: 'text-emerald-700', type: 'bar' },
    { title: 'Douala Legal Roster', url: 'https://douala.courts.cm/directory', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', lastRun: 'Yesterday, 11:45 PM', result: 'Success (412 profiles)', resultColor: 'text-emerald-700', type: 'court' },
    { title: 'Yaoundé Firm Listings', url: 'https://yaounde.legal/firms/export', status: 'Paused', statusColor: 'bg-gray-100 text-gray-600 border-gray-200', lastRun: 'Oct 12, 2024', result: 'Timeout Error', resultColor: 'text-red-600', type: 'firm' },
  ]);

  const runLogs = [
    { source: 'National Bar Registry', started: 'Today, 08:30 AM', duration: '4m 12s', totalScraped: '1,245', newCount: '+12', duplicates: '1,233', errors: '0', success: true },
    { source: 'Douala Legal Roster', started: 'Yesterday, 11:45 PM', duration: '1m 45s', totalScraped: '412', newCount: '+3', duplicates: '409', errors: '0', success: true },
    { source: 'Yaoundé Firm Listings', started: 'Oct 12, 14:00 PM', duration: '0m 15s', totalScraped: '0', newCount: '0', duplicates: '0', errors: '1', success: false },
  ];

  function handleRun(title) {
    setRunningIds((prev) => new Set([...prev, title]));
    setTimeout(() => {
      setRunningIds((prev) => { const next = new Set(prev); next.delete(title); return next; });
    }, 3000);
  }

  function handleResume(title) {
    setSources((prev) => prev.map((s) => s.title === title
      ? { ...s, status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : s));
  }

  function handleAddSource(newSource) {
    setSources((prev) => [...prev, newSource]);
  }

  function handleEditSave(originalTitle, updated) {
    setSources((prev) => prev.map((s) => s.title === originalTitle ? { ...s, ...updated } : s));
  }

  return (
    <div className="p-8 space-y-8">

      {showAddModal && <AddSourceModal T={T} onClose={() => setShowAddModal(false)} onAdd={handleAddSource} />}
      {editingSource && <EditSourceModal T={T} source={editingSource} onClose={() => setEditingSource(null)} onSave={handleEditSave} />}

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.scraperMgmtTitle}</h2>
          <p className="text-muted text-sm mt-1">{T.scraperMgmtDesc}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> {T.addSource}
        </button>
      </div>

      {/* Active Sources */}
      <div className="space-y-4">
        <h3 className="text-base font-serif font-bold text-gray-900 tracking-tight">{T.activeSources}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sources.map((source, idx) => {
            const isRunning = runningIds.has(source.title);
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-100 shadow-sm">
                      {source.type === 'bar' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M4 6l8-4 8 4v4H4z" /></svg>
                      )}
                      {source.type === 'court' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 13-5 5M6 16l-4 4M10.5 4.5l8 8M15 3l6 6" /></svg>
                      )}
                      {source.type === 'firm' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></svg>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isRunning ? 'bg-blue-50 text-blue-700 border-blue-200' : source.statusColor}`}>
                      {isRunning ? '● Running' : `• ${source.status}`}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-gray-900">{source.title}</h4>
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate">{source.url}</p>

                  <div className="mt-5 space-y-2 border-t border-gray-50 pt-4 text-xs font-semibold text-gray-400">
                    <div className="flex justify-between">
                      <span>{T.lastRun}</span>
                      <span className="text-gray-700">{source.lastRun}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{T.result}</span>
                      <span className={source.resultColor}>{source.result}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 border-t border-gray-50 pt-4">
                  <button
                    onClick={() => setEditingSource(source)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs py-2 rounded-lg transition-colors shadow-sm"
                  >
                    {T.edit}
                  </button>
                  {isRunning ? (
                    <button disabled className="w-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm cursor-not-allowed">
                      <Loader2 size={12} className="animate-spin" /> {T.running}
                    </button>
                  ) : source.status === 'Paused' ? (
                    <button
                      onClick={() => handleResume(source.title)}
                      className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Play size={12} fill="currentColor" /> {T.resume}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRun(source.title)}
                      className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Play size={12} fill="currentColor" /> {T.run}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Run Logs */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-serif font-bold text-gray-900 tracking-tight">{T.runLogs}</h3>
          <button className="text-xs font-bold text-accent-dark hover:underline flex items-center gap-0.5">
            {T.viewAll} <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold text-gray-600">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 bg-[#FAFAFA] tracking-wider">
                  <th className="py-4 px-6 font-semibold">{T.source}</th>
                  <th className="py-4 px-6 font-semibold">{T.started}</th>
                  <th className="py-4 px-6 font-semibold">{T.duration}</th>
                  <th className="py-4 px-6 font-semibold text-center">{T.totalScraped}</th>
                  <th className="py-4 px-6 text-center font-semibold">{T.newLabel}</th>
                  <th className="py-4 px-6 text-center font-semibold">{T.duplicates}</th>
                  <th className="py-4 px-6 text-center font-semibold">{T.errors}</th>
                  <th className="py-4 px-6 text-right font-semibold">{T.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {runLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6 font-serif text-sm font-bold text-gray-900">{log.source}</td>
                    <td className="py-4 px-6 text-gray-400 font-normal">{log.started}</td>
                    <td className="py-4 px-6 font-normal text-gray-500">{log.duration}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">{log.totalScraped}</td>
                    <td className={`py-4 px-6 text-center font-bold ${log.newCount !== '0' ? 'text-emerald-700' : 'text-gray-400'}`}>{log.newCount}</td>
                    <td className="py-4 px-6 text-center text-gray-400 font-normal">{log.duplicates}</td>
                    <td className={`py-4 px-6 text-center font-bold ${log.errors !== '0' ? 'text-red-600' : 'text-gray-400'}`}>{log.errors}</td>
                    <td className="py-4 px-6 text-right">
                      {log.success
                        ? <CheckCircle2 size={16} className="text-emerald-600 inline" />
                        : <XCircle size={16} className="text-red-500 inline" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
