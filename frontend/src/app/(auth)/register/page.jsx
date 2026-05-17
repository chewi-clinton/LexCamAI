'use client';
import { User, Mail, MapPin, Lock, ChevronDown, ArrowRight } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';

export default function SignUp() {
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
          Create Account
        </h2>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="e.g. Jean Dupont"
                className="block w-full pl-11 pr-4 py-3 bg-transparent rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

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

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              City
            </label>
            <div className="relative rounded-lg border border-gray-300 shadow-sm bg-white cursor-pointer hover:bg-gray-50/50 transition-colors">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <select
                className="block w-full pl-11 pr-10 py-3 bg-transparent rounded-lg text-sm text-gray-700 appearance-none outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Select your city</option>
                <option value="yaounde">Yaoundé</option>
                <option value="douala">Douala</option>
                <option value="bamenda">Bamenda</option>
                <option value="bafoussam">Bafoussam</option>
                <option value="garoua">Garoua</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Password
            </label>
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

          {/* Language Toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Preferred Language
            </label>
            <div className="bg-gray-100 p-1 rounded-lg grid grid-cols-2 text-center text-xs font-bold border border-gray-200/40">
              <button type="button" className="bg-white text-accent-dark py-2.5 rounded-md shadow-sm transition-all">
                FR
              </button>
              <button type="button" className="text-muted hover:text-gray-800 py-2.5 transition-colors">
                EN
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 pt-2">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
              I agree to the{' '}
              <a href="#" className="font-semibold text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="font-semibold text-primary hover:underline">Privacy Policy</a>.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-4 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 shadow-sm"
          >
            Create Account
            <ArrowRight size={16} />
          </button>

        </form>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{' '}
        <a href="/login" className="font-bold text-gray-900 hover:underline">
          Log In
        </a>
      </p>

    </div>
  );
}
