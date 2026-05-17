'use client';
import {
  Lock, ShieldCheck, Clock, FileText,
  ArrowLeft, ArrowRight, Calendar,
} from 'lucide-react';
import Header from '@/components/layout/Header';

export default function DocumentGenerationDetails() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col justify-between">

      <Header activePage="documents" />

      {/* Main Process Content */}
      <main className="max-w-7xl w-full mx-auto px-6 md:px-16 py-10 flex-1 flex flex-col">

        {/* 3-step progress stepper */}
        <div className="w-full max-w-xl mx-auto mb-12 relative flex items-center justify-between select-none">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div className="absolute top-4 left-0 w-1/2 h-0.5 bg-primary -z-10" />

          {/* Step 1: Completed */}
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary shadow-sm text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <span className="text-[11px] font-bold text-gray-400 mt-2">Template</span>
          </div>

          {/* Step 2: Active */}
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-white border-4 border-white ring-2 ring-primary text-gray-900 flex items-center justify-center shadow-sm font-bold text-xs">
              2
            </div>
            <span className="text-[11px] font-bold text-gray-900 mt-2">Details</span>
          </div>

          {/* Step 3: Upcoming */}
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-white text-gray-300 border-2 border-gray-200 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span className="text-[11px] font-bold text-gray-300 mt-2">Payment</span>
          </div>
        </div>

        {/* Page heading + price badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 w-full">
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
              Mise en Demeure – Salaire Impayé
            </h2>
            <p className="text-muted text-sm mt-1">
              Formal demand letter for unpaid wages. Fill in the details to generate your customized document.
            </p>
          </div>
          <span className="bg-accent/20 text-accent-dark text-xs font-bold px-3 py-1.5 rounded-lg border border-accent/30 flex items-center gap-1 self-start sm:self-auto shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
            XAF 5,000
          </span>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

          {/* Left: Form */}
          <form
            className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-8 lg:col-span-7"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Employer Information */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2">Employer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">Employer Name (Company/Person)</label>
                  <input type="text" placeholder="e.g. SARL Exemple" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block mb-1.5">Employer Address</label>
                  <input type="text" placeholder="Quarter, City" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
              </div>
            </div>

            {/* Your Information */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2">Your Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">Your Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block mb-1.5">Your Address</label>
                  <input type="text" placeholder="Your residential address" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2">Claim Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">Amount Owed (XAF)</label>
                  <input type="text" placeholder="e.g. 150000" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block mb-1.5">Last Day Worked</label>
                  <div className="relative bg-white border border-gray-300 rounded-lg flex items-center justify-between focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                    <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-300" />
                    <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-700">
                <label className="block mb-1.5">Contract Type</label>
                <div className="relative bg-white border border-gray-300 rounded-lg">
                  <select className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary/30 focus:border-primary/50 rounded-lg">
                    <option value="">Select contract type</option>
                    <option value="cdi">CDI (Indefinite)</option>
                    <option value="cdd">CDD (Fixed-term)</option>
                    <option value="oral">Oral Agreement</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-700">
                <label className="block mb-1.5">Additional Context <span className="font-normal text-gray-400">(Optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe any relevant details about the unpaid period or previous attempts to collect."
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300"
                />
              </div>
            </div>
          </form>

          {/* Right: Preview + trust badges */}
          <div className="lg:col-span-5 space-y-4">

            <div className="bg-white/40 border-2 border-dashed border-gray-300/80 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[465px] text-center shadow-inner">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-800 border border-gray-200/60 shadow-sm mb-4">
                <Lock size={18} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Document Preview</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Complete the form on the left to unlock and preview your finalized legal document here.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200/50 text-center flex flex-col items-center justify-center shadow-sm">
                <ShieldCheck size={18} className="text-gray-700 mb-1.5" />
                <span className="text-[10px] font-bold text-gray-700 tracking-tight">Legally Vetted</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/50 text-center flex flex-col items-center justify-center shadow-sm">
                <Clock size={18} className="text-gray-700 mb-1.5" />
                <span className="text-[10px] font-bold text-gray-700 tracking-tight">Instant Delivery</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/50 text-center flex flex-col items-center justify-center shadow-sm">
                <FileText size={18} className="text-gray-700 mb-1.5" />
                <span className="text-[10px] font-bold text-gray-700 tracking-tight">PDF & Word</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Bottom navigation bar */}
      <div className="w-full bg-background border-t border-gray-200/60 py-6 px-6 md:px-16 flex items-center justify-between mt-12">
        <a href="/documents" className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm">
          <ArrowLeft size={16} />
          Back to Templates
        </a>
        <button className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3.5 px-6 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          Continue to Payment
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
