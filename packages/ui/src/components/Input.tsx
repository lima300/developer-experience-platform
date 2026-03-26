import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error ?? false}
      className={cn(
        'flex h-9 w-full rounded-dxp border border-dxp-border bg-dxp-surface px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-dxp-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dxp-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-dxp-destructive focus-visible:ring-dxp-destructive',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
