/**
 * store/useFolderStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages folder state for note organization.
 *
 * Architecture decisions:
 *   - Folders are separate from notes (separate store, separate localStorage key)
 *   - This prevents large note content from slowing down folder UI updates
 *   - parentId is included now so nested folders require ZERO schema changes later
 *   - isExpanded is stored in the store (not persisted — resets to defaults on reload)
 *
 * Default folders are seeded only if no folders exist in localStorage.
 * They use stable IDs so notes can reliably reference them.
 *
 * Migration path to Dexie.js: swap `createJSONStorage` for a Dexie adapter.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Folder } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateFolderId(): string {
  return `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Default Folders ───────────────────────────────────────────────────────────
// These are seeded once. Their IDs are stable so notes can reference them.
// Users can rename/delete these; they are NOT hardcoded at runtime.

export const DEFAULT_FOLDER_IDS = {
  general:       'folder-default-general',
  dsa:           'folder-default-dsa',
  research:      'folder-default-research',
  semester:      'folder-default-semester',
} as const;

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: DEFAULT_FOLDER_IDS.general,
    name: 'General',
    parentId: null,
    color: '#a78bfa',   // violet
    createdAt: new Date(0).toISOString(),
    isExpanded: true,
  },
  {
    id: DEFAULT_FOLDER_IDS.dsa,
    name: 'DSA',
    parentId: null,
    color: '#34d399',   // emerald
    createdAt: new Date(1).toISOString(),
    isExpanded: true,
  },
  {
    id: DEFAULT_FOLDER_IDS.research,
    name: 'Research',
    parentId: null,
    color: '#60a5fa',   // blue
    createdAt: new Date(2).toISOString(),
    isExpanded: true,
  },
  {
    id: DEFAULT_FOLDER_IDS.semester,
    name: 'Semester Notes',
    parentId: null,
    color: '#fb923c',   // orange
    createdAt: new Date(3).toISOString(),
    isExpanded: true,
  },
];

// ── Store Interface ───────────────────────────────────────────────────────────

interface FolderStore {
  folders: Folder[];

  // ── Selectors ─────────────────────────────────────────────────────────────
  getFolderById: (id: string) => Folder | undefined;
  getRootFolders: () => Folder[];

  // ── Actions ────────────────────────────────────────────────────────────────
  createFolder: (name: string, parentId?: string | null, color?: string) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolderExpanded: (id: string) => void;
  setFolderExpanded: (id: string, expanded: boolean) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useFolderStore = create<FolderStore>()(
  persist(
    (set, get) => ({
      // Seed with defaults on first load
      folders: DEFAULT_FOLDERS,

      // ── Selectors ──────────────────────────────────────────────────────────
      getFolderById: (id) => get().folders.find((f) => f.id === id),

      getRootFolders: () =>
        get()
          .folders.filter((f) => f.parentId === null)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),

      // ── Actions ────────────────────────────────────────────────────────────

      createFolder: (name, parentId = null, color = '#a78bfa') => {
        const id = generateFolderId();
        const newFolder: Folder = {
          id,
          name: name.trim() || 'New Folder',
          parentId,
          color,
          createdAt: new Date().toISOString(),
          isExpanded: true,
        };
        set((s) => ({ folders: [...s.folders, newFolder] }));
        return id;
      },

      renameFolder: (id, name) => {
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id === id ? { ...f, name: name.trim() || f.name } : f
          ),
        }));
      },

      deleteFolder: (id) => {
        // Prevent deleting default folders
        if (Object.values(DEFAULT_FOLDER_IDS).includes(id as never)) return;
        set((s) => ({ folders: s.folders.filter((f) => f.id !== id) }));
        // Note: notes in the deleted folder become folderId: null (uncategorized)
        // The note store handles this separately when needed
      },

      toggleFolderExpanded: (id) => {
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
          ),
        }));
      },

      setFolderExpanded: (id, expanded) => {
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id === id ? { ...f, isExpanded: expanded } : f
          ),
        }));
      },
    }),
    {
      name: 'studyai-folders',
      storage: createJSONStorage(() => localStorage),
      // isExpanded is UI state — don't persist it (resets to true on reload)
      partialize: (s) => ({
        folders: s.folders.map(({ isExpanded: _, ...rest }) => rest),
      }),
    }
  )
);
