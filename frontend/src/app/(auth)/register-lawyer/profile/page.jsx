'use client';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X, ArrowLeft, ArrowRight, Plus, Camera, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GavelIcon from '@/components/ui/GavelIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';
import { lawyers as lawyersApi } from '@/lib/api';

const CITIES = ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Buea'];

export default function ProfessionalProfile() {
  const router = useRouter();
  const { lang } = useLanguage();
  const T = t[lang].registerLawyer;

  const [city, setCity]                   = useState('');
  const [domains, setDomains]             = useState([]);
  const [domainSearch, setDomainSearch]   = useState('');
  const [showDomainDrop, setShowDomainDrop] = useState(false);
  const [bio, setBio]                     = useState('');
  const [error, setError]                 = useState('');
  const [allDomains, setAllDomains]       = useState([]);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const photoInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    lawyersApi.specializations().then(setAllDomains).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDomainDrop(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Photo must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhotoPreview(dataUrl);
      sessionStorage.setItem('lawyer_photo', dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const trimmed = domainSearch.trim();
  const suggestions = allDomains.filter(
    (d) => !domains.includes(d.name) && d.name.toLowerCase().includes(trimmed.toLowerCase()),
  );
  const canAddCustom = trimmed.length > 1 &&
    !domains.includes(trimmed) &&
    !allDomains.some((d) => d.name.toLowerCase() === trimmed.toLowerCase());

  function addDomain(name) {
    if (domains.length >= 5 || !name.trim()) return;
    setDomains((prev) => [...prev, name.trim()]);
    setDomainSearch('');
    setShowDomainDrop(false);
  }

  function removeDomain(d) {
    setDomains((prev) => prev.filter((x) => x !== d));
  }

  function handleDomainKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length === 1) addDomain(suggestions[0].name);
      else if (canAddCustom) addDomain(trimmed);
    }
  }

  function handleContinue(e) {
    e.preventDefault();
    if (!city) { setError('Please select your primary city.'); return; }
    if (domains.length === 0) { setError('Please select at least one practice domain.'); return; }
    sessionStorage.setItem('lawyer_profile', JSON.stringify({ city, specializations: domains, bio }));
    router.push('/verify-email');
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-between pb-12">

      <header className="w-full bg-white border-b border-gray-200/60 py-4 px-6 md:px-16 flex items-center justify-between sticky top-0 z-20">
        <a href="/" className="font-serif text-xl font-bold text-primary tracking-wide flex items-center gap-2">
          <GavelIcon size={22} />
          LexCam
        </a>
        <a href="/" className="inline-flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors">
          <X size={16} />
          {T.saveExit}
        </a>
      </header>

      <main className="max-w-4xl w-full px-6 mt-10 flex-1 flex flex-col items-center">

        {/* Stepper */}
        <div className="w-full max-w-2xl mb-12 relative flex items-center justify-between">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div className="absolute top-4 left-0 w-1/2 h-0.5 bg-primary -z-10" />
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary shadow-sm text-xs">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="text-[11px] font-bold text-gray-700 mt-2">{T.accountDetails}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white ring-2 ring-primary shadow-sm font-bold text-xs">2</div>
            <span className="text-[11px] font-bold text-primary-dark mt-2">{T.professionalProfile}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-white text-gray-400 border-2 border-gray-200 flex items-center justify-center font-bold text-xs">3</div>
            <span className="text-[11px] font-bold text-gray-400 mt-2">{T.stepVerification}</span>
          </div>
        </div>

        <div className="bg-surface w-full rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-primary mb-3">{T.professionalProfile}</h2>
          <p className="text-muted text-sm leading-relaxed mb-8">{T.profileDesc}</p>

          <form className="space-y-6" onSubmit={handleContinue} autoComplete="off">

            {/* Profile Photo — optional */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-light transition-colors border-2 border-white"
                >
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <p className="text-[11px] text-gray-400 font-medium">
                Profile photo <span className="text-gray-300">· optional · max 2 MB</span>
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {T.primaryCity} <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg border border-gray-300 shadow-sm bg-white cursor-pointer">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full pl-4 pr-10 py-3 bg-transparent rounded-lg text-sm text-gray-700 appearance-none outline-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>{T.selectCity}</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Practice Domains */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {T.practiceDomains} <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-muted font-medium">{domains.length}/5 · {T.selectUpTo5}</span>
              </div>
              <div className="relative" ref={dropRef}>
                <div className="rounded-lg border border-gray-300 bg-white p-2 flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary min-h-[48px]">
                  {domains.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded bg-[#EAF2ED] text-xs font-medium text-emerald-800 border border-emerald-100">
                      {d}
                      <button type="button" onClick={() => removeDomain(d)} className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {domains.length < 5 && (
                    <input
                      type="text"
                      value={domainSearch}
                      onChange={(e) => { setDomainSearch(e.target.value); setShowDomainDrop(true); }}
                      onFocus={() => setShowDomainDrop(true)}
                      onKeyDown={handleDomainKeyDown}
                      placeholder={domains.length === 0 ? (T.searchDomains ?? 'Search or type a domain…') : ''}
                      className="flex-1 min-w-[160px] bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none px-2 py-1"
                    />
                  )}
                  <div className="absolute right-3.5 top-3 text-gray-400 pointer-events-none">
                    <Search size={16} />
                  </div>
                </div>
                {showDomainDrop && (suggestions.length > 0 || canAddCustom) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 max-h-52 overflow-y-auto">
                    {suggestions.map((d) => (
                      <button key={d.id} type="button" onMouseDown={() => addDomain(d.name)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2">
                        {d.name}
                        <span className="ml-auto text-[10px] text-gray-400">{d.name_fr}</span>
                      </button>
                    ))}
                    {canAddCustom && (
                      <button type="button" onMouseDown={() => addDomain(trimmed)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 text-primary font-semibold transition-colors flex items-center gap-2 border-t border-gray-100">
                        <Plus size={14} />
                        Add &ldquo;{trimmed}&rdquo; as custom domain
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Don&apos;t see your domain? Type it and press Enter or click &ldquo;Add&rdquo; to create a custom one.
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-bold text-gray-700">{T.professionalBio}</label>
                <span className={`text-[10px] font-medium tracking-wider ${bio.length >= 450 ? 'text-orange-500' : 'text-muted'}`}>{bio.length} / 500</span>
              </div>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={T.bioPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-shadow leading-relaxed"
                maxLength={500}
              />
              <p className="text-[11px] text-gray-400 mt-2 font-medium">{T.bioHint}</p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

          </form>
        </div>
      </main>

      <footer className="w-full max-w-3xl px-6 mt-8 flex items-center justify-between border-t border-gray-100 pt-6 bg-background">
        <a href="/register-lawyer" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg">
          <ArrowLeft size={16} />
          {T.back}
        </a>
        <button
          onClick={handleContinue}
          className="bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-8 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 shadow-sm"
        >
          {T.continueVerification}
          <ArrowRight size={16} />
        </button>
      </footer>

    </div>
  );
}
