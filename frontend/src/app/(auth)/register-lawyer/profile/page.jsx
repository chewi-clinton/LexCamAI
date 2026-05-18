'use client';
import { Check, ChevronDown, Search, X, ArrowLeft, ArrowRight } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function ProfessionalProfile() {
  const { lang } = useLanguage();
  const T = t[lang].registerLawyer;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-between pb-12">

      {/* Header */}
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

        {/* Node Stepper */}
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
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white ring-2 ring-primary shadow-sm font-bold text-xs">
              2
            </div>
            <span className="text-[11px] font-bold text-primary-dark mt-2">{T.professionalProfile}</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-white text-gray-400 border-2 border-gray-200 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span className="text-[11px] font-bold text-gray-400 mt-2">{T.stepVerification}</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface w-full rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-primary mb-3">
            {T.professionalProfile}
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-8">
            {T.profileDesc}
          </p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

            {/* City + Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {T.primaryCity} <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg border border-gray-300 shadow-sm bg-white cursor-pointer">
                  <select
                    className="block w-full pl-4 pr-10 py-3 bg-transparent rounded-lg text-sm text-gray-700 appearance-none outline-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary"
                    defaultValue=""
                  >
                    <option value="" disabled>{T.selectCity}</option>
                    <option value="douala">Douala</option>
                    <option value="yaounde">Yaoundé</option>
                    <option value="bamenda">Bamenda</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {T.yearsExperience} <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg border border-gray-300 shadow-sm bg-white flex items-center focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    className="block w-full pl-4 pr-16 py-3 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                    min="0"
                  />
                  <div className="absolute right-4 text-xs font-bold text-gray-400 select-none pointer-events-none">
                    {T.years}
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Domains */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {T.practiceDomains} <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-muted font-medium">{T.selectUpTo5}</span>
              </div>

              <div className="relative rounded-lg border border-gray-300 bg-white p-2 flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary min-h-[48px]">
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded bg-[#EAF2ED] text-xs font-medium text-emerald-800 border border-emerald-100">
                  Family Law
                  <button type="button" className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded">
                    <X size={12} />
                  </button>
                </span>
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded bg-[#EAF2ED] text-xs font-medium text-emerald-800 border border-emerald-100">
                  Corporate Law
                  <button type="button" className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded">
                    <X size={12} />
                  </button>
                </span>
                <input
                  type="text"
                  placeholder={T.searchDomains}
                  className="flex-1 min-w-[180px] bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none px-2 py-1"
                />
                <div className="absolute right-3.5 text-gray-400 pointer-events-none">
                  <Search size={16} />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {T.professionalBio}
                </label>
                <span className="text-[10px] text-muted font-medium tracking-wider">0 / 500</span>
              </div>
              <textarea
                rows={4}
                placeholder={T.bioPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-shadow leading-relaxed"
                maxLength={500}
              />
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                {T.bioHint}
              </p>
            </div>

          </form>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="w-full max-w-3xl px-6 mt-8 flex items-center justify-between border-t border-gray-100 pt-6 bg-background">
        <a href="/register-lawyer" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg">
          <ArrowLeft size={16} />
          {T.back}
        </a>
        <a href="/verify-email" className="bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-8 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 shadow-sm">
          {T.continueVerification}
          <ArrowRight size={16} />
        </a>
      </footer>

    </div>
  );
}
