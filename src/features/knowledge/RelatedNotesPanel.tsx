/**
 * features/knowledge/RelatedNotesPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders suggested connections and backlinks at the bottom of the editor.
 */

import React from 'react';
import { Network, Link2 } from 'lucide-react';
import { useRelatedNotes } from './useRelatedNotes';
import { useNoteStore } from '@/store/useNoteStore';
import { useTabStore } from '@/store/useTabStore';

export const RelatedNotesPanel: React.FC<{ activeNoteId: string | null }> = ({ activeNoteId }) => {
  const relatedNotes = useRelatedNotes(activeNoteId);
  const { setActiveNoteId } = useNoteStore();
  const { openTab } = useTabStore();

  if (!activeNoteId || relatedNotes.length === 0) return null;

  const handleOpenNote = (noteId: string, title: string) => {
    setActiveNoteId(noteId);
    openTab(noteId, title);
  };

  return (
    <div className="mt-8 pt-6 border-t border-workspace-border">
      <div className="flex items-center gap-2 mb-4">
        <Network size={16} className="text-accent-light" />
        <h3 className="text-sm font-semibold text-ink-primary">Related Connections</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {relatedNotes.map(({ note, score, reasons }) => {
          const isDirectLink = reasons.some(r => r.includes('Linked'));
          
          return (
            <div 
              key={note.id}
              onClick={() => handleOpenNote(note.id, note.title || 'Untitled')}
              className="bg-workspace-surface border border-workspace-border rounded-lg p-3 cursor-pointer hover:border-accent/40 hover:bg-workspace-hover transition-colors group"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs font-medium text-ink-primary truncate group-hover:text-accent-light transition-colors">
                  {note.title || 'Untitled Note'}
                </p>
                {isDirectLink && (
                  <Link2 size={12} className="text-accent-light shrink-0 ml-2" />
                )}
              </div>
              <p className="text-[10px] text-ink-muted line-clamp-2 leading-relaxed">
                {note.excerpt}
              </p>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {reasons.slice(0, 2).map((reason, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-sm bg-workspace-raised text-[9px] text-ink-faint border border-workspace-border/50">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
