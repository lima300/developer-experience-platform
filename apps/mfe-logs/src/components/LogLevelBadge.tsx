import { Badge } from '@dxp/ui';
import React from 'react';

import type { LogLevel } from '../types/log.js';

interface LogLevelBadgeProps {
  level: LogLevel;
}

const LEVEL_VARIANT: Record<LogLevel, 'destructive' | 'warning' | 'default'> = {
  ERROR: 'destructive',
  WARN: 'warning',
  INFO: 'default',
  DEBUG: 'default',
};

export function LogLevelBadge({ level }: LogLevelBadgeProps) {
  return (
    <Badge
      variant={LEVEL_VARIANT[level]}
      className={level === 'DEBUG' ? 'text-dxp-muted-foreground' : undefined}
    >
      {level}
    </Badge>
  );
}
