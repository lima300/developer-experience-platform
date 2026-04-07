import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { simulateAsync } from './simulated.js';
import { flagStore } from './store.js';

import type { CreateFlagInput, UpdateFlagInput } from '../schemas/flag.schema.js';
import type { Environment } from '../types/flag.js';

// ─── Query keys ───────────────────────────────────────────────────────────────
// Defined as constants so invalidation targets are never typo'd.

export const flagsQueryKey = ['featureFlags', 'flags'] as const;
export const flagQueryKey = (id: string) => ['featureFlags', 'flag', id] as const;

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useFlags() {
  return useQuery({
    queryKey: flagsQueryKey,
    queryFn: () => simulateAsync(flagStore.list()),
  });
}

export function useFlag(id: string) {
  return useQuery({
    queryKey: flagQueryKey(id),
    queryFn: () => simulateAsync(flagStore.get(id) ?? null),
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFlagInput) => simulateAsync(flagStore.create(input)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: flagsQueryKey });
    },
  });
}

export function useUpdateFlag(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFlagInput) => simulateAsync(flagStore.update(id, input)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: flagsQueryKey });
      void qc.invalidateQueries({ queryKey: flagQueryKey(id) });
    },
  });
}

export function useToggleEnv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, env }: { id: string; env: Environment }) =>
      simulateAsync(flagStore.toggleEnv(id, env)),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: flagsQueryKey });
      void qc.invalidateQueries({ queryKey: flagQueryKey(id) });
    },
  });
}

export function useDeleteFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => simulateAsync(flagStore.delete(id)).then(() => id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: flagsQueryKey });
    },
  });
}
