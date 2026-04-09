import { describe, expect, it } from 'vitest';

import { docsStore } from './store.js';

describe('docsStore', () => {
  it('tree is non-empty', () => {
    expect(docsStore.tree.length).toBeGreaterThan(0);
  });

  it('flat list includes all tree entries', () => {
    const flat = docsStore.getAllDocs();
    expect(flat.length).toBeGreaterThan(0);
    // top-level entries should all appear
    docsStore.tree.forEach((entry) => {
      expect(flat.some((f) => f.slug === entry.slug)).toBe(true);
    });
  });

  it('flat list includes nested entries', () => {
    const flat = docsStore.getAllDocs();
    const nested = docsStore.tree.flatMap((e) => e.children ?? []);
    nested.forEach((child) => {
      expect(flat.some((f) => f.slug === child.slug)).toBe(true);
    });
  });

  it('getDoc resolves a top-level slug', () => {
    const firstSlug = docsStore.tree[0]?.slug;
    if (!firstSlug) return;
    const doc = docsStore.getDoc(firstSlug);
    expect(doc).toBeDefined();
    expect(doc?.slug).toBe(firstSlug);
  });

  it('getDoc returns undefined for unknown slug', () => {
    expect(docsStore.getDoc('does-not-exist')).toBeUndefined();
  });

  it('nested entries carry parentSlug', () => {
    const flat = docsStore.getAllDocs();
    const nested = flat.filter((f) => f.parentSlug !== undefined);
    expect(nested.length).toBeGreaterThan(0);
  });
});
