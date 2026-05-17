'use client';
import { useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';

function SetNewPassword({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const strength = Math.min(4, Math.floor(password.length / 3));
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-600'];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      {/* Branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GavelIcon size={32} />
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">LexCam</h1>
        </div>
        <p className="text-xs text-muted font-medium mt-1">Legal Empowerment for Cameroon.</p>
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-primary mb-1">Set New Password</h2>
          <p className="text-sm text-muted leading-relaxed">
            Choose a strong password to protect your account.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (password && password === confirm) onSubmit();
          }}
        >
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password</label>
            <div className="relative flex items-center border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
              <RotateCcw size={16} className="text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm font-medium text-gray-800 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 flex-1 rounded-full transition-colors ${seg <= strength ? strengthColors[strength] : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-gray-400">{strengthLabel}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative flex items-center border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
              <RotateCcw size={16} className="text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm font-medium text-gray-800 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
            {confirm.length > 0 && password !== confirm && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || password !== confirm}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-sm"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordUpdatedSuccess() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      {/* Branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GavelIcon size={32} />
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">LexCam</h1>
        </div>
        <p className="text-xs text-muted font-medium mt-1">Legal Empowerment for Cameroon.</p>
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
          <Check size={26} className="text-emerald-600" strokeWidth={3} />
        </div>

        <h2 className="font-serif text-2xl font-bold text-primary mb-2">Password Updated</h2>
        <p className="text-sm text-muted leading-relaxed mb-8">
          Your password has been reset successfully. You can now sign in with your new credentials.
        </p>

        <a
          href="/login"
          className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-sm flex items-center justify-center"
        >
          Continue to Sign In
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);

  if (done) return <PasswordUpdatedSuccess />;
  return <SetNewPassword onSubmit={() => setDone(true)} />;
}
