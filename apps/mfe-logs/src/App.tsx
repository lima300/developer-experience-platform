import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { LogsPage } from './pages/LogsPage.js';

import type { MFEProps } from '@dxp/federation-contracts';

export function App(_props: MFEProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Routes>
          <Route index element={<LogsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
