import { useAuth } from '@dxp/auth-context';
import { cn } from '@dxp/ui';
import { NavLink } from 'react-router-dom';

import { ChevronRightIcon, GridIcon, MFE_ICON_MAP, PanelLeftIcon } from './Icons.js';

import type { MFEManifest } from '@dxp/federation-contracts';

interface SidebarProps {
  mfes: MFEManifest[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/** Convert camelCase to Title Case: "featureFlags" → "Feature Flags" */
function toTitleCase(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function Sidebar({ mfes, collapsed, onToggleCollapse }: SidebarProps) {
  const { roles } = useAuth();

  const visible = mfes.filter((m) => m.enabled && m.permissions.some((p) => roles.includes(p)));

  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {!collapsed && (
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-dxp-muted-foreground/70">
            Hubs
          </p>
        )}

        {visible.map((mfe) => {
          const IconComponent = MFE_ICON_MAP[mfe.name] ?? GridIcon;
          return (
            <NavLink
              key={mfe.name}
              to={mfe.route}
              title={collapsed ? toTitleCase(mfe.name) : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center rounded-md text-sm font-medium outline-none transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-dxp-primary',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
                  'text-dxp-muted-foreground hover:bg-dxp-muted hover:text-gray-900 dark:hover:text-white',
                  isActive &&
                    'bg-dxp-primary/10 text-dxp-primary hover:bg-dxp-primary/15 hover:text-dxp-primary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active accent bar — signature Azure DevOps left-rail indicator */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-dxp-primary transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <IconComponent className="shrink-0 text-[20px]" />
                  {!collapsed && <span className="truncate">{toTitleCase(mfe.name)}</span>}
                </>
              )}
            </NavLink>
          );
        })}

        {visible.length === 0 && !collapsed && (
          <p className="px-3 py-2 text-xs text-dxp-muted-foreground">
            No applications available for your role.
          </p>
        )}
      </nav>

      {/* Collapse toggle — footer of the rail */}
      <div className="border-t border-dxp-border p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className={cn(
            'flex w-full items-center rounded-md py-2 text-sm font-medium text-dxp-muted-foreground transition-colors hover:bg-dxp-muted hover:text-gray-900 dark:hover:text-white',
            collapsed ? 'justify-center px-0' : 'gap-3 px-3',
          )}
        >
          {collapsed ? (
            <ChevronRightIcon className="text-[20px]" />
          ) : (
            <>
              <PanelLeftIcon className="text-[20px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
