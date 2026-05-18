'use client';
import { useState } from 'react';
import { CheckCircle2, Banknote, Home, Mail, FileWarning, FileSignature, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

export default function DocumentGenerator() {
  const { lang } = useLanguage();
  const T = t[lang].documents;
  const [selectedTemplate, setSelectedTemplate] = useState('unpaid-wages');

  const templates = [
    { id: 'unpaid-wages', title: T.unpaidWagesTitle, description: T.unpaidWagesDesc, icon: Banknote, fullWidth: false },
    { id: 'housing-dispute', title: T.housingTitle, description: T.housingDesc, icon: Home, fullWidth: false },
    { id: 'lettre-reclamation', title: T.reclTitle, description: T.reclDesc, icon: Mail, fullWidth: false },
    { id: 'denonciation-conge', title: T.denonTitle, description: T.denonDesc, icon: FileWarning, fullWidth: false },
    { id: 'declaration-faits', title: T.declTitle, description: T.declDesc, icon: FileSignature, fullWidth: true },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header activePage="documents" />

      <div className="py-16 px-6 md:px-16 flex justify-center items-start">
        <div className="max-w-4xl w-full">

          {/* Header Block & Stepper Progress */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
              <h2 className="font-serif text-4xl font-bold text-primary">
                {T.title}
              </h2>
              <div className="text-xs font-bold text-accent-dark tracking-wide whitespace-nowrap">
                {T.stepLabel} <span className="text-muted font-normal ml-2">{T.stepCount}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full w-1/3 rounded-full" />
            </div>
          </div>

          <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl mb-10">
            {T.subtitle}
          </p>

          {/* Template Grid */}
          <div className="space-y-4 mb-12">

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.filter(t => !t.fullWidth).map((tpl) => {
                const IconComponent = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`bg-surface p-6 md:p-8 rounded-xl relative flex flex-col items-start gap-4 cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/10 shadow-sm'
                        : 'border-gray-200/80 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 size={18} className="absolute top-6 right-6 text-primary fill-primary" />
                    )}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary mb-2">
                        {tpl.title}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full-width card */}
            {templates.filter(t => t.fullWidth).map((tpl) => {
              const IconComponent = tpl.icon;
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`bg-surface p-6 md:p-8 rounded-xl flex items-start gap-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/10 shadow-sm'
                      : 'border-gray-200/80 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-primary mb-1">
                      {tpl.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <a href={`/documents/${selectedTemplate}`} className="bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-8 rounded-lg font-medium text-sm md:text-base flex items-center gap-2 shadow-sm">
              {T.next}
              <ArrowRight size={16} />
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
