/**
 * store/useLayoutStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Controls the three-panel workspace layout state:
 *   - Sidebar open / collapsed
 *   - AI panel open / closed
 *
 * This store is the single source of truth for all panel visibility,
 * making it easy to add panel persistence, keyboard shortcuts, or
 * drag-to-resize in the future.
 */

import { create } from 'zustand';
import type { LayoutState } from '@/types';

interface LayoutStore extends LayoutState {
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  sidebarOpen: true,       // Sidebar visible by default on tablets
  sidebarCollapsed: false, // Full width (not icon-only) by default
  aiPanelOpen: true,       // AI panel visible by default

  // ── Actions ────────────────────────────────────────────────────────────────
  toggleSidebar: () =>
    set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  toggleSidebarCollapsed: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toggleAIPanel: () =>
    set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),

  setAIPanelOpen: (open) =>
    set({ aiPanelOpen: open }),
}));
