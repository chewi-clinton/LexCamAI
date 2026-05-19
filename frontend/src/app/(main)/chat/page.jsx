'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Plus, MessageSquare, Bot, BookOpen, FileText, Paperclip, Send, Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/layout/Header';
import { chat as chatApi, streamChatMessage } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import t from '@/translations';

function relativeDate(iso, lang) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff === 0) return lang === 'fr' ? "Aujourd'hui" : 'Today';
  if (diff === 1) return lang === 'fr' ? 'Hier' : 'Yesterday';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function normalizeMessages(apiMessages) {
  return (apiMessages ?? []).map((m) => ({
    id: m.id,
    role: m.role === 'assistant' ? 'bot' : m.role,
    text: m.content ?? m.text ?? '',
    tags: m.sources ?? [],
  }));
}

export default function AIAssistant() {
  const { lang, setLang } = useLanguage();
  const T = t[lang].chat;

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const botAddedRef = useRef(false);

  useEffect(() => {
    loadConversations();
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('c');
    if (convId) selectConversation(convId);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  async function loadConversations() {
    setConvLoading(true);
    try {
      const data = await chatApi.conversations();
      setConversations(data);
    } catch { /* silent — sidebar just stays empty */ }
    finally { setConvLoading(false); }
  }

  async function selectConversation(id) {
    clearInterval(streamIntervalRef.current);
    setIsStreaming(false);
    setIsTyping(false);
    setActiveConvId(id);
    setInput('');
    setMsgsLoading(true);
    window.history.replaceState({}, '', `/chat?c=${id}`);
    try {
      const data = await chatApi.getConversation(id);
      setMessages(normalizeMessages(data.messages));
    } catch {
      setMessages([]);
    } finally {
      setMsgsLoading(false);
    }
  }

  function startNewConsult() {
    clearInterval(streamIntervalRef.current);
    setIsStreaming(false);
    setIsTyping(false);
    setActiveConvId(null);
    setMessages([]);
    setInput('');
    window.history.replaceState({}, '', '/chat');
  }

  function simulateStreaming(botMsgId, fullText, tags) {
    const words = fullText.split(' ');
    let wordIndex = 0;
    setIsStreaming(true);
    setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', text: '', streaming: true, tags }]);
    streamIntervalRef.current = setInterval(() => {
      wordIndex++;
      const partial = words.slice(0, wordIndex).join(' ');
      const done = wordIndex >= words.length;
      setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, text: partial, streaming: !done } : m));
      if (done) { clearInterval(streamIntervalRef.current); setIsStreaming(false); }
    }, 60);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isTyping || isStreaming) return;
    setInput('');

    let convId = activeConvId;
    if (!convId) {
      try {
        const conv = await chatApi.create();
        convId = conv.id;
        setActiveConvId(convId);
        setConversations((prev) => [
          { id: convId, title: text.slice(0, 60), updated_at: new Date().toISOString() },
          ...prev,
        ]);
        window.history.replaceState({}, '', `/chat?c=${convId}`);
      } catch { /* send anyway — backend may auto-create */ }
    }

    const userMsgId = `u_${Date.now()}`;
    const botMsgId = `b_${Date.now() + 1}`;
    botAddedRef.current = false;

    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text }]);
    setIsTyping(true);

    let accumulated = '';

    await streamChatMessage(convId, text, {
      onChunk: (chunk) => {
        accumulated += chunk;
        if (!botAddedRef.current) {
          botAddedRef.current = true;
          setIsTyping(false);
          setIsStreaming(true);
          setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', text: accumulated, streaming: true, tags: [] }]);
        } else {
          setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, text: accumulated } : m));
        }
      },
      onDone: () => {
        setIsStreaming(false);
        setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, streaming: false } : m));
      },
      onError: async () => {
        try {
          const resp = await chatApi.sendMessage(convId, text);
          const fullText = resp.content ?? resp.message ?? resp.text ?? '';
          const sources = resp.sources ?? [];
          setIsTyping(false);
          simulateStreaming(botMsgId, fullText, sources);
        } catch {
          setIsTyping(false);
          setMessages((prev) => [...prev, {
            id: botMsgId, role: 'bot',
            text: lang === 'fr' ? 'Une erreur s\'est produite. Veuillez réessayer.' : 'Something went wrong. Please try again.',
            tags: [],
          }]);
        }
      },
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
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
            {convLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 rounded-xl">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full text-left p-3 rounded-xl flex gap-3 transition-colors ${activeConvId === c.id ? 'bg-gray-100 text-primary' : 'hover:bg-gray-100/50 text-muted hover:text-primary'}`}
                  >
                    <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${activeConvId === c.id ? 'text-gray-900' : 'text-gray-700'}`}>
                        {c.title ?? 'New consultation'}
                      </p>
                      <p className={`text-xs mt-0.5 ${activeConvId === c.id ? 'text-gray-500' : 'text-gray-400'}`}>
                        {relativeDate(c.updated_at, lang)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-[#F7F6F3] min-h-0">

          <div className="flex-1 relative min-h-0">
            <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto space-y-8">

                {/* Welcome message */}
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

                {/* Loading conversation messages */}
                {msgsLoading && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div className="bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                      <Loader2 size={16} className="text-primary animate-spin" />
                      <span className="text-sm text-gray-400">Loading conversation…</span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {!msgsLoading && messages.map((msg) => {
                  if (msg.role === 'user') {
                    return (
                      <div key={msg.id} className="flex gap-4 flex-row-reverse">
                        <div className="bg-primary text-white shadow-sm rounded-2xl rounded-tr-sm p-4 md:p-5 max-w-[85%]">
                          <p className="leading-relaxed text-sm md:text-base">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }

                  const hasTags = msg.tags?.length > 0;
                  return (
                    <div key={msg.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className={`bg-surface border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 md:p-5 max-w-[90%] ${hasTags ? 'space-y-4' : ''}`}>
                        <div className="text-gray-800 text-sm md:text-base">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              h1: ({ children }) => <h1 className="font-bold text-base mb-2 mt-3 first:mt-0">{children}</h1>,
                              h2: ({ children }) => <h2 className="font-bold text-sm mb-1 mt-3 first:mt-0">{children}</h2>,
                              h3: ({ children }) => <h3 className="font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                          {msg.streaming && (
                            <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 align-middle animate-pulse" />
                          )}
                        </div>
                        {hasTags && !msg.streaming && (
                          <>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {msg.tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                  <BookOpen size={14} /> {tag}
                                </span>
                              ))}
                            </div>
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
                          </>
                        )}
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
