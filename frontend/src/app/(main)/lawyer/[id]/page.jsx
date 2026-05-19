'use client';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Mail, MapPin, Globe, IdCard, Phone,
  Building, Send, Calendar, MessageSquare, CheckCircle2, Clock,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const LAWYERS = {
  1: {
    name: 'Maitre Paul Biya',
    initials: 'PB',
    title: 'Avocat au Barreau du Cameroun',
    location: 'Douala, Littoral',
    languages: 'French, English, Ewondo',
    barId: '2010-CMR-45A',
    phone: '+237 6XX XXX XXX',
    email: 'contact@biya-law.cm',
    address: '123 Rue des Palmiers, Akwa, Douala',
    status: 'Verified',
    about: [
      'With over 15 years of dedicated practice at the Cameroon Bar, Maitre Paul Biya specializes in corporate litigation and international trade law. He has a proven track record of representing both domestic enterprises and multinational corporations navigating complex regulatory environments within the CEMAC region.',
      'He is recognized for his pragmatic approach to dispute resolution and his commitment to legal empowerment, frequently advising start-ups pro bono.',
    ],
    practiceAreas: ['Corporate Law', 'Commercial Litigation', 'OHADA Law', 'Intellectual Property', 'Real Estate'],
    experience: [
      { role: 'Senior Partner – Biya & Associates', period: '2015 - Present | Douala' },
      { role: 'Associate Counsel – Lex Africa', period: '2010 - 2015 | Yaoundé' },
    ],
    education: [
      { degree: 'Master of Laws (LL.M.) in International Trade', institution: 'Université de Dschang | 2009' },
      { degree: 'Bachelor of Laws (LL.B.)', institution: 'Université de Yaoundé II | 2007' },
    ],
    availability: { weekdays: '08:00 - 17:00', saturday: 'By Appointment', sunday: 'Closed' },
  },
  2: {
    name: 'Maitre Anne Etoga',
    initials: 'AE',
    title: 'Avocate au Barreau du Cameroun',
    location: 'Douala, Littoral',
    languages: 'French, English',
    barId: '2013-CMR-112',
    phone: '+237 699 88 77 66',
    email: 'a.etoga@legalcm.cm',
    address: '45 Boulevard de la Liberté, Bonanjo, Douala',
    status: 'Verified',
    about: [
      'Maitre Anne Etoga is a passionate advocate for family rights and civil liberties in the coastal region of Cameroon. With over 10 years of practice, she has handled hundreds of family law cases including complex divorces, child custody, and succession disputes.',
      'She is a founding member of the Cameroon Women Lawyers Association and regularly provides free legal clinics for underprivileged families.',
    ],
    practiceAreas: ['Family Law', 'Civil Rights', 'Succession Law', 'Child Custody', 'Matrimonial Law'],
    experience: [
      { role: 'Principal Partner – Etoga Legal Chambers', period: '2016 - Present | Douala' },
      { role: 'Family Law Counsel – Cabinet Nanga', period: '2013 - 2016 | Douala' },
    ],
    education: [
      { degree: 'Master en Droit Privé', institution: 'Université de Douala | 2012' },
      { degree: 'Licence en Droit', institution: 'Université de Douala | 2010' },
    ],
    availability: { weekdays: '09:00 - 18:00', saturday: '09:00 - 13:00', sunday: 'Closed' },
  },
  3: {
    name: 'Maitre Jean Ndi',
    initials: 'JN',
    title: 'Avocat Stagiaire au Barreau du Cameroun',
    location: 'Bamenda, North West',
    languages: 'English, French',
    barId: 'Pending Verification',
    phone: '+237 670 44 55 66',
    email: 'j.ndi@lawbamenda.cm',
    address: '12 Commercial Avenue, Bamenda',
    status: 'Pending',
    about: [
      'Maitre Jean Ndi is an emerging labour law specialist based in Bamenda with over 10 years of practical experience in employment disputes and contract law across the Anglophone regions of Cameroon.',
      'He is currently completing his bar certification and is available for consultations under supervision.',
    ],
    practiceAreas: ['Labour Law', 'Contracts', 'Employment Disputes', 'Worker Compensation'],
    experience: [
      { role: 'Legal Advisor – Bamenda Chamber of Commerce', period: '2018 - Present | Bamenda' },
      { role: 'Paralegal – Ndi & Partners', period: '2014 - 2018 | Bamenda' },
    ],
    education: [
      { degree: 'Bachelor of Laws (LL.B.)', institution: 'University of Buea | 2013' },
    ],
    availability: { weekdays: '08:00 - 16:00', saturday: 'By Appointment', sunday: 'Closed' },
  },
  4: {
    name: 'Maitre Claire Mvondo',
    initials: 'CM',
    title: 'Avocate au Barreau du Cameroun',
    location: 'Douala, Littoral',
    languages: 'French, English',
    barId: '2011-CMR-089',
    phone: '+237 655 22 33 44',
    email: 'c.mvondo@droitscm.cm',
    address: '78 Rue Joss, Akwa, Douala',
    status: 'Verified',
    about: [
      'Maitre Claire Mvondo is a leading criminal defense attorney and human rights advocate in Cameroon. Her work spans criminal defense, constitutional law, and international human rights frameworks.',
      'She has represented clients before the Supreme Court and filed landmark petitions with the African Commission on Human and Peoples\' Rights.',
    ],
    practiceAreas: ['Criminal Law', 'Human Rights', 'Constitutional Law', 'International Law', 'Public Law'],
    experience: [
      { role: 'Senior Counsel – Droits & Libertés Cameroun', period: '2014 - Present | Douala' },
      { role: 'Criminal Defense Advocate – Cabinet Fouda', period: '2011 - 2014 | Yaoundé' },
    ],
    education: [
      { degree: 'Master in Human Rights Law', institution: 'University of Pretoria | 2010' },
      { degree: 'Licence en Droit Public', institution: 'Université de Yaoundé II | 2008' },
    ],
    availability: { weekdays: '08:30 - 17:30', saturday: 'Closed', sunday: 'Closed' },
  },
  5: {
    name: 'Maitre Samuel Fon',
    initials: 'SF',
    title: 'Avocat au Barreau du Cameroun',
    location: 'Yaoundé, Centre',
    languages: 'English, French',
    barId: '2008-CMR-221',
    phone: '+237 677 99 00 11',
    email: 's.fon@fonlegal.cm',
    address: '56 Avenue Kennedy, Bastos, Yaoundé',
    status: 'Verified',
    about: [
      'Maitre Samuel Fon brings over 17 years of experience in real estate law and corporate transactions to his clients. He has overseen the legal aspects of major land acquisitions and commercial property developments across Cameroon.',
      'He serves as legal counsel to several major real estate developers and advises on OHADA-compliant corporate structures.',
    ],
    practiceAreas: ['Real Estate', 'Corporate Law', 'Land Disputes', 'Property Registration', 'OHADA Law'],
    experience: [
      { role: 'Managing Partner – Fon Legal Associates', period: '2012 - Present | Yaoundé' },
      { role: 'Corporate Counsel – Campost', period: '2008 - 2012 | Yaoundé' },
    ],
    education: [
      { degree: 'Master en Droit des Affaires', institution: 'Université de Yaoundé II | 2007' },
      { degree: 'Licence en Droit Privé', institution: 'Université de Dschang | 2005' },
    ],
    availability: { weekdays: '08:00 - 17:00', saturday: '09:00 - 12:00', sunday: 'Closed' },
  },
  6: {
    name: 'Maitre Rose Ekedi',
    initials: 'RE',
    title: 'Avocate Stagiaire au Barreau du Cameroun',
    location: 'Garoua, North',
    languages: 'French, Fulfulde',
    barId: 'Pending Verification',
    phone: '+237 622 11 22 33',
    email: 'r.ekedi@garoualegal.cm',
    address: '34 Rue du Marché, Garoua',
    status: 'Pending',
    about: [
      'Maitre Rose Ekedi is a dedicated advocate for women and children\'s rights in northern Cameroon. With a background in family law and labor protection, she provides accessible legal counsel to vulnerable populations in the Garoua region.',
      'She is currently completing her bar certification and is building her practice with a focus on social justice cases.',
    ],
    practiceAreas: ['Family Law', 'Labour Law', 'Women\'s Rights', 'Child Protection'],
    experience: [
      { role: 'Legal Aid Volunteer – ACAFEJ Garoua', period: '2021 - Present | Garoua' },
      { role: 'Paralegal – Cabinet Ahmadou', period: '2019 - 2021 | Garoua' },
    ],
    education: [
      { degree: 'Licence en Droit Privé', institution: 'Université de Ngaoundéré | 2018' },
    ],
    availability: { weekdays: '08:00 - 16:00', saturday: 'By Appointment', sunday: 'Closed' },
  },
};

export default function LawyerProfileView() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const T = t[lang].lawyerView;

  const lawyer = LAWYERS[Number(id)] ?? LAWYERS[1];

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

        {/* Main 2-column layout */}
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Identity banner */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl flex-shrink-0 border border-primary/20 shadow-inner select-none relative">
                  {lawyer.initials}
                  {lawyer.status === 'Verified' && (
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                      <CheckCircle2 size={18} className="text-emerald-700 fill-emerald-700" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{lawyer.name}</h2>
                    {lawyer.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{lawyer.title}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-3 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" /> {lawyer.location}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5">
                      <Globe size={14} className="text-gray-400" /> {lawyer.languages}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <IdCard size={14} className="text-gray-400" /> Bar ID: {lawyer.barId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:w-auto w-full gap-2.5 flex-shrink-0 self-stretch sm:self-auto justify-start">
                {lawyer.status === 'Verified' ? (
                  <>
                    <a href={`mailto:${lawyer.email}`} className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 shadow-sm w-full">
                      <Mail size={14} /> {T.contactLawyer}
                    </a>
                    <a href={`/lawyer/${id}/referral`} className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-5 rounded-lg shadow-sm transition-colors w-full flex items-center justify-center">
                      {T.requestReferral}
                    </a>
                  </>
                ) : (
                  <span className="border border-gray-200 bg-gray-50 text-gray-400 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 w-full cursor-not-allowed">
                    <Clock size={14} /> Verification Pending
                  </span>
                )}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">{T.about}</h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4 font-medium">
                {lawyer.about.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            {/* Areas of Practice */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">{T.areasOfPractice}</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.practiceAreas.map((area) => (
                  <span key={area} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience & Education */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building size={18} className="text-gray-400" /> {T.experienceEducation}
                </h3>
                <div className="space-y-3 pl-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{T.professionalExperience}</span>
                  {lawyer.experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-emerald-700 pl-4 py-0.5">
                      <p className="text-xs font-bold text-gray-900">{exp.role}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{exp.period}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 border-t border-gray-50 pt-6">
                <div className="space-y-3 pl-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{T.education}</span>
                  {lawyer.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-emerald-700/40 pl-4 py-0.5">
                      <p className="text-xs font-bold text-gray-800">{edu.degree}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{T.contactDetails}</h3>
              <div className="space-y-3 text-xs font-medium text-gray-700">
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <span className="text-gray-800 font-bold">{lawyer.phone}</span>
                    <span className="text-[10px] text-gray-400 font-normal ml-1.5">({T.primary})</span>
                  </div>
                </div>
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-800 font-bold">{lawyer.email}</span>
                </div>
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-start gap-3">
                  <Building size={16} className="text-gray-400 mt-0.5" />
                  <span className="text-gray-700 font-semibold leading-relaxed">{lawyer.address}</span>
                </div>
              </div>
              {lawyer.status === 'Verified' && (
                <div className="pt-2 space-y-3">
                  <a href={`mailto:${lawyer.email}`} className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm">
                    <Send size={14} /> {T.sendMessage}
                  </a>
                  <p className="text-[10px] text-center text-gray-400 font-semibold">{T.secureNote}</p>
                </div>
              )}
            </div>

            {/* Availability card */}
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" /> {T.availability}
              </h3>
              <div className="divide-y divide-gray-100 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-baseline py-2.5">
                  <span className="text-gray-400">{T.monFri}</span>
                  <span className="text-gray-800 font-bold">{lawyer.availability.weekdays}</span>
                </div>
                <div className="flex justify-between items-baseline py-2.5">
                  <span className="text-gray-400">{T.saturday}</span>
                  <span className="text-gray-800 font-bold">{lawyer.availability.saturday}</span>
                </div>
                <div className="flex justify-between items-baseline py-2.5">
                  <span className="text-gray-400">{T.sunday}</span>
                  <span className={`font-bold ${lawyer.availability.sunday === 'Closed' ? 'text-red-600' : 'text-gray-800'}`}>{lawyer.availability.sunday}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
