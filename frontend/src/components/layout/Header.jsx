'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function Header({ activePage = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const T = t[lang].header;

  const links = [
    { label: T.aiAssistant, href: '/chat', key: 'chat' },
    { label: T.lawExplorer, href: '/law-explorer', key: 'law-explorer' },
    { label: T.lawyerDirectory, href: '/lawyer', key: 'lawyer' },
    { label: T.documents, href: '/documents', key: 'documents' },
  ];

  return (
    <nav className="border-b border-gray-200/60 bg-background z-10">
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
        <div className="flex items-center gap-12">
          <a href="/" className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
            <GavelIcon />
            LexCam
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted">
            {links.map(({ label, href, key }) => (
              <a
                key={key}
                href={href}
                className={
                  activePage === key
                    ? 'text-primary border-b-2 border-accent pb-1'
                    : 'hover:text-primary transition-colors'
                }
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-primary">
          <div className="flex items-center gap-1">
            <button onClick={() => setLang('fr')} className={lang === 'fr' ? 'font-bold text-accent' : 'text-muted hover:text-primary transition-colors'}>FR</button>
            <span className="text-accent">|</span>
            <button onClick={() => setLang('en')} className={lang === 'en' ? 'font-bold text-accent' : 'text-muted hover:text-primary transition-colors'}>EN</button>
          </div>
          <a href="/login" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-light transition-colors">
            {T.login}
          </a>
        </div>
        <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200/60 bg-background px-6 py-4 flex flex-col gap-4">
          {links.map(({ label, href, key }) => (
            <a
              key={key}
              href={href}
              className={`text-sm font-medium py-2 ${activePage === key ? 'text-primary font-bold' : 'text-muted hover:text-primary'} transition-colors`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <a href="/login" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors text-sm font-medium text-center mt-2">
            {T.login}
          </a>
        </div>
      )}
    </nav>
  );
}
