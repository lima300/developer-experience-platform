import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';

import type { MFEMountFn } from '@dxp/federation-contracts';

const mount: MFEMountFn = (container, props) => {
  // Apply dark mode class so Tailwind dark: variants work inside this MFE
  container.classList.toggle('dark', props.theme.mode === 'dark');

  const root = createRoot(container);
  root.render(<App {...props} />);

  return {
    unmount: () => {
      root.unmount();
      container.classList.remove('dark');
    },
  };
};

// Must be default export — loadRemote.ts reads Module.default and validates
// against MFEMountFnSchema. A named export silently fails Zod validation.
export default mount;
