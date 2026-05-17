import { Menu } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';

export default function Header({ activePage = '' }) {
  const links = [
    { label: 'AI Assistant', href: '/chat', key: 'chat' },
    { label: 'Law Explorer', href: '/law-explorer', key: 'law-explorer' },
    { label: 'Lawyer Directory', href: '/lawyer', key: 'lawyer' },
    { label: 'Documents', href: '/documents', key: 'documents' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-gray-200/60 bg-background z-10">
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
        <div>
          <span className="text-accent font-bold">FR</span>{' '}
          <span className="text-accent">|</span>{' '}
          <span>EN</span>
        </div>
        <button className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-light transition-colors">
          Log In
        </button>
      </div>
      <button className="md:hidden text-primary">
        <Menu size={24} />
      </button>
    </nav>
  );
}
