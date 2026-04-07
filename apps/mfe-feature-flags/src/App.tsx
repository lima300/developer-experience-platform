import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { FlagDetail } from './pages/FlagDetail.js';
import { FlagList } from './pages/FlagList.js';

import type { MFEProps } from '@dxp/federation-contracts';

// QueryClient created inside component so each mount() call gets a fresh cache.
// Do NOT hoist to module level — it would be shared across mount/unmount cycles.
export function App(props: MFEProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Shell owns the URL bar — MemoryRouter is mandatory for all MFEs */}
      <MemoryRouter>
        <Routes>
          <Route index element={<FlagList auth={props.auth} />} />
          <Route path="/:id" element={<FlagDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
