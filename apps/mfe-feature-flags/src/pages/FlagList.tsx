import { Button, ErrorFallback, Skeleton } from '@dxp/ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useFlags } from '../api/flags.hooks.js';
import { CreateFlagDialog } from '../components/CreateFlagDialog.js';
import { DeleteFlagConfirm } from '../components/DeleteFlagConfirm.js';
import { EnvToggle } from '../components/EnvToggle.js';
import { FlagKeyBadge } from '../components/FlagKeyBadge.js';
import { ENVIRONMENTS } from '../types/flag.js';

import type { AuthContext } from '@dxp/federation-contracts';

interface FlagListProps {
  auth: AuthContext;
}

export function FlagList({ auth }: FlagListProps) {
  const navigate = useNavigate();
  const { data: flags, isLoading, isError, refetch } = useFlags();
  const isAdmin = auth.roles.includes('admin');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorFallback
          error={new Error('Failed to load feature flags')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Feature Flags</h1>
        <CreateFlagDialog />
      </div>

      {flags?.length === 0 ? (
        <p className="text-sm text-dxp-muted-foreground">
          No feature flags yet. Create one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-dxp-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dxp-border bg-dxp-surface-elevated">
                <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-dxp-muted-foreground">Key</th>
                {ENVIRONMENTS.map((env) => (
                  <th
                    key={env}
                    className="px-4 py-3 text-center font-medium text-dxp-muted-foreground uppercase text-xs"
                  >
                    {env}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-dxp-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {flags?.map((flag) => (
                <tr
                  key={flag.id}
                  className="border-b border-dxp-border last:border-0 hover:bg-dxp-surface-elevated/50"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">{flag.name}</span>
                    {flag.description && (
                      <p className="mt-0.5 text-xs text-dxp-muted-foreground line-clamp-1">
                        {flag.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <FlagKeyBadge flagKey={flag.key} />
                  </td>
                  {ENVIRONMENTS.map((env) => (
                    <td key={env} className="px-4 py-3 text-center">
                      <EnvToggle flagId={flag.id} env={env} enabled={flag.environments[env]} />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void navigate(`/${flag.id}`)}
                      >
                        View
                      </Button>
                      {isAdmin && (
                        <DeleteFlagConfirm
                          flagId={flag.id}
                          flagName={flag.name}
                          onClose={() => {}}
                        />
                      )}
                    </div>
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
