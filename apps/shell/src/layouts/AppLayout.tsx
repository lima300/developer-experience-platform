import { useRegistry } from '@dxp/registry-client';
import { Skeleton } from '@dxp/ui';
import { Outlet } from 'react-router-dom';

import { Header } from '../components/Header.js';
import { Sidebar } from '../components/Sidebar.js';
import { REGISTRY_URL } from '../constants.js';

export function AppLayout() {
  const { mfes, isLoading } = useRegistry({ url: REGISTRY_URL });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dxp-surface">
      {/* Sidebar — fixed left column */}
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-dxp-border bg-dxp-surface-elevated">
        <div className="flex h-14 shrink-0 items-center border-b border-dxp-border px-4">
          <span className="font-semibold tracking-tight text-gray-900 dark:text-white">⬡ DXP</span>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Sidebar mfes={mfes} />
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
