import { z } from 'zod';

export const VariantInputSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  trafficPercent: z
    .number({ invalid_type_error: 'Traffic must be a number' })
    .min(0, 'Must be 0 or more')
    .max(100, 'Must be 100 or less'),
});

export const CreateExperimentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
    hypothesis: z.string().min(1, 'Hypothesis is required'),
    variants: z.array(VariantInputSchema).min(2, 'At least 2 variants are required'),
    startDate: z.coerce.date({ invalid_type_error: 'Start date is required' }),
  })
  .refine((data) => data.variants.reduce((sum, v) => sum + v.trafficPercent, 0) === 100, {
    message: 'Variant traffic allocations must sum to 100%',
    path: ['variants'],
  });

export type VariantInput = z.infer<typeof VariantInputSchema>;
export type CreateExperimentInput = z.infer<typeof CreateExperimentSchema>;
