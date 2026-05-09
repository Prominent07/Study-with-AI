/**
 * store/useRevisionStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Engine for tracking study sessions, weak topics, and recently studied material.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StudySession } from '@/types';
import { useFlashcardStore } from './useFlashcardStore';

interface RevisionStore {
  sessions: StudySession[];
  recentlyStudiedNoteIds: string[];
  
  // Actions
  logSession: (cardsReviewed: number, timeSpentMs: number) => void;
  markNoteStudied: (noteId: string) => void;
  
  // Selectors
  getWeakTopics: () => Array<{ tag: string; averageDifficulty: number }>;
}

export const useRevisionStore = create<RevisionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      recentlyStudiedNoteIds: [],

      logSession: (cardsReviewed, timeSpentMs) => {
        const session: StudySession = {
          id: `session-${Date.now()}`,
          date: new Date().toISOString(),
          cardsReviewed,
          timeSpentMs,
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
      },

      markNoteStudied: (noteId) => {
        set((s) => ({
          // Move to front, keep last 20
          recentlyStudiedNoteIds: [
            noteId,
            ...s.recentlyStudiedNoteIds.filter((id) => id !== noteId),
          ].slice(0, 20),
        }));
      },

      getWeakTopics: () => {
        // Compute dynamically from the flashcard store
        const cards = useFlashcardStore.getState().cards;
        if (cards.length === 0) return [];

        const tagStats: Record<string, { totalDiff: number; count: number }> = {};
        
        cards.forEach((card) => {
          card.tags.forEach((tag) => {
            if (!tagStats[tag]) tagStats[tag] = { totalDiff: 0, count: 0 };
            tagStats[tag].totalDiff += card.difficulty;
            tagStats[tag].count += 1;
          });
        });

        return Object.entries(tagStats)
          .map(([tag, stats]) => ({
            tag,
            averageDifficulty: stats.totalDiff / stats.count,
          }))
          .filter((topic) => topic.averageDifficulty >= 3.5) // 3.5+ is considered weak
          .sort((a, b) => b.averageDifficulty - a.averageDifficulty);
      },
    }),
    {
      name: 'studyai-revision',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
