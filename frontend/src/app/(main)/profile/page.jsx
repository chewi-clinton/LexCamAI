'use client';
import React, { useState, useEffect } from 'react';
import {
  User, Lock, Bell, CreditCard, EyeOff, Eye, Save, CheckCircle, Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { users as usersApi, payments as paymentsApi } from '@/lib/api';
import t from '@/translations';

const CITIES = [
  'Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea',
];

export default function UserProfileSettings() {
  const { lang, setLang } = useLanguage();
  const T = t[lang].profile;
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // ── Account tab ──────────────────────────────────────────────────────────────
  const [accountForm, setAccountForm] = useState({ full_name: '', phone: '', city: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState(null); // { ok: bool, text: string }

  useEffect(() => {
    if (user) {
      setAccountForm({
        full_name: user.full_name ?? '',
        phone:     user.phone ?? '',
        city:      user.city ?? '',
      });
    }
  }, [user]);

  async function handleAccountSave(e) {
    e.preventDefault();
    setAccountSaving(true);
    setAccountMsg(null);
    try {
      await usersApi.update({
        full_name:          accountForm.full_name,
        phone:              accountForm.phone,
        city:               accountForm.city,
        preferred_language: lang,
      });
      await refreshUser();
      setAccountMsg({ ok: true, text: lang === 'fr' ? 'Profil mis à jour.' : 'Profile updated.' });
    } catch (err) {
      setAccountMsg({ ok: false, text: err.message ?? (lang === 'fr' ? 'Erreur lors de la mise à jour.' : 'Update failed.') });
    } finally {
      setAccountSaving(false);
    }
  }

  // ── Security tab ─────────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg({ ok: false, text: lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.' });
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwMsg({ ok: false, text: lang === 'fr' ? 'Minimum 8 caractères.' : 'Minimum 8 characters.' });
      return;
    }
    setPwSaving(true);
    try {
      await usersApi.changePassword({
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setPwMsg({ ok: true, text: lang === 'fr' ? 'Mot de passe mis à jour.' : 'Password updated.' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message ?? (lang === 'fr' ? 'Erreur. Vérifiez votre mot de passe actuel.' : 'Error. Check your current password.') });
    } finally {
      setPwSaving(false);
    }
  }

  // ── Billing tab ──────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'billing' && transactions.length === 0) {
      setBillingLoading(true);
      paymentsApi.history()
        .then((data) => setTransactions(Array.isArray(data) ? data : (data.results ?? [])))
        .catch(() => {})
        .finally(() => setBillingLoading(false));
    }
  }, [activeTab]);

  // ── Shared helpers ───────────────────────────────────────────────────────────
  const inputCls = 'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow';

  function StatusMsg({ msg }) {
    if (!msg) return null;
    return (
      <p className={`text-xs font-semibold ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
        {msg.ok && <CheckCircle size={12} className="inline mr-1" />}
        {msg.text}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header />

      <div className="flex-1 py-12 px-6 md:px-16 flex justify-center">
        <div className="max-w-6xl w-full">

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left nav */}
            <nav className="lg:col-span-3 space-y-1 bg-white p-2 rounded-xl border border-gray-200/60 shadow-sm">
              {[
                { key: 'account',       label: T.accountInfo,  icon: User       },
                { key: 'security',      label: T.security,     icon: Lock       },
                { key: 'notifications', label: T.notifications, icon: Bell      },
                { key: 'billing',       label: T.billing,      icon: CreditCard },
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

            {/* Panels */}
            <div className="lg:col-span-9 space-y-6 w-full">

              {/* Account Information */}
              {activeTab === 'account' && (
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                    <User size={18} className="text-accent-dark" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.accountInfoTitle}</h3>
                      <p className="text-xs text-gray-400 font-medium">{T.accountInfoSubtitle}</p>
                    </div>
                  </div>

                  <form className="space-y-5" onSubmit={handleAccountSave}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">{T.fullName}</label>
                        <input
                          type="text"
                          value={accountForm.full_name}
                          onChange={(e) => setAccountForm((p) => ({ ...p, full_name: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">{T.email}</label>
                        <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                          <input
                            type="email"
                            disabled
                            value={user?.email ?? ''}
                            className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-400 outline-none cursor-not-allowed pr-10"
                          />
                          <Lock size={14} className="text-gray-400 absolute right-4 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">{T.phone}</label>
                        <input
                          type="text"
                          value={accountForm.phone}
                          onChange={(e) => setAccountForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+237 6XX XXX XXX"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-gray-800">{T.city}</label>
                        <div className="relative bg-white border border-gray-300 rounded-lg">
                          <select
                            value={accountForm.city}
                            onChange={(e) => setAccountForm((p) => ({ ...p, city: e.target.value }))}
                            className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                          >
                            <option value="">{lang === 'fr' ? 'Sélectionnez...' : 'Select...'}</option>
                            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Language toggle */}
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

                    <div className="pt-4 flex items-center justify-end gap-4">
                      <StatusMsg msg={accountMsg} />
                      <button
                        type="submit"
                        disabled={accountSaving}
                        className="bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm"
                      >
                        {accountSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {T.saveChanges}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                    <Lock size={18} className="text-accent-dark" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.securityTitle}</h3>
                      <p className="text-xs text-gray-400 font-medium">{T.securitySubtitle}</p>
                    </div>
                  </div>

                  <form className="space-y-5" onSubmit={handlePasswordChange}>
                    <div className="text-xs font-bold text-gray-700 space-y-4">
                      {[
                        { field: 'current_password', label: T.currentPassword, placeholder: T.enterCurrentPassword, showKey: 'current' },
                        { field: 'new_password',     label: T.newPassword,     placeholder: T.enterNewPassword,    showKey: 'new'     },
                        { field: 'confirm_password', label: T.confirmPassword, placeholder: T.confirmNewPassword,  showKey: 'confirm' },
                      ].map(({ field, label, placeholder, showKey }) => (
                        <div key={field} className="space-y-1.5 max-w-xl">
                          <label className="block text-gray-800">{label}</label>
                          <div className="relative flex items-center bg-white border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
                            <input
                              type={showPw[showKey] ? 'text' : 'password'}
                              value={pwForm[field]}
                              onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                              placeholder={placeholder}
                              className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-gray-800 outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}
                              className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPw[showKey] ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-md">
                      {T.passwordHint}
                    </p>

                    <div className="pt-4 flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={pwSaving}
                        className="border border-primary text-primary hover:bg-primary/5 disabled:opacity-50 bg-white font-bold text-xs py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                      >
                        {pwSaving && <Loader2 size={14} className="animate-spin" />}
                        {T.updatePassword}
                      </button>
                      <StatusMsg msg={pwMsg} />
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications */}
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

              {/* Billing */}
              {activeTab === 'billing' && (
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
                    <CreditCard size={18} className="text-accent-dark" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{T.billingTitle}</h3>
                      <p className="text-xs text-gray-400 font-medium">{T.billingSubtitle}</p>
                    </div>
                  </div>

                  {billingLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
                      <Loader2 size={16} className="animate-spin" />
                      {lang === 'fr' ? 'Chargement...' : 'Loading...'}
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center">
                      {lang === 'fr' ? 'Aucune transaction pour le moment.' : 'No transactions yet.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => {
                        const date = tx.created_at
                          ? new Date(tx.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';
                        const isPaid = tx.status === 'completed' || tx.status === 'confirmed';
                        return (
                          <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 text-xs font-medium">
                            <div>
                              <p className="text-gray-800 font-semibold">
                                {tx.document_id
                                  ? `${lang === 'fr' ? 'Document' : 'Document'} #${String(tx.document_id).slice(0, 8)}`
                                  : lang === 'fr' ? 'Transaction' : 'Transaction'}
                              </p>
                              <p className="text-gray-400 mt-0.5">{date} · {tx.operator?.toUpperCase() ?? '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-800 font-bold">
                                {tx.amount ? `${Number(tx.amount).toLocaleString()} XAF` : '—'}
                              </p>
                              {isPaid ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 justify-end mt-0.5">
                                  <CheckCircle size={11} /> {T.paid}
                                </span>
                              ) : (
                                <span className="text-orange-500 font-bold mt-0.5 block capitalize">{tx.status}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
