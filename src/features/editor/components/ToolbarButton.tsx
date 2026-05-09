/**
 * features/editor/components/ToolbarButton.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Atomic toolbar button — reusable unit for all toolbar actions.
 *
 * Props:
 *   isActive  — highlights button when format is applied at cursor
 *   disabled  — grayed when editor is not ready
 *   tooltip   — shown on hover (CSS-only via Tooltip component)
 */

import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
  className = '',
}) => {
  return (
    <Tooltip label={tooltip} position="bottom">
      <button
        onMouseDown={(e) => {
          // Prevent editor focus loss on toolbar click
          e.preventDefault();
          onClick();
        }}
        disabled={disabled}
        aria-label={tooltip}
        aria-pressed={isActive}
        className={[
          'flex items-center justify-center w-8 h-8 rounded-md text-sm',
          'transition-colors duration-150 select-none',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          isActive
            ? 'bg-accent/20 text-accent-light'
            : 'text-ink-muted hover:text-ink-primary hover:bg-workspace-hover',
          className,
        ].join(' ')}
      >
        {children}
      </button>
    </Tooltip>
  );
};
