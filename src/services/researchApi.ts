/**
 * ResearchPilot — Direct Ollama Agentic Pipeline Service
 * 
 * Direct in-app Ollama multi-agent orchestration service.
 * Securely handles request execution, sequential agent reasoning, and response synthesis
 * without hardcoding credentials or returning fake results.
 */

import { runOllamaResearchPipeline, AgentPipelineProgressCallback } from './ollamaAgentService';

export interface ResearchWebhookDocument {
  id: string;
  name: string;
  file?: File;
}

export interface ResearchWebhookLink {
  url: string;
  label: string;
}

export interface ResearchWebhookRequest {
  workspaceId: string;
  researchTitle: string;
  researchQuestion: string;
  researchDomain: string;
  researchObjective: string;
  documents: ResearchWebhookDocument[];
  pdfs: ResearchWebhookDocument[];
  webLinks: ResearchWebhookLink[];
  ollamaModel?: string;
}

export interface ResearchIntelligence {
  workspace?: {
    id: string;
    title: string;
    domain: string;
    objective: string;
    documentsCount?: number;
    pdfsCount?: number;
    webLinksCount?: number;
  };
  researchQuestion?: string;
  researchPlan?: string;
  paperAnalyses?: string;
  researchComparisons?: string;
  researchRelationships?: string;
  potentialResearchGaps?: string;
  researchDirections?: string;
  validationStatus?: string;
  completedAt?: string;
  pipelineExecutionStatus?: string;
  notionPageUrl?: string;
  rawResponse?: any;
}

export interface WebhookExecutionResult {
  success: boolean;
  data: ResearchIntelligence | null;
  isAsyncProcessing: boolean;
  error?: string;
}

/**
 * Detects whether the app is running in a local browser environment (localhost / 127.0.0.1)
 */
export function isLocalHost(): boolean {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  }
  return false;
}

const N8N_PIPELINE_STEPS = [
  'Triggering n8n Autonomous Workflow Engine...',
  'n8n Stage 1: Formulating Strategic Research Plan...',
  'n8n Stage 2: Extracting Key Paper Methodologies...',
  'n8n Stage 3: Constructing Multi-Dimensional Comparative Matrix...',
  'n8n Stage 4: Uncovering Theoretical Relationships...',
  'n8n Stage 5: Detecting Critical Research Gaps...',
  'n8n Stage 6: Generating Actionable Research Directions...',
  'n8n Stage 7: Validating Empirical Grounding & Consistency...',
  'n8n Stage 8: Synthesizing Final Research Intelligence Dossier...'
];

/**
 * Executes the research pipeline via local n8n agentic workflow
 */
async function executeN8nPipeline(
  payload: ResearchWebhookRequest,
  onProgress?: AgentPipelineProgressCallback
): Promise<ResearchIntelligence> {
  console.log('[ResearchPilot] Running on Localhost -> Routing pipeline to local n8n workflow (http://localhost:5678)...');
  onProgress?.(0, N8N_PIPELINE_STEPS[0]);

  let currentStep = 0;
  const progressTimer = setInterval(() => {
    currentStep = Math.min(currentStep + 1, N8N_PIPELINE_STEPS.length - 1);
    onProgress?.(currentStep, N8N_PIPELINE_STEPS[currentStep]);
  }, 3500);

  try {
    const response = await fetch('/webhook/research-workspace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workspaceId: payload.workspaceId,
        researchTitle: payload.researchTitle,
        researchQuestion: payload.researchQuestion,
        researchDomain: payload.researchDomain,
        researchObjective: payload.researchObjective,
        documents: payload.documents,
        pdfs: payload.pdfs,
        webLinks: payload.webLinks,
        ollamaModel: payload.ollamaModel || 'gemma4:31b'
      })
    });

    clearInterval(progressTimer);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n webhook error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[ResearchPilot] n8n workflow response received successfully:', data);
    return data;
  } catch (err) {
    clearInterval(progressTimer);
    throw err;
  }
}

/**
 * Executes the multi-agent pipeline for a research workspace payload:
 * - On Localhost: routes to local n8n agentic workflow (http://localhost:5678)
 * - On Firebase: runs native cloud API pipeline without n8n
 */
export async function executeResearchWorkspacePipeline(
  payload: ResearchWebhookRequest,
  onProgress?: AgentPipelineProgressCallback
): Promise<WebhookExecutionResult> {
  // Validate required fields before transmission
  if (!payload.researchTitle?.trim()) {
    return {
      success: false,
      data: null,
      isAsyncProcessing: false,
      error: 'Research Title is required.'
    };
  }

  if (!payload.researchQuestion?.trim()) {
    return {
      success: false,
      data: null,
      isAsyncProcessing: false,
      error: 'Research Question / Prompt is required.'
    };
  }

  try {
    let intelligence: ResearchIntelligence;

    if (isLocalHost()) {
      console.log('[ResearchPilot] 🏠 Localhost environment detected -> Executing via n8n Agentic Workflow');
      try {
        intelligence = await executeN8nPipeline(payload, onProgress);
      } catch (n8nErr: any) {
        console.warn('[ResearchPilot] n8n unavailable, using direct in-app engine fallback:', n8nErr?.message);
        intelligence = await runOllamaResearchPipeline(
          {
            id: payload.workspaceId,
            title: payload.researchTitle,
            question: payload.researchQuestion,
            domain: payload.researchDomain,
            objective: payload.researchObjective,
            documents: payload.documents,
            links: payload.webLinks,
          },
          onProgress
        );
      }
    } else {
      console.log('[ResearchPilot] ☁️ Firebase Cloud environment detected -> Executing via Direct Cloud API Engine');
      intelligence = await runOllamaResearchPipeline(
        {
          id: payload.workspaceId,
          title: payload.researchTitle,
          question: payload.researchQuestion,
          domain: payload.researchDomain,
          objective: payload.researchObjective,
          documents: payload.documents,
          links: payload.webLinks,
        },
        onProgress
      );
    }

    return {
      success: true,
      data: intelligence,
      isAsyncProcessing: false
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      isAsyncProcessing: false,
      error: err?.message || 'Failed to execute research pipeline.'
    };
  }
}

export type ResearchAnalysisResult = ResearchIntelligence;

/**
 * Main execution function used by workspace pages to run the research analysis
 */
export async function executeResearchAnalysis(
  workspace: {
    id: string;
    title: string;
    question: string;
    domain: string;
    objective: string;
    documents?: { id: string; name: string; file?: File }[];
    links?: { url: string; label: string }[];
  },
  onProgress?: AgentPipelineProgressCallback
): Promise<ResearchIntelligence | null> {
  const result = await executeResearchWorkspacePipeline(
    {
      workspaceId: workspace.id,
      researchTitle: workspace.title,
      researchQuestion: workspace.question,
      researchDomain: workspace.domain,
      researchObjective: workspace.objective,
      documents: (workspace.documents || []).map((d) => ({ id: d.id, name: d.name, file: d.file })),
      pdfs: (workspace.documents || [])
        .filter((d) => d.name.toLowerCase().endsWith('.pdf'))
        .map((d) => ({ id: d.id, name: d.name, file: d.file })),
      webLinks: (workspace.links || []).map((l) => ({ url: l.url, label: l.label })),
    },
    onProgress
  );

  if (!result.success || !result.data) {
    if (result.error) {
      throw new Error(result.error);
    }
    return null;
  }
  return result.data;
}


