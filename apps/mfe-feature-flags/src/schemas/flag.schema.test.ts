import { describe, expect, it } from 'vitest';

import { CreateFlagSchema, UpdateFlagSchema } from './flag.schema.js';

describe('CreateFlagSchema', () => {
  it('accepts a valid input', () => {
    const result = CreateFlagSchema.safeParse({
      name: 'My Flag',
      key: 'my-flag',
      description: 'A test flag',
      environments: { dev: true, staging: false, prod: false },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = CreateFlagSchema.safeParse({
      name: '',
      key: 'my-flag',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/required/i);
  });

  it('rejects a key with uppercase letters', () => {
    const result = CreateFlagSchema.safeParse({
      name: 'My Flag',
      key: 'MyFlag',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a key with spaces', () => {
    const result = CreateFlagSchema.safeParse({
      name: 'My Flag',
      key: 'my flag',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 50 characters', () => {
    const result = CreateFlagSchema.safeParse({
      name: 'a'.repeat(51),
      key: 'valid-key',
      description: '',
      environments: { dev: false, staging: false, prod: false },
    });
    expect(result.success).toBe(false);
  });
});

describe('UpdateFlagSchema', () => {
  it('accepts a partial update', () => {
    const result = UpdateFlagSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('does not include the key field', () => {
    // key is intentionally omitted from UpdateFlagSchema — it is immutable
    const schema = UpdateFlagSchema;
    // @ts-expect-error — key must not exist on UpdateFlagSchema
    expect(schema.shape['key']).toBeUndefined();
  });

  it('accepts an empty object (all optional)', () => {
    const result = UpdateFlagSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
