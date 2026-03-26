import * as Sentry from '@sentry/react';

/**
 * Record MFE load duration as a Sentry distribution metric.
 * Safe to call even when Sentry is not initialized (no-op with console.debug fallback).
 */
export function trackMFELoad(name: string, durationMs: number): void {
  if (!Sentry.isInitialized()) {
    console.debug(
      `[DXP Observability] MFE load: ${name} — ${durationMs}ms (Sentry not initialized)`,
    );
    return;
  }

  Sentry.metrics.distribution('mfe.load.duration', durationMs, {
    unit: 'millisecond',
    tags: { mfe: name },
  });
}
