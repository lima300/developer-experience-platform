import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';

import { buildHistoryEntry, readHistory, writeHistory } from '../api/history.js';
import { sendProxiedRequest, type ProxyResponse } from '../api/proxy.js';
import { RequestBuilder } from '../components/RequestBuilder.js';
import { RequestHistory } from '../components/RequestHistory.js';
import { ResponseViewer } from '../components/ResponseViewer.js';

import type { HistoryEntry, RequestInput } from '../schemas/request.schema.js';
import type { AuthContext } from '@dxp/federation-contracts';

interface ApiExplorerPageProps {
  auth: AuthContext;
}

export function ApiExplorerPage({ auth }: ApiExplorerPageProps) {
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());
  const [activeRequest, setActiveRequest] = useState<RequestInput | undefined>();

  const sendRequest = useMutation({
    mutationFn: (request: RequestInput) => {
      const { body, ...rest } = request;
      return sendProxiedRequest(body !== undefined ? { ...rest, body } : rest, auth.token);
    },
    onSuccess: (data, request) => {
      setResponse(data);
      const entry = buildHistoryEntry(request, data.status, data.elapsedMs);
      setHistory(writeHistory(entry));
    },
  });

  function handleSelectHistory(entry: HistoryEntry) {
    setActiveRequest(entry);
  }

  return (
    <div className="flex h-full">
      {/* Left panel: history */}
      <div className="w-64 shrink-0 border-r border-dxp-border flex flex-col">
        <div className="px-4 py-3 border-b border-dxp-border">
          <h2 className="text-sm font-medium text-dxp-muted-foreground">History</h2>
        </div>
        <div className="flex-1 overflow-auto">
          <RequestHistory history={history} onSelect={handleSelectHistory} />
        </div>
      </div>

      {/* Right panel: builder + response */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-dxp-border">
          <RequestBuilder
            key={activeRequest ? JSON.stringify(activeRequest) : 'empty'}
            token={auth.token}
            onSend={(req) => sendRequest.mutate(req)}
            isPending={sendRequest.isPending}
            {...(activeRequest ? { initialRequest: activeRequest } : {})}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <ResponseViewer response={response} />
        </div>
      </div>
    </div>
  );
}
