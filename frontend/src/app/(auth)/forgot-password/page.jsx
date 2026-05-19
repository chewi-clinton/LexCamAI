'use client';
import { useState } from 'react';
import { Mail, ArrowLeft, MailCheck, Loader2 } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { auth } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function Branding({ tagline }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-1">
        <GavelIcon size={32} />
        <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">LexCam</h1>
      </div>
      <p className="text-xs text-muted font-medium mt-1">{tagline}</p>
    </div>
  );
}

function ForgotPasswordForm({ T, onSubmit }) {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      sessionStorage.setItem('reset_email', email);
      onSubmit(email);
    } catch (err) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Branding tagline={T.tagline} />
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-primary mb-1">{T.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{T.desc}</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.emailAddress}</label>
            <div className="relative flex items-center border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
              <Mail size={16} className="text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm font-medium text-gray-800 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
          </div>
          {error && <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : T.sendResetLink}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14} /> {T.backToSignIn}
          </a>
        </div>
      </div>
    </div>
  );
}

function CheckInbox({ T, email }) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Branding tagline={T.tagline} />
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <MailCheck size={26} className="text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-primary mb-2">{T.checkInboxTitle}</h2>
        <p className="text-sm text-muted leading-relaxed mb-1">{T.checkInboxDesc}</p>
        <p className="text-sm font-bold text-gray-800 mb-6">{email || 'your email address'}</p>
        <a
          href="mailto:"
          className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2"
        >
          <MailCheck size={16} /> {T.openEmailApp}
        </a>
        <a
          href="/reset-password"
          className="w-full mt-3 border border-primary text-primary font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
        >
          {T.enterCode ?? 'Enter the code I received'}
        </a>
        <p className="text-xs text-gray-400 font-medium mt-5">
          {T.didntReceive}{' '}
          <button className="text-primary font-bold hover:underline" onClick={() => window.location.reload()}>
            {T.clickResend}
          </button>
        </p>
        <div className="mt-6">
          <a href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14} /> {T.backToSignIn}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const T = t[lang].forgotPassword;
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  if (submitted) return <CheckInbox T={T} email={email} />;
  return (
    <ForgotPasswordForm
      T={T}
      onSubmit={(val) => { setEmail(val); setSubmitted(true); }}
    />
  );
}
