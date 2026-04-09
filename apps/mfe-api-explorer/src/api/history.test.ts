import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readHistory, writeHistory, clearHistory, buildHistoryEntry } from './history.js';

beforeEach(() => {
  sessionStorage.clear();
});

describe('readHistory', () => {
  it('returns empty array when storage is empty', () => {
    expect(readHistory()).toEqual([]);
  });

  it('returns persisted entries', () => {
    const entry = buildHistoryEntry({ method: 'GET', path: '/api/test', headers: [] }, 200, 55);
    writeHistory(entry);
    const result = readHistory();
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('/api/test');
  });

  it('discards entries that fail Zod validation', () => {
    sessionStorage.setItem('dxp.apiexplorer.history', JSON.stringify([{ bad: 'data' }]));
    expect(readHistory()).toEqual([]);
  });

  it('handles corrupted JSON gracefully', () => {
    sessionStorage.setItem('dxp.apiexplorer.history', '{{invalid');
    expect(readHistory()).toEqual([]);
  });
});

describe('writeHistory', () => {
  it('prepends new entry', () => {
    const e1 = buildHistoryEntry({ method: 'GET', path: '/first', headers: [] }, 200, 10);
    const e2 = buildHistoryEntry({ method: 'POST', path: '/second', headers: [] }, 201, 20);
    writeHistory(e1);
    writeHistory(e2);
    const result = readHistory();
    expect(result[0]?.path).toBe('/second');
    expect(result[1]?.path).toBe('/first');
  });

  it('caps entries at 20', () => {
    for (let i = 0; i < 25; i++) {
      writeHistory(buildHistoryEntry({ method: 'GET', path: `/api/${i}`, headers: [] }, 200, i));
    }
    expect(readHistory()).toHaveLength(20);
  });

  it('handles sessionStorage write failure gracefully', () => {
    const original = sessionStorage.setItem.bind(sessionStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    // should not throw
    expect(() =>
      writeHistory(buildHistoryEntry({ method: 'GET', path: '/test', headers: [] }, 200, 5)),
    ).not.toThrow();
    Storage.prototype.setItem = original;
  });
});

describe('clearHistory', () => {
  it('removes all entries', () => {
    writeHistory(buildHistoryEntry({ method: 'GET', path: '/x', headers: [] }, 200, 5));
    clearHistory();
    expect(readHistory()).toEqual([]);
  });
});

describe('buildHistoryEntry', () => {
  it('includes all fields', () => {
    const entry = buildHistoryEntry(
      { method: 'DELETE', path: '/api/items/1', headers: [] },
      204,
      30,
    );
    expect(entry.method).toBe('DELETE');
    expect(entry.path).toBe('/api/items/1');
    expect(entry.statusCode).toBe(204);
    expect(entry.elapsedMs).toBe(30);
    expect(typeof entry.id).toBe('string');
    expect(typeof entry.timestamp).toBe('string');
  });
});
