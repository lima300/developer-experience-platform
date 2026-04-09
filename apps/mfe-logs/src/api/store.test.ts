import { describe, expect, it } from 'vitest';

import { logStore } from './store.js';

describe('logStore.count()', () => {
  it('generates 10,000 entries', () => {
    expect(logStore.count()).toBe(10_000);
  });
});

describe('logStore.query()', () => {
  it('returns default page of 50 entries', () => {
    const { items, nextCursor } = logStore.query();
    expect(items.length).toBe(50);
    expect(nextCursor).not.toBeNull();
  });

  it('filters by level', () => {
    const { items } = logStore.query({ levels: new Set(['ERROR']), limit: 200 });
    expect(items.every((e) => e.level === 'ERROR')).toBe(true);
  });

  it('filters by search string (message)', () => {
    const { items } = logStore.query({ search: 'authenticated', limit: 100 });
    expect(
      items.every(
        (e) =>
          e.message.toLowerCase().includes('authenticated') ||
          e.service.toLowerCase().includes('authenticated'),
      ),
    ).toBe(true);
  });

  it('filters by multiple levels', () => {
    const levels = new Set<'ERROR' | 'WARN'>(['ERROR', 'WARN']);
    const { items } = logStore.query({ levels, limit: 200 });
    expect(items.every((e) => e.level === 'ERROR' || e.level === 'WARN')).toBe(true);
  });

  it('returns null nextCursor when no more pages', () => {
    const { nextCursor } = logStore.query({ search: 'zzznomatchxxxxxx' });
    expect(nextCursor).toBeNull();
  });

  it('returns entries after cursor', () => {
    const first = logStore.query({ limit: 2 });
    expect(first.nextCursor).not.toBeNull();
    const second = logStore.query({
      ...(first.nextCursor ? { cursor: first.nextCursor } : {}),
      limit: 2,
    });
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id);
  });

  it('applies from/to date filters', () => {
    const entries = logStore.query({ limit: 10_000 });
    const sampleEntry = entries.items[5];
    if (!sampleEntry) return;
    const from = new Date(sampleEntry.timestamp);
    const result = logStore.query({ from, limit: 100 });
    expect(result.items.every((e) => new Date(e.timestamp) >= from)).toBe(true);
  });

  it('applies to date filter', () => {
    const entries = logStore.query({ limit: 10_000 });
    const sampleEntry = entries.items[100];
    if (!sampleEntry) return;
    const to = new Date(sampleEntry.timestamp);
    const result = logStore.query({ to, limit: 200 });
    expect(result.items.every((e) => new Date(e.timestamp) <= to)).toBe(true);
  });
});
