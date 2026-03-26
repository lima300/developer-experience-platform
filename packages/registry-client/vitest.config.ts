import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    // Allow JSON imports in tests
    conditions: ['import', 'module', 'browser', 'default'],
  },
  esbuild: {
    target: 'es2022',
  },
});
