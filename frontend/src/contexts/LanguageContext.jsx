'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext({ lang: 'fr', setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('fr');

  useEffect(() => {
    const saved = localStorage.getItem('lexcam_lang');
    if (saved) setLangState(saved);
  }, []);

  const setLang = useCallback((newLang) => {
    localStorage.setItem('lexcam_lang', newLang);
    setLangState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
