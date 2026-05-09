/**
 * features/sidebar/Sidebar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Left sidebar panel containing:
 *   - App logo + title
 *   - Global search bar
 *   - Primary navigation
 *   - Recent notes section
 *   - Collapse toggle
 *
 * Responds to `sidebarCollapsed` from useLayoutStore to switch between
 * full-width and icon-only modes (useful on smaller tablets).
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  FileText,
  Microscope,
  FileArchive,
  Zap,
  PenSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Brain,
} from 'lucide-react';

import { useLayoutStore } from '@/store/useLayoutStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useNoteStore } from '@/store/useNoteStore';
import { useTabStore } from '@/store/useTabStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import type { NavItem } from '@/types';

// ── Nav item definitions ──────────────────────────────────────────────────────
const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; path: string }[] = [
  { id: 'notes',      label: 'Notes',      icon: <FileText size={18} />,    path: '/notes'      },
  { id: 'research',   label: 'Research',   icon: <Microscope size={18} />,  path: '/research'   },
  { id: 'pdfs',       label: 'PDFs',       icon: <FileArchive size={18} />, path: '/pdfs'       },
  { id: 'flashcards', label: 'Flashcards', icon: <Zap size={18} />,        path: '/flashcards' },
  { id: 'canvas',     label: 'Canvas',     icon: <PenSquare size={18} />,   path: '/canvas'     },
];

// ── Relative time formatter ────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { sidebarCollapsed, toggleSidebarCollapsed } = useLayoutStore();
  const { searchQuery, setSearchQuery } = useWorkspaceStore();
  const { getRecentNotes, createNote } = useNoteStore();
  const { openTab } = useTabStore();
  const recentNotes = getRecentNotes();

  const handleNewNote = () => {
    const id = createNote(null);
    openTab(id, '');
    navigate('/notes');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const width = sidebarCollapsed ? 'w-[68px]' : 'w-[260px]';

  return (
    <aside
      className={[
        'panel h-full flex-shrink-0 transition-all duration-250 ease-in-out',
        width,
        'border-r border-workspace-border',
      ].join(' ')}
      aria-label="Main navigation"
    >
      {/* ── Header: Logo + Collapse Toggle ── */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3 border-b border-workspace-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Brain size={16} className="text-accent-light" />
            </div>
            <span className="text-sm font-semibold text-ink-primary tracking-tight">
              StudyAI
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center mx-auto">
            <Brain size={16} className="text-accent-light" />
          </div>
        )}
        {!sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapsed}
            aria-label="Collapse sidebar"
            className="text-ink-muted hover:text-ink-primary !w-7 !h-7"
          >
            <ChevronLeft size={15} />
          </Button>
        )}
      </div>

      {/* ── Search ── */}
      {!sidebarCollapsed ? (
        <div className="px-3 py-3">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={<Search size={14} />}
            aria-label="Search workspace"
          />
        </div>
      ) : (
        <div className="px-3 py-3 flex justify-center">
          <Tooltip label="Search" position="right">
            <Button variant="ghost" size="icon" className="!w-8 !h-8">
              <Search size={16} className="text-ink-muted" />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* ── New Note Button ── */}
      <div className={`px-3 pb-2 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        {sidebarCollapsed ? (
          <Tooltip label="New Note" position="right">
            <Button
              variant="outline"
              size="icon"
              className="!w-8 !h-8"
              onClick={handleNewNote}
            >
              <Plus size={16} />
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            className="w-full justify-center"
            onClick={handleNewNote}
          >
            New Note
          </Button>
        )}
      </div>


      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="px-2 py-1 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
            Workspace
          </p>
        )}

        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.id}>
                {sidebarCollapsed ? (
                  <Tooltip label={item.label} position="right">
                    <button
                      onClick={() => navigate(item.path)}
                      aria-current={active ? 'page' : undefined}
                      className={`nav-item w-full justify-center px-0 py-2.5 ${active ? 'active' : ''}`}
                    >
                      {item.icon}
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => navigate(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`nav-item w-full ${active ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Recent Notes ── */}
        {!sidebarCollapsed && (
          <div className="mt-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Recent
              </p>
              <Clock size={12} className="text-ink-faint" />
            </div>
            <ul className="space-y-0.5">
              {recentNotes.slice(0, 5).map((note) => (
                <li key={note.id}>
                  <button
                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-workspace-hover transition-colors duration-200 group"
                    onClick={() => {
                      useNoteStore.getState().setActiveNoteId(note.id);
                      openTab(note.id, note.title);
                      navigate('/notes');
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BookOpen size={12} className="text-ink-faint shrink-0 mt-0.5" />
                        <span className="text-xs text-ink-secondary truncate group-hover:text-ink-primary transition-colors">
                          {note.title}
                        </span>
                      </div>
                      {note.tag && (
                        <Badge
                          label={note.tag}
                          color={note.tagColor}
                          className="shrink-0 text-[10px]"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 ml-4 truncate">
                      {relativeTime(note.updatedAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* ── Footer: Settings + Expand Toggle ── */}
      <div className="px-2 py-3 border-t border-workspace-border space-y-0.5">
        {sidebarCollapsed ? (
          <>
            <Tooltip label="Settings" position="right">
              <button
                onClick={() => navigate('/settings')}
                className={`nav-item w-full justify-center px-0 ${isActive('/settings') ? 'active' : ''}`}
              >
                <Settings size={18} />
              </button>
            </Tooltip>
            <Tooltip label="Expand sidebar" position="right">
              <button
                onClick={toggleSidebarCollapsed}
                className="nav-item w-full justify-center px-0"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            </Tooltip>
          </>
        ) : (
          <button
            onClick={() => navigate('/settings')}
            className={`nav-item w-full ${isActive('/settings') ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        )}
      </div>
    </aside>
  );
};
