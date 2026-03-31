import { AuthProvider } from '@dxp/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { GlobalErrorBoundary } from './error-boundaries/GlobalErrorBoundary.js';
import { DynamicRouter } from './routing/DynamicRouter.js';

// Single QueryClient instance — must not be created inside component body
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <DynamicRouter />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
