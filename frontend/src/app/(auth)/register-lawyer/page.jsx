'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GavelIcon from '@/components/ui/GavelIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function LawyerOnboarding() {
  const router = useRouter();
  const { lang } = useLanguage();
  const T = t[lang].registerLawyer;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-start pb-16">

      {/* Onboarding Header */}
      <header className="w-full bg-white border-b border-gray-200/60 py-4 px-6 md:px-16 flex items-center justify-between sticky top-0 z-20">
        <a href="/" className="text-gray-800 hover:text-gray-600 transition-colors p-1 rounded-lg">
          <ArrowLeft size={20} />
        </a>
        <a href="/" className="font-serif text-xl font-bold text-primary tracking-wide flex items-center gap-2">
          <GavelIcon size={24} />
          LexCam
        </a>
        <div className="w-8" />
      </header>

      <main className="max-w-2xl w-full px-6 mt-12 flex flex-col">

        {/* Stepper */}
        <div className="w-full mb-10">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-bold text-primary tracking-wider">{T.step1of3}</span>
            <span className="text-xs font-bold text-gray-800 tracking-wider">{T.stepAccount}</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-primary h-full w-1/3 rounded-full" />
          </div>
          <div className="grid grid-cols-3 text-[10px] md:text-xs font-bold text-gray-400 select-none">
            <span className="text-primary text-left">{T.stepAccount}</span>
            <span className="text-center">{T.stepProfile}</span>
            <span className="text-right">{T.stepVerification}</span>
          </div>
        </div>

        {/* Intro */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">
            {T.joinTitle}
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            {T.joinDesc}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface w-full rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); router.push('/register-lawyer/profile'); }}>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {T.fullName}
              </label>
              <input
                type="text"
                placeholder={T.fullNamePlaceholder}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {T.emailAddress}
              </label>
              <input
                type="email"
                placeholder={T.emailPlaceholder}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {T.password}
              </label>
              <div className="relative rounded-lg border border-gray-300 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={T.passwordPlaceholder}
                  className="block w-full pl-4 pr-11 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Bar Association ID */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {T.barId}
                </label>
                <span className="text-gray-400 hover:text-gray-600 transition-colors cursor-help">
                  <HelpCircle size={14} />
                </span>
              </div>
              <input
                type="text"
                placeholder={T.barIdPlaceholder}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow uppercase"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-4 rounded-lg font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm"
              >
                {T.continueProfile}
                <ArrowRight size={16} />
              </button>
            </div>

          </form>

          <p className="text-center text-xs md:text-sm text-muted mt-6">
            {T.alreadyHaveAccount}{' '}
            <a href="/login" className="font-bold text-accent-dark hover:underline">
              {T.logIn}
            </a>
          </p>
        </div>

      </main>
    </div>
  );
}
