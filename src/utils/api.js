// ResearchPilot API Client
import { BENCHMARK_DOSSIERS } from './benchmarkData';

const DEFAULT_LOCAL_PROXY = '/api/orchestrator';
const DIRECT_REMOTE_URL = 'https://15.252.236.234.sslip.io/webhook/researchpilot-orchestrator';

// In production builds (e.g. Firebase Hosting), direct remote URL is used
export const PRODUCTION_ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL || DIRECT_REMOTE_URL;

export function getOrchestratorEndpoint() {
  if (import.meta.env.PROD) {
    return PRODUCTION_ORCHESTRATOR_URL;
  }
  return DEFAULT_LOCAL_PROXY;
}

export async function executeAutonomousResearch({
  topic,
  country = 'in',
  language = 'en',
  engines = ['google', 'google_scholar', 'google_news', 'google_patents'],
  includeDocuments = true,
  maxSources = 20,
  researchDepth = 'deep',
  confidenceThreshold = 0.75,
  documents = [],
  useDirectUrl = false,
  customEndpoint = null
}) {
  const endpoint = customEndpoint || (useDirectUrl ? DIRECT_REMOTE_URL : getOrchestratorEndpoint());

  const payload = {
    topic: topic.trim(),
    country: country || 'in',
    language: language || 'en',
    engines: engines.length ? engines : ['google', 'google_scholar', 'google_news', 'google_patents'],
    includeDocuments: Boolean(includeDocuments && documents.length > 0),
    maxSources: Number(maxSources) || 20,
    researchDepth: researchDepth || 'deep',
    confidenceThreshold: Number(confidenceThreshold) || 0.75,
    ...(documents.length > 0 ? { documents } : {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for deep multi-engine research

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = null;
      try { errorJson = JSON.parse(errorText); } catch (_) {}
      
      const message = errorJson?.message || errorJson?.error || `Server responded with status ${response.status}: ${errorText.slice(0, 150)}`;
      throw new Error(message);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      isLive: true,
      endpointUsed: endpoint
    };
  } catch (err) {
    clearTimeout(timeoutId);

    // If local proxy failed, attempt direct remote fallback once
    if (!useDirectUrl && !customEndpoint) {
      try {
        console.warn(`Local proxy call failed (${err.message}), retrying directly against remote n8n orchestrator...`);
        return await executeAutonomousResearch({
          topic,
          country,
          language,
          engines,
          includeDocuments,
          maxSources,
          researchDepth,
          confidenceThreshold,
          documents,
          useDirectUrl: true
        });
      } catch (directErr) {
        console.error('Direct remote call also failed:', directErr);
      }
    }

    // If both failed, return structured error with option to view matching benchmark
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Autonomous research request timed out after 60 seconds.' : err.message,
      isLive: false,
      fallbackDossier: BENCHMARK_DOSSIERS[0]
    };
  }
}

export async function pingOrchestrator() {
  const endpoint = getOrchestratorEndpoint();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true, topic: 'healthcheck' })
    });
    return res.status < 500;
  } catch (_) {
    if (endpoint !== DIRECT_REMOTE_URL) {
      try {
        const directRes = await fetch(DIRECT_REMOTE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ping: true, topic: 'healthcheck' })
        });
        return directRes.status < 500;
      } catch (e) {
        return false;
      }
    }
  }
  return false;
}
