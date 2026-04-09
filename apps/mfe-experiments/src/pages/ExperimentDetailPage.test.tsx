import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { experimentStore } from '../api/store.js';

import { ExperimentDetailPage } from './ExperimentDetailPage.js';

// Recharts does not render meaningfully in jsdom — mock the SVG primitives
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function renderDetail(experimentId: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/${experimentId}`]}>
        <Routes>
          <Route path="/:experimentId" element={<ExperimentDetailPage />} />
        </Routes>
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

describe('ExperimentDetailPage', () => {
  it('renders experiment name after load', async () => {
    const id = experimentStore.list()[0]?.id ?? '';
    renderDetail(id);
    await waitFor(() => screen.getByText('Homepage CTA Button Color'));
  });

  it('shows significance badge for significant result', async () => {
    const significantExp = experimentStore
      .list()
      .find((e) => e.pValue !== undefined && e.pValue < 0.05);
    if (!significantExp) return;
    renderDetail(significantExp.id);
    await waitFor(() => screen.getByText(/significant at 95%/i));
  });

  it('renders variant comparison table', async () => {
    const id = experimentStore.list()[0]?.id ?? '';
    renderDetail(id);
    await waitFor(() => screen.getByText('Control (Blue)'));
    expect(screen.getByText('Treatment (Green)')).toBeDefined();
  });

  it('shows error fallback for unknown experiment', async () => {
    renderDetail('does-not-exist');
    await waitFor(() => screen.getByText(/failed to load/i));
  });

  it('pause button triggers mutation for running experiment', async () => {
    const user = userEvent.setup();
    const runningExp = experimentStore.list().find((e) => e.status === 'running');
    if (!runningExp) return;
    renderDetail(runningExp.id);
    await waitFor(() => screen.getByText(runningExp.name));
    const pauseBtn = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseBtn);
    await waitFor(() => expect(experimentStore.get(runningExp.id)?.status).toBe('paused'));
  });

  it('conclude button triggers mutation', async () => {
    const user = userEvent.setup();
    const runningExp = experimentStore.list().find((e) => e.status === 'running');
    if (!runningExp) return;
    renderDetail(runningExp.id);
    await waitFor(() => screen.getByText(runningExp.name));
    const concludeBtn = screen.getByRole('button', { name: /conclude/i });
    await user.click(concludeBtn);
    await waitFor(() => expect(experimentStore.get(runningExp.id)?.status).toBe('concluded'));
  });
});
