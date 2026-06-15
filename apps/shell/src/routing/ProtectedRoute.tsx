import { useAuth } from '@dxp/auth-context';

import type { MFEManifest } from '@dxp/federation-contracts';

interface StatePageProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

/** Shared centered card used by all chrome-level status pages. */
function StatePage({ icon, title, children }: StatePageProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-dxp-border bg-dxp-surface-elevated px-10 py-12 text-center shadow-sm">
        <div className="text-4xl" aria-hidden>
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <div className="text-sm text-dxp-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

interface DisabledMFEPageProps {
  name: string;
}

export function DisabledMFEPage({ name }: DisabledMFEPageProps) {
  return (
    <StatePage icon="🚫" title="Application Disabled">
      <strong className="capitalize text-gray-700 dark:text-gray-300">{name}</strong> has been
      disabled by the platform team.
    </StatePage>
  );
}

interface UnauthorizedPageProps {
  requiredRoles: string[];
}

export function UnauthorizedPage({ requiredRoles }: UnauthorizedPageProps) {
  return (
    <StatePage icon="🔒" title="Access Denied">
      This application requires one of the following roles:{' '}
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {requiredRoles.join(', ')}
      </span>
    </StatePage>
  );
}

export function NotFound() {
  return (
    <StatePage icon="🧭" title="Page Not Found">
      The route you navigated to does not match any registered application.
    </StatePage>
  );
}

export function MFELoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dxp-primary border-t-transparent" />
        <p className="text-sm text-dxp-muted-foreground">Loading application…</p>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  manifest: MFEManifest;
  children: React.ReactElement;
}

export function ProtectedRoute({ manifest, children }: ProtectedRouteProps) {
  const { roles } = useAuth();

  if (!manifest.enabled) {
    return <DisabledMFEPage name={manifest.name} />;
  }

  const hasPermission = manifest.permissions.some((p) => roles.includes(p));
  if (!hasPermission) {
    return <UnauthorizedPage requiredRoles={manifest.permissions} />;
  }

  return children;
}
