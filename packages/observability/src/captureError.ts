import * as Sentry from '@sentry/react';

/**
 * Capture an error to Sentry, tagged with the MFE name.
 * Call this from MFEErrorBoundary before rendering the fallback UI.
 * Safe to call when Sentry is not initialized.
 */
export function captureError(error: unknown, mfeName: string): void {
  if (!Sentry.isInitialized()) {
    console.error(`[DXP Observability] MFE error in ${mfeName}:`, error);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('mfe_name', mfeName);
    scope.setContext('mfe', { name: mfeName });
    Sentry.captureException(error);
  });
}
