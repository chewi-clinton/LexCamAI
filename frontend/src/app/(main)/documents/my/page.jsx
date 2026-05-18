'use client';
import { useState } from 'react';
import {
  FileText, Download, CreditCard, RefreshCw,
  Loader2, AlertCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function MyDocuments() {
  const { lang } = useLanguage();
  const T = t[lang].myDocuments;

  const filterKeys = ['filterAll', 'filterAwaiting', 'filterGenerating', 'filterReady', 'filterFailed'];
  const [activeFilter, setActiveFilter] = useState('filterAll');

  const documents = [
    {
      name: 'Non-Disclosure Agreement',
      date: 'Oct 24, 2024',
      status: T.filterReady,
      statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      iconBg: 'bg-emerald-50 text-emerald-600',
      type: 'ready',
    },
    {
      name: 'Employment Contract',
      date: 'Oct 26, 2024',
      status: T.filterGenerating,
      statusStyle: 'bg-orange-50 text-orange-700 border-orange-200/60',
      iconBg: 'bg-gray-100 text-gray-500',
      type: 'generating',
    },
    {
      name: 'Commercial Lease Agreement',
      date: 'Oct 27, 2024',
      status: T.filterAwaiting,
      statusStyle: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-gray-100 text-gray-500',
      type: 'payment',
    },
    {
      name: 'Memorandum of Understanding',
      date: 'Oct 22, 2024',
      status: T.filterFailed,
      statusStyle: 'bg-red-50 text-red-700 border-red-200/60',
      cardStyle: 'border-red-100/80 bg-red-50/10',
      iconBg: 'bg-red-50 text-red-600',
      type: 'failed',
    },
  ];

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

          {/* Document Cards */}
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className={`bg-white border border-gray-200/70 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow hover:shadow-md ${doc.cardStyle || ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg border border-gray-100/40 flex items-center justify-center flex-shrink-0 shadow-inner ${doc.iconBg}`}>
                    {doc.type === 'failed' ? <AlertCircle size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900 leading-snug">{doc.name}</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{T.updated} {doc.date}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-gray-50 sm:border-t-0 pt-3 sm:pt-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${doc.statusStyle}`}>
                    {doc.type === 'generating' && <Loader2 size={10} className="animate-spin" />}
                    {doc.status}
                  </span>

                  <div className="flex items-center justify-end flex-1 sm:flex-none">
                    {doc.type === 'ready' && (
                      <button className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors">
                        <Download size={14} /> {T.downloadPdf}
                      </button>
                    )}
                    {doc.type === 'generating' && (
                      <button disabled className="border border-gray-200 bg-gray-50 text-gray-400 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none">
                        <Loader2 size={14} className="animate-spin" /> {T.processing}
                      </button>
                    )}
                    {doc.type === 'payment' && (
                      <a
                        href="/documents/unpaid-wages/pay"
                        className="border border-primary text-primary bg-white hover:bg-primary/5 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CreditCard size={14} /> {T.payNow}
                      </a>
                    )}
                    {doc.type === 'failed' && (
                      <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                        <RefreshCw size={14} className="text-gray-500" /> {T.retry}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
