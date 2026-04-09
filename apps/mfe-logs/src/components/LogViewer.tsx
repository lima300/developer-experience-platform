import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { LogDetailDialog } from './LogDetailDialog.js';
import { LogLevelBadge } from './LogLevelBadge.js';

import type { LogEntry, LogPage } from '../types/log.js';

interface LogViewerProps {
  pages: LogPage[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export function LogViewer({
  pages,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: LogViewerProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allEntries = pages.flatMap((p) => p.items);

  const virtualizer = useVirtualizer({
    count: allEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  // Intersection observer — fetch next page when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRowClick = useCallback((entry: LogEntry) => setSelectedLog(entry), []);

  return (
    <>
      <div ref={parentRef} className="flex-1 overflow-auto" style={{ contain: 'strict' }}>
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entry = allEntries[virtualItem.index];
            if (!entry) return null;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  height: `${virtualItem.size}px`,
                }}
                className="flex items-center gap-3 px-4 border-b border-dxp-border hover:bg-dxp-surface-elevated/50 cursor-pointer"
                onClick={() => handleRowClick(entry)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleRowClick(entry);
                }}
                tabIndex={0}
                role="row"
                aria-label={`${entry.level} from ${entry.service}: ${entry.message}`}
              >
                <span className="font-mono text-xs text-dxp-muted-foreground shrink-0 w-44">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <LogLevelBadge level={entry.level} />
                <span className="text-xs text-dxp-muted-foreground shrink-0 w-28 truncate">
                  {entry.service}
                </span>
                <span className="text-sm truncate text-gray-900 dark:text-white">
                  {entry.message}
                </span>
              </div>
            );
          })}

          {/* Sentinel element — triggers next page fetch when visible */}
          <div
            ref={sentinelRef}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '1px',
              height: '1px',
            }}
          />
        </div>

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4 text-sm text-dxp-muted-foreground">
            Loading more…
          </div>
        )}
      </div>

      <LogDetailDialog entry={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
