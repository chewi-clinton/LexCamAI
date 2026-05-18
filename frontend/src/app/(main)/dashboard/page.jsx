'use client';
import { Bot, FileText, Search, Users, ArrowRight, MessageSquare, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function Dashboard() {
  const { lang } = useLanguage();
  const T = t[lang].dashboard;

  const recentActivity = [
    { label: lang === 'fr' ? 'A demandé des informations sur les droits de licenciement' : 'Asked about termination rights', time: lang === 'fr' ? "Aujourd'hui" : 'Today', href: '/chat' },
    { label: lang === 'fr' ? 'Lettre de Réclamation générée' : 'Generated Lettre de Réclamation', time: lang === 'fr' ? 'Hier' : 'Yesterday', href: '/documents/my' },
    { label: lang === 'fr' ? 'Code du Travail Art. 34 consulté' : 'Viewed Labour Code Art. 34', time: 'Oct 24', href: '/laws/1' },
  ];

  const quickLinks = [
    { icon: Bot, title: T.askAI, description: T.askAIDesc, href: '/chat', color: 'bg-primary/10 text-primary' },
    { icon: FileText, title: T.generateDoc, description: T.generateDocDesc, href: '/documents', color: 'bg-accent/10 text-accent-dark' },
    { icon: Search, title: T.exploreLaw, description: T.exploreLawDesc, href: '/law-explorer', color: 'bg-tertiary/10 text-tertiary' },
    { icon: Users, title: T.findLawyer, description: T.findLawyerDesc, href: '/lawyer', color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="dashboard" />

      <div className="flex-1 px-6 md:px-16 py-12">
        <div className="max-w-6xl mx-auto space-y-10">

          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{T.welcome}</h1>
            <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickLinks.map(({ icon: Icon, title, description, href, color }) => (
              <a key={href} href={href} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {T.go} <ArrowRight size={12} />
                </div>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-gray-900">{T.recentActivity}</h2>
                <a href="/chat/history" className="text-xs font-bold text-primary hover:underline">{T.viewAll}</a>
              </div>
              <div className="space-y-4">
                {recentActivity.map(({ label, time, href }) => (
                  <a key={href} href={href} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:text-primary transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{label}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">{time}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <FileText size={18} className="text-accent-dark" />
                <h2 className="font-serif text-xl font-bold text-gray-900">{T.myDocuments}</h2>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs font-medium py-2 border-b border-gray-50">
                  <span className="text-gray-700">Non-Disclosure Agreement</span>
                  <span className="text-emerald-600 font-bold">{T.ready}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium py-2 border-b border-gray-50">
                  <span className="text-gray-700">Employment Contract</span>
                  <span className="text-orange-500 font-bold flex items-center gap-1">
                    <Clock size={11} /> {T.generating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium py-2">
                  <span className="text-gray-700">Commercial Lease</span>
                  <span className="text-slate-500 font-bold">{T.awaitingPayment}</span>
                </div>
              </div>
              <a href="/documents/my" className="mt-6 w-full border border-primary text-primary hover:bg-primary/5 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                {T.viewAllDocs} <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
