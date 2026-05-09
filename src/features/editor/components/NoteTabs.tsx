/**
 * features/editor/components/NoteTabs.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * VS Code / browser-style tab bar for open notes.
 *
 * Layout (inside the main editor column, above the toolbar):
 *   [Tab1] [Tab2 ×] [Tab3 ×] [Tab4 ×] ···  [+]
 *
 * Features:
 *   - Horizontal scrolling (tablets: touch-scroll)
 *   - Active tab highlighted with accent underline
 *   - Close button appears on hover (always visible on active tab)
 *   - "+" button opens a new note
 *   - Middle-click-style close (using close button)
 *   - Tab title syncs with note title changes
 *   - Hidden when no tabs are open
 */

import React, { useRef, useEffect } from 'react';
import { X, Plus, FileText } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import { useNoteStore } from '@/store/useNoteStore';

export const NoteTabs: React.FC = () => {
  const { tabs, activeTabNoteId, closeTab, setActiveTab } = useTabStore();
  const { setActiveNoteId, createNote } = useNoteStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view when it changes
  useEffect(() => {
    if (!scrollRef.current || !activeTabNoteId) return;
    const activeEl = scrollRef.current.querySelector<HTMLElement>(`[data-noteid="${activeTabNoteId}"]`);
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeTabNoteId]);

  if (tabs.length === 0) return null;

  const handleTabClick = (noteId: string) => {
    setActiveTab(noteId);
    setActiveNoteId(noteId);
  };

  const handleClose = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    // Read current state BEFORE closing to find the next active note
    const currentActiveId = useTabStore.getState().activeTabNoteId;
    const currentTabs = useTabStore.getState().tabs;
    closeTab(noteId);

    if (noteId === currentActiveId) {
      const idx = currentTabs.findIndex((t) => t.noteId === noteId);
      const remaining = currentTabs.filter((t) => t.noteId !== noteId);
      const next = remaining[idx]?.noteId ?? remaining[idx - 1]?.noteId ?? null;
      setActiveNoteId(next);
    }
  };

  const handleNewTab = () => {
    const id = createNote(null);
    useTabStore.getState().openTab(id, '');
    setActiveNoteId(id);
  };

  return (
    <div className="flex items-center border-b border-workspace-border bg-workspace-bg flex-shrink-0 min-h-[36px]">
      {/* Scrollable tabs */}
      <div
        ref={scrollRef}
        className="flex items-end flex-1 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label="Open notes"
      >
        {tabs.map((tab) => {
          const isActive = tab.noteId === activeTabNoteId;
          return (
            <button
              key={tab.noteId}
              data-noteid={tab.noteId}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.noteId)}
              className={[
                'group relative flex items-center gap-1.5 px-3 h-9 flex-shrink-0',
                'text-xs font-medium border-r border-workspace-border',
                'transition-colors duration-150 max-w-[160px] min-w-[80px]',
                isActive
                  ? 'bg-workspace-surface text-ink-primary'
                  : 'text-ink-muted hover:text-ink-secondary hover:bg-workspace-hover',
              ].join(' ')}
            >
              {/* Active indicator line */}
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-accent-light rounded-b" />
              )}

              <FileText
                size={11}
                className={`flex-shrink-0 ${isActive ? 'text-accent-light' : 'text-ink-faint'}`}
              />

              <span className="truncate flex-1 text-left">
                {tab.title || 'Untitled Note'}
              </span>

              {/* Close button */}
              <span
                role="button"
                aria-label={`Close ${tab.title || 'Untitled Note'}`}
                onClick={(e) => handleClose(e, tab.noteId)}
                className={[
                  'flex-shrink-0 w-4 h-4 rounded flex items-center justify-center',
                  'hover:bg-workspace-raised transition-colors',
                  isActive
                    ? 'opacity-70 hover:opacity-100'
                    : 'opacity-0 group-hover:opacity-60 hover:!opacity-100',
                ].join(' ')}
              >
                <X size={10} />
              </span>
            </button>
          );
        })}
      </div>

      {/* New tab button */}
      <button
        onClick={handleNewTab}
        aria-label="New note tab"
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-ink-faint hover:text-ink-secondary hover:bg-workspace-hover transition-colors border-l border-workspace-border"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
