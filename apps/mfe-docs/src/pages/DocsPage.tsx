import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { docsStore } from '../api/store.js';
import { DocPage } from '../components/DocPage.js';
import { DocSearch } from '../components/DocSearch.js';
import { DocSidebar } from '../components/DocSidebar.js';

export function DocsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState(0);

  const activeSlug = slug ?? docsStore.tree[0]?.slug ?? '';
  const doc = docsStore.getDoc(activeSlug);

  const handleNavigate = useCallback(
    (targetSlug: string) => {
      void navigate(`/${targetSlug}`);
    },
    [navigate],
  );

  const handleSearchSelect = useCallback(
    (targetSlug: string) => {
      setSearchKey((k) => k + 1);
      void navigate(`/${targetSlug}`);
    },
    [navigate],
  );

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-dxp-border bg-dxp-surface-elevated p-4">
        <div className="flex items-center gap-2 pb-2">
          <span className="text-sm font-semibold">Documentation</span>
        </div>

        <DocSearch key={searchKey} onSelect={handleSearchSelect} />

        <DocSidebar tree={docsStore.tree} activeSlug={activeSlug} onNavigate={handleNavigate} />
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <DocPage doc={doc} />
      </main>
    </div>
  );
}
