import { useAuth } from '@dxp/auth-context';
import { useEffect, useRef } from 'react';

import type { MFEManifest, MFEMountFn, MFEInstance } from '@dxp/federation-contracts';

interface MFEContainerProps {
  manifest: MFEManifest;
  mountFn: MFEMountFn;
}

export function MFEContainer({ manifest, mountFn }: MFEContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MFEInstance | null>(null);
  const { user, roles, token, logout } = useAuth();

  // Detect dark mode from document class
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!containerRef.current) return;

    instanceRef.current = mountFn(containerRef.current, {
      auth: { user, roles, token, logout },
      router: { basePath: manifest.route },
      theme: { mode: isDark ? 'dark' : 'light' },
    });

    return () => {
      instanceRef.current?.unmount();
      instanceRef.current = null;
    };
    // Re-mount only when the MFE scope changes (i.e., navigating to a different MFE).
    // Deliberately excluding auth/theme from deps — props are passed by reference at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest.scope]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      data-mfe={manifest.scope}
      aria-label={`${manifest.name} application`}
    />
  );
}
