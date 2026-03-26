import { useQuery } from '@tanstack/react-query';

import { getRegistryFallback } from './cache.js';
import { fetchRegistry } from './fetch.js';

import type { MFEManifest, Registry } from '@dxp/federation-contracts';

export const REGISTRY_QUERY_KEY = ['dxp', 'registry'] as const;

export interface UseRegistryOptions {
  /** URL to fetch registry.json from. */
  url: string;
}

export interface UseRegistryResult {
  mfes: MFEManifest[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  registry: Registry | undefined;
}

/**
 * TanStack Query hook for fetching and caching the DXP registry.
 * Provides a sessionStorage fallback as `placeholderData`.
 */
export function useRegistry({ url }: UseRegistryOptions): UseRegistryResult {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...REGISTRY_QUERY_KEY, url],
    queryFn: () => fetchRegistry(url),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false, // retries handled inside fetchRegistry
    placeholderData: () => getRegistryFallback() ?? undefined,
  });

  return {
    mfes: data?.mfes ?? [],
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    registry: data,
  };
}
