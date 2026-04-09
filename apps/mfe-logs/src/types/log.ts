export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export const LOG_LEVELS: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

export interface LogEntry {
  id: string;
  timestamp: string; // ISO 8601
  level: LogLevel;
  service: string;
  message: string;
  payload: Record<string, unknown>;
}

export interface LogQuery {
  search?: string;
  levels?: Set<LogLevel>;
  from?: Date;
  to?: Date;
  cursor?: string;
  limit?: number;
}

export interface LogPage {
  items: LogEntry[];
  nextCursor: string | null;
}
