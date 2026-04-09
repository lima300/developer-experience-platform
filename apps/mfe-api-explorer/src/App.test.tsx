import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';

vi.mock('../api/history.js', () => ({
  readHistory: vi.fn(() => []),
  writeHistory: vi.fn((entry: unknown) => [entry]),
  buildHistoryEntry: vi.fn(),
}));

vi.mock('../api/proxy.js', () => ({
  sendProxiedRequest: vi.fn(),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App {...MOCK_PROPS} />);
  });

  it('renders the request builder', () => {
    render(<App {...MOCK_PROPS} />);
    expect(screen.getByRole('button', { name: /GET/i })).toBeInTheDocument();
  });

  it('shows empty response state on initial render', () => {
    render(<App {...MOCK_PROPS} />);
    expect(screen.getByText(/send a request to see the response/i)).toBeInTheDocument();
  });
});
