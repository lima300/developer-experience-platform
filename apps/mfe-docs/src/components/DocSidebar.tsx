import { Button, cn } from '@dxp/ui';
import React from 'react';

import type { DocEntry } from '../types/docs.js';

interface DocSidebarProps {
  tree: DocEntry[];
  activeSlug: string;
  onNavigate: (slug: string) => void;
}

interface NavItemProps {
  entry: DocEntry;
  activeSlug: string;
  onNavigate: (slug: string) => void;
  depth: number;
}

function NavItem({ entry, activeSlug, onNavigate, depth }: NavItemProps) {
  const isActive = entry.slug === activeSlug;
  const hasChildren = entry.children && entry.children.length > 0;

  return (
    <li>
      <Button
        variant={isActive ? 'primary' : 'ghost'}
        size="sm"
        className={cn(
          'w-full justify-start text-left font-normal',
          depth > 0 && 'ml-3 w-[calc(100%-0.75rem)]',
          !isActive && 'text-dxp-muted-foreground hover:text-foreground',
        )}
        onClick={() => {
          onNavigate(entry.slug);
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        {entry.title}
      </Button>

      {hasChildren && (
        <ul className="mt-0.5 space-y-0.5">
          {(entry.children ?? []).map((child) => (
            <NavItem
              key={child.slug}
              entry={child}
              activeSlug={activeSlug}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DocSidebar({ tree, activeSlug, onNavigate }: DocSidebarProps) {
  return (
    <nav aria-label="Documentation navigation" className="w-64 shrink-0">
      <ul className="space-y-0.5">
        {tree.map((entry) => (
          <NavItem
            key={entry.slug}
            entry={entry}
            activeSlug={activeSlug}
            onNavigate={onNavigate}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );
}
