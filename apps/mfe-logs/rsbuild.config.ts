import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'logs',
      filename: 'remoteEntry.js',
      exposes: { './App': './src/mount.tsx' },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0', eager: true },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },
        'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
        '@dxp/auth-context': { singleton: true, requiredVersion: '*' },
        '@dxp/ui': { singleton: true, requiredVersion: '*' },
        '@dxp/federation-contracts': { singleton: true, requiredVersion: '*' },
        '@dxp/observability': { singleton: true, requiredVersion: '*' },
      },
    }),
  ],
  server: {
    port: 3003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
