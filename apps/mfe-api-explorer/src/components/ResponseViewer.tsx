import { Badge } from '@dxp/ui';
import React from 'react';

import type { ProxyResponse } from '../api/proxy.js';

interface ResponseViewerProps {
  response: ProxyResponse | null;
}

function statusVariant(status: number): 'success' | 'warning' | 'destructive' | 'default' {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 500) return 'warning';
  if (status >= 500) return 'destructive';
  return 'default';
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  if (!response) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-dxp-muted-foreground text-center">
          Send a request to see the response.
        </p>
      </div>
    );
  }

  const bodyStr =
    typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2);

  const headerEntries = Object.entries(response.headers);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Badge variant={statusVariant(response.status)}>{response.status}</Badge>
        <span className="text-xs text-dxp-muted-foreground">{response.elapsedMs}ms</span>
      </div>

      <pre className="font-mono text-sm bg-dxp-surface-elevated rounded-dxp p-4 overflow-auto max-h-96 border border-dxp-border">
        {bodyStr}
      </pre>

      {headerEntries.length > 0 && (
        <details>
          <summary className="text-sm font-medium cursor-pointer text-dxp-muted-foreground hover:text-gray-900 dark:hover:text-white">
            Response headers ({headerEntries.length})
          </summary>
          <div className="mt-2 flex flex-col gap-1 pl-2 border-l-2 border-dxp-border">
            {headerEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs font-mono">
                <span className="text-dxp-muted-foreground shrink-0">{key}:</span>
                <span className="text-gray-900 dark:text-white break-all">{value}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
