import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export interface ScaffoldOptions {
  name: string; // kebab-case e.g. "feature-flags"
  port: number;
}

// ─── Workspace root detection ─────────────────────────────────────────────────

function findWorkspaceRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('Could not find pnpm-workspace.yaml — are you inside the monorepo?');
}

// ─── String helpers ───────────────────────────────────────────────────────────

function toCamelCase(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function toPascalCase(kebab: string): string {
  const camel = toCamelCase(kebab);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// ─── File templates ───────────────────────────────────────────────────────────

function packageJson(name: string): string {
  return JSON.stringify(
    {
      name: `@dxp/mfe-${name}`,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'rsbuild dev',
        build: 'rsbuild build',
        'type-check': 'tsc --noEmit',
        lint: 'eslint src',
        test: 'vitest run --coverage',
        'test:watch': 'vitest',
      },
      dependencies: {
        '@dxp/auth-context': 'workspace:*',
        '@dxp/federation-contracts': 'workspace:*',
        '@dxp/ui': 'workspace:*',
        react: '^18.3.0',
        'react-dom': '^18.3.0',
        'react-router-dom': '^6.0.0',
        '@tanstack/react-query': '^5.0.0',
        zod: '^3.0.0',
      },
      devDependencies: {
        '@dxp/eslint-config': 'workspace:*',
        '@dxp/tsconfig-base': 'workspace:*',
        '@module-federation/rsbuild-plugin': '^2.3.0',
        '@rsbuild/core': '^1.7.0',
        '@rsbuild/plugin-react': '^1.4.0',
        '@testing-library/jest-dom': '^6.0.0',
        '@testing-library/react': '^16.0.0',
        '@testing-library/user-event': '^14.0.0',
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        '@vitest/coverage-v8': '^2.0.0',
        autoprefixer: '^10.4.20',
        jsdom: '^25.0.0',
        tailwindcss: '^3.4.17',
        typescript: '^5.7.3',
        vitest: '^2.0.0',
      },
    },
    null,
    2,
  );
}

function tsconfigJson(): string {
  return JSON.stringify(
    {
      extends: '@dxp/tsconfig-base',
      compilerOptions: { noEmit: true },
      include: ['src'],
    },
    null,
    2,
  );
}

function rsbuildConfig(camelName: string, port: number): string {
  return `import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: '${camelName}',
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
    port: ${port},
    headers: {
      // Required: shell is served from a different origin (port 3000)
      'Access-Control-Allow-Origin': '*',
    },
  },
});
`;
}

function tailwindConfig(): string {
  return `import { dxpPreset } from '@dxp/ui/tailwind';
import type { Config } from 'tailwindcss';

// MFEs must extend the DXP preset — never define standalone Tailwind tokens.
// This ensures design system CSS variables resolve correctly inside the shell.
export default {
  presets: [dxpPreset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
`;
}

function postcssConfig(): string {
  return `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`;
}

function eslintConfig(): string {
  return `import { react } from '@dxp/eslint-config/react';

export default [...react, { ignores: ['dist/**', 'node_modules/**', '.rsbuild/**'] }];
`;
}

function vitestConfig(): string {
  return `import { defineConfig } from 'vitest/config';

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
        'src/mount.ts',
        'src/test-utils/**',
        'src/**/*.test.*',
        'src/**/*.test-setup.*',
      ],
    },
  },
});
`;
}

function srcIndexTs(): string {
  return `// Dynamic import REQUIRED for Module Federation.
// Deferring bootstrap until after the federation container.init() call
// ensures shared singletons (React, etc.) are resolved before any module runs.
// See: https://webpack.js.org/concepts/module-federation/#troubleshooting
import('./bootstrap');
`;
}

function srcBootstrapTsx(_name: string): string {
  return `import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';
import './styles/globals.css';

// Standalone dev entry — only runs when using \`rsbuild dev\` directly.
// In federated mode (mounted by shell), mount.ts is used instead.
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App {...MOCK_PROPS} />);
}
`;
}

function srcMountTs(_pascalName: string): string {
  return `import React from 'react';
import { createRoot } from 'react-dom/client';

import type { MFEMountFn } from '@dxp/federation-contracts';

import { App } from './App.js';

const mount: MFEMountFn = (container, props) => {
  // Apply dark mode class so Tailwind dark: variants work inside this MFE
  container.classList.toggle('dark', props.theme.mode === 'dark');

  const root = createRoot(container);
  root.render(<App {...props} />);

  return {
    unmount: () => {
      root.unmount();
      container.classList.remove('dark');
    },
  };
};

// Must be default export — loadRemote.ts reads Module.default and validates
// against MFEMountFnSchema. A named export silently fails Zod validation.
export default mount;
`;
}

function srcAppTsx(_pascalName: string): string {
  return `import React, { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { MFEProps } from '@dxp/federation-contracts';

// QueryClient created inside component so each mount() call gets a fresh cache.
// Do NOT hoist to module level — it would be shared across mount/unmount cycles.
export function App(props: MFEProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Shell owns the URL bar — MemoryRouter is mandatory for all MFEs */}
      <MemoryRouter>
        <Routes>
          {/* TODO: add routes */}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
`;
}

function srcTestSetupTs(): string {
  return `import '@testing-library/jest-dom';\n`;
}

function srcTestUtilsMockPropsTs(): string {
  return `import type { MFEProps } from '@dxp/federation-contracts';

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
`;
}

function srcStylesGlobalsCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* DXP design tokens — mirrors apps/shell/src/styles/globals.css.
   Required for standalone dev mode (bootstrap.tsx).
   In shell-mounted mode, the shell provides these via its own globals.css. */
:root {
  --dxp-primary: 239 84% 67%;
  --dxp-primary-foreground: 0 0% 100%;
  --dxp-surface: 0 0% 100%;
  --dxp-surface-elevated: 220 14% 96%;
  --dxp-muted: 220 14% 96%;
  --dxp-muted-foreground: 220 9% 46%;
  --dxp-border: 220 13% 91%;
  --dxp-accent: 220 14% 96%;
  --dxp-accent-foreground: 220 9% 9%;
  --dxp-destructive: 0 84% 60%;
  --dxp-success: 142 71% 45%;
  --dxp-warning: 38 92% 50%;
}

.dark {
  --dxp-surface: 222 47% 11%;
  --dxp-surface-elevated: 217 33% 17%;
  --dxp-muted: 217 33% 17%;
  --dxp-muted-foreground: 215 20% 65%;
  --dxp-border: 217 33% 25%;
  --dxp-accent: 217 33% 17%;
  --dxp-accent-foreground: 210 40% 98%;
}
`;
}

function publicIndexHtml(name: string, pascalName: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pascalName} — DXP</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
}

// ─── Main scaffold function ───────────────────────────────────────────────────

export function scaffoldMFE({ name, port }: ScaffoldOptions): void {
  const camelName = toCamelCase(name);
  const pascalName = toPascalCase(name);
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const dir = path.join(workspaceRoot, 'apps', `mfe-${name}`);

  if (fs.existsSync(dir)) {
    console.error(`Directory already exists: ${dir}`);
    process.exit(1);
  }

  const files: Record<string, string> = {
    'package.json': packageJson(name),
    'tsconfig.json': tsconfigJson(),
    'rsbuild.config.ts': rsbuildConfig(camelName, port),
    'tailwind.config.ts': tailwindConfig(),
    'postcss.config.js': postcssConfig(),
    'eslint.config.js': eslintConfig(),
    'vitest.config.ts': vitestConfig(),
    'public/index.html': publicIndexHtml(name, pascalName),
    'src/index.ts': srcIndexTs(),
    'src/bootstrap.tsx': srcBootstrapTsx(name),
    'src/mount.tsx': srcMountTs(pascalName),
    'src/App.tsx': srcAppTsx(pascalName),
    'src/test-setup.ts': srcTestSetupTs(),
    'src/test-utils/mockProps.ts': srcTestUtilsMockPropsTs(),
    'src/styles/globals.css': srcStylesGlobalsCss(),
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  created  ${path.relative(process.cwd(), fullPath)}`);
  }

  console.log(`\nScaffolded @dxp/mfe-${name} at ${path.relative(process.cwd(), dir)}`);
  console.log(`Next: pnpm install && pnpm --filter @dxp/mfe-${name} dev`);
}
