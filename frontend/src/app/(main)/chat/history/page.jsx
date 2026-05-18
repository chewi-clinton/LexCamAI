'use client';
import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  Scale,
  Home,
  Briefcase,
  Users,
  Gavel,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function ConversationHistory() {
  const { lang } = useLanguage();
  const T = t[lang].chatHistory;
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const cards = [
    {
      category: 'Labor Law',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200/60',
      date: 'Oct 24, 2024',
      title: 'What are the mandatory severance pay...',
      description: 'According to the Cameroon Labor Code, severance pay is generally required for employees who have worked continuously...',
      messages: 4,
      icon: Scale,
    },
    {
      category: 'Housing',
      categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
      date: 'Oct 20, 2024',
      title: 'Procedure for registering a land title in Douala...',
      description: 'To register a land title, you must submit a dossier to the local land registry (Service des Domaines). This includes a stamped...',
      messages: 8,
      icon: Home,
    },
    {
      category: 'Corporate',
      categoryColor: 'bg-rose-50 text-rose-800 border-rose-200/60',
      date: 'Oct 15, 2024',
      title: 'Differences between SARL and SA under OHADA law...',
      description: 'Under the OHADA Uniform Act, a SARL (Société à Responsabilité Limitée) is typically suited for smaller businesses wit...',
      messages: 2,
      icon: Briefcase,
    },
    {
      category: 'Family Law',
      categoryColor: 'bg-orange-50 text-orange-800 border-orange-200/60',
      date: 'Oct 02, 2024',
      title: 'Requirements for civil marriage registration...',
      description: 'To register a civil marriage, both parties must present their birth certificates, national identity cards, and a certificate o...',
      messages: 6,
      icon: Users,
    },
    {
      category: 'Criminal',
      categoryColor: 'bg-red-50 text-red-800 border-red-200/60',
      date: 'Sep 28, 2024',
      title: 'Rights during police detention maximum...',
      description: 'Under the Cameroon Criminal Procedure Code, police custody (garde à vue) cannot generally exceed 48 hours, renewable...',
      messages: 3,
      icon: Gavel,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="chat" />

      <div className="flex-1 px-6 md:px-16 py-12">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Top Control Bar with Title & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
                {T.title}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {T.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={T.searchPlaceholder}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
                />
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`border font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors ${filterOpen ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
              >
                <SlidersHorizontal size={16} className={filterOpen ? 'text-primary' : 'text-gray-500'} /> {T.filter}
              </button>
            </div>
          </div>

          {/* Dashboard Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.slice(0, visibleCount).map((card, idx) => {
              const Icon = card.icon;
              return (
                <a key={idx} href="/chat" className="bg-white border border-gray-200/70 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer">
                  <div>
                    {/* Meta Label Row */}
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${card.categoryColor}`}>
                        {card.category}
                      </span>
                      <span className="text-gray-400 font-normal">{card.date}</span>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-5 space-y-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Lower Action Row */}
                  <div className="border-t border-gray-50 pt-4 mt-6 flex items-center justify-between text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MessageSquare size={14} className="text-gray-400" />
                      <span>{card.messages} {T.messages}</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary flex items-center justify-center transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Load More */}
          {visibleCount < cards.length && (
            <div className="pt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount(visibleCount + 5)}
                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 px-6 rounded-full flex items-center gap-2 shadow-sm transition-colors"
              >
                {T.loadMore} <ChevronDown size={14} className="text-gray-400" />
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
