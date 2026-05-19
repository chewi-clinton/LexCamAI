'use client';
import { useState, useEffect } from 'react';
import {
  FileText, Download, CreditCard, RefreshCw,
  Loader2, AlertCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { documents as documentsApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const STATUS_MAP = {
  ready:            'filterReady',
  generating:       'filterGenerating',
  awaiting_payment: 'filterAwaiting',
  failed:           'filterFailed',
};

function statusStyle(status) {
  switch (status) {
    case 'ready':            return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    case 'generating':       return 'bg-orange-50 text-orange-700 border-orange-200/60';
    case 'awaiting_payment': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'failed':           return 'bg-red-50 text-red-700 border-red-200/60';
    default:                 return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function iconStyle(status) {
  switch (status) {
    case 'ready':   return 'bg-emerald-50 text-emerald-600';
    case 'failed':  return 'bg-red-50 text-red-600';
    default:        return 'bg-gray-100 text-gray-500';
  }
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyDocuments() {
  const { lang } = useLanguage();
  const T = t[lang].myDocuments;

  const filterKeys = ['filterAll', 'filterAwaiting', 'filterGenerating', 'filterReady', 'filterFailed'];
  const [activeFilter, setActiveFilter] = useState('filterAll');
  const [docList, setDocList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await documentsApi.myDocs();
      setDocList(data);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(doc) {
    if (doc.download_url) {
      window.open(doc.download_url, '_blank');
      return;
    }
    try {
      const result = await documentsApi.download(doc.id);
      if (result?.url) window.open(result.url, '_blank');
    } catch { /* silent */ }
  }

  async function handleRetry(doc) {
    try {
      await documentsApi.generate(doc.slug, {});
      load();
    } catch { /* silent */ }
  }

  const filtered = activeFilter === 'filterAll'
    ? docList
    : docList.filter((d) => STATUS_MAP[d.status] === activeFilter);

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="documents" />

      <div className="flex-1 px-6 md:px-16 py-12">
        <div className="max-w-5xl mx-auto space-y-8">

          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
          </div>

          {/* Filter Pills */}
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-xl p-3 flex flex-wrap items-center gap-2 select-none">
            {filterKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {T[key]}
              </button>
            ))}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200/70 rounded-xl p-5 shadow-sm animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/5" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded-lg w-24" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-red-500 font-semibold text-sm">{error}</p>
              <button onClick={load} className="mt-3 text-sm text-primary font-bold hover:underline">Try again</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FileText size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No documents found.</p>
              {activeFilter !== 'filterAll' && (
                <button onClick={() => setActiveFilter('filterAll')} className="mt-2 text-xs text-primary font-bold hover:underline">Show all</button>
              )}
            </div>
          )}

          {/* Document Cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-white border border-gray-200/70 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow hover:shadow-md ${doc.status === 'failed' ? 'border-red-100/80 bg-red-50/10' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg border border-gray-100/40 flex items-center justify-center flex-shrink-0 shadow-inner ${iconStyle(doc.status)}`}>
                      {doc.status === 'failed' ? <AlertCircle size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-900 leading-snug">{doc.title}</h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{T.updated} {formatDate(doc.created_at ?? doc.updated_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-gray-50 sm:border-t-0 pt-3 sm:pt-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusStyle(doc.status)}`}>
                      {doc.status === 'generating' && <Loader2 size={10} className="animate-spin" />}
                      {T[STATUS_MAP[doc.status]] ?? doc.status}
                    </span>

                    <div className="flex items-center justify-end flex-1 sm:flex-none">
                      {doc.status === 'ready' && (
                        <button
                          onClick={() => handleDownload(doc)}
                          className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Download size={14} /> {T.downloadPdf}
                        </button>
                      )}
                      {doc.status === 'generating' && (
                        <button disabled className="border border-gray-200 bg-gray-50 text-gray-400 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none">
                          <Loader2 size={14} className="animate-spin" /> {T.processing}
                        </button>
                      )}
                      {doc.status === 'awaiting_payment' && (
                        <a
                          href={`/documents/${doc.slug ?? 'unpaid-wages'}/pay`}
                          onClick={() => {
                            sessionStorage.setItem('pending_payment_doc', JSON.stringify({
                              id: doc.id, title: doc.title, price: doc.price ?? 5000, currency: 'XAF', slug: doc.slug,
                            }));
                          }}
                          className="border border-primary text-primary bg-white hover:bg-primary/5 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CreditCard size={14} /> {T.payNow}
                        </a>
                      )}
                      {doc.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(doc)}
                          className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <RefreshCw size={14} className="text-gray-500" /> {T.retry}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
