import { useAuth } from '@dxp/auth-context';
import { useRegistry } from '@dxp/registry-client';
import { Badge, cn } from '@dxp/ui';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { REGISTRY_URL } from '../constants.js';

import { BellIcon, HelpIcon, MoonIcon, SearchIcon, SettingsIcon, SunIcon } from './Icons.js';

const ROLE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  admin: 'destructive',
  dev: 'warning',
  viewer: 'default',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Convert camelCase to Title Case: "featureFlags" → "Feature Flags" */
function toTitleCase(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** A flat, translucent icon button for the dark top bar. */
function TopbarIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-md text-[20px] text-dxp-topbar-foreground/90 transition-colors hover:bg-white/15 hover:text-dxp-topbar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {children}
    </button>
  );
}

export function Header() {
  const { user, roles, logout } = useAuth();
  const { mfes } = useRegistry({ url: REGISTRY_URL });
  const location = useLocation();

  const primaryRole = roles[0] ?? 'viewer';

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = useCallback(() => {
    const next = document.documentElement.classList.toggle('dark');
    setIsDark(next);
  }, []);

  // Keep the toggle icon in sync if the class changes elsewhere.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, [location.pathname]);

  const currentMFE = mfes.find((m) => location.pathname.startsWith(m.route));
  const currentHub = currentMFE ? toTitleCase(currentMFE.name) : 'Overview';

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-dxp-topbar px-3 text-dxp-topbar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-2 pl-1 pr-2">
        <span className="text-lg leading-none" aria-hidden>
          ⬡
        </span>
        <span className="text-sm font-semibold tracking-tight">DXP</span>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm md:flex">
        <span className="text-dxp-topbar-foreground/60">/</span>
        <span className="text-dxp-topbar-foreground/70">Developer Experience Platform</span>
        <span className="text-dxp-topbar-foreground/60">/</span>
        <span className="font-medium">{currentHub}</span>
      </nav>

      {/* Search — center, grows */}
      <div className="ml-auto flex max-w-md flex-1 items-center">
        <div className="relative w-full">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-dxp-topbar-foreground/60" />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="h-8 w-full rounded-md border border-white/15 bg-white/10 pl-8 pr-3 text-sm text-dxp-topbar-foreground placeholder:text-dxp-topbar-foreground/50 focus:border-white/40 focus:bg-white/15 focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <TopbarIconButton label="Toggle theme" onClick={toggleDarkMode}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </TopbarIconButton>
        <TopbarIconButton label="Help">
          <HelpIcon />
        </TopbarIconButton>
        <TopbarIconButton label="Notifications">
          <BellIcon />
        </TopbarIconButton>
        <TopbarIconButton label="Settings">
          <SettingsIcon />
        </TopbarIconButton>
      </div>

      <div className="mx-1 h-6 w-px bg-white/20" aria-hidden />

      {/* User cluster */}
      <div className="flex items-center gap-2.5">
        <Badge
          variant={ROLE_VARIANT[primaryRole] ?? 'default'}
          className={cn(
            'capitalize',
            'border border-white/20 bg-white/10 text-dxp-topbar-foreground',
          )}
        >
          {primaryRole}
        </Badge>

        <span className="hidden text-sm font-medium text-dxp-topbar-foreground/90 lg:block">
          {user.name}
        </span>

        <button
          type="button"
          onClick={logout}
          title={`Sign out — ${user.email}`}
          aria-label={`Sign out, logged in as ${user.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-dxp-topbar-foreground transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {getInitials(user.name)}
        </button>
      </div>
    </header>
  );
}
