import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchPanel from './components/SearchPanel';
import PipelineStepper from './components/PipelineStepper';
import ReportView from './components/ReportView';
import SourcesDrawer from './components/SourcesDrawer';
import WorkspaceView, { saveDossierToWorkspace } from './components/WorkspaceView';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import { executeAutonomousResearch, pingOrchestrator } from './utils/api';
import { BENCHMARK_DOSSIERS, PRESET_DOCUMENTS } from './utils/benchmarkData';
import { subscribeAuth, logoutUser, getStoredUser } from './utils/firebase';
import ThreeBackground from './components/ThreeBackground';
import WelcomeDashboard from './components/WelcomeDashboard';
import MiniChatbot from './components/MiniChatbot';
import { FileText, Database, GitMerge, Folder, CheckCircle, AlertCircle, Bookmark, Compass } from 'lucide-react';

export default function App() {
  // Search parameters
  const [topic, setTopic] = useState('Public Health Dengue Surveillance & Outbreak Early Warning in India');
  const [country, setCountry] = useState('in');
  const [engines, setEngines] = useState(['google', 'google_scholar', 'google_news', 'google_patents']);
  const [researchDepth, setResearchDepth] = useState('deep');
  const [maxSources, setMaxSources] = useState(20);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [documents, setDocuments] = useState([
    { title: PRESET_DOCUMENTS[0].title, content: PRESET_DOCUMENTS[0].content, fileSize: '1.2 KB' },
    { title: PRESET_DOCUMENTS[1].title, content: PRESET_DOCUMENTS[1].content, fileSize: '1.5 KB' }
  ]);

  // Orchestrator State
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(BENCHMARK_DOSSIERS[0]);
  const [highlightedSourceId, setHighlightedSourceId] = useState(null);
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'sources' | 'workspace' | 'architecture'
  const [toastMessage, setToastMessage] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Subscribe to Auth and Ping backend on mount
  useEffect(() => {
    async function checkBackend() {
      const live = await pingOrchestrator();
      setIsLiveConnected(live);
    }
    checkBackend();

    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset) => {
    setTopic(preset.topic);
    setCountry(preset.country);
    setResearchDepth(preset.depth);
    if (preset.hasDocs) {
      setIncludeDocuments(true);
      setDocuments([
        { title: PRESET_DOCUMENTS[0].title, content: PRESET_DOCUMENTS[0].content, fileSize: '1.2 KB' },
        { title: PRESET_DOCUMENTS[1].title, content: PRESET_DOCUMENTS[1].content, fileSize: '1.5 KB' }
      ]);
    } else {
      setIncludeDocuments(false);
      setDocuments([]);
    }

    const matchingDossier = BENCHMARK_DOSSIERS.find(d =>
      d.topic.toLowerCase().includes(preset.label.toLowerCase()) ||
      preset.topic.toLowerCase().includes(d.topic.toLowerCase())
    );
    if (matchingDossier) {
      setReportData(matchingDossier);
      setActiveTab('report');
      showToast(`Loaded example report for "${preset.label}". Click Search to find live results!`, 'info');
    }
  };

  // Launch Autonomous Inquiry Handler
  const handleLaunchResearch = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setHighlightedSourceId(null);
    showToast('Searching Google, papers, news, and checking facts...', 'info');

    try {
      const result = await executeAutonomousResearch({
        topic,
        country,
        engines,
        researchDepth,
        maxSources,
        confidenceThreshold,
        includeDocuments,
        documents
      });

      if (result.success && result.data) {
        let normalized = result.data;
        if (Array.isArray(normalized)) {
          normalized = normalized[0]?.json || normalized[0];
        } else if (normalized?.json) {
          normalized = normalized.json;
        }

        setReportData(normalized);
        setActiveTab('report');

        // Automatically store into workspace history
        saveDossierToWorkspace(normalized, 'Live Research');
        showToast('Search complete! Report saved to My Saved Searches.', 'success');
      } else {
        showToast(`Notice: ${result.error || 'Loaded backup results'}`, 'warning');
        if (result.fallbackDossier) {
          setReportData(result.fallbackDossier);
        }
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Citation click handler: jump or highlight in sources
  const handleSelectSource = (sourceId) => {
    setHighlightedSourceId(sourceId);
    setActiveTab('sources');
    showToast(`Viewing Source [${sourceId}] in sources list`, 'info');
  };

  // Load a dossier from the workspace
  const handleLoadWorkspaceDossier = (dossier) => {
    setReportData(dossier);
    setTopic(dossier.topic);
    if (dossier.country) setCountry(dossier.country);
    setActiveTab('report');
    showToast(`Loaded "${dossier.topic.slice(0, 32)}..." from saved searches.`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* 3D WebGL Background Scene */}
      <ThreeBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          background: toastMessage.type === 'success' ? '#065f46' : toastMessage.type === 'error' ? '#991b1b' : '#1e1b4b',
          border: `1px solid ${toastMessage.type === 'success' ? '#10b981' : toastMessage.type === 'error' ? '#f43f5e' : '#6366f1'}`,
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg), 0 0 20px rgba(0, 0, 0, 0.4)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '440px',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle size={18} color="#34d399" /> : <AlertCircle size={18} color="#fb7185" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Main Header with Firebase Auth */}
      <Header
        onSelectPreset={handleSelectPreset}
        isLiveConnected={isLiveConnected}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenWorkspace={() => setActiveTab('workspace')}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.displayName || user.email}!`, 'success');
        }}
      />

      {/* Main Content Area Wrapped with ErrorBoundary */}
      <ErrorBoundary onReset={() => setReportData(BENCHMARK_DOSSIERS[0])}>
        <main className="container" style={{ flex: 1, padding: '32px 24px', position: 'relative', zIndex: 1 }}>
          
          {/* Welcome Mission Control Dashboard */}
          <WelcomeDashboard
            onStartSearch={() => {
              const el = document.querySelector('.input-text');
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            onOpenWorkspace={() => setActiveTab('workspace')}
            onLoadBenchmark={handleSelectPreset}
            currentUser={currentUser}
          />

          {/* Search & Config Panel with 50 Document Uploader */}
          <SearchPanel
            topic={topic}
            setTopic={setTopic}
            country={country}
            setCountry={setCountry}
            engines={engines}
            setEngines={setEngines}
            researchDepth={researchDepth}
            setResearchDepth={setResearchDepth}
            maxSources={maxSources}
            setMaxSources={setMaxSources}
            confidenceThreshold={confidenceThreshold}
            setConfidenceThreshold={setConfidenceThreshold}
            includeDocuments={includeDocuments}
            setIncludeDocuments={setIncludeDocuments}
            documents={documents}
            setDocuments={setDocuments}
            onLaunchResearch={handleLaunchResearch}
            isLoading={isLoading}
          />

          {/* Real-time Pipeline Progress Stepper */}
          <PipelineStepper isLoading={isLoading} />

          {/* Navigation Tabs with Workspace and Animations */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap' }}>
            
            {/* Tab 1: Report */}
            <button
              type="button"
              className={`btn btn-ghost ${activeTab === 'report' ? 'nav-tab-active' : ''}`}
              style={{
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'report' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                color: activeTab === 'report' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'report' ? '#6366f1' : 'transparent'}`,
                fontWeight: activeTab === 'report' ? 700 : 500,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('report')}
            >
              <FileText size={16} />
              <span>Summary & Report</span>
            </button>

            {/* Tab 2: Sources */}
            <button
              type="button"
              className={`btn btn-ghost ${activeTab === 'sources' ? 'nav-tab-active' : ''}`}
              style={{
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'sources' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                color: activeTab === 'sources' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'sources' ? '#6366f1' : 'transparent'}`,
                fontWeight: activeTab === 'sources' ? 700 : 500,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('sources')}
            >
              <Database size={16} />
              <span>Sources & Real Links ({reportData?.sources?.length || 0})</span>
            </button>

            {/* Tab 3: Workspace */}
            <button
              type="button"
              className={`btn btn-ghost ${activeTab === 'workspace' ? 'nav-tab-active' : ''}`}
              style={{
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'workspace' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                color: activeTab === 'workspace' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'workspace' ? '#10b981' : 'transparent'}`,
                fontWeight: activeTab === 'workspace' ? 700 : 500,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('workspace')}
            >
              <Folder size={16} color={activeTab === 'workspace' ? '#34d399' : 'currentColor'} />
              <span>My Saved Searches</span>
            </button>

            {/* Tab 4: Architecture */}
            <button
              type="button"
              className={`btn btn-ghost ${activeTab === 'architecture' ? 'nav-tab-active' : ''}`}
              style={{
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'architecture' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                color: activeTab === 'architecture' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'architecture' ? '#6366f1' : 'transparent'}`,
                fontWeight: activeTab === 'architecture' ? 700 : 500,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('architecture')}
            >
              <GitMerge size={16} />
              <span>How It Works</span>
            </button>

          </div>

          {/* Tab 1: Intelligence Dossier View */}
          {activeTab === 'report' && reportData && (
            <ReportView
              reportData={reportData}
              onSelectSource={handleSelectSource}
              highlightedSourceId={highlightedSourceId}
            />
          )}

          {/* Tab 2: Sources Intelligence View */}
          {activeTab === 'sources' && reportData && (
            <SourcesDrawer
              sources={reportData.sources || []}
              highlightedSourceId={highlightedSourceId}
              onClearHighlight={() => setHighlightedSourceId(null)}
            />
          )}

          {/* Tab 3: User Workspace View */}
          {activeTab === 'workspace' && (
            <WorkspaceView
              currentDossier={reportData}
              onLoadDossier={handleLoadWorkspaceDossier}
              currentUser={currentUser}
              onNotify={showToast}
            />
          )}

          {/* Tab 4: Simple Behind-the-Scenes Explanation */}
          {activeTab === 'architecture' && (
            <div className="glass-panel" style={{ padding: '28px', animation: 'fadeIn 0.25s ease-out' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '8px' }}>
                  How ResearchPilot Works Behind the Scenes
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  A simple look at the 6 easy steps our smart assistant takes to search the web, read your files, and fact-check every detail.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                
                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <span className="badge badge-blue" style={{ marginBottom: '8px' }}>Step 1</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#93c5fd', margin: '4px 0 8px 0' }}>Google Web Search</h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Searches live web pages across Google to find the most recent, trusted articles about your question.
                  </p>
                  <code style={{ fontSize: '0.72rem', color: '#93c5fd' }}>Google Search</code>
                </div>

                <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <span className="badge badge-amber" style={{ marginBottom: '8px' }}>Step 2</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#fde68a', margin: '4px 0 8px 0' }}>Search 4 Places at Once</h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Searches Google Web, Research Papers, News Articles, and Inventions/Patents at the same time to collect balanced information.
                  </p>
                  <code style={{ fontSize: '0.72rem', color: '#fde68a' }}>4-Engine Search</code>
                </div>

                <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Step 3</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#67e8f9', margin: '4px 0 8px 0' }}>Smart AI Summary</h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Reads all search results, finds the most important takeaways, and writes clear, simple explanations in plain English.
                  </p>
                  <code style={{ fontSize: '0.72rem', color: '#67e8f9' }}>Smart AI Writer</code>
                </div>

                <div style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <span className="badge badge-purple" style={{ marginBottom: '8px' }}>Step 4</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#d8b4fe', margin: '4px 0 8px 0' }}>Read Your Uploaded Files</h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Reads up to 50 files or notes you upload, finds matching paragraphs, and blends your documents into the final report.
                  </p>
                  <code style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>Document Reader (Up to 50 files)</code>
                </div>

                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Step 5</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#6ee7b7', margin: '4px 0 8px 0' }}>Fact-Check & Double Check</h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Checks every sentence against real web links and files so you never get incorrect or made-up facts.
                  </p>
                  <code style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Fact-Checking Engine</code>
                </div>

                <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', marginBottom: '8px' }}>Step 6</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#a5b4fc', margin: '4px 0 8px 0' }}>Instant Final Report</h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Puts everything together into an easy-to-read report with trust scores and clickable links you can read or save anytime.
                  </p>
                  <code style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>Complete Report Builder</code>
                </div>

              </div>
            </div>
          )}

        </main>
      </ErrorBoundary>

      {/* Modern Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-darkest)', padding: '24px 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#6366f1" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              ResearchPilot AI
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              • Built for SerpApi India Hackathon 2026 (Track 5: Knowledge & Public Interest)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Backend: n8n Workflow Automation</span>
            <span>Auth: Firebase Authentication</span>
            <span>LLM: Google Gemini (3.5 Flash) & Ollama</span>
            <span>Search: SerpApi Engines</span>
          </div>
        </div>
      </footer>

      {/* Mini AI Chatbot with Conversation Memory & Simple-English Answers */}
      <MiniChatbot reportData={reportData} activeTopic={topic} />

    </div>
  );
}
