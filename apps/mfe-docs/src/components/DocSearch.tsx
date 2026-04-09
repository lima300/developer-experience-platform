import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@dxp/ui';
import Fuse from 'fuse.js';
import React, { useMemo, useState, useCallback } from 'react';

import { docsStore } from '../api/store.js';

import type { FlatDocEntry } from '../types/docs.js';

interface DocSearchProps {
  onSelect: (slug: string) => void;
}

export function DocSearch({ onSelect }: DocSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(docsStore.getAllDocs(), {
        keys: ['title', 'content'],
        threshold: 0.35,
        includeScore: true,
      }),
    [],
  );

  const results = useMemo<FlatDocEntry[]>(() => {
    if (query.trim().length < 2) return [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query]);

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery('');
      onSelect(slug);
    },
    [onSelect],
  );

  function highlight(text: string, term: string): React.ReactNode {
    if (!term.trim()) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-800/40 rounded-sm px-0.5">
          {text.slice(idx, idx + term.length)}
        </mark>
        {text.slice(idx + term.length)}
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start gap-2 text-dxp-muted-foreground"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search docs…
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="sr-only">Search Documentation</DialogTitle>
        </DialogHeader>

        <div className="border-b border-dxp-border px-4 pb-3">
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            type="text"
            placeholder="Search documentation…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className="w-full bg-transparent text-sm outline-none placeholder:text-dxp-muted-foreground"
            aria-label="Search documentation"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto py-2" role="listbox">
          {results.length === 0 && query.length >= 2 && (
            <li className="px-4 py-3 text-sm text-dxp-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}
          {results.length === 0 && query.length < 2 && (
            <li className="px-4 py-3 text-sm text-dxp-muted-foreground">
              Type at least 2 characters to search
            </li>
          )}
          {results.map((doc) => (
            <li key={doc.slug} role="option" aria-selected={false}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-dxp-muted transition-colors"
                onClick={() => {
                  handleSelect(doc.slug);
                }}
              >
                <p className="font-medium">{highlight(doc.title, query)}</p>
                {doc.parentSlug && (
                  <p className="text-xs text-dxp-muted-foreground mt-0.5">{doc.parentSlug}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
