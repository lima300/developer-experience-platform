import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useConcludeExperiment, useExperiment, useExperiments } from './experiments.hooks.js';
import { experimentStore } from './store.js';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  experimentStore.reset();
});

afterEach(() => {
  cleanup();
});

describe('useExperiments()', () => {
  it('returns all seeded experiments', async () => {
    const { result } = renderHook(() => useExperiments(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(3);
  });
});

describe('useExperiment()', () => {
  it('returns a single experiment by id', async () => {
    const id = experimentStore.list()[0]?.id ?? '';
    const { result } = renderHook(() => useExperiment(id), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(id);
  });

  it('returns null for unknown id', async () => {
    const { result } = renderHook(() => useExperiment('bad'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useExperiment(''), { wrapper });
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useConcludeExperiment()', () => {
  it('mutation function resolves with concluded experiment', async () => {
    const id = experimentStore.list()[0]?.id ?? '';
    const { result } = renderHook(() => useConcludeExperiment(), { wrapper });
    result.current.mutate(id);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('concluded');
  });
});
