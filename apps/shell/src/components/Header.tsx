import { useAuth } from '@dxp/auth-context';
import { Badge, Button } from '@dxp/ui';
import { useCallback } from 'react';

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

export function Header() {
  const { user, roles, logout } = useAuth();

  const primaryRole = roles[0] ?? 'viewer';

  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.toggle('dark');
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-dxp-border bg-dxp-surface-elevated px-4">
      {/* Left — breadcrumb placeholder */}
      <div className="text-sm text-dxp-muted-foreground">Developer Experience Platform</div>

      {/* Right — user info + controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="text-dxp-muted-foreground"
        >
          ◐
        </Button>

        <Badge variant={ROLE_VARIANT[primaryRole] ?? 'default'} className="capitalize">
          {primaryRole}
        </Badge>

        {/* Avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-dxp-primary text-xs font-semibold text-dxp-primary-foreground"
          title={user.email}
          aria-label={`Logged in as ${user.name}`}
        >
          {getInitials(user.name)}
        </div>

        <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block">
          {user.name}
        </span>

        <Button variant="ghost" size="sm" onClick={logout} className="text-dxp-muted-foreground">
          Sign out
        </Button>
      </div>
    </header>
  );
}
