/**
 * features/editor/hooks/useNoteEditor.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps Tiptap's useEditor hook with our app-specific configuration.
 *
 * Responsibilities:
 *   - Creates and configures the editor instance with all extensions
 *   - Reloads editor content when active note changes
 *
 * NOTE: Autosave is NOT handled here — it is managed one level up in
 * MainEditor.tsx via useAutosave. This keeps concerns separated:
 *   useNoteEditor  → editor creation + note switching
 *   useAutosave    → persistence + save status
 */

import { useEffect, useRef } from 'react';
import { useEditor, type Editor } from '@tiptap/react';
import { buildExtensions } from '../extensions';
import { useNoteStore, EMPTY_TIPTAP_DOC } from '@/store/useNoteStore';

interface UseNoteEditorReturn {
  editor: Editor | null;
}

export function useNoteEditor(): UseNoteEditorReturn {
  const { getActiveNote } = useNoteStore();
  const activeNote = getActiveNote();

  // Track the last note ID we loaded to detect note switches
  const loadedNoteIdRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: activeNote?.content ?? EMPTY_TIPTAP_DOC,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        spellcheck: 'true',
      },
    },
  });

  // ── Switch note: reload editor content when active note changes ────────────
  useEffect(() => {
    if (!editor || !activeNote) return;

    if (loadedNoteIdRef.current !== activeNote.id) {
      loadedNoteIdRef.current = activeNote.id;
      // emitUpdate: false prevents triggering autosave on content load
      editor.commands.setContent(activeNote.content ?? EMPTY_TIPTAP_DOC, false);
      editor.commands.focus('end');
    }
  }, [editor, activeNote]);

  return { editor };
}
