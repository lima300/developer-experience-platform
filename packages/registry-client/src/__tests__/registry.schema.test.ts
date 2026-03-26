import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RegistrySchema } from '@dxp/federation-contracts';
import { describe, it, expect } from 'vitest';

const registryJson: unknown = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../apps/registry/registry.json'), 'utf-8'),
);

describe('apps/registry/registry.json', () => {
  it('validates against RegistrySchema without errors', () => {
    const result = RegistrySchema.safeParse(registryJson);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it('has at least one MFE entry', () => {
    const result = RegistrySchema.parse(registryJson);
    expect(result.mfes.length).toBeGreaterThan(0);
  });

  it('all MFEs have enabled field set', () => {
    const result = RegistrySchema.parse(registryJson);
    for (const mfe of result.mfes) {
      expect(typeof mfe.enabled).toBe('boolean');
    }
  });
});
