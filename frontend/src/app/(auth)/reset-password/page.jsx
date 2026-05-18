'use client';
import { useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
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

function SetNewPassword({ T, onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const strength = Math.min(4, Math.floor(password.length / 3));
  const strengthLabels = ['', T.strengthWeak, T.strengthFair, T.strengthGood, T.strengthStrong];
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-600'];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Branding tagline={T.tagline} />
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-primary mb-1">{T.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{T.desc}</p>
        </div>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (password && password === confirm) onSubmit(); }}>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.newPassword}</label>
            <div className="relative flex items-center border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
              <RotateCcw size={16} className="text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={T.newPasswordPlaceholder}
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm font-medium text-gray-800 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div key={seg} className={`h-1 flex-1 rounded-full transition-colors ${seg <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-gray-400">{strengthLabels[strength]}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{T.confirmPassword}</label>
            <div className="relative flex items-center border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
              <RotateCcw size={16} className="text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={T.confirmPasswordPlaceholder}
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm font-medium text-gray-800 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
            {confirm.length > 0 && password !== confirm && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{T.noMatch}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || password !== confirm}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-sm"
          >
            {T.updatePassword}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordUpdatedSuccess({ T }) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Branding tagline={T.tagline} />
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
          <Check size={26} className="text-emerald-600" strokeWidth={3} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-primary mb-2">{T.successTitle}</h2>
        <p className="text-sm text-muted leading-relaxed mb-8">{T.successDesc}</p>
        <a
          href="/login"
          className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-sm flex items-center justify-center"
        >
          {T.continueSignIn}
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const T = t[lang].resetPassword;
  const [done, setDone] = useState(false);

  if (done) return <PasswordUpdatedSuccess T={T} />;
  return <SetNewPassword T={T} onSubmit={() => setDone(true)} />;
}
