/**
 * features/editor/components/NoteTitle.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Editable note title — a plain <input> kept outside the Tiptap editor
 * so it's independently focusable and has its own save logic.
 *
 * - Autosaves on blur and on Enter key
 * - Syncs from store when active note changes
 * - Updates the open tab's cached title on every save
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNoteStore } from '@/store/useNoteStore';
import { useTabStore } from '@/store/useTabStore';

export const NoteTitle: React.FC = () => {
  const { getActiveNote, updateNoteTitle } = useNoteStore();
  const { updateTabTitle } = useTabStore();
  const activeNote = getActiveNote();

  const [localTitle, setLocalTitle] = useState(activeNote?.title ?? '');
  const prevNoteIdRef = useRef<string | null>(null);

  // Sync local state when the active note switches
  useEffect(() => {
    if (activeNote && activeNote.id !== prevNoteIdRef.current) {
      prevNoteIdRef.current = activeNote.id;
      setLocalTitle(activeNote.title);
    }
  }, [activeNote]);

  const handleSave = () => {
    if (!activeNote) return;
    updateNoteTitle(activeNote.id, localTitle);
    // Keep tab bar in sync with the new title
    updateTabTitle(activeNote.id, localTitle);
  };

  if (!activeNote) return null;

  return (
    <div className="px-8 pt-8 pb-3 flex-shrink-0">
      <input
        type="text"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
            // Move focus into the editor body
            const editorEl = document.querySelector<HTMLElement>('.tiptap-editor');
            editorEl?.focus();
          }
        }}
        placeholder="Untitled Note"
        aria-label="Note title"
        className="w-full bg-transparent text-[26px] font-bold text-ink-primary
                   placeholder:text-ink-faint border-none outline-none
                   caret-accent-light leading-tight"
        maxLength={200}
      />
    </div>
  );
};
