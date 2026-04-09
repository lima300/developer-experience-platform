import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, it, vi } from 'vitest';

import { App } from './App.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    measureElement: vi.fn(),
  }),
}));

vi.mock('@dxp/observability', () => ({ captureError: vi.fn() }));

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('renders the logs page', async () => {
    render(<App {...MOCK_PROPS} />);
    await waitFor(() => screen.getByPlaceholderText('Search logs…'));
  });
});
