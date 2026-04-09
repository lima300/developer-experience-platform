import { captureError } from '@dxp/observability';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LogsPage } from './LogsPage.js';

// Mock useLogs to return an error state — isolated to this file
vi.mock('../api/logs.hooks.js', () => ({
  useLogs: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: true,
    error: new Error('simulated fetch error'),
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
}));

vi.mock('@dxp/observability', () => ({
  captureError: vi.fn(),
}));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    measureElement: vi.fn(),
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LogsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LogsPage (error state)', () => {
  it('renders error fallback and calls captureError when query fails', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Something went wrong'));
    expect(vi.mocked(captureError)).toHaveBeenCalledWith(expect.any(Error), 'mfe-logs');
  });
});
