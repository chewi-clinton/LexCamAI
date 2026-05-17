'use client';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';

export default function Login() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      {/* Branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GavelIcon size={32} />
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            LexCam
          </h1>
        </div>
        <p className="text-xs text-muted font-medium mt-1">
          Legal Empowerment for Cameroon.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <h2 className="font-serif text-2xl font-bold text-primary mb-8">
          Welcome Back
        </h2>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className="block w-full pl-11 pr-4 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-700">
                Password
              </label>
              <a href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none tracking-widest"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-4 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 shadow-sm"
          >
            Log In
            <ArrowRight size={16} />
          </button>

        </form>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        Don&apos;t have an account?{' '}
        <a href="/register" className="font-bold text-gray-900 hover:underline">
          Sign Up
        </a>
      </p>

    </div>
  );
}
