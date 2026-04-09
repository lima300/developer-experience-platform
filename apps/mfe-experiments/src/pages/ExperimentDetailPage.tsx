import { Badge, Button, ErrorFallback, Skeleton } from '@dxp/ui';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  useConcludeExperiment,
  useExperiment,
  usePauseExperiment,
} from '../api/experiments.hooks.js';
import { ExperimentStatusBadge } from '../components/ExperimentStatusBadge.js';

/** p-value threshold for 95% confidence significance */
const SIGNIFICANCE_THRESHOLD = 0.05;

export function ExperimentDetailPage() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const { data: experiment, isLoading, isError, refetch } = useExperiment(experimentId ?? '');
  const concludeExperiment = useConcludeExperiment();
  const pauseExperiment = usePauseExperiment();

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-48 w-full rounded-dxp" />
      </div>
    );
  }

  if (isError || !experiment) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorFallback
          error={new Error('Failed to load experiment')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const chartData = experiment.variants.map((v) => ({
    name: v.name,
    'Conversion Rate': v.visitors > 0 ? Number(((v.conversions / v.visitors) * 100).toFixed(2)) : 0,
  }));

  const isSignificant =
    experiment.pValue !== undefined && experiment.pValue < SIGNIFICANCE_THRESHOLD;

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => void navigate('/')}>
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {experiment.name}
          </h1>
          <p className="text-sm text-dxp-muted-foreground">{experiment.hypothesis}</p>
          <ExperimentStatusBadge status={experiment.status} />
        </div>

        <div className="flex gap-2 shrink-0">
          {experiment.status === 'running' && (
            <Button
              variant="secondary"
              size="sm"
              disabled={pauseExperiment.isPending}
              onClick={() => pauseExperiment.mutate(experiment.id)}
            >
              Pause
            </Button>
          )}
          {experiment.status !== 'concluded' && (
            <Button
              variant="destructive"
              size="sm"
              disabled={concludeExperiment.isPending}
              onClick={() => concludeExperiment.mutate(experiment.id)}
            >
              Conclude
            </Button>
          )}
        </div>
      </div>

      {/* Statistical significance */}
      {experiment.pValue !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-dxp-muted-foreground">Significance:</span>
          {isSignificant ? (
            <Badge variant="success">Significant at 95% confidence (p = {experiment.pValue})</Badge>
          ) : (
            <Badge variant="warning">
              Not yet significant — keep running (p = {experiment.pValue})
            </Badge>
          )}
        </div>
      )}

      {/* Conversion rate chart */}
      <div className="rounded-dxp border border-dxp-border bg-dxp-surface-elevated p-4">
        <h2 className="mb-4 text-sm font-medium text-dxp-muted-foreground">Conversion Rate (%)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Conversion Rate']} />
            <Bar dataKey="Conversion Rate" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variant comparison table */}
      <div className="overflow-x-auto rounded-dxp border border-dxp-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dxp-border bg-dxp-surface-elevated">
              <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">Variant</th>
              <th className="px-4 py-3 text-right font-medium text-dxp-muted-foreground">
                Traffic
              </th>
              <th className="px-4 py-3 text-right font-medium text-dxp-muted-foreground">
                Visitors
              </th>
              <th className="px-4 py-3 text-right font-medium text-dxp-muted-foreground">
                Conversions
              </th>
              <th className="px-4 py-3 text-right font-medium text-dxp-muted-foreground">
                Conv. Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {experiment.variants.map((v) => (
              <tr key={v.id} className="border-b border-dxp-border last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{v.name}</td>
                <td className="px-4 py-3 text-right text-dxp-muted-foreground">
                  {v.trafficPercent}%
                </td>
                <td className="px-4 py-3 text-right text-dxp-muted-foreground">
                  {v.visitors.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-dxp-muted-foreground">
                  {v.conversions.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {v.visitors > 0 ? `${((v.conversions / v.visitors) * 100).toFixed(2)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
