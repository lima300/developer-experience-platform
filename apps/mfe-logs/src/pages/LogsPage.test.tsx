import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LogsPage } from './LogsPage.js';

// Mock TanStack Virtual — jsdom has no layout engine, virtualizer returns nothing
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    measureElement: vi.fn(),
  }),
}));

// Mock observability captureError
vi.mock('@dxp/observability', () => ({
  captureError: vi.fn(),
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
});

describe('LogsPage', () => {
  it('renders loading skeletons initially', () => {
    renderPage();
    expect(document.querySelectorAll('[class*="animate"]').length).toBeGreaterThan(0);
  });

  it('renders toolbar after data loads', async () => {
    renderPage();
    await waitFor(() => screen.getByPlaceholderText('Search logs…'));
  });

  it('renders level filter buttons', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('group', { name: /log level filter/i }));
    expect(screen.getByText('ERROR')).toBeDefined();
    expect(screen.getByText('WARN')).toBeDefined();
    expect(screen.getByText('INFO')).toBeDefined();
    expect(screen.getByText('DEBUG')).toBeDefined();
  });

  it('typing in search input updates state', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByPlaceholderText('Search logs…'));
    const searchInput = screen.getByPlaceholderText('Search logs…');
    await user.type(searchInput, 'error');
    expect((searchInput as HTMLInputElement).value).toBe('error');
  });

  it('clicking a level button toggles the level filter', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByText('ERROR'));
    const errorBtn = screen.getByRole('button', { name: 'ERROR' });
    await user.click(errorBtn);
    expect(errorBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('setting from and to date inputs updates state', async () => {
    renderPage();
    await waitFor(() => screen.getByLabelText('From'));
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-01-01T00:00' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-12-31T23:59' },
    });
    expect((screen.getByLabelText('From') as HTMLInputElement).value).toBe('2026-01-01T00:00');
    expect((screen.getByLabelText('To') as HTMLInputElement).value).toBe('2026-12-31T23:59');
  });

  it('clicking the clear button resets filters', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByPlaceholderText('Search logs…'));
    const searchInput = screen.getByPlaceholderText('Search logs…');
    await user.type(searchInput, 'test');
    // Wait for clear button to appear
    await waitFor(() => screen.getByRole('button', { name: /clear/i }));
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect((searchInput as HTMLInputElement).value).toBe('');
  });
});
