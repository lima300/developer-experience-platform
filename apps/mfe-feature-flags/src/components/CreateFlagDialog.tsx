import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@dxp/ui';
import React, { useState } from 'react';

import { useCreateFlag } from '../api/flags.hooks.js';
import { CreateFlagSchema, type CreateFlagInput } from '../schemas/flag.schema.js';
import { ENVIRONMENTS } from '../types/flag.js';

type FormErrors = Partial<Record<keyof CreateFlagInput | 'environments', string>>;

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const EMPTY_FORM: CreateFlagInput = {
  name: '',
  key: '',
  description: '',
  environments: { dev: false, staging: false, prod: false },
};

export function CreateFlagDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateFlagInput>(EMPTY_FORM);
  const [keyEdited, setKeyEdited] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const createFlag = useCreateFlag();

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      // Auto-derive key unless user has manually edited it
      key: keyEdited ? prev.key : toSlug(name),
    }));
  }

  function handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setKeyEdited(true);
    setForm((prev) => ({ ...prev, key: e.target.value }));
  }

  function handleEnvChange(env: 'dev' | 'staging' | 'prod', value: boolean) {
    setForm((prev) => ({
      ...prev,
      environments: { ...prev.environments, [env]: value },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = CreateFlagSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateFlagInput;
        if (field) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    createFlag.mutate(result.data, {
      onSuccess: () => {
        setOpen(false);
        setForm(EMPTY_FORM);
        setKeyEdited(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Flag</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-flag-name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <Input
              id="create-flag-name"
              value={form.name}
              onChange={handleNameChange}
              placeholder="New Dashboard"
              error={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-dxp-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-flag-key"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Key{' '}
              <span className="font-normal text-dxp-muted-foreground">
                (auto-derived, immutable after creation)
              </span>
            </label>
            <Input
              id="create-flag-key"
              value={form.key}
              onChange={handleKeyChange}
              placeholder="new-dashboard"
              className="font-mono"
              error={Boolean(errors.key)}
            />
            {errors.key && <p className="text-xs text-dxp-destructive">{errors.key}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-flag-description"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description <span className="font-normal text-dxp-muted-foreground">(optional)</span>
            </label>
            <Input
              id="create-flag-description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description of this flag"
              error={Boolean(errors.description)}
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable in environments
            </legend>
            <div className="flex gap-4">
              {ENVIRONMENTS.map((env) => (
                <label key={env} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.environments[env]}
                    onChange={(e) => handleEnvChange(env, e.target.checked)}
                    className="rounded border-dxp-border"
                  />
                  {env}
                </label>
              ))}
            </div>
          </fieldset>

          {createFlag.isError && (
            <p className="text-xs text-dxp-destructive">Failed to create flag. Please try again.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFlag.isPending}>
              {createFlag.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
