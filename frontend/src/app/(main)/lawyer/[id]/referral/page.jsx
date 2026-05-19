'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, MapPin, Scale, ChevronDown, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { lawyers as lawyersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function initials(name) {
  return (name ?? '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ReferralRequest() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const T = t[lang].referral;

  const [lawyer, setLawyer] = useState(null);
  const [lawyerLoading, setLawyerLoading] = useState(true);

  const [issueSummary, setIssueSummary] = useState('');
  const [domain, setDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?next=/lawyer/${id}/referral`);
    }
  }, [authLoading, user, id, router]);

  useEffect(() => {
    async function loadLawyer() {
      try {
        const data = await lawyersApi.get(id);
        setLawyer(data);
      } catch {
        /* non-critical — form still works without the card */
      } finally {
        setLawyerLoading(false);
      }
    }
    if (id) loadLawyer();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!issueSummary.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await lawyersApi.createReferral(id, {
        issue_summary: issueSummary,
        ...(domain ? { domain } : {}),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message ?? 'Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
        <Header activePage="lawyer" />
        <div className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-10 max-w-md w-full flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle size={26} className="text-emerald-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">{T.successTitle}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">{T.successDesc}</p>
            <a href="/lawyer" className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3 px-6 rounded-lg text-sm flex items-center justify-center gap-2">
              {T.backToDirectory}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="lawyer" />

      <div className="flex-1 flex items-center justify-center py-12 px-6 md:px-16">
        <div className="max-w-3xl w-full space-y-8 flex flex-col items-center">

          {/* Back link */}
          <div className="w-full max-w-2xl">
            <a href={`/lawyer/${id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={14} /> {T.backToProfile}
            </a>
          </div>

          {/* Header Block */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary tracking-tight">{T.title}</h2>
            <p className="text-gray-500 text-sm md:text-base font-medium max-w-xl">{T.subtitle}</p>
          </div>

          {/* Lawyer Summary Card */}
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-5 flex items-center gap-4 w-full max-w-2xl">
            {lawyerLoading ? (
              <div className="flex items-center gap-4 w-full animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ) : lawyer ? (
              <>
                {lawyer.profile_photo_url ? (
                  <img src={lawyer.profile_photo_url} alt={lawyer.full_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-primary/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0 border border-primary/20 select-none">
                    {initials(lawyer.full_name)}
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">{lawyer.full_name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-400">
                    {(lawyer.city || lawyer.region) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {lawyer.city}{lawyer.region ? `, ${lawyer.region}` : ''}
                      </span>
                    )}
                    {lawyer.specializations?.[0] && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Scale size={13} className="text-gray-400" />
                          {lawyer.specializations[0].name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 w-full max-w-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>

              <div className="space-y-1.5 text-xs font-bold text-gray-700">
                <label htmlFor="legal-issue" className="block text-gray-800">{T.describeIssue}</label>
                <textarea
                  id="legal-issue"
                  rows={5}
                  value={issueSummary}
                  onChange={(e) => setIssueSummary(e.target.value)}
                  placeholder={T.issuePlaceholder}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow resize-none leading-relaxed placeholder:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div className="space-y-1.5">
                  <label htmlFor="legal-domain" className="block text-gray-800">{T.legalDomain}</label>
                  <div className="relative bg-white border border-gray-300 rounded-lg">
                    <select
                      id="legal-domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary rounded-lg"
                    >
                      <option value="">{T.selectArea}</option>
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
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
              )}

              <div className="border-t border-gray-100 pt-2" />

              <div className="space-y-5 text-center">
                <button
                  type="submit"
                  disabled={submitting || !issueSummary.trim()}
                  className="w-full sm:w-auto mx-auto bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-bold py-3 px-8 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {T.sendRequest}
                </button>

                <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-md mx-auto text-balance select-none">
                  {T.disclaimer}
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
