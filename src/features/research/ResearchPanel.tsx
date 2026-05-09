/**
 * features/research/ResearchPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Research workspace panel for viewing and managing saved snippets and bookmarks.
 */

import React, { useState } from 'react';
import { Bookmark, FileText, Trash2, ExternalLink, X, Plus, Sparkles } from 'lucide-react';
import { useResearchStore } from '@/store/useResearchStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAIStore } from '@/store/useAIStore';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ResearchItem } from '@/types';

const ResearchCard: React.FC<{ item: ResearchItem; onRemove: (id: string) => void }> = ({ item, onRemove }) => {
  const isSnippet = item.type === 'snippet';
  const { sendMessage } = useAIStore();
  
  return (
    <div className="group relative bg-workspace-surface border border-workspace-border rounded-xl p-3 shadow-sm hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isSnippet ? (
            <FileText size={14} className="text-accent-light shrink-0" />
          ) : (
            <Bookmark size={14} className="text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-semibold text-ink-primary truncate">
            {isSnippet ? 'Snippet' : 'Bookmark'}
          </span>
        </div>
        <button 
          className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-400 transition-all"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <p className={`text-xs text-ink-secondary leading-relaxed ${isSnippet ? 'line-clamp-4' : ''}`}>
        {item.content}
      </p>

      {item.sourceUrl && (
        <a 
          href={item.sourceUrl} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-ink-muted hover:text-accent-light mt-2 transition-colors truncate max-w-full"
        >
          <ExternalLink size={10} className="shrink-0" />
          <span className="truncate">{item.sourceTitle || item.sourceUrl}</span>
        </a>
      )}

      {isSnippet && (
        <div className="mt-3 pt-2 border-t border-workspace-border flex justify-end">
           <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] h-6 px-2 text-ink-muted hover:text-accent-light"
            onClick={() => sendMessage(`Please summarize or explain this research snippet:\n\n${item.content}`)}
          >
            <Sparkles size={10} className="mr-1" /> Ask AI
          </Button>
        </div>
      )}
    </div>
  );
};

export const ResearchPanel: React.FC = () => {
  const { items, removeItem, addSnippet } = useResearchStore();
  const { setSplitMode, setLeftPaneContent } = useWorkspaceStore();
  const [draft, setDraft] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleClose = () => {
    setSplitMode(false);
    setLeftPaneContent(null);
  };

  const handleSaveDraft = () => {
    if (draft.trim()) {
      addSnippet(draft.trim());
      setDraft('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-workspace-bg border-r border-workspace-border flex-shrink-0">
      {/* ── Top Bar ── */}
      <div className="h-[48px] flex items-center justify-between px-3 border-b border-workspace-border flex-shrink-0 bg-workspace-surface">
        <div className="flex items-center gap-2">
          <Bookmark size={16} className="text-accent-light" />
          <span className="text-sm font-semibold text-ink-primary">Research</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip label="Close split" position="bottom">
            <Button variant="ghost" size="icon" className="!w-7 !h-7 text-ink-muted hover:text-red-400" onClick={handleClose}>
              <X size={14} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ── Quick Add ── */}
      <div className="p-3 border-b border-workspace-border bg-workspace-bg shrink-0">
        {!isAdding ? (
          <Button 
            variant="outline" 
            className="w-full text-xs text-ink-muted justify-start border-dashed"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAdding(true)}
          >
            Quick note or snippet
          </Button>
        ) : (
          <div className="bg-workspace-surface border border-accent/30 rounded-xl p-2 focus-within:ring-1 focus-within:ring-accent/20">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste research text here..."
              className="w-full bg-transparent text-xs text-ink-primary placeholder:text-ink-faint resize-none outline-none mb-2"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button variant="primary" size="sm" className="h-6 text-[10px]" onClick={handleSaveDraft} disabled={!draft.trim()}>Save Snippet</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Content List ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center fade-in">
            <div className="w-12 h-12 rounded-xl bg-workspace-surface border border-workspace-border flex items-center justify-center mb-3">
              <Bookmark size={20} className="text-ink-faint" />
            </div>
            <p className="text-sm font-medium text-ink-secondary">No research saved</p>
            <p className="text-xs text-ink-muted mt-1 max-w-[200px]">
              Save snippets and bookmarks to view them alongside your notes.
            </p>
          </div>
        ) : (
          items.map(item => <ResearchCard key={item.id} item={item} onRemove={removeItem} />)
        )}
      </div>
    </div>
  );
};
