/**
 * features/pdf/PdfViewer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight PDF viewer using the browser's native iframe capabilities.
 * Optimized for low memory usage on tablets.
 */

import React from 'react';
import { usePdfStore } from '@/store/usePdfStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { X, Sparkles, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

export const PdfViewer: React.FC = () => {
  const { pdfs, activePdfId } = usePdfStore();
  const { setSplitMode, setLeftPaneContent } = useWorkspaceStore();

  const activePdf = pdfs.find((p) => p.id === activePdfId);

  const handleClose = () => {
    setSplitMode(false);
    setLeftPaneContent(null);
  };

  if (!activePdf) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-ink-muted fade-in bg-workspace-bg">
        <p className="text-sm">No PDF selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-workspace-surface border-r border-workspace-border flex-shrink-0">
      {/* ── Top Bar ── */}
      <div className="h-[48px] flex items-center justify-between px-3 border-b border-workspace-border flex-shrink-0 bg-workspace-bg">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-ink-primary truncate max-w-[200px]">
            {activePdf.name}
          </span>
          <span className="text-[10px] text-ink-faint shrink-0">
            {(activePdf.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Tooltip label="Analyze with AI (Coming soon)" position="bottom">
            <Button variant="ghost" size="icon" className="!w-7 !h-7 text-accent-light">
              <Sparkles size={14} />
            </Button>
          </Tooltip>
          <Tooltip label="Expand" position="bottom">
            <Button variant="ghost" size="icon" className="!w-7 !h-7 text-ink-muted">
              <Maximize2 size={14} />
            </Button>
          </Tooltip>
          <div className="w-px h-4 bg-workspace-border mx-1" />
          <Tooltip label="Close split" position="bottom">
            <Button variant="ghost" size="icon" className="!w-7 !h-7 text-ink-muted hover:text-red-400" onClick={handleClose}>
              <X size={14} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ── Native PDF Viewer ── */}
      <div className="flex-1 bg-[#525659]">
        <iframe
          src={`${activePdf.url}#toolbar=0`}
          className="w-full h-full border-none"
          title={activePdf.name}
        />
      </div>
    </div>
  );
};
