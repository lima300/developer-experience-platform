import { beforeEach, describe, expect, it } from 'vitest';

import { flagStore } from './store.js';

import type { Flag } from '../types/flag.js';

beforeEach(() => {
  flagStore.reset();
});

describe('flagStore.list()', () => {
  it('returns all seeded flags', () => {
    const flags = flagStore.list();
    expect(flags.length).toBe(4);
  });
});

describe('flagStore.get()', () => {
  it('returns the flag with matching id', () => {
    const flags = flagStore.list();
    const first = flags[0] as Flag;
    expect(flagStore.get(first.id)).toEqual(first);
  });

  it('returns undefined for an unknown id', () => {
    expect(flagStore.get('does-not-exist')).toBeUndefined();
  });
});

describe('flagStore.create()', () => {
  it('generates a unique id for each flag', () => {
    const a = flagStore.create({
      name: 'Flag A',
      key: 'flag-a',
      description: '',
      environments: { dev: true, staging: false, prod: false },
    });
    const b = flagStore.create({
      name: 'Flag B',
      key: 'flag-b',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(a.id).not.toBe(b.id);
  });

  it('sets createdAt to a valid ISO string', () => {
    const flag = flagStore.create({
      name: 'Flag',
      key: 'flag',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(() => new Date(flag.createdAt)).not.toThrow();
    expect(flag.id).toBeTruthy();
  });

  it('persists the new flag in list()', () => {
    flagStore.create({
      name: 'New',
      key: 'new',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(flagStore.list().length).toBe(5);
  });
});

describe('flagStore.toggleEnv()', () => {
  it('flips a boolean environment value', () => {
    const flags = flagStore.list();
    const flag = flags[0] as Flag;
    const before = flag.environments.dev;
    const updated = flagStore.toggleEnv(flag.id, 'dev');
    expect(updated.environments.dev).toBe(!before);
  });

  it('updates updatedAt', () => {
    const flag = flagStore.list()[0] as Flag;
    const before = flag.updatedAt;
    const updated = flagStore.toggleEnv(flag.id, 'staging');
    expect(updated.updatedAt).not.toBe(before);
  });

  it('throws for an unknown id', () => {
    expect(() => flagStore.toggleEnv('bad-id', 'dev')).toThrow('Flag not found');
  });
});

describe('flagStore.delete()', () => {
  it('removes the flag from list()', () => {
    const flag = flagStore.list()[0] as Flag;
    flagStore.delete(flag.id);
    expect(flagStore.get(flag.id)).toBeUndefined();
    expect(flagStore.list().length).toBe(3);
  });

  it('throws for an unknown id', () => {
    expect(() => flagStore.delete('bad-id')).toThrow('Flag not found');
  });
});
