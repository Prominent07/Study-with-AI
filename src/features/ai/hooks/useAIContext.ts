/**
 * features/ai/hooks/useAIContext.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the AIContext object from the current workspace state.
 *
 * This hook is the bridge between the note store and the AI service.
 * It reads the active note and constructs context that gets injected
 * into every AI request's system prompt.
 *
 * Architecture decision:
 *   - Context is computed fresh on every sendMessage call (not cached)
 *   - This guarantees the AI always sees the latest note content
 *   - Performance: note content is capped at 6000 chars to stay within token limits
 *
 * Future extensions:
 *   - selectedText: read from Tiptap editor selection API
 *   - workspaceContext: inject recent notes, folder names
 *   - RAG: retrieve relevant chunks from a vector store
 */

import { useNoteStore } from '@/store/useNoteStore';
import type { AIContext } from '@/types';

// ── Plain text extractor (same logic as useNoteStore, but co-located here) ────
function tiptapToPlainText(content: object): string {
  try {
    const texts: string[] = [];
    const walk = (nodes?: Array<{ text?: string; content?: unknown[] }>) => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.text) texts.push(node.text);
        walk(node.content as Array<{ text?: string; content?: unknown[] }>);
      }
    };
    walk((content as { content?: Array<{ text?: string; content?: unknown[] }> }).content);
    return texts.join(' ');
  } catch {
    return '';
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAIContext(): AIContext {
  const activeNote = useNoteStore.getState().getActiveNote();

  if (!activeNote) return {};

  const noteContent = tiptapToPlainText(activeNote.content);

  return {
    noteTitle:   activeNote.title || 'Untitled Note',
    noteContent: noteContent.slice(0, 6000),  // Cap to avoid token overflow
    wordCount:   activeNote.wordCount,
    // selectedText: future — read from editor.state.selection
  };
}

/**
 * Non-hook version — for use inside store actions and service calls
 * where React hooks are not available.
 */
export function getAIContext(): AIContext {
  const activeNote = useNoteStore.getState().getActiveNote();
  if (!activeNote) return {};
  const noteContent = tiptapToPlainText(activeNote.content);
  return {
    noteTitle:   activeNote.title || 'Untitled Note',
    noteContent: noteContent.slice(0, 6000),
    wordCount:   activeNote.wordCount,
  };
}
