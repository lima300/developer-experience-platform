import { captureError } from '@dxp/observability';
import { ErrorFallback, Skeleton } from '@dxp/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { useLogs } from '../api/logs.hooks.js';
import { LogToolbar } from '../components/LogToolbar.js';
import { LogViewer } from '../components/LogViewer.js';

import type { LogLevel, LogPage } from '../types/log.js';

const DEBOUNCE_MS = 300;

export function LogsPage() {
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(new Set());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Debounce the search so we don't re-query on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setSearch(rawSearch), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLogs({
    ...(search ? { search } : {}),
    ...(activeLevels.size > 0 ? { levels: activeLevels } : {}),
    ...(from ? { from: new Date(from) } : {}),
    ...(to ? { to: new Date(to) } : {}),
  });

  if (isError) {
    captureError(error, 'mfe-logs');
  }

  const handleToggleLevel = useCallback((level: LogLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setRawSearch('');
    setSearch('');
    setActiveLevels(new Set());
    setFrom('');
    setTo('');
  }, []);

  const hasFilters = rawSearch !== '' || activeLevels.size > 0 || from !== '' || to !== '';

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="p-4 border-b border-dxp-border bg-dxp-surface-elevated flex gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="p-4 flex flex-col gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-dxp" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorFallback error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <LogToolbar
        search={rawSearch}
        onSearchChange={setRawSearch}
        activeLevels={activeLevels}
        onToggleLevel={handleToggleLevel}
        from={from}
        onFromChange={setFrom}
        to={to}
        onToChange={setTo}
        onClear={handleClear}
        hasFilters={hasFilters}
      />
      <LogViewer
        pages={(data?.pages ?? []) as LogPage[]}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={() => void fetchNextPage()}
      />
    </div>
  );
}
