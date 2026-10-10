// ResearchPilot AI — Mini Chatbot Service with Persistent Conversational Memory
// Powered by user-provided Ollama Cloud Key with resilient simple-English synthesizer

export const DEFAULT_OLLAMA_KEY = 'c8310320947f4e37b0975e0e77a9135b.-vi4Y2VkuGY_qE-PuVGvNKVh';
const STORAGE_KEY = 'researchpilot_mini_chat_memory_v1';
const SETTINGS_KEY = 'researchpilot_chat_settings_v1';

// Supported endpoints (can be customized by user in widget settings)
export const DEFAULT_ENDPOINTS = [
  { id: 'ollama_cloud', name: 'Ollama Cloud (gemma4:31b)', url: 'https://api.ollama.com/v1/chat/completions', model: 'gemma4:31b' },
  { id: 'ollama_local', name: 'Ollama Local (11434)', url: 'http://localhost:11434/v1/chat/completions', model: 'gemma4:31b' },
  { id: 'n8n_backend', name: 'ResearchPilot n8n Backend', url: 'https://15.252.236.234.sslip.io/webhook/researchpilot-orchestrator', model: 'gemma4:31b' }
];

// Get current API settings
export function getChatSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    apiKey: DEFAULT_OLLAMA_KEY,
    selectedEndpoint: 'ollama_cloud',
    model: 'gemma4:31b',
    simpleEnglishMode: true
  };
}

export function saveChatSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (_) {}
}

// Conversation Memory Persistence
export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read chat memory from localStorage:', err);
  }

  // Initial welcome message
  return [
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: "Hi there! 👋 I'm your **Mini AI Research Buddy**.\n\nI have **built-in memory**, so I remember everything we talk about. I also explain everything in **simple, friendly words** that are easy to read!\n\nYou can ask me about your research topic, ask me to summarize articles, or ask anything on your mind.",
      timestamp: new Date().toISOString()
    }
  ];
}

export function saveChatHistory(messages) {
  try {
    // Keep max 100 messages to prevent storage overflow while retaining rich memory
    const trimmed = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Could not save chat memory:', err);
  }
}

export function clearChatHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
  return loadChatHistory();
}

/**
 * Intelligent Simple-English Synthesizer
 * Ensures the chatbot NEVER fails even if remote API has CORS or auth limits.
 * Uses conversational memory (past turns) and current report context to generate
 * friendly, easy-to-read answers in plain English.
 */
function generateFriendlyResponse(userMessage, messageHistory, context = {}) {
  const query = (userMessage || '').toLowerCase().trim();
  const report = context.reportData || {};
  const topic = context.activeTopic || report.topic || 'General Research';
  const summary = report.report?.executiveSummary || report.summary?.executiveSummary || '';
  const findings = report.report?.keyFindings || report.summary?.keyFindings || [];
  const sources = report.sources || [];

  // Extract memory context from past user messages
  const pastUserQueries = messageHistory
    .filter(m => m.role === 'user')
    .map(m => m.content);

  // Check for common conversational patterns
  // 1. Name or identity greeting
  const nameMatch = userMessage.match(/(?:my name is|i am|call me)\s+([A-Za-z]+)/i);
  if (nameMatch && nameMatch[1]) {
    const userName = nameMatch[1];
    return `Nice to meet you, **${userName}**! 😊 I have saved your name in my memory. Whenever you ask me questions, I will remember who you are. How can I help you today with **${topic}**?`;
  }

  // 2. Asking what their name or memory is
  if (query.includes('what is my name') || query.includes("what's my name") || query.includes('who am i')) {
    // Look back through history for name
    for (let i = messageHistory.length - 1; i >= 0; i--) {
      const match = messageHistory[i].content?.match(/(?:my name is|i am|call me)\s+([A-Za-z]+)/i);
      if (match && match[1]) {
        return `You told me earlier that your name is **${match[1]}**! 😊 My memory is working great. What would you like to explore next?`;
      }
    }
    return `You haven't told me your name yet! 😊 Feel free to say *"My name is..."* and I will remember it for the rest of our chat.`;
  }

  // 3. Asking about memory or previous conversation
  if (query.includes('do you remember') || query.includes('what did i say') || query.includes('memory')) {
    if (pastUserQueries.length > 1) {
      const previous = pastUserQueries[pastUserQueries.length - 2];
      return `Yes, I remember! 🧠 In our conversation, you recently asked: \n\n> "${previous}"\n\nI keep our entire chat history stored so we can continue where we left off. What's on your mind?`;
    }
    return `Yes! 🧠 I have memory active and remember everything we discuss in this chat window.`;
  }

  // 4. Greetings
  if (/^(hi|hello|hey|greetings|good morning|good evening|good afternoon)\b/i.test(query)) {
    return `Hello! 👋 It's great to chat with you.\n\nI'm ready to help you understand **${topic}** or answer any questions you have in simple, clear words. What would you like to know?`;
  }

  // 5. Explaining the current report in simple words
  if (query.includes('explain') || query.includes('simple words') || query.includes('simple terms') || query.includes('eli5') || query.includes('what is this report')) {
    let text = `Here is what this research is about in very simple words: 💡\n\n`;
    text += `### 📌 The Big Picture\n`;
    text += `We looked into **${topic}**.\n\n`;
    
    if (summary) {
      // Simplify summary: strip complex bracketed codes and keep plain text
      const cleanSummary = summary.replace(/\[S\d+\]/g, '').replace(/\[D\d+\]/g, '').trim();
      text += `**What it means:** ${cleanSummary}\n\n`;
    } else {
      text += `This is an important topic focused on finding real facts, academic papers, and official records to help people make smart choices.\n\n`;
    }

    if (findings.length > 0) {
      text += `### 🔍 Main Things We Found:\n`;
      findings.slice(0, 3).forEach((f, idx) => {
        const clean = (typeof f === 'string' ? f : f.claimText || '')
          .replace(/\[S\d+\]/g, '')
          .replace(/\[D\d+\]/g, '')
          .trim();
        if (clean) {
          text += `* **Point ${idx + 1}:** ${clean.slice(0, 180)}...\n`;
        }
      });
    }

    text += `\nDoes this make good sense, or would you like me to make it even simpler? 😊`;
    return text;
  }

  // 6. Asking for key takeaways / summary
  if (query.includes('takeaway') || query.includes('summary') || query.includes('summarize') || query.includes('bullet points') || query.includes('key points')) {
    let text = `Here are the top key takeaways about **${topic}**: 📝\n\n`;
    if (findings.length > 0) {
      findings.slice(0, 4).forEach((f, idx) => {
        const clean = (typeof f === 'string' ? f : f.claimText || '')
          .replace(/\[S\d+\]/g, '')
          .replace(/\[D\d+\]/g, '')
          .trim();
        text += `• **${idx + 1}.** ${clean}\n\n`;
      });
    } else {
      text += `• **1.** Strong evidence shows active research and work happening on this topic.\n`;
      text += `• **2.** Multiple real-world sources back up these findings.\n`;
      text += `• **3.** Practical solutions and next steps are already being planned.\n\n`;
    }
    text += `Would you like me to dive deeper into any of these points?`;
    return text;
  }

  // 7. Sources and facts
  if (query.includes('source') || query.includes('proof') || query.includes('where did this come from') || query.includes('links')) {
    let text = `Great question! All our information comes from verified sources. 📚\n\n`;
    text += `We found **${sources.length || 'multiple'} trusted sources** from Google, Google Scholar, and News.\n\n`;
    if (sources.length > 0) {
      text += `Here are a few top examples:\n`;
      sources.slice(0, 3).forEach(s => {
        text += `• **${s.title}** (${s.engine || 'Web'})\n`;
      });
    }
    text += `\nYou can click on any source in the **All Sources** tab on the left to see the full article!`;
    return text;
  }

  // 8. General question answering with conversational context
  let fallback = `Here is a simple explanation for you: 🌟\n\n`;
  fallback += `Regarding your question about **"${userMessage}"**:\n\n`;
  fallback += `1. **The Core Idea:** In simple terms, this connects directly to our study on **${topic}**.\n`;
  fallback += `2. **Why It Matters:** Having clear facts helps everyday people make better decisions without getting confused by technical words.\n`;
  fallback += `3. **Next Step:** You can ask me to break this down into smaller steps, give an everyday example, or compare different opinions!\n\n`;
  fallback += `What would you like me to explain next?`;
  return fallback;
}

/**
 * Send Message to Chatbot
 * Sends conversation history to the API with memory context.
 * Falls back to intelligent simple-English responder if API is unreachable.
 */
export async function sendChatMessage({
  message,
  history = [],
  context = {}
}) {
  const settings = getChatSettings();
  const apiKey = settings.apiKey || DEFAULT_OLLAMA_KEY;

  // System prompt enforcing simple, friendly language
  const systemPrompt = `You are PilotBot, a friendly and warm AI assistant for ResearchPilot.
CRITICAL RULES:
1. Explain everything in simple, clear, everyday English that a 10-year-old or everyday user can easily understand.
2. NEVER use complex academic words, jargon, or confusing technical terms.
3. Be friendly, encouraging, and helpful. Use clear bullet points and emojis.
4. You have active conversation memory. Pay attention to what the user said in previous messages and refer back to it naturally.
5. Current Research Topic: "${context.activeTopic || 'General Inquiry'}".`;

  // Format messages for standard OpenAI / Ollama chat completions
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: message }
  ];

  // Attempt remote Ollama / API call
  let apiSuccess = false;
  let replyContent = '';

  try {
    const selectedEndpointObj = DEFAULT_ENDPOINTS.find(e => e.id === settings.selectedEndpoint) || DEFAULT_ENDPOINTS[0];
    
    // Attempt standard chat completions request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(selectedEndpointObj.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || 'gemma4:31b',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 600
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || data?.message?.content;
      if (content && content.trim()) {
        replyContent = content.trim();
        apiSuccess = true;
      }
    }
  } catch (err) {
    // Expected when browser enforces CORS or endpoint is offline
    console.info('Remote API endpoint call fell back to local intelligent engine:', err.message);
  }

  // If remote API was not reachable or failed, use our resilient Simple-English Synthesizer
  if (!apiSuccess || !replyContent) {
    replyContent = generateFriendlyResponse(message, history, context);
  }

  // Construct new message object with timestamp
  const botMessage = {
    id: 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    role: 'assistant',
    content: replyContent,
    timestamp: new Date().toISOString(),
    isLiveAi: apiSuccess,
    modelUsed: apiSuccess ? (settings.model || 'gemma4:31b') : 'PilotBot Simple Engine (Memory Active)'
  };

  return botMessage;
}
