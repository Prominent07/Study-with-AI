/**
 * pages/CanvasPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Infinite canvas workspace powered by Tldraw.
 * Provides a sidebar to manage multiple boards and loads the CanvasEditor.
 */

import React, { Suspense, useState } from 'react';
import { PenSquare, Plus, FileText, Trash2, MoreVertical, Search, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Input } from '@/components/ui/Input';

// Lazy load the editor to keep bundle size small
const CanvasEditor = React.lazy(() => import('@/features/canvas/CanvasEditor'));

const CanvasPage: React.FC = () => {
  const { boards, activeBoardId, createBoard, setActiveBoard, deleteBoard, renameBoard } = useCanvasStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeBoard = boards.find(b => b.id === activeBoardId);

  const filteredBoards = boards.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    createBoard('Untitled Board');
  };

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) {
      renameBoard(editingId, editName);
    }
    setEditingId(null);
  };

  return (
    <div className="h-full flex bg-workspace-bg">
      {/* ── Canvas Sidebar ── */}
      <div className="w-[260px] flex-shrink-0 h-full border-r border-workspace-border bg-workspace-surface flex flex-col">
        <div className="px-3 pt-3 pb-2 flex-shrink-0 border-b border-workspace-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Whiteboards</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreate}
              aria-label="New whiteboard"
              className="!w-6 !h-6 text-ink-muted hover:text-accent-light"
            >
              <Plus size={13} />
            </Button>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            <input
              type="text"
              placeholder="Search boards…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-workspace-raised border border-workspace-border rounded-md pl-7 pr-2 py-1.5 text-xs text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <PenSquare size={24} className="text-ink-faint" />
              <p className="text-xs text-ink-muted">No boards found</p>
            </div>
          ) : (
            filteredBoards.map(board => (
              <div
                key={board.id}
                onClick={() => setActiveBoard(board.id)}
                className={`relative group px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 border border-transparent flex items-center justify-between ${
                  activeBoardId === board.id
                    ? 'bg-workspace-raised border-workspace-border shadow-card'
                    : 'hover:bg-workspace-hover hover:border-workspace-border'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <PenSquare size={14} className={activeBoardId === board.id ? 'text-accent-light' : 'text-ink-faint'} />
                  {editingId === board.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={e => e.key === 'Enter' && finishRename()}
                      className="bg-transparent text-xs text-ink-primary outline-none border-b border-accent/50 w-full"
                    />
                  ) : (
                    <span className={`text-xs font-medium truncate ${activeBoardId === board.id ? 'text-accent-light' : 'text-ink-secondary'}`}>
                      {board.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => startRename(board.id, board.name, e)} className="p-1 text-ink-muted hover:text-ink-primary rounded hover:bg-workspace-border">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }} className="p-1 text-ink-muted hover:text-red-400 rounded hover:bg-red-500/10">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <div className="flex-1 h-full relative">
        {activeBoardId ? (
          <Suspense fallback={
            <div className="flex h-full items-center justify-center bg-workspace-bg">
              <span className="text-ink-muted text-sm">Loading Canvas...</span>
            </div>
          }>
            <CanvasEditor boardId={activeBoardId} />
          </Suspense>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-workspace-bg">
            <div className="w-16 h-16 rounded-2xl bg-workspace-surface border border-workspace-border flex items-center justify-center mb-4 shadow-panel">
              <PenSquare size={28} className="text-ink-faint" />
            </div>
            <h2 className="text-lg font-semibold text-ink-primary mb-2">Infinite Canvas</h2>
            <p className="text-sm text-ink-muted mb-6 max-w-sm text-center">
              Select a whiteboard from the sidebar or create a new one to start brainstorming.
            </p>
            <Button variant="primary" onClick={handleCreate} leftIcon={<Plus size={16} />}>
              Create Whiteboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasPage;
