import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { experimentStore } from './api/store.js';
import { App } from './App.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';

beforeEach(() => {
  experimentStore.reset();
});

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('renders ExperimentsPage at root route', async () => {
    render(<App {...MOCK_PROPS} />);
    await waitFor(() => screen.getByText('Experiments'));
  });

  it('shows experiment rows after load', async () => {
    render(<App {...MOCK_PROPS} />);
    await waitFor(() => screen.getByText('Homepage CTA Button Color'));
  });
});
