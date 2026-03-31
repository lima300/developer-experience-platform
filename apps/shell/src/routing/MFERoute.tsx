import { endMFEMark, startMFEMark, trackMFELoad } from '@dxp/observability';
import React, { useEffect, useState } from 'react';

import { MFEContainer } from '../components/MFEContainer.js';
import { loadRemoteWithRetry } from '../federation/loadRemote.js';

import { MFELoadingSkeleton } from './ProtectedRoute.js';

import type { MFEManifest, MFEMountFn } from '@dxp/federation-contracts';

interface MFERouteState {
  mountFn: MFEMountFn | null;
  error: Error | null;
  loading: boolean;
}

interface MFERouteProps {
  manifest: MFEManifest;
}

export function MFERoute({ manifest }: MFERouteProps) {
  const [state, setState] = useState<MFERouteState>({
    mountFn: null,
    error: null,
    loading: true,
  });

  // Destructure stable values so exhaustive-deps doesn't flag the whole manifest object
  const { name, scope, url } = manifest;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      startMFEMark(name);
      const start = performance.now();

      try {
        const mountFn = await loadRemoteWithRetry(manifest);

        if (cancelled) return;

        const duration = performance.now() - start;
        endMFEMark(name);
        trackMFELoad(name, duration);

        setState({ mountFn, error: null, loading: false });
      } catch (err) {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ mountFn: null, error, loading: false });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
    // Deps are intentionally restricted: scope+url+name trigger a reload when the
    // remote bundle changes. Including the full manifest object would cause reloads
    // on every registry re-fetch even when nothing meaningful changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, scope, url]);

  if (state.loading) {
    return <MFELoadingSkeleton />;
  }

  // Throw to bubble up to MFEErrorBoundary
  if (state.error !== null) {
    throw state.error;
  }

  if (state.mountFn === null) {
    throw new Error(`MFE "${manifest.name}" loaded but mount function is null`);
  }

  return <MFEContainer manifest={manifest} mountFn={state.mountFn} />;
}
