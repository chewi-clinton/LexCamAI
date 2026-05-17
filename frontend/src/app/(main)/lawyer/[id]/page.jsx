'use client';
import {
  ArrowLeft, Mail, MapPin, Globe, IdCard, Phone,
  Building, Send, Calendar, MessageSquare, CheckCircle2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const practiceAreas = [
  'Corporate Law', 'Commercial Litigation', 'OHADA Law',
  'Intellectual Property', 'Real Estate',
];

const experience = [
  { role: 'Senior Partner – Biya & Associates', period: '2015 - Present | Douala' },
  { role: 'Associate Counsel – Lex Africa',     period: '2010 - 2015 | Yaoundé' },
];

const education = [
  { degree: 'Master of Laws (LL.M.) in International Trade', institution: 'Université de Dschang | 2009' },
  { degree: 'Bachelor of Laws (LL.B.)',                       institution: 'Université de Yaoundé II | 2007' },
];

export default function LawyerProfileView() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">

      <Header activePage="lawyer" />

      <div className="flex-1 pb-16">

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <a href="/lawyer" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14} /> Back to Lawyers
          </a>
        </div>

        {/* Main 2-column layout */}
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Identity banner */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">

                {/* Avatar — initials instead of placeholder image */}
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl flex-shrink-0 border border-primary/20 shadow-inner select-none relative">
                  PB
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                    <CheckCircle2 size={18} className="text-emerald-700 fill-emerald-700" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">Maitre Paul Biya</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Avocat au Barreau du Cameroun</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-3 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" /> Douala, Littoral
                    </span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5">
                      <Globe size={14} className="text-gray-400" /> French, English, Ewondo
                    </span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <IdCard size={14} className="text-gray-400" /> Bar ID: 2010-CMR-45A
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:w-auto w-full gap-2.5 flex-shrink-0 self-stretch sm:self-auto justify-start">
                <button className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 shadow-sm w-full">
                  <Mail size={14} /> Contact Lawyer
                </button>
                <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-5 rounded-lg shadow-sm transition-colors w-full">
                  Request Referral
                </button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">About</h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4 font-medium">
                <p>
                  With over 15 years of dedicated practice at the Cameroon Bar, Maitre Paul Biya specializes in corporate litigation and international trade law. He has a proven track record of representing both domestic enterprises and multinational corporations navigating complex regulatory environments within the CEMAC region.
                </p>
                <p>
                  He is recognized for his pragmatic approach to dispute resolution and his commitment to legal empowerment, frequently advising start-ups pro bono.
                </p>
              </div>
            </div>

            {/* Areas of Practice */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-gray-900">Areas of Practice</h3>
              <div className="flex flex-wrap gap-2">
                {practiceAreas.map((area, idx) => (
                  <span key={idx} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience & Education */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building size={18} className="text-gray-400" /> Experience & Education
                </h3>
                <div className="space-y-3 pl-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Professional Experience</span>
                  {experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-emerald-700 pl-4 py-0.5">
                      <p className="text-xs font-bold text-gray-900">{exp.role}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{exp.period}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-6">
                <div className="space-y-3 pl-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Education</span>
                  {education.map((edu, i) => (
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
              <h4 className="font-serif text-lg font-bold text-gray-900 mb-1">No Reviews Yet</h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm font-semibold">
                Reviews are only visible for verified client interactions facilitated through the LexCam platform to ensure authenticity.
              </p>
            </div>

          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contact Details</h3>

              <div className="space-y-3 text-xs font-medium text-gray-700">
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <span className="text-gray-800 font-bold">+237 6XX XXX XXX</span>
                    <span className="text-[10px] text-gray-400 font-normal ml-1.5">(Primary)</span>
                  </div>
                </div>
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-800 font-bold">contact@biya-law.cm</span>
                </div>
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-3.5 flex items-start gap-3">
                  <Building size={16} className="text-gray-400 mt-0.5" />
                  <div className="leading-relaxed font-semibold text-gray-600">
                    <p className="text-gray-800 font-bold">123 Rue des Palmiers</p>
                    <p>Akwa, Douala</p>
                    <p>Cameroon</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm">
                  <Send size={14} /> Send Message
                </button>
                <p className="text-[10px] text-center text-gray-400 font-semibold">
                  Messages are sent securely via LexCam.
                </p>
              </div>
            </div>

            {/* Availability card */}
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" /> Availability
              </h3>
              <div className="divide-y divide-gray-100 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-baseline py-2.5">
                  <span className="text-gray-400">Mon - Fri</span>
                  <span className="text-gray-800 font-bold">08:00 - 17:00</span>
                </div>
                <div className="flex justify-between items-baseline py-2.5">
                  <span className="text-gray-400">Saturday</span>
                  <span className="text-gray-800 font-bold">By Appointment</span>
                </div>
                <div className="flex justify-between items-baseline py-2.5">
                  <span className="text-gray-400">Sunday</span>
                  <span className="text-red-600 font-bold">Closed</span>
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
