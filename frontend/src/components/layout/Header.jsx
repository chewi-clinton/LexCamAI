'use client';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/api';
import t from '@/translations';

export default function Header({ activePage = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const T = t[lang].header;
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lexcam_access');
    if (!token) { setAuthChecked(true); return; }
    fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setCurrentUser(data);
          localStorage.setItem('lexcam_user_id', data.id);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  async function handleLogout() {
    await auth.logout();
    setCurrentUser(null);
    window.location.href = '/';
  }

  const isLawyer = currentUser?.role === 'lawyer';

  const links = isLawyer ? [
    { label: 'Dashboard',    href: '/lawyer-dashboard',          key: 'lawyer-dashboard' },
    { label: 'Get Verified', href: '/register-lawyer/documents', key: 'verify' },
    { label: T.aiAssistant,  href: '/chat',                      key: 'chat' },
    { label: T.lawExplorer,  href: '/law-explorer',              key: 'law-explorer' },
  ] : [
    { label: T.aiAssistant,    href: '/chat',        key: 'chat' },
    { label: T.lawExplorer,    href: '/law-explorer', key: 'law-explorer' },
    { label: T.lawyerDirectory, href: '/lawyer',     key: 'lawyer' },
    { label: T.documents,      href: '/documents',   key: 'documents' },
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

          {authChecked && (
            currentUser ? (
              <div className="flex items-center gap-3">
                <a href={isLawyer ? '/lawyer-dashboard' : '/profile'} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <User size={15} className="text-primary" />
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.full_name || currentUser.email}</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-red-500 transition-colors"
                >
                  <LogOut size={14} />
                  {lang === 'fr' ? 'Déconnexion' : 'Logout'}
                </button>
              </div>
            ) : (
              <a href="/login" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-light transition-colors">
                {T.login}
              </a>
            )
          )}
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
          <div className="flex items-center gap-3 py-2 border-t border-gray-200/60 mt-1 pt-3">
            <button onClick={() => setLang('fr')} className={lang === 'fr' ? 'text-sm font-bold text-accent' : 'text-sm text-muted hover:text-primary transition-colors'}>FR</button>
            <span className="text-accent">|</span>
            <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-sm font-bold text-accent' : 'text-sm text-muted hover:text-primary transition-colors'}>EN</button>
          </div>
          {authChecked && (
            currentUser ? (
              <>
                <a href={isLawyer ? '/lawyer-dashboard' : '/profile'} className="text-sm font-medium text-primary py-2 flex items-center gap-2">
                  <User size={15} /> {currentUser.full_name || currentUser.email}
                </a>
                <button onClick={handleLogout} className="text-sm font-medium text-red-500 py-2 flex items-center gap-2 text-left">
                  <LogOut size={15} /> {lang === 'fr' ? 'Déconnexion' : 'Logout'}
                </button>
              </>
            ) : (
              <a href="/login" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors text-sm font-medium text-center mt-2">
                {T.login}
              </a>
            )
          )}
        </div>
      )}
    </nav>
  );
}
