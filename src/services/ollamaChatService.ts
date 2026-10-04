/**
 * ResearchPilot — Interactive AI Research Chatbot Service
 * 
 * Powered by the Ollama Cloud API (gemma4:31b)
 * 
 * Features:
 * - Uses Ollama /api/ollama/api/chat proxy or direct ollama.com endpoint
 * - Context-aware: passes research title, core question, domain, and dossier
 * - Robust fallback to Gemini if client-side CORS blocks external requests
 */

import { callGeminiAgent } from './ollamaAgentService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  engine?: 'ollama' | 'gemini';
}

export interface WorkspaceChatContext {
  title?: string;
  question?: string;
  domain?: string;
  objective?: string;
  documentsCount?: number;
  intelligence?: {
    researchPlan?: string;
    paperAnalyses?: string;
    potentialResearchGaps?: string;
    researchDirections?: string;
  } | null;
}

const OLLAMA_API_KEY =
  (import.meta as any).env?.VITE_OLLAMA_API_KEY ||
  (import.meta as any).env?.OLLAMA_API_KEY || '';

const OLLAMA_MODEL =
  (import.meta as any).env?.VITE_OLLAMA_MODEL || 'gemma4:31b';

/**
 * Builds a context-aware system prompt injecting research workspace details
 */
function buildSystemPrompt(context?: WorkspaceChatContext): string {
  let prompt = `You are the ResearchPilot AI Copilot powered by Ollama (${OLLAMA_MODEL}). You are an elite research assistant specializing in academic exploration, methodology comparison, hypothesis generation, and experimental design.`;

  if (context?.title || context?.question) {
    prompt += `\n\nActive Research Workspace Context:
- Research Title: ${context.title || 'Untitled'}
- Core Hypothesis / Question: ${context.question || 'None specified'}
- Domain: ${context.domain || 'Interdisciplinary'}
- Primary Objective: ${context.objective || 'Exploratory'}`;

    if (context.documentsCount) {
      prompt += `\n- Corpus Documents: ${context.documentsCount} attached document(s)`;
    }

    if (context.intelligence?.potentialResearchGaps) {
      prompt += `\n- Discovered Research Gaps: ${context.intelligence.potentialResearchGaps.slice(0, 400)}...`;
    }

    if (context.intelligence?.researchDirections) {
      prompt += `\n- Suggested Research Directions: ${context.intelligence.researchDirections.slice(0, 400)}...`;
    }
  }

  prompt += `\n\nGuidelines:
1. Provide concise, rigorous, publication-grade academic answers.
2. Use markdown formatting (bullet points, bold text, code blocks where appropriate).
3. If the user asks about their research question or gaps, ground your answer in their workspace context.
4. Keep answers focused, practical, and intellectually thorough.`;

  return prompt;
}

/**
 * Sends a chat message to Ollama with multi-tier connection support
 */
export async function sendChatMessage(
  messages: { role: string; content: string }[],
  context?: WorkspaceChatContext
): Promise<{ reply: string; engine: 'ollama' | 'gemini' }> {
  const systemPrompt = buildSystemPrompt(context);

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content }))
  ];

  // Strategy 1: Call /api/ollama/api/chat (Vite proxy on localhost:3000)
  try {
    console.log('[ResearchPilot Chat] Trying Ollama proxy endpoint: /api/ollama/api/chat');
    const proxyController = new AbortController();
    const proxyTimeout = setTimeout(() => proxyController.abort(), 20000);

    const proxyRes = await fetch('/api/ollama/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: fullMessages,
        stream: false
      }),
      signal: proxyController.signal
    });

    clearTimeout(proxyTimeout);

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      const text = data?.message?.content;
      if (text) {
        console.log('[ResearchPilot Chat] Ollama proxy response received:', text.substring(0, 100));
        return { reply: text.trim(), engine: 'ollama' };
      }
    }
  } catch (proxyErr: any) {
    console.log('[ResearchPilot Chat] Ollama proxy unreachable, trying direct endpoint...', proxyErr?.message);
  }

  // Strategy 2: Direct call to https://ollama.com/api/chat with Bearer token
  try {
    console.log('[ResearchPilot Chat] Trying direct Ollama endpoint: https://ollama.com/api/chat');
    const directController = new AbortController();
    const directTimeout = setTimeout(() => directController.abort(), 20000);

    const directRes = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: fullMessages,
        stream: false
      }),
      signal: directController.signal
    });

    clearTimeout(directTimeout);

    if (directRes.ok) {
      const data = await directRes.json();
      const text = data?.message?.content;
      if (text) {
        console.log('[ResearchPilot Chat] Direct Ollama response received:', text.substring(0, 100));
        return { reply: text.trim(), engine: 'ollama' };
      }
    }
  } catch (directErr: any) {
    console.log('[ResearchPilot Chat] Direct Ollama call blocked (e.g. browser CORS). Falling back to Gemini...', directErr?.message);
  }

  // Strategy 3: Cloud Fallback to Gemini if Ollama is blocked by browser CORS
  console.log('[ResearchPilot Chat] Using high-speed Cloud Copilot fallback (Gemini)');
  const chatHistoryContext = messages
    .slice(-4)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const geminiPrompt = `${systemPrompt}\n\nRecent Conversation:\n${chatHistoryContext}\n\nPlease respond to the user's latest inquiry thoughtfully.`;
  const reply = await callGeminiAgent(
    'You are the ResearchPilot AI Research Copilot.',
    geminiPrompt,
    { maxOutputTokens: 600, temperature: 0.3 }
  );

  return { reply: reply.trim(), engine: 'gemini' };
}
