import {
  Plus,
  MessageSquare,
  Bot,
  BookOpen,
  FileText,
  Paperclip,
  Send
} from 'lucide-react';
import Header from '@/components/layout/Header';

export default function AIAssistant() {
  return (
    <div className="h-screen flex flex-col font-sans bg-background overflow-hidden">
      <Header activePage="chat" />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-200/60 bg-surface/50 hidden lg:flex flex-col flex-shrink-0">
          <div className="p-4">
            <button className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium">
              <Plus size={18} />
              New Consult
            </button>
          </div>

          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Recent Consultations
            </h3>
            <div className="space-y-1">
              <button className="w-full text-left bg-gray-100 text-primary p-3 rounded-xl flex gap-3 transition-colors">
                <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">Termination Without Cause</p>
                  <p className="text-xs text-gray-500 mt-0.5">Today</p>
                </div>
              </button>

              <button className="w-full text-left hover:bg-gray-100/50 text-muted hover:text-primary p-3 rounded-xl flex gap-3 transition-colors">
                <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate">Starting a Tech Business</p>
                  <p className="text-xs text-gray-400 mt-0.5">Yesterday</p>
                </div>
              </button>

              <button className="w-full text-left hover:bg-gray-100/50 text-muted hover:text-primary p-3 rounded-xl flex gap-3 transition-colors">
                <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate">Land Dispute Registration</p>
                  <p className="text-xs text-gray-400 mt-0.5">Oct 12</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col relative bg-[#F7F6F3]">

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Bot Welcome Message */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 md:p-5 max-w-[85%]">
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    Hello. I am the LexCam AI Assistant. How can I help you understand your legal situation today?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-4 flex-row-reverse">
                <div className="bg-primary text-white shadow-sm rounded-2xl rounded-tr-sm p-4 md:p-5 max-w-[85%]">
                  <p className="leading-relaxed text-sm md:text-base">
                    My boss just told me not to come back to work tomorrow. I&apos;ve been working there for 3 years without a formal contract. What are my rights?
                  </p>
                </div>
              </div>

              {/* Bot Detailed Response */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-5 md:p-6 max-w-[90%] space-y-4">
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    Under Cameroonian Labor Law, even without a written contract, your continuous work for 3 years likely establishes an{' '}
                    <strong className="font-semibold text-gray-900">indefinite-term employment relationship</strong> (oral contract).
                  </p>

                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    Being told not to return constitutes a dismissal. For a dismissal to be lawful, your employer must:
                  </p>

                  <ul className="list-disc pl-5 space-y-2 text-gray-800 text-sm md:text-base marker:text-primary">
                    <li>Have a valid reason (legitimate motive).</li>
                    <li>Provide proper notice before termination.</li>
                    <li>Follow specific disciplinary procedures if the dismissal is for misconduct.</li>
                  </ul>

                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    If these conditions are not met, the dismissal may be considered{' '}
                    <strong className="font-semibold text-gray-900">abusive</strong>. You may be entitled to damages, payment in lieu of notice, and severance pay.
                  </p>

                  {/* Legal Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                      <BookOpen size={14} /> Labour Code Art. 23
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                      <BookOpen size={14} /> Labour Code Art. 34
                    </span>
                  </div>

                  {/* Document Generator Callout */}
                  <div className="mt-2 bg-[#EDF5F0] border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      <FileText className="text-primary mt-1" size={20} />
                      <div>
                        <h4 className="font-bold text-primary text-sm">Want to send a formal letter?</h4>
                        <p className="text-sm text-primary/80 mt-1">Draft a letter requesting your employment certificate and severance.</p>
                      </div>
                    </div>
                    <button className="bg-primary hover:bg-primary-light transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-sm">
                      Generate Document
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Fixed Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F7F6F3] via-[#F7F6F3] to-transparent pt-10 pb-6 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-surface shadow-lg border border-gray-200/60 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                <textarea
                  placeholder="Describe your legal situation clearly..."
                  className="w-full resize-none outline-none p-3 text-gray-800 placeholder:text-gray-400 min-h-[60px] max-h-[150px] bg-transparent"
                  rows={2}
                />
                <div className="flex items-center justify-between px-2 pt-2 pb-1 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex gap-1 text-xs font-bold text-gray-400">
                      <button className="text-gray-800 px-1">EN</button>
                      <button className="px-1 hover:text-gray-600 transition-colors">FR</button>
                    </div>
                  </div>
                  <button className="bg-primary hover:bg-primary-light transition-colors text-white p-2.5 rounded-full shadow-sm flex items-center justify-center">
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                LexCam AI provides legal information, not professional legal advice. Consult a lawyer for complex matters.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
