'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, MapPin, Lock, ChevronDown, ArrowRight, Loader2 } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { auth } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function SignUp() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const T = t[lang].register;

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [city, setCity]         = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!consent) { setError('You must agree to the terms to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      await auth.register({
        full_name: fullName,
        email,
        city,
        password,
        preferred_language: lang,
        consent_given: true,
      });
      sessionStorage.setItem('pending_verify_email', email);
      router.push('/verify-email');
    } catch (err) {
      setError(err.data?.email?.[0] ?? err.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GavelIcon size={32} />
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">LexCam</h1>
        </div>
        <p className="text-xs text-muted font-medium mt-1">{T.tagline}</p>
      </div>

      <div className="bg-surface w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <h2 className="font-serif text-2xl font-bold text-primary mb-8">{T.createAccount}</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">{T.fullName}</label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jean Dupont"
                required
                className="block w-full pl-11 pr-4 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">{T.emailAddress}</label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="block w-full pl-11 pr-4 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">{T.city}</label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm bg-white cursor-pointer hover:bg-gray-50/50 transition-colors">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full pl-11 pr-10 py-3 bg-transparent rounded-lg text-sm text-gray-700 appearance-none outline-none cursor-pointer"
              >
                <option value="">{T.selectCity}</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Douala">Douala</option>
                <option value="Bamenda">Bamenda</option>
                <option value="Bafoussam">Bafoussam</option>
                <option value="Garoua">Garoua</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">{T.password}</label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="block w-full pl-11 pr-4 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none tracking-widest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">{T.preferredLanguage}</label>
            <div className="bg-gray-100 p-1 rounded-lg grid grid-cols-2 text-center text-xs font-bold border border-gray-200/40">
              <button type="button" onClick={() => setLang('fr')} className={`py-2.5 rounded-md transition-all ${lang === 'fr' ? 'bg-white text-accent-dark shadow-sm' : 'text-muted hover:text-gray-800'}`}>FR</button>
              <button type="button" onClick={() => setLang('en')} className={`py-2.5 rounded-md transition-all ${lang === 'en' ? 'bg-white text-accent-dark shadow-sm' : 'text-muted hover:text-gray-800'}`}>EN</button>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              id="terms"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
              {T.termsAgree}{' '}
              <a href="#" className="font-semibold text-primary hover:underline">{T.termsOfService}</a>
              {' '}{T.and}{' '}
              <a href="#" className="font-semibold text-primary hover:underline">{T.privacyPolicy}</a>.
            </label>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white py-3.5 px-4 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>{T.createAccount} <ArrowRight size={16} /></>}
          </button>

        </form>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        {T.alreadyHaveAccount}{' '}
        <a href="/login" className="font-bold text-gray-900 hover:underline">{T.logIn}</a>
      </p>

    </div>
  );
}
