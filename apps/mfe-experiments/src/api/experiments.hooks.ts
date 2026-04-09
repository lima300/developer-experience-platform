import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { simulateAsync } from './simulated.js';
import { experimentStore } from './store.js';

import type { CreateExperimentInput } from '../schemas/experiment.schema.js';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const experimentsQueryKey = ['experiments', 'list'] as const;
export const experimentQueryKey = (id: string) => ['experiments', 'detail', id] as const;

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useExperiments() {
  return useQuery({
    queryKey: experimentsQueryKey,
    queryFn: () => simulateAsync(experimentStore.list()),
  });
}

export function useExperiment(id: string) {
  return useQuery({
    queryKey: experimentQueryKey(id),
    queryFn: () => simulateAsync(experimentStore.get(id) ?? null),
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExperimentInput) => simulateAsync(experimentStore.create(input)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: experimentsQueryKey });
    },
  });
}

export function usePauseExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => simulateAsync(experimentStore.pause(id)),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: experimentsQueryKey });
      void qc.invalidateQueries({ queryKey: experimentQueryKey(id) });
    },
  });
}

export function useConcludeExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => simulateAsync(experimentStore.conclude(id)),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: experimentsQueryKey });
      void qc.invalidateQueries({ queryKey: experimentQueryKey(id) });
    },
  });
}
