import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import './styles/globals.css';
import { DocsPage } from './pages/DocsPage.js';

import type { MFEProps } from '@dxp/federation-contracts';

// No QueryClient needed — docs store uses static JSON data
export default function App(_props: MFEProps) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/:slug/*" element={<DocsPage />} />
        <Route path="/" element={<DocsPage />} />
      </Routes>
    </MemoryRouter>
  );
}
