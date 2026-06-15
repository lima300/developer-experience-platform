import { useRegistry } from '@dxp/registry-client';
import { cn, Skeleton } from '@dxp/ui';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '../components/Header.js';
import { Sidebar } from '../components/Sidebar.js';
import { REGISTRY_URL } from '../constants.js';

export function AppLayout() {
  const { mfes, isLoading } = useRegistry({ url: REGISTRY_URL });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-dxp-surface">
      {/* Full-width top bar */}
      <Header />

      {/* Body: nav rail + content */}
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            'flex h-full shrink-0 flex-col border-r border-dxp-border bg-dxp-rail transition-[width] duration-200',
            collapsed ? 'w-14' : 'w-60',
          )}
        >
          {isLoading ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <Sidebar
              mfes={mfes}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((c) => !c)}
            />
          )}
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
