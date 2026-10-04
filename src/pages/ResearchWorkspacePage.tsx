import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { IntelligenceNetworkScene } from '../3d/IntelligenceNetworkScene';
import { FullpageFloatingSimulation } from '../3d/FullpageFloatingSimulation';
import { NeatOutputRenderer } from '../components/NeatOutputRenderer';
import { WorkspaceHistoryDrawer } from '../components/WorkspaceHistoryDrawer';
import { ResearchChatbotWidget } from '../components/ResearchChatbotWidget';
import { executeResearchAnalysis, isLocalHost } from '../services/researchApi';
import { 
  ArrowLeft, 
  FileText, 
  Link2, 
  MessageSquare, 
  BookOpen, 
  Brain, 
  GitCompare, 
  AlertTriangle, 
  Compass, 
  Map, 
  CheckSquare,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
  LogOut,
  Layers,
  ChevronRight,
  Database,
  Bot
} from 'lucide-react';

interface ResearchWorkspacePageProps {
  onNavigateToCreateWorkspace: () => void;
  onNavigateToLanding: () => void;
  onLogout?: () => void;
}

const PIPELINE_STEPS = [
  'Formulating Strategic Research Plan...',
  'Extracting Key Paper Methodologies & Findings...',
  'Constructing Multi-Dimensional Comparative Matrix...',
  'Uncovering Theoretical Relationships & Affinities...',
  'Detecting Critical Research Gaps with Calibrated Confidence...',
  'Synthesizing Actionable Research Directions...',
  'Validating Empirical Grounding with Ollama Validation Agent...',
  'Synthesizing Final Research Intelligence Dossier...'
];

export const ResearchWorkspacePage: React.FC<ResearchWorkspacePageProps> = ({
  onNavigateToCreateWorkspace,
  onNavigateToLanding: _onNavigateToLanding,
  onLogout
}) => {
  const { 
    workspace, 
    setIntelligence, 
    setAnalysisStatus,
    savedWorkspaces,
    loadSavedWorkspace,
    isCloudSyncing
  } = useWorkspace();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState(PIPELINE_STEPS[0]);
  const [activeDossierTab, setActiveDossierTab] = useState<number>(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{
    id: number;
    title: string;
    content: any;
  } | null>(null);

  const intel = workspace?.intelligence;
  const isExecutingRef = useRef(false);

  const handleAnalyzeClick = async () => {
    if (!workspace) {
      console.warn('[ResearchPilot] Cannot analyze: workspace is null');
      return;
    }
    if (isExecutingRef.current) {
      console.log('[ResearchPilot] Already executing pipeline, ignoring request');
      return;
    }

    console.log('[ResearchPilot] Starting pipeline execution for:', workspace.id, workspace.title);
    isExecutingRef.current = true;
    setIsAnalyzing(true);
    setCurrentStep(0);
    setCurrentStepLabel(PIPELINE_STEPS[0]);
    setAnalysisStatus('processing');

    try {
      const result = await executeResearchAnalysis(workspace, (stageIdx, stageName) => {
        console.log(`[ResearchPilot] UI Progress: Stage ${stageIdx + 1}/8 - ${stageName}`);
        setCurrentStep(stageIdx);
        setCurrentStepLabel(stageName);
      });

      if (result) {
        console.log('[ResearchPilot] Pipeline completed successfully!');
        setIntelligence(result);
        setAnalysisStatus('completed');
      } else {
        console.error('[ResearchPilot] Pipeline returned null result');
        setAnalysisStatus('error', 'Pipeline returned empty result. Please click Retry.');
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to complete research analysis.';
      console.error('[ResearchPilot] Analysis error:', errorMsg, err);
      setAnalysisStatus('error', errorMsg);
    } finally {
      isExecutingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const autoStartedWorkspaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!workspace) return;

    // Auto-start only when workspace status is 'processing', no intelligence yet,
    // and we haven't already launched for this specific workspace ID
    if (
      workspace.analysisStatus === 'processing' &&
      !workspace.intelligence &&
      !isExecutingRef.current &&
      autoStartedWorkspaceIdRef.current !== workspace.id
    ) {
      autoStartedWorkspaceIdRef.current = workspace.id;
      console.log('[ResearchPilot] Auto-triggering pipeline for workspace:', workspace.id);
      handleAnalyzeClick();
    }
  }, [workspace?.id, workspace?.analysisStatus, workspace?.intelligence]);


  const getSectionContent = (id: number) => {
    if (!intel) return null;
    switch (id) {
      case 1:
        return {
          snippet: intel.researchQuestion || workspace?.question || 'Hypothesis formulated',
          full: intel.researchQuestion || workspace?.question || 'No research question provided.'
        };
      case 2:
        return {
          snippet: intel.paperAnalyses ? 'Paper analysis completed' : `${workspace?.documents?.length || 0} document(s) in corpus`,
          full: intel.paperAnalyses || (workspace?.documents?.length ? `### Corpus Documents Analyzed\n\n${workspace.documents.map((d: any) => `- **${d.name}** (Uploaded into active corpus)`).join('\n')}` : 'No documents analyzed.')
        };
      case 3:
        return {
          snippet: intel.paperAnalyses ? 'Empirical extraction complete' : 'Awaiting analysis',
          full: intel.paperAnalyses || 'Multi-paper decomposition not yet available.'
        };
      case 4:
        return {
          snippet: intel.researchComparisons ? 'Comparative matrix generated' : 'Awaiting comparison',
          full: intel.researchComparisons || 'Comparative matrix not yet available.'
        };
      case 5:
        return {
          snippet: intel.potentialResearchGaps ? 'Research gaps detected' : 'Awaiting gap detection',
          full: intel.potentialResearchGaps || 'Research gaps not yet available.'
        };
      case 6:
        return {
          snippet: intel.researchDirections ? 'Actionable directions synthesized' : 'Awaiting directions',
          full: intel.researchDirections || 'Research directions not yet available.'
        };
      case 7:
        return {
          snippet: intel.researchPlan ? 'Strategic plan ready' : 'Awaiting plan',
          full: intel.researchPlan || 'Strategic plan not yet available.'
        };
      case 8: {
        let valContent: any = intel.validationStatus;
        try {
          if (typeof valContent === 'string' && (valContent.trim().startsWith('{') || valContent.trim().startsWith('['))) {
            valContent = JSON.parse(valContent);
          }
        } catch {}

        const isEmpiricallyValid = typeof valContent === 'object' && valContent !== null 
          ? valContent.isValid !== false 
          : Boolean(intel.validationStatus && !intel.validationStatus.toLowerCase().includes('fail'));

        return {
          snippet: intel.validationStatus ? (isEmpiricallyValid ? 'Empirically Validated' : 'Validation Complete') : 'Validation pending',
          full: valContent || {
            validationStatus: intel.validationStatus || 'VALIDATED',
            pipelineExecutionStatus: intel.pipelineExecutionStatus || 'COMPLETED',
            completedAt: intel.completedAt || new Date().toISOString()
          }
        };
      }
      default:
        return null;
    }
  };

  const sections = [
    { id: 1, title: 'Research Question', icon: <MessageSquare size={24} />, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { id: 2, title: 'Academic Papers', icon: <BookOpen size={24} />, color: 'text-blue-400', border: 'border-blue-500/30' },
    { id: 3, title: 'AI Analysis', icon: <Brain size={24} />, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { id: 4, title: 'Paper Comparison', icon: <GitCompare size={24} />, color: 'text-amber-400', border: 'border-amber-500/30' },
    { id: 5, title: 'Research Gaps', icon: <AlertTriangle size={24} />, color: 'text-rose-400', border: 'border-rose-500/30' },
    { id: 6, title: 'Research Directions', icon: <Compass size={24} />, color: 'text-purple-400', border: 'border-purple-500/30' },
    { id: 7, title: 'Research Plan', icon: <Map size={24} />, color: 'text-teal-400', border: 'border-teal-500/30' },
    { id: 8, title: 'Research Tasks', icon: <CheckSquare size={24} />, color: 'text-orange-400', border: 'border-orange-500/30' },
  ];

  return (
    <div className="min-h-screen bg-[#060B17] text-slate-200 font-sans relative overflow-x-hidden">
      
      {/* 3D Simulation Fullpage Background */}
      <FullpageFloatingSimulation intensity={1.1} />

      {/* Floating Ambient Glowing Light Blobs (CSS levitation effect) */}
      <div className="fixed top-12 left-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-float -z-10" />
      <div 
        className="fixed bottom-24 right-10 w-[420px] h-[420px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-float -z-10" 
        style={{ animationDelay: '3s' }} 
      />
      <div 
        className="fixed top-1/2 left-1/3 w-80 h-80 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-float -z-10" 
        style={{ animationDelay: '1.5s' }} 
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/75 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateToCreateWorkspace}
            className="p-2 hover:bg-white/5 rounded-full transition-colors flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          
          <h1 className="font-serif text-xl text-white tracking-tight">
            {workspace?.title || 'Untitled Workspace'}
          </h1>
          
          {workspace?.domain && (
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-cyan-400 shadow-sm">
              {workspace.domain}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Sync Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] text-slate-300">
            {isCloudSyncing ? (
              <>
                <Loader2 size={12} className="animate-spin text-cyan-400" />
                <span className="text-cyan-300">Syncing...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                <span className="text-slate-300">Cloud Synced</span>
              </>
            )}
          </div>

          {/* Workspaces Drawer Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-xl text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
            title="View saved workspaces"
          >
            <Database size={14} className="text-cyan-400" />
            <span className="hidden md:inline">Workspaces</span>
            {savedWorkspaces.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                {savedWorkspaces.length}
              </span>
            )}
          </button>

          {/* AI Chatbot Header Button */}
          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            title="Chat with Ollama AI Assistant"
          >
            <Bot size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">AI Chatbot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {intel && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-400 font-medium shadow-[0_0_12px_rgba(6,182,212,0.2)] animate-pulse-slow">
              <Sparkles size={14} />
              <span>AI Synthesized</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400">
              {intel ? 'Validated' : isAnalyzing ? 'Analyzing...' : 'Pipeline Active'}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors ml-2"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* 3D Hero Section */}
      <section className="relative w-full h-[350px] border-b border-white/10">
        <IntelligenceNetworkScene />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060B17]/40 to-[#060B17] pointer-events-none"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 pb-10 z-10 pointer-events-none">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs tracking-widest uppercase mb-3 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-float">
              <Brain size={14} />
              {isLocalHost() ? 'n8n Autonomous Workflow Engine (Active)' : 'Autonomous Research Intelligence Engine'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white mb-2 tracking-tight drop-shadow-xl font-medium">
              Research Intelligence Hub
            </h2>
            <p className="text-slate-300 text-base sm:text-lg drop-shadow-md">
              {isLocalHost()
                ? 'Connected to local n8n multi-agent research workflow (http://localhost:5678)'
                : 'Connected live to 8-Agent Autonomous Research Pipeline & Knowledge Base'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative z-20 -mt-6 space-y-8">
        
        {/* Error Banner */}
        {workspace?.analysisStatus === 'error' && (
          <div className="bg-rose-950/80 backdrop-blur-xl border border-rose-500/50 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 className="text-white font-medium text-base">
                  Pipeline Execution Error
                </h4>
                <p className="text-sm text-rose-300">
                  {workspace.analysisError || 'The research pipeline encountered an error. Please check your internet connection and try again.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-medium rounded-xl text-sm transition-all shadow-lg shrink-0"
            >
              <span>Retry Pipeline</span>
            </button>
          </div>
        )}

        {/* Notion / Synthesized Dossier Ready Banner */}
        {intel && (
          <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="text-white font-medium text-base">
                  Research Intelligence Dossier Synthesized!
                </h4>
                <p className="text-sm text-slate-300">
                  Formatted in clean human-readable dossier typography with 3D simulation depth.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95"
              >
                <Bot size={16} />
                <span>Chat with Copilot</span>
              </button>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Dossier Ready</span>
              </div>
            </div>
          </div>
        )}

        {!workspace ? (
          <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-xl">
            <p className="text-slate-400 mb-4">No workspace created.</p>
            <button 
              onClick={onNavigateToCreateWorkspace}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Create one now
            </button>
          </div>
        ) : (
          <>
            {/* Top Grid: Info & Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Research Info Panel */}
              <div className="bg-[#0f172a]/65 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 font-serif">
                  <Compass size={20} className="text-cyan-400" />
                  Research Context
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Title</span>
                    <p className="text-slate-100 font-medium text-base">{workspace.title}</p>
                  </div>
                  {workspace.question && (
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Core Hypothesis / Question</span>
                      <p className="text-slate-200 leading-relaxed">{workspace.question}</p>
                    </div>
                  )}
                  {workspace.objective && (
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Objective</span>
                      <p className="text-slate-200 leading-relaxed">{workspace.objective}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Research Inputs */}
              <div className="bg-[#0f172a]/65 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 transition-all duration-300 hover:-translate-y-1">
                
                {/* Documents */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <FileText size={16} className="text-emerald-400" />
                      Corpus Documents
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 lowercase">
                      {workspace.documents?.length || 0}/50 max
                    </span>
                  </h3>
                  {workspace.documents && workspace.documents.length > 0 ? (
                    <ul className="space-y-2">
                      {workspace.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm bg-white/5 p-2.5 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors">
                          <FileText size={14} className="text-emerald-400 shrink-0" />
                          <span className="truncate text-slate-200">{doc.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No documents uploaded</p>
                  )}
                </div>

                <div className="w-px bg-white/10 hidden md:block"></div>

                {/* Links */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                    <Link2 size={16} className="text-cyan-400" />
                    Web Sources
                  </h3>
                  {workspace.links && workspace.links.length > 0 ? (
                    <ul className="space-y-2">
                      {workspace.links.map((link, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm bg-white/5 p-2.5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                          <Link2 size={14} className="text-cyan-400 shrink-0" />
                          <a href={link.url} target="_blank" rel="noreferrer" className="truncate hover:text-cyan-400 transition-colors text-slate-200">
                            {link.label || link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No links added</p>
                  )}
                </div>

              </div>
            </div>

            {/* Live Progress Simulation during analysis */}
            {isAnalyzing && (
              <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Loader2 size={24} className="text-cyan-400 animate-spin" />
                    <div>
                      <h4 className="text-white font-medium">
                        Executing Research Intelligence Pipeline (Stage {Math.min(currentStep + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length})
                      </h4>
                      <p className="text-sm text-cyan-300 font-mono">
                        {currentStepLabel || PIPELINE_STEPS[currentStep] || 'Processing research reasoning...'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.round((Math.min(currentStep + 1, PIPELINE_STEPS.length) / PIPELINE_STEPS.length) * 100)}%
                  </span>
                </div>

                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    style={{ width: `${(Math.min(currentStep + 1, PIPELINE_STEPS.length) / PIPELINE_STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className={`w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-3 group text-base hover:scale-[1.008] active:scale-[0.99] ${
                isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Executing 8-Agent Research Pipeline...</span>
                </>
              ) : (
                <>
                  <Brain size={20} className="group-hover:animate-pulse text-cyan-300" />
                  <span>{intel ? 'Re-Analyze Research Pipeline' : 'Analyze Research with Autonomous AI Agents'}</span>
                </>
              )}
            </button>

            {/* Floating Intelligence Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers size={16} className="text-cyan-400" />
                  Multi-Agent Intelligence Network
                </h3>
                <span className="text-xs text-slate-400">Click any card to inspect structured findings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.map((section) => {
                  const sectionData = getSectionContent(section.id);
                  return (
                    <div 
                      key={section.id} 
                      onClick={() => {
                        if (sectionData) {
                          setSelectedSection({
                            id: section.id,
                            title: section.title,
                            content: sectionData.full
                          });
                        }
                      }}
                      className={`bg-[#0f172a]/60 backdrop-blur-xl border ${section.border} rounded-xl p-5 hover:bg-[#0f172a]/85 transition-all duration-300 cursor-pointer group hover:border-cyan-500/60 shadow-lg hover:shadow-[0_12px_30px_rgba(6,182,212,0.2)] flex flex-col justify-between hover:-translate-y-1.5 transform-gpu`}
                    >
                      <div>
                        <div className={`${section.color} mb-3 p-2 bg-white/5 rounded-lg inline-block group-hover:scale-110 transition-transform shadow-inner`}>
                          {section.icon}
                        </div>
                        <h4 className="text-white font-medium mb-1.5 flex items-center justify-between font-serif">
                          <span>{section.title}</span>
                          {sectionData && <CheckCircle2 size={14} className="text-emerald-400" />}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {sectionData ? sectionData.snippet : 'Awaiting analysis'}
                        </p>
                      </div>

                      {sectionData && (
                        <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            View neat report
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Synthesized Research Dossier (Tabbed View) */}
            {intel && (
              <section className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-1">
                      <Sparkles size={14} className="animate-pulse" />
                      Structured Research Dossier
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif text-white font-medium tracking-tight">
                      Comprehensive Synthesized Findings
                    </h3>
                  </div>

                  <span className="text-xs text-slate-400 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    Clean Text Format (No JSON)
                  </span>
                </div>

                {/* Dossier Section Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
                  {sections.map((section, idx) => {
                    const data = getSectionContent(section.id);
                    if (!data) return null;
                    const isActive = activeDossierTab === idx;

                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveDossierTab(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {section.title}
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Neat Text Content */}
                <div className="p-2 sm:p-4 bg-[#060B17]/60 rounded-xl border border-white/10 shadow-inner">
                  {(() => {
                    const currentSec = sections[activeDossierTab];
                    const contentData = getSectionContent(currentSec?.id || 1);
                    if (!contentData) return null;

                    return (
                      <NeatOutputRenderer
                        content={contentData.full}
                        title={currentSec.title}
                      />
                    );
                  })()}
                </div>
              </section>
            )}

          </>
        )}
      </main>

      {/* Intelligence Findings Modal (Rendered with NeatOutputRenderer) */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b1324]/95 border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.2)] overflow-hidden animate-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shadow-sm">
                  <Brain size={22} />
                </div>
                <div>
                  <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider block">
                    Research Dossier
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif text-white font-medium">
                    {selectedSection.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <NeatOutputRenderer
                content={selectedSection.content}
                title={selectedSection.title}
              />
            </div>

            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Synthesized by Autonomous Research Intelligence Pipeline
              </span>
              <button
                onClick={() => setSelectedSection(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors font-medium shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace History Drawer */}
      <WorkspaceHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectWorkspace={(id) => {
          loadSavedWorkspace(id);
        }}
        onCreateNew={() => {
          onNavigateToCreateWorkspace();
        }}
      />

      {/* Interactive Ollama AI Research Chatbot Widget */}
      <ResearchChatbotWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        workspaceContext={{
          title: workspace?.title,
          question: workspace?.question,
          domain: workspace?.domain,
          objective: workspace?.objective,
          documentsCount: workspace?.documents?.length,
          intelligence: workspace?.intelligence ? {
            researchPlan: workspace.intelligence.researchPlan,
            paperAnalyses: workspace.intelligence.paperAnalyses,
            potentialResearchGaps: workspace.intelligence.potentialResearchGaps,
            researchDirections: workspace.intelligence.researchDirections,
          } : null
        }}
      />

    </div>
  );
};
