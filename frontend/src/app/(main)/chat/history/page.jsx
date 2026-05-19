'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Search, MessageSquare, ArrowRight, ChevronDown,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { chat as chatApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ConversationHistory() {
  const { lang } = useLanguage();
  const T = t[lang].chatHistory;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await chatApi.conversations();
        setConversations(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) =>
      (c.title ?? '').toLowerCase().includes(q) ||
      (c.summary ?? '').toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="chat" />

      <div className="flex-1 px-6 md:px-16 py-12">
        <div className="max-w-6xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={T.searchPlaceholder}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200/70 rounded-2xl shadow-sm p-6 animate-pulse">
                  <div className="flex justify-between mb-5">
                    <div className="h-4 bg-gray-200 rounded-full w-20" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="h-px bg-gray-100 mt-6 mb-4" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-6 w-6 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold">
                {query ? 'No conversations match your search.' : 'No conversations yet.'}
              </p>
              {!query && (
                <a href="/chat" className="mt-3 inline-block text-sm text-primary font-bold hover:underline">
                  Start your first consultation
                </a>
              )}
            </div>
          )}

          {/* Conversation cards */}
          {!loading && visible.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((conv) => (
                <a
                  key={conv.id}
                  href={`/chat?c=${conv.id}`}
                  className="bg-white border border-gray-200/70 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-5">
                      {conv.domain ? (
                        <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border-amber-200/60">
                          {conv.domain}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border-gray-200">
                          General
                        </span>
                      )}
                      <span className="text-gray-400 font-normal">{formatDate(conv.updated_at ?? conv.created_at)}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {conv.title ?? 'Untitled consultation'}
                      </h3>
                      {conv.summary && (
                        <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">{conv.summary}</p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-gray-50 pt-4 mt-6 flex items-center justify-between text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MessageSquare size={14} className="text-gray-400" />
                      <span>{conv.message_count ?? 0} {T.messages}</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary flex items-center justify-center transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && visibleCount < filtered.length && (
            <div className="pt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((n) => n + 9)}
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
