import { base } from '@dxp/eslint-config/base';
import { react } from '@dxp/eslint-config/react';

export default [
  ...base,
  // React rules for all app src files
  {
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    ...react[react.length - 1],
  },
  {
    // Root-level ignores applied globally
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.rsbuild/**',
      'packages/eslint-config/**',
      'packages/prettier-config/**',
    ],
  },
];
