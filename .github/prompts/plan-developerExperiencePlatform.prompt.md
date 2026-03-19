# Plan: Developer Experience Platform (DXP) — Micro-Frontend Architecture

**TL;DR:** Build a config-driven, runtime-composed DXP using Webpack 5 (shell host) + Rsbuild (MFE remotes) via Module Federation, pnpm workspaces, and Turborepo. The shell is a thin orchestrator with zero hardcoded MFE imports. Shared contracts, error isolation, and RBAC are platform-owned. Five MFE teams work independently behind a mount/unmount interface.

## Phase 0 — Monorepo Foundation & Tooling (Week 1–2)

**Why first:** Every subsequent package depends on workspace topology, TypeScript base config, and pnpm resolution. Getting this wrong creates compounding debt.

**Tasks:**

1. **pnpm workspace init** — `pnpm-workspace.yaml` pointing to `apps/*`, `packages/*`, `tools/*`. Root `package.json` with workspace-level scripts. `.npmrc` with `shamefully-hoist=false`
2. **Turborepo pipeline** — `turbo.json` with `build`, `dev`, `test`, `lint`, `type-check` pipelines. `dependsOn: ["^build"]` to ensure packages build before consumers. Remote caching enabled
3. **TypeScript base config** — `packages/tsconfig-base/` with strict mode, `moduleResolution: bundler`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. All apps extend it
4. **ESLint + Prettier shared configs** — `packages/eslint-config/` with base, react, storybook presets. Enforce `import/no-cycle` — critical for MFE boundary hygiene
5. **Git hooks (lefthook)** — pre-commit runs lint-staged; pre-push runs `turbo test --filter=[HEAD^1]` (affected only)
6. **Package naming convention** — apps: `@dxp/shell`, `@dxp/mfe-*`; packages: `@dxp/ui`, `@dxp/federation-contracts`, etc.

**Deliverable:** Clean monorepo with working `pnpm install`, Turborepo graph, TS + lint CI on push.

---

## Phase 1 — Shared Packages (Week 2–3)

**Why before apps:** MFEs and shell must share these. Build them last and you prototype on unstable contracts.

**Tasks (all parallel after naming convention is set):**

1. **`@dxp/federation-contracts`** _(most critical package in the repo)_
   - `MFEManifest` — Zod schema + TypeScript type for the registry JSON shape
   - `MFEMountFn` — `(container: HTMLElement, props: MFEProps) => MFEInstance`
   - `MFEInstance` — `{ unmount: () => void }`
   - `MFEProps` — `{ auth: AuthContext; router: RouterContext; theme: ThemeContext }`
   - **Zero React dependency** — pure TS + Zod so any framework MFE can implement it
   - This is the inter-team interface contract. Breaking changes require an RFC

2. **`@dxp/registry-client`** — _(depends on federation-contracts)_
   - Fetches registry JSON with retry + exponential backoff
   - Validates response against `MFEManifest[]` Zod schema — hard fail on violation
   - TanStack Query: `staleTime: 5min`, `gcTime: 10min`, `sessionStorage` fallback
   - Exposes `useRegistry()` hook + `RegistryProvider`

3. **`@dxp/ui`** — Design system
   - Radix UI primitives with DXP design tokens
   - Tailwind CSS — export `tailwind.preset.ts` so MFEs extend it (prevents class conflicts)
   - Components: Button, Input, Badge, Dialog, Sidebar, Toast, Skeleton, ErrorBoundary
   - Storybook lives at `apps/storybook/`

4. **`@dxp/auth-context`** — `AuthProvider`, `useAuth()`, mock + swappable real impl
   - Auth shape: `{ user, roles: string[], token, logout }`

5. **`@dxp/observability`** — Sentry wrapper + custom MFE performance instrumentation
   - `trackMFELoad(name, duration)` — sends custom Sentry measurement
   - `useMFEObservability()` hook for MFEs

**Deliverable:** All packages build, export types, pass tests. Storybook renders components.

---

## Phase 2 — Shell Application (Week 3–5)

**Why now:** Shell is the federation host. MFE teams need a running shell to integrate against.

App: `apps/shell/` | Bundler: **Webpack 5**

**Tasks (sequential — each builds on previous):**

1. **Webpack 5 Module Federation host config** _(depends on nothing — do first)_
   - `remotes: {}` — intentionally empty. All remotes loaded dynamically
   - Shared singletons: `react` (eager: true), `react-dom` (eager: true), `react-router-dom`, `@tanstack/react-query`, `@dxp/auth-context`, `@dxp/ui`
   - `eager: true` on React prevents async bootstrap ordering issues
   - `requiredVersion` pinned for every singleton

2. **Dynamic MFE loader** `src/federation/loadRemote.ts` _(depends on webpack config)_
   - Injects `<script src={url}>` dynamically
   - Calls `__webpack_init_sharing__` → `window[scope].init()` → `window[scope].get(module)`
   - Zod runtime-validates returned factory against `MFEMountFn`
   - 10s timeout + 2 retries with 500ms delay
   - Emits Sentry performance span per load

3. **Shell layout** _(parallel with loader)_
   - `AppLayout.tsx` — sidebar + header + `<Outlet>`
   - `Sidebar.tsx` — nav items driven by registry, filtered by user roles
   - `MFEContainer.tsx` — creates DOM node, calls `mount(node, props)`, calls `unmount()` on cleanup via `useEffect` return

4. **Registry-driven routing** _(depends on loader + layout)_
   - `DynamicRouter.tsx` maps `registry.mfes` → `<Route>` entries at runtime
   - `ProtectedRoute.tsx` checks `roles` against `manifest.permissions`
   - `MFERoute.tsx` lazy-loads via `loadRemote` on first route activation
   - Zero hardcoded routes

5. **Per-MFE Error Boundaries** _(parallel with routing)_
   - `MFEErrorBoundary.tsx` wraps each mounted MFE — crash is isolated to that MFE's panel
   - Retry: re-injects remote script + remounts
   - Captures to Sentry with `mfe_name` tag

6. **Mock auth** — JWT-like with role switching for dev mode (`admin`, `dev`, `viewer`)

**Deliverable:** Shell loads, renders sidebar from mock registry, loads a test MFE at `/flags`, RBAC gates navigation, Sentry initialized.

---

## Phase 3 — MFE Template + First MFE (Week 5–6)

**Why template first:** 5 MFE teams need consistent scaffolding. Template encodes the mount contract so there's no guessing.

**Tasks:**

1. **MFE scaffolding tool** `tools/create-mfe/`
   - Script: `pnpm create-mfe <name>` generates `apps/mfe-<name>/`
   - Template includes: `rsbuild.config.ts`, `src/mount.ts`, `src/App.tsx`, `src/bootstrap.tsx`
   - `mount.ts` creates React 18 root, renders `<App>` with passed props, returns `{ unmount: root.unmount }`
   - `bootstrap.tsx` does `import('./App')` async — required pattern for federation shared scope init
   - Rsbuild `moduleFederation({ name, exposes: { './App': './src/mount.ts' }, shared: {...} })`

2. **Feature Flags MFE** `apps/mfe-feature-flags/` _(owned by Team Flags)_
   - Flag list with toggle per environment (dev/staging/prod)
   - Create flag form — Zod schema validation
   - TanStack Query for all data fetching (mock API)
   - All UI via `@dxp/ui` exclusively

**Deliverable:** MFE template, Feature Flags MFE running standalone on port 3001 AND mounted via shell at `/flags` with no hardcoded references.

---

## Phase 4 — Remaining MFEs (Week 6–9) — FULL PARALLEL

Teams work independently. Each team: clone template → develop standalone → register in `registry.json` → validate via shell integration test.

| Team                   | MFE                | Key Technical Concern                                           |
| ---------------------- | ------------------ | --------------------------------------------------------------- |
| **Team Experiments**   | `mfe-experiments`  | Results visualization — recharts, stat significance             |
| **Team Observability** | `mfe-logs`         | Virtualized log rows (TanStack Virtual), debounced search       |
| **Team API Explorer**  | `mfe-api-explorer` | Proxy all requests server-side — never expose tokens in browser |
| **Team Docs**          | `mfe-docs`         | Fuse.js full-text search, versioned routes `/docs/v2/...`       |

**All MFEs must gate on:**

- Zod-validated `MFEMountFn` contract at compile time
- Min 80% unit test coverage on business logic
- Storybook stories for all components
- Exports only `./App` in `exposes` (lint rule enforced)

**Deliverable:** All 5 MFEs running on shell, Storybook complete, coverage reports green.

---

## Phase 5 — Advanced Platform Features (Week 9–12)

**Tasks (Platform/Shell Team owns — can run parallel with Phase 4):**

1. **Versioned MFEs** — Registry entry gains `version` field. Shell loads whatever URL registry specifies. Multiple versions of the same MFE run on different routes simultaneously. Canary field: `canaryPercent: 10` — shell flips per session

2. **Platform-level feature flags** — `registry.mfes[].enabled: boolean`. Disabled: route hidden, 403 on direct nav. Feature Flags MFE drives `enabled` values via API (meta-loop)

3. **Chaos Engineering Mode** — dev/admin-only, toggled via `?chaos=true`
   - `SLOW_LOAD`: configurable delay injected into `loadRemote`
   - `RANDOM_FAILURE`: random throw in `loadRemote` (tests ErrorBoundary)
   - `PARTIAL_LOAD`: `mount()` throws after script loads (tests React boundary)
   - On-screen overlay shows active scenario

4. **Observability Dashboard** — admin-only MFE or shell panel
   - MFE load time P50/P95 (Web Performance API marks)
   - Error rate per MFE (Sentry tags)
   - Registry fetch latency

---

## Phase 6 — Production Hardening (Week 12–14)

1. **Playwright E2E** `apps/e2e/` — shell flow, RBAC, MFE mount/unmount, chaos scenarios, memory leak detection
2. **Contract tests** — CI gate: each MFE's exported `mount` validated against `MFEMountFn` Zod schema
3. **Performance budget** — `webpack-bundle-analyzer` on shell; `<link rel="modulepreload">` for predicted next MFE; shell LCP < 2s enforced in CI
4. **CI/CD pipeline** — `turbo --filter=[HEAD^1]` for affected builds; per-MFE deploy writes new CDN URL to registry; rollback = point registry to previous URL — no shell redeploy

---

## Architecture Decisions & Tradeoffs

| Decision             | Chosen                                | Tradeoff                                                                        |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| Shell bundler        | Webpack 5                             | Best Module Federation maturity vs larger config surface area                   |
| MFE bundler          | Rsbuild                               | Faster dev/build, native federation plugin vs younger ecosystem                 |
| Remote loading       | Fully dynamic (no static `remotes`)   | Zero shell redeployment for MFE releases vs harder local debugging              |
| Styling              | Tailwind + shared preset              | No runtime overhead vs MFEs MUST use DXP preset (no unilateral Tailwind config) |
| State sharing        | Context via shared singletons         | Clean boundaries vs strict version-lock on shared packages                      |
| MFE internal routing | MemoryRouter                          | Shell owns URL bar, MFE routes internally vs deep-linking is complex            |
| Mount interface      | Framework-agnostic `mount(el, props)` | Future-proof (Vue/Svelte MFEs possible) vs boilerplate on every MFE             |

---

## Team Simulation

| Team                   | Owns                                                | Independence Boundary                                                |
| ---------------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| **Platform**           | Shell, registry-client, federation-contracts, CI/CD | Sets contracts; never touches MFE business logic                     |
| **Design System**      | `@dxp/ui`, Storybook                                | Ships semver releases; MFEs pin minor versions                       |
| **Team Flags**         | `mfe-feature-flags`                                 | Deploys independently; integrates only via registry + mount contract |
| **Team Experiments**   | `mfe-experiments`                                   | Same                                                                 |
| **Team Observability** | `mfe-logs`                                          | Consumes `@dxp/observability` for own reporting                      |
| **Team DX**            | `mfe-api-explorer`, `mfe-docs`                      | Docs versioning strategy owned entirely here                         |

Cross-team interface: registry JSON lives in `apps/registry/registry.json` — changes via PR, reviewed by Platform team.

---

## Risks & Pitfalls

1. **Singleton version drift** — React version mismatch between shell and MFE crashes silently. Mitigation: `requiredVersion` pinning + contract CI test that validates shared dep versions
2. **MFE memory leaks** — Event listeners/timers not cleaned in `unmount()`. Mitigation: Playwright test that mounts/unmounts 50× and checks memory
3. **CORS on remoteEntry.js** — CDN must serve with correct CORS headers. Easy to miss in prod. Mitigation: E2E smoke from a different origin in CI
4. **Tailwind class conflicts** — MFE custom Tailwind config overrides shell tokens. Mitigation: ESLint rule: no `tailwind.config.ts` in MFE apps, only root preset
5. **Registry as SPOF** — Registry fetch failure = blank shell. Mitigation: `sessionStorage` fallback + stale-while-revalidate + hardcoded minimal fallback route
6. **MFE exposes too much** — Team exports internal util, creating hidden coupling. Mitigation: lint rule: `exposes` in `rsbuild.config.ts` may only contain `./App`

---

## Milestones

| Milestone               | Week | Gate Criteria                                                                                             |
| ----------------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| **M0: Foundation**      | 2    | `pnpm install` works, Turborepo graph resolves, CI green                                                  |
| **M1: Shared Packages** | 3    | All packages build, types export, Storybook renders                                                       |
| **M2: Shell MVP**       | 5    | Shell loads, registry fetched, Feature Flags MFE mounts at `/flags` via registry — zero hardcoded imports |
| **M3: 3 MFEs**          | 7    | Flags + Experiments + Logs live on shell, RBAC working                                                    |
| **M4: All 5 MFEs**      | 9    | All domains integrated, Storybook complete, 80% coverage                                                  |
| **M5: Advanced**        | 12   | Versioned MFEs, chaos mode, observability dashboard                                                       |
| **M6: Production**      | 14   | E2E passing, Sentry live, shell LCP < 2s, deploy pipeline automated                                       |

---

## Development Order Summary

```
Week 1-2:  Phase 0  — sequential, unblocks everything
Week 2-3:  Phase 1  — parallel among packages, all unblocked after naming convention
Week 3-5:  Phase 2  — sequential within shell: webpack → loader → layout → routing → boundaries
Week 5-6:  Phase 3  — sequential: template then first MFE
Week 6-9:  Phase 4  — FULLY PARALLEL: 4 MFE teams independent
Week 9-12: Phase 5  — Platform team, parallel with Phase 4 completion
Week 12-14: Phase 6 — sequential, requires all above complete
```

---

## Deliverables per Phase

| Phase | Code                        | Docs                                            | Metrics                          |
| ----- | --------------------------- | ----------------------------------------------- | -------------------------------- |
| 0     | Monorepo scaffolding        | Contribution guide, ADR-001 (monorepo decision) | Turborepo build time baseline    |
| 1     | Shared packages             | API docs (TSDoc), Storybook                     | Package bundle sizes             |
| 2     | Shell app                   | Architecture diagram, federation contract spec  | Shell LCP, bundle size           |
| 3     | MFE template, Feature Flags | MFE development guide                           | MFE load time P50                |
| 4     | 4 remaining MFEs            | Per-MFE README                                  | Test coverage report             |
| 5     | Advanced features           | Chaos runbook, versioning guide                 | Error rate baseline              |
| 6     | Full system                 | Runbook, deployment guide                       | Lighthouse scores, P95 load time |

---

## Registry JSON Schema (Reference)

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

---

## MFE Mount Contract (Reference)

```typescript
// @dxp/federation-contracts

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

---

## Technology Stack (Locked)

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
