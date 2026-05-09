/**
 * store/useTabStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the tab bar state — which notes are open as tabs.
 *
 * Design principles:
 *   - Tabs are references to notes (noteId + cached title), not note copies
 *   - Opening a note = opening a tab; tabs never hold content
 *   - Max 12 tabs before oldest is evicted (prevents memory issues on tablets)
 *   - Tab state is persisted so it survives page refresh
 *
 * Relationship to useNoteStore:
 *   - useTabStore controls WHICH notes are in the tab bar
 *   - useNoteStore controls WHICH note is active (the editor renders it)
 *   - Opening a tab also sets the active note in useNoteStore
 *
 * This is intentionally decoupled — tabs can exist for notes that aren't
 * currently active (like browser tabs).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NoteTab } from '@/types';

const MAX_TABS = 12;

// ── Store Interface ───────────────────────────────────────────────────────────

interface TabStore {
  tabs: NoteTab[];
  activeTabNoteId: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  openTab: (noteId: string, title: string) => void;
  closeTab: (noteId: string) => void;
  setActiveTab: (noteId: string) => void;
  /** Sync a tab's cached title when the note title changes */
  updateTabTitle: (noteId: string, title: string) => void;
  closeAllTabs: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabNoteId: null,

      openTab: (noteId, title) => {
        const { tabs } = get();
        const alreadyOpen = tabs.find((t) => t.noteId === noteId);

        if (alreadyOpen) {
          // Just activate — don't duplicate
          set({ activeTabNoteId: noteId });
          return;
        }

        // Evict oldest tab if at max capacity
        let newTabs = [...tabs, { noteId, title: title || 'Untitled Note' }];
        if (newTabs.length > MAX_TABS) {
          // Remove the first (oldest) tab that isn't the one we're opening
          const oldestIndex = newTabs.findIndex((t) => t.noteId !== noteId);
          if (oldestIndex !== -1) newTabs.splice(oldestIndex, 1);
        }

        set({ tabs: newTabs, activeTabNoteId: noteId });
      },

      closeTab: (noteId) => {
        const { tabs, activeTabNoteId } = get();
        const remaining = tabs.filter((t) => t.noteId !== noteId);

        // If we closed the active tab, activate the nearest remaining tab
        let nextActiveId = activeTabNoteId;
        if (activeTabNoteId === noteId) {
          const closedIndex = tabs.findIndex((t) => t.noteId === noteId);
          // Try right neighbor first, then left
          nextActiveId =
            remaining[closedIndex]?.noteId ??
            remaining[closedIndex - 1]?.noteId ??
            null;
        }

        set({ tabs: remaining, activeTabNoteId: nextActiveId });
      },

      setActiveTab: (noteId) => set({ activeTabNoteId: noteId }),

      updateTabTitle: (noteId, title) => {
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.noteId === noteId ? { ...t, title: title || 'Untitled Note' } : t
          ),
        }));
      },

      closeAllTabs: () => set({ tabs: [], activeTabNoteId: null }),
    }),
    {
      name: 'studyai-tabs',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ tabs: s.tabs, activeTabNoteId: s.activeTabNoteId }),
    }
  )
);
