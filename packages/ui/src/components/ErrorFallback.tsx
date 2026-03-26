import { cn } from '../lib/cn.js';

import { Button } from './Button.js';

import type { HTMLAttributes } from 'react';

export interface ErrorFallbackProps extends HTMLAttributes<HTMLDivElement> {
  error?: Error | unknown;
  mfeName?: string;
  onRetry?: () => void;
}

export function ErrorFallback({
  className,
  error,
  mfeName,
  onRetry,
  ...props
}: ErrorFallbackProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-dxp border border-dxp-destructive/30 bg-dxp-destructive/5 p-8 text-center',
        className,
      )}
      {...props}
    >
      <p className="text-sm font-semibold text-dxp-destructive">
        {mfeName ? `Failed to load: ${mfeName}` : 'Something went wrong'}
      </p>
      <p className="max-w-xs text-xs text-dxp-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
