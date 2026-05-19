'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, MapPin, Globe, IdCard,
  Building, Send, MessageSquare, CheckCircle2, Clock, Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { lawyers as lawyersApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function initials(name) {
  return (name ?? '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function LawyerProfileView() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const T = t[lang].lawyerView;

  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await lawyersApi.get(id);
        setLawyer(data);
      } catch {
        setError('Lawyer not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const verified = lawyer?.verification_status === 'verified';
  const specs = lawyer?.specializations ?? [];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">

      <Header activePage="lawyer" />

      <div className="flex-1 pb-16">

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <a href="/lawyer" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14} /> {T.backToLawyers}
          </a>
        </div>

        {loading && (
          <div className="max-w-6xl mx-auto px-4 mt-12 flex justify-center">
            <Loader2 size={32} className="animate-spin text-primary opacity-60" />
          </div>
        )}

        {error && (
          <div className="max-w-6xl mx-auto px-4 mt-12 text-center">
            <p className="text-gray-500 font-semibold">{error}</p>
            <a href="/lawyer" className="mt-4 inline-block text-sm text-primary font-bold hover:underline">Back to directory</a>
          </div>
        )}

        {!loading && !error && lawyer && (
          <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left column */}
            <div className="lg:col-span-8 space-y-6">

              {/* Identity banner */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                  {lawyer.profile_photo_url ? (
                    <img src={lawyer.profile_photo_url} alt={lawyer.full_name} className="w-24 h-24 rounded-full object-cover flex-shrink-0 border border-primary/20 shadow-inner" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl flex-shrink-0 border border-primary/20 shadow-inner select-none relative">
                      {initials(lawyer.full_name)}
                      {verified && (
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                          <CheckCircle2 size={18} className="text-emerald-700 fill-emerald-700" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{lawyer.full_name}</h2>
                      {!verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                    {lawyer.type && (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{lawyer.type}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-3 text-xs font-medium text-gray-500">
                      {(lawyer.city || lawyer.region) && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          {lawyer.city}{lawyer.region ? `, ${lawyer.region}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:w-auto w-full gap-2.5 flex-shrink-0 self-stretch sm:self-auto justify-start">
                  {verified ? (
                    <a href={`/lawyer/${id}/referral`} className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 shadow-sm w-full">
                      <Send size={14} /> {T.requestReferral}
                    </a>
                  ) : (
                    <span className="border border-gray-200 bg-gray-50 text-gray-400 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 w-full cursor-not-allowed">
                      <Clock size={14} /> Verification Pending
                    </span>
                  )}
                </div>
              </div>

              {/* About */}
              {lawyer.bio && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-gray-900">{T.about}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{lawyer.bio}</p>
                </div>
              )}

              {/* Areas of Practice */}
              {specs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-gray-900">{T.areasOfPractice}</h3>
                  <div className="flex flex-wrap gap-2">
                    {specs.map((s) => (
                      <span key={s.id ?? s.name} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews placeholder */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center mb-4 shadow-inner">
                  <MessageSquare size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-gray-900 mb-1">{T.noReviews}</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm font-semibold">{T.reviewsNote}</p>
              </div>

            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-4 space-y-6">

              {/* Contact / action card */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{T.contactDetails}</h3>
                <div className="space-y-3 text-xs font-medium text-gray-700">
                  {(lawyer.city || lawyer.region) && (
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-800 font-bold">{lawyer.city}{lawyer.region ? `, ${lawyer.region}` : ''}</span>
                    </div>
                  )}
                  {lawyer.type && (
                    <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-center gap-3">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-gray-700 font-semibold">{lawyer.type}</span>
                    </div>
                  )}
                </div>
                {verified && (
                  <div className="pt-2 space-y-3">
                    <a href={`/lawyer/${id}/referral`} className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm">
                      <Send size={14} /> {T.sendMessage}
                    </a>
                    <p className="text-[10px] text-center text-gray-400 font-semibold">{T.secureNote}</p>
                  </div>
                )}
              </div>

              {/* Accepting cases badge */}
              {lawyer.is_accepting_cases !== undefined && (
                <div className={`rounded-xl border shadow-sm p-4 flex items-center gap-3 text-xs font-bold ${lawyer.is_accepting_cases ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {lawyer.is_accepting_cases ? (
                    <><CheckCircle2 size={16} className="flex-shrink-0" /> Accepting new cases</>
                  ) : (
                    <><Clock size={16} className="flex-shrink-0" /> Not accepting new cases</>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
