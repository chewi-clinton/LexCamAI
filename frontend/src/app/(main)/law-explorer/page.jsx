'use client';
import { useState } from 'react';
import { Search, BookOpen, Bot } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function LawExplorer() {
  const { lang } = useLanguage();
  const T = t[lang].lawExplorerPage;

  const categoryKeys = ['catAll', 'catLabour', 'catHousing', 'catFamily', 'catCriminal', 'catCommercial'];
  const [activeCategory, setActiveCategory] = useState('catAll');

  const articles = [
    {
      id: 1,
      category: 'Labour Code',
      reference: 'Art. 74',
      title: 'Termination of Employment',
      description: 'Explains the legal procedures for ending an employment contract, including required notice periods, severance pay calculation...',
    },
    {
      id: 2,
      category: 'Family Law',
      reference: 'Art. 212',
      title: 'Child Custody Rights',
      description: 'Outlines the primary considerations for awarding child custody in the event of divorce or separation, prioritizing the...',
    },
    {
      id: 3,
      category: 'Housing',
      reference: "Decree '08",
      title: 'Tenant Eviction Process',
      description: 'Details the mandatory steps a landlord must take to legally evict a tenant, including required formal notices,...',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header activePage="law-explorer" />

      <div className="py-16 px-6 md:px-16 flex-1">
        <div className="max-w-6xl mx-auto">

          {/* Header Block */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              {T.title}
            </h2>
            <p className="text-muted text-base leading-relaxed">
              {T.subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-surface rounded-full shadow-sm border border-gray-200/80 p-2 flex items-center justify-between gap-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="flex items-center gap-3 pl-4 flex-1">
                <Search className="text-gray-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder={T.searchPlaceholder}
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-base"
                />
              </div>
              <button className="bg-primary hover:bg-primary-light transition-colors text-white font-medium rounded-full px-8 py-3 text-sm md:text-base shadow-sm">
                {T.searchBtn}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">
              {T.categoriesLabel}
            </h3>
            <div className="flex flex-wrap gap-3">
              {categoryKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {T[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art, index) => (
              <div
                key={index}
                className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 text-xs font-medium">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                      {art.category}
                    </span>
                    <span className="text-accent-dark font-semibold">
                      {art.reference}
                    </span>
                  </div>

                  <h4 className="font-serif text-2xl font-bold text-primary mb-4 leading-tight">
                    {art.title}
                  </h4>
                  <p className="text-muted text-sm leading-relaxed mb-8">
                    {art.description}
                  </p>
                </div>

                <div className="space-y-3 mt-auto">
                  <a href={`/laws/${art.id}`} className="w-full border border-gray-200/80 bg-gray-50/50 text-gray-800 hover:bg-gray-100/70 transition-colors py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
                    <BookOpen size={16} />
                    {T.readFull}
                  </a>
                  <a href="/chat" className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm">
                    <Bot size={16} />
                    {T.askAI}
                  </a>
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
