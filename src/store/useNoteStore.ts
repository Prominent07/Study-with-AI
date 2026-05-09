/**
 * store/useNoteStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central store for all note CRUD operations.
 *
 * Persistence strategy:
 *   - Phase 2 (now): localStorage via Zustand middleware
 *   - Phase 4 (future): migrate to Dexie.js (IndexedDB) by swapping the
 *     persistence layer below — the store interface stays identical.
 *
 * The store is the SINGLE source of truth for notes. Components never
 * read from localStorage directly; they consume this store.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NoteDocument, RecentNote } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generate a short unique ID without a library dependency */
function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Empty Tiptap document — the default content for a new note */
export const EMPTY_TIPTAP_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

/** Extract full plain-text from Tiptap JSON */
function extractText(content: object): string {
  try {
    const json = content as { content?: Array<{ content?: Array<{ text?: string }> }> };
    const texts: string[] = [];
    const walk = (nodes?: Array<{ text?: string; content?: unknown[] }>) => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.text) texts.push(node.text);
        walk(node.content as Array<{ text?: string; content?: unknown[] }>);
      }
    };
    walk(json.content as Array<{ text?: string; content?: unknown[] }>);
    return texts.join(' ');
  } catch {
    return '';
  }
}

/** Count words in Tiptap JSON */
function countWords(content: object): number {
  const text = extractText(content);
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ── Store Interface ───────────────────────────────────────────────────────────

interface NoteStore {
  notes: NoteDocument[];
  activeNoteId: string | null;

  // ── Selectors ─────────────────────────────────────────────────────────────
  getActiveNote: () => NoteDocument | null;
  getRecentNotes: () => RecentNote[];
  getNotesByFolder: (folderId: string | null) => NoteDocument[];

  // ── Actions ────────────────────────────────────────────────────────────────
  createNote: (folderId?: string | null) => string;
  updateNoteContent: (id: string, content: object) => void;
  updateNoteTitle: (id: string, title: string) => void;
  renameNote: (id: string, title: string) => void;  // alias for clarity
  deleteNote: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
  pinNote: (id: string, pinned: boolean) => void;
  moveNoteToFolder: (id: string, folderId: string | null) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,

      // ── Derived selectors ──────────────────────────────────────────────────
      getActiveNote: () => {
        const { notes, activeNoteId } = get();
        return notes.find((n) => n.id === activeNoteId) ?? null;
      },

      getRecentNotes: (): RecentNote[] => {
        return get()
          .notes.slice()
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
          .map((n) => ({
            id: n.id,
            title: n.title || 'Untitled Note',
            excerpt: n.excerpt,
            updatedAt: n.updatedAt,
            tag: n.tags[0],
            tagColor: n.tagColor,
          }));
      },

      // ── Actions ────────────────────────────────────────────────────────────

      createNote: (folderId = null) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newNote: NoteDocument = {
          id,
          title: '',
          content: EMPTY_TIPTAP_DOC,
          excerpt: '',
          folderId,
          tags: [],
          createdAt: now,
          updatedAt: now,
          isPinned: false,
          wordCount: 0,
        };
        set((s) => ({ notes: [newNote, ...s.notes], activeNoteId: id }));
        return id;
      },

      updateNoteContent: (id, content) => {
        set((s) => {
          const rawText = extractText(content);
          // Extract [[Links]]
          const matches = Array.from(rawText.matchAll(/\[\[(.*?)\]\]/g)).map(m => m[1].toLowerCase());
          
          // Map link titles to actual Note IDs
          const linkedNoteIds = matches
            .map(title => s.notes.find(n => n.title.toLowerCase() === title)?.id)
            .filter((linkId): linkId is string => !!linkId && linkId !== id); // filter nulls and self-links

          return {
            notes: s.notes.map((n) =>
              n.id === id
                ? {
                    ...n,
                    content,
                    excerpt: rawText.slice(0, 120), // trim for actual excerpt usage
                    wordCount: countWords(content),
                    linkedNoteIds: Array.from(new Set(linkedNoteIds)), // unique
                    updatedAt: new Date().toISOString(),
                  }
                : n
            ),
          };
        });
      },

      updateNoteTitle: (id, title) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, title, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      deleteNote: (id) => {
        set((s) => {
          const remaining = s.notes.filter((n) => n.id !== id);
          return {
            notes: remaining,
            activeNoteId:
              s.activeNoteId === id ? (remaining[0]?.id ?? null) : s.activeNoteId,
          };
        });
      },

      setActiveNoteId: (id) => set({ activeNoteId: id }),

      pinNote: (id, pinned) => {
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, isPinned: pinned } : n)),
        }));
      },

      renameNote: (id, title) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, title, updatedAt: new Date().toISOString() } : n
          ),
        }));
      },

      moveNoteToFolder: (id, folderId) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, folderId } : n
          ),
        }));
      },

      getNotesByFolder: (folderId) => {
        return get().notes.filter((n) => n.folderId === folderId);
      },
    }),
    {
      name: 'studyai-notes',           // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist notes and activeNoteId — functions are not serializable
      partialize: (s) => ({ notes: s.notes, activeNoteId: s.activeNoteId }),
    }
  )
);
