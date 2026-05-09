/**
 * store/useCanvasStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zustand store for managing Canvas Boards (Tldraw instances).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CanvasBoard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CanvasStore {
  boards: CanvasBoard[];
  activeBoardId: string | null;

  createBoard: (name?: string) => string;
  deleteBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  setActiveBoard: (id: string | null) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      boards: [],
      activeBoardId: null,

      createBoard: (name) => {
        const id = `board-${Date.now()}`;
        const newBoard: CanvasBoard = {
          id,
          name: name || 'Untitled Board',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: [newBoard, ...state.boards],
          activeBoardId: id,
        }));

        return id;
      },

      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
          activeBoardId: state.activeBoardId === id ? null : state.activeBoardId,
        })),

      renameBoard: (id, name) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b
          ),
        })),

      setActiveBoard: (id) => set({ activeBoardId: id }),
    }),
    {
      name: 'studyai-canvas-storage',
    }
  )
);
