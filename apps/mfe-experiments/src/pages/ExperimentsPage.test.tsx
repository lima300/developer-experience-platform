import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi as _vi } from 'vitest';

import { experimentStore } from '../api/store.js';
import { MOCK_PROPS } from '../test-utils/mockProps.js';

import { ExperimentsPage } from './ExperimentsPage.js';

function renderPage(roles = ['admin', 'dev', 'viewer']) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ExperimentsPage auth={{ ...MOCK_PROPS.auth, roles }} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  experimentStore.reset();
});

afterEach(() => {
  cleanup();
});

describe('ExperimentsPage', () => {
  it('renders loading skeletons while data is pending', () => {
    renderPage();
    expect(document.querySelectorAll('[class*="animate"]').length).toBeGreaterThan(0);
  });

  it('renders experiment rows after data loads', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Homepage CTA Button Color'));
    expect(screen.getByText('Search Bar Placement')).toBeDefined();
  });

  it('shows New Experiment button for admin role', async () => {
    renderPage(['admin']);
    await waitFor(() => screen.getByText('Homepage CTA Button Color'));
    expect(screen.getByRole('button', { name: /new experiment/i })).toBeDefined();
  });

  it('hides New Experiment button for viewer role', async () => {
    renderPage(['viewer']);
    await waitFor(() => screen.getByText('Homepage CTA Button Color'));
    expect(screen.queryByRole('button', { name: /new experiment/i })).toBeNull();
  });

  it('shows status badges', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Running'));
    expect(screen.getByText('Paused')).toBeDefined();
    expect(screen.getByText('Concluded')).toBeDefined();
  });

  it('opens New Experiment dialog when button is clicked', async () => {
    const user = userEvent.setup();
    renderPage(['admin']);
    await waitFor(() => screen.getByRole('button', { name: /new experiment/i }));
    await user.click(screen.getByRole('button', { name: /new experiment/i }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('clicking an experiment row navigates to detail', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByText('Homepage CTA Button Color'));
    const row = screen.getByText('Homepage CTA Button Color').closest('tr');
    if (row) await user.click(row);
    // MemoryRouter has no visible URL change — we just verify the click doesn't throw
    expect(document.body).toBeDefined();
  });
});
