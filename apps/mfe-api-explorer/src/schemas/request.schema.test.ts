import { describe, expect, it } from 'vitest';

import { RequestSchema, HistoryEntrySchema, HeaderSchema } from './request.schema.js';

describe('HeaderSchema', () => {
  it('accepts valid header', () => {
    expect(HeaderSchema.safeParse({ key: 'Content-Type', value: 'application/json' }).success).toBe(
      true,
    );
  });

  it('rejects empty key', () => {
    expect(HeaderSchema.safeParse({ key: '', value: 'anything' }).success).toBe(false);
  });
});

describe('RequestSchema', () => {
  const VALID = {
    method: 'GET' as const,
    path: '/api/users',
    headers: [],
    body: undefined,
  };

  it('accepts valid GET request', () => {
    expect(RequestSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects path not starting with /', () => {
    const result = RequestSchema.safeParse({ ...VALID, path: 'api/users' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid method', () => {
    const result = RequestSchema.safeParse({ ...VALID, method: 'CONNECT' });
    expect(result.success).toBe(false);
  });

  it('rejects empty path', () => {
    expect(RequestSchema.safeParse({ ...VALID, path: '' }).success).toBe(false);
  });

  it('accepts all valid HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
    methods.forEach((method) => {
      expect(RequestSchema.safeParse({ ...VALID, method }).success).toBe(true);
    });
  });
});

describe('HistoryEntrySchema', () => {
  const VALID = {
    id: 'test-id',
    timestamp: new Date().toISOString(),
    method: 'GET' as const,
    path: '/api/test',
    headers: [],
    statusCode: 200,
    elapsedMs: 42,
  };

  it('accepts valid history entry', () => {
    expect(HistoryEntrySchema.safeParse(VALID).success).toBe(true);
  });

  it('accepts entry without optional statusCode and elapsedMs', () => {
    const { statusCode: _s, elapsedMs: _e, ...rest } = VALID;
    expect(HistoryEntrySchema.safeParse(rest).success).toBe(true);
  });
});
