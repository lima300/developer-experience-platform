import { describe, expect, it } from 'vitest';

import { CreateExperimentSchema } from './experiment.schema.js';

describe('CreateExperimentSchema', () => {
  const VALID = {
    name: 'My Experiment',
    hypothesis: 'This will improve conversions',
    variants: [
      { name: 'Control', trafficPercent: 50 },
      { name: 'Treatment', trafficPercent: 50 },
    ],
    startDate: '2026-05-01',
  };

  it('accepts valid input', () => {
    expect(CreateExperimentSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateExperimentSchema.safeParse({ ...VALID, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing hypothesis', () => {
    const result = CreateExperimentSchema.safeParse({ ...VALID, hypothesis: '' });
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 2 variants', () => {
    const result = CreateExperimentSchema.safeParse({
      ...VALID,
      variants: [{ name: 'Only', trafficPercent: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects variants that do not sum to 100', () => {
    const result = CreateExperimentSchema.safeParse({
      ...VALID,
      variants: [
        { name: 'A', trafficPercent: 60 },
        { name: 'B', trafficPercent: 60 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 80 chars', () => {
    const result = CreateExperimentSchema.safeParse({ ...VALID, name: 'a'.repeat(81) });
    expect(result.success).toBe(false);
  });
});
