import { Button, Input } from '@dxp/ui';
import React, { useState } from 'react';

import { HTTP_METHODS, RequestSchema } from '../schemas/request.schema.js';

import type { Header, HttpMethod, RequestInput } from '../schemas/request.schema.js';

type FormErrors = Partial<Record<keyof RequestInput | 'headers', string>>;

interface RequestBuilderProps {
  token: string;
  onSend: (request: RequestInput) => void;
  isPending: boolean;
  initialRequest?: RequestInput;
}

const EMPTY_FORM: RequestInput = {
  method: 'GET',
  path: '/api/',
  headers: [],
  body: undefined,
};

export function RequestBuilder({ token, onSend, isPending, initialRequest }: RequestBuilderProps) {
  const [form, setForm] = useState<RequestInput>(initialRequest ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const showBody = form.method === 'POST' || form.method === 'PUT' || form.method === 'PATCH';

  function setMethod(method: HttpMethod) {
    setForm((prev) => ({ ...prev, method }));
  }

  function addHeader() {
    setForm((prev) => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));
  }

  function removeHeader(index: number) {
    setForm((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  }

  function updateHeader(index: number, field: keyof Header, value: string) {
    setForm((prev) => {
      const headers = prev.headers.map((h, i) => (i === index ? { ...h, [field]: value } : h));
      return { ...prev, headers };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = RequestSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSend(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {/* Method + Path */}
      <div className="flex gap-2 items-start">
        <div className="flex gap-1" role="group" aria-label="HTTP method">
          {HTTP_METHODS.map((method) => (
            <Button
              key={method}
              type="button"
              size="sm"
              variant={form.method === method ? 'primary' : 'ghost'}
              onClick={() => setMethod(method)}
              aria-pressed={form.method === method}
            >
              {method}
            </Button>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <Input
            value={form.path}
            onChange={(e) => setForm((p) => ({ ...p, path: e.target.value }))}
            placeholder="/api/users"
            error={Boolean(errors.path)}
            aria-label="Request path"
          />
          {errors.path && <p className="text-xs text-dxp-destructive">{errors.path}</p>}
        </div>
      </div>

      {/* Headers */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Headers</span>
          <Button type="button" variant="secondary" size="sm" onClick={addHeader}>
            Add header
          </Button>
        </div>

        {/* Authorization header — read-only, pre-filled from auth token */}
        <div className="flex gap-2 opacity-60">
          <Input
            value="Authorization"
            readOnly
            className="flex-1 cursor-not-allowed"
            aria-label="Header name"
          />
          <Input
            value={`Bearer ${token}`}
            readOnly
            className="flex-1 cursor-not-allowed font-mono text-xs"
            aria-label="Authorization header value"
          />
          <div className="w-9" /> {/* spacer for remove button column */}
        </div>

        {form.headers.map((header, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={header.key}
              onChange={(e) => updateHeader(i, 'key', e.target.value)}
              placeholder="Header name"
              className="flex-1"
              aria-label="Header name"
            />
            <Input
              value={header.value}
              onChange={(e) => updateHeader(i, 'value', e.target.value)}
              placeholder="Header value"
              className="flex-1"
              aria-label="Header value"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeHeader(i)}
              aria-label="Remove header"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {/* Request body */}
      {showBody && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="req-body">
            Body
          </label>
          <textarea
            id="req-body"
            value={form.body ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            placeholder='{"key": "value"}'
            className="font-mono text-sm w-full rounded-dxp border border-dxp-border bg-dxp-surface p-3 resize-y min-h-32 focus:outline-none focus:ring-2 focus:ring-dxp-primary"
            aria-label="Request body"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </form>
  );
}
