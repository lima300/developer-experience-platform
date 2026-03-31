// These constants are replaced at build time by webpack DefinePlugin.
// Declare them as ambient globals so TypeScript is satisfied without @types/node.
declare const process: { env: Record<string, string | undefined> };

export const REGISTRY_URL: string =
  process.env['REGISTRY_URL'] ?? 'http://localhost:4000/registry.json';

export const SENTRY_DSN: string = process.env['SENTRY_DSN'] ?? '';
export const APP_ENV: string = process.env['APP_ENV'] ?? 'development';
export const APP_VERSION: string = process.env['APP_VERSION'] ?? '0.0.0';

// __DEV__ is injected by webpack DefinePlugin at build time — replaced with true/false literal
declare const __DEV__: boolean;
export const IS_DEV: boolean = __DEV__;
