import {
  workflow,
  node,
  trigger,
  languageModel,
  newCredential,
  ifElse,
  expr,
  sticky
} from '@n8n/workflow-sdk';

/**
 * ============================================================================
 * ResearchPilot — Phase 1 Autonomous Agentic Research Intelligence Pipeline
 * ============================================================================
 * 
 * Powered by:
 * - AI Model: Ollama Chat Model (@n8n/n8n-nodes-langchain.lmChatOllama)
 * - Credential Placeholder: "Ollama account" (ollamaApi)
 * - Centralized Model Selection: Configurable via Context Builder or Webhook body
 * 
 * Pipeline Flow (Left to Right):
 * 1.  Research Request Webhook
 * 2.  Research Context Builder
 * 3.  Research Planner Agent (↳ Ollama Chat Model)
 * 4.  Research Input Processor
 * 5.  Paper / Document Analyzer Agent (↳ Ollama Chat Model)
 * 6.  Research Comparison Agent (↳ Ollama Chat Model)
 * 7.  Relationship Discovery Agent (↳ Ollama Chat Model)
 * 8.  Potential Gap Detection Agent (↳ Ollama Chat Model)
 * 9.  Research Direction Generator Agent (↳ Ollama Chat Model)
 * 10. Research Validation Agent (↳ Ollama Chat Model)
 * 11. Validation Gatekeeper (Branching with Bounded Loop)
 *     - VALID: Final Research Intelligence Builder -> Backend Response
 *     - INVALID: Correction & Reprocessing Agent (↳ Ollama) -> Loop Guard -> Validation Agent
 */

// ============================================================================
// 1. Webhook Entry (Research Request Entry)
// ============================================================================
const webhookEntry = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Research Request Webhook',
    position: [112, 304],
    parameters: {
      httpMethod: 'POST',
      path: 'research-workspace',
      responseMode: 'responseNode',
      options: {}
    }
  }
});

// ============================================================================
// 2. Research Context Builder
// ============================================================================
const contextBuilder = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Research Context Builder',
    position: [384, 304],
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'ctx_ws_id', name: 'workspaceId', value: expr('{{ $json.body?.workspaceId ?? $json.workspaceId ?? "ws_rp_default" }}'), type: 'string' },
          { id: 'ctx_title', name: 'researchTitle', value: expr('{{ $json.body?.researchTitle ?? $json.researchTitle ?? "Untitled Research Project" }}'), type: 'string' },
          { id: 'ctx_question', name: 'researchQuestion', value: expr('{{ $json.body?.researchQuestion ?? $json.researchQuestion ?? "" }}'), type: 'string' },
          { id: 'ctx_domain', name: 'researchDomain', value: expr('{{ $json.body?.researchDomain ?? $json.researchDomain ?? "Interdisciplinary" }}'), type: 'string' },
          { id: 'ctx_objective', name: 'researchObjective', value: expr('{{ $json.body?.researchObjective ?? $json.researchObjective ?? "" }}'), type: 'string' },
          { id: 'ctx_documents', name: 'documents', value: expr('{{ $json.body?.documents ?? $json.documents ?? [] }}'), type: 'array' },
          { id: 'ctx_pdfs', name: 'pdfs', value: expr('{{ $json.body?.pdfs ?? $json.pdfs ?? [] }}'), type: 'array' },
          { id: 'ctx_weblinks', name: 'webLinks', value: expr('{{ $json.body?.webLinks ?? $json.webLinks ?? [] }}'), type: 'array' },
          { id: 'ctx_ollama_model', name: 'ollamaModel', value: expr('{{ $json.body?.ollamaModel ?? "llama3.2" }}'), type: 'string' },
          { id: 'ctx_created_at', name: 'contextBuiltAt', value: expr('{{ $now.toISO() }}'), type: 'string' },
          { id: 'ctx_pipeline_status', name: 'pipelineStatus', value: 'INITIALIZED', type: 'string' },
          { id: 'ctx_loop_counter', name: 'validationAttempts', value: 0, type: 'number' }
        ]
      }
    }
  }
});

// ============================================================================
// 3. Research Planner Agent & Ollama Chat Model
// ============================================================================
const plannerOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Planner Ollama Chat Model',
    position: [672, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const plannerAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Research Planner Agent',
    position: [672, 304],
    parameters: {
      promptType: 'define',
      text: expr('Formulate a structured research plan for the following project:\n\nWorkspace ID: {{ $json.workspaceId }}\nTitle: {{ $json.researchTitle }}\nDomain: {{ $json.researchDomain }}\nCore Question: {{ $json.researchQuestion }}\nObjective: {{ $json.researchObjective }}\n\nAvailable Research Inputs:\n- Documents: {{ JSON.stringify($json.documents) }}\n- Academic Papers (PDFs): {{ JSON.stringify($json.pdfs) }}\n- Web Links: {{ JSON.stringify($json.webLinks) }}\n\nDetermine:\n1. What specific scientific and domain-specific areas need to be investigated\n2. Analytical decomposition of the central research question\n3. Required paper extraction and analysis criteria\n4. Comparative dimensions across methodologies and findings\n5. Step-by-step workflow execution milestones'),
      options: {
        systemMessage: 'You are the Research Planner Agent in ResearchPilot. Your role is to understand the research question, domain, objective, and available inputs, and strategically formulate a structured research plan. Determine what specific areas need to be investigated and what analysis should be performed. Output a structured plan detailing investigation areas, analytical methodologies, and workflow execution steps.'
      }
    },
    subnodes: {
      model: plannerOllamaModel
    }
  }
});

// ============================================================================
// 4. Research Input Processor
// ============================================================================
const inputProcessor = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Research Input Processor',
    position: [960, 304],
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: {
        assignments: [
          { id: 'inp_prep_status', name: 'materialsPreparationStatus', value: 'PREPARED_FOR_ANALYSIS', type: 'string' },
          { id: 'inp_total_inputs', name: 'totalMaterialsCount', value: expr('{{ ($("Research Context Builder").item.json.documents.length || 0) + ($("Research Context Builder").item.json.pdfs.length || 0) + ($("Research Context Builder").item.json.webLinks.length || 0) }}'), type: 'number' },
          { id: 'inp_planner_guidance', name: 'strategicPlan', value: expr('{{ $json.output }}'), type: 'string' },
          { id: 'inp_has_documents', name: 'hasDocuments', value: expr('{{ (($("Research Context Builder").item.json.documents.length || 0) + ($("Research Context Builder").item.json.pdfs.length || 0)) > 0 }}'), type: 'boolean' }
        ]
      }
    }
  }
});

// ============================================================================
// 5. Paper / Document Analyzer Agent & Ollama Chat Model
// ============================================================================
const analyzerOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Analyzer Ollama Chat Model',
    position: [1264, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const paperAnalyzerAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Paper Analyzer Agent',
    position: [1264, 304],
    parameters: {
      promptType: 'define',
      text: expr('Perform scientific analysis of all uploaded papers and documents for Research Question: "{{ $("Research Context Builder").item.json.researchQuestion }}".\n\nStrategic Research Plan:\n{{ $json.strategicPlan }}\n\nSupplied Documents & Papers:\n- Academic Papers (PDFs): {{ JSON.stringify($("Research Context Builder").item.json.pdfs) }}\n- Documents: {{ JSON.stringify($("Research Context Builder").item.json.documents) }}\n- Web Links: {{ JSON.stringify($("Research Context Builder").item.json.webLinks) }}\n- Has Source Documents: {{ $json.hasDocuments }}\n\nFor each provided document, extract:\n1. Research problem\n2. Methodology\n3. Dataset\n4. Results\n5. Key findings\n6. Limitations\n7. Important evidence\n\nIMPORTANT: If no documents or papers are provided in the input, explicitly output that no source documents are available. Do NOT hallucinate or generate fake papers.'),
      options: {
        systemMessage: 'You are the Paper and Document Analyzer Agent in ResearchPilot. Your responsibility is to analyze research papers and documents supplied by the workflow. For each document provided, extract: Research problem, Methodology, Dataset, Results, Key findings, Limitations, and Important evidence. CRITICAL: Do not generate or hallucinate fake paper information, authors, or citations when no document is available. If no papers or documents are provided in the input, explicitly state that no documents were supplied for analysis.'
      }
    },
    subnodes: {
      model: analyzerOllamaModel
    }
  }
});

// ============================================================================
// 6. Research Comparison Agent & Ollama Chat Model
// ============================================================================
const comparisonOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Comparison Ollama Chat Model',
    position: [1568, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const comparisonAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Research Comparison Agent',
    position: [1568, 304],
    parameters: {
      promptType: 'define',
      text: expr('Systematically compare and cross-evaluate the analyzed research works for Research Question: "{{ $("Research Context Builder").item.json.researchQuestion }}".\n\nAnalyzed Papers & Documents:\n{{ $json.output }}\n\nEvaluate and contrast:\n1. Methodologies: How do the proposed approaches differ or align?\n2. Datasets: What datasets and benchmarks were used, and what are their coverage and biases?\n3. Results: Compare quantitative and qualitative performance metrics.\n4. Findings: Identify agreements and discrepancies across findings.\n5. Limitations: Contrast shared limitations versus study-specific limitations.\n6. Similarities: Key converging principles across works.\n7. Differences: Divergent assumptions, trade-offs, and design choices.'),
      options: {
        systemMessage: 'You are the Research Comparison Agent in ResearchPilot. Your responsibility is to compare the analyzed research works. Systematically evaluate methodologies, datasets, results, findings, limitations, similarities, and differences across the analyzed studies. If insufficient papers were supplied, compare the planned methodologies and baseline approaches.'
      }
    },
    subnodes: {
      model: comparisonOllamaModel
    }
  }
});

// ============================================================================
// 7. Research Relationship Discovery Agent & Ollama Chat Model
// ============================================================================
const relationshipOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Relationship Ollama Chat Model',
    position: [1872, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const relationshipAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Relationship Discovery Agent',
    position: [1872, 304],
    parameters: {
      promptType: 'define',
      text: expr('Identify and map meaningful relationships across the research works, findings, and domain:\n\nResearch Domain: {{ $("Research Context Builder").item.json.researchDomain }}\nComparative Analysis:\n{{ $json.output }}\n\nMap out key relationships. For each identified relationship, specify:\n1. Source research work (or methodology/dataset)\n2. Relationship type (e.g. builds upon, contradicts, extends, evaluates on common benchmark, shares theoretical framework)\n3. Target research work (or methodology/dataset)\n4. Supporting evidence from the analyzed materials'),
      options: {
        systemMessage: 'You are the Research Relationship Discovery Agent in ResearchPilot. Your responsibility is to identify meaningful relationships between research works, findings, methodologies, datasets, and research areas. For each discovered relationship, clearly specify: (1) Source research work, (2) Relationship type (e.g., builds_on, contradicts, complements, benchmark_overlap, methodology_variant), (3) Target research work, and (4) Supporting evidence.'
      }
    },
    subnodes: {
      model: relationshipOllamaModel
    }
  }
});

// ============================================================================
// 8. Potential Research Gap Detection Agent & Ollama Chat Model
// ============================================================================
const gapOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Gap Ollama Chat Model',
    position: [2160, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const gapDetectionAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Potential Gap Detection Agent',
    position: [2160, 304],
    parameters: {
      promptType: 'define',
      text: expr('Reason over the synthesized research context and literature to detect potential research gaps:\n\nCentral Question: {{ $("Research Context Builder").item.json.researchQuestion }}\nObjective: {{ $("Research Context Builder").item.json.researchObjective }}\nIdentified Relationships & Comparison:\n{{ $json.output }}\n\nFormulate candidate research gaps using the terminology "potential research gap". Do NOT state that any gap is definitely valid.\nFor each potential research gap, provide:\n1. Potential gap: Clear description of the unaddressed challenge or boundary\n2. Reasoning: Scientific rationale explaining why this gap exists and remains unresolved\n3. Supporting evidence: Specific evidence from comparisons, contradictions, or paper limitations\n4. Related research works: Citations or references to the relevant works\n5. Confidence: Calibrated confidence level (0.0 to 1.0)'),
      options: {
        systemMessage: 'You are the Potential Research Gap Detection Agent in ResearchPilot. Your responsibility is to reason over the research context, analyzed papers, comparisons, and relationships to identify potential research gaps. Always use the terminology "potential research gap". Do not claim that a research gap is definitely valid. For each identified potential research gap, provide: (1) Potential gap, (2) Reasoning, (3) Supporting evidence, (4) Related research works, and (5) Confidence score (between 0.0 and 1.0).'
      }
    },
    subnodes: {
      model: gapOllamaModel
    }
  }
});

// ============================================================================
// 9. Research Direction Generator Agent & Ollama Chat Model
// ============================================================================
const directionOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Direction Ollama Chat Model',
    position: [2464, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const directionGeneratorAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Research Direction Generator Agent',
    position: [2464, 304],
    parameters: {
      promptType: 'define',
      text: expr('Generate actionable, high-impact research directions based on the discovered potential research gaps:\n\nResearch Title: {{ $("Research Context Builder").item.json.researchTitle }}\nObjective: {{ $("Research Context Builder").item.json.researchObjective }}\nPotential Research Gaps:\n{{ $json.output }}\n\nGenerate concrete research directions. For each direction, provide:\n1. Title: Concise, descriptive title of the proposed research direction\n2. Description: Detailed operational description of what to investigate and implement\n3. Reasoning: Scientific justification for why this direction is promising and how it addresses the potential gap\n4. Supporting evidence: Grounding evidence from previous analysis and relationships'),
      options: {
        systemMessage: 'You are the Research Direction Generator Agent in ResearchPilot. Your responsibility is to use the research context, findings, comparisons, relationships, and potential gaps to generate promising, actionable research directions. For each research direction, include: (1) Title, (2) Description, (3) Reasoning, and (4) Supporting evidence.'
      }
    },
    subnodes: {
      model: directionOllamaModel
    }
  }
});

// ============================================================================
// 10. Research Validation Agent & Ollama Chat Model
// ============================================================================
const validationOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Validation Ollama Chat Model',
    position: [2768, 528],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const validationAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Research Validation Agent',
    position: [2768, 304],
    parameters: {
      promptType: 'define',
      text: expr('Validate the generated research directions and overall research intelligence for empirical consistency:\n\nDirections Proposed:\n{{ $json.output }}\n\nOriginal Research Context:\n- Question: {{ $("Research Context Builder").item.json.researchQuestion }}\n- Validation Attempt: {{ $("Research Context Builder").item.json.validationAttempts }}\n\nVerify:\n1. Are the proposed directions and conclusions consistent with the available evidence?\n2. Have any unsupported claims, fabricated citations, or invalid assumptions been introduced?\n3. Are the potential gaps and directions logically coherent?\n\nReturn your assessment containing isValid (boolean), confidenceScore (number), reasoning (string), and deficiencies (array).'),
      options: {
        systemMessage: 'You are the Research Validation Agent in ResearchPilot. Your responsibility is to validate the generated research intelligence. Rigorously check whether the generated conclusions and research directions are consistent with the available evidence and whether unsupported claims or hallucinations have been introduced. Output a JSON object with: "isValid" (boolean), "confidenceScore" (number 0.0-1.0), "reasoning" (string), and "deficiencies" (array of strings, if any).'
      }
    },
    subnodes: {
      model: validationOllamaModel
    }
  }
});

// ============================================================================
// 11. Validation Gatekeeper (Branching with Bounded Loop)
// ============================================================================
const validationGate = ifElse({
  version: 2.3,
  config: {
    name: 'Validation Gatekeeper',
    position: [3072, 304],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [
          {
            leftValue: expr('{{ ($json.output && ($json.output.includes(\'"isValid":true\') || $json.output.includes(\'"isValid": true\'))) || (($("Research Context Builder").item.json.validationAttempts || 0) >= 1) }}'),
            operator: { type: 'boolean', operation: 'equals' },
            rightValue: true
          }
        ],
        combinator: 'or'
      }
    }
  }
});

// ============================================================================
// 12. Correction & Reprocessing Agent & Ollama Chat Model (Invalid Branch)
// ============================================================================
const correctionOllamaModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Correction Ollama Chat Model',
    position: [2768, 112],
    parameters: {
      model: expr('{{ $("Research Context Builder").item.json.ollamaModel || "llama3.2" }}')
    },
    credentials: {
      ollamaApi: newCredential('Ollama account')
    }
  }
});

const correctionAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Correction & Reprocessing Agent',
    position: [2768, -96],
    parameters: {
      promptType: 'define',
      text: expr('Refine and correct the generated research intelligence based on validation feedback:\n\nValidation Evaluation:\n{{ $json.output }}\n\nOriginal Context:\n- Question: {{ $("Research Context Builder").item.json.researchQuestion }}\n\nResolve identified deficiencies, eliminate unsupported claims, and re-ground the research directions.'),
      options: {
        systemMessage: 'You are the Correction & Reprocessing Agent in ResearchPilot. When the Research Validation Agent flags inconsistencies or unsupported claims, re-evaluate and correct the research directions. Ground all claims strictly in available evidence, remove speculative statements, and address identified deficiencies.'
      }
    },
    subnodes: {
      model: correctionOllamaModel
    }
  }
});

const loopGuard = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Reprocessing Loop Guard',
    position: [3072, -96],
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: {
        assignments: [
          { id: 'lg_counter', name: 'validationAttempts', value: expr('{{ (($("Research Context Builder").item.json.validationAttempts || 0) + 1) }}'), type: 'number' },
          { id: 'lg_reprocessed_flag', name: 'hasUndergoneReprocessing', value: true, type: 'boolean' }
        ]
      }
    }
  }
});

// ============================================================================
// 13. Final Research Intelligence Builder
// ============================================================================
const finalIntelligenceBuilder = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Final Research Intelligence Builder',
    position: [3392, 304],
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'fin_ws', name: 'workspace', value: expr('{{ { id: $("Research Context Builder").item.json.workspaceId, title: $("Research Context Builder").item.json.researchTitle, domain: $("Research Context Builder").item.json.researchDomain, objective: $("Research Context Builder").item.json.researchObjective, documentsCount: $("Research Context Builder").item.json.documents.length, pdfsCount: $("Research Context Builder").item.json.pdfs.length, webLinksCount: $("Research Context Builder").item.json.webLinks.length } }}'), type: 'object' },
          { id: 'fin_q', name: 'researchQuestion', value: expr('{{ $("Research Context Builder").item.json.researchQuestion }}'), type: 'string' },
          { id: 'fin_plan', name: 'researchPlan', value: expr('{{ $("Research Planner Agent").item.json.output }}'), type: 'string' },
          { id: 'fin_analyses', name: 'paperAnalyses', value: expr('{{ $("Paper Analyzer Agent").item.json.output }}'), type: 'string' },
          { id: 'fin_comparisons', name: 'researchComparisons', value: expr('{{ $("Research Comparison Agent").item.json.output }}'), type: 'string' },
          { id: 'fin_relationships', name: 'researchRelationships', value: expr('{{ $("Relationship Discovery Agent").item.json.output }}'), type: 'string' },
          { id: 'fin_gaps', name: 'potentialResearchGaps', value: expr('{{ $("Potential Gap Detection Agent").item.json.output }}'), type: 'string' },
          { id: 'fin_directions', name: 'researchDirections', value: expr('{{ $("Research Direction Generator Agent").item.json.output }}'), type: 'string' },
          { id: 'fin_val_status', name: 'validationStatus', value: expr('{{ $json.output ?? "VALIDATED" }}'), type: 'string' },
          { id: 'fin_timestamp', name: 'completedAt', value: expr('{{ $now.toISO() }}'), type: 'string' },
          { id: 'fin_pipeline', name: 'pipelineExecutionStatus', value: 'SUCCESS_AGENTIC_WORKFLOW_COMPLETE', type: 'string' }
        ]
      }
    }
  }
});

// ============================================================================
// 14. Backend Response
// ============================================================================
const backendResponse = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Backend Response',
    position: [3696, 304],
    parameters: {
      respondWith: 'firstIncomingItem',
      options: {
        responseCode: 200
      }
    }
  }
});

// ============================================================================
// Canvas Sticky Notes
// ============================================================================
const noteIngestion = sticky(
  '### Phase 1: Ingestion & Planning\nReceives workspace information via Webhook, constructs unified research context, and formulates strategic investigation plan with Ollama.',
  [webhookEntry, contextBuilder, plannerAgent, inputProcessor],
  { color: 6, width: 950, height: 420 }
);

const noteDeepAnalysis = sticky(
  '### Phase 2: Autonomous Intelligence Engine (Ollama)\nIndividual paper extraction, multi-dimensional comparative matrix, relationship mapping, and potential research gap detection powered by Ollama Chat Model.',
  [paperAnalyzerAgent, comparisonAgent, relationshipAgent, gapDetectionAgent, directionGeneratorAgent],
  { color: 4, width: 1350, height: 420 }
);

const noteValidationDelivery = sticky(
  '### Phase 3: Scientist-in-the-Loop Validation & Delivery\nChecks empirical grounding, reroutes through bounded correction if invalid (max 1 retry), synthesizes final intelligence dossier, and returns to backend.',
  [validationAgent, validationGate, correctionAgent, loopGuard, finalIntelligenceBuilder, backendResponse],
  { color: 7, width: 1050, height: 600 }
);

// ============================================================================
// Workflow Composition & Graph Wiring
// ============================================================================
export default workflow('researchpilot-phase1-agentic-workflow', 'ResearchPilot - Autonomous Research Intelligence Workflow')
  .add(webhookEntry)
  .to(contextBuilder)
  .to(plannerAgent)
  .to(inputProcessor)
  .to(paperAnalyzerAgent)
  .to(comparisonAgent)
  .to(relationshipAgent)
  .to(gapDetectionAgent)
  .to(directionGeneratorAgent)
  .to(validationAgent)
  .to(validationGate
    .onTrue(finalIntelligenceBuilder.to(backendResponse))
    .onFalse(correctionAgent.to(loopGuard).to(validationAgent))
  )
  .add(noteIngestion)
  .add(noteDeepAnalysis)
  .add(noteValidationDelivery);
