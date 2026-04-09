import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'docs',
      exposes: {
        './App': './src/mount.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0', eager: true },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },
        'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
        '@dxp/auth-context': { singleton: true, requiredVersion: 'workspace:*' },
        '@dxp/ui': { singleton: true, requiredVersion: 'workspace:*' },
        '@dxp/federation-contracts': { singleton: true, requiredVersion: 'workspace:*' },
      },
    }),
  ],
  server: {
    port: 3005,
  },
  html: {
    template: './public/index.html',
  },
});
