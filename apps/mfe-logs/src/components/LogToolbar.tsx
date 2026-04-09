import { Button, Input } from '@dxp/ui';
import React from 'react';

import { LOG_LEVELS } from '../types/log.js';

import { LogLevelBadge } from './LogLevelBadge.js';

import type { LogLevel } from '../types/log.js';

interface LogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeLevels: Set<LogLevel>;
  onToggleLevel: (level: LogLevel) => void;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export function LogToolbar({
  search,
  onSearchChange,
  activeLevels,
  onToggleLevel,
  from,
  onFromChange,
  to,
  onToChange,
  onClear,
  hasFilters,
}: LogToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3 p-4 border-b border-dxp-border bg-dxp-surface-elevated">
      <Input
        placeholder="Search logs…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
        aria-label="Search logs"
      />

      <div className="flex gap-1" role="group" aria-label="Log level filter">
        {LOG_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onToggleLevel(level)}
            className={`rounded-dxp px-2 py-1 text-xs font-medium transition-opacity ${
              activeLevels.size === 0 || activeLevels.has(level) ? 'opacity-100' : 'opacity-40'
            }`}
            aria-pressed={activeLevels.has(level)}
          >
            <LogLevelBadge level={level} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-dxp-muted-foreground" htmlFor="log-from">
          From
        </label>
        <Input
          id="log-from"
          type="datetime-local"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="text-xs h-8 w-48"
        />
        <label className="text-xs text-dxp-muted-foreground" htmlFor="log-to">
          To
        </label>
        <Input
          id="log-to"
          type="datetime-local"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="text-xs h-8 w-48"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}
