'use client';
import { useState, useEffect } from 'react';
import { Bot, FileText, Search, Users, ArrowRight, MessageSquare, Clock, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { chat as chatApi, documents as documentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function relativeDate(iso, lang) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff === 0) return lang === 'fr' ? "Aujourd'hui" : 'Today';
  if (diff === 1) return lang === 'fr' ? 'Hier' : 'Yesterday';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const DOC_STATUS_COLOR = {
  ready:            'text-emerald-600',
  generating:       'text-orange-500',
  awaiting_payment: 'text-slate-500',
  failed:           'text-red-500',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const T = t[lang].dashboard;

  const [recentChats, setRecentChats] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);

  useEffect(() => {
    chatApi.conversations()
      .then((data) => setRecentChats((data ?? []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setChatsLoading(false));

    documentsApi.myDocs()
      .then((data) => setRecentDocs((data ?? []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setDocsLoading(false));
  }, []);

  const quickLinks = [
    { icon: Bot,      title: T.askAI,       description: T.askAIDesc,       href: '/chat',         color: 'bg-primary/10 text-primary' },
    { icon: FileText, title: T.generateDoc,  description: T.generateDocDesc, href: '/documents',    color: 'bg-accent/10 text-accent-dark' },
    { icon: Search,   title: T.exploreLaw,  description: T.exploreLawDesc,  href: '/law-explorer', color: 'bg-tertiary/10 text-tertiary' },
    { icon: Users,    title: T.findLawyer,  description: T.findLawyerDesc,  href: '/lawyer',       color: 'bg-emerald-50 text-emerald-700' },
  ];

  const firstName = user?.full_name?.split(' ')[0] ?? null;
  const welcomeText = firstName
    ? (lang === 'fr' ? `Bonjour, ${firstName}` : `Welcome back, ${firstName}`)
    : T.welcome;

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex flex-col">
      <Header activePage="dashboard" />

      <div className="flex-1 px-6 md:px-16 py-12">
        <div className="max-w-6xl mx-auto space-y-10">

          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">{welcomeText}</h1>
            <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
          </div>

          {/* Quick links */}
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

            {/* Recent activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-gray-900">{T.recentActivity}</h2>
                <a href="/chat/history" className="text-xs font-bold text-primary hover:underline">{T.viewAll}</a>
              </div>

              {chatsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-12" />
                    </div>
                  ))}
                </div>
              ) : recentChats.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No conversations yet.</p>
                  <a href="/chat" className="mt-2 inline-block text-xs text-primary font-bold hover:underline">Start a consultation</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentChats.map((conv) => (
                    <a key={conv.id} href={`/chat?c=${conv.id}`} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:text-primary transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors truncate">
                          {conv.title ?? 'Untitled consultation'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                        {relativeDate(conv.updated_at ?? conv.created_at, lang)}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Recent documents */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <FileText size={18} className="text-accent-dark" />
                <h2 className="font-serif text-xl font-bold text-gray-900">{T.myDocuments}</h2>
              </div>

              {docsLoading ? (
                <div className="space-y-3 flex-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 animate-pulse">
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : recentDocs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-4">
                  <FileText size={24} className="mb-2 opacity-40" />
                  <p className="text-sm font-medium">No documents yet.</p>
                  <a href="/documents" className="mt-2 text-xs text-primary font-bold hover:underline">Generate one</a>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {recentDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-xs font-medium py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700 truncate mr-2">{doc.title}</span>
                      <span className={`font-bold whitespace-nowrap flex items-center gap-1 ${DOC_STATUS_COLOR[doc.status] ?? 'text-gray-500'}`}>
                        {doc.status === 'generating' && <Clock size={11} />}
                        {T[doc.status] ?? doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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
