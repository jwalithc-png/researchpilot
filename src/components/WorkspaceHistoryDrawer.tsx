import React from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  FileText, 
  Link2, 
  Trash2, 
  FolderPlus, 
  CheckCircle2, 
  ArrowRight,
  Database
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { StoredWorkspace } from '../services/workspaceStorage';

interface WorkspaceHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateNew: () => void;
}

export const WorkspaceHistoryDrawer: React.FC<WorkspaceHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onCreateNew,
}) => {
  const { savedWorkspaces, workspace: activeWs, deleteSavedWorkspace, isCloudSyncing } = useWorkspace();

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (ws: StoredWorkspace) => {
    if (ws.analysisStatus === 'completed' || ws.intelligence) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
          <Sparkles size={11} className="text-emerald-400" />
          <span>Synthesized</span>
        </span>
      );
    }
    if (ws.analysisStatus === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse">
          <span>Analyzing...</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400 border border-white/10">
        <span>Draft</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b1324]/95 border-l border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
                <Database size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg text-white font-medium tracking-tight">
                  Saved Workspaces
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{savedWorkspaces.length} workspace{savedWorkspaces.length === 1 ? '' : 's'} stored in cloud</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action: New Workspace Button */}
          <div className="p-4 border-b border-white/5 bg-[#060B17]/40">
            <button
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FolderPlus size={15} />
              <span>Create New Workspace</span>
            </button>
          </div>

          {/* Workspaces List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedWorkspaces.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <Database size={24} />
                </div>
                <p className="text-sm font-medium text-slate-300">No workspaces stored yet</p>
                <p className="text-xs text-slate-500 max-w-[240px]">
                  When you create a workspace, it will automatically be stored with its entire research dossier.
                </p>
              </div>
            ) : (
              savedWorkspaces.map((ws) => {
                const isActive = activeWs?.id === ws.id;

                return (
                  <div
                    key={ws.id}
                    className={`p-4 rounded-xl border transition-all duration-200 space-y-3 relative group ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-[#0f172a]/60 hover:bg-[#0f172a]/90 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-sm text-white font-medium truncate">
                            {ws.title}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/20 shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        {ws.domain && (
                          <span className="inline-block text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                            {ws.domain}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0">
                        {getStatusBadge(ws)}
                      </div>
                    </div>

                    {/* Question Snippet */}
                    {ws.question && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {ws.question}
                      </p>
                    )}

                    {/* Footer Stats & Actions */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FileText size={12} className="text-emerald-400" />
                          <span>{ws.documents?.length || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Link2 size={12} className="text-cyan-400" />
                          <span>{ws.links?.length || 0}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock size={11} />
                          <span>{formatDate(ws.updatedAt || ws.createdAt)}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete workspace "${ws.title}"?`)) {
                              deleteSavedWorkspace(ws.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Workspace"
                        >
                          <Trash2 size={13} />
                        </button>

                        <button
                          onClick={() => {
                            onSelectWorkspace(ws.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-medium rounded-lg text-xs transition-all flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10 bg-[#060B17]/60 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={14} />
              <span>{isCloudSyncing ? 'Syncing to Cloud...' : 'Synced to Cloud Firestore'}</span>
            </div>
            <span>v0.1.0</span>
          </div>

        </div>
      </div>
    </div>
  );
};
