'use client';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function VerifyCode() {
  const router = useRouter();
  const { lang } = useLanguage();
  const T = t[lang].verifyEmail;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="bg-surface w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center flex flex-col items-center">

        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
            <Lock size={18} />
          </div>
        </div>

        <h2 className="font-serif text-2xl font-bold text-primary mb-3">{T.title}</h2>
        <p className="text-muted text-sm leading-relaxed max-w-xs mb-8">{T.desc}</p>

        <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); router.push('/dashboard'); }}>
          <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-full aspect-square border border-gray-300 rounded-lg text-center font-semibold text-lg text-gray-800 bg-white outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-4 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 shadow-sm"
          >
            {T.verifyBtn}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-xs text-muted mt-6">
          {T.didntReceive}{' '}
          <span className="font-semibold text-accent-dark cursor-pointer hover:underline">
            {T.resendIn}
          </span>
        </p>

        <a href="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors mt-8 font-medium">
          <ArrowLeft size={14} />
          {T.returnToLogin}
        </a>

      </div>

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-400 select-none">
        <ShieldCheck size={14} />
        <span>{T.securedBy}</span>
      </div>

    </div>
  );
}
