'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Clock, Handshake, MapPin, FolderOpen, Loader2, Check, Briefcase, Plus, Camera,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { lawyers } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function LawyerDashboard() {
  const { lang } = useLanguage();
  const T = t[lang].lawyerDashboard;

  const [profile, setProfile]         = useState(null);
  const [referrals, setReferrals]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [allSpecs, setAllSpecs]           = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [specsLoading, setSpecsLoading]   = useState(false);
  const [specsSaved, setSpecsSaved]       = useState(false);
  const [customDomain, setCustomDomain]   = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const [prof, refs, specs] = await Promise.all([
          lawyers.me(),
          lawyers.myReferrals(),
          lawyers.specializations(),
        ]);
        setProfile(prof);
        setReferrals(refs);
        setAllSpecs(specs);
        setSelectedSpecs((prof.specializations ?? []).map((s) => s.name));
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleSpec(name) {
    setSelectedSpecs((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
    setSpecsSaved(false);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    setPhotoUploading(true);
    try {
      const data = await lawyers.uploadPhoto(file);
      setProfile((p) => ({ ...p, profile_photo_url: data.profile_photo_url }));
    } catch { /* silent */ } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  }

  function addCustomDomain() {
    const name = customDomain.trim();
    if (!name || selectedSpecs.includes(name)) return;
    setSelectedSpecs((prev) => [...prev, name]);
    if (!allSpecs.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setAllSpecs((prev) => [...prev, { id: name, name, name_fr: name }]);
    }
    setCustomDomain('');
    setSpecsSaved(false);
  }

  async function saveSpecializations() {
    setSpecsLoading(true);
    setSpecsSaved(false);
    try {
      const token = localStorage.getItem('lexcam_access');
      const res = await fetch('/api/v1/lawyers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ specializations: selectedSpecs }),
      });
      const updated = await res.json();
      setProfile((p) => ({ ...p, specializations: updated.specializations }));
      setSpecsSaved(true);
    } catch { /* silent */ } finally {
      setSpecsLoading(false);
    }
  }

  async function toggleAvailability() {
    if (!profile) return;
    try {
      const token = localStorage.getItem('lexcam_access');
      const res = await fetch('/api/v1/lawyers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_accepting_cases: !profile.is_accepting_cases }),
      });
      const updated = await res.json();
      setProfile((p) => ({ ...p, is_accepting_cases: updated.is_accepting_cases }));
    } catch { /* silent */ }
  }

  async function handleReferralAction(referralId, action) {
    setActionLoading(referralId + action);
    try {
      await lawyers.actionReferral(referralId, { action });
      setReferrals((prev) => prev.filter((r) => r.id !== referralId));
    } catch { /* silent */ } finally {
      setActionLoading(null);
    }
  }

  const pendingReferrals  = referrals.filter((r) => r.status === 'pending');
  const acceptedReferrals = referrals.filter((r) => r.status === 'accepted');
  const resolvedReferrals = referrals.filter((r) => r.status === 'resolved');

  const stats = [
    { label: T.pendingReferrals,       value: pendingReferrals.length,  icon: Clock,      badge: pendingReferrals.length > 0 ? T.actionRequired : null, iconBg: 'bg-orange-50 text-orange-600' },
    { label: T.acceptedCases,          value: acceptedReferrals.length, icon: FolderOpen, badge: null, iconBg: 'bg-emerald-50 text-emerald-700' },
    { label: T.completedConsultations, value: resolvedReferrals.length, icon: Handshake,  badge: null, iconBg: 'bg-teal-50 text-teal-700' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-red-500 font-semibold mb-2">{error || 'Profile not found.'}</p>
            <p className="text-sm text-muted">Make sure your lawyer profile has been created.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />

      <div className="py-12 px-6 md:px-16 flex-1">
        <div className="max-w-6xl mx-auto">

          {/* Profile & Availability Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex items-center gap-5">
              {/* Avatar with photo change */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {profile.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    (profile.full_name ?? '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-primary-light transition-colors disabled:opacity-60"
                  title="Change photo"
                >
                  {photoUploading ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold mb-2 ${
                profile.verification_status === 'verified'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : profile.verification_status === 'pending'
                  ? 'bg-amber-50 border-amber-100 text-amber-800'
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.verification_status === 'verified' ? 'bg-emerald-500' : profile.verification_status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                {profile.verification_status === 'verified' ? 'Verified Lawyer' : profile.verification_status === 'pending' ? 'Pending Verification' : 'Not Verified'}
              </div>
              <h1 className="font-serif text-3xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-muted text-sm flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {profile.city}
                {profile.specializations?.length > 0 && (
                  <span className="ml-2 text-gray-400">· {profile.specializations.map((s) => s.name).join(', ')}</span>
                )}
              </p>
            </div>
            </div>{/* end flex items-center gap-5 */}

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500">{T.availabilityStatus}</span>
              <button
                onClick={toggleAvailability}
                className={`relative w-12 h-6 rounded-full transition-colors ${profile.is_accepting_cases ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.is_accepting_cases ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-xs font-bold ${profile.is_accepting_cases ? 'text-emerald-600' : 'text-gray-500'}`}>
                {profile.is_accepting_cases ? T.accepting : T.notAccepting}
              </span>
            </div>
          </div>

          {/* Pending verification banner */}
          {profile.verification_status === 'pending' && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 font-medium">
              Your profile is under review. You will be notified once an admin verifies your account.
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-gray-200/60 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.iconBg}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-muted font-medium">{s.label}</p>
                    {s.badge && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">{s.badge}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Specializations */}
          {allSpecs.length > 0 && (
            <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-primary" />
                  <h2 className="font-serif text-lg font-bold text-gray-900">Areas of Practice</h2>
                </div>
                <button
                  onClick={saveSpecializations}
                  disabled={specsLoading}
                  className="flex items-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary-light disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {specsLoading ? <Loader2 size={12} className="animate-spin" /> : specsSaved ? <Check size={12} /> : null}
                  {specsSaved ? 'Saved!' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Select your legal domains. Don&apos;t see yours? Type it below and press Enter.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {allSpecs.map((s) => {
                  const active = selectedSpecs.includes(s.name);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSpec(s.name)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      {active && <Check size={11} />}
                      {s.name}
                    </button>
                  );
                })}
              </div>
              {/* Custom domain input */}
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomDomain(); } }}
                  placeholder="Type a custom domain…"
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-gray-50 text-gray-700 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={addCustomDomain}
                  disabled={!customDomain.trim()}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors border border-primary/20"
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          )}

          {/* Pending Referrals */}
          <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-serif text-lg font-bold text-gray-900">{T.pendingReferrals}</h2>
              {pendingReferrals.length > 0 && (
                <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full">
                  {pendingReferrals.length} new
                </span>
              )}
            </div>

            {pendingReferrals.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted text-sm">No pending referrals.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingReferrals.map((ref) => (
                  <div key={ref.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{ref.client_name || 'Client'}</span>
                        {(ref.domain || ref.specialization) && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {ref.domain || ref.specialization}
                          </span>
                        )}
                      </div>
                      {ref.city && (
                        <p className="text-xs text-muted flex items-center gap-1 mb-2">
                          <MapPin size={11} /> {ref.city}
                        </p>
                      )}
                      {ref.message && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{ref.message}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleReferralAction(ref.id, 'accept')}
                        disabled={!!actionLoading}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light disabled:opacity-60 transition-colors flex items-center gap-1"
                      >
                        {actionLoading === ref.id + 'accept' ? <Loader2 size={12} className="animate-spin" /> : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleReferralAction(ref.id, 'decline')}
                        disabled={!!actionLoading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors flex items-center gap-1"
                      >
                        {actionLoading === ref.id + 'decline' ? <Loader2 size={12} className="animate-spin" /> : 'Decline'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
