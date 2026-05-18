'use client';
import React, { useState } from 'react';
import {
  ChevronRight,
  Lightbulb,
  MessageSquareShare,
  FileText,
  Bookmark,
  Share2,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function LaborCodeArticleView() {
  const { lang } = useLanguage();
  const T = t[lang].laws;
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="law-explorer" />

      <div className="flex-1 py-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb Navigation Strip */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 select-none">
            <a href="/law-explorer" className="hover:text-primary transition-colors">Law Explorer</a>
            <ChevronRight size={12} className="text-gray-400" />
            <a href="/law-explorer" className="hover:text-primary transition-colors">Labor Code</a>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-gray-800 font-bold">Article 34</span>
          </nav>

          {/* Dynamic Inner Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Article Text & Content Workspace */}
            <div className="lg:col-span-8 space-y-6">

              {/* Header Identity Information Block */}
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 bg-[#EAF2ED] text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Labor Code of Cameroon (1992)
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Article 34: Severance Pay
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  Last updated: August 14, 1992
                </p>
              </div>

              {/* Plain Language Summary Highlight Box */}
              <div className="bg-[#EAF2ED] border border-primary/10 rounded-2xl p-6 md:p-8 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-primary/5 text-primary flex-shrink-0 shadow-sm">
                  <Lightbulb size={18} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-lg font-bold text-primary">{T.plainSummaryLabel}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    If you are fired after working for a company for more than two years, you are usually entitled to receive severance pay. This money helps support you while you look for a new job. The exact amount depends on how long you worked there and your salary. You do not get severance pay if you quit voluntarily or if you were fired for &ldquo;gross misconduct&rdquo; (a very serious mistake).
                  </p>
                </div>
              </div>

              {/* Official Legislative Text Documentation Block */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-6">
                <h3 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                  {T.officialText}
                </h3>
                <div className="text-sm text-gray-800 leading-relaxed font-medium space-y-6">
                  <p>
                    (1) In the event of breach of a contract of employment of unspecified duration by the employer, severance pay shall be granted to the worker who has completed a period of continuous service equal to at least two years.
                  </p>
                  <p>
                    (2) Severance pay shall not be due if the worker is dismissed for serious misconduct.
                  </p>
                  <p>
                    (3) The conditions for the award and calculation of severance pay shall be fixed by decree issued after consultation with the National Labour Advisory Board.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Utilities Sidebar Pane */}
            <div className="lg:col-span-4 space-y-6">

              {/* Action Widget 1: Ask AI Tool */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#A36E1E] flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <MessageSquareShare size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900">{T.askAITitle}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                      {T.askAIDesc}
                    </p>
                  </div>
                </div>
                <a
                  href="/chat"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {T.consultAI} <ArrowRight size={14} />
                </a>
              </div>

              {/* Action Widget 2: Form Template Generation Tool */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center flex-shrink-0 border border-emerald-100/30">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900">{T.relatedDocs}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                      {T.relatedDocsDesc}
                    </p>
                  </div>
                </div>
                <a
                  href="/documents"
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {T.generateTemplate}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-0.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </a>
              </div>

              {/* Action Widget 3: Bookmarking & Distribution Controls */}
              <div className="grid grid-cols-2 gap-3 select-none">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`border rounded-lg p-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors ${saved ? 'bg-primary/5 border-primary text-primary' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                >
                  <Bookmark size={14} className={saved ? 'fill-primary text-primary' : 'text-gray-400'} />
                  {saved ? T.saved : T.save}
                </button>
                <button
                  onClick={() => { if (navigator.share) { navigator.share({ title: 'Article 34', url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); } }}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg p-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Share2 size={14} className="text-gray-400" /> {T.share}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
