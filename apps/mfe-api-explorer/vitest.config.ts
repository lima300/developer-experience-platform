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
        'src/test-setup.ts',
        'src/components/**',
        // Pure I/O adapter — tested at integration level
        'src/api/proxy.ts',
      ],
    },
  },
});
