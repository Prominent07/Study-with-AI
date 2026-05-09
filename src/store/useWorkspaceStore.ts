/**
 * store/useWorkspaceStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages workspace-level state:
 *   - Active navigation item
 *   - Recent notes list (seeded with mock data initially)
 *   - Active note ID
 *
 * In a future phase this store will persist to IndexedDB for offline support.
 */

import { create } from 'zustand';
import type { NavItem, RecentNote } from '@/types';

// ── Mock Data ─────────────────────────────────────────────────────────────────
// Seeded placeholder data so the sidebar looks populated on first render.
// Replace with real data fetching when the notes backend is ready.
const MOCK_RECENT_NOTES: RecentNote[] = [
  {
    id: 'note-1',
    title: 'Quantum Mechanics — Chapter 3',
    excerpt: 'Wave-particle duality describes how quantum entities exhibit...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    tag: 'Physics',
    tagColor: '#818cf8',
  },
  {
    id: 'note-2',
    title: 'Organic Chemistry: Reaction Mechanisms',
    excerpt: 'SN1 and SN2 reactions differ primarily in their...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tag: 'Chemistry',
    tagColor: '#34d399',
  },
  {
    id: 'note-3',
    title: 'Calculus III — Vector Fields',
    excerpt: 'A vector field assigns a vector to every point in space...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tag: 'Math',
    tagColor: '#fb923c',
  },
  {
    id: 'note-4',
    title: 'Essay Draft: Renaissance Art',
    excerpt: 'The Renaissance period marked a profound shift in European...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    tag: 'History',
    tagColor: '#f472b6',
  },
];

// ── Store Interface ───────────────────────────────────────────────────────────
interface WorkspaceStore {
  activeNav: NavItem;
  activeNoteId: string | null;
  recentNotes: RecentNote[];
  searchQuery: string;

  // Split Workspace State
  isSplitMode: boolean;
  leftPaneContent: 'pdf' | 'research' | null;

  // Actions
  setActiveNav: (nav: NavItem) => void;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  addRecentNote: (note: RecentNote) => void;
  setSplitMode: (isSplit: boolean) => void;
  setLeftPaneContent: (content: 'pdf' | 'research' | null) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeNav: 'notes',
  activeNoteId: null,
  recentNotes: MOCK_RECENT_NOTES,
  searchQuery: '',
  
  isSplitMode: false,
  leftPaneContent: null,

  setActiveNav: (nav) => set({ activeNav: nav }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  
  setSplitMode: (isSplit) => set({ isSplitMode: isSplit }),
  setLeftPaneContent: (content) => set({ leftPaneContent: content }),

  addRecentNote: (note) =>
    set((s) => ({
      // Prepend and limit to 10 most recent
      recentNotes: [note, ...s.recentNotes.filter((n) => n.id !== note.id)].slice(0, 10),
    })),
}));
