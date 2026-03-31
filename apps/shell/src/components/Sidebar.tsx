import { useAuth } from '@dxp/auth-context';
import { cn } from '@dxp/ui';
import { NavLink } from 'react-router-dom';

import type { MFEManifest } from '@dxp/federation-contracts';

interface SidebarProps {
  mfes: MFEManifest[];
}

const MFE_ICONS: Record<string, string> = {
  featureFlags: '⚑',
  experiments: '⚗',
  logs: '📋',
  apiExplorer: '🔌',
  docs: '📚',
};

/** Convert camelCase to Title Case: "featureFlags" → "Feature Flags" */
function toTitleCase(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function Sidebar({ mfes }: SidebarProps) {
  const { roles } = useAuth();

  const visible = mfes.filter((m) => m.enabled && m.permissions.some((p) => roles.includes(p)));

  return (
    <nav className="flex flex-col gap-1 p-2 flex-1">
      {visible.map((mfe) => (
        <NavLink
          key={mfe.name}
          to={mfe.route}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-dxp-muted-foreground hover:bg-dxp-muted hover:text-gray-900 dark:hover:text-white',
              isActive &&
                'bg-dxp-primary/10 text-dxp-primary hover:bg-dxp-primary/15 hover:text-dxp-primary',
            )
          }
        >
          <span className="text-base leading-none" aria-hidden>
            {MFE_ICONS[mfe.name] ?? '▪'}
          </span>
          <span>{toTitleCase(mfe.name)}</span>
        </NavLink>
      ))}

      {visible.length === 0 && (
        <p className="px-3 py-2 text-xs text-dxp-muted-foreground">
          No applications available for your role.
        </p>
      )}
    </nav>
  );
}
