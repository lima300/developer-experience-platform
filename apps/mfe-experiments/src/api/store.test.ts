import { describe, expect, it, beforeEach } from 'vitest';

import { experimentStore } from './store.js';

beforeEach(() => {
  experimentStore.reset();
});

describe('experimentStore.list()', () => {
  it('returns all seeded experiments', () => {
    expect(experimentStore.list().length).toBe(3);
  });
});

describe('experimentStore.get()', () => {
  it('returns an experiment by id', () => {
    const first = experimentStore.list()[0];
    if (!first) return;
    expect(experimentStore.get(first.id)?.id).toBe(first.id);
  });

  it('returns undefined for unknown id', () => {
    expect(experimentStore.get('does-not-exist')).toBeUndefined();
  });
});

describe('experimentStore.create()', () => {
  it('adds a new experiment to the store', () => {
    const before = experimentStore.list().length;
    experimentStore.create({
      name: 'Test Experiment',
      hypothesis: 'Testing increases quality',
      variants: [
        { name: 'Control', trafficPercent: 50 },
        { name: 'Treatment', trafficPercent: 50 },
      ],
      startDate: new Date('2026-05-01'),
    });
    expect(experimentStore.list().length).toBe(before + 1);
  });

  it('sets status to running and zero conversions', () => {
    const created = experimentStore.create({
      name: 'New Exp',
      hypothesis: 'Hypothesis text',
      variants: [
        { name: 'A', trafficPercent: 50 },
        { name: 'B', trafficPercent: 50 },
      ],
      startDate: new Date(),
    });
    expect(created.status).toBe('running');
    expect(created.variants.every((v) => v.conversions === 0)).toBe(true);
  });
});

describe('experimentStore.conclude()', () => {
  it('sets status to concluded', () => {
    const id = experimentStore.list()[0]?.id ?? '';
    const updated = experimentStore.conclude(id);
    expect(updated.status).toBe('concluded');
    expect(updated.endDate).toBeDefined();
  });

  it('throws for unknown id', () => {
    expect(() => experimentStore.conclude('bad-id')).toThrow('Experiment not found: bad-id');
  });
});

describe('experimentStore.pause()', () => {
  it('sets status to paused', () => {
    const id = experimentStore.list()[0]?.id ?? '';
    const updated = experimentStore.pause(id);
    expect(updated.status).toBe('paused');
  });

  it('throws for unknown id', () => {
    expect(() => experimentStore.pause('bad-id')).toThrow('Experiment not found: bad-id');
  });
});

describe('experimentStore.reset()', () => {
  it('restores seed data after mutation', () => {
    const id = experimentStore.list()[0]?.id ?? '';
    experimentStore.conclude(id);
    experimentStore.reset();
    expect(experimentStore.list().length).toBe(3);
  });
});
