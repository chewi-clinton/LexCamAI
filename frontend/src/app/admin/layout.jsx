'use client';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UserCheck, Users, Flag, Sliders, FileText,
  History, Search, Download,
} from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';

const navItems = [
  { href: '/admin',              label: 'Dashboard',           icon: LayoutDashboard, exact: true },
  { href: '/admin/verify-lawyer', label: 'Lawyer Verification', icon: UserCheck },
  { href: '/admin/lawyers',      label: 'All Lawyers',         icon: Users },
  { href: '/admin/ai-monitoring', label: 'Flagged AI',         icon: Flag },
  { href: '/admin/scrapers',     label: 'Scrapers',            icon: Sliders },
  { href: '/admin/templates',    label: 'Document Templates',  icon: FileText },
  { href: '/admin/users',        label: 'Users',               icon: Users },
  { href: '/admin/audit-log',    label: 'Audit Log',           icon: History },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block -mt-0.5">Admin Portal</span>
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
            <span className="text-[11px] text-gray-500 font-medium">System Status: Healthy</span>
          </div>
          <button className="w-full bg-accent-dark hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-opacity">
            <Download size={14} /> Export Reports
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200/60 px-8 flex items-center justify-between flex-shrink-0">
          <div className="relative w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-primary">
              <span className="text-accent font-bold">FR</span>{' '}
              <span className="text-accent">|</span>{' '}
              <span>EN</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 select-none">
              AD
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
