'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, UserCheck, Users, Flag, Sliders, FileText,
  Search, Download, Loader2, LogOut,
} from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import t from '@/translations';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { lang, setLang } = useLanguage();
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }
  const T = t[lang].admin;

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const initials = (user.full_name || user.email || 'AD')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const navItems = [
    { href: '/admin',               label: T.navDashboard,      icon: LayoutDashboard, exact: true },
    { href: '/admin/verify-lawyer', label: T.navVerifyLawyer,   icon: UserCheck },
    { href: '/admin/lawyers',       label: T.navAllLawyers,     icon: Users },
    { href: '/admin/ai-monitoring', label: T.navFlaggedAI,      icon: Flag },
    { href: '/admin/scrapers',      label: T.navScrapers,       icon: Sliders },
    { href: '/admin/templates',     label: T.navTemplates,      icon: FileText },
    { href: '/admin/users',         label: T.navUsers,          icon: Users },
  ];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="h-screen w-screen bg-background flex font-sans overflow-hidden">

      <aside className="w-64 bg-white border-r border-gray-200/60 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <GavelIcon size={24} />
            <div>
              <h1 className="font-serif text-lg font-bold text-primary leading-tight">LexCam</h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block -mt-0.5">{T.adminPortal}</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all ${
                    active
                      ? 'font-bold bg-primary text-white shadow-sm'
                      : 'font-medium text-muted hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
            <span className="text-[11px] text-gray-500 font-medium">{T.systemHealthy}</span>
          </div>
          <a
            href="/admin/lawyers"
            className="w-full bg-accent-dark hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-opacity"
          >
            <Download size={14} /> {T.exportReports}
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200/60 px-8 flex items-center justify-between flex-shrink-0">
          <div className="relative w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={T.searchPlaceholder}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-primary">
              <button onClick={() => setLang('fr')} className={`font-bold transition-colors ${lang === 'fr' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'}`}>FR</button>{' '}
              <span className="text-accent">|</span>{' '}
              <button onClick={() => setLang('en')} className={`font-bold transition-colors ${lang === 'en' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'}`}>EN</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 select-none" title={user.full_name || user.email}>
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
