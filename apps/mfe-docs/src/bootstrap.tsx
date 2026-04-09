import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.js';
import { mockMFEProps } from './test-utils/mockProps.js';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App {...mockMFEProps} />);
}
