import { MFEMountFnSchema } from '@dxp/federation-contracts';

import { FederationLoadError, FederationTimeoutError } from './FederationError.js';

import type { MFEManifest, MFEMountFn } from '@dxp/federation-contracts';

// ─── Webpack Module Federation global declarations ───────────────────────────

declare function __webpack_init_sharing__(scope: string): Promise<void>;
declare const __webpack_share_scopes__: Record<string, unknown>;

interface FederationContainer {
  init: (shareScope: unknown) => Promise<void>;
  get: (module: string) => Promise<() => { default: unknown }>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getContainer(scope: string): FederationContainer {
  const container = (window as unknown as Record<string, unknown>)[scope];
  if (
    !container ||
    typeof (container as FederationContainer).init !== 'function' ||
    typeof (container as FederationContainer).get !== 'function'
  ) {
    throw new Error(
      `Federation container "${scope}" not found on window. ` +
        `Ensure the remote entry script was injected and has initialized.`,
    );
  }
  return container as FederationContainer;
}

async function injectScript(manifest: MFEManifest): Promise<void> {
  // Guard against double injection — idempotent
  if (document.querySelector(`script[data-mfe="${manifest.scope}"]`)) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = manifest.url;
    script.dataset['mfe'] = manifest.scope;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new FederationLoadError(`Failed to load remote entry: ${manifest.url}`, manifest));
    document.head.appendChild(script);
  });
}

function removeScript(scope: string): void {
  document.querySelector(`script[data-mfe="${scope}"]`)?.remove();
}

async function loadOnce(manifest: MFEManifest): Promise<MFEMountFn> {
  await injectScript(manifest);
  await __webpack_init_sharing__('default');

  const container = getContainer(manifest.scope);
  await container.init(__webpack_share_scopes__['default']);

  const factory = await container.get(manifest.module);
  const Module = factory();

  const parsed = MFEMountFnSchema.safeParse(Module.default);
  if (!parsed.success) {
    throw new FederationLoadError(
      `MFE "${manifest.name}" does not export a valid MFEMountFn. ` +
        `Ensure it exports a default function matching the contract.`,
      manifest,
    );
  }

  return parsed.data as MFEMountFn;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const LOAD_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

/**
 * Dynamically load an MFE remote entry, init federation sharing, and return
 * the validated `MFEMountFn`. Retries up to MAX_RETRIES times on transient
 * failures. Times out after LOAD_TIMEOUT_MS ms.
 */
export async function loadRemoteWithRetry(
  manifest: MFEManifest,
  retries = MAX_RETRIES,
): Promise<MFEMountFn> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        loadOnce(manifest),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new FederationTimeoutError(manifest)), LOAD_TIMEOUT_MS),
        ),
      ]);
      return result;
    } catch (err) {
      lastError = err;

      // Remove the injected script before retrying so Step 1 guard doesn't block re-injection
      removeScript(manifest.scope);

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
