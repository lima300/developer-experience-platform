import { useContext } from 'react';

import { AuthCtx } from './AuthContext.js';

import type { AuthContext } from './types.js';

export function useAuth(): AuthContext {
  const ctx = useContext(AuthCtx);
  if (ctx === null) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
