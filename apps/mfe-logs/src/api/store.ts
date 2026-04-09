import type { LogEntry, LogLevel, LogPage, LogQuery } from '../types/log.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = ['api-gateway', 'auth-service', 'registry', 'shell', 'mfe-loader'];
const LEVELS: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
const LEVEL_WEIGHTS = [0.05, 0.1, 0.5, 0.35]; // realistic distribution

const MESSAGES: Record<LogLevel, string[]> = {
  ERROR: [
    'Unhandled exception in request handler',
    'Database connection timeout',
    'Failed to load remote entry',
    'Authentication token validation failed',
    'Circuit breaker tripped — downstream unavailable',
  ],
  WARN: [
    'Response time exceeded SLA threshold (2s)',
    'Retry attempt 2/3 for downstream call',
    'Cache miss — falling back to origin',
    'Deprecated API version requested',
    'Rate limit approaching for client',
  ],
  INFO: [
    'Request processed successfully',
    'MFE mounted in 142ms',
    'Registry fetched — 5 MFEs registered',
    'User authenticated',
    'Feature flag evaluation: new-dashboard → true',
  ],
  DEBUG: [
    'Entering request middleware chain',
    'Cache key generated',
    'Token decoded — sub: user-001',
    'Shared scope initialised',
    'Route matched: /flags',
  ],
};

// ─── Seed generation ──────────────────────────────────────────────────────────

function pickWeighted<T>(items: T[], weights: number[]): T {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i] ?? 0;
    if (rand < cumulative) return items[i] as T;
  }
  /* c8 ignore next */
  return items[items.length - 1] as T;
}

function generateEntries(count: number): LogEntry[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const level = pickWeighted(LEVELS, LEVEL_WEIGHTS);
    const service = SERVICES[i % SERVICES.length] ?? 'unknown-service';
    const msgs = MESSAGES[level];
    const message = msgs[i % msgs.length] ?? 'Log entry';
    return {
      id: `log-${String(count - i).padStart(6, '0')}`,
      // Timestamps descend from now, ~3 seconds apart
      timestamp: new Date(now - i * 3000).toISOString(),
      level,
      service,
      message,
      payload: {
        requestId: `req-${String(i).padStart(8, '0')}`,
        durationMs: Math.floor(Math.random() * 500),
        statusCode: level === 'ERROR' ? 500 : level === 'WARN' ? 429 : 200,
      },
    };
  });
}

// Generated once at module load — simulates a fixed snapshot of log history.
const ALL_ENTRIES: LogEntry[] = generateEntries(10_000);

// ─── Store ────────────────────────────────────────────────────────────────────

export const logStore = {
  /**
   * Query logs with optional filters and cursor-based pagination.
   * Returns up to `limit` entries (default 50) after the cursor.
   */
  query(query: LogQuery = {}): LogPage {
    const { search, levels, from, to, cursor, limit = 50 } = query;

    let filtered = ALL_ENTRIES;

    if (levels && levels.size > 0) {
      filtered = filtered.filter((e) => levels.has(e.level));
    }

    if (search && search.length > 0) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (e) => e.message.toLowerCase().includes(lower) || e.service.toLowerCase().includes(lower),
      );
    }

    if (from) {
      filtered = filtered.filter((e) => new Date(e.timestamp) >= from);
    }

    if (to) {
      filtered = filtered.filter((e) => new Date(e.timestamp) <= to);
    }

    const startIndex = cursor ? filtered.findIndex((e) => e.id === cursor) + 1 : 0;
    const page = filtered.slice(startIndex, startIndex + limit);
    const nextCursor =
      page.length === limit && startIndex + limit < filtered.length
        ? (page[page.length - 1]?.id ?? null)
        : null;

    return { items: page, nextCursor };
  },

  /** Total count without pagination — used for testing. */
  count(): number {
    return ALL_ENTRIES.length;
  },
};
