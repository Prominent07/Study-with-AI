/**
 * store/useResearchStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages research snippets, bookmarks, and sources.
 *
 * This state is persisted so research isn't lost on reload.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResearchItem } from '@/types';

interface ResearchStore {
  items: ResearchItem[];
  
  // Actions
  addSnippet: (content: string, sourceUrl?: string, sourceTitle?: string, tags?: string[]) => void;
  addBookmark: (url: string, title: string, tags?: string[]) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
}

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set) => ({
      items: [],

      addSnippet: (content, sourceUrl, sourceTitle, tags = []) => {
        const newItem: ResearchItem = {
          id: `snippet-${Date.now()}`,
          type: 'snippet',
          content,
          sourceUrl,
          sourceTitle,
          tags,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [newItem, ...state.items] }));
      },

      addBookmark: (url, title, tags = []) => {
        const newItem: ResearchItem = {
          id: `bookmark-${Date.now()}`,
          type: 'bookmark',
          content: title, // use content field for title to reuse UI
          sourceUrl: url,
          tags,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [newItem, ...state.items] }));
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'studyai-research',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
