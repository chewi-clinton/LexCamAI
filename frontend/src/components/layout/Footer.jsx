'use client';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function Footer() {
  const { lang } = useLanguage();
  const T = t[lang].footer;

  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8 px-6 md:px-16 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <h2 className="font-serif text-2xl font-bold mb-4">LexCam</h2>
          <p className="text-gray-300 text-sm max-w-sm">{T.tagline}</p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F3A754]">{T.language}</h4>
          <p className="text-sm text-gray-300">FR | EN</p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F3A754]">{T.links}</h4>
          <div className="flex flex-col gap-3 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">{T.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{T.terms}</a>
            <a href="#" className="hover:text-white transition-colors">{T.contact}</a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 text-center text-sm text-gray-400">
        {T.copyright}
      </div>
    </footer>
  );
}
