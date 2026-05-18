'use client';
import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  Handshake,
  MapPin,
  FolderOpen,
  FileText,
  Lightbulb,
  X,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function LawyerDashboard() {
  const { lang } = useLanguage();
  const T = t[lang].lawyerDashboard;

  const [status, setStatus] = useState('accepting');
  const [referrals, setReferrals] = useState([
    {
      client: 'M. Jean D.',
      domain: 'Labour Law',
      location: 'Douala',
      time: '2 hours ago',
      description: 'Seeking representation for an unfair dismissal case from a logistics firm. Employment contract was terminated without prior notice or severance pay after 4 years of service.',
    },
    {
      client: 'Mme. Sarah E.',
      domain: 'Family Law',
      location: 'Yaoundé',
      time: '5 hours ago',
      description: 'Requires legal consultation regarding property division and child custody arrangements following a separation. Needs immediate guidance on filing initial documentation.',
    },
  ]);
  const stats = [
    { label: T.pendingReferrals, value: '4', icon: Clock, badge: T.actionRequired, iconBg: 'bg-orange-50 text-orange-600' },
    { label: T.acceptedCases, value: '12', icon: FolderOpen, badge: null, iconBg: 'bg-emerald-50 text-emerald-700' },
    { label: T.completedConsultations, value: '48', icon: Handshake, badge: null, iconBg: 'bg-teal-50 text-teal-700' },
  ];


  const activities = [
    {
      title: 'Case Accepted: Civil Dispute',
      ref: '(Ref: #4492)',
      time: 'Yesterday',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Consultation Finished: Mme. Alima C.',
      ref: '',
      time: 'Oct 24, 2024',
      icon: FileText,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Document Uploaded: Contract Review Notes',
      ref: '',
      time: 'Oct 22, 2024',
      icon: FileText,
      color: 'bg-teal-50 text-teal-700',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />

      <div className="py-12 px-6 md:px-16 flex-1">
        <div className="max-w-6xl mx-auto">

          {/* Profile & Availability Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-800 mb-2">
                <CheckCircle2 size={12} className="fill-emerald-800 text-white" />
                {T.verifiedBadge}
              </div>
              <h1 className="font-serif text-3xl font-bold text-primary">
                {T.welcome}
              </h1>
              <p className="text-muted text-sm mt-1">
                {T.subtitle}
              </p>
            </div>

            {/* Status Pill Controls */}
            <div className="bg-surface rounded-xl shadow-sm border border-gray-200/60 p-1.5 flex items-center gap-1 text-sm font-medium self-start md:self-auto">
              <button
                onClick={() => setStatus('accepting')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs md:text-sm font-semibold transition-colors ${status === 'accepting' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-gray-900'}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 block animate-pulse" />
                {T.acceptingCases}
              </button>
              <button
                onClick={() => setStatus('capacity')}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${status === 'capacity' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-gray-900'}`}
              >
                • {T.atCapacity}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 relative flex flex-col justify-between">
                  {stat.badge && (
                    <span className="absolute top-6 right-6 bg-orange-100/60 text-orange-800 text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {stat.badge}
                    </span>
                  )}
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-muted text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Incoming Referrals */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="font-serif text-2xl font-bold text-primary">
                  {T.incomingReferrals}
                </h2>
                <a href="/lawyer-dashboard" className="text-sm font-bold text-primary hover:underline">
                  {T.viewAll}
                </a>
              </div>

              {referrals.length === 0 && (
                <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-10 text-center text-gray-400 text-sm font-medium">
                  {T.noPendingReferrals}
                </div>
              )}

              {referrals.map((referral, index) => (
                <div key={index} className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary mb-1.5">
                        {referral.client}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted font-medium">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} className="text-gray-400" />
                          {referral.domain}
                        </span>
                        <span className="text-gray-300 hidden sm:inline">|</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {referral.location}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap pt-1">
                      {referral.time}
                    </span>
                  </div>

                  <p className="text-muted text-sm leading-relaxed mb-6 border-t border-gray-100 pt-4">
                    {referral.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setReferrals(prev => prev.filter((_, i) => i !== index))}
                      className="bg-primary hover:bg-primary-light transition-colors text-white py-3 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> {T.acceptCase}
                    </button>
                    <button
                      onClick={() => setReferrals(prev => prev.filter((_, i) => i !== index))}
                      className="border border-primary text-primary hover:bg-primary/5 transition-colors py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <X size={16} /> {T.decline}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">
                {T.recentActivity}
              </h2>

              <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl p-6 space-y-6">
                {activities.map((activity, i) => {
                  const ActIcon = activity.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`w-9 h-9 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
                        <ActIcon size={16} />
                      </div>
                      <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 w-full">
                        <p className="text-xs font-bold text-gray-900 leading-normal">
                          {activity.title}{' '}
                          <span className="text-gray-500 font-normal">{activity.ref}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tip Block */}
              <div className="bg-[#F4F6F4] rounded-xl p-5 border border-gray-200/40 flex gap-3.5 items-start">
                <div className="text-primary mt-0.5 flex-shrink-0">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">
                    {T.tipTitle}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {T.tipBody}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
