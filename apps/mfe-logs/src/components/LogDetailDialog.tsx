import { Button, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@dxp/ui';
import React from 'react';

import type { LogEntry } from '../types/log.js';

interface LogDetailDialogProps {
  entry: LogEntry | null;
  onClose: () => void;
}

export function LogDetailDialog({ entry, onClose }: LogDetailDialogProps) {
  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-sm">
              {entry?.level} — {entry ? new Date(entry.timestamp).toLocaleString() : ''}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                ✕
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {entry && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 text-sm">
              <span className="text-dxp-muted-foreground">Service:</span>
              <span className="font-medium">{entry.service}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-dxp-muted-foreground">Message:</span>
              <span>{entry.message}</span>
            </div>
            <pre className="font-mono text-sm bg-dxp-surface-elevated rounded-dxp p-4 overflow-auto max-h-64 border border-dxp-border">
              {JSON.stringify(entry.payload, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
