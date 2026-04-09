export interface DocEntry {
  title: string;
  slug: string;
  content: string;
  children?: DocEntry[];
}

export interface FlatDocEntry {
  title: string;
  slug: string;
  content: string;
  parentSlug: string | undefined;
}

export interface SearchResult {
  item: FlatDocEntry;
  score: number;
}
