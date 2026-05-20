'use client';
import { useState, useEffect } from 'react';
import {
  Plus, Filter, ArrowUpDown, Eye, Pencil,
  Briefcase, Layers, Home, FileSignature, X, Upload, Loader2,
} from 'lucide-react';
import { admin } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const ICONS = [Layers, Briefcase, Home, FileSignature];

// ─── Upload modal (new template — form only, no backend upload yet) ────────────
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
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">{T.addTemplateTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.templateName}</label>
            <input required type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              placeholder="e.g. Non-Disclosure Agreement" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.categoryLabel}</label>
              <input type="text" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="e.g. Corporate" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.internalSlug}</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="e.g. nda-standard" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.price}</label>
              <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="25000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.status}</label>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
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
            <button type="button" onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">{T.cancel}</button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
              <Upload size={15} /> {T.uploadTemplate}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── View modal ────────────────────────────────────────────────────────────────
function ViewModal({ tpl, lang, onClose, onEditOpen }) {
  const name = lang === 'fr' ? tpl.name_fr : tpl.name_en;
  const desc = lang === 'fr' ? tpl.description_fr : tpl.description_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-xs font-mono text-gray-400 mb-6">{tpl.slug}</p>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
              <p className="font-bold text-gray-900">{tpl.price_xaf ? `${Number(tpl.price_xaf).toLocaleString()} XAF` : '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tpl.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {tpl.is_active ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name (FR)</p>
              <p className="text-gray-800 font-medium">{tpl.name_fr}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name (EN)</p>
              <p className="text-gray-800 font-medium">{tpl.name_en}</p>
            </div>
          </div>
          {desc && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
              <p className="text-gray-700 text-xs leading-relaxed">{desc}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
          <button onClick={onEditOpen} className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <Pencil size={14} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({ tpl, onClose, onSaved }) {
  const [form, setForm] = useState({
    name_fr: tpl.name_fr,
    name_en: tpl.name_en,
    description_fr: tpl.description_fr || '',
    description_en: tpl.description_en || '',
    price_xaf: tpl.price_xaf,
    is_active: tpl.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await admin.editTemplate(tpl.id, {
        ...form,
        price_xaf: Number(form.price_xaf),
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">Edit Template</h3>
        <p className="text-xs font-mono text-gray-400 mb-6">{tpl.slug}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Name (FR) <span className="text-red-400">*</span></label>
              <input required value={form.name_fr} onChange={(e) => setForm((p) => ({ ...p, name_fr: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Name (EN) <span className="text-red-400">*</span></label>
              <input required value={form.name_en} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description (FR)</label>
            <textarea rows={2} value={form.description_fr} onChange={(e) => setForm((p) => ({ ...p, description_fr: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description (EN)</label>
            <textarea rows={2} value={form.description_en} onChange={(e) => setForm((p) => ({ ...p, description_en: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Price (XAF) <span className="text-red-400">*</span></label>
              <input required type="number" value={form.price_xaf} onChange={(e) => setForm((p) => ({ ...p, price_xaf: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <select value={form.is_active ? 'active' : 'disabled'} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'active' }))}
                  className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DocumentTemplatesAdmin() {
  const { lang } = useLanguage();
  const T = t[lang].admin;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewTpl, setViewTpl] = useState(null);
  const [editTpl, setEditTpl] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await admin.templates();
      setTemplates(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id) {
    setToggling(id);
    try {
      const updated = await admin.toggleTemplate(id);
      setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, is_active: updated.is_active } : t));
    } catch { /* silent */ } finally {
      setToggling(null);
    }
  }

  function handleSaved(updated) {
    setTemplates((prev) => prev.map((t) => t.id === updated.id ? { ...t, ...updated } : t));
    setEditTpl(null);
    setViewTpl(null);
  }

  function fmtPrice(xaf) {
    return xaf ? `${Number(xaf).toLocaleString()} XAF` : '—';
  }

  return (
    <div className="p-8 space-y-6">

      {showUploadModal && <UploadModal T={T} onClose={() => setShowUploadModal(false)} />}
      {viewTpl && !editTpl && (
        <ViewModal
          tpl={viewTpl}
          lang={lang}
          onClose={() => setViewTpl(null)}
          onEditOpen={() => setEditTpl(viewTpl)}
        />
      )}
      {editTpl && (
        <EditModal
          tpl={editTpl}
          onClose={() => setEditTpl(null)}
          onSaved={handleSaved}
        />
      )}

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
          <span className="text-xs font-semibold text-gray-400">
            {loading ? '...' : `${T.showing} ${templates.length} templates`}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">No templates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                  <th className="py-4 px-6 w-[40%]">{T.templateName}</th>
                  <th className="py-4 px-6">{T.internalSlug}</th>
                  <th className="py-4 px-4">{T.status}</th>
                  <th className="py-4 px-6">{T.price}</th>
                  <th className="py-4 px-6 text-right">{T.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
                {templates.map((tpl, idx) => {
                  const IconComponent = ICONS[idx % ICONS.length];
                  const name = lang === 'fr' ? tpl.name_fr : tpl.name_en;
                  const isToggling = toggling === tpl.id;
                  return (
                    <tr key={tpl.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <IconComponent size={16} />
                          </div>
                          <div>
                            <p className="font-serif text-sm font-bold text-gray-900 leading-snug">{name}</p>
                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                              {tpl.name_fr !== tpl.name_en ? (lang === 'fr' ? tpl.name_en : tpl.name_fr) : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 font-mono text-gray-500 max-w-[160px] truncate">{tpl.slug}</td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tpl.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {tpl.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-5 px-6 font-bold text-gray-900 text-sm">{fmtPrice(tpl.price_xaf)}</td>
                      <td className="py-5 px-6 text-right">
                        <div className="inline-flex items-center gap-4 text-gray-400 justify-end w-full">
                          <button
                            onClick={() => setViewTpl(tpl)}
                            className="hover:text-primary transition-colors p-0.5"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setEditTpl(tpl)}
                            className="hover:text-primary transition-colors p-0.5"
                            title="Edit template"
                          >
                            <Pencil size={16} />
                          </button>
                          <div className="h-4 w-px bg-gray-200" />
                          {isToggling ? (
                            <Loader2 size={14} className="animate-spin text-primary" />
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={tpl.is_active}
                                onChange={() => handleToggle(tpl.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </label>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
