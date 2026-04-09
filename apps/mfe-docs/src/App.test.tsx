import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import App from './App.js';
import { mockMFEProps } from './test-utils/mockProps.js';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('remark-gfm', () => ({ default: vi.fn() }));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App {...mockMFEProps} />);
  });

  it('renders navigation', () => {
    render(<App {...mockMFEProps} />);
    expect(screen.getByRole('navigation', { name: /documentation/i })).toBeInTheDocument();
  });

  it('renders markdown content on first load', () => {
    render(<App {...mockMFEProps} />);
    expect(screen.getByTestId('markdown')).toBeInTheDocument();
  });
});
