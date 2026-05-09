/**
 * features/knowledge/useRelatedNotes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Analyzes the entire note corpus to suggest related notes for the active note.
 */

import { useMemo } from 'react';
import { useNoteStore } from '@/store/useNoteStore';
import type { NoteDocument } from '@/types';

export interface RelatedNoteScore {
  note: NoteDocument;
  score: number;
  reasons: string[];
}

export function useRelatedNotes(activeNoteId: string | null) {
  const notes = useNoteStore((s) => s.notes);

  return useMemo(() => {
    if (!activeNoteId) return [];

    const activeNote = notes.find((n) => n.id === activeNoteId);
    if (!activeNote) return [];

    const activeWords = new Set(
      activeNote.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3) // Ignore short words
    );

    const scores: RelatedNoteScore[] = [];

    for (const note of notes) {
      if (note.id === activeNoteId) continue;

      let score = 0;
      const reasons: string[] = [];

      // 1. Direct Links (Outgoing)
      if (activeNote.linkedNoteIds?.includes(note.id)) {
        score += 10;
        reasons.push('Directly linked');
      }

      // 2. Backlinks (Incoming)
      if (note.linkedNoteIds?.includes(activeNote.id)) {
        score += 10;
        reasons.push('Linked to this note');
      }

      // 3. Shared Tags
      const sharedTags = note.tags.filter((t) => activeNote.tags.includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 3;
        reasons.push(`Shared tags (${sharedTags.join(', ')})`);
      }

      // 4. Title Keyword Overlap
      if (activeNote.title && note.title) {
        const noteWords = note.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/);
        
        const sharedWords = noteWords.filter((w) => activeWords.has(w) && w.length > 3);
        if (sharedWords.length > 0) {
          score += sharedWords.length * 2;
          reasons.push('Similar title keywords');
        }
      }

      if (score > 0) {
        scores.push({ note, score, reasons });
      }
    }

    // Sort by highest score first
    return scores.sort((a, b) => b.score - a.score).slice(0, 5); // Max 5 suggestions
  }, [activeNoteId, notes]);
}
