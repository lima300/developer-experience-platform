import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { flagStore } from '../api/store.js';

import { FlagDetail } from './FlagDetail.js';

import type { Flag } from '../types/flag.js';

function renderFlagDetail(flagId: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/${flagId}`]}>
        <Routes>
          <Route path="/:id" element={<FlagDetail />} />
        </Routes>
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

describe('FlagDetail', () => {
  it('renders loading skeletons while data is pending', () => {
    const flags = flagStore.list();
    renderFlagDetail((flags[0] as Flag).id);
    // Skeletons appear before async query resolves
    expect(document.querySelectorAll('[class*="animate"]').length).toBeGreaterThan(0);
  });

  it('renders flag name after data loads', async () => {
    const flags = flagStore.list();
    const flag = flags[0] as Flag;
    renderFlagDetail(flag.id);
    await waitFor(() => screen.getByText(flag.name));
    expect(screen.getByText(flag.name)).toBeDefined();
  });

  it('shows the flag key', async () => {
    const flags = flagStore.list();
    const flag = flags[0] as Flag;
    renderFlagDetail(flag.id);
    await waitFor(() => screen.getByText(flag.key));
  });

  it('shows edit button', async () => {
    const flags = flagStore.list();
    renderFlagDetail((flags[0] as Flag).id);
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
  });

  it('switches to edit form when Edit is clicked', async () => {
    const user = userEvent.setup();
    const flags = flagStore.list();
    renderFlagDetail((flags[0] as Flag).id);
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
  });

  it('cancels edit and returns to view mode', async () => {
    const user = userEvent.setup();
    const flags = flagStore.list();
    renderFlagDetail((flags[0] as Flag).id);
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined();
  });

  it('shows back button', async () => {
    const flags = flagStore.list();
    renderFlagDetail((flags[0] as Flag).id);
    await waitFor(() => screen.getByText(/back to flags/i));
  });

  it('renders error fallback for unknown flag id', async () => {
    renderFlagDetail('non-existent-id');
    await waitFor(() => screen.getByText(/failed to load flag/i));
  });

  it('submits edit form and returns to view mode', async () => {
    const user = userEvent.setup();
    const flags = flagStore.list();
    const flag = flags[0] as Flag;
    renderFlagDetail(flag.id);
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Clear and type a new name
    const nameInput = screen.getByDisplayValue(flag.name);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Flag Name');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    await waitFor(() => expect(screen.getByText('Updated Flag Name')).toBeDefined());
  });
});
