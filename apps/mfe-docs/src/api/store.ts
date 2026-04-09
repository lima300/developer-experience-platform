import rawManifest from '../data/docs-manifest.json';
import { DocManifestSchema } from '../schemas/docs.schema.js';

import type { DocEntry, FlatDocEntry } from '../types/docs.js';

function flattenEntries(entries: DocEntry[], parentSlug?: string): FlatDocEntry[] {
  const flat: FlatDocEntry[] = [];
  for (const entry of entries) {
    flat.push({ title: entry.title, slug: entry.slug, content: entry.content, parentSlug });
    if (entry.children && entry.children.length > 0) {
      flat.push(...flattenEntries(entry.children, entry.slug));
    }
  }
  return flat;
}

function buildStore(): {
  tree: DocEntry[];
  flat: FlatDocEntry[];
  getDoc: (slug: string) => FlatDocEntry | undefined;
  getAllDocs: () => FlatDocEntry[];
} {
  const result = DocManifestSchema.safeParse(rawManifest);
  const tree: DocEntry[] = result.success ? (result.data as DocEntry[]) : [];
  const flat = flattenEntries(tree);

  return {
    tree,
    flat,
    getDoc: (slug: string) => flat.find((d) => d.slug === slug),
    getAllDocs: () => flat,
  };
}

export const docsStore = buildStore();
