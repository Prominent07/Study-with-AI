/**
 * components/ui/Tooltip.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight CSS-only tooltip. No JS dependency, low overhead on low-RAM devices.
 * Wraps children and shows a tooltip label on hover.
 *
 * Position: 'top' | 'bottom' | 'left' | 'right'
 */

import React from 'react';

interface TooltipProps {
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

const positionClasses = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export const Tooltip: React.FC<TooltipProps> = ({
  label,
  position = 'top',
  children,
  className = '',
}) => {
  return (
    <div className={`relative group inline-flex ${className}`}>
      {children}
      <span
        className={[
          'absolute z-50 pointer-events-none',
          'px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap',
          'bg-workspace-raised border border-workspace-border text-ink-secondary',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          positionClasses[position],
        ].join(' ')}
      >
        {label}
      </span>
    </div>
  );
};
