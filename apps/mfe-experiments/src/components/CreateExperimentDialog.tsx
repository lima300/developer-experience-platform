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

import { useCreateExperiment } from '../api/experiments.hooks.js';
import {
  CreateExperimentSchema,
  type CreateExperimentInput,
  type VariantInput,
} from '../schemas/experiment.schema.js';

type FormErrors = Partial<
  Record<keyof Omit<CreateExperimentInput, 'variants'> | 'variants', string>
>;

const EMPTY_VARIANT: VariantInput = { name: '', trafficPercent: 50 };

const EMPTY_FORM = {
  name: '',
  hypothesis: '',
  variants: [
    { name: 'Control', trafficPercent: 50 },
    { name: 'Treatment', trafficPercent: 50 },
  ],
  startDate: '',
};

export function CreateExperimentDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const createExperiment = useCreateExperiment();

  function addVariant() {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { ...EMPTY_VARIANT }] }));
  }

  function removeVariant(index: number) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  function updateVariant(index: number, field: keyof VariantInput, value: string | number) {
    setForm((prev) => {
      const variants = prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v));
      return { ...prev, variants };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = CreateExperimentSchema.safeParse({
      ...form,
      variants: form.variants.map((v) => ({
        name: v.name,
        trafficPercent: Number(v.trafficPercent),
      })),
    });

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
    createExperiment.mutate(result.data, {
      onSuccess: () => {
        setOpen(false);
        setForm(EMPTY_FORM);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Experiment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Experiment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="exp-name">
              Name
            </label>
            <Input
              id="exp-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={Boolean(errors.name)}
              placeholder="Homepage CTA color"
            />
            {errors.name && <p className="text-xs text-dxp-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="exp-hypothesis">
              Hypothesis
            </label>
            <Input
              id="exp-hypothesis"
              value={form.hypothesis}
              onChange={(e) => setForm((p) => ({ ...p, hypothesis: e.target.value }))}
              error={Boolean(errors.hypothesis)}
              placeholder="Changing X will increase Y by Z%"
            />
            {errors.hypothesis && (
              <p className="text-xs text-dxp-destructive">{errors.hypothesis}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="exp-start">
              Start Date
            </label>
            <Input
              id="exp-start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              error={Boolean(errors.startDate)}
            />
            {errors.startDate && <p className="text-xs text-dxp-destructive">{errors.startDate}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Variants</span>
              <Button type="button" variant="ghost" size="sm" onClick={addVariant}>
                Add variant
              </Button>
            </div>
            {errors.variants && <p className="text-xs text-dxp-destructive">{errors.variants}</p>}
            {form.variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  placeholder={`Variant ${i + 1}`}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={v.trafficPercent}
                  onChange={(e) => updateVariant(i, 'trafficPercent', Number(e.target.value))}
                  className="w-20"
                  aria-label="Traffic %"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(i)}
                  disabled={form.variants.length <= 2}
                  aria-label="Remove variant"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={createExperiment.isPending}>
            {createExperiment.isPending ? 'Creating…' : 'Create experiment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
