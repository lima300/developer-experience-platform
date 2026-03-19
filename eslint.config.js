import { base } from '@dxp/eslint-config/base';

export default [
  ...base,
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
