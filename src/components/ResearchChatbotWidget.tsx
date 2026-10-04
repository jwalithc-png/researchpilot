import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  Trash2, 
  Loader2, 
  Check, 
  Copy
} from 'lucide-react';
import { sendChatMessage, ChatMessage, WorkspaceChatContext } from '../services/ollamaChatService';

interface ResearchChatbotWidgetProps {
  workspaceContext?: WorkspaceChatContext;
  isOpen?: boolean;
  onToggle?: () => void;
}

const QUICK_PROMPTS = [
  'What are the most critical research gaps?',
  'Suggest 3 novel experimental methodologies',
  'Draft a 200-word academic research abstract',
  'Compare key trade-offs in this domain'
];

export const ResearchChatbotWidget: React.FC<ResearchChatbotWidgetProps> = ({
  workspaceContext,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isWidgetOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleOpen = controlledOnToggle || (() => setInternalIsOpen((prev) => !prev));

  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const defaultGreeting: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **ResearchPilot AI Copilot**, powered by **Ollama (gemma4:31b)**.\n\nI have loaded your research context:\n* **Title:** ${workspaceContext?.title || 'Active Research Workspace'}\n* **Question:** ${workspaceContext?.question || 'Defined hypothesis'}\n\nHow can I assist your investigation today? You can ask me to evaluate gaps, brainstorm methodologies, or formulate hypotheses.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'ollama'
    };
    return [defaultGreeting];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isWidgetOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isWidgetOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyToSend = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const { reply, engine } = await sendChatMessage(historyToSend, workspaceContext);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ **Error communicating with AI:** ${err?.message || 'Unable to connect to Ollama. Please ensure your network connection is active.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Conversation reset. I am ready to explore new aspects of **${workspaceContext?.title || 'your research'}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'ollama'
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button (visible when widget is closed) */}
      {!isWidgetOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95"
          title="Chat with Ollama AI Research Assistant"
        >
          <div className="relative">
            <Bot size={22} className="text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
              Research Copilot
              <span className="px-1.5 py-0.2 text-[9px] bg-white/20 rounded-full font-mono uppercase tracking-wider">
                Ollama
              </span>
            </span>
            <span className="text-[10px] text-cyan-200">Ask anything about your study</span>
          </div>
        </button>
      )}

      {/* Main Chatbot Panel */}
      {isWidgetOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.25)] border border-cyan-500/30 rounded-2xl overflow-hidden bg-[#0a1324]/95 backdrop-blur-2xl ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-6 right-6 w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/60 via-blue-950/60 to-[#0a1324] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white font-serif tracking-tight">
                    ResearchPilot Copilot
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
                    Ollama gemma4:31b
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-[220px]">
                  Context: {workspaceContext?.title || 'Active Research'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-cyan-500/15 hover:border-cyan-500/40 border border-white/5 rounded-full text-slate-300 hover:text-cyan-200 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-sm">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 rounded-tr-none'
                          : 'bg-[#0f1b33] border border-white/10 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-sans selection:bg-cyan-500/30">
                        {msg.content}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                      <span>{msg.timestamp}</span>
                      {msg.engine && (
                        <span className="px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5 uppercase text-[9px]">
                          {msg.engine === 'ollama' ? 'Ollama' : 'Gemini'}
                        </span>
                      )}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-cyan-400 transition-colors ml-1"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-400">
                              <Check size={11} /> Copied
                            </span>
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-[#0f1b33] border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-cyan-300">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  <span>Ollama is reasoning over research...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/10 bg-[#070e1c] flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Ollama about hypotheses, gaps, papers..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:scale-105 active:scale-95"
              title="Send message"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
