'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck, Clock, FileText,
  ArrowLeft, ArrowRight, Calendar, Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { documents as documentsApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function Field({ children }) {
  return children
    ? <span className="font-semibold text-gray-900">{children}</span>
    : <span className="inline-block bg-gray-100 rounded w-32 h-3.5 align-middle" />;
}

function DocumentPreview({ form, lang }) {
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const today = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const hasAny = Object.values(form).some((v) => v.trim() !== '');

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <FileText size={32} className="text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">Fill in the form to see the live preview</p>
      </div>
    );
  }

  if (lang === 'en') {
    return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, {today}</div>
        <div className="mb-6">
          <p className="font-bold">{form.yourFullName || '...'}</p>
          <p className="text-gray-600">{form.yourAddress || '...'}</p>
        </div>
        <div className="mb-8">
          <p className="font-bold">{form.employerName || '...'}</p>
          <p className="text-gray-600">{form.employerAddress || '...'}</p>
        </div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Re: Formal Notice — Unpaid Wages</p>
        <p>Dear Sir / Madam,</p>
        <p>
          I, the undersigned <Field>{form.yourFullName}</Field>, residing at <Field>{form.yourAddress}</Field>,
          was employed by your company <Field>{form.employerName}</Field>
          {form.contractType ? ` under a ${form.contractType} contract` : ''}.
        </p>
        <p>
          My last day of work was <Field>{form.lastDayWorked}</Field>.
          As of today, you remain indebted to me in the amount of{' '}
          <Field>{form.amountOwed ? `${form.amountOwed} FCFA` : ''}</Field> in unpaid wages.
        </p>
        <p>
          I hereby formally demand that you settle the amount owed within{' '}
          <strong>eight (8) days</strong> of receiving this letter.
          Failing this, I shall be compelled to initiate all necessary legal proceedings to obtain satisfaction,
          including but not limited to a complaint before the Labour Inspectorate.
        </p>
        {form.additionalContext && (
          <p className="text-gray-600 italic border-l-2 border-gray-200 pl-3">{form.additionalContext}</p>
        )}
        <p>Yours faithfully,</p>
        <div className="mt-8">
          <p>{form.yourFullName || '...'}</p>
          <p className="text-gray-500 text-xs">{today}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
      <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, le {today}</div>
      <div className="mb-6">
        <p className="font-bold">{form.yourFullName || '...'}</p>
        <p className="text-gray-600">{form.yourAddress || '...'}</p>
      </div>
      <div className="mb-8">
        <p className="font-bold">{form.employerName || '...'}</p>
        <p className="text-gray-600">{form.employerAddress || '...'}</p>
      </div>
      <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Objet : Mise en Demeure — Paiement de Salaire Impayé</p>
      <p>Monsieur / Madame,</p>
      <p>
        Je soussigné(e), <Field>{form.yourFullName}</Field>, demeurant à <Field>{form.yourAddress}</Field>,
        ai été employé(e) au sein de votre entreprise <Field>{form.employerName}</Field>
        {form.contractType ? ` dans le cadre d'un contrat de type ${form.contractType}` : ''}.
      </p>
      <p>
        Mon dernier jour travaillé était le <Field>{form.lastDayWorked}</Field>.
        À ce jour, vous restez redevable d&apos;une somme de{' '}
        <Field>{form.amountOwed ? `${form.amountOwed} FCFA` : ''}</Field> correspondant aux salaires impayés.
      </p>
      <p>
        En conséquence, je vous mets en demeure de procéder au règlement de la somme due dans un délai de{' '}
        <strong>huit (8) jours</strong> à compter de la réception du présent courrier.
        À défaut, je me verrai contraint(e) d&apos;engager toutes les procédures légales nécessaires pour obtenir satisfaction.
      </p>
      {form.additionalContext && (
        <p className="text-gray-600 italic border-l-2 border-gray-200 pl-3">{form.additionalContext}</p>
      )}
      <p>Dans l&apos;attente d&apos;une réponse favorable de votre part, veuillez agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.</p>
      <div className="mt-8">
        <p>{form.yourFullName || '...'}</p>
        <p className="text-gray-500 text-xs">{today}</p>
      </div>
    </div>
  );
}

export default function DocumentGenerationDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const T = t[lang].documentDetails;

  const [form, setForm] = useState({
    employerName: '',
    employerAddress: '',
    yourFullName: '',
    yourAddress: '',
    amountOwed: '',
    lastDayWorked: '',
    contractType: '',
    additionalContext: '',
  });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const hasContent = Object.values(form).some((v) => v.trim() !== '');

  async function handleContinue(e) {
    e.preventDefault();
    setGenError('');
    setGenerating(true);
    try {
      const doc = await documentsApi.generate(slug, form);
      sessionStorage.setItem('pending_payment_doc', JSON.stringify({
        id: doc.id,
        title: doc.title,
        price: doc.price ?? 5000,
        currency: doc.currency ?? 'XAF',
        slug,
      }));
      router.push(`/documents/${slug}/pay`);
    } catch (err) {
      setGenError(err.message ?? 'Failed to prepare document. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col justify-between">

      <Header activePage="documents" />

      <main className="max-w-7xl w-full mx-auto px-6 md:px-16 py-10 flex-1 flex flex-col">

        {/* 3-step progress stepper */}
        <div className="w-full max-w-xl mx-auto mb-12 relative flex items-center justify-between select-none">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div className="absolute top-4 left-0 w-1/2 h-0.5 bg-primary -z-10" />
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary shadow-sm text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <span className="text-[11px] font-bold text-gray-400 mt-2">{T.stepTemplate}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-white border-4 border-white ring-2 ring-primary text-gray-900 flex items-center justify-center shadow-sm font-bold text-xs">2</div>
            <span className="text-[11px] font-bold text-gray-900 mt-2">{T.stepDetails}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-white text-gray-300 border-2 border-gray-200 flex items-center justify-center font-bold text-xs">3</div>
            <span className="text-[11px] font-bold text-gray-300 mt-2">{T.stepPayment}</span>
          </div>
        </div>

        {/* Page heading + price badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 w-full">
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
              Mise en Demeure – Salaire Impayé
            </h2>
            <p className="text-muted text-sm mt-1">{T.docDesc}</p>
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
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2">{T.employerInfo}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">{T.employerName}</label>
                  <input type="text" value={form.employerName} onChange={set('employerName')} placeholder={T.employerNamePlaceholder} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block mb-1.5">{T.employerAddress}</label>
                  <input type="text" value={form.employerAddress} onChange={set('employerAddress')} placeholder={T.employerAddressPlaceholder} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2">{T.yourInfo}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">{T.yourFullName}</label>
                  <input type="text" value={form.yourFullName} onChange={set('yourFullName')} placeholder={T.yourFullNamePlaceholder} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block mb-1.5">{T.yourAddress}</label>
                  <input type="text" value={form.yourAddress} onChange={set('yourAddress')} placeholder={T.yourAddressPlaceholder} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2">{T.claimDetails}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">{T.amountOwed}</label>
                  <input type="text" value={form.amountOwed} onChange={set('amountOwed')} placeholder={T.amountOwedPlaceholder} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block mb-1.5">{T.lastDayWorked}</label>
                  <div className="relative bg-white border border-gray-300 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                    <input type="date" value={form.lastDayWorked} onChange={set('lastDayWorked')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none pr-10" />
                    <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-700">
                <label className="block mb-1.5">{T.contractType}</label>
                <div className="relative bg-white border border-gray-300 rounded-lg">
                  <select value={form.contractType} onChange={set('contractType')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary/30 focus:border-primary/50 rounded-lg">
                    <option value="">{T.selectContractType}</option>
                    <option value="CDI (Contrat à Durée Indéterminée)">CDI (Indefinite)</option>
                    <option value="CDD (Contrat à Durée Déterminée)">CDD (Fixed-term)</option>
                    <option value="Contrat Verbal">Oral Agreement</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-700">
                <label className="block mb-1.5">
                  {T.additionalContext}{' '}
                  <span className="font-normal text-gray-400">({T.optional})</span>
                </label>
                <textarea
                  rows={3}
                  value={form.additionalContext}
                  onChange={set('additionalContext')}
                  placeholder={T.additionalContextPlaceholder}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300"
                />
              </div>
            </div>
          </form>

          {/* Right: Live Preview + trust badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`rounded-2xl border-2 p-6 min-h-[465px] shadow-inner transition-all ${hasContent ? 'bg-white border-gray-200 overflow-y-auto' : 'bg-white/40 border-dashed border-gray-300/80 flex flex-col items-center justify-center'}`}>
              <DocumentPreview form={form} lang={lang} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200/50 text-center flex flex-col items-center justify-center shadow-sm">
                <ShieldCheck size={18} className="text-gray-700 mb-1.5" />
                <span className="text-[10px] font-bold text-gray-700 tracking-tight">{T.legallyVetted}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/50 text-center flex flex-col items-center justify-center shadow-sm">
                <Clock size={18} className="text-gray-700 mb-1.5" />
                <span className="text-[10px] font-bold text-gray-700 tracking-tight">{T.instantDelivery}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/50 text-center flex flex-col items-center justify-center shadow-sm">
                <FileText size={18} className="text-gray-700 mb-1.5" />
                <span className="text-[10px] font-bold text-gray-700 tracking-tight">{T.pdfWord}</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom navigation bar */}
      <div className="w-full bg-background border-t border-gray-200/60 py-6 px-6 md:px-16 flex items-center justify-between mt-12">
        <a href="/documents" className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm">
          <ArrowLeft size={16} />
          {T.backToTemplates}
        </a>
        <div className="flex flex-col items-end gap-2">
          {genError && <p className="text-xs font-semibold text-red-500">{genError}</p>}
          <button
            onClick={handleContinue}
            disabled={generating}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-bold py-3.5 px-6 rounded-lg text-sm flex items-center gap-2 shadow-sm"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <>{T.continueToPayment} <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>

    </div>
  );
}
