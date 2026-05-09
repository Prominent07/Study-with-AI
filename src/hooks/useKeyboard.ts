/**
 * hooks/useKeyboard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers keyboard shortcuts for the workspace.
 * Currently wires up sidebar and AI panel toggles.
 *
 * Future shortcuts (Cmd+K for command palette, etc.) go here.
 */

import { useEffect } from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';

export function useKeyboard(): void {
  const { toggleSidebar, toggleAIPanel } = useLayoutStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + B → toggle sidebar
      if (ctrl && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }

      // Ctrl/Cmd + J → toggle AI panel
      if (ctrl && e.key === 'j') {
        e.preventDefault();
        toggleAIPanel();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar, toggleAIPanel]);
}
