import { ErrorFallback, Skeleton } from '@dxp/ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useExperiments } from '../api/experiments.hooks.js';
import { CreateExperimentDialog } from '../components/CreateExperimentDialog.js';
import { ExperimentStatusBadge } from '../components/ExperimentStatusBadge.js';

import type { AuthContext } from '@dxp/federation-contracts';

interface ExperimentsPageProps {
  auth: AuthContext;
}

export function ExperimentsPage({ auth }: ExperimentsPageProps) {
  const navigate = useNavigate();
  const { data: experiments, isLoading, isError, refetch } = useExperiments();
  const canCreate = auth.roles.includes('admin') || auth.roles.includes('dev');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-dxp" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorFallback
          error={new Error('Failed to load experiments')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Experiments</h1>
        {canCreate && <CreateExperimentDialog />}
      </div>

      {experiments?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-dxp-muted-foreground">No experiments yet.</p>
          {canCreate && <CreateExperimentDialog />}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-dxp border border-dxp-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dxp-border bg-dxp-surface-elevated">
                <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">
                  Variants
                </th>
                <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">
                  Started
                </th>
              </tr>
            </thead>
            <tbody>
              {experiments?.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-dxp-border last:border-0 hover:bg-dxp-surface-elevated/50 cursor-pointer"
                  onClick={() => void navigate(`/${exp.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">{exp.name}</span>
                    <p className="mt-0.5 text-xs text-dxp-muted-foreground line-clamp-1">
                      {exp.hypothesis}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <ExperimentStatusBadge status={exp.status} />
                  </td>
                  <td className="px-4 py-3 text-dxp-muted-foreground">{exp.variants.length}</td>
                  <td className="px-4 py-3 text-dxp-muted-foreground">
                    {new Date(exp.startDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
