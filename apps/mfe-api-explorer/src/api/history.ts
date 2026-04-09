import {
  HistoryEntrySchema,
  type HistoryEntry,
  type RequestInput,
} from '../schemas/request.schema.js';

const STORAGE_KEY = 'dxp.apiexplorer.history';
const MAX_ENTRIES = 20;

export function readHistory(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each entry — discard entries that no longer match the schema
    return parsed.flatMap((item) => {
      const result = HistoryEntrySchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export function writeHistory(entry: HistoryEntry): HistoryEntry[] {
  const existing = readHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // sessionStorage may be unavailable in some environments — fail silently
  }
  return updated;
}

export function clearHistory(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function buildHistoryEntry(
  request: RequestInput,
  statusCode?: number,
  elapsedMs?: number,
): HistoryEntry {
  return {
    ...request,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    statusCode,
    elapsedMs,
  };
}
