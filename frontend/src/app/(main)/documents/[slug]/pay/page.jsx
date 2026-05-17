"use client";
import { Check, ArrowRight, Lock, FileText } from "lucide-react";
import Header from "@/components/layout/Header";

export default function DocumentPaymentStep() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header activePage="documents" />

      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center py-12 px-6 md:px-16">
        {/* 3-step stepper — all steps consistent with step 2 page */}
        <div className="w-full max-w-xl mx-auto mb-16 relative flex items-center justify-between select-none">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-primary -z-10" />

          {/* Step 1: Template — completed */}
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary shadow-sm text-xs">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 mt-2">
              Template
            </span>
          </div>

          {/* Step 2: Details — completed */}
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary shadow-sm text-xs">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 mt-2">
              Details
            </span>
          </div>

          {/* Step 3: Payment — active */}
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-accent-light text-white flex items-center justify-center border-4 border-background ring-2 ring-accent-light shadow-sm font-bold text-xs">
              3
            </div>
            <span className="text-[11px] font-bold text-primary-dark mt-2">
              Payment
            </span>
          </div>
        </div>

        {/* Two-column checkout layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left: Payment options */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-6 lg:col-span-7">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
                Complete Your Payment
              </h2>
              <p className="text-muted text-sm mt-1.5 leading-relaxed">
                Select your preferred mobile money provider to complete the
                transaction securely.
              </p>
            </div>

            {/* Provider options */}
            <div className="space-y-3">
              {/* MTN — selected */}
              <div className="border-2 border-primary rounded-xl p-4 flex items-center justify-between bg-white cursor-pointer transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                    <img
                      src="/mtn-logo.jpeg"
                      alt="MTN Mobile Money"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      MTN Mobile Money
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dial{" "}
                      <span className="font-bold text-gray-700">*126#</span> to
                      confirm
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-primary bg-white shadow-sm" />
              </div>

              {/* Orange Money — inactive */}
              <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white hover:border-gray-300 cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                    <img
                      src="/orange-logo.png"
                      alt="Orange Money"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Orange Money
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dial{" "}
                      <span className="font-bold text-gray-700">*150#</span> to
                      confirm
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white" />
              </div>
            </div>

            {/* Phone number input */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                Mobile Money Number
              </label>
              <div className="relative flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                <span className="pl-4 text-sm font-semibold text-gray-400 select-none">
                  +237
                </span>
                <input
                  type="text"
                  placeholder="6XX XXX XXX"
                  className="w-full bg-transparent pl-3 pr-4 py-3.5 text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-300 tracking-wider"
                />
              </div>
              <p className="text-xs text-gray-400 font-medium">
                A payment prompt will be sent to this number.
              </p>
            </div>

            {/* CTA + trust badge */}
            <div className="space-y-4 pt-2">
              <button className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-4 px-6 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-sm">
                Pay 5,000 XAF
                <ArrowRight size={16} />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 select-none">
                <Lock size={12} className="text-gray-400" />
                <span>Secured by Campay</span>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-6 lg:col-span-5">
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Order Summary
            </h3>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-4 items-start">
              <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0 shadow-sm">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif text-sm font-bold text-gray-900 leading-snug truncate">
                  Mise en Demeure – Salaire Impayé
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Formal Demand Letter
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs font-semibold text-gray-500">
              <div className="flex justify-between items-baseline">
                <span>Document Fee</span>
                <span className="text-gray-800 font-medium">5,000 XAF</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Processing</span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-100/60">
                  Free
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="font-serif text-2xl font-bold text-primary">
                5,000 XAF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
