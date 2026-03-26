import type { User, AuthContext } from '@dxp/federation-contracts';

export const MOCK_USERS = {
  admin: {
    user: { id: 'user-001', name: 'Alex Admin', email: 'alex@dxp.internal' },
    roles: ['admin', 'dev', 'viewer'],
  },
  dev: {
    user: { id: 'user-002', name: 'Dana Dev', email: 'dana@dxp.internal' },
    roles: ['dev', 'viewer'],
  },
  viewer: {
    user: { id: 'user-003', name: 'Vic Viewer', email: 'vic@dxp.internal' },
    roles: ['viewer'],
  },
} satisfies Record<string, Pick<AuthContext, 'user' | 'roles'>>;

export type MockRole = keyof typeof MOCK_USERS;

/**
 * Generates a mock JWT-shaped token (base64 encoded JSON payload).
 * Not cryptographically valid — plausible structure only.
 */
export const makeMockToken = (user: User, roles: string[]): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  return `${header}.${payload}.mock-signature`;
};
