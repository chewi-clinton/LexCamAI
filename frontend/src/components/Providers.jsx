'use client';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Providers({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
