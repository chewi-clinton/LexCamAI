'use client';
import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  EyeOff,
  Save,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function UserProfileSettings() {
  const { lang, setLang } = useLanguage();
  const T = t[lang].profile;
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header />

      <div className="flex-1 py-12 px-6 md:px-16 flex justify-center">
        <div className="max-w-6xl w-full">

          {/* Page Title */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
          </div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Nav Tabs */}
            <nav className="lg:col-span-3 space-y-1 bg-white p-2 rounded-xl border border-gray-200/60 shadow-sm">
              {[
                { key: 'account', label: T.accountInfo, icon: User },
                { key: 'security', label: T.security, icon: Lock },
                { key: 'notifications', label: T.notifications, icon: Bell },
                { key: 'billing', label: T.billing, icon: CreditCard },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg text-left transition-all ${
                    activeTab === key
                      ? 'font-bold bg-[#F5EFE6] text-accent-dark border-l-4 border-l-accent-dark'
                      : 'font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </nav>

            {/* Right Panels */}
            <div className="lg:col-span-9 space-y-6 w-full">

              {/* Panel 1: Account Information */}
              {activeTab === 'account' && <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                  <User size={18} className="text-accent-dark" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.accountInfoTitle}</h3>
                    <p className="text-xs text-gray-400 font-medium">{T.accountInfoSubtitle}</p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">{T.fullName}</label>
                      <input
                        type="text"
                        defaultValue="Ahmadou Ahidjo"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">{T.email}</label>
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
                      <label className="block text-gray-800">{T.phone}</label>
                      <input
                        type="text"
                        defaultValue="+237 6 77 00 00 00"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-gray-800">{T.city}</label>
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
                      <span className="block text-gray-800 font-bold">{T.interfaceLang}</span>
                      <span className="text-gray-400 font-medium mt-0.5 block">{T.interfaceLangDesc}</span>
                    </div>
                    <div className="inline-flex bg-gray-100 rounded-lg p-1 text-xs font-bold border border-gray-200/50">
                      <button type="button" onClick={() => setLang('fr')} className={`px-4 py-1.5 rounded-md transition-all ${lang === 'fr' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>Français</button>
                      <button type="button" onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-md transition-all ${lang === 'en' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>English</button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm">
                      <Save size={14} /> {T.saveChanges}
                    </button>
                  </div>
                </form>
              </div>}

              {/* Panel 2: Security */}
              {activeTab === 'security' && <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                  <Lock size={18} className="text-accent-dark" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.securityTitle}</h3>
                    <p className="text-xs text-gray-400 font-medium">{T.securitySubtitle}</p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="text-xs font-bold text-gray-700 space-y-4">
                    <div className="space-y-1.5 relative max-w-xl">
                      <label className="block text-gray-800">{T.currentPassword}</label>
                      <div className="relative flex items-center bg-white border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
                        <input
                          type="password"
                          placeholder={T.enterCurrentPassword}
                          className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-800 outline-none pr-10"
                        />
                        <EyeOff size={14} className="text-gray-400 absolute right-4 cursor-pointer hover:text-gray-600 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">{T.newPassword}</label>
                        <input
                          type="password"
                          placeholder={T.enterNewPassword}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">{T.confirmPassword}</label>
                        <input
                          type="password"
                          placeholder={T.confirmNewPassword}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-md">
                    {T.passwordHint}
                  </p>

                  <div className="pt-4 flex justify-start">
                    <button type="submit" className="border border-primary text-primary hover:bg-primary/5 bg-white font-bold text-xs py-2.5 px-5 rounded-lg transition-colors shadow-sm">
                      {T.updatePassword}
                    </button>
                  </div>
                </form>
              </div>}

              {/* Panel 3: Notifications */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                    <Bell size={18} className="text-accent-dark" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.notifTitle}</h3>
                      <p className="text-xs text-gray-400 font-medium">{T.notifSubtitle}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: T.notif1Label, desc: T.notif1Desc },
                      { label: T.notif2Label, desc: T.notif2Desc },
                      { label: T.notif3Label, desc: T.notif3Desc },
                    ].map(({ label, desc }) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary cursor-pointer" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 flex justify-end">
                    <button className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm">
                      <Save size={14} /> {T.savePrefs}
                    </button>
                  </div>
                </div>
              )}

              {/* Panel 4: Billing History */}
              {activeTab === 'billing' && (
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                    <CreditCard size={18} className="text-accent-dark" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.billingTitle}</h3>
                      <p className="text-xs text-gray-400 font-medium">{T.billingSubtitle}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { doc: 'Mise en Demeure – Salaire Impayé', date: 'Oct 24, 2024', amount: '5,000 XAF', status: 'Paid' },
                      { doc: 'Lettre de Réclamation', date: 'Oct 10, 2024', amount: '5,000 XAF', status: 'Paid' },
                    ].map(({ doc, date, amount, status }) => (
                      <div key={doc} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 text-xs font-medium">
                        <div>
                          <p className="text-gray-800 font-semibold">{doc}</p>
                          <p className="text-gray-400 mt-0.5">{date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-800 font-bold">{amount}</p>
                          <span className="text-emerald-600 font-bold flex items-center gap-1 justify-end mt-0.5">
                            <CheckCircle size={11} /> {T.paid}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
