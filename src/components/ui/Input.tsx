/**
 * components/ui/Input.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dark-themed text input with optional leading icon.
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  leadingIcon,
  trailingIcon,
  containerClassName = '',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      {leadingIcon && (
        <span className="absolute left-3 text-ink-muted pointer-events-none flex items-center">
          {leadingIcon}
        </span>
      )}
      <input
        className={[
          'input-base',
          leadingIcon ? 'pl-9' : '',
          trailingIcon ? 'pr-9' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {trailingIcon && (
        <span className="absolute right-3 text-ink-muted flex items-center">
          {trailingIcon}
        </span>
      )}
    </div>
  );
};
