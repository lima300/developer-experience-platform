import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      include: ['src/**'],
      exclude: [
        'src/index.ts',
        'src/bootstrap.tsx',
        'src/mount.tsx',
        'src/test-utils/**',
        'src/**/*.test.*',
        'src/components/**',
        'src/data/**',
        'src/types/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
