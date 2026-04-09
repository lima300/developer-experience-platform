import type { MFEProps } from '@dxp/federation-contracts';

export const MOCK_PROPS: MFEProps = {
  auth: {
    user: { id: 'test-001', name: 'Dev User', email: 'dev@dxp.internal' },
    roles: ['admin', 'dev', 'viewer'],
    token: 'mock-token',
    logout: () => {},
  },
  router: { basePath: '/' },
  theme: { mode: 'light' },
};
