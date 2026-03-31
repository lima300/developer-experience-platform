import { useAuth } from '@dxp/auth-context';

import type { MFEManifest } from '@dxp/federation-contracts';

interface DisabledMFEPageProps {
  name: string;
}

export function DisabledMFEPage({ name }: DisabledMFEPageProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">🚫</div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Application Disabled</h2>
      <p className="max-w-sm text-sm text-dxp-muted-foreground">
        <strong className="capitalize">{name}</strong> has been disabled by the platform team.
      </p>
    </div>
  );
}

interface UnauthorizedPageProps {
  requiredRoles: string[];
}

export function UnauthorizedPage({ requiredRoles }: UnauthorizedPageProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">🔒</div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h2>
      <p className="max-w-sm text-sm text-dxp-muted-foreground">
        This application requires one of the following roles:{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {requiredRoles.join(', ')}
        </span>
      </p>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">404</div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Page Not Found</h2>
      <p className="text-sm text-dxp-muted-foreground">
        The route you navigated to does not match any registered application.
      </p>
    </div>
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
