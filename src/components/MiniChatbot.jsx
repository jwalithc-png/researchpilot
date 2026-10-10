import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Download,
  Bot,
  User,
  Sparkles,
  Settings,
  ChevronDown,
  RefreshCw,
  Check,
  Copy,
  Brain,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  sendChatMessage,
  getChatSettings,
  saveChatSettings,
  DEFAULT_OLLAMA_KEY
} from '../utils/chatApi';

export default function MiniChatbot({ reportData, activeTopic }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getChatSettings());
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat memory on mount
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Save chat memory whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: 'msg_u_' + Date.now().toString(36),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const botResponse = await sendChatMessage({
        message: text,
        history: newHistory,
        context: {
          reportData,
          activeTopic
        }
      });

      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      const errorMsg = {
        id: 'msg_err_' + Date.now().toString(36),
        role: 'assistant',
        content: "Oops! Something went slightly wrong. Don't worry, my memory is safe! Could you try asking that again in simple words?",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat memory? This will reset all conversation history.')) {
      const freshHistory = clearChatHistory();
      setMessages(freshHistory);
    }
  };

  const handleExportChat = () => {
    const textBlob = messages
      .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'YOU' : 'PILOTBOT'}:\n${m.content}\n`)
      .join('\n---\n\n');

    const element = document.createElement('a');
    const file = new Blob([textBlob], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ResearchPilot_Chat_Memory_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveChatSettings(settings);
    setSavedSettingsNotice(true);
    setTimeout(() => {
      setSavedSettingsNotice(false);
      setShowSettings(false);
    }, 1500);
  };

  // Quick Action Prompts
  const quickPrompts = [
    { label: '💡 Explain simply', query: 'Can you explain this entire research topic in very simple words that anyone can understand?' },
    { label: '📌 Key Takeaways', query: 'What are the top 3 most important takeaways from this research?' },
    { label: '📚 How was it verified?', query: 'Where did the facts in this report come from and how do I know they are real?' },
    { label: '🧠 Test Memory', query: 'What is our conversation about so far? Can you summarize what we talked about?' }
  ];

  // Helper to render simple markdown-like text
  const renderSimpleFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Bold rendering
      let processed = line;
      const parts = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(line.substring(lastIdx, match.index));
        }
        parts.push(<strong key={`b_${idx}_${match.index}`} style={{ color: '#f8fafc', fontWeight: 600 }}>{match[1]}</strong>);
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < line.length) {
        parts.push(line.substring(lastIdx));
      }

      // Check if header
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontSize: '0.92rem', color: '#67e8f9', margin: '8px 0 4px 0', fontWeight: 600 }}>
            {line.replace('### ', '')}
          </h4>
        );
      }

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '3px 0' }}>
            <span style={{ color: '#818cf8', marginTop: '2px' }}>•</span>
            <span style={{ fontSize: '0.86rem', color: '#e2e8f0' }}>{parts.length > 0 ? parts : line.replace(/^[\*\•\-]\s*/, '')}</span>
          </div>
        );
      }

      // Quote block
      if (line.trim().startsWith('>')) {
        return (
          <blockquote key={idx} style={{ borderLeft: '3px solid #6366f1', paddingLeft: '8px', margin: '6px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.84rem' }}>
            {line.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      if (!line.trim()) {
        return <div key={idx} style={{ height: '6px' }} />;
      }

      return (
        <p key={idx} style={{ margin: '4px 0', fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.55 }}>
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'var(--font-sans)' }}>
      {/* Floating Action Button when closed */}
      {!isOpen && (
        <div style={{ position: 'relative' }}>
          {/* Welcome tooltip pill */}
          <div
            onClick={() => setIsOpen(true)}
            style={{
              position: 'absolute',
              bottom: '68px',
              right: '0',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(99, 102, 241, 0.25)',
              borderRadius: '24px',
              padding: '6px 14px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              animation: 'bounceSlow 3s infinite ease-in-out'
            }}
          >
            <Sparkles size={14} color="#67e8f9" />
            <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>
              Need simple answers? Ask AI!
            </span>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          </div>

          {/* Main Floating Trigger Button */}
          <button
            id="open-mini-chatbot-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open Mini AI Chatbot"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Bot size={28} color="#ffffff" />
          </button>
        </div>
      )}

      {/* Expanded Chatbot Window */}
      {isOpen && (
        <div
          id="mini-chatbot-window"
          style={{
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '580px',
            maxHeight: 'calc(100vh - 48px)',
            background: 'rgba(10, 15, 29, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                  position: 'relative'
                }}
              >
                <Bot size={20} color="#ffffff" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #0f172a'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    PilotBot
                  </h3>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    Ollama Connected
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
                  Answers in simple words • Memory active
                </p>
              </div>
            </div>

            {/* Header Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Chat Settings & API Key"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: showSettings ? '#67e8f9' : '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <Settings size={16} />
              </button>

              <button
                onClick={handleExportChat}
                title="Download Chat History"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <Download size={16} />
              </button>

              <button
                onClick={handleClearHistory}
                title="Reset Chat Memory"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Optional Settings Panel Overlay */}
          {showSettings && (
            <div
              style={{
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.98)',
                borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.8rem'
              }}
            >
              <form onSubmit={handleSaveSettings}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>API & Model Settings</span>
                  {savedSettingsNotice && (
                    <span style={{ color: '#10b981', fontSize: '0.72rem' }}>✓ Settings Saved!</span>
                  )}
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontSize: '0.72rem' }}>
                    Ollama API Key:
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontSize: '0.72rem' }}>
                      Model:
                    </label>
                    <input
                      type="text"
                      value={settings.model}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.75rem'
                      }}
                    />
                  </div>
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', height: '32px' }}
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                  Key configured: <code style={{ color: '#67e8f9' }}>{settings.apiKey.slice(0, 10)}...{settings.apiKey.slice(-6)}</code>
                </div>
              </form>
            </div>
          )}

          {/* Context / Memory Notification Banner */}
          <div
            style={{
              padding: '6px 14px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={13} color="#a5b4fc" />
              <span>Remembers our chat history ({messages.length} messages)</span>
            </div>
            {activeTopic && (
              <span
                style={{
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#67e8f9'
                }}
                title={activeTopic}
              >
                Topic: {activeTopic}
              </span>
            )}
          </div>

          {/* Messages Container */}
          <div
            id="mini-chatbot-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      maxWidth: '88%',
                      flexDirection: isUser ? 'row-reverse' : 'row'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isUser ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'rgba(30, 41, 59, 0.8)',
                        border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {isUser ? <User size={14} color="#ffffff" /> : <Bot size={14} color="#67e8f9" />}
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        background: isUser
                          ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                          : 'rgba(15, 23, 42, 0.75)',
                        border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isUser
                          ? '0 4px 12px rgba(79, 70, 229, 0.3)'
                          : '0 4px 12px rgba(0, 0, 0, 0.3)',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 14px',
                        color: '#f8fafc',
                        position: 'relative'
                      }}
                    >
                      {/* Formatted Content */}
                      <div>{renderSimpleFormattedText(msg.content)}</div>

                      {/* Message Meta: timestamp & copy button */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '6px',
                          gap: '10px',
                          fontSize: '0.68rem',
                          color: isUser ? 'rgba(255, 255, 255, 0.6)' : '#64748b'
                        }}
                      >
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        {!isUser && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {msg.modelUsed && (
                              <span style={{ fontSize: '0.65rem', color: '#67e8f9' }}>
                                {msg.modelUsed.includes('gemma') ? 'gemma4:31b' : 'PilotBot'}
                              </span>
                            )}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              title="Copy response"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: copiedId === msg.id ? '#10b981' : '#64748b',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex'
                              }}
                            >
                              {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '80%' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={14} color="#67e8f9" />
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '4px' }}>Thinking simply...</span>
                  <span className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#67e8f9', animation: 'pulse 1s infinite' }} />
                  <span className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818cf8', animation: 'pulse 1s infinite 0.2s' }} />
                  <span className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a855f7', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div
            style={{
              padding: '6px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              background: 'rgba(15, 23, 42, 0.5)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              scrollbarWidth: 'none'
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                disabled={isTyping}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  color: '#cbd5e1',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              id="mini-chatbot-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything in simple words..."
              disabled={isTyping}
              style={{
                flex: 1,
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#f8fafc',
                fontSize: '0.84rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            />

            <button
              id="mini-chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: inputText.trim() && !isTyping
                  ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                  : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
                color: inputText.trim() && !isTyping ? '#ffffff' : '#64748b',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (inputText.trim() && !isTyping) e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
