import { useInfiniteQuery } from '@tanstack/react-query';

import { simulateAsync } from './simulated.js';
import { logStore } from './store.js';

import type { LogLevel, LogQuery } from '../types/log.js';

// ─── Query keys ───────────────────────────────────────────────────────────────

export function logsQueryKey(filters: Omit<LogQuery, 'cursor' | 'limit'>) {
  return ['logs', 'list', filters] as const;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

interface UseLogsParams {
  search?: string;
  levels?: Set<LogLevel>;
  from?: Date;
  to?: Date;
}

export function useLogs(params: UseLogsParams = {}) {
  return useInfiniteQuery({
    queryKey: logsQueryKey(params),
    queryFn: ({ pageParam }) => {
      const cursor = typeof pageParam === 'string' ? pageParam : undefined;
      const query: LogQuery = { ...params, limit: 50 };
      if (cursor !== undefined) query.cursor = cursor;
      return simulateAsync(logStore.query(query));
    },
    initialPageParam: undefined as unknown as string,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    placeholderData: (prev) => prev,
  });
}
