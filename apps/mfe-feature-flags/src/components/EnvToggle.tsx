import { Button } from '@dxp/ui';

import { useToggleEnv } from '../api/flags.hooks.js';

import { EnvBadge } from './EnvBadge.js';

import type { Environment } from '../types/flag.js';

interface EnvToggleProps {
  flagId: string;
  env: Environment;
  enabled: boolean;
}

export function EnvToggle({ flagId, env, enabled }: EnvToggleProps) {
  const toggle = useToggleEnv();
  const isPending =
    toggle.isPending && toggle.variables?.id === flagId && toggle.variables.env === env;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => toggle.mutate({ id: flagId, env })}
      aria-label={`Toggle ${env} environment for flag`}
      className="gap-1.5"
    >
      {isPending ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-dxp-primary border-t-transparent" />
      ) : (
        <EnvBadge env={env} enabled={enabled} />
      )}
    </Button>
  );
}
