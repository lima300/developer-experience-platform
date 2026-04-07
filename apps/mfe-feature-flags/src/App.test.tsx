import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { flagStore } from './api/store.js';
import { App } from './App.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';

beforeEach(() => {
  flagStore.reset();
});

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('renders the FlagList page at the root route', async () => {
    render(<App {...MOCK_PROPS} />);
    await waitFor(() => screen.getByText('Feature Flags'));
  });

  it('shows flag rows after load', async () => {
    render(<App {...MOCK_PROPS} />);
    await waitFor(() => screen.getByText('New Dashboard'));
  });
});
