/**
 * features/editor/MainEditor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the entire editor area:
 *
 *   ┌────────────────────────────────────────────────────┐
 *   │  [NoteTabs — VS Code style open tabs]              │
 *   ├────────────────────────────────────────────────────┤
 *   │  [Toolbar + right actions]                         │
 *   ├────────────────────────────────────────────────────┤
 *   │  [NoteList 220px] │ [Title / Meta / TiptapEditor] │
 *   │                   │                               │
 *   └────────────────────────────────────────────────────┘
 *   │  [Status bar]                                      │
 *
 * State is managed by:
 *   - useNoteStore   (note CRUD + active note)
 *   - useTabStore    (open tabs)
 *   - useNoteEditor  (Tiptap instance + note switching)
 *   - useAutosave    (saving status for the status bar)
 */

import React from 'react';
import { Share2, Download, MoreHorizontal, Plus, FileText, Sparkles } from 'lucide-react';

import { NoteList } from './components/NoteList';
import { NoteTabs } from './components/NoteTabs';
import { NoteTitle } from './components/NoteTitle';
import { NoteMetaBar } from './components/NoteMetaBar';
import { TiptapEditor } from './components/TiptapEditor';
import { EditorToolbar } from './components/EditorToolbar';
import { useNoteEditor } from './hooks/useNoteEditor';
import { useAutosave } from './hooks/useAutosave';
import { useNoteStore } from '@/store/useNoteStore';
import { useTabStore } from '@/store/useTabStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

// ── Save status indicator ─────────────────────────────────────────────────────
const SaveStatus: React.FC<{ isSaving: boolean; lastSavedAt: string | null }> = ({
  isSaving, lastSavedAt,
}) => {
  if (isSaving) return <span className="text-[11px] text-ink-muted animate-pulse">Saving…</span>;
  if (lastSavedAt) return <span className="text-[11px] text-ink-faint">Saved</span>;
  return <span className="text-[11px] text-ink-faint">Auto-save on</span>;
};

// ── Empty state (no note selected / all tabs closed) ─────────────────────────
const NoNoteState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center h-full gap-5 fade-in">
    <div className="relative">
      <div className="w-20 h-20 rounded-2xl bg-workspace-raised border border-workspace-border flex items-center justify-center shadow-card">
        <FileText size={36} className="text-ink-faint" />
      </div>
      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
        <Sparkles size={13} className="text-accent-light" />
      </div>
    </div>
    <div className="text-center">
      <p className="text-base font-semibold text-ink-secondary mb-1">Select or create a note</p>
      <p className="text-sm text-ink-muted">Your ideas deserve a great home.</p>
    </div>
    <Button variant="primary" size="md" leftIcon={<Plus size={14} />} onClick={onCreate}>
      New Note
    </Button>
  </div>
);

// ── Main Editor ───────────────────────────────────────────────────────────────
export const MainEditor: React.FC = () => {
  const { getActiveNote, createNote, updateNoteContent } = useNoteStore();
  const { openTab } = useTabStore();
  const { isSplitMode } = useWorkspaceStore();
  const activeNote = getActiveNote();

  const { editor } = useNoteEditor();
  const { isSaving, lastSavedAt } = useAutosave({
    editor,
    noteId: activeNote?.id ?? null,
    onSave: updateNoteContent,
  });

  const handleCreateNote = () => {
    const id = createNote(null);
    openTab(id, '');
  };

  return (
    <div className="flex h-full bg-workspace-bg overflow-hidden">

      {/* ── Note List Panel ── */}
      {!isSplitMode && <NoteList />}

      {/* ── Main Editor Column ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* ── Tab Bar ── */}
        <NoteTabs />

        {/* ── Toolbar Row ── */}
        <div className="h-[48px] flex items-center justify-between border-b border-workspace-border bg-workspace-surface flex-shrink-0 px-2">
          <EditorToolbar editor={editor} />

          {/* Right-side action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Tooltip label="Share" position="bottom">
              <Button variant="ghost" size="icon" className="!w-8 !h-8" disabled={!activeNote}>
                <Share2 size={14} />
              </Button>
            </Tooltip>
            <Tooltip label="Export" position="bottom">
              <Button variant="ghost" size="icon" className="!w-8 !h-8" disabled={!activeNote}>
                <Download size={14} />
              </Button>
            </Tooltip>
            <div className="w-px h-5 bg-workspace-border mx-1" />
            <Tooltip label="More options" position="bottom">
              <Button variant="ghost" size="icon" className="!w-8 !h-8">
                <MoreHorizontal size={14} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* ── Content Area ── */}
        {activeNote ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <NoteTitle />
            <NoteMetaBar />
            <div className="mx-8 border-t border-workspace-border mb-2 flex-shrink-0" />
            <TiptapEditor editor={editor} activeNoteId={activeNote.id} />
          </div>
        ) : (
          <NoNoteState onCreate={handleCreateNote} />
        )}

        {/* ── Status Bar ── */}
        <div className="h-7 flex items-center justify-between px-4 border-t border-workspace-border bg-workspace-surface flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-ink-faint">
              {activeNote
                ? `${activeNote.wordCount} words`
                : 'No note open'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatus isSaving={isSaving} lastSavedAt={lastSavedAt} />
            <span className="text-[11px] text-ink-faint">Markdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
