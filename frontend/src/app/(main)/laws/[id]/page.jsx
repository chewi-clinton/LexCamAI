'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Lightbulb, MessageSquareShare, FileText,
  Bookmark, Share2, ArrowRight, Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const DOMAIN_LABEL = {
  labor: 'Labour Code',
  housing: 'Housing & Land Law',
  family: 'Family Law',
  criminal: 'Penal Code',
  commercial: 'Commercial Law',
  general: 'General Law',
};

export default function ArticleView() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const T = t[lang].laws;
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/kb/articles/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { setArticle(data); setLoading(false); })
      .catch(() => { setError('Article not found.'); setLoading(false); });
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="law-explorer" />

      <div className="flex-1 py-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">

          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 select-none">
            <a href="/law-explorer" className="hover:text-primary transition-colors">Law Explorer</a>
            <ChevronRight size={12} className="text-gray-400" />
            {article && (
              <>
                <span className="hover:text-primary transition-colors">
                  {DOMAIN_LABEL[article.domain] ?? article.domain}
                </span>
                <ChevronRight size={12} className="text-gray-400" />
                <span className="text-gray-800 font-bold">{article.article_number}</span>
              </>
            )}
          </nav>

          {loading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-red-500 py-24">{error}</p>
          )}

          {!loading && !error && article && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              <div className="lg:col-span-8 space-y-6">

                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 bg-[#EAF2ED] text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {article.document_name ?? article.document_code}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                    {article.article_number}{article.title ? `: ${article.title}` : ''}
                  </h2>
                  {article.chapter && (
                    <p className="text-xs text-gray-400 font-medium">Chapter: {article.chapter}</p>
                  )}
                </div>

                {article.plain_summary && (
                  <div className="bg-[#EAF2ED] border border-primary/10 rounded-2xl p-6 md:p-8 flex gap-4 items-start shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-primary/5 text-primary flex-shrink-0 shadow-sm">
                      <Lightbulb size={18} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-serif text-lg font-bold text-primary">{T.plainSummaryLabel}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {article.plain_summary}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-6">
                  <h3 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                    {T.officialText}
                  </h3>
                  <div className="text-sm text-gray-800 leading-relaxed font-medium space-y-4">
                    {article.full_text.split('\n').filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

              </div>

              <div className="lg:col-span-4 space-y-6">

                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#A36E1E] flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <MessageSquareShare size={16} />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-900">{T.askAITitle}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{T.askAIDesc}</p>
                    </div>
                  </div>
                  <a
                    href={`/chat?q=${encodeURIComponent(`Explain this law to me: ${article.article_number}${article.title ? ' — ' + article.title : ''} from ${article.document_name ?? article.document_code ?? 'Cameroonian Law'}`)}`}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    {T.consultAI} <ArrowRight size={14} />
                  </a>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center flex-shrink-0 border border-emerald-100/30">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-900">{T.relatedDocs}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{T.relatedDocsDesc}</p>
                    </div>
                  </div>
                  <a
                    href={
                      article.domain === 'labor' ? '/documents/unpaid-wages'
                      : article.domain === 'housing' ? '/documents/housing-dispute'
                      : '/documents'
                    }
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    {T.generateTemplate}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 select-none">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`border rounded-lg p-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors ${saved ? 'bg-primary/5 border-primary text-primary' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    <Bookmark size={14} className={saved ? 'fill-primary text-primary' : 'text-gray-400'} />
                    {saved ? T.saved : T.save}
                  </button>
                  <button
                    onClick={async () => {
                      if (sharing) return;
                      if (navigator.share) {
                        setSharing(true);
                        try {
                          await navigator.share({ title: article.title ?? article.article_number, url: window.location.href });
                        } catch { /* user cancelled */ }
                        finally { setSharing(false); }
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    disabled={sharing}
                    className="bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 border border-gray-200 rounded-lg p-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Share2 size={14} className="text-gray-400" /> {T.share}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
