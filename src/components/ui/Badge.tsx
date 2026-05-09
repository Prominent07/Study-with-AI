/**
 * components/ui/Badge.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Small colored tag/label used for note categories, status indicators, etc.
 */

import React from 'react';

interface BadgeProps {
  label: string;
  color?: string;       // Hex or CSS color for the badge accent (optional)
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = '#a78bfa',
  className = '',
}) => {
  const safeColor = color ?? '#a78bfa';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        color: safeColor,
        backgroundColor: `${safeColor}18`,
        border: `1px solid ${safeColor}30`,
      }}
    >
      {label}
    </span>
  );
};
