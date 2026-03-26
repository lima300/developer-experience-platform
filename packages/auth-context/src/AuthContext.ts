import { createContext } from 'react';

import type { AuthContext } from './types.js';

export const AuthCtx = createContext<AuthContext | null>(null);
