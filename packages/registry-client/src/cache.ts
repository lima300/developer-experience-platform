import { RegistrySchema } from '@dxp/federation-contracts';

import type { Registry } from '@dxp/federation-contracts';

const STORAGE_KEY = 'dxp:registry';

/**
 * Read the last-known registry from sessionStorage and re-validate with Zod.
 * Returns null if the cache is missing, stale, or invalid.
 */
export function getRegistryFallback(): Registry | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    const result = RegistrySchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
