/**
 * components/ui/Button.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable button with variant and size support.
 *
 * Variants:
 *   primary  — filled violet accent (CTAs)
 *   ghost    — transparent with hover fill (toolbar actions)
 *   outline  — bordered transparent (secondary actions)
 *   danger   — red-toned (destructive actions)
 *
 * Sizes: sm | md | lg
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-accent/20',
  ghost:
    'text-ink-secondary hover:text-ink-primary hover:bg-workspace-hover',
  outline:
    'border border-workspace-border text-ink-secondary hover:border-accent/50 hover:text-ink-primary bg-transparent',
  danger:
    'text-red-400 hover:text-red-300 hover:bg-red-500/10',
};

const sizeClasses: Record<Size, string> = {
  sm:   'h-7 px-3 text-xs gap-1.5 rounded-md',
  md:   'h-9 px-4 text-sm gap-2 rounded-lg',
  lg:   'h-11 px-5 text-base gap-2 rounded-lg',
  icon: 'h-9 w-9 p-0 rounded-lg justify-center',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        // Base
        'inline-flex items-center font-medium transition-colors duration-200',
        'select-none cursor-pointer focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        // Variant + size
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {rightIcon && !loading && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
