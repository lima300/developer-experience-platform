import { Badge, Button } from '@dxp/ui';
import React from 'react';

import type { HistoryEntry } from '../schemas/request.schema.js';

interface RequestHistoryProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

function statusVariant(status?: number): 'success' | 'warning' | 'destructive' | 'default' {
  if (!status) return 'default';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 500) return 'warning';
  if (status >= 500) return 'destructive';
  return 'default';
}

export function RequestHistory({ history, onSelect }: RequestHistoryProps) {
  if (history.length === 0) {
    return <p className="text-sm text-dxp-muted-foreground p-4">No requests sent yet.</p>;
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {history.map((entry) => (
        <Button
          key={entry.id}
          variant="ghost"
          className="w-full justify-start font-mono text-xs gap-2 h-auto py-2"
          onClick={() => onSelect(entry)}
        >
          <Badge variant="default" className="text-[10px] uppercase">
            {entry.method}
          </Badge>
          <span className="truncate flex-1 text-left">{entry.path}</span>
          {entry.statusCode && (
            <Badge variant={statusVariant(entry.statusCode)} className="text-[10px] shrink-0">
              {entry.statusCode}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
