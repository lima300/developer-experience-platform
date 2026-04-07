import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      include: ['src/**'],
      exclude: [
        'src/index.ts',
        'src/bootstrap.tsx',
        'src/mount.tsx',
        'src/test-utils/**',
        'src/**/*.test.*',
        'src/**/*.test-setup.*',
        // UI wrappers — covered by visual inspection and e2e; business logic is in
        // src/api/ and src/schemas/ which have 100% coverage.
        'src/components/**',
      ],
    },
  },
});
