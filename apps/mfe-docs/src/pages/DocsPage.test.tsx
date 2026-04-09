import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { DocsPage } from './DocsPage.js';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('remark-gfm', () => ({ default: vi.fn() }));

function renderDocsPage(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <DocsPage />
    </MemoryRouter>,
  );
}

describe('DocsPage', () => {
  it('renders without crashing', () => {
    renderDocsPage();
  });

  it('shows documentation nav', () => {
    renderDocsPage();
    expect(screen.getByRole('navigation', { name: /documentation/i })).toBeInTheDocument();
  });

  it('renders markdown content area', () => {
    renderDocsPage();
    expect(screen.getByTestId('markdown')).toBeInTheDocument();
  });

  it('renders search button', () => {
    renderDocsPage();
    expect(screen.getByRole('button', { name: /search docs/i })).toBeInTheDocument();
  });

  it('renders sidebar nav links', () => {
    renderDocsPage();
    // top-level nav items should be present
    expect(screen.getByRole('button', { name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /architecture/i })).toBeInTheDocument();
  });
});
