'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { auth, lawyers } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function VerifyCode() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang } = useLanguage();
  const T = t[lang].verifyEmail;
  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const emailRef  = useRef('');

  useEffect(() => {
    emailRef.current = sessionStorage.getItem('pending_verify_email') ?? '';
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleResend() {
    if (resendCooldown > 0 || !emailRef.current) return;
    try {
      await auth.resendOtp(emailRef.current, 'email_verify');
      setResendCooldown(60);
    } catch { /* silent */ }
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

        <form className="w-full space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          const code = digits.join('');
          if (code.length < 6) return;
          setError('');
          setLoading(true);
          try {
            await auth.verifyEmail(emailRef.current, code);
            const password = sessionStorage.getItem('pending_verify_password');
            const lawyerProfileRaw = sessionStorage.getItem('lawyer_profile');
            const step1Raw = sessionStorage.getItem('lawyer_step1');
            sessionStorage.removeItem('pending_verify_email');
            sessionStorage.removeItem('pending_verify_password');
            sessionStorage.removeItem('lawyer_profile');
            sessionStorage.removeItem('lawyer_step1');
            if (password) {
              const user = await login(emailRef.current, password);
              if (user.role === 'lawyer' && lawyerProfileRaw) {
                const profile = JSON.parse(lawyerProfileRaw);
                const step1 = step1Raw ? JSON.parse(step1Raw) : {};
                await lawyers.register({
                  full_name: step1.full_name ?? user.full_name,
                  email: user.email,
                  phone: step1.phone ?? '',
                  city: profile.city,
                  bio: profile.bio ?? '',
                  specializations: profile.specializations ?? [],
                }).catch(() => {});
                // Upload profile photo if one was selected
                const photoDataUrl = sessionStorage.getItem('lawyer_photo');
                sessionStorage.removeItem('lawyer_photo');
                if (photoDataUrl) {
                  try {
                    const res = await fetch(photoDataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], 'profile.jpg', { type: blob.type || 'image/jpeg' });
                    await lawyers.uploadPhoto(file).catch(() => {});
                  } catch { /* non-fatal */ }
                }
                router.push('/register-lawyer/documents');
              } else {
                router.push(user.role === 'lawyer' ? '/lawyer-dashboard' : user.role === 'admin' ? '/admin' : '/dashboard');
              }
            } else {
              router.push('/login');
            }
          } catch (err) {
            setError(err.message ?? 'Invalid or expired code.');
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
          } finally {
            setLoading(false);
          }
        }}>
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

          {error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            className="w-full bg-primary hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white py-3.5 px-4 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>{T.verifyBtn} <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-xs text-muted mt-6">
          {T.didntReceive}{' '}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="font-semibold text-accent-dark hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `${T.resendIn} ${resendCooldown}s` : T.clickResend ?? T.resendIn}
          </button>
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
