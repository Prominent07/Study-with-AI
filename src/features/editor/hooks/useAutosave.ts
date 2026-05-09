/**
 * features/editor/hooks/useAutosave.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Debounced autosave hook for the Tiptap editor.
 *
 * Strategy:
 *   - Listen to editor `update` transaction events
 *   - Debounce by 800ms (fast enough to feel instant, slow enough not to lag)
 *   - Call `onSave(noteId, content)` which writes to the Zustand store
 *   - Zustand's `persist` middleware then syncs to localStorage asynchronously
 *
 * Why debounce instead of throttle?
 *   Debounce fires AFTER the user pauses typing, which is exactly right for
 *   autosave — we want to capture a complete thought, not every keystroke.
 *
 * Migration path to Dexie.js:
 *   Just change the `onSave` callback passed in — this hook is storage-agnostic.
 */

import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

interface UseAutosaveOptions {
  editor: Editor | null;
  noteId: string | null;
  onSave: (id: string, content: object) => void;
  /** Debounce delay in ms. Default: 800ms */
  delay?: number;
}

interface UseAutosaveReturn {
  /** True during the debounce window — shows "Saving…" indicator */
  isSaving: boolean;
  /** ISO timestamp of last successful save */
  lastSavedAt: string | null;
}

export function useAutosave({
  editor,
  noteId,
  onSave,
  delay = 800,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a stable ref to onSave so the effect doesn't re-run on every render
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!editor || !noteId) return;

    const handleUpdate = () => {
      // Show saving indicator immediately on keystroke
      setIsSaving(true);

      // Clear existing debounce timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      // Set new debounce timer
      debounceTimer.current = setTimeout(() => {
        const json = editor.getJSON();
        onSaveRef.current(noteId, json);
        setLastSavedAt(new Date().toISOString());
        setIsSaving(false);
      }, delay);
    };

    // Subscribe to Tiptap's transaction event
    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [editor, noteId, delay]);

  return { isSaving, lastSavedAt };
}
