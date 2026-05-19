'use client';
import { useState, useEffect } from 'react';
import { Search, BookOpen, Bot, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const DOMAIN_MAP = {
  catAll:        null,
  catLabour:     'labor',
  catHousing:    'housing',
  catFamily:     'family',
  catCriminal:   'criminal',
  catCommercial: 'commercial',
};

async function fetchArticles({ domain, query } = {}) {
  if (query && query.trim()) {
    const res = await fetch('/api/kb/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), limit: 20, ...(domain ? { domain } : {}) }),
    });
    if (!res.ok) throw new Error('Search failed');
    const hits = await res.json();
    return hits.map((h) => ({
      id: h.article_id,
      category: h.law_name,
      reference: h.article_number,
      title: h.title ?? h.article_number,
      description: h.text_preview,
      domain: h.domain,
    }));
  }

  const params = new URLSearchParams();
  if (domain) params.set('domain', domain);
  const res = await fetch(`/api/kb/articles?${params}`);
  if (!res.ok) throw new Error('Failed to load articles');
  const items = await res.json();
  return items.map((a) => ({
    id: a.id,
    category: a.document_name ?? a.document_code,
    reference: a.article_number,
    title: a.title ?? a.article_number,
    description: null,
    domain: a.domain,
  }));
}

export default function LawExplorer() {
  const { lang } = useLanguage();
  const T = t[lang].lawExplorerPage;

  const categoryKeys = ['catAll', 'catLabour', 'catHousing', 'catFamily', 'catCriminal', 'catCommercial'];
  const [activeCategory, setActiveCategory] = useState('catAll');
  const [searchInput, setSearchInput] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(categoryKey, query = '') {
    setLoading(true);
    setError('');
    try {
      const domain = DOMAIN_MAP[categoryKey];
      const data = await fetchArticles({ domain, query });
      setArticles(data);
    } catch {
      setError('Could not load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load('catAll'); }, []);

  function handleCategoryChange(key) {
    setActiveCategory(key);
    setSearchInput('');
    load(key);
  }

  function handleSearch(e) {
    e.preventDefault();
    load(activeCategory, searchInput);
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header activePage="law-explorer" />

      <div className="py-16 px-6 md:px-16 flex-1">
        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">{T.title}</h2>
            <p className="text-muted text-base leading-relaxed">{T.subtitle}</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-16">
            <div className="bg-surface rounded-full shadow-sm border border-gray-200/80 p-2 flex items-center justify-between gap-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="flex items-center gap-3 pl-4 flex-1">
                <Search className="text-gray-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={T.searchPlaceholder}
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-base"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-light transition-colors text-white font-medium rounded-full px-8 py-3 text-sm md:text-base shadow-sm"
              >
                {T.searchBtn}
              </button>
            </div>
          </form>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">
              {T.categoriesLabel}
            </h3>
            <div className="flex flex-wrap gap-3">
              {categoryKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key)}
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

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-red-500 text-sm py-12">{error}</p>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="text-center text-muted text-sm py-12">
              {lang === 'fr' ? 'Aucun article trouvé.' : 'No articles found.'}
            </p>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6 text-xs font-medium">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 truncate max-w-[65%]">
                        {art.category}
                      </span>
                      <span className="text-accent-dark font-semibold">{art.reference}</span>
                    </div>
                    <h4 className="font-serif text-xl font-bold text-primary mb-4 leading-tight">
                      {art.title}
                    </h4>
                    {art.description && (
                      <p className="text-muted text-sm leading-relaxed mb-8 line-clamp-4">
                        {art.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mt-auto">
                    <a
                      href={`/laws/${art.id}`}
                      className="w-full border border-gray-200/80 bg-gray-50/50 text-gray-800 hover:bg-gray-100/70 transition-colors py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <BookOpen size={16} />
                      {T.readFull}
                    </a>
                    <a
                      href="/chat"
                      className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
                    >
                      <Bot size={16} />
                      {T.askAI}
                    </a>
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
