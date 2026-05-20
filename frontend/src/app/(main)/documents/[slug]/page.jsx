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

// ─── per-template metadata ───────────────────────────────────────────────────

const TEMPLATE_META = {
  'unpaid-wages': {
    title:   (l) => l === 'fr' ? 'Mise en Demeure – Salaire Impayé' : 'Formal Notice – Unpaid Wages',
    desc:    (l) => l === 'fr' ? 'Lettre de mise en demeure pour salaires impayés.' : 'Formal demand letter for unpaid wages.',
    initial: { employerName:'', employerAddress:'', yourFullName:'', yourAddress:'', amountOwed:'', lastDayWorked:'', contractType:'', additionalContext:'' },
  },
  'housing-dispute': {
    title:   (l) => l === 'fr' ? 'Litige Locatif' : 'Housing Dispute',
    desc:    (l) => l === 'fr' ? 'Lettre formelle concernant un litige entre locataire et propriétaire.' : 'Formal letter regarding a tenant or landlord disagreement.',
    initial: { landlordName:'', landlordAddress:'', yourFullName:'', yourAddress:'', propertyAddress:'', issueType:'', issueDate:'', description:'', requestedAction:'' },
  },
  'lettre-reclamation': {
    title:   (l) => l === 'fr' ? 'Lettre de Réclamation' : 'Complaint Letter',
    desc:    (l) => l === 'fr' ? 'Lettre de réclamation générale pour droits des consommateurs ou problèmes de service.' : 'General complaint letter for consumer rights or service issues.',
    initial: { recipientName:'', recipientAddress:'', yourFullName:'', yourAddress:'', subject:'', incidentDate:'', description:'', requestedResolution:'' },
  },
  'denonciation-conge': {
    title:   (l) => l === 'fr' ? 'Dénonciation de Congé' : 'Notice of Tenancy Termination',
    desc:    (l) => l === 'fr' ? 'Avis formel pour contester ou répondre à une expulsion ou résiliation de bail.' : 'Formal notice to contest or respond to an eviction or lease termination.',
    initial: { landlordName:'', landlordAddress:'', yourFullName:'', yourAddress:'', propertyAddress:'', leaseEndDate:'', contestReason:'', additionalContext:'' },
  },
  'declaration-faits': {
    title:   (l) => l === 'fr' ? 'Déclaration de Faits' : 'Declaration of Facts',
    desc:    (l) => l === 'fr' ? 'Déclaration assermentée documentant des événements ou des faits spécifiques pour les dossiers juridiques.' : 'Formal sworn statement documenting specific events or facts for legal records.',
    initial: { yourFullName:'', yourAddress:'', yourId:'', factsDate:'', factsLocation:'', factsDescription:'', witnessName:'', additionalNotes:'' },
  },
};

// ─── form field sets ─────────────────────────────────────────────────────────

function FormFields({ slug, form, set, lang }) {
  const fr = lang === 'fr';
  const inputCls = 'w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow placeholder:text-gray-300';
  const labelCls = 'block mb-1.5';
  const sectionTitle = 'font-serif text-xl font-bold text-primary border-b border-gray-100 pb-2';

  if (slug === 'unpaid-wages') {
    return (
      <>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? "Informations sur l'Employeur" : 'Employer Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? "Nom de l'Employeur" : 'Employer Name'}</label>
              <input type="text" value={form.employerName} onChange={set('employerName')} placeholder={fr ? 'ex. SARL Exemple' : 'e.g. SARL Exemple'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? "Adresse de l'Employeur" : 'Employer Address'}</label>
              <input type="text" value={form.employerAddress} onChange={set('employerAddress')} placeholder={fr ? 'Quartier, Ville' : 'Quarter, City'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Vos Informations' : 'Your Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Votre Nom Complet' : 'Your Full Name'}</label>
              <input type="text" value={form.yourFullName} onChange={set('yourFullName')} placeholder={fr ? 'Jean Dupont' : 'John Doe'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Votre Adresse' : 'Your Address'}</label>
              <input type="text" value={form.yourAddress} onChange={set('yourAddress')} placeholder={fr ? 'Votre adresse résidentielle' : 'Your residential address'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Détails de la Réclamation' : 'Claim Details'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Montant Dû (XAF)' : 'Amount Owed (XAF)'}</label>
              <input type="text" value={form.amountOwed} onChange={set('amountOwed')} placeholder="ex. 150000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Dernier Jour Travaillé' : 'Last Day Worked'}</label>
              <div className="relative bg-white border border-gray-300 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                <input type="date" value={form.lastDayWorked} onChange={set('lastDayWorked')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none pr-10" />
                <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Type de Contrat' : 'Contract Type'}</label>
            <div className="relative bg-white border border-gray-300 rounded-lg">
              <select value={form.contractType} onChange={set('contractType')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary/30 rounded-lg">
                <option value="">{fr ? 'Sélectionnez le type de contrat' : 'Select contract type'}</option>
                <option value="CDI">CDI {fr ? '(Durée Indéterminée)' : '(Indefinite)'}</option>
                <option value="CDD">CDD {fr ? '(Durée Déterminée)' : '(Fixed-term)'}</option>
                <option value="Contrat Verbal">{fr ? 'Contrat Verbal' : 'Oral Agreement'}</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Contexte Supplémentaire' : 'Additional Context'} <span className="font-normal text-gray-400">({fr ? 'Facultatif' : 'Optional'})</span></label>
            <textarea rows={3} value={form.additionalContext} onChange={set('additionalContext')} placeholder={fr ? 'Décrivez brièvement les détails pertinents...' : 'Briefly describe any relevant details...'} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300" />
          </div>
        </div>
      </>
    );
  }

  if (slug === 'housing-dispute') {
    return (
      <>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Informations sur le Propriétaire' : 'Landlord Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Nom du Propriétaire' : 'Landlord Name'}</label>
              <input type="text" value={form.landlordName} onChange={set('landlordName')} placeholder={fr ? 'M. / Mme ...' : 'Mr. / Mrs. ...'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Adresse du Propriétaire' : 'Landlord Address'}</label>
              <input type="text" value={form.landlordAddress} onChange={set('landlordAddress')} placeholder={fr ? 'Quartier, Ville' : 'Quarter, City'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Vos Informations' : 'Your Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Votre Nom Complet' : 'Your Full Name'}</label>
              <input type="text" value={form.yourFullName} onChange={set('yourFullName')} placeholder={fr ? 'Jean Dupont' : 'John Doe'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Votre Adresse' : 'Your Address'}</label>
              <input type="text" value={form.yourAddress} onChange={set('yourAddress')} placeholder={fr ? 'Votre adresse résidentielle' : 'Your residential address'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Détails du Litige' : 'Dispute Details'}</h3>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Adresse du Bien Loué' : 'Rental Property Address'}</label>
            <input type="text" value={form.propertyAddress} onChange={set('propertyAddress')} placeholder={fr ? 'Adresse complète du logement' : 'Full address of the rental property'} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Type de Problème' : 'Issue Type'}</label>
              <div className="relative bg-white border border-gray-300 rounded-lg">
                <select value={form.issueType} onChange={set('issueType')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary/30 rounded-lg">
                  <option value="">{fr ? 'Sélectionnez...' : 'Select...'}</option>
                  <option value={fr ? 'Réparations non effectuées' : 'Repairs not done'}>{fr ? 'Réparations non effectuées' : 'Repairs not done'}</option>
                  <option value={fr ? 'Expulsion abusive' : 'Unlawful eviction'}>{fr ? 'Expulsion abusive' : 'Unlawful eviction'}</option>
                  <option value={fr ? 'Litige de loyer' : 'Rent dispute'}>{fr ? 'Litige de loyer' : 'Rent dispute'}</option>
                  <option value={fr ? 'Insalubrité du logement' : 'Uninhabitable conditions'}>{fr ? 'Insalubrité du logement' : 'Uninhabitable conditions'}</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div>
              <label className={labelCls}>{fr ? "Date du Problème" : 'Date of Issue'}</label>
              <div className="relative bg-white border border-gray-300 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                <input type="date" value={form.issueDate} onChange={set('issueDate')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none pr-10" />
                <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Description du Problème' : 'Description of Issue'}</label>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder={fr ? 'Décrivez le problème en détail...' : 'Describe the issue in detail...'} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300" />
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Action Demandée' : 'Requested Action'}</label>
            <input type="text" value={form.requestedAction} onChange={set('requestedAction')} placeholder={fr ? 'ex. Effectuer les réparations sous 15 jours' : 'e.g. Complete repairs within 15 days'} className={inputCls} />
          </div>
        </div>
      </>
    );
  }

  if (slug === 'lettre-reclamation') {
    return (
      <>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Informations sur le Destinataire' : 'Recipient Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Nom / Société Destinataire' : 'Recipient Name / Company'}</label>
              <input type="text" value={form.recipientName} onChange={set('recipientName')} placeholder={fr ? 'ex. Service Client XYZ' : 'e.g. XYZ Customer Service'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Adresse du Destinataire' : 'Recipient Address'}</label>
              <input type="text" value={form.recipientAddress} onChange={set('recipientAddress')} placeholder={fr ? 'Quartier, Ville' : 'Quarter, City'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Vos Informations' : 'Your Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Votre Nom Complet' : 'Your Full Name'}</label>
              <input type="text" value={form.yourFullName} onChange={set('yourFullName')} placeholder={fr ? 'Jean Dupont' : 'John Doe'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Votre Adresse' : 'Your Address'}</label>
              <input type="text" value={form.yourAddress} onChange={set('yourAddress')} placeholder={fr ? 'Votre adresse résidentielle' : 'Your residential address'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Détails de la Réclamation' : 'Complaint Details'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Objet de la Réclamation' : 'Subject of Complaint'}</label>
              <input type="text" value={form.subject} onChange={set('subject')} placeholder={fr ? 'ex. Produit défectueux' : 'e.g. Defective product'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? "Date de l'Incident" : 'Date of Incident'}</label>
              <div className="relative bg-white border border-gray-300 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                <input type="date" value={form.incidentDate} onChange={set('incidentDate')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none pr-10" />
                <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Description des Faits' : 'Description of Facts'}</label>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder={fr ? 'Décrivez les faits en détail...' : 'Describe the facts in detail...'} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300" />
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Résolution Demandée' : 'Requested Resolution'}</label>
            <input type="text" value={form.requestedResolution} onChange={set('requestedResolution')} placeholder={fr ? 'ex. Remboursement intégral sous 8 jours' : 'e.g. Full refund within 8 days'} className={inputCls} />
          </div>
        </div>
      </>
    );
  }

  if (slug === 'denonciation-conge') {
    return (
      <>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Informations sur le Propriétaire' : 'Landlord Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Nom du Propriétaire' : 'Landlord Name'}</label>
              <input type="text" value={form.landlordName} onChange={set('landlordName')} placeholder={fr ? 'M. / Mme ...' : 'Mr. / Mrs. ...'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Adresse du Propriétaire' : 'Landlord Address'}</label>
              <input type="text" value={form.landlordAddress} onChange={set('landlordAddress')} placeholder={fr ? 'Quartier, Ville' : 'Quarter, City'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Vos Informations' : 'Your Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Votre Nom Complet' : 'Your Full Name'}</label>
              <input type="text" value={form.yourFullName} onChange={set('yourFullName')} placeholder={fr ? 'Jean Dupont' : 'John Doe'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Votre Adresse' : 'Your Address'}</label>
              <input type="text" value={form.yourAddress} onChange={set('yourAddress')} placeholder={fr ? 'Votre adresse résidentielle' : 'Your residential address'} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Détails du Bail' : 'Lease Details'}</h3>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Adresse du Bien' : 'Property Address'}</label>
            <input type="text" value={form.propertyAddress} onChange={set('propertyAddress')} placeholder={fr ? 'Adresse complète du logement' : 'Full address of the property'} className={inputCls} />
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Date de Fin de Bail Notifiée' : 'Notified Lease End Date'}</label>
            <div className="relative bg-white border border-gray-300 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
              <input type="date" value={form.leaseEndDate} onChange={set('leaseEndDate')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none pr-10" />
              <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Motif de Contestation' : 'Reason for Contesting'}</label>
            <textarea rows={3} value={form.contestReason} onChange={set('contestReason')} placeholder={fr ? 'Expliquez pourquoi vous contestez ce congé...' : 'Explain why you are contesting this notice...'} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300" />
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Informations Supplémentaires' : 'Additional Information'} <span className="font-normal text-gray-400">({fr ? 'Facultatif' : 'Optional'})</span></label>
            <textarea rows={2} value={form.additionalContext} onChange={set('additionalContext')} placeholder={fr ? 'Tout autre détail pertinent...' : 'Any other relevant details...'} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300" />
          </div>
        </div>
      </>
    );
  }

  if (slug === 'declaration-faits') {
    return (
      <>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Informations sur le Déclarant' : 'Declarant Information'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Nom Complet' : 'Full Name'}</label>
              <input type="text" value={form.yourFullName} onChange={set('yourFullName')} placeholder={fr ? 'Jean Dupont' : 'John Doe'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Adresse' : 'Address'}</label>
              <input type="text" value={form.yourAddress} onChange={set('yourAddress')} placeholder={fr ? 'Quartier, Ville' : 'Quarter, City'} className={inputCls} />
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? "Numéro de Carte d'Identité" : 'ID Card Number'} <span className="font-normal text-gray-400">({fr ? 'Facultatif' : 'Optional'})</span></label>
            <input type="text" value={form.yourId} onChange={set('yourId')} placeholder={fr ? 'ex. 123456789' : 'e.g. 123456789'} className={inputCls} />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Faits à Déclarer' : 'Facts to Declare'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Date des Faits' : 'Date of Events'}</label>
              <div className="relative bg-white border border-gray-300 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-shadow">
                <input type="date" value={form.factsDate} onChange={set('factsDate')} className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none pr-10" />
                <Calendar size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Lieu des Faits' : 'Location of Events'}</label>
              <input type="text" value={form.factsLocation} onChange={set('factsLocation')} placeholder={fr ? 'ex. Yaoundé, Quartier Bastos' : 'e.g. Yaoundé, Bastos'} className={inputCls} />
            </div>
          </div>
          <div className="text-xs font-bold text-gray-700">
            <label className={labelCls}>{fr ? 'Description des Faits' : 'Description of Facts'}</label>
            <textarea rows={4} value={form.factsDescription} onChange={set('factsDescription')} placeholder={fr ? 'Décrivez précisément les faits que vous souhaitez déclarer...' : 'Precisely describe the facts you wish to declare...'} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-shadow resize-none leading-relaxed placeholder:text-gray-300" />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className={sectionTitle}>{fr ? 'Témoin' : 'Witness'} <span className="text-sm font-normal text-gray-400">({fr ? 'Facultatif' : 'Optional'})</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className={labelCls}>{fr ? 'Nom du Témoin' : 'Witness Name'}</label>
              <input type="text" value={form.witnessName} onChange={set('witnessName')} placeholder={fr ? 'Nom complet' : 'Full name'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{fr ? 'Notes Supplémentaires' : 'Additional Notes'}</label>
              <input type="text" value={form.additionalNotes} onChange={set('additionalNotes')} placeholder={fr ? 'Tout autre détail...' : 'Any other details...'} className={inputCls} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

// ─── document previews ────────────────────────────────────────────────────────

function DocumentPreview({ slug, form, lang }) {
  const fr = lang === 'fr';
  const locale = fr ? 'fr-FR' : 'en-GB';
  const today = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const hasAny = Object.values(form).some((v) => v.trim() !== '');

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <FileText size={32} className="text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">{fr ? 'Remplissez le formulaire pour voir l\'aperçu' : 'Fill in the form to see the live preview'}</p>
      </div>
    );
  }

  if (slug === 'unpaid-wages') {
    if (!fr) return (
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
        <p>I, the undersigned <Field>{form.yourFullName}</Field>, residing at <Field>{form.yourAddress}</Field>, was employed by <Field>{form.employerName}</Field>{form.contractType ? ` under a ${form.contractType} contract` : ''}.</p>
        <p>My last day of work was <Field>{form.lastDayWorked}</Field>. As of today, you remain indebted to me in the amount of <Field>{form.amountOwed ? `${form.amountOwed} FCFA` : ''}</Field> in unpaid wages.</p>
        <p>I hereby formally demand that you settle the amount owed within <strong>eight (8) days</strong> of receiving this letter. Failing this, I shall be compelled to initiate all necessary legal proceedings.</p>
        {form.additionalContext && <p className="text-gray-600 italic border-l-2 border-gray-200 pl-3">{form.additionalContext}</p>}
        <p>Yours faithfully,</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
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
        <p>Je soussigné(e), <Field>{form.yourFullName}</Field>, demeurant à <Field>{form.yourAddress}</Field>, ai été employé(e) au sein de votre entreprise <Field>{form.employerName}</Field>{form.contractType ? ` dans le cadre d'un contrat de type ${form.contractType}` : ''}.</p>
        <p>Mon dernier jour travaillé était le <Field>{form.lastDayWorked}</Field>. À ce jour, vous restez redevable d&apos;une somme de <Field>{form.amountOwed ? `${form.amountOwed} FCFA` : ''}</Field> correspondant aux salaires impayés.</p>
        <p>En conséquence, je vous mets en demeure de procéder au règlement de la somme due dans un délai de <strong>huit (8) jours</strong> à compter de la réception du présent courrier. À défaut, je me verrai contraint(e) d&apos;engager toutes les procédures légales nécessaires.</p>
        {form.additionalContext && <p className="text-gray-600 italic border-l-2 border-gray-200 pl-3">{form.additionalContext}</p>}
        <p>Dans l&apos;attente d&apos;une réponse favorable, veuillez agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
  }

  if (slug === 'housing-dispute') {
    if (!fr) return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, {today}</div>
        <div className="mb-6"><p className="font-bold">{form.yourFullName || '...'}</p><p className="text-gray-600">{form.yourAddress || '...'}</p></div>
        <div className="mb-8"><p className="font-bold">{form.landlordName || '...'}</p><p className="text-gray-600">{form.landlordAddress || '...'}</p></div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Re: Formal Notice — Housing Dispute</p>
        <p>Dear Sir / Madam,</p>
        <p>I, <Field>{form.yourFullName}</Field>, tenant of the property located at <Field>{form.propertyAddress}</Field>, hereby bring to your attention the following issue{form.issueType ? `: ${form.issueType}` : ''}.</p>
        {form.issueDate && <p>This issue has been ongoing since <Field>{form.issueDate}</Field>.</p>}
        {form.description && <p className="text-gray-700">{form.description}</p>}
        {form.requestedAction && <p>I therefore request that you: <strong>{form.requestedAction}</strong>, failing which I will be compelled to pursue all legal remedies available under Cameroonian law.</p>}
        <p>Yours faithfully,</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
    return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, le {today}</div>
        <div className="mb-6"><p className="font-bold">{form.yourFullName || '...'}</p><p className="text-gray-600">{form.yourAddress || '...'}</p></div>
        <div className="mb-8"><p className="font-bold">{form.landlordName || '...'}</p><p className="text-gray-600">{form.landlordAddress || '...'}</p></div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Objet : Litige Locatif — Mise en Demeure</p>
        <p>Monsieur / Madame,</p>
        <p>Je soussigné(e), <Field>{form.yourFullName}</Field>, locataire du bien situé au <Field>{form.propertyAddress}</Field>, vous informe par la présente du problème suivant{form.issueType ? ` : ${form.issueType}` : ''}.</p>
        {form.issueDate && <p>Ce problème persiste depuis le <Field>{form.issueDate}</Field>.</p>}
        {form.description && <p className="text-gray-700">{form.description}</p>}
        {form.requestedAction && <p>Je vous demande en conséquence de : <strong>{form.requestedAction}</strong>, faute de quoi je serai contraint(e) d&apos;engager toutes les voies de recours légaux prévus par le droit camerounais.</p>}
        <p>Dans l&apos;attente d&apos;une réponse favorable, veuillez agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
  }

  if (slug === 'lettre-reclamation') {
    if (!fr) return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, {today}</div>
        <div className="mb-6"><p className="font-bold">{form.yourFullName || '...'}</p><p className="text-gray-600">{form.yourAddress || '...'}</p></div>
        <div className="mb-8"><p className="font-bold">{form.recipientName || '...'}</p><p className="text-gray-600">{form.recipientAddress || '...'}</p></div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Re: Formal Complaint{form.subject ? ` — ${form.subject}` : ''}</p>
        <p>Dear Sir / Madam,</p>
        <p>I, <Field>{form.yourFullName}</Field>, am writing to formally lodge a complaint regarding{form.subject ? ` the following matter: ${form.subject}` : ' the matter described below'}.</p>
        {form.incidentDate && <p>The incident occurred on <Field>{form.incidentDate}</Field>.</p>}
        {form.description && <p className="text-gray-700">{form.description}</p>}
        {form.requestedResolution && <p>I hereby request the following resolution within <strong>eight (8) days</strong>: <strong>{form.requestedResolution}</strong>.</p>}
        <p>Yours faithfully,</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
    return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, le {today}</div>
        <div className="mb-6"><p className="font-bold">{form.yourFullName || '...'}</p><p className="text-gray-600">{form.yourAddress || '...'}</p></div>
        <div className="mb-8"><p className="font-bold">{form.recipientName || '...'}</p><p className="text-gray-600">{form.recipientAddress || '...'}</p></div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Objet : Lettre de Réclamation{form.subject ? ` — ${form.subject}` : ''}</p>
        <p>Monsieur / Madame,</p>
        <p>Je soussigné(e), <Field>{form.yourFullName}</Field>, vous adresse la présente afin de formuler une réclamation formelle concernant {form.subject ? `l'objet suivant : ${form.subject}` : 'le problème décrit ci-dessous'}.</p>
        {form.incidentDate && <p>Les faits se sont produits le <Field>{form.incidentDate}</Field>.</p>}
        {form.description && <p className="text-gray-700">{form.description}</p>}
        {form.requestedResolution && <p>Je vous demande de bien vouloir apporter la résolution suivante dans un délai de <strong>huit (8) jours</strong> : <strong>{form.requestedResolution}</strong>.</p>}
        <p>Dans l&apos;attente d&apos;une réponse favorable, veuillez agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
  }

  if (slug === 'denonciation-conge') {
    if (!fr) return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, {today}</div>
        <div className="mb-6"><p className="font-bold">{form.yourFullName || '...'}</p><p className="text-gray-600">{form.yourAddress || '...'}</p></div>
        <div className="mb-8"><p className="font-bold">{form.landlordName || '...'}</p><p className="text-gray-600">{form.landlordAddress || '...'}</p></div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Re: Contest of Notice to Vacate — Property at <Field>{form.propertyAddress}</Field></p>
        <p>Dear Sir / Madam,</p>
        <p>I, <Field>{form.yourFullName}</Field>, tenant of the property at <Field>{form.propertyAddress}</Field>, am writing to formally contest the notice to vacate{form.leaseEndDate ? ` with the stated end date of ${form.leaseEndDate}` : ''} for the following reasons:</p>
        {form.contestReason && <p className="text-gray-700">{form.contestReason}</p>}
        {form.additionalContext && <p className="text-gray-600 italic border-l-2 border-gray-200 pl-3">{form.additionalContext}</p>}
        <p>I request that you withdraw the notice and regularise the situation in accordance with applicable tenancy law. Failing this, I reserve the right to pursue all available legal remedies.</p>
        <p>Yours faithfully,</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
    return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <div className="text-right text-xs text-gray-500 mb-6">{form.yourAddress || '...'}, le {today}</div>
        <div className="mb-6"><p className="font-bold">{form.yourFullName || '...'}</p><p className="text-gray-600">{form.yourAddress || '...'}</p></div>
        <div className="mb-8"><p className="font-bold">{form.landlordName || '...'}</p><p className="text-gray-600">{form.landlordAddress || '...'}</p></div>
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4">Objet : Contestation de Congé — Bien sis <Field>{form.propertyAddress}</Field></p>
        <p>Monsieur / Madame,</p>
        <p>Je soussigné(e), <Field>{form.yourFullName}</Field>, locataire du bien sis au <Field>{form.propertyAddress}</Field>, conteste formellement par la présente le congé qui m&apos;a été notifié{form.leaseEndDate ? ` avec une date de fin au ${form.leaseEndDate}` : ''}, pour les raisons suivantes :</p>
        {form.contestReason && <p className="text-gray-700">{form.contestReason}</p>}
        {form.additionalContext && <p className="text-gray-600 italic border-l-2 border-gray-200 pl-3">{form.additionalContext}</p>}
        <p>Je vous mets en demeure de retirer ce congé et de régulariser la situation conformément aux dispositions légales en vigueur. À défaut, je me réserve le droit d&apos;engager toutes les voies de recours disponibles.</p>
        <p>Dans l&apos;attente d&apos;une réponse favorable, veuillez agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.</p>
        <div className="mt-8"><p>{form.yourFullName || '...'}</p><p className="text-gray-500 text-xs">{today}</p></div>
      </div>
    );
  }

  if (slug === 'declaration-faits') {
    if (!fr) return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4 text-center">Declaration of Facts</p>
        <p>I, the undersigned <Field>{form.yourFullName}</Field>{form.yourAddress ? `, residing at ${form.yourAddress}` : ''}{form.yourId ? `, holder of ID card No. ${form.yourId}` : ''}, hereby declare the following facts to be true and accurate:</p>
        {form.factsDate && <p>On <Field>{form.factsDate}</Field>{form.factsLocation ? `, at ${form.factsLocation}` : ''}, the following occurred:</p>}
        {form.factsDescription && <p className="text-gray-700 border-l-2 border-gray-200 pl-3">{form.factsDescription}</p>}
        {form.witnessName && <p>This declaration is attested by the witness: <Field>{form.witnessName}</Field>.</p>}
        {form.additionalNotes && <p className="text-gray-600 italic">{form.additionalNotes}</p>}
        <p>I declare on my honour that the above facts are true to the best of my knowledge, and I accept full legal responsibility for this declaration.</p>
        <div className="mt-8 text-center">
          <p>Done at {form.factsLocation || '...'}, {today}</p>
          <p className="mt-6 font-bold">{form.yourFullName || '...'}</p>
          <p className="text-gray-500 text-xs">(Signature)</p>
        </div>
      </div>
    );
    return (
      <div className="font-serif text-[13px] text-gray-800 leading-relaxed space-y-4 p-2">
        <p className="font-bold uppercase underline tracking-wide text-sm mb-4 text-center">Déclaration de Faits</p>
        <p>Je soussigné(e), <Field>{form.yourFullName}</Field>{form.yourAddress ? `, demeurant à ${form.yourAddress}` : ''}{form.yourId ? `, titulaire de la carte nationale d'identité n° ${form.yourId}` : ''}, déclare sous serment que les faits suivants sont vrais et exacts :</p>
        {form.factsDate && <p>Le <Field>{form.factsDate}</Field>{form.factsLocation ? `, à ${form.factsLocation}` : ''}, les faits suivants se sont produits :</p>}
        {form.factsDescription && <p className="text-gray-700 border-l-2 border-gray-200 pl-3">{form.factsDescription}</p>}
        {form.witnessName && <p>Cette déclaration est attestée par le témoin : <Field>{form.witnessName}</Field>.</p>}
        {form.additionalNotes && <p className="text-gray-600 italic">{form.additionalNotes}</p>}
        <p>Je déclare sur l&apos;honneur que les faits ci-dessus relatés sont conformes à la vérité, et j&apos;accepte l&apos;entière responsabilité juridique de cette déclaration.</p>
        <div className="mt-8 text-center">
          <p>Fait à {form.factsLocation || '...'}, le {today}</p>
          <p className="mt-6 font-bold">{form.yourFullName || '...'}</p>
          <p className="text-gray-500 text-xs">(Signature)</p>
        </div>
      </div>
    );
  }

  return null;
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DocumentGenerationDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const T = t[lang].documentDetails;

  const meta = TEMPLATE_META[slug] ?? TEMPLATE_META['unpaid-wages'];
  const effectiveSlug = TEMPLATE_META[slug] ? slug : 'unpaid-wages';

  const [form, setForm] = useState(meta.initial);
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
              {meta.title(lang)}
            </h2>
            <p className="text-muted text-sm mt-1">{meta.desc(lang)}</p>
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
            <FormFields slug={effectiveSlug} form={form} set={set} lang={lang} />
          </form>

          {/* Right: Live Preview + trust badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`rounded-2xl border-2 p-6 min-h-[465px] shadow-inner transition-all ${hasContent ? 'bg-white border-gray-200 overflow-y-auto' : 'bg-white/40 border-dashed border-gray-300/80 flex flex-col items-center justify-center'}`}>
              <DocumentPreview slug={effectiveSlug} form={form} lang={lang} />
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
