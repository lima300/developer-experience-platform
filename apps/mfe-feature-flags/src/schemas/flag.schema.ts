import { z } from 'zod';

export const CreateFlagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer'),
  key: z
    .string()
    .min(1, 'Key is required')
    .max(50, 'Key must be 50 characters or fewer')
    .regex(
      /^[a-z][a-z0-9-]*$/,
      'Key must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens',
    ),
  description: z.string().max(200, 'Description must be 200 characters or fewer').default(''),
  environments: z.object({
    dev: z.boolean(),
    staging: z.boolean(),
    prod: z.boolean(),
  }),
});

// key is intentionally omitted — immutable after creation.
// Renaming a flag key is a delete+create operation to prevent cascading reference breakage.
export const UpdateFlagSchema = CreateFlagSchema.omit({ key: true }).partial();

export type CreateFlagInput = z.infer<typeof CreateFlagSchema>;
export type UpdateFlagInput = z.infer<typeof UpdateFlagSchema>;
