import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { useLogs } from './logs.hooks.js';

import type { LogPage } from '../types/log.js';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

afterEach(() => {
  cleanup();
});

describe('useLogs()', () => {
  it('returns first page of logs on success', async () => {
    const { result } = renderHook(() => useLogs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data?.pages[0] as LogPage | undefined)?.items.length).toBe(50);
  });

  it('accepts level filter', async () => {
    const { result } = renderHook(() => useLogs({ levels: new Set(['ERROR']) }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      (result.current.data?.pages[0] as LogPage | undefined)?.items.every(
        (e) => e.level === 'ERROR',
      ),
    ).toBe(true);
  });

  it('accepts search filter', async () => {
    const { result } = renderHook(() => useLogs({ search: 'authenticated' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const items = (result.current.data?.pages[0] as LogPage | undefined)?.items ?? [];
    expect(
      items.every(
        (e) =>
          e.message.toLowerCase().includes('authenticated') ||
          e.service.toLowerCase().includes('authenticated'),
      ),
    ).toBe(true);
  });

  it('fetches second page using cursor from first page', async () => {
    const { result } = renderHook(() => useLogs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const firstPage = result.current.data?.pages[0] as LogPage | undefined;
    expect(firstPage?.nextCursor).not.toBeNull();
    await result.current.fetchNextPage();
    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));
    const secondPage = result.current.data?.pages[1] as LogPage | undefined;
    expect(secondPage?.items.length).toBe(50);
  });
});
