/**
 * features/editor/components/NoteList.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Left panel within the Notes page.
 *
 * Structure:
 *   [Search bar]
 *   [+ New Note]
 *   ──────────────
 *   ▼ General (3)
 *     • Note 1
 *     • Note 2
 *   ▶ DSA (0)
 *   ▼ Research (1)
 *     • Note 3
 *   ──────────────
 *   ▼ Uncategorized
 *     • Note 4
 *   ──────────────
 *   + New Folder
 *
 * When searching, folders collapse and all matching notes show flat.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Search, FileText, Pin, Trash2, MoreVertical,
  ChevronRight, Folder as FolderIcon, FolderPlus, X,
} from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import { useFolderStore } from '@/store/useFolderStore';
import { useTabStore } from '@/store/useTabStore';
import { Button } from '@/components/ui/Button';
import type { NoteDocument, Folder } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Note Item ─────────────────────────────────────────────────────────────────

interface NoteItemProps {
  note: NoteDocument;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin: (pinned: boolean) => void;
  onMoveToFolder: (folderId: string | null) => void;
  folders: Folder[];
}

const NoteItem: React.FC<NoteItemProps> = ({
  note, isActive, onSelect, onDelete, onPin, onMoveToFolder, folders,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={[
        'relative group px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150',
        'border border-transparent',
        isActive
          ? 'bg-workspace-raised border-workspace-border shadow-card'
          : 'hover:bg-workspace-hover hover:border-workspace-border',
      ].join(' ')}
    >
      <div className="flex items-start gap-1.5 pr-5">
        <FileText
          size={12}
          className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-accent-light' : 'text-ink-faint'}`}
        />
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium truncate leading-snug ${isActive ? 'text-accent-light' : 'text-ink-secondary'}`}>
            {note.title || 'Untitled Note'}
          </p>
          {note.excerpt && (
            <p className="text-[11px] text-ink-muted mt-0.5 truncate leading-relaxed">
              {note.excerpt}
            </p>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            {note.isPinned && <Pin size={9} className="text-accent-light" />}
            <span className="text-[10px] text-ink-faint">{relativeTime(note.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Context menu trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-ink-muted hover:text-ink-primary hover:bg-workspace-border opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Note options"
      >
        <MoreVertical size={11} />
      </button>

      {/* Context menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-1 top-7 z-30 bg-workspace-raised border border-workspace-border rounded-lg shadow-panel py-1 w-40"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onPin(!note.isPinned); setShowMenu(false); }}
            className="w-full text-left px-2.5 py-1.5 text-xs text-ink-secondary hover:text-ink-primary hover:bg-workspace-hover flex items-center gap-2"
          >
            <Pin size={11} /> {note.isPinned ? 'Unpin' : 'Pin to top'}
          </button>

          {/* Move to folder submenu */}
          {folders.length > 0 && (
            <>
              <div className="border-t border-workspace-border my-1" />
              <p className="px-2.5 py-1 text-[10px] text-ink-faint uppercase tracking-wide">Move to</p>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={(e) => { e.stopPropagation(); onMoveToFolder(f.id); setShowMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 hover:bg-workspace-hover ${
                    note.folderId === f.id ? 'text-accent-light' : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                  {f.name}
                </button>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); onMoveToFolder(null); setShowMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-ink-secondary hover:text-ink-primary hover:bg-workspace-hover flex items-center gap-2"
              >
                <FolderIcon size={11} /> Uncategorized
              </button>
            </>
          )}

          <div className="border-t border-workspace-border my-1" />
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
            className="w-full text-left px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ── Folder Section ────────────────────────────────────────────────────────────

interface FolderSectionProps {
  folder: Folder | null;  // null = Uncategorized
  notes: NoteDocument[];
  activeNoteId: string | null;
  folders: Folder[];
  onNoteSelect: (note: NoteDocument) => void;
  onNoteDelete: (id: string) => void;
  onNotePin: (id: string, pinned: boolean) => void;
  onNoteMove: (id: string, folderId: string | null) => void;
  onFolderRename?: (id: string) => void;
  onFolderDelete?: (id: string) => void;
}

const FolderSection: React.FC<FolderSectionProps> = ({
  folder, notes, activeNoteId, folders,
  onNoteSelect, onNoteDelete, onNotePin, onNoteMove,
  onFolderRename, onFolderDelete,
}) => {
  const { toggleFolderExpanded } = useFolderStore();
  const isExpanded = folder ? (folder.isExpanded ?? true) : true;
  const [collapsed, setCollapsed] = useState(!isExpanded);

  const toggle = () => {
    if (folder) toggleFolderExpanded(folder.id);
    setCollapsed((p) => !p);
  };

  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const folderColor = folder?.color ?? '#64748b';
  const folderName = folder?.name ?? 'Uncategorized';

  return (
    <div className="mb-1">
      {/* Folder header */}
      <div
        className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group hover:bg-workspace-hover"
        onClick={toggle}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <ChevronRight
            size={12}
            className={`flex-shrink-0 text-ink-faint transition-transform duration-150 ${collapsed ? '' : 'rotate-90'}`}
          />
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: folderColor }} />
          <span className="text-xs font-medium text-ink-muted truncate">{folderName}</span>
          <span className="text-[10px] text-ink-faint ml-0.5">({notes.length})</span>
        </div>

        {/* Folder actions (non-default folders) */}
        {folder && onFolderDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onFolderDelete(folder.id); }}
            className="w-4 h-4 flex items-center justify-center text-ink-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete folder"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Notes inside folder */}
      {!collapsed && (
        <div className="ml-4 space-y-0.5">
          {sorted.length === 0 ? (
            <p className="text-[11px] text-ink-faint px-2 py-1.5 italic">Empty folder</p>
          ) : (
            sorted.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onSelect={() => onNoteSelect(note)}
                onDelete={() => onNoteDelete(note.id)}
                onPin={(pinned) => onNotePin(note.id, pinned)}
                onMoveToFolder={(folderId) => onNoteMove(note.id, folderId)}
                folders={folders}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── New Folder Input ──────────────────────────────────────────────────────────

const NewFolderInput: React.FC<{ onConfirm: (name: string) => void; onCancel: () => void }> = ({
  onConfirm, onCancel,
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex items-center gap-1 px-2 py-1.5">
      <FolderIcon size={12} className="text-ink-faint flex-shrink-0" />
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirm(name);
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={() => { if (name.trim()) onConfirm(name); else onCancel(); }}
        placeholder="Folder name…"
        className="flex-1 bg-transparent text-xs text-ink-primary placeholder:text-ink-faint outline-none border-b border-accent/50"
        maxLength={40}
      />
    </div>
  );
};

// ── Main NoteList ─────────────────────────────────────────────────────────────

export const NoteList: React.FC = () => {
  const {
    notes, activeNoteId,
    createNote, deleteNote, setActiveNoteId, pinNote, moveNoteToFolder,
  } = useNoteStore();
  const { folders, createFolder, deleteFolder, getRootFolders } = useFolderStore();
  const { openTab } = useTabStore();

  const [search, setSearch] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const rootFolders = getRootFolders();

  // ── Search: flat list across all folders ──────────────────────────────────
  const searchResults = search.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.excerpt.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  // ── Note selection: opens tab + sets active ────────────────────────────────
  const handleNoteSelect = (note: NoteDocument) => {
    setActiveNoteId(note.id);
    openTab(note.id, note.title);
  };

  // ── Create note in folder ──────────────────────────────────────────────────
  const handleCreateNote = (folderId?: string | null) => {
    const id = createNote(folderId ?? null);
    openTab(id, '');
  };

  return (
    <div className="w-[260px] flex-shrink-0 h-full border-r border-workspace-border bg-workspace-surface flex flex-col">

      {/* ── Header ── */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0 border-b border-workspace-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Notes</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCreateNote(null)}
            aria-label="New note"
            className="!w-6 !h-6 text-ink-muted hover:text-accent-light"
          >
            <Plus size={13} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes"
            className="w-full bg-workspace-raised border border-workspace-border rounded-md pl-7 pr-2 py-1.5 text-xs text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── Note list body ── */}
      <div className="flex-1 overflow-y-auto px-2 py-2">

        {/* Search results — flat list */}
        {searchResults !== null ? (
          searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Search size={24} className="text-ink-faint" />
              <p className="text-xs text-ink-muted">No notes found</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {searchResults.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={note.id === activeNoteId}
                  onSelect={() => handleNoteSelect(note)}
                  onDelete={() => deleteNote(note.id)}
                  onPin={(pinned) => pinNote(note.id, pinned)}
                  onMoveToFolder={(folderId) => moveNoteToFolder(note.id, folderId)}
                  folders={folders}
                />
              ))}
            </div>
          )
        ) : (
          <>
            {/* Folder sections */}
            {rootFolders.map((folder) => {
              const folderNotes = notes.filter((n) => n.folderId === folder.id);
              return (
                <FolderSection
                  key={folder.id}
                  folder={folder}
                  notes={folderNotes}
                  activeNoteId={activeNoteId}
                  folders={folders}
                  onNoteSelect={handleNoteSelect}
                  onNoteDelete={deleteNote}
                  onNotePin={(id, pinned) => pinNote(id, pinned)}
                  onNoteMove={(id, folderId) => moveNoteToFolder(id, folderId)}
                  onFolderDelete={(id) => deleteFolder(id)}
                />
              );
            })}

            {/* Uncategorized */}
            {(() => {
              const uncategorized = notes.filter((n) => n.folderId === null);
              if (uncategorized.length === 0 && rootFolders.length > 0) return null;
              return (
                <FolderSection
                  folder={null}
                  notes={uncategorized}
                  activeNoteId={activeNoteId}
                  folders={folders}
                  onNoteSelect={handleNoteSelect}
                  onNoteDelete={deleteNote}
                  onNotePin={(id, pinned) => pinNote(id, pinned)}
                  onNoteMove={(id, folderId) => moveNoteToFolder(id, folderId)}
                />
              );
            })()}

            {/* Empty state */}
            {notes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-36 gap-3 mt-4">
                <FileText size={28} className="text-ink-faint" />
                <p className="text-xs text-ink-muted text-center leading-relaxed">
                  No notes yet.<br />Create your first note!
                </p>
                <Button variant="outline" size="sm" onClick={() => handleCreateNote(null)} leftIcon={<Plus size={12} />}>
                  New Note
                </Button>
              </div>
            )}

            {/* New folder input */}
            {isAddingFolder && (
              <NewFolderInput
                onConfirm={(name) => { createFolder(name); setIsAddingFolder(false); }}
                onCancel={() => setIsAddingFolder(false)}
              />
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-2 border-t border-workspace-border flex items-center justify-between flex-shrink-0">
        <p className="text-[11px] text-ink-faint">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>
        <button
          onClick={() => setIsAddingFolder(true)}
          className="flex items-center gap-1 text-[11px] text-ink-faint hover:text-ink-secondary transition-colors"
          aria-label="New folder"
        >
          <FolderPlus size={11} />
          Folder
        </button>
      </div>
    </div>
  );
};
