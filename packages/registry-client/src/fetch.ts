import { RegistrySchema } from '@dxp/federation-contracts';

import type { Registry } from '@dxp/federation-contracts';

const STORAGE_KEY = 'dxp:registry';

export class RegistryFetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'RegistryFetchError';
  }
}

export class RegistryValidationError extends Error {
  constructor(public readonly issues: unknown) {
    super('Registry JSON does not match expected schema');
    this.name = 'RegistryValidationError';
  }
}

const RETRY_DELAYS = [1000, 2000, 4000] as const;

async function attempt(url: string): Promise<Registry> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new RegistryFetchError(`Registry fetch failed: HTTP ${response.status}`, response.status);
  }

  const json: unknown = await response.json();
  const result = RegistrySchema.safeParse(json);

  if (!result.success) {
    throw new RegistryValidationError(result.error.flatten());
  }

  // Write to sessionStorage as offline fallback before returning
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
  } catch {
    // sessionStorage unavailable (e.g. private browsing with strict settings) — non-fatal
  }

  return result.data;
}

/**
 * Fetch and Zod-validate the DXP registry JSON.
 * Retries 3× with exponential backoff (1s, 2s, 4s).
 * Throws RegistryFetchError or RegistryValidationError on failure.
 */
export async function fetchRegistry(url: string): Promise<Registry> {
  let lastError: unknown;

  for (let i = 0; i <= RETRY_DELAYS.length; i++) {
    try {
      return await attempt(url);
    } catch (error) {
      lastError = error;

      // RegistryValidationError is a schema mismatch — retrying won't help
      if (error instanceof RegistryValidationError) throw error;

      const delay = RETRY_DELAYS[i];
      if (delay !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
