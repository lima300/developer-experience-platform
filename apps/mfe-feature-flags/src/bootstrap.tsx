import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';
import './styles/globals.css';

// Standalone dev entry — only runs when using `rsbuild dev` directly.
// In federated mode (mounted by shell), mount.ts is used instead.
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App {...MOCK_PROPS} />);
}
