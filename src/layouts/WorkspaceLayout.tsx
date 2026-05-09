/**
 * layouts/WorkspaceLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root layout shell for the three-panel workspace:
 *
 *   ┌─────────────────────────────────────────────────┐
 *   │  [Sidebar] │ [Main Editor (flex-1)] │ [AIPanel] │
 *   └─────────────────────────────────────────────────┘
 *
 * Responsive behavior:
 *   - Tablet (< 1024px):  AI panel hidden, accessible via toggle button
 *   - Mobile  (< 768px):  Sidebar overlays as a drawer, AI panel hidden
 *
 * Panel toggles are driven by useLayoutStore (Zustand).
 * Keyboard shortcuts are registered via useKeyboard hook.
 */

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PanelRight, Menu, X } from 'lucide-react';

import { Sidebar } from '@/features/sidebar/Sidebar';
import { AIPanel } from '@/features/ai-panel/AIPanel';
import { PdfViewer } from '@/features/pdf/PdfViewer';
import { ResearchPanel } from '@/features/research/ResearchPanel';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

export const WorkspaceLayout: React.FC = () => {
  // Register keyboard shortcuts
  useKeyboard();

  const { sidebarOpen, aiPanelOpen, toggleSidebar, toggleAIPanel, setSidebarOpen, setAIPanelOpen } =
    useLayoutStore();
  const { isSplitMode, leftPaneContent } = useWorkspaceStore();

  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-adjust panels on breakpoint changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setAIPanelOpen(false);
    } else if (isTablet) {
      setAIPanelOpen(false);
    }
  }, [isMobile, isTablet, setSidebarOpen, setAIPanelOpen]);

  return (
    <div className="flex w-full overflow-hidden bg-workspace-bg" style={{ height: '100dvh' }}>

      {/* ── Mobile sidebar overlay backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Left Sidebar ── */}
      <div
        className={[
          'flex-shrink-0 h-full z-40 transition-all duration-250 ease-in-out',
          isMobile
            ? `fixed left-0 top-0 ${sidebarOpen ? 'translate-x-0 shadow-panel' : '-translate-x-full'}`
            : sidebarOpen ? 'relative' : 'hidden',
        ].join(' ')}
      >
        <Sidebar />
      </div>

      {/* ── Main Content Column ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar (mobile + tablet) */}
        {(isMobile || (!sidebarOpen && !isMobile)) && (
          <div className="h-[52px] flex items-center gap-2 px-3 border-b border-workspace-border bg-workspace-surface flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              className="!w-8 !h-8 text-ink-muted hover:text-ink-primary"
            >
              {isMobile && sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <span className="text-sm font-semibold text-ink-primary">StudyAI</span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* AI panel toggle on tablet */}
            {!isMobile && (
              <Tooltip label="Toggle AI panel (⌘J)" position="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAIPanel}
                  aria-label="Toggle AI panel"
                  className={`!w-8 !h-8 ${aiPanelOpen ? 'text-accent-light' : 'text-ink-muted'}`}
                >
                  <PanelRight size={18} />
                </Button>
              </Tooltip>
            )}
          </div>
        )}

        {/* Editor fills remaining height */}
        <div className="flex-1 overflow-hidden">
          {isSplitMode && leftPaneContent && !isMobile ? (
            <PanelGroup direction="horizontal" autoSaveId="studyai-split-layout">
              <Panel defaultSize={50} minSize={20} className="h-full">
                {leftPaneContent === 'pdf' ? <PdfViewer /> : <ResearchPanel />}
              </Panel>
              
              <PanelResizeHandle className="w-1.5 bg-workspace-border hover:bg-accent/50 transition-colors cursor-col-resize z-10 flex flex-col justify-center items-center">
                <div className="w-0.5 h-8 bg-workspace-raised rounded-full" />
              </PanelResizeHandle>
              
              <Panel defaultSize={50} minSize={20} className="h-full">
                <Outlet />
              </Panel>
            </PanelGroup>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      {/* ── Right AI Panel ── */}
      {/* On desktop: always rendered, visibility controlled by width/hidden */}
      {/* On tablet/mobile: hidden unless toggled */}
      {!isMobile && (
        <div
          className={[
            'flex-shrink-0 h-full transition-all duration-250 ease-in-out overflow-hidden',
            aiPanelOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0',
          ].join(' ')}
        >
          {aiPanelOpen && <AIPanel />}
        </div>
      )}

      {/* Mobile AI Panel — bottom sheet style */}
      {isMobile && aiPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/60"
            onClick={() => setAIPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-workspace-surface border-t border-workspace-border rounded-t-2xl overflow-hidden slide-in-right" style={{ height: '70dvh' }}>
            <AIPanel />
          </div>
        </>
      )}

      {/* ── Desktop: Sidebar toggle when closed + AI toggle ── */}
      {!isMobile && !isTablet && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-20">
          {!aiPanelOpen && (
            <Tooltip label="Open AI panel (⌘J)" position="left">
              <Button
                variant="primary"
                size="icon"
                onClick={toggleAIPanel}
                aria-label="Open AI panel"
                className="shadow-accent"
              >
                <PanelRight size={18} />
              </Button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};
