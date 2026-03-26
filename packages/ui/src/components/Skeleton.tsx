import { cn } from '../lib/cn.js';

import type { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-dxp bg-dxp-surface-elevated', className)}
      {...props}
    />
  );
}
