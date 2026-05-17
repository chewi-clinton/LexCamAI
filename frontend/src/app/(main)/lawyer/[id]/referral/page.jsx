'use client';
import React from 'react';
import { Send, MapPin, Scale, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function ReferralRequest() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="lawyer" />

      <div className="flex-1 flex items-center justify-center py-12 px-6 md:px-16">
        <div className="max-w-3xl w-full space-y-8 flex flex-col items-center">

          {/* Header Block */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Referral Request
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-medium max-w-xl">
              Provide details about your situation to initiate contact with this legal professional.
            </p>
          </div>

          {/* Lawyer Summary Card */}
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-5 flex items-center gap-4 w-full max-w-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0 border border-primary/20 select-none">
              PB
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">
                Me. Paul Biya
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gray-400" />
                  Douala, Cameroon
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Scale size={13} className="text-gray-400" />
                  Corporate Law
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 w-full max-w-2xl">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

              <div className="space-y-1.5 text-xs font-bold text-gray-700">
                <label htmlFor="legal-issue" className="block text-gray-800">
                  Describe your legal issue
                </label>
                <textarea
                  id="legal-issue"
                  rows={5}
                  placeholder="Briefly explain the nature of your request..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow resize-none leading-relaxed placeholder:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div className="space-y-1.5">
                  <label htmlFor="legal-domain" className="block text-gray-800">
                    Legal Domain
                  </label>
                  <div className="relative bg-white border border-gray-300 rounded-lg">
                    <select
                      id="legal-domain"
                      className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary rounded-lg"
                    >
                      <option value="">Select an area</option>
                      <option value="labor">Labor Law</option>
                      <option value="housing">Housing</option>
                      <option value="family">Family Law</option>
                      <option value="criminal">Criminal</option>
                      <option value="corporate">Corporate Law</option>
                      <option value="land">Land</option>
                      <option value="ohada">OHADA</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city-region" className="block text-gray-800">
                    Your City/Region
                  </label>
                  <input
                    id="city-region"
                    type="text"
                    placeholder="e.g., Yaoundé"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-2" />

              <div className="space-y-5 text-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto mx-auto bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3 px-8 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={14} /> Send Referral Request
                </button>

                <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-md mx-auto text-balance select-none">
                  By sending this request, you agree to share the provided information securely with the selected legal professional via LexCam. Your data remains confidential under our Privacy Policy.
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
