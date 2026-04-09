import { z } from 'zod';

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export const HeaderSchema = z.object({
  key: z.string().min(1, 'Header name is required'),
  value: z.string(),
});

export const RequestSchema = z.object({
  method: z.enum(HTTP_METHODS),
  path: z.string().min(1, 'Path is required').regex(/^\//, 'Path must start with /'),
  headers: z.array(HeaderSchema),
  body: z.string().optional(),
});

export const HistoryEntrySchema = RequestSchema.extend({
  id: z.string(),
  timestamp: z.string(),
  statusCode: z.number().optional(),
  elapsedMs: z.number().optional(),
});

export type Header = z.infer<typeof HeaderSchema>;
export type RequestInput = z.infer<typeof RequestSchema>;
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;
