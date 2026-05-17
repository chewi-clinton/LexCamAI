import { CheckCircle2, Banknote, Home, Mail, FileWarning, FileSignature, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DocumentGenerator() {
  const templates = [
    {
      id: 'unpaid-wages',
      title: 'Unpaid Wages',
      description: 'Formal request to an employer for the payment of overdue salary or wages.',
      icon: Banknote,
      selected: true,
      fullWidth: false,
    },
    {
      id: 'housing-dispute',
      title: 'Housing Dispute',
      description: 'Draft formal communications regarding tenant or landlord disagreements.',
      icon: Home,
      selected: false,
      fullWidth: false,
    },
    {
      id: 'lettre-reclamation',
      title: 'Lettre de Réclamation',
      description: 'General complaint letter for consumer rights or service issues.',
      icon: Mail,
      selected: false,
      fullWidth: false,
    },
    {
      id: 'denonciation-conge',
      title: 'Dénonciation de Congé',
      description: 'Notice to contest or formally respond to an eviction or termination of lease.',
      icon: FileWarning,
      selected: false,
      fullWidth: false,
    },
    {
      id: 'declaration-faits',
      title: 'Déclaration de Faits',
      description: 'A formal sworn statement documenting specific events or facts for legal records.',
      icon: FileSignature,
      selected: false,
      fullWidth: true,
    },
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
                Document Generator
              </h2>
              <div className="text-xs font-bold text-accent-dark tracking-wide whitespace-nowrap">
                Step 1: Choose Template <span className="text-muted font-normal ml-2">1 of 3</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full w-1/3 rounded-full" />
            </div>
          </div>

          <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl mb-10">
            Select the type of legal document you need to generate. Our AI will guide you through the required information in the next steps.
          </p>

          {/* Template Grid */}
          <div className="space-y-4 mb-12">

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.filter(t => !t.fullWidth).map((tpl) => {
                const IconComponent = tpl.icon;
                return (
                  <div
                    key={tpl.id}
                    className={`bg-surface p-6 md:p-8 rounded-xl relative flex flex-col items-start gap-4 cursor-pointer transition-all border ${
                      tpl.selected
                        ? 'border-primary ring-2 ring-primary/10 shadow-sm'
                        : 'border-gray-200/80 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    {tpl.selected && (
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
              return (
                <div
                  key={tpl.id}
                  className={`bg-surface p-6 md:p-8 rounded-xl flex items-start gap-4 cursor-pointer transition-all border ${
                    tpl.selected
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
            <button className="bg-primary hover:bg-primary-light transition-colors text-white py-3.5 px-8 rounded-lg font-medium text-sm md:text-base flex items-center gap-2 shadow-sm">
              Next
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
