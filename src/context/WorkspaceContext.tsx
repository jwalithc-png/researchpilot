import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ResearchIntelligence } from '../services/researchApi';
import { 
  saveWorkspace as persistWorkspaceToStorage, 
  fetchUserWorkspaces, 
  deleteWorkspace as removeWorkspaceFromStorage, 
  StoredWorkspace 
} from '../services/workspaceStorage';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UserInfo {
  uid?: string;
  name: string;
  email: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  file?: File;
  addedAt: Date;
}

export interface LinkItem {
  id: string;
  url: string;
  label: string;
  addedAt: Date;
}

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface Workspace {
  id: string;
  title: string;
  question: string;
  domain: string;
  objective: string;
  documents: DocumentItem[];
  links: LinkItem[];
  createdAt: Date;
  intelligence?: ResearchIntelligence | null;
  analysisStatus?: AnalysisStatus;
  analysisError?: string | null;
}

export interface WorkspaceContextValue {
  user: UserInfo | null;
  workspace: Workspace | null;
  savedWorkspaces: StoredWorkspace[];
  isCloudSyncing: boolean;
  lastSyncedAt: Date | null;
  setUser: (user: UserInfo) => void;
  clearUser: () => void;
  createWorkspace: (data: {
    id?: string;
    title: string;
    question: string;
    domain: string;
    objective: string;
    documents?: DocumentItem[];
    links?: LinkItem[];
    analysisStatus?: AnalysisStatus;
  }) => string;
  addDocument: (doc: DocumentItem) => void;
  removeDocument: (id: string) => void;
  addLink: (link: LinkItem) => void;
  removeLink: (id: string) => void;
  setIntelligence: (data: ResearchIntelligence | null) => void;
  setAnalysisStatus: (status: AnalysisStatus, error?: string | null) => void;
  loadSavedWorkspace: (workspaceId: string) => void;
  deleteSavedWorkspace: (workspaceId: string) => Promise<void>;
  refreshSavedWorkspaces: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const useWorkspace = (): WorkspaceContextValue => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserInfo | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [savedWorkspaces, setSavedWorkspaces] = useState<StoredWorkspace[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const activeUserId = user?.uid || 'guest_user';

  // Helper to serialize Workspace to StoredWorkspace
  const serializeWorkspace = (ws: Workspace, userId: string): StoredWorkspace => {
    return {
      id: ws.id,
      userId,
      title: ws.title,
      question: ws.question,
      domain: ws.domain,
      objective: ws.objective,
      documents: ws.documents.map((d) => ({ id: d.id, name: d.name })),
      links: ws.links.map((l) => ({ id: l.id, url: l.url, label: l.label })),
      createdAt: ws.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      analysisStatus: ws.analysisStatus || 'idle',
      analysisError: ws.analysisError || null,
      intelligence: ws.intelligence || null,
    };
  };

  // Helper to persist current workspace
  const triggerAutoSave = useCallback(
    async (ws: Workspace, userId: string) => {
      if (!ws.title.trim()) return;
      setIsCloudSyncing(true);
      try {
        const stored = serializeWorkspace(ws, userId);
        await persistWorkspaceToStorage(userId, stored);
        setLastSyncedAt(new Date());
        // Update local list
        setSavedWorkspaces((prev) => {
          const idx = prev.findIndex((p) => p.id === stored.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = stored;
            return copy;
          }
          return [stored, ...prev];
        });
      } catch (err) {
        console.warn('Auto-save notice:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    },
    [],
  );

  // Load saved workspaces when user changes
  const refreshSavedWorkspaces = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const list = await fetchUserWorkspaces(activeUserId);
      setSavedWorkspaces(list);

      // If no active workspace is currently selected, load the most recent one if available
      setWorkspace((current) => {
        if (!current && list.length > 0) {
          const latest = list[0];
          return {
            id: latest.id,
            title: latest.title,
            question: latest.question,
            domain: latest.domain,
            objective: latest.objective,
            documents: (latest.documents || []).map((d) => ({
              id: d.id,
              name: d.name,
              addedAt: new Date(latest.createdAt || Date.now()),
            })),
            links: (latest.links || []).map((l) => ({
              id: l.id,
              url: l.url,
              label: l.label,
              addedAt: new Date(latest.createdAt || Date.now()),
            })),
            createdAt: new Date(latest.createdAt || Date.now()),
            intelligence: latest.intelligence || null,
            analysisStatus: latest.analysisStatus || 'idle',
            analysisError: latest.analysisError || null,
          };
        }
        return current;
      });
    } catch (err) {
      console.warn('Could not refresh workspaces:', err);
    }
  }, [activeUserId]);

  useEffect(() => {
    refreshSavedWorkspaces();
  }, [refreshSavedWorkspaces]);

  const setUser = useCallback((u: UserInfo) => {
    setUserState(u);
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    setWorkspace(null);
    setSavedWorkspaces([]);
  }, []);

  const createWorkspace = useCallback(
    (data: {
      id?: string;
      title: string;
      question: string;
      domain: string;
      objective: string;
      documents?: DocumentItem[];
      links?: LinkItem[];
      analysisStatus?: AnalysisStatus;
    }) => {
      const generatedId = data.id || `ws_rp_${Date.now().toString(36)}`;
      const newWs: Workspace = {
        id: generatedId,
        title: data.title,
        question: data.question,
        domain: data.domain,
        objective: data.objective,
        documents: data.documents || [],
        links: data.links || [],
        createdAt: new Date(),
        intelligence: null,
        analysisStatus: data.analysisStatus || 'idle',
        analysisError: null,
      };

      setWorkspace(newWs);
      triggerAutoSave(newWs, activeUserId);
      return generatedId;
    },
    [activeUserId, triggerAutoSave],
  );

  const addDocument = useCallback(
    (doc: DocumentItem) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, documents: [...prev.documents, doc] };
        triggerAutoSave(updated, activeUserId);
        return updated;
      });
    },
    [activeUserId, triggerAutoSave],
  );

  const removeDocument = useCallback(
    (id: string) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, documents: prev.documents.filter((d) => d.id !== id) };
        triggerAutoSave(updated, activeUserId);
        return updated;
      });
    },
    [activeUserId, triggerAutoSave],
  );

  const addLink = useCallback(
    (link: LinkItem) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, links: [...prev.links, link] };
        triggerAutoSave(updated, activeUserId);
        return updated;
      });
    },
    [activeUserId, triggerAutoSave],
  );

  const removeLink = useCallback(
    (id: string) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, links: prev.links.filter((l) => l.id !== id) };
        triggerAutoSave(updated, activeUserId);
        return updated;
      });
    },
    [activeUserId, triggerAutoSave],
  );

  const setIntelligence = useCallback(
    (data: ResearchIntelligence | null) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated: Workspace = {
          ...prev,
          intelligence: data,
          analysisStatus: data ? 'completed' : prev.analysisStatus,
        };
        triggerAutoSave(updated, activeUserId);
        return updated;
      });
    },
    [activeUserId, triggerAutoSave],
  );

  const setAnalysisStatus = useCallback(
    (status: AnalysisStatus, error?: string | null) => {
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updated: Workspace = {
          ...prev,
          analysisStatus: status,
          analysisError: error || null,
        };
        triggerAutoSave(updated, activeUserId);
        return updated;
      });
    },
    [activeUserId, triggerAutoSave],
  );

  const loadSavedWorkspace = useCallback(
    (workspaceId: string) => {
      const found = savedWorkspaces.find((w) => w.id === workspaceId);
      if (!found) return;

      const restored: Workspace = {
        id: found.id,
        title: found.title,
        question: found.question,
        domain: found.domain,
        objective: found.objective,
        documents: (found.documents || []).map((d) => ({
          id: d.id,
          name: d.name,
          addedAt: new Date(found.createdAt || Date.now()),
        })),
        links: (found.links || []).map((l) => ({
          id: l.id,
          url: l.url,
          label: l.label,
          addedAt: new Date(found.createdAt || Date.now()),
        })),
        createdAt: new Date(found.createdAt || Date.now()),
        intelligence: found.intelligence || null,
        analysisStatus: found.analysisStatus || 'idle',
        analysisError: found.analysisError || null,
      };

      setWorkspace(restored);
    },
    [savedWorkspaces],
  );

  const deleteSavedWorkspace = useCallback(
    async (workspaceId: string) => {
      await removeWorkspaceFromStorage(activeUserId, workspaceId);
      setSavedWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      setWorkspace((current) => (current?.id === workspaceId ? null : current));
    },
    [activeUserId],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        workspace,
        savedWorkspaces,
        isCloudSyncing,
        lastSyncedAt,
        setUser,
        clearUser,
        createWorkspace,
        addDocument,
        removeDocument,
        addLink,
        removeLink,
        setIntelligence,
        setAnalysisStatus,
        loadSavedWorkspace,
        deleteSavedWorkspace,
        refreshSavedWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
