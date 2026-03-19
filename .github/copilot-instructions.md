# GitHub Copilot Instructions — Developer Experience Platform (DXP)

## Project Overview

This is a **Developer Experience Platform (DXP)** built with a **Micro-Frontend (MFE) architecture**.
The platform simulates how large-scale companies structure internal tools, where multiple teams
independently develop and deploy frontend applications composed into a single interface at runtime.

The shell is a thin orchestrator with **zero hardcoded MFE imports**. Shared contracts, error
isolation, and RBAC are platform-owned. Five MFE teams work independently behind a `mount`/`unmount`
interface. All composition is config-driven via a runtime JSON registry.

---

## Technology Stack

| Layer                | Technology                              |
| -------------------- | --------------------------------------- |
| UI Framework         | React 18                                |
| Language             | TypeScript (strict)                     |
| Shell Bundler        | Webpack 5 (Module Federation host)      |
| MFE Bundler          | Rsbuild (with Module Federation plugin) |
| Package Manager      | pnpm (workspaces)                       |
| Build Orchestration  | Turborepo                               |
| Styling              | Tailwind CSS                            |
| Component Primitives | Radix UI                                |
| Component Docs       | Storybook                               |
| Routing              | React Router v6                         |
| Server State         | TanStack Query                          |
| Unit Testing         | Vitest + React Testing Library          |
| E2E Testing          | Playwright                              |
| Observability        | Sentry                                  |
| Schema Validation    | Zod                                     |

---

## Monorepo Structure

```
/
├── apps/
│   ├── shell/                    # Webpack 5 host — the shell application
│   ├── storybook/                # Storybook for @dxp/ui
│   ├── e2e/                      # Playwright E2E tests
│   ├── registry/                 # registry.json — source of truth for MFE config
│   ├── mfe-feature-flags/        # Feature Flags MFE (Rsbuild)
│   ├── mfe-experiments/          # Experiments/A-B Testing MFE (Rsbuild)
│   ├── mfe-logs/                 # Logs & Observability MFE (Rsbuild)
│   ├── mfe-api-explorer/         # API Explorer MFE (Rsbuild)
│   └── mfe-docs/                 # Documentation MFE (Rsbuild)
├── packages/
│   ├── tsconfig-base/            # Shared TypeScript base config
│   ├── eslint-config/            # Shared ESLint config (base, react, storybook)
│   ├── prettier-config/          # Shared Prettier config
│   ├── federation-contracts/     # MFE mount/unmount contract types + Zod schemas
│   ├── registry-client/          # Registry JSON fetcher + TanStack Query hooks
│   ├── ui/                       # Design system: Radix UI + Tailwind + DXP tokens
│   ├── auth-context/             # AuthProvider, useAuth(), AuthContext type
│   └── observability/            # Sentry wrapper + MFE performance tracking
└── tools/
    └── create-mfe/               # MFE scaffolding CLI
```

---

## Package Naming Convention

- Apps: `@dxp/shell`, `@dxp/mfe-feature-flags`, `@dxp/mfe-experiments`, `@dxp/mfe-logs`, `@dxp/mfe-api-explorer`, `@dxp/mfe-docs`
- Packages: `@dxp/ui`, `@dxp/federation-contracts`, `@dxp/registry-client`, `@dxp/auth-context`, `@dxp/observability`
- Configs: `@dxp/tsconfig-base`, `@dxp/eslint-config`, `@dxp/prettier-config`

---

## Architecture Principles

### Shell Application (`apps/shell/`)

- Built with **Webpack 5** as the Module Federation **host**
- Responsibilities: authentication, layout (sidebar + header), routing orchestration, dynamic MFE loading
- **ZERO hardcoded MFE imports** — all loading is dynamic at runtime via registry
- `remotes: {}` in webpack config — intentionally empty
- `eager: true` for React and ReactDOM shared singletons — prevents async chunk ordering issues
- Fetches and Zod-validates registry JSON at boot via `@dxp/registry-client`
- Each MFE is wrapped in its own `ErrorBoundary` — failures are isolated per MFE panel

### Shell Key Files

```
apps/shell/src/
  federation/
    loadRemote.ts         # Dynamic script injection + webpack federation handshake
    MFELoader.tsx         # React component wrapping loadRemote
  layouts/
    AppLayout.tsx         # Sidebar + Header + <Outlet>
  components/
    Sidebar.tsx           # Nav items driven by registry, filtered by role
    MFEContainer.tsx      # Manages mount/unmount lifecycle
  routing/
    DynamicRouter.tsx     # Maps registry.mfes → <Route> at runtime
    ProtectedRoute.tsx    # RBAC: checks roles against manifest.permissions
    MFERoute.tsx          # Lazy-loads MFE on first route activation
  error-boundaries/
    MFEErrorBoundary.tsx  # Per-MFE isolation; retries on failure
    GlobalErrorBoundary.tsx
  chaos/
    ChaosMiddleware.ts    # Dev-only: injects delays/failures into loadRemote
```

### Dynamic MFE Loader (`loadRemote.ts`)

The loader must follow this exact sequence:

1. Inject `<script src={manifest.url}>` dynamically
2. Call `__webpack_init_sharing__('default')`
3. Call `window[manifest.scope].init(shareScope)`
4. Call `window[manifest.scope].get(manifest.module)`
5. Zod runtime-validate the returned factory against `MFEMountFn`
6. Track load time via `@dxp/observability`

Timeout: reject after 10 seconds. Retry: 2 attempts with 500ms delay.

### Micro-Frontends (`apps/mfe-*/`)

- Built with **Rsbuild** + Module Federation plugin as **remotes**
- Each MFE implements the `MFEMountFn` contract from `@dxp/federation-contracts`
- Each MFE exposes **only** `./App` in the federation `exposes` config — nothing else
- Internal routing uses `<MemoryRouter>` — shell owns the URL bar
- No global state may leak out of an MFE
- All UI via `@dxp/ui` — no custom components built outside the design system

### MFE bootstrap.tsx Pattern (REQUIRED)

```typescript
// src/index.ts
import('./bootstrap');

// src/bootstrap.tsx — always async import
import('./App');
```

This pattern is mandatory for Module Federation shared scope initialization to work correctly.
Never import `App` directly from the entry point.

---

## MFE Mount Contract

Defined in `@dxp/federation-contracts`. This is the single inter-team interface. Breaking changes require an RFC.

```typescript
type MFEMountFn = (container: HTMLElement, props: MFEProps) => MFEInstance;

interface MFEInstance {
  unmount: () => void;
}

interface MFEProps {
  auth: AuthContext;
  router: RouterContext;
  theme: ThemeContext;
}

interface AuthContext {
  user: User;
  roles: string[];
  token: string;
  logout: () => void;
}
```

`@dxp/federation-contracts` has **zero React dependency** — pure TypeScript + Zod — so any framework can implement the contract.

Every `unmount()` must clean up all event listeners, timers, and React roots. Memory leaks in `unmount()` will be caught by Playwright tests that mount/unmount 50× and check memory.

---

## Registry System

The platform is **config-driven** via a runtime JSON registry fetched by the shell at startup.

### Registry JSON Schema

```json
{
  "mfes": [
    {
      "name": "featureFlags",
      "route": "/flags",
      "scope": "featureFlags",
      "module": "./App",
      "url": "https://cdn.app.com/featureFlags/v1/remoteEntry.js",
      "permissions": ["admin", "dev"],
      "enabled": true,
      "version": "1.2.0",
      "canaryPercent": 0
    }
  ]
}
```

- `scope` — matches the `name` in the MFE's Rsbuild federation config
- `module` — the exposed key, always `./App`
- `permissions` — roles allowed to access; shell `ProtectedRoute` enforces this
- `enabled` — platform-level feature flag; `false` hides the route and returns 403 on direct nav
- `version` — informational; the `url` field encodes the actual deployed version
- `canaryPercent` — % of sessions routed to canary URL; 0 = stable only

Registry lives at `apps/registry/registry.json`. All changes via PR, reviewed by Platform team.

---

## Shared Dependencies (Module Federation)

Must be declared identically in shell (`webpack.config.ts`) and every MFE (`rsbuild.config.ts`):

```typescript
shared: {
  'react': { singleton: true, requiredVersion: '^18.0.0', eager: true },
  'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },
  'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
  '@tanstack/react-query': { singleton: true },
  '@dxp/auth-context': { singleton: true },
  '@dxp/ui': { singleton: true },
}
```

**Rule:** `requiredVersion` must be pinned on every singleton. A mismatch causes silent runtime crashes that are difficult to debug.

---

## TypeScript Rules

- Strict mode always on — `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`
- `"moduleResolution": "bundler"`
- All apps and packages extend `packages/tsconfig-base/tsconfig.json`
- **No `any`** — use `unknown` and narrow with Zod or type guards
- No `@ts-ignore` without a comment explaining why and a linked issue

---

## Styling Rules

- **Tailwind CSS only** — no CSS-in-JS, no CSS modules, no inline styles
- MFE apps **must** extend `@dxp/ui`'s exported Tailwind preset — never define a custom `tailwind.config.ts` in an MFE app (enforced by ESLint rule)
- All UI components from `@dxp/ui` (Radix UI primitives with DXP design tokens)
- Dark mode via Tailwind `dark:` variants — never toggled manually

---

## MFE Domain Ownership

| Team                   | MFE                             | Domain                           | Key Concern                                           |
| ---------------------- | ------------------------------- | -------------------------------- | ----------------------------------------------------- |
| **Platform**           | `apps/shell`                    | Orchestration, auth, RBAC        | Federation contracts never break                      |
| **Design System**      | `packages/ui`, `apps/storybook` | Shared UI                        | Semver releases; MFEs pin minor versions              |
| **Team Flags**         | `mfe-feature-flags`             | Flag CRUD, environment switching | Zod-validated forms                                   |
| **Team Experiments**   | `mfe-experiments`               | A/B variants, results viz        | Recharts, statistical significance display            |
| **Team Observability** | `mfe-logs`                      | Log viewer, error tracking       | TanStack Virtual (virtualized rows), debounced search |
| **Team DX**            | `mfe-api-explorer`, `mfe-docs`  | Request builder, markdown docs   | Proxy all API requests server-side; Fuse.js search    |

---

## Turborepo Pipelines

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".rsbuild/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "lint": {},
    "type-check": { "dependsOn": ["^build"] }
  }
}
```

CI uses `turbo run build --filter=[HEAD^1]` to build only affected packages.

---

## Testing Standards

### Unit Tests (Vitest + React Testing Library)

- Minimum **80% coverage** on business logic
- Test files colocated: `src/components/Button.test.tsx`
- Mock all network calls — never hit real endpoints in unit tests
- Use `@testing-library/user-event` for interaction tests, not `fireEvent`

### Contract Tests

- Every MFE must have a test validating its exported `mount` matches `MFEMountFn` Zod schema
- CI blocks merges on contract test failure

### E2E Tests (Playwright) — `apps/e2e/`

- Test shell flow, RBAC, MFE mount/unmount lifecycle, error boundaries, chaos scenarios
- Run against local dev servers with mock registry JSON
- Playwright sharding in CI for parallel execution
- Smoke test: `remoteEntry.js` served with correct CORS headers from a different origin

---

## Observability

- Sentry initialized in shell root via `@dxp/observability`'s `initSentry()`
- Every MFE load tracked: `trackMFELoad(name, durationMs)` — appears as custom Sentry measurement
- Performance marks: `mfe.load.start` / `mfe.load.end` via Web Performance API
- MFE errors captured at `MFEErrorBoundary` with `mfe_name` Sentry tag before rendering fallback
- Observability dashboard (admin-only): P50/P95 load times, error rate per MFE, registry fetch latency

---

## Advanced Platform Features

### Versioned MFEs

- `url` field encodes version: `.../featureFlags/v2.1/remoteEntry.js`
- Multiple versions run simultaneously on different routes — no shell change required
- `canaryPercent` in registry routes a % of sessions to the canary `url`

### Platform Feature Flags

- `registry.mfes[].enabled: boolean` — shell hides route and returns 403 if `false`
- The Feature Flags MFE drives `enabled` values via API (self-referential meta-loop)

### Chaos Engineering Mode (dev/admin only)

- Activated via `?chaos=true` query param or admin UI toggle
- Implemented in `apps/shell/src/chaos/ChaosMiddleware.ts` — intercepts `loadRemote`
- Scenarios:
  - `SLOW_LOAD` — configurable delay before MFE script resolves
  - `RANDOM_FAILURE` — random throw on `loadRemote` (validates `MFEErrorBoundary`)
  - `PARTIAL_LOAD` — script loads but `mount()` throws (validates React error boundary)
- On-screen overlay shows active scenario and affected MFE

---

## Performance Requirements

- Shell initial load (LCP): **< 2 seconds** — enforced in CI via Lighthouse
- MFEs are lazy-loaded **on first route activation**, never at shell boot
- `<link rel="modulepreload">` injected for predicted next MFE route
- Registry response cached: `stale-while-revalidate` strategy + `sessionStorage` fallback
- Shell bundle analyzed with `webpack-bundle-analyzer` before every release

---

## Security Guidelines

- RBAC enforced at shell routing via `ProtectedRoute` — checks `useAuth().roles` against `manifest.permissions`
- API Explorer MFE proxies all HTTP requests server-side — auth tokens never appear in browser network tab
- Registry JSON served from trusted CDN; CORS headers validated in CI E2E smoke test
- No secrets or environment config in MFE bundles — all runtime config passed via `MFEProps`
- `remoteEntry.js` files on CDN must have correct `Access-Control-Allow-Origin` headers

---

## CI/CD Pipeline

```
.github/workflows/
  ci.yml           # lint → type-check → test → build (Turborepo affected)
  deploy-shell.yml # Build + upload shell to CDN
  deploy-mfe.yml   # Per-MFE: build → upload remoteEntry.js + assets to CDN → update registry URL
```

- **MFE deploy** writes the new CDN URL into `registry.json` post-deploy — shell reads it on next page load with **no shell redeploy required**
- **Rollback**: point registry entry URL to previous CDN path — instant, no code change
- **CI gate order**: lint → type-check → unit tests → contract tests → build → E2E

---

## Copilot Behavior Guidelines

When generating code for this project, always follow these rules:

1. **TypeScript strict** — no `any`, no `@ts-ignore` without justification
2. **Never hardcode MFE URLs or imports in shell** — all loading is dynamic via registry
3. **Use `@dxp/ui` components** — never raw HTML elements or custom-styled divs
4. **Validate all external data with Zod** — registry JSON, API responses, MFE factories
5. **Use TanStack Query** for all server state — no bare `useEffect` + `fetch` patterns
6. **Colocate test files** next to source: `Button.tsx` → `Button.test.tsx`
7. **MFE `exposes`** must contain only `./App` — never expose internal modules
8. **Always implement `unmount()`** — clean up React roots, event listeners, and timers
9. **Tailwind only** — no CSS modules, styled-components, emotion, or inline styles
10. **MFEs must extend `@dxp/ui` Tailwind preset** — no standalone `tailwind.config.ts` in MFE apps
11. **Error boundaries per MFE** — contain failures at the MFE boundary, never let them bubble to shell
12. **`bootstrap.tsx` pattern** — always use async `import('./App')` as the MFE entry; never import directly
13. **Registry changes via PR** — never mutate `registry.json` directly in application code
14. **Singleton `requiredVersion`** — always pin version ranges on every shared federation dependency
