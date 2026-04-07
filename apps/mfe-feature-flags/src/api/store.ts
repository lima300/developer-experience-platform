import type { CreateFlagInput, UpdateFlagInput } from '../schemas/flag.schema.js';
import type { Environment, Flag } from '../types/flag.js';

// ─── Seed data ────────────────────────────────────────────────────────────────

const seed: Flag[] = [
  {
    id: 'flag-001',
    name: 'New Dashboard',
    key: 'new-dashboard',
    description: 'Enables the redesigned analytics dashboard.',
    environments: { dev: true, staging: true, prod: false },
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'flag-002',
    name: 'AI Suggestions',
    key: 'ai-suggestions',
    description: 'Shows AI-powered code suggestions in the editor.',
    environments: { dev: true, staging: false, prod: false },
    createdAt: '2026-02-14T11:30:00.000Z',
    updatedAt: '2026-03-01T08:15:00.000Z',
  },
  {
    id: 'flag-003',
    name: 'Dark Mode Beta',
    key: 'dark-mode-beta',
    description: 'Opt-in dark mode for early adopters.',
    environments: { dev: true, staging: true, prod: true },
    createdAt: '2026-02-28T16:45:00.000Z',
    updatedAt: '2026-02-28T16:45:00.000Z',
  },
  {
    id: 'flag-004',
    name: 'Rate Limiting V2',
    key: 'rate-limiting-v2',
    description: 'New token-bucket rate limiter replacing the fixed-window approach.',
    environments: { dev: true, staging: false, prod: false },
    createdAt: '2026-03-15T13:00:00.000Z',
    updatedAt: '2026-03-15T13:00:00.000Z',
  },
];

// ─── In-memory store ──────────────────────────────────────────────────────────

const store = new Map<string, Flag>(seed.map((f) => [f.id, { ...f }]));

export const flagStore = {
  list(): Flag[] {
    return Array.from(store.values());
  },

  get(id: string): Flag | undefined {
    return store.get(id);
  },

  create(input: CreateFlagInput): Flag {
    const now = new Date().toISOString();
    const flag: Flag = {
      id: crypto.randomUUID(),
      name: input.name,
      key: input.key,
      description: input.description,
      environments: input.environments,
      createdAt: now,
      updatedAt: now,
    };
    store.set(flag.id, flag);
    return flag;
  },

  update(id: string, input: UpdateFlagInput): Flag {
    const existing = store.get(id);
    if (!existing) throw new Error(`Flag not found: ${id}`);
    const updated: Flag = {
      id: existing.id,
      key: existing.key,
      createdAt: existing.createdAt,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      environments: { ...existing.environments, ...input.environments },
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return updated;
  },

  toggleEnv(id: string, env: Environment): Flag {
    const existing = store.get(id);
    if (!existing) throw new Error(`Flag not found: ${id}`);
    const updated: Flag = {
      ...existing,
      environments: {
        ...existing.environments,
        [env]: !existing.environments[env],
      },
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return updated;
  },

  delete(id: string): void {
    if (!store.has(id)) throw new Error(`Flag not found: ${id}`);
    store.delete(id);
  },

  /** Reset to seed data — used in tests to ensure isolation. */
  reset(): void {
    store.clear();
    for (const flag of seed) {
      store.set(flag.id, { ...flag });
    }
  },
};
