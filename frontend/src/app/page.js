import { Shield, Bot, Users, FileText, MessageSquare, CheckCircle, ArrowRight, Scale, Landmark, Briefcase, Heart } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LexCamLanding() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-24 gap-12">
        <div className="flex-1 max-w-xl">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-primary leading-tight text-balance mb-6">
            Your Legal Rights, In Your Language
          </h2>
          <p className="text-lg text-muted mb-10 text-balance">
            Ask our AI, find a lawyer, or generate a legal document — in French
            or English.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors">
              Ask the AI
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary/5 transition-colors">
              Find a Lawyer
            </button>
          </div>
        </div>

        {/* Hero Image Container */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-[#D4B58E] rounded-xl p-6 shadow-sm aspect-[4/3] relative flex items-center justify-center">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-8 border-gray-800 shadow-2xl">
              <img
                src="/hero-img.jpg"
                alt="People in a meeting room"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof Banner */}
      <div className="bg-[#F2EFEB] py-6 flex items-center justify-center gap-3 border-y border-gray-200/50">
        <Shield className="text-accent-dark" size={20} />
        <p className="font-serif font-bold text-lg text-neutral-dark text-balance text-center">
          Used by over 5,000 citizens across Cameroon.
        </p>
      </div>

      {/* Features Section */}
      <section className="px-6 md:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="bg-surface p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
              <Bot className="text-white" size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">
              AI Assistant
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Chat with our bilingual legal expert for instant answers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-surface p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#F3A754] rounded-full flex items-center justify-center mb-6">
              <Users className="text-primary-dark" size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">
              Lawyer Directory
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Find and contact verified Cameroonian lawyers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-surface p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center mb-6">
              <FileText className="text-white" size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">
              Document Generator
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Create professional legal letters in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* How to Generate a Document */}
      <section className="bg-surface px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Step by step</p>
          <h2 className="font-serif text-4xl font-bold text-primary mb-4 max-w-xl">
            Get a formal legal document in under ten minutes
          </h2>
          <p className="text-muted max-w-2xl mb-16">
            No lawyer appointment needed. No legal jargon. Choose a template, fill in your details, pay with Mobile Money, and receive a ready-to-send legal letter.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Choose a template", desc: "Select from formal demand notices, complaint letters, eviction notices, and sworn statements." },
              { step: "02", title: "Fill in your details", desc: "We guide you through each field. No legal knowledge required — just your facts." },
              { step: "03", title: "Pay with Mobile Money", desc: "Secure payment via MTN Mobile Money or Orange Money. A one-time fee of 500 XAF." },
              { step: "04", title: "Receive your document", desc: "Your PDF is generated instantly and sent to your email, ready to print and deliver." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col">
                <span className="font-serif text-5xl font-bold text-primary/10 mb-4">{step}</span>
                <h3 className="font-semibold text-primary text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors">
              Browse document templates <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* How the AI Assistant Works */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">AI Legal Assistant</p>
            <h2 className="font-serif text-4xl font-bold text-primary mb-6">
              Ask any legal question. Get a grounded answer.
            </h2>
            <p className="text-muted mb-10 leading-relaxed">
              Our AI is trained on Cameroonian law — the Labour Code, the Civil Code, family law, housing regulations, and more. Ask in French or English. It retrieves the relevant law, explains it in plain language, and tells you what steps you can take.
            </p>
            <div className="flex flex-col gap-6">
              {[
                { icon: MessageSquare, title: "Ask in your own words", desc: "Type your situation naturally. The AI understands context, not just keywords." },
                { icon: CheckCircle, title: "Grounded in actual law", desc: "Every answer is backed by a specific article or provision from Cameroonian legislation." },
                { icon: ArrowRight, title: "Guided to the right next step", desc: "Need a lawyer? A document? An NGO? The AI tells you exactly where to go." },
              ].map(({ icon: Icon, title, desc }) => (
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
              <p className="text-primary text-sm">"My landlord has not returned my deposit after I moved out three months ago. What can I do?"</p>
            </div>
            <div className="bg-primary rounded-xl p-4 shadow-sm">
              <p className="text-xs text-white/60 mb-1">LexCam AI</p>
              <p className="text-white text-sm leading-relaxed">Under Article 1730 of the Cameroonian Civil Code, your landlord is required to return your security deposit within a reasonable period after the end of the tenancy, provided no damage beyond normal wear has occurred. You can formally demand it in writing using a Lettre de Réclamation...</p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-white/70 text-xs">Source: Civil Code, Art. 1730 — Obligations du bailleur</p>
              </div>
            </div>
            <button className="text-center text-primary text-sm font-medium py-2 border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors">
              Try the AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Pro Bono Lawyers */}
      <section className="bg-[#F2EFEB] px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
            {[
              { label: "Labour Law", color: "bg-primary" },
              { label: "Housing & Property", color: "bg-accent" },
              { label: "Family Law", color: "bg-tertiary" },
              { label: "Criminal Defence", color: "bg-neutral" },
              { label: "Commercial Law", color: "bg-primary-light" },
              { label: "Administrative", color: "bg-accent-dark" },
            ].map(({ label, color }) => (
              <div key={label} className="bg-surface rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-2 h-8 ${color} rounded-full`} />
                <span className="text-sm font-medium text-primary">{label}</span>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="text-accent" size={20} />
              <p className="text-accent font-semibold text-sm uppercase tracking-widest">Pro Bono Access</p>
            </div>
            <h2 className="font-serif text-4xl font-bold text-primary mb-6">
              Some lawyers on LexCam offer free consultations
            </h2>
            <p className="text-muted leading-relaxed mb-6">
              Not everyone can afford a lawyer. That is why LexCam works with verified lawyers who have agreed to offer free or reduced-fee consultations for citizens in need. When searching the directory, you can filter by pro bono availability.
            </p>
            <p className="text-muted leading-relaxed mb-8">
              Pro bono lawyers are available across Labour Law, Housing, Family Law, and Criminal Defence — the areas where vulnerable citizens need help most.
            </p>
            <button className="inline-flex items-center gap-2 border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary/5 transition-colors">
              Find a pro bono lawyer <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* NGOs & Support Organizations */}
      <section className="bg-surface px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="text-tertiary" size={20} />
            <p className="text-tertiary font-semibold text-sm uppercase tracking-widest">Beyond Legal Advice</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-serif text-4xl font-bold text-primary mb-6">
                Our AI can connect you with organizations that fight for your rights
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Some situations call for more than a letter. If you are facing domestic violence, workplace discrimination, or a rights violation, our AI can recommend support organizations that provide legal assistance, shelter, counselling, and advocacy — at no cost to you.
              </p>
              <p className="text-muted leading-relaxed">
                LexCam works alongside civil society so that no one is left without a path forward, regardless of their financial situation.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { name: "FIDA Cameroon", desc: "International Federation of Women Lawyers — provides free legal aid to women and children facing rights violations.", domain: "Women's Rights" },
                { name: "CAMGEW", desc: "Cameroon Gender and Environment Watch — advocates for women's rights in rural and urban communities across Cameroon.", domain: "Gender Equality" },
                { name: "NCHRF", desc: "National Commission on Human Rights and Freedoms — investigates complaints and mediates between citizens and institutions.", domain: "Human Rights" },
                { name: "Reach Out Cameroon", desc: "Community-based organization supporting marginalized groups with legal, health, and social services.", domain: "Social Justice" },
              ].map(({ name, desc, domain }) => (
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
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="font-serif text-4xl font-bold text-white mb-6 leading-tight">
              Access to justice should not depend on how much you can afford to pay
            </h2>
            <p className="text-white/70 leading-relaxed mb-6">
              In Cameroon, the gap between citizens and the legal system is wide. Legal services are expensive, courts are slow, and most people do not know what rights the law gives them. LexCam was built to close that gap.
            </p>
            <p className="text-white/70 leading-relaxed">
              We combine artificial intelligence with a verified lawyer directory, a document generator, and a library of Cameroonian law — all in French and English — so that any citizen can understand their situation and take action.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: Landmark, title: "Built on Cameroonian law", desc: "Our knowledge base covers the Labour Code, Civil Code, Penal Code, and key regulations specific to Cameroon." },
              { icon: Shield, title: "Bilingual by design", desc: "French and English are equal here. Every feature, every document, every AI response works in both languages." },
              { icon: Briefcase, title: "Verified professionals", desc: "Every lawyer on our platform is verified against the Barreau du Cameroun registry before being listed." },
            ].map(({ icon: Icon, title, desc }) => (
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
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">Are you a lawyer?</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Join the LexCam directory and reach citizens who need your expertise. Offer pro bono consultations, manage referrals, and build your presence — verified by the Barreau du Cameroun.
            </p>
            <button className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-light transition-colors">
              Register as a lawyer <ArrowRight size={16} />
            </button>
          </div>
          <div className="bg-tertiary/10 rounded-2xl p-10">
            <Heart className="text-tertiary mb-4" size={32} />
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">Are you an NGO or advocacy group?</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Partner with LexCam so our AI can recommend your services to citizens who need support beyond legal advice. Help us make sure no one is referred to the wrong place.
            </p>
            <button className="inline-flex items-center gap-2 border border-tertiary text-tertiary px-6 py-3 rounded-full text-sm font-medium hover:bg-tertiary/5 transition-colors">
              Get in touch <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#F2EFEB] px-6 md:px-16 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            Know your rights. Take action today.
          </h2>
          <p className="text-muted mb-10 leading-relaxed">
            Whether you are dealing with an unpaid salary, a landlord dispute, or a situation you simply do not understand — LexCam gives you the knowledge and tools to move forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-10 py-4 rounded-full font-medium hover:bg-primary-light transition-colors">
              Start with the AI
            </button>
            <button className="border border-primary text-primary px-10 py-4 rounded-full font-medium hover:bg-primary/5 transition-colors">
              Generate a document
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
