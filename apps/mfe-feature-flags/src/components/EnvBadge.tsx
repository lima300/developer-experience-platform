import { Badge } from '@dxp/ui';

import type { Environment } from '../types/flag.js';

interface EnvBadgeProps {
  env: Environment;
  enabled: boolean;
}

export function EnvBadge({ env, enabled }: EnvBadgeProps) {
  return <Badge variant={enabled ? 'success' : 'default'}>{env.toUpperCase()}</Badge>;
}
