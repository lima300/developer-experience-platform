import { describe, expect, it } from 'vitest';

import { DocEntrySchema, DocManifestSchema } from './docs.schema.js';

describe('DocEntrySchema', () => {
  it('accepts valid entry', () => {
    const result = DocEntrySchema.safeParse({
      title: 'Getting Started',
      slug: 'getting-started',
      content: '# Hello',
    });
    expect(result.success).toBe(true);
  });

  it('accepts entry with children', () => {
    const result = DocEntrySchema.safeParse({
      title: 'Section',
      slug: 'section',
      content: 'Section content',
      children: [{ title: 'Child', slug: 'section/child', content: 'Child content' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(DocEntrySchema.safeParse({ title: '', slug: 'x', content: '' }).success).toBe(false);
  });

  it('rejects slug with uppercase', () => {
    expect(
      DocEntrySchema.safeParse({ title: 'Test', slug: 'Test-Page', content: '' }).success,
    ).toBe(false);
  });

  it('rejects empty slug', () => {
    expect(DocEntrySchema.safeParse({ title: 'Test', slug: '', content: '' }).success).toBe(false);
  });
});

describe('DocManifestSchema', () => {
  it('accepts an array of entries', () => {
    const result = DocManifestSchema.safeParse([
      { title: 'First', slug: 'first', content: '# First' },
      { title: 'Second', slug: 'second', content: '# Second' },
    ]);
    expect(result.success).toBe(true);
  });

  it('accepts empty array', () => {
    expect(DocManifestSchema.safeParse([]).success).toBe(true);
  });
});
