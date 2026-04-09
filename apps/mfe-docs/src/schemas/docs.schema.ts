import { z } from 'zod';

export const DocEntrySchema: z.ZodType = z.lazy(() =>
  z.object({
    title: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-/]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    content: z.string(),
    children: z.array(DocEntrySchema).optional(),
  }),
);

export const DocManifestSchema = z.array(DocEntrySchema);

export type DocEntryInput = z.infer<typeof DocEntrySchema>;
