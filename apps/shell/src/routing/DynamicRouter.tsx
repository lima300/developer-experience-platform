import { useRegistry } from '@dxp/registry-client';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { REGISTRY_URL } from '../constants.js';
import { MFEErrorBoundary } from '../error-boundaries/MFEErrorBoundary.js';
import { AppLayout } from '../layouts/AppLayout.js';

import { MFERoute } from './MFERoute.js';
import { MFELoadingSkeleton, NotFound, ProtectedRoute } from './ProtectedRoute.js';

export function DynamicRouter() {
  // useRegistry is deduplicated by TanStack Query — AppLayout calls it too,
  // but both share the same cache entry ('dxp', 'registry').
  const { registry } = useRegistry({ url: REGISTRY_URL });

  const enabledMFEs = registry?.mfes.filter((mfe) => mfe.enabled) ?? [];

  // Determine the default redirect target — first enabled MFE, or /flags fallback
  const defaultRoute = enabledMFEs[0]?.route ?? '/flags';

  return (
    <Routes>
      {/* AppLayout provides the sidebar + header chrome for all app routes */}
      <Route element={<AppLayout />}>
        {/* Index redirect to first available MFE */}
        <Route index element={<Navigate to={defaultRoute} replace />} />

        {enabledMFEs.map((manifest) => (
          <Route
            key={manifest.name}
            path={`${manifest.route}/*`}
            element={
              <ProtectedRoute manifest={manifest}>
                {/* key on MFEErrorBoundary ensures a fresh boundary per scope.
                    This prevents a failed MFE from poisoning retry attempts. */}
                <MFEErrorBoundary key={manifest.name} manifest={manifest}>
                  <Suspense fallback={<MFELoadingSkeleton />}>
                    <MFERoute manifest={manifest} />
                  </Suspense>
                </MFEErrorBoundary>
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
