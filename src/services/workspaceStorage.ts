/**
 * ResearchPilot — Workspace & Analysis Output Persistence Service
 * 
 * Provides dual-layer storage:
 * 1. Cloud Firestore (under `users/{userId}/workspaces/{workspaceId}`)
 * 2. LocalStorage cache (under `researchpilot_workspaces_{userId}`)
 * 
 * Stores the entire workspace state including all Ollama multi-agent outputs.
 */

import { doc, setDoc, getDocs, deleteDoc, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ResearchIntelligence } from './researchApi';

export interface StoredWorkspace {
  id: string;
  userId: string;
  title: string;
  question: string;
  domain: string;
  objective: string;
  documents: { id: string; name: string }[];
  links: { id: string; url: string; label: string }[];
  createdAt: string;
  updatedAt: string;
  analysisStatus: 'idle' | 'processing' | 'completed' | 'error';
  analysisError?: string | null;
  intelligence?: ResearchIntelligence | null;
}

const LOCAL_STORAGE_PREFIX = 'researchpilot_workspaces_';

/**
 * Save workspace locally to localStorage for zero-latency offline availability
 */
export function saveToLocalCache(userId: string, workspace: StoredWorkspace): void {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const existingStr = localStorage.getItem(key);
    let list: StoredWorkspace[] = existingStr ? JSON.parse(existingStr) : [];
    
    const index = list.findIndex((w) => w.id === workspace.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...workspace, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(workspace);
    }

    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage save notice:', err);
  }
}

/**
 * Get all cached workspaces from localStorage
 */
export function getFromLocalCache(userId: string): StoredWorkspace[] {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const existingStr = localStorage.getItem(key);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (err) {
    console.warn('LocalStorage read notice:', err);
    return [];
  }
}

/**
 * Delete workspace from local cache
 */
export function deleteFromLocalCache(userId: string, workspaceId: string): void {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const list = getFromLocalCache(userId).filter((w) => w.id !== workspaceId);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage delete notice:', err);
  }
}

/**
 * Save workspace and its entire intelligence output to Cloud Firestore + Local Cache
 */
export async function saveWorkspace(userId: string, workspace: StoredWorkspace): Promise<void> {
  if (!userId || !workspace.id) return;

  const sanitized: StoredWorkspace = {
    ...workspace,
    userId,
    updatedAt: new Date().toISOString()
  };

  // 1. Immediately persist to Local Cache
  saveToLocalCache(userId, sanitized);

  // 2. Persist to Cloud Firestore
  try {
    const docRef = doc(db, 'users', userId, 'workspaces', workspace.id);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err: any) {
    console.warn('Firestore cloud sync notice (local copy preserved):', err?.message || err);
  }
}

/**
 * Retrieve all workspaces for a user (Cloud Firestore with Local Cache fallback)
 */
export async function fetchUserWorkspaces(userId: string): Promise<StoredWorkspace[]> {
  if (!userId) return [];

  const localList = getFromLocalCache(userId);

  try {
    const colRef = collection(db, 'users', userId, 'workspaces');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudList: StoredWorkspace[] = [];
      snapshot.forEach((docSnap) => {
        cloudList.push(docSnap.data() as StoredWorkspace);
      });

      // Merge cloud and local copies (keeping newest)
      const mergedMap = new Map<string, StoredWorkspace>();
      localList.forEach((w) => mergedMap.set(w.id, w));
      cloudList.forEach((w) => mergedMap.set(w.id, w));

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      );

      // Refresh local cache with merged data
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(mergedList));
      return mergedList;
    }
  } catch (err: any) {
    console.warn('Firestore fetch notice (using local cache):', err?.message || err);
  }

  return localList;
}

/**
 * Delete a workspace from both Firestore and Local Cache
 */
export async function deleteWorkspace(userId: string, workspaceId: string): Promise<void> {
  if (!userId || !workspaceId) return;

  deleteFromLocalCache(userId, workspaceId);

  try {
    const docRef = doc(db, 'users', userId, 'workspaces', workspaceId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('Firestore delete notice:', err?.message || err);
  }
}
