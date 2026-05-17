'use client';
import React from 'react';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  EyeOff,
  Save,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function UserProfileSettings() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header />

      <div className="flex-1 py-12 px-6 md:px-16 flex justify-center">
        <div className="max-w-6xl w-full">

          {/* Page Title */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">User Profile</h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage your personal information, communication preferences, and security settings for your LexCam account.
            </p>
          </div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Nav Tabs */}
            <nav className="lg:col-span-3 space-y-1 bg-white p-2 rounded-xl border border-gray-200/60 shadow-sm">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold bg-[#F5EFE6] text-accent-dark rounded-lg text-left border-l-4 border-l-accent-dark transition-all">
                <User size={16} /> Account Info
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left transition-all">
                <Lock size={16} /> Security
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left transition-all">
                <Bell size={16} /> Notifications
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left transition-all">
                <CreditCard size={16} /> Billing History
              </button>
            </nav>

            {/* Right Panels */}
            <div className="lg:col-span-9 space-y-6 w-full">

              {/* Panel 1: Account Information */}
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                  <User size={18} className="text-accent-dark" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">Account Information</h3>
                    <p className="text-xs text-gray-400 font-medium">Update your personal details and primary location.</p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Ahmadou Ahidjo"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">Email Address</label>
                      <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                        <input
                          type="email"
                          disabled
                          defaultValue="ahmadou.law@example.cm"
                          className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-400 outline-none cursor-not-allowed pr-10"
                        />
                        <Lock size={14} className="text-gray-400 absolute right-4 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">Phone Number</label>
                      <input
                        type="text"
                        defaultValue="+237 6 77 00 00 00"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">City of Residence</label>
                      <div className="relative bg-white border border-gray-300 rounded-lg">
                        <select className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer rounded-lg">
                          <option value="Yaoundé">Yaoundé</option>
                          <option value="Douala">Douala</option>
                          <option value="Garoua">Garoua</option>
                          <option value="Bamenda">Bamenda</option>
                          <option value="Bafoussam">Bafoussam</option>
                          <option value="Maroua">Maroua</option>
                          <option value="Ngaoundéré">Ngaoundéré</option>
                          <option value="Bertoua">Bertoua</option>
                          <option value="Ebolowa">Ebolowa</option>
                          <option value="Buea">Buea</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Language Toggle */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-semibold">
                      <span className="block text-gray-800 font-bold">Interface Language</span>
                      <span className="text-gray-400 font-medium mt-0.5 block">Select your preferred language for the application.</span>
                    </div>
                    <div className="inline-flex bg-gray-100 rounded-lg p-1 text-xs font-bold border border-gray-200/50">
                      <button type="button" className="px-4 py-1.5 bg-white text-gray-800 rounded-md shadow-sm transition-all">Français</button>
                      <button type="button" className="px-4 py-1.5 text-gray-400 hover:text-gray-700 transition-colors">English</button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm">
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Panel 2: Security */}
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                  <Lock size={18} className="text-accent-dark" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">Security</h3>
                    <p className="text-xs text-gray-400 font-medium">Update your password to keep your account secure.</p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="text-xs font-bold text-gray-700 space-y-4">
                    <div className="space-y-1.5 relative max-w-xl">
                      <label className="block text-gray-800">Current Password</label>
                      <div className="relative flex items-center bg-white border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-800 outline-none pr-10"
                        />
                        <EyeOff size={14} className="text-gray-400 absolute right-4 cursor-pointer hover:text-gray-600 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-md">
                    Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                  </p>

                  <div className="pt-4 flex justify-start">
                    <button type="submit" className="border border-primary text-primary hover:bg-primary/5 bg-white font-bold text-xs py-2.5 px-5 rounded-lg transition-colors shadow-sm">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
