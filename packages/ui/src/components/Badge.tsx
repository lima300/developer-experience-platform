import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/cn.js';

import type { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-dxp-surface-elevated text-dxp-muted-foreground',
        success: 'bg-dxp-success/10 text-dxp-success',
        warning: 'bg-dxp-warning/10 text-dxp-warning',
        destructive: 'bg-dxp-destructive/10 text-dxp-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
