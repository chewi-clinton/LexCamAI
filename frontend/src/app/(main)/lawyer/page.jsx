'use client';
import { useState } from 'react';
import { Search, MapPin, Briefcase, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const ALL_LAWYERS = [
  { id: 1, name: 'Maitre Paul Biya', location: 'Yaoundé', specialties: ['Corporate', 'Tax Law'], bio: 'Specializing in corporate restructuring and international tax compliance for businesses operating across Central Africa.', status: 'Verified' },
  { id: 2, name: 'Maitre Anne Etoga', location: 'Douala', specialties: ['Family Law', 'Civil Rights'], bio: 'Dedicated to protecting family rights, handling complex divorces, and advocating for civil liberties in the coastal region.', status: 'Verified' },
  { id: 3, name: 'Maitre Jean Ndi', location: 'Bamenda', specialties: ['Labour Law', 'Contracts'], bio: "Expert in employment disputes, contract negotiation, and worker's compensation claims with over 10 years of experience.", status: 'Pending' },
  { id: 4, name: 'Maitre Claire Mvondo', location: 'Douala', specialties: ['Criminal Law', 'Human Rights'], bio: 'Criminal defense attorney with a strong record in human rights litigation and constitutional law cases.', status: 'Verified' },
  { id: 5, name: 'Maitre Samuel Fon', location: 'Yaoundé', specialties: ['Real Estate', 'Corporate'], bio: 'Seasoned real estate and corporate law practitioner with deep expertise in land registration and property disputes.', status: 'Verified' },
  { id: 6, name: 'Maitre Rose Ekedi', location: 'Garoua', specialties: ['Family Law', 'Labour Law'], bio: 'Committed to protecting the rights of women and children through family law and workplace protection cases.', status: 'Pending' },
];

const CITIES = ['Douala', 'Yaoundé', 'Bamenda', 'Garoua', 'Buea'];
const DOMAINS = ['Corporate', 'Tax Law', 'Family Law', 'Civil Rights', 'Labour Law', 'Contracts', 'Criminal Law', 'Human Rights', 'Real Estate'];

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

  function applySearch() {
    setApplied({ query, city, domain });
    setCityOpen(false);
    setDomainOpen(false);
  }

  const filtered = ALL_LAWYERS.filter((l) => {
    if (applied.query && !l.name.toLowerCase().includes(applied.query.toLowerCase()) && !l.specialties.some((s) => s.toLowerCase().includes(applied.query.toLowerCase()))) return false;
    if (applied.city && l.location !== applied.city) return false;
    if (applied.domain && !l.specialties.includes(applied.domain)) return false;
    return true;
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
          <p className="text-xs text-gray-400 font-medium mb-6">{filtered.length} lawyer{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Directory Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">No lawyers match your search.</p>
              <p className="text-sm mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((lawyer) => (
                <div key={lawyer.id} className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 border border-gray-100 shadow-inner" />
                      <div>
                        <h3 className="font-serif text-xl font-bold text-primary leading-snug">{lawyer.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted font-medium mt-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{lawyer.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {lawyer.specialties.map((spec) => (
                        <span key={spec} className={`px-3 py-1 rounded-full text-xs font-medium ${domain === spec ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>{spec}</span>
                      ))}
                    </div>
                    <p className="text-muted text-sm leading-relaxed mb-8">{lawyer.bio}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50 mt-auto">
                    {lawyer.status === 'Verified' ? (
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
                    {lawyer.status === 'Verified' ? (
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
              ))}
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
