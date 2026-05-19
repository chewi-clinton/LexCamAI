'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Plus, MessageSquare, Bot, BookOpen, FileText, Paperclip, Send, Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

const CONSULTATIONS = [
  {
    id: 'c1',
    title: 'Termination Without Cause',
    date: 'Today',
    messages: [
      { id: 1, role: 'user', text: "My boss just told me not to come back to work tomorrow. I've been working there for 3 years without a formal contract. What are my rights?" },
      {
        id: 2, role: 'bot', text: null, isLabour: true,
        body: 'Under Cameroonian Labor Law, even without a written contract, your continuous work for 3 years likely establishes an indefinite-term employment relationship (oral contract). Being told not to return constitutes a dismissal. For a dismissal to be lawful, your employer must have a valid reason, provide proper notice, and follow specific disciplinary procedures if the dismissal is for misconduct. If these conditions are not met, the dismissal may be considered abusive — you may be entitled to damages, payment in lieu of notice, and severance pay.',
        tags: ['Labour Code Art. 23', 'Labour Code Art. 34'],
      },
    ],
  },
  {
    id: 'c2',
    title: 'Starting a Tech Business',
    date: 'Yesterday',
    messages: [
      { id: 1, role: 'user', text: 'What legal steps do I need to take to register a tech startup in Cameroon?' },
      { id: 2, role: 'bot', text: 'To register a company in Cameroon you need to go through the Centre de Formalités de Création d\'Entreprises (CFCE). You\'ll need a business name, registered address, articles of incorporation, and initial capital. The OHADA law governs commercial companies. Most tech startups register as a SARL (Société à Responsabilité Limitée) which requires a minimum capital of 1,000,000 FCFA.' },
    ],
  },
  {
    id: 'c3',
    title: 'Land Dispute Registration',
    date: 'Oct 12',
    messages: [
      { id: 1, role: 'user', text: 'Someone is claiming ownership of my inherited land. How do I protect my rights?' },
      { id: 2, role: 'bot', text: 'Land disputes in Cameroon are governed by Ordinance No. 74-1 of 1974. You should immediately file a complaint at the relevant Divisional Office and request a land certificate (titre foncier) if you don\'t already have one. Gather all inheritance documents, witness statements, and any historical proof of occupation. Consulting a lawyer specializing in real estate law is strongly recommended.' },
    ],
  },
];

const MOCK_RESPONSES = [
  'Thank you for your question. Based on Cameroonian law, here is what I can tell you...',
  'This is a common legal question. Under the applicable regulations, you should know that...',
  'I understand your concern. Let me explain the relevant legal framework...',
];

export default function AIAssistant() {
  const { lang, setLang } = useLanguage();
  const T = t[lang].chat;

  const [activeConversation, setActiveConversation] = useState('c1');
  const [messages, setMessages] = useState(CONSULTATIONS[0].messages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);
  const streamIntervalRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  function loadConversation(consultation) {
    clearInterval(streamIntervalRef.current);
    setIsStreaming(false);
    setIsTyping(false);
    setActiveConversation(consultation.id);
    setMessages(consultation.messages);
    setInput('');
  }

  function startNewConsult() {
    clearInterval(streamIntervalRef.current);
    setIsStreaming(false);
    setIsTyping(false);
    setActiveConversation(null);
    setMessages([]);
    setInput('');
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || isTyping || isStreaming) return;
    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const fullText = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const words = fullText.split(' ');
    const botId = Date.now() + 1;

    setTimeout(() => {
      setIsTyping(false);
      setIsStreaming(true);
      setMessages((prev) => [...prev, { id: botId, role: 'bot', text: '', streaming: true }]);

      let wordIndex = 0;
      streamIntervalRef.current = setInterval(() => {
        wordIndex++;
        const partial = words.slice(0, wordIndex).join(' ');
        const done = wordIndex >= words.length;
        setMessages((prev) =>
          prev.map((m) => m.id === botId ? { ...m, text: partial, streaming: !done } : m)
        );
        if (done) {
          clearInterval(streamIntervalRef.current);
          setIsStreaming(false);
        }
      }, 60);
    }, 700);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="h-screen flex flex-col font-sans bg-background overflow-hidden">
      <Header activePage="chat" />

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-200/60 bg-surface/50 hidden lg:flex flex-col flex-shrink-0">
          <div className="p-4">
            <button
              onClick={startNewConsult}
              className="w-full bg-primary hover:bg-primary-light transition-colors text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              {T.newConsult}
            </button>
          </div>

          <div className="px-4 py-2 flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              {T.recentConsultations}
            </h3>
            <div className="space-y-1">
              {CONSULTATIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c)}
                  className={`w-full text-left p-3 rounded-xl flex gap-3 transition-colors ${activeConversation === c.id ? 'bg-gray-100 text-primary' : 'hover:bg-gray-100/50 text-muted hover:text-primary'}`}
                >
                  <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className={`text-sm font-medium truncate ${activeConversation === c.id ? 'text-gray-900' : 'text-gray-700'}`}>{c.title}</p>
                    <p className={`text-xs mt-0.5 ${activeConversation === c.id ? 'text-gray-500' : 'text-gray-400'}`}>{c.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-[#F7F6F3] min-h-0">

          {/* Messages Container */}
          <div className="flex-1 relative min-h-0">
          <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Welcome message always shown at top */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 md:p-5 max-w-[85%]">
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    {lang === 'fr'
                      ? 'Bonjour. Je suis l\'Assistant IA LexCam. Comment puis-je vous aider à comprendre votre situation juridique aujourd\'hui ?'
                      : 'Hello. I am the LexCam AI Assistant. How can I help you understand your legal situation today?'}
                  </p>
                </div>
              </div>

              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex gap-4 flex-row-reverse">
                      <div className="bg-primary text-white shadow-sm rounded-2xl rounded-tr-sm p-4 md:p-5 max-w-[85%]">
                        <p className="leading-relaxed text-sm md:text-base">{msg.text}</p>
                      </div>
                    </div>
                  );
                }
                if (msg.isLabour) {
                  return (
                    <div key={msg.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-5 md:p-6 max-w-[90%] space-y-4">
                        <p className="text-gray-800 leading-relaxed text-sm md:text-base">{msg.body}</p>
                        {msg.tags && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {msg.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                <BookOpen size={14} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 bg-[#EDF5F0] border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex gap-3 items-start">
                            <FileText className="text-primary mt-1" size={20} />
                            <div>
                              <h4 className="font-bold text-primary text-sm">{T.wantToSendLetter}</h4>
                              <p className="text-sm text-primary/80 mt-1">{T.draftLetter}</p>
                            </div>
                          </div>
                          <a href="/documents" className="bg-primary hover:bg-primary-light transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-sm">
                            {T.generateDocument}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 md:p-5 max-w-[85%]">
                      <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                        {msg.text}
                        {msg.streaming && (
                          <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 align-middle animate-pulse" />
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-sm text-gray-400">{lang === 'fr' ? 'En train d\'écrire...' : 'Typing...'}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F7F6F3] to-transparent pointer-events-none" />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 bg-[#F7F6F3] px-4 md:px-8 pb-6 pt-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-surface shadow-lg border border-gray-200/60 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={T.placeholder}
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
                      <button onClick={() => setLang('en')} className={`px-1 transition-colors ${lang === 'en' ? 'text-gray-800' : 'hover:text-gray-600'}`}>EN</button>
                      <button onClick={() => setLang('fr')} className={`px-1 transition-colors ${lang === 'fr' ? 'text-gray-800' : 'hover:text-gray-600'}`}>FR</button>
                    </div>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping || isStreaming}
                    className="bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white p-2.5 rounded-full shadow-sm flex items-center justify-center"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                {T.disclaimer}
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
