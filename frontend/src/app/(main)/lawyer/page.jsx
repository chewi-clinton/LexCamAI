'use client';
import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Briefcase, CheckCircle2, Clock, ChevronDown, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { lawyers as lawyersApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function initials(name) {
  return (name ?? '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function LawyerDirectory() {
  const { lang } = useLanguage();
  const T = t[lang].lawyer;

  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [domain, setDomain] = useState('');
  const [applied, setApplied] = useState({ query: '', city: '', domain: '' });
  const [cityOpen, setCityOpen] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [lawyerList, setLawyerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const CITIES = useMemo(() => [...new Set(lawyerList.map((l) => l.city).filter(Boolean))].sort(), [lawyerList]);
  const DOMAINS = useMemo(() => [...new Set(lawyerList.flatMap((l) => l.specializations.map((s) => s.name)))].sort(), [lawyerList]);

  useEffect(() => { load({}); }, []);

  async function load(params) {
    setLoading(true);
    setError('');
    try {
      const data = await lawyersApi.list(params);
      setLawyerList(data);
    } catch {
      setError('Failed to load lawyers. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function applySearch() {
    setApplied({ query, city, domain });
    setCityOpen(false);
    setDomainOpen(false);
    load({
      ...(city   ? { city }                    : {}),
      ...(domain ? { specialization: domain }  : {}),
    });
  }

  const filtered = lawyerList.filter((l) => {
    if (!applied.query) return true;
    const q = applied.query.toLowerCase();
    return l.full_name.toLowerCase().includes(q) || l.specializations.some((s) => s.name.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col" onClick={() => { setCityOpen(false); setDomainOpen(false); }}>
      <Header activePage="lawyers" />

      <div className="py-16 px-6 md:px-16 flex-1">
        <div className="max-w-6xl mx-auto">

          {/* Header Block with View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-primary mb-2">{T.title}</h2>
              <p className="text-muted text-sm md:text-base">{T.subtitle}</p>
            </div>
            <div className="bg-gray-200/60 p-1 rounded-lg flex items-center self-start text-sm font-medium border border-gray-300/30">
              <button onClick={() => setView('grid')} className={`px-4 py-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-surface text-gray-900 shadow-sm' : 'text-muted hover:text-gray-900'}`}>{T.grid}</button>
              <button onClick={() => setView('map')} className={`px-4 py-1.5 rounded-md transition-all ${view === 'map' ? 'bg-surface text-gray-900 shadow-sm' : 'text-muted hover:text-gray-900'}`}>{T.map}</button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-surface rounded-2xl md:rounded-full shadow-sm border border-gray-200/80 p-3 mb-12">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">

              <div className="flex items-center gap-3 pl-3 flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-3 lg:pb-0">
                <Search className="text-gray-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  placeholder={T.searchPlaceholder}
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-base"
                />
              </div>

              {/* City dropdown */}
              <div className="relative border-b lg:border-b-0 lg:border-r border-gray-100" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { setCityOpen((o) => !o); setDomainOpen(false); }}
                  className="flex items-center justify-between px-3 py-2 lg:py-0 cursor-pointer text-gray-700 hover:text-gray-900 min-w-[160px] w-full"
                >
                  <div className="flex items-center gap-2 text-sm md:text-base">
                    <MapPin size={18} className="text-gray-400" />
                    <span className={city ? 'text-gray-900 font-medium' : ''}>{city || T.allCities}</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
                </button>
                {cityOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[180px] py-1 overflow-hidden">
                    <button onClick={() => { setCity(''); setCityOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!city ? 'font-bold text-primary' : 'text-gray-700'}`}>{T.allCities}</button>
                    {CITIES.map((c) => (
                      <button key={c} onClick={() => { setCity(c); setCityOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${city === c ? 'font-bold text-primary' : 'text-gray-700'}`}>{c}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Domain dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { setDomainOpen((o) => !o); setCityOpen(false); }}
                  className="flex items-center justify-between px-3 py-2 lg:py-0 cursor-pointer text-gray-700 hover:text-gray-900 min-w-[180px] w-full"
                >
                  <div className="flex items-center gap-2 text-sm md:text-base">
                    <Briefcase size={18} className="text-gray-400" />
                    <span className={domain ? 'text-gray-900 font-medium' : ''}>{domain || T.allDomains}</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${domainOpen ? 'rotate-180' : ''}`} />
                </button>
                {domainOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[200px] py-1 overflow-hidden">
                    <button onClick={() => { setDomain(''); setDomainOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!domain ? 'font-bold text-primary' : 'text-gray-700'}`}>{T.allDomains}</button>
                    {DOMAINS.map((d) => (
                      <button key={d} onClick={() => { setDomain(d); setDomainOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${domain === d ? 'font-bold text-primary' : 'text-gray-700'}`}>{d}</button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={applySearch}
                className="bg-primary hover:bg-primary-light transition-colors text-white font-medium rounded-xl lg:rounded-full px-8 py-3.5 text-sm md:text-base shadow-sm"
              >
                {T.search}
              </button>

            </div>
          </div>

          {/* Active filter chips */}
          {(applied.city || applied.domain || applied.query) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 -mt-6">
              <span className="text-xs text-gray-400 font-medium">Filters:</span>
              {applied.query && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">&quot;{applied.query}&quot;</span>}
              {applied.city && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{applied.city}</span>}
              {applied.domain && <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{applied.domain}</span>}
              <button onClick={() => { setApplied({ query: '', city: '', domain: '' }); setQuery(''); setCity(''); setDomain(''); }} className="text-xs text-gray-400 hover:text-gray-600 font-bold underline">Clear all</button>
            </div>
          )}

          {/* Results count */}
          {!loading && !error && (
            <p className="text-xs text-gray-400 font-medium mb-6">{filtered.length} lawyer{filtered.length !== 1 ? 's' : ''} found</p>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold text-red-500">{error}</p>
              <button onClick={() => load({})} className="mt-4 text-sm text-primary font-bold hover:underline">Try again</button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 animate-pulse">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                    <div className="h-6 bg-gray-200 rounded-full w-24" />
                  </div>
                  <div className="space-y-2 mb-8">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-4/6" />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-50">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-9 bg-gray-200 rounded-lg w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Directory Grid */}
          {!loading && !error && (filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">No lawyers match your search.</p>
              <p className="text-sm mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((lawyer) => {
                const verified = lawyer.verification_status === 'verified';
                const specs = lawyer.specializations ?? [];
                return (
                  <div key={lawyer.id} className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        {lawyer.profile_photo_url ? (
                          <img src={lawyer.profile_photo_url} alt={lawyer.full_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex-shrink-0 border border-gray-100 flex items-center justify-center text-primary font-bold text-lg">
                            {initials(lawyer.full_name)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-serif text-xl font-bold text-primary leading-snug">{lawyer.full_name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted font-medium mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{lawyer.city}{lawyer.region ? `, ${lawyer.region}` : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {specs.map((s) => (
                          <span key={s.id ?? s.name} className={`px-3 py-1 rounded-full text-xs font-medium ${applied.domain === s.name ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>{s.name}</span>
                        ))}
                      </div>
                      <p className="text-muted text-sm leading-relaxed mb-8 line-clamp-3">{lawyer.bio}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50 mt-auto">
                      {verified ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 size={16} className="fill-emerald-800 text-white" />
                          <span>{T.verified}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                          <Clock size={16} />
                          <span>{T.pending}</span>
                        </div>
                      )}
                      {verified ? (
                        <a href={`/lawyer/${lawyer.id}`} className="px-5 py-2.5 rounded-lg border font-bold text-sm transition-colors border-primary text-primary hover:bg-primary/5">
                          {T.contact}
                        </a>
                      ) : (
                        <button disabled className="px-5 py-2.5 rounded-lg border font-bold text-sm border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed">
                          {T.contact}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>

      <Footer />
    </div>
  );
}
