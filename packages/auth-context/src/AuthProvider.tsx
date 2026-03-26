'use client';

import { useState, type ReactNode } from 'react';

import { AuthCtx } from './AuthContext.js';
import { MOCK_USERS, makeMockToken, type MockRole } from './mock/mockUsers.js';

import type { AuthContext } from './types.js';

// Resolved at bundle time by Webpack/Rsbuild DefinePlugin; always false in tsc builds
const IS_DEV: boolean = false;

const STORAGE_KEY = 'dxp:mock-role';

function getInitialRole(): MockRole {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in MOCK_USERS) return stored as MockRole;
  }
  return 'admin';
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [role, setRole] = useState<MockRole>(getInitialRole);

  const { user, roles } = MOCK_USERS[role];
  const token = makeMockToken(user, roles);

  const context: AuthContext = {
    user,
    roles,
    token,
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      setRole('viewer');
    },
  };

  const switchRole = (next: MockRole) => {
    localStorage.setItem(STORAGE_KEY, next);
    setRole(next);
  };

  return (
    <AuthCtx.Provider value={context}>
      {children}
      {IS_DEV && <DevRoleSwitcher current={role} onSwitch={switchRole} />}
    </AuthCtx.Provider>
  );
}

function DevRoleSwitcher({
  current,
  onSwitch,
}: {
  current: MockRole;
  onSwitch: (role: MockRole) => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: '#1e1e2e',
        color: '#cdd6f4',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontFamily: 'monospace',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <span>Role:</span>
      {(Object.keys(MOCK_USERS) as MockRole[]).map((r) => (
        <button
          key={r}
          onClick={() => onSwitch(r)}
          style={{
            background: current === r ? '#89b4fa' : '#313244',
            color: current === r ? '#1e1e2e' : '#cdd6f4',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
