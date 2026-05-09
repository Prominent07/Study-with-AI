/**
 * features/editor/components/NoteMetaBar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows note metadata below the title:
 *   - Tag badge (first tag)
 *   - Last updated relative time
 *   - Word count
 *
 * Kept lightweight — no actions here, only display.
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { useNoteStore } from '@/store/useNoteStore';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const NoteMetaBar: React.FC = () => {
  const { getActiveNote } = useNoteStore();
  const note = getActiveNote();

  if (!note) return null;

  return (
    <div className="px-8 pb-2 flex items-center gap-2 flex-shrink-0">
      {note.tags[0] && (
        <Badge label={note.tags[0]} color={note.tagColor ?? '#a78bfa'} />
      )}
      <span className="text-xs text-ink-muted">
        {relativeTime(note.updatedAt)}
      </span>
      {note.wordCount > 0 && (
        <>
          <span className="text-ink-faint text-xs">·</span>
          <span className="text-xs text-ink-muted">{note.wordCount} words</span>
        </>
      )}
    </div>
  );
};
