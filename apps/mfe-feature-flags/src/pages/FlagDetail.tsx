import { Button, ErrorFallback, Input, Skeleton } from '@dxp/ui';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFlag, useUpdateFlag } from '../api/flags.hooks.js';
import { EnvBadge } from '../components/EnvBadge.js';
import { UpdateFlagSchema, type UpdateFlagInput } from '../schemas/flag.schema.js';
import { ENVIRONMENTS } from '../types/flag.js';

type FormErrors = Partial<Record<keyof UpdateFlagInput | 'environments', string>>;

export function FlagDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: flag, isLoading, isError, refetch } = useFlag(id);
  const updateFlag = useUpdateFlag(id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateFlagInput>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Sync form when flag data arrives
  useEffect(() => {
    if (flag) {
      setForm({
        name: flag.name,
        description: flag.description,
        environments: flag.environments,
      });
    }
  }, [flag]);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !flag) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorFallback
          error={new Error('Failed to load flag details')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = UpdateFlagSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof UpdateFlagInput;
        if (field) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateFlag.mutate(result.data, {
      onSuccess: () => setEditing(false),
    });
  }

  return (
    <div className="p-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => void navigate('/')} className="mb-4 -ml-2">
        ← Back to flags
      </Button>

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="flag-name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <Input
              id="flag-name"
              value={form.name ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-dxp-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="flag-description"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <Input
              id="flag-description"
              value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Environments
            </legend>
            <div className="flex gap-4">
              {ENVIRONMENTS.map((env) => (
                <label key={env} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.environments?.[env] ?? flag.environments[env]}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        environments: {
                          ...flag.environments,
                          ...p.environments,
                          [env]: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-dxp-border"
                  />
                  {env}
                </label>
              ))}
            </div>
          </fieldset>

          {updateFlag.isError && (
            <p className="text-xs text-dxp-destructive">Failed to update flag. Please try again.</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={updateFlag.isPending}>
              {updateFlag.isPending ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{flag.name}</h1>
              {flag.description && (
                <p className="mt-1 text-sm text-dxp-muted-foreground">{flag.description}</p>
              )}
              <p className="mt-2 font-mono text-xs text-dxp-muted-foreground">{flag.key}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>

          <div className="rounded-lg border border-dxp-border p-4">
            <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Environment status
            </h2>
            <div className="flex gap-3">
              {ENVIRONMENTS.map((env) => (
                <EnvBadge key={env} env={env} enabled={flag.environments[env]} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-dxp-border p-4 text-xs text-dxp-muted-foreground">
            <p>Created: {new Date(flag.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(flag.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
