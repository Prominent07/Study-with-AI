/**
 * store/useFlashcardStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central store for all flashcards.
 * Supports basic spaced repetition (calculating nextReview).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Flashcard } from '@/types';

interface FlashcardStore {
  cards: Flashcard[];
  
  // Actions
  addCard: (noteId: string, front: string, back: string, tags?: string[]) => string;
  updateCard: (id: string, updates: Partial<Flashcard>) => void;
  deleteCard: (id: string) => void;
  
  // Review System
  submitReview: (id: string, difficulty: 1 | 2 | 3 | 4 | 5) => void;
  getCardsDueForReview: () => Flashcard[];
  getCardsByNote: (noteId: string) => Flashcard[];
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (noteId, front, back, tags = []) => {
        const newCard: Flashcard = {
          id: `card-${Date.now()}`,
          noteId,
          front,
          back,
          tags,
          difficulty: 3, // default medium
          nextReview: null, // null = new card
          lastReviewed: null,
          createdAt: new Date().toISOString(),
        };
        
        set((s) => ({ cards: [...s.cards, newCard] }));
        return newCard.id;
      },

      updateCard: (id, updates) => {
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCard: (id) => {
        set((s) => ({
          cards: s.cards.filter((c) => c.id !== id),
        }));
      },

      submitReview: (id, difficulty) => {
        set((s) => {
          return {
            cards: s.cards.map((c) => {
              if (c.id !== id) return c;
              
              // Ultra-basic spaced repetition logic (placeholder for real SM-2)
              // 1 (easy) -> review in 3 days
              // 5 (hard) -> review in 1 hour
              const now = new Date();
              let daysToAdd = 1;
              if (difficulty <= 2) daysToAdd = 3;
              else if (difficulty >= 4) daysToAdd = 0.1; // ~2.4 hours
              
              const nextReview = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

              return {
                ...c,
                difficulty,
                lastReviewed: now.toISOString(),
                nextReview: nextReview.toISOString(),
              };
            }),
          };
        });
      },

      getCardsDueForReview: () => {
        const now = new Date().toISOString();
        return get().cards.filter(
          (c) => !c.nextReview || c.nextReview <= now
        );
      },

      getCardsByNote: (noteId) => {
        return get().cards.filter((c) => c.noteId === noteId);
      },
    }),
    {
      name: 'studyai-flashcards',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
