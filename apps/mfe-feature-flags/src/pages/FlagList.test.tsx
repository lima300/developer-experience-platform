import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { flagStore } from '../api/store.js';
import { MOCK_PROPS } from '../test-utils/mockProps.js';

import { FlagList } from './FlagList.js';

function renderFlagList(roles = ['admin', 'dev', 'viewer']) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <FlagList auth={{ ...MOCK_PROPS.auth, roles }} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  flagStore.reset();
});

afterEach(() => {
  cleanup();
});

describe('FlagList', () => {
  it('renders loading skeletons while data is pending', () => {
    renderFlagList();
    // Skeletons rendered before query resolves
    expect(document.querySelectorAll('[class*="animate"]').length).toBeGreaterThan(0);
  });

  it('renders flag rows after data loads', async () => {
    renderFlagList();
    await waitFor(() => screen.getByText('New Dashboard'));
    const rows = screen.getAllByRole('row');
    // 1 header row + 4 data rows
    expect(rows.length).toBe(5);
  });

  it('shows the New Flag button', async () => {
    renderFlagList();
    await waitFor(() => screen.getByText('New Dashboard'));
    expect(screen.getByRole('button', { name: /new flag/i })).toBeDefined();
  });

  it('renders delete button for admin user', async () => {
    renderFlagList(['admin']);
    await waitFor(() => screen.getByText('New Dashboard'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('does not render delete button for viewer role', async () => {
    renderFlagList(['viewer']);
    await waitFor(() => screen.getByText('New Dashboard'));
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
  });

  it('opens create dialog when New Flag is clicked', async () => {
    const user = userEvent.setup();
    renderFlagList();
    await waitFor(() => screen.getByRole('button', { name: /new flag/i }));
    await user.click(screen.getByRole('button', { name: /new flag/i }));
    await waitFor(() => screen.getByText('Create Feature Flag'));
  });
});
