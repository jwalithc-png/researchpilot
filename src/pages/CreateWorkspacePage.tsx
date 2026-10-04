import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Link as LinkIcon, X, Loader2, AlertCircle, LogOut, Database } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { WorkspaceConstructionScene, FormState } from '../3d/WorkspaceConstructionScene';
import { WorkspaceHistoryDrawer } from '../components/WorkspaceHistoryDrawer';

export interface CreateWorkspacePageProps {
  onNavigateToAuth: () => void;
  onNavigateToWorkspace: () => void;
  onLogout?: () => void;
}

export const CreateWorkspacePage: React.FC<CreateWorkspacePageProps> = ({
  onNavigateToAuth,
  onNavigateToWorkspace,
  onLogout,
}) => {
  const { 
    createWorkspace, 
    savedWorkspaces,
    loadSavedWorkspace
  } = useWorkspace();
  
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [domain, setDomain] = useState('');
  const [objective, setObjective] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [localDocs, setLocalDocs] = useState<{ id: string; name: string; file?: File; size?: number }[]>([]);
  const [localLinks, setLocalLinks] = useState<{ id: string; url: string; label: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.odt', '.rtf'];
  const BLOCKED_EXTENSIONS = [
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
    '.exe', '.msi', '.bat', '.cmd', '.sh', '.bin', '.dll', '.com',
    '.apk', '.dmg', '.iso', '.vhd', '.jar', '.js', '.vbs', '.wsf',
    '.mp3', '.mp4', '.avi', '.mov', '.png', '.jpg', '.jpeg', '.gif'
  ];

  // Maximum limit: 20 MB per file, max 50 documents total
  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
  const MAX_DOCUMENTS_COUNT = 50;

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isAllowedDocument = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    // Block dangerous or archive formats immediately
    if (BLOCKED_EXTENSIONS.some(ext => fileName.endsWith(ext))) return false;
    // Check if filename ends with an allowed document extension
    return ALLOWED_DOCUMENT_EXTENSIONS.some(ext => fileName.endsWith(ext));
  };

  const processFiles = (files: File[]) => {
    if (!files || files.length === 0) return;
    setFileError(null);

    // 1. Check if user already reached max 50 document limit
    if (localDocs.length >= MAX_DOCUMENTS_COUNT) {
      setFileError(`Maximum document limit reached (${MAX_DOCUMENTS_COUNT} documents). Remove an existing document to upload more.`);
      return;
    }

    const validFiles: File[] = [];
    const invalidTypeFiles: string[] = [];
    const oversizedFiles: { name: string; sizeMB: string }[] = [];
    let excessCount = 0;

    const remainingSlots = MAX_DOCUMENTS_COUNT - localDocs.length;

    files.forEach(file => {
      // Check document type whitelist
      if (!isAllowedDocument(file)) {
        invalidTypeFiles.push(file.name);
        return;
      }

      // Check size limit: max 20MB
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        oversizedFiles.push({ name: file.name, sizeMB: `${sizeMB} MB` });
        return;
      }

      // Check remaining document count capacity
      if (validFiles.length < remainingSlots) {
        validFiles.push(file);
      } else {
        excessCount++;
      }
    });

    const errorNotes: string[] = [];

    if (invalidTypeFiles.length > 0) {
      errorNotes.push(`Invalid format: only PDF and Document formats (.pdf, .doc, .docx, .txt, .odt, .rtf) allowed (${invalidTypeFiles.join(', ')})`);
    }

    if (oversizedFiles.length > 0) {
      const sizeList = oversizedFiles.map(f => `${f.name} (${f.sizeMB})`).join(', ');
      errorNotes.push(`File exceeds 20 MB limit (cannot access): ${sizeList}`);
    }

    if (excessCount > 0) {
      errorNotes.push(`Document limit reached: ${excessCount} file(s) skipped because maximum limit is ${MAX_DOCUMENTS_COUNT} documents.`);
    }

    if (errorNotes.length > 0) {
      setFileError(errorNotes.join(' • '));
    }

    if (validFiles.length > 0) {
      const newDocs = validFiles.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        file: file,
        size: file.size,
      }));
      setLocalDocs(prev => [...prev, ...newDocs]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      let urlStr = linkInput.trim();
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }
      try {
        const url = new URL(urlStr);
        setLocalLinks(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            url: url.toString(),
            label: url.hostname,
          }
        ]);
        setLinkInput('');
      } catch (e) {
        // Invalid URL
      }
    }
  };

  const handleRemoveLink = (id: string) => {
    setLocalLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleRemoveDoc = (id: string) => {
    setLocalDocs(prev => prev.filter(d => d.id !== id));
  };

  const formState: FormState = {
    hasTitle: title.trim().length > 0,
    hasQuestion: question.trim().length > 0,
    hasDomain: domain.trim().length > 0,
    hasObjective: objective.trim().length > 0,
    documentCount: localDocs.length,
    linkCount: localLinks.length,
    titleText: title.trim(),
    domainText: domain,
  };

  const handleSubmit = () => {
    if (!title.trim() || !question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const workspaceId = `ws_rp_${Date.now().toString(36)}`;

    createWorkspace({
      id: workspaceId,
      title: title.trim(),
      question: question.trim(),
      domain: domain || 'Interdisciplinary',
      objective: objective.trim(),
      analysisStatus: 'processing',
      documents: localDocs.map(d => ({
        id: d.id,
        name: d.name,
        file: d.file || new File([], d.name),
        addedAt: new Date()
      })),
      links: localLinks.map(l => ({
        id: l.id,
        url: l.url,
        label: l.label,
        addedAt: new Date()
      }))
    });

    setIsSubmitting(false);
    onNavigateToWorkspace();
  };

  const isSubmitDisabled = !title.trim() || !question.trim();


  return (
    <div className="min-h-screen bg-[#060B17] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-md shrink-0">
        <button
          onClick={() => onNavigateToAuth()}
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="font-serif text-2xl tracking-tight text-white">
          Create Your Research Workspace
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors shadow-sm"
            title="Open saved workspaces"
          >
            <Database size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Saved Workspaces</span>
            {savedWorkspaces.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                {savedWorkspaces.length}
              </span>
            )}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Form */}
        <div className="w-full lg:w-[60%] p-6 overflow-y-auto z-10 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6 bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Research Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Novel Approaches to Quantum Cryptography"
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Research Question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What specific question are you trying to answer?"
                  rows={3}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Research Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
                >
                  <option value="">Select a domain...</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Social Sciences">Social Sciences</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Environmental Science">Environmental Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Research Objective</label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Briefly describe the main goals and intended outcomes of this research."
                  rows={4}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Upload Documents */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-medium text-slate-200">Upload Documents</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    localDocs.length >= MAX_DOCUMENTS_COUNT 
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {localDocs.length} / {MAX_DOCUMENTS_COUNT} Documents
                  </span>
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    Max 20MB each
                  </span>
                </div>
              </div>

              <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                  localDocs.length >= MAX_DOCUMENTS_COUNT
                    ? 'border-white/10 bg-[#0a1628]/30 opacity-60 cursor-not-allowed'
                    : isDragging 
                      ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01] cursor-pointer' 
                      : 'border-white/10 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-cyan-500/50 cursor-pointer'
                }`}
                onClick={() => {
                  if (localDocs.length < MAX_DOCUMENTS_COUNT) {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={localDocs.length < MAX_DOCUMENTS_COUNT ? handleDragOver : undefined}
                onDragLeave={localDocs.length < MAX_DOCUMENTS_COUNT ? handleDragLeave : undefined}
                onDrop={localDocs.length < MAX_DOCUMENTS_COUNT ? handleDrop : undefined}
              >
                <Upload className={`w-8 h-8 mb-2 transition-transform ${
                  localDocs.length >= MAX_DOCUMENTS_COUNT 
                    ? 'text-slate-500' 
                    : isDragging 
                      ? 'text-cyan-300 scale-110 animate-bounce' 
                      : 'text-cyan-500'
                }`} />
                {localDocs.length >= MAX_DOCUMENTS_COUNT ? (
                  <p className="text-sm text-amber-300 font-medium">Maximum document limit reached ({MAX_DOCUMENTS_COUNT}/{MAX_DOCUMENTS_COUNT})</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-300 font-medium">Drag & drop document files or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">Accepts: .pdf, .doc, .docx, .txt, .odt, .rtf (Max 20 MB per file)</p>
                  </>
                )}
                <p className="text-[11px] text-rose-400/80 mt-0.5">Executables (.exe), archives (.zip), and files over 20 MB are blocked</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  disabled={localDocs.length >= MAX_DOCUMENTS_COUNT}
                  accept=".pdf,.doc,.docx,.txt,.odt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileUpload}
                />
              </div>

              {fileError && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{fileError}</span>
                </div>
              )}
              
              {localDocs.length > 0 && (
                <div className="space-y-2 mt-4">
                  {localDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0 mr-3">
                        <span className="text-sm truncate text-slate-200">{doc.name}</span>
                        {doc.size ? (
                          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
                            {formatFileSize(doc.size)}
                          </span>
                        ) : null}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)} 
                        className="text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                        title="Remove document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-white/10" />

            {/* Add Web Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Add Web Links</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    placeholder="Paste URL here..."
                    className="w-full bg-[#0a1628] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <button 
                  onClick={handleAddLink}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              {localLinks.length > 0 && (
                <div className="space-y-2 mt-4">
                  {localLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2">
                      <div className="flex flex-col overflow-hidden mr-4">
                        <span className="text-sm font-medium">{link.label}</span>
                        <span className="text-xs text-slate-400 truncate">{link.url}</span>
                      </div>
                      <button onClick={() => handleRemoveLink(link.id)} className="text-slate-400 hover:text-red-400 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: 3D Scene */}
        <div className="w-full lg:w-[40%] h-[200px] lg:h-auto border-t lg:border-t-0 lg:border-l border-white/10 order-first lg:order-last shrink-0">
          <WorkspaceConstructionScene formState={formState} />
        </div>
      </main>

      {/* Footer / CTA */}
      <footer className="p-6 border-t border-white/10 bg-[#0a1628]/80 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-medium rounded-lg text-xs transition-colors shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          <button
            disabled={isSubmitDisabled || isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl text-white font-medium text-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitDisabled || isSubmitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
                <span>Creating Research Workspace & Executing Pipeline...</span>
              </>
            ) : (
              <span>Create Research Workspace</span>
            )}
          </button>
        </div>
      </footer>

      {/* Workspace History Drawer */}
      <WorkspaceHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectWorkspace={(id) => {
          loadSavedWorkspace(id);
          onNavigateToWorkspace();
        }}
        onCreateNew={() => {
          setTitle('');
          setQuestion('');
          setDomain('');
          setObjective('');
          setLocalDocs([]);
          setLocalLinks([]);
        }}
      />
    </div>
  );
};
