'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function VerifyCode() {
  const router = useRouter();
  const { lang } = useLanguage();
  const T = t[lang].verifyEmail;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  function handleDigitChange(index, value) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...digits];
    pasted.forEach((char, i) => { next[i] = char; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

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

        <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); router.push('/lawyer-dashboard'); }}>
          <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
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
