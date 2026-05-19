'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const REDIRECT = { admin: '/admin', lawyer: '/lawyer-dashboard', user: '/dashboard' };

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang } = useLanguage();
  const T = t[lang].login;

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(REDIRECT[user.role] ?? '/dashboard');
    } catch (err) {
      setError(err.message ?? 'Login failed. Please try again.');
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
        <h2 className="font-serif text-2xl font-bold text-primary mb-8">{T.welcomeBack}</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-700">{T.password}</label>
              <a href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                {T.forgotPassword}
              </a>
            </div>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full pl-11 pr-11 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>{T.logIn} <ArrowRight size={16} /></>}
          </button>

        </form>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        {T.noAccount}{' '}
        <a href="/register" className="font-bold text-gray-900 hover:underline">{T.signUp}</a>
      </p>

    </div>
  );
}
