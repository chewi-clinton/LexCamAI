'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Play, CheckCircle2, XCircle, X, Loader2, RefreshCw,
  BookOpen, Upload, Globe,
} from 'lucide-react';
import { scraper, kb } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function duration(created, finished) {
  if (!created || !finished) return '—';
  const ms = new Date(finished) - new Date(created);
  const s = Math.floor(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ─── Add lawyer source modal ──────────────────────────────────────────────────

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
              required type="text" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              placeholder="e.g. National Bar Registry"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.sourceUrlLabel}</label>
            <input
              required type="url" value={form.url}
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

// ─── PDF upload modal ─────────────────────────────────────────────────────────

function PdfUploadModal({ onClose, onDone }) {
  const [form, setForm] = useState({ code: '', name: '', domain: 'general', language: 'fr', jurisdiction: 'cameroon' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await kb.ingestPdf({ file, ...form });
      setResult(res);
      onDone?.();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">Ingest Law PDF</h3>
        <p className="text-xs text-gray-400 mb-6">Upload a PDF of a Cameroonian law — articles will be parsed and indexed in the knowledge base.</p>

        {result ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <p className="font-bold text-gray-900">{result.articles_ingested} / {result.articles_found} articles ingested</p>
            <p className="text-xs text-gray-400">Document ID: {result.document_id}</p>
            <button onClick={onClose} className="mt-2 bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-2.5 rounded-lg">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Law Code <span className="text-red-400">*</span></label>
                <input required value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                  placeholder="e.g. code-travail-cm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Domain</label>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                  <select value={form.domain} onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
                    className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                    <option value="general">General</option>
                    <option value="labor">Labor</option>
                    <option value="civil">Civil</option>
                    <option value="criminal">Criminal</option>
                    <option value="commercial">Commercial</option>
                    <option value="housing">Housing</option>
                    <option value="family">Family</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Law Name (full title) <span className="text-red-400">*</span></label>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="e.g. Code du Travail du Cameroun" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Language</label>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                  <select value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                    className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                    <option value="fr">French</option>
                    <option value="en">English</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Jurisdiction</label>
                <input value={form.jurisdiction} onChange={(e) => setForm((p) => ({ ...p, jurisdiction: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                  placeholder="cameroon" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">PDF File <span className="text-red-400">*</span></label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => document.getElementById('pdf-file-input').click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                    <BookOpen size={16} className="text-primary" />
                    <span className="font-semibold">{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    <Upload size={24} className="mx-auto mb-2 text-gray-300" />
                    Click to select a PDF file
                  </div>
                )}
                <input id="pdf-file-input" type="file" accept=".pdf" className="hidden"
                  onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Uploading…' : 'Ingest PDF'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Law portal scrape modal ──────────────────────────────────────────────────

function LawScrapeModal({ prefill, onClose, onDone }) {
  const [form, setForm] = useState({
    url: prefill?.url || '',
    code: prefill?.code || '',
    name: prefill?.name || '',
    domain: prefill?.domain || 'general',
    language: prefill?.language || 'fr',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await scraper.runLawJob(form);
      setDone(true);
      onDone?.();
    } catch (err) {
      setError(err.message || 'Failed to start job');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">Scrape Law Portal</h3>
        <p className="text-xs text-gray-400 mb-6">Queue a law text scrape job. The worker will extract articles and ingest them into the knowledge base.</p>
        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <p className="font-bold text-gray-900">Job queued successfully</p>
            <p className="text-xs text-gray-400">Check the Law Scrape Logs table for progress.</p>
            <button onClick={onClose} className="mt-2 bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-2.5 rounded-lg">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Portal URL <span className="text-red-400">*</span></label>
              <input required type="url" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="https://droit-afrique.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Law Code <span className="text-red-400">*</span></label>
                <input required value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                  placeholder="e.g. ohada-acts" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Domain</label>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                  <select value={form.domain} onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
                    className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                    <option value="general">General</option>
                    <option value="labor">Labor</option>
                    <option value="civil">Civil</option>
                    <option value="criminal">Criminal</option>
                    <option value="commercial">Commercial</option>
                    <option value="housing">Housing</option>
                    <option value="family">Family</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Law Name <span className="text-red-400">*</span></label>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                placeholder="e.g. Acte Uniforme OHADA — Sociétés" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Language</label>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <select value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                  className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm outline-none cursor-pointer pr-8">
                  <option value="fr">French</option>
                  <option value="en">English</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="border border-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Queuing…' : 'Start Scrape'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Law portal source card ───────────────────────────────────────────────────

const LAW_PORTALS = [
  { title: 'Droit-Afrique', url: 'https://www.droit-afrique.com/pays/cameroun', code: 'droit-afrique-cm', name: 'Lois du Cameroun (Droit-Afrique)', domain: 'general', language: 'fr' },
  { title: 'OHADA Uniform Acts', url: 'https://www.ohada.com/actes-uniformes.html', code: 'ohada-acts', name: 'Actes Uniformes OHADA', domain: 'commercial', language: 'fr' },
  { title: 'JuriAfrique', url: 'https://juriafrica.com/lex/cameroun/', code: 'juriafrica-cm', name: 'Legislation Camerounaise (JuriAfrique)', domain: 'general', language: 'fr' },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ScraperManagement() {
  const { lang } = useLanguage();
  const T = t[lang].admin;

  const [tab, setTab] = useState('lawyers');

  // Lawyer scraper state
  const [showAddModal, setShowAddModal] = useState(false);
  const [runningUrls, setRunningUrls] = useState(new Set());
  const [sources, setSources] = useState([
    { title: 'National Bar Registry', url: 'https://api.barreau.cm/public/lawyers', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', type: 'bar' },
    { title: 'Douala Legal Roster', url: 'https://douala.courts.cm/directory', status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', type: 'court' },
    { title: 'Yaoundé Firm Listings', url: 'https://yaounde.legal/firms/export', status: 'Paused', statusColor: 'bg-gray-100 text-gray-600 border-gray-200', type: 'firm' },
  ]);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Law scraper state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showLawScrapeModal, setShowLawScrapeModal] = useState(false);
  const [lawScrapePortal, setLawScrapePortal] = useState(null);
  const [lawJobs, setLawJobs] = useState([]);
  const [lawJobsLoading, setLawJobsLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    try {
      const data = await scraper.jobs(50);
      setJobs(data);
    } catch { /* silent */ } finally {
      setJobsLoading(false);
    }
  }, []);

  const loadLawJobs = useCallback(async () => {
    try {
      const data = await scraper.lawJobs(50);
      setLawJobs(data);
    } catch { /* silent */ } finally {
      setLawJobsLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); loadLawJobs(); }, [loadJobs, loadLawJobs]);

  async function handleRun(source) {
    setRunningUrls((prev) => new Set([...prev, source.url]));
    try {
      await scraper.runJob(source.url);
      await loadJobs();
    } catch { /* silent */ } finally {
      setRunningUrls((prev) => { const next = new Set(prev); next.delete(source.url); return next; });
    }
  }

  return (
    <div className="p-8 space-y-8">

      {showAddModal && (
        <AddSourceModal T={T} onClose={() => setShowAddModal(false)}
          onAdd={(s) => setSources((prev) => [...prev, s])} />
      )}
      {showPdfModal && (
        <PdfUploadModal onClose={() => setShowPdfModal(false)} onDone={loadLawJobs} />
      )}
      {showLawScrapeModal && (
        <LawScrapeModal prefill={lawScrapePortal} onClose={() => { setShowLawScrapeModal(false); setLawScrapePortal(null); }} onDone={loadLawJobs} />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.scraperMgmtTitle}</h2>
          <p className="text-muted text-sm mt-1">{T.scraperMgmtDesc}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'lawyers', label: 'Lawyer Scraper' },
          { key: 'laws', label: 'Law Knowledge Base' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Lawyer scraper tab ── */}
      {tab === 'lawyers' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> {T.addSource}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900 tracking-tight">{T.activeSources}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sources.map((source, idx) => {
                const isRunning = runningUrls.has(source.url);
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
                    </div>
                    <div className="mt-6 border-t border-gray-50 pt-4">
                      {isRunning ? (
                        <button disabled className="w-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed">
                          <Loader2 size={12} className="animate-spin" /> {T.running}
                        </button>
                      ) : source.status === 'Paused' ? (
                        <button
                          onClick={() => setSources((prev) => prev.map((s, i) => i === idx ? { ...s, status: 'Active', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' } : s))}
                          className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Play size={12} fill="currentColor" /> {T.resume}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRun(source)}
                          className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
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

          {/* Lawyer scrape logs */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-serif font-bold text-gray-900 tracking-tight">{T.runLogs}</h3>
              <button onClick={loadJobs} className="text-xs font-bold text-accent-dark hover:underline flex items-center gap-1">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <JobTable jobs={jobs} loading={jobsLoading} emptyText="No lawyer scrape jobs yet. Click Run on a source to start one." />
          </div>
        </>
      )}

      {/* ── Law KB tab ── */}
      {tab === 'laws' && (
        <>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowPdfModal(true)}
              className="border border-primary/30 text-primary hover:bg-primary/5 font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={16} /> Upload PDF
            </button>
            <button
              onClick={() => setShowLawScrapeModal(true)}
              className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Globe size={16} /> Scrape URL
            </button>
          </div>

          {/* Known portals */}
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-gray-900 tracking-tight">Law Portals</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {LAW_PORTALS.map((portal) => (
                <div key={portal.code} className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 mb-4">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-gray-900">{portal.title}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-1 truncate">{portal.url}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">{portal.domain}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">{portal.language.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-gray-50 pt-4">
                    <button
                      onClick={() => { setLawScrapePortal(portal); setShowLawScrapeModal(true); }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Globe size={12} /> Scrape This Portal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Law scrape logs */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-base font-serif font-bold text-gray-900 tracking-tight">Law Scrape Logs</h3>
              <button onClick={loadLawJobs} className="text-xs font-bold text-accent-dark hover:underline flex items-center gap-1">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {lawJobsLoading ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : lawJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm text-center py-10 text-sm text-gray-400">
                No law scrape jobs yet. Use &ldquo;Scrape URL&rdquo; or click a portal card above.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-gray-600">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 bg-[#FAFAFA] tracking-wider">
                        <th className="py-4 px-6 font-semibold">ID</th>
                        <th className="py-4 px-6 font-semibold">Law</th>
                        <th className="py-4 px-6 font-semibold">URL</th>
                        <th className="py-4 px-6 font-semibold">Started</th>
                        <th className="py-4 px-6 font-semibold">Duration</th>
                        <th className="py-4 px-6 font-semibold">Articles</th>
                        <th className="py-4 px-6 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                      {lawJobs.map((job) => {
                        const success = job.status === 'done';
                        const failed = job.status === 'failed';
                        return (
                          <tr key={job.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-4 px-6 font-mono text-gray-400">#{job.id}</td>
                            <td className="py-4 px-6 max-w-[160px] truncate">
                              <p className="font-semibold text-gray-800 truncate">{job.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{job.code}</p>
                            </td>
                            <td className="py-4 px-6 font-mono text-gray-500 max-w-[180px] truncate">{job.url}</td>
                            <td className="py-4 px-6 text-gray-400 font-normal">{fmtDate(job.created_at)}</td>
                            <td className="py-4 px-6 font-normal text-gray-500">{duration(job.created_at, job.finished_at)}</td>
                            <td className="py-4 px-6 font-normal text-gray-700">{job.articles_ingested > 0 ? job.articles_ingested : '—'}</td>
                            <td className="py-4 px-6 text-right">
                              {success ? (
                                <CheckCircle2 size={16} className="text-emerald-600 inline" />
                              ) : failed ? (
                                <XCircle size={16} className="text-red-500 inline" />
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">{job.status}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Shared job log table (lawyer scraper) ────────────────────────────────────

function JobTable({ jobs, loading, emptyText }) {
  if (loading) return <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>;
  if (jobs.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm text-center py-10 text-sm text-gray-400">{emptyText}</div>
  );
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold text-gray-600">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 bg-[#FAFAFA] tracking-wider">
              <th className="py-4 px-6 font-semibold">ID</th>
              <th className="py-4 px-6 font-semibold">Source URL</th>
              <th className="py-4 px-6 font-semibold">Started</th>
              <th className="py-4 px-6 font-semibold">Duration</th>
              <th className="py-4 px-6 font-semibold">Result</th>
              <th className="py-4 px-6 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
            {jobs.map((job) => {
              const success = job.status === 'done' || job.status === 'completed';
              const failed = job.status === 'failed';
              return (
                <tr key={job.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-gray-400">#{job.id}</td>
                  <td className="py-4 px-6 font-mono text-gray-600 max-w-[220px] truncate">{job.url}</td>
                  <td className="py-4 px-6 text-gray-400 font-normal">{fmtDate(job.created_at)}</td>
                  <td className="py-4 px-6 font-normal text-gray-500">{duration(job.created_at, job.finished_at)}</td>
                  <td className="py-4 px-6 text-gray-500 font-normal max-w-[160px] truncate">{job.result || '—'}</td>
                  <td className="py-4 px-6 text-right">
                    {success ? (
                      <CheckCircle2 size={16} className="text-emerald-600 inline" />
                    ) : failed ? (
                      <XCircle size={16} className="text-red-500 inline" />
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">{job.status}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
