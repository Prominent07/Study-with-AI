/**
 * features/editor/components/TiptapEditor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The core Tiptap editor canvas — renders the EditorContent component
 * with dark-mode styling applied via the .tiptap-editor CSS class.
 *
 * This component is intentionally thin:
 *   - It receives the editor instance (no store access here)
 *   - Styling is handled entirely in globals.css
 *   - It just renders <EditorContent> inside a scrollable container
 *
 * Future: bubble menu, slash commands, and floating toolbar will mount here.
 */

import React from 'react';
import { EditorContent, type Editor } from '@tiptap/react';
import { RelatedNotesPanel } from '@/features/knowledge/RelatedNotesPanel';

interface TiptapEditorProps {
  editor: Editor | null;
  activeNoteId: string | null;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ editor, activeNoteId }) => {
  return (
    <div className="flex-1 overflow-y-auto px-8 pb-16">
      <EditorContent
        editor={editor}
        className="min-h-full"
      />
      <RelatedNotesPanel activeNoteId={activeNoteId} />
    </div>
  );
};
