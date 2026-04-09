import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';

import type { MFEMountFn } from '@dxp/federation-contracts';

const mount: MFEMountFn = (container, props) => {
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

export default mount;
