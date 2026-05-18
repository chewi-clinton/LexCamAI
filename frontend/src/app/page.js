'use client';
import { Shield, Bot, Users, FileText, MessageSquare, CheckCircle, ArrowRight, Scale, Landmark, Briefcase, Heart } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import t from "@/translations";

export default function LexCamLanding() {
  const { lang } = useLanguage();
  const T = t[lang].landing;

  const steps = [
    { step: "01", title: T.step1Title, desc: T.step1Desc },
    { step: "02", title: T.step2Title, desc: T.step2Desc },
    { step: "03", title: T.step3Title, desc: T.step3Desc },
    { step: "04", title: T.step4Title, desc: T.step4Desc },
  ];

  const aiFeatures = [
    { icon: MessageSquare, title: T.aiFeature1Title, desc: T.aiFeature1Desc },
    { icon: CheckCircle, title: T.aiFeature2Title, desc: T.aiFeature2Desc },
    { icon: ArrowRight, title: T.aiFeature3Title, desc: T.aiFeature3Desc },
  ];

  const domains = [
    { label: T.labourLaw, color: "bg-primary" },
    { label: T.housingProperty, color: "bg-accent" },
    { label: T.familyLaw, color: "bg-tertiary" },
    { label: T.criminalDefence, color: "bg-neutral" },
    { label: T.commercialLaw, color: "bg-primary-light" },
    { label: T.administrative, color: "bg-accent-dark" },
  ];

  const missionFeatures = [
    { icon: Landmark, title: T.missionFeature1Title, desc: T.missionFeature1Desc },
    { icon: Shield, title: T.missionFeature2Title, desc: T.missionFeature2Desc },
    { icon: Briefcase, title: T.missionFeature3Title, desc: T.missionFeature3Desc },
  ];

  const ngos = [
    { name: "FIDA Cameroon", desc: "International Federation of Women Lawyers — provides free legal aid to women and children facing rights violations.", domain: "Women's Rights" },
    { name: "CAMGEW", desc: "Cameroon Gender and Environment Watch — advocates for women's rights in rural and urban communities across Cameroon.", domain: "Gender Equality" },
    { name: "NCHRF", desc: "National Commission on Human Rights and Freedoms — investigates complaints and mediates between citizens and institutions.", domain: "Human Rights" },
    { name: "Reach Out Cameroon", desc: "Community-based organization supporting marginalized groups with legal, health, and social services.", domain: "Social Justice" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-24 gap-12">
        <div className="flex-1 max-w-xl">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-primary leading-tight text-balance mb-6">
            {T.heroTitle}
          </h2>
          <p className="text-lg text-muted mb-10 text-balance">
            {T.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/chat" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors text-center">
              {T.askAI}
            </a>
            <a href="/lawyer" className="border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary/5 transition-colors text-center">
              {T.findLawyer}
            </a>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg">
          <div className="bg-[#D4B58E] rounded-xl p-6 shadow-sm aspect-[4/3] relative flex items-center justify-center">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-8 border-gray-800 shadow-2xl">
              <img src="/hero-img.jpg" alt="People in a meeting room" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof Banner */}
      <div className="bg-[#F2EFEB] py-6 flex items-center justify-center gap-3 border-y border-gray-200/50">
        <Shield className="text-accent-dark" size={20} />
        <p className="font-serif font-bold text-lg text-neutral-dark text-balance text-center">
          {T.socialProof}
        </p>
      </div>

      {/* Features Section */}
      <section className="px-6 md:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-surface p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
              <Bot className="text-white" size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">{T.aiAssistantTitle}</h3>
            <p className="text-muted text-sm leading-relaxed">{T.aiAssistantDesc}</p>
          </div>
          <div className="bg-surface p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#F3A754] rounded-full flex items-center justify-center mb-6">
              <Users className="text-primary-dark" size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">{T.lawyerDirTitle}</h3>
            <p className="text-muted text-sm leading-relaxed">{T.lawyerDirDesc}</p>
          </div>
          <div className="bg-surface p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center mb-6">
              <FileText className="text-white" size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">{T.docGenTitle}</h3>
            <p className="text-muted text-sm leading-relaxed">{T.docGenDesc}</p>
          </div>
        </div>
      </section>

      {/* How to Generate a Document */}
      <section className="bg-surface px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{T.stepsLabel}</p>
          <h2 className="font-serif text-4xl font-bold text-primary mb-4 max-w-xl">{T.stepsTitle}</h2>
          <p className="text-muted max-w-2xl mb-16">{T.stepsSubtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col">
                <span className="font-serif text-5xl font-bold text-primary/10 mb-4">{step}</span>
                <h3 className="font-semibold text-primary text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <a href="/documents" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors">
              {T.browseTemplates} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* How the AI Assistant Works */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{T.aiSectionLabel}</p>
            <h2 className="font-serif text-4xl font-bold text-primary mb-6">{T.aiSectionTitle}</h2>
            <p className="text-muted mb-10 leading-relaxed">{T.aiSectionDesc}</p>
            <div className="flex flex-col gap-6">
              {aiFeatures.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="text-primary" size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">{title}</h4>
                    <p className="text-muted text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#F2EFEB] rounded-2xl p-8 flex flex-col gap-4">
            <div className="bg-surface rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted mb-1">You asked</p>
              <p className="text-primary text-sm">&ldquo;My landlord has not returned my deposit after I moved out three months ago. What can I do?&rdquo;</p>
            </div>
            <div className="bg-primary rounded-xl p-4 shadow-sm">
              <p className="text-xs text-white/60 mb-1">LexCam AI</p>
              <p className="text-white text-sm leading-relaxed">Under Article 1730 of the Cameroonian Civil Code, your landlord is required to return your security deposit within a reasonable period after the end of the tenancy, provided no damage beyond normal wear has occurred. You can formally demand it in writing using a Lettre de Réclamation...</p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-white/70 text-xs">Source: Civil Code, Art. 1730 — Obligations du bailleur</p>
              </div>
            </div>
            <a href="/chat" className="text-center text-primary text-sm font-medium py-2 border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors block">
              {T.tryAI}
            </a>
          </div>
        </div>
      </section>

      {/* Pro Bono Lawyers */}
      <section className="bg-[#F2EFEB] px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
            {domains.map(({ label, color }) => (
              <div key={label} className="bg-surface rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-2 h-8 ${color} rounded-full`} />
                <span className="text-sm font-medium text-primary">{label}</span>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="text-accent" size={20} />
              <p className="text-accent font-semibold text-sm uppercase tracking-widest">{T.probonoLabel}</p>
            </div>
            <h2 className="font-serif text-4xl font-bold text-primary mb-6">{T.probonoTitle}</h2>
            <p className="text-muted leading-relaxed mb-6">{T.probonoDesc1}</p>
            <p className="text-muted leading-relaxed mb-8">{T.probonoDesc2}</p>
            <a href="/lawyer" className="inline-flex items-center gap-2 border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary/5 transition-colors">
              {T.findProbono} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* NGOs & Support Organizations */}
      <section className="bg-surface px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="text-tertiary" size={20} />
            <p className="text-tertiary font-semibold text-sm uppercase tracking-widest">{T.ngoLabel}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-serif text-4xl font-bold text-primary mb-6">{T.ngoTitle}</h2>
              <p className="text-muted leading-relaxed mb-6">{T.ngoDesc1}</p>
              <p className="text-muted leading-relaxed">{T.ngoDesc2}</p>
            </div>
            <div className="flex flex-col gap-4">
              {ngos.map(({ name, desc, domain }) => (
                <div key={name} className="border border-gray-200 rounded-xl p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-primary">{name}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{domain}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / Mission */}
      <section className="bg-primary px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{T.missionLabel}</p>
            <h2 className="font-serif text-4xl font-bold text-white mb-6 leading-tight">{T.missionTitle}</h2>
            <p className="text-white/70 leading-relaxed mb-6">{T.missionDesc1}</p>
            <p className="text-white/70 leading-relaxed">{T.missionDesc2}</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {missionFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="text-accent" size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lawyer / NGO CTA */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#F2EFEB] rounded-2xl p-10">
            <Briefcase className="text-primary mb-4" size={32} />
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">{T.lawyerCTATitle}</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">{T.lawyerCTADesc}</p>
            <a href="/register-lawyer" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-light transition-colors">
              {T.registerLawyer} <ArrowRight size={16} />
            </a>
          </div>
          <div className="bg-tertiary/10 rounded-2xl p-10">
            <Heart className="text-tertiary mb-4" size={32} />
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">{T.ngoCTATitle}</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">{T.ngoCTADesc}</p>
            <a href="mailto:contact@lexcam.cm" className="inline-flex items-center gap-2 border border-tertiary text-tertiary px-6 py-3 rounded-full text-sm font-medium hover:bg-tertiary/5 transition-colors">
              {T.getInTouch} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#F2EFEB] px-6 md:px-16 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">{T.finalTitle}</h2>
          <p className="text-muted mb-10 leading-relaxed">{T.finalDesc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/chat" className="bg-primary text-white px-10 py-4 rounded-full font-medium hover:bg-primary-light transition-colors text-center">
              {T.startAI}
            </a>
            <a href="/documents" className="border border-primary text-primary px-10 py-4 rounded-full font-medium hover:bg-primary/5 transition-colors text-center">
              {T.generateDoc}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
