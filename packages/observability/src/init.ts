import * as Sentry from '@sentry/react';

export interface InitSentryOptions {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
}

/**
 * Initialize Sentry. Call once in the shell root before rendering.
 * MFEs must NOT call this — the shell owns Sentry initialization.
 */
export function initSentry({
  dsn,
  environment,
  release,
  tracesSampleRate = 0.1,
}: InitSentryOptions): void {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,
    integrations: [Sentry.browserTracingIntegration()],
    ...(release !== undefined && { release }),
  });
}
