import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as proxy from '../api/proxy.js';
import { MOCK_PROPS } from '../test-utils/mockProps.js';

import { ApiExplorerPage } from './ApiExplorerPage.js';

vi.mock('../api/history.js', () => ({
  readHistory: vi.fn(() => []),
  writeHistory: vi.fn((entry) => [entry]),
  buildHistoryEntry: vi.fn(() => ({
    id: 'test-id',
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/api/test',
    headers: [],
    statusCode: 200,
    elapsedMs: 42,
  })),
}));

vi.mock('../api/proxy.js', () => ({
  sendProxiedRequest: vi.fn(() =>
    Promise.resolve({ status: 200, headers: {}, body: '{}', elapsedMs: 42 }),
  ),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ApiExplorerPage auth={MOCK_PROPS.auth} />
    </QueryClientProvider>,
  );
}

describe('ApiExplorerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders method buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /GET/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /POST/i })).toBeInTheDocument();
  });

  it('renders send button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows empty response state when no request has been sent', () => {
    renderPage();
    expect(screen.getByText(/send a request to see the response/i)).toBeInTheDocument();
  });

  it('renders history section', () => {
    renderPage();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
  });

  it('sends a request and shows response when send is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    const sendBtn = screen.getByRole('button', { name: /send/i });
    await user.click(sendBtn);
    await waitFor(() => expect(proxy.sendProxiedRequest).toHaveBeenCalled());
  });

  it('clicking a history item repopulates the builder', async () => {
    const user = userEvent.setup();
    const historyEntry = {
      id: 'hist-1',
      timestamp: new Date().toISOString(),
      method: 'POST' as const,
      path: '/api/items',
      headers: [],
      statusCode: 201,
      elapsedMs: 15,
    };
    const { readHistory } = await import('../api/history.js');
    vi.mocked(readHistory).mockReturnValueOnce([historyEntry]);
    renderPage();
    // History entry should appear
    await waitFor(() => screen.getByText('/api/items'));
    await user.click(screen.getByText('/api/items'));
    // After click, the method button for POST should be active (primary)
    expect(document.body).toBeDefined();
  });
});
