import type { CreateExperimentInput } from '../schemas/experiment.schema.js';
import type { Experiment } from '../types/experiment.js';

// ─── Seed data ────────────────────────────────────────────────────────────────

const seed: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Homepage CTA Button Color',
    hypothesis: 'Changing the CTA from blue to green will increase sign-up conversions by 10%.',
    status: 'running',
    variants: [
      {
        id: 'v-001-a',
        name: 'Control (Blue)',
        trafficPercent: 50,
        conversions: 320,
        visitors: 2048,
      },
      {
        id: 'v-001-b',
        name: 'Treatment (Green)',
        trafficPercent: 50,
        conversions: 387,
        visitors: 2103,
      },
    ],
    pValue: 0.03,
    startDate: '2026-03-01T00:00:00.000Z',
    createdAt: '2026-02-28T12:00:00.000Z',
    updatedAt: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'exp-002',
    name: 'Onboarding Flow Step Count',
    hypothesis: 'Reducing onboarding from 5 steps to 3 will increase completion rate.',
    status: 'paused',
    variants: [
      {
        id: 'v-002-a',
        name: 'Control (5 steps)',
        trafficPercent: 50,
        conversions: 140,
        visitors: 600,
      },
      {
        id: 'v-002-b',
        name: 'Treatment (3 steps)',
        trafficPercent: 50,
        conversions: 165,
        visitors: 595,
      },
    ],
    pValue: 0.14,
    startDate: '2026-02-01T00:00:00.000Z',
    createdAt: '2026-01-29T10:00:00.000Z',
    updatedAt: '2026-03-10T15:30:00.000Z',
  },
  {
    id: 'exp-003',
    name: 'Search Bar Placement',
    hypothesis: 'Moving search to the top nav will increase search usage by 20%.',
    status: 'concluded',
    variants: [
      {
        id: 'v-003-a',
        name: 'Control (sidebar)',
        trafficPercent: 50,
        conversions: 210,
        visitors: 1800,
      },
      {
        id: 'v-003-b',
        name: 'Treatment (top nav)',
        trafficPercent: 50,
        conversions: 298,
        visitors: 1812,
      },
    ],
    pValue: 0.001,
    startDate: '2026-01-05T00:00:00.000Z',
    endDate: '2026-02-15T00:00:00.000Z',
    createdAt: '2026-01-04T09:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z',
  },
];

// ─── In-memory store ──────────────────────────────────────────────────────────

const store = new Map<string, Experiment>(seed.map((e) => [e.id, { ...e }]));

export const experimentStore = {
  list(): Experiment[] {
    return Array.from(store.values());
  },

  get(id: string): Experiment | undefined {
    return store.get(id);
  },

  create(input: CreateExperimentInput): Experiment {
    const now = new Date().toISOString();
    const experiment: Experiment = {
      id: crypto.randomUUID(),
      name: input.name,
      hypothesis: input.hypothesis,
      status: 'running',
      variants: input.variants.map((v) => ({
        id: crypto.randomUUID(),
        name: v.name,
        trafficPercent: v.trafficPercent,
        conversions: 0,
        visitors: 0,
      })),
      startDate: input.startDate.toISOString(),
      createdAt: now,
      updatedAt: now,
    };
    store.set(experiment.id, experiment);
    return experiment;
  },

  pause(id: string): Experiment {
    const existing = store.get(id);
    if (!existing) throw new Error(`Experiment not found: ${id}`);
    const updated: Experiment = {
      ...existing,
      status: 'paused',
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return updated;
  },

  conclude(id: string): Experiment {
    const existing = store.get(id);
    if (!existing) throw new Error(`Experiment not found: ${id}`);
    const updated: Experiment = {
      ...existing,
      status: 'concluded',
      endDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return updated;
  },

  /** Reset to seed data — used in tests to ensure isolation. */
  reset(): void {
    store.clear();
    for (const experiment of seed) {
      store.set(experiment.id, { ...experiment });
    }
  },
};
