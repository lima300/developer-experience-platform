import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'featureFlags',
      // remoteEntry.js matches the filename expected by the shell's registry URLs
      filename: 'remoteEntry.js',
      // Only ./App may be exposed — exposing internal modules creates hidden coupling
      exposes: { './App': './src/mount.tsx' },
      shared: {
        // Must mirror shell's webpack.config.ts shared section exactly.
        // Version mismatches cause silent runtime crashes.
        react: { singleton: true, requiredVersion: '^18.0.0', eager: true },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },
        'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
        '@dxp/auth-context': { singleton: true, requiredVersion: '*' },
        '@dxp/ui': { singleton: true, requiredVersion: '*' },
        '@dxp/federation-contracts': { singleton: true, requiredVersion: '*' },
      },
    }),
  ],
  server: {
    port: 3001,
    headers: {
      // Required: shell is served from a different origin (port 3000)
      'Access-Control-Allow-Origin': '*',
    },
  },
});
