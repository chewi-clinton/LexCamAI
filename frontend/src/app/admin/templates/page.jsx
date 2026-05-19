'use client';
import { useState } from 'react';
import {
  Plus, Filter, ArrowUpDown, Eye, Pencil,
  Briefcase, Layers, Home, FileSignature, X, Upload,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function UploadModal({ T, onClose }) {
  const [form, setForm] = useState({ name: '', category: '', slug: '', price: '', status: 'Active', file: null });
  const [fileName, setFileName] = useState('');

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) { setFileName(f.name); setForm((p) => ({ ...p, file: f })); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">{T.addTemplateTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.templateName}</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              placeholder="e.g. Non-Disclosure Agreement"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.categoryLabel}</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="e.g. Corporate"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.internalSlug}</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="e.g. nda-standard"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.price}</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.status}</label>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8"
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.uploadFile}</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 hover:border-primary/50 rounded-lg px-4 py-4 cursor-pointer transition-colors group">
              <Upload size={18} className="text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors truncate">
                {fileName || 'Click to select a .docx or .pdf file'}
              </span>
              <input type="file" accept=".docx,.pdf" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              {T.cancel}
            </button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
              <Upload size={15} /> {T.uploadTemplate}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DocumentTemplatesAdmin() {
  const { lang } = useLanguage();
  const T = t[lang].admin;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toggleStates, setToggleStates] = useState({});

  const templates = [
    { name: 'Non-Disclosure Agreement (Standard)', category: 'Corporate / Confidentiality', slug: 'nda-standard', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', price: '15,000', lastUpdated: 'Oct 24, 2023', icon: Layers, enabled: true },
    { name: 'Employment Contract (CDI)', category: 'Labor Law', slug: 'employment-contract-cdi', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', price: '25,000', lastUpdated: 'Oct 20, 2023', icon: Briefcase, enabled: true },
    { name: 'Commercial Lease Agreement', category: 'Real Estate', slug: 'commercial-lease', status: 'Disabled', statusColor: 'bg-gray-100 text-gray-500 border-gray-200', price: '45,000', lastUpdated: 'Sep 15, 2023', icon: Home, enabled: false },
    { name: 'Consulting Services Agreement', category: 'Corporate', slug: 'consulting-agreement', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', price: '20,000', lastUpdated: 'Oct 25, 2023', icon: FileSignature, enabled: true },
  ];

  function getEnabled(slug, defaultEnabled) {
    return toggleStates[slug] === undefined ? defaultEnabled : toggleStates[slug];
  }

  function toggleTemplate(slug) {
    setToggleStates((prev) => ({
      ...prev,
      [slug]: prev[slug] === undefined ? !templates.find((t) => t.slug === slug).enabled : !prev[slug],
    }));
  }

  return (
    <div className="p-8 space-y-6">

      {showUploadModal && <UploadModal T={T} onClose={() => setShowUploadModal(false)} />}

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.templatesTitle}</h2>
          <p className="text-muted text-sm mt-1">{T.templatesDesc}</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> {T.uploadTemplate}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">

        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="border border-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <Filter size={14} className="text-gray-400" /> {T.filter}
            </button>
            <button className="border border-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <ArrowUpDown size={14} className="text-gray-400" /> {T.sort}
            </button>
          </div>
          <span className="text-xs font-semibold text-gray-400">{T.showing} 4 of 24 templates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                <th className="py-4 px-6 w-[40%]">{T.templateName}</th>
                <th className="py-4 px-6">{T.internalSlug}</th>
                <th className="py-4 px-4">{T.status}</th>
                <th className="py-4 px-6">{T.price}</th>
                <th className="py-4 px-6">{T.lastUpdated}</th>
                <th className="py-4 px-6 text-right">{T.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {templates.map((tpl) => {
                const IconComponent = tpl.icon;
                const enabled = getEnabled(tpl.slug, tpl.enabled);
                return (
                  <tr key={tpl.slug} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <p className="font-serif text-sm font-bold text-gray-900 leading-snug">{tpl.name}</p>
                          <p className="text-[10px] text-gray-400 font-normal mt-0.5">{tpl.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 font-mono text-gray-500 max-w-[160px] truncate">{tpl.slug}</td>
                    <td className="py-5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-bold text-gray-900 text-sm">{tpl.price}</td>
                    <td className="py-5 px-6 text-gray-400 font-normal">{tpl.lastUpdated}</td>
                    <td className="py-5 px-6 text-right">
                      <div className="inline-flex items-center gap-4 text-gray-400 justify-end w-full">
                        <button className="hover:text-gray-600 transition-colors p-0.5"><Eye size={16} /></button>
                        <button className="hover:text-gray-600 transition-colors p-0.5"><Pencil size={16} /></button>
                        <div className="h-4 w-px bg-gray-200" />
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleTemplate(tpl.slug)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
