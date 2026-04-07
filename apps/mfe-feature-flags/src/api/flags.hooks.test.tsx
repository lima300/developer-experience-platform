import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  useCreateFlag,
  useDeleteFlag,
  useFlag,
  useFlags,
  useToggleEnv,
  useUpdateFlag,
} from './flags.hooks.js';
import { flagStore } from './store.js';

import type { Flag } from '../types/flag.js';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  flagStore.reset();
});

afterEach(() => {
  cleanup();
});

describe('useFlags()', () => {
  it('returns all seeded flags', async () => {
    const { result } = renderHook(() => useFlags(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(4);
  });
});

describe('useFlag()', () => {
  it('returns a single flag by id', async () => {
    const flagId = (flagStore.list()[0] as Flag).id;
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(flagId);
  });

  it('returns null for unknown id', async () => {
    const { result } = renderHook(() => useFlag('bad'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useCreateFlag()', () => {
  it('creates a new flag and adds it to the list', async () => {
    const { result } = renderHook(() => useCreateFlag(), { wrapper });
    result.current.mutate({
      name: 'New Flag',
      key: 'new-flag',
      description: '',
      environments: { dev: true, staging: false, prod: false },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(flagStore.list().length).toBe(5);
  });
});

describe('useUpdateFlag()', () => {
  it('updates a flag', async () => {
    const flagId = (flagStore.list()[0] as Flag).id;
    const { result } = renderHook(() => useUpdateFlag(flagId), { wrapper });
    result.current.mutate({ name: 'Updated Name' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(flagStore.get(flagId)?.name).toBe('Updated Name');
  });
});

describe('useToggleEnv()', () => {
  it('toggles an environment value', async () => {
    const flag = flagStore.list()[0] as Flag;
    const before = flag.environments.dev;
    const { result } = renderHook(() => useToggleEnv(), { wrapper });
    result.current.mutate({ id: flag.id, env: 'dev' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(flagStore.get(flag.id)?.environments.dev).toBe(!before);
  });
});

describe('useDeleteFlag()', () => {
  it('deletes a flag', async () => {
    const flagId = (flagStore.list()[0] as Flag).id;
    const { result } = renderHook(() => useDeleteFlag(), { wrapper });
    result.current.mutate(flagId);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(flagStore.get(flagId)).toBeUndefined();
    expect(flagStore.list().length).toBe(3);
  });
});
