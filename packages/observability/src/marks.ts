const MARK_PREFIX = 'mfe.load';

/**
 * Set a performance mark at MFE load start.
 * Call immediately before injecting the remote script.
 */
export function startMFEMark(name: string): void {
  performance.mark(`${MARK_PREFIX}.start:${name}`);
}

/**
 * Set a performance mark + measure at MFE load end.
 * Call after the MFE is mounted and rendered.
 * Returns the duration in ms.
 */
export function endMFEMark(name: string): number {
  const startMark = `${MARK_PREFIX}.start:${name}`;
  const endMark = `${MARK_PREFIX}.end:${name}`;
  const measureName = `${MARK_PREFIX}:${name}`;

  performance.mark(endMark);

  const [entry] = performance.measure(measureName, startMark, endMark).duration
    ? [performance.getEntriesByName(measureName).at(-1)]
    : [null];

  const duration = entry?.duration ?? 0;

  // Clean up marks to avoid memory growth on repeated MFE loads
  performance.clearMarks(startMark);
  performance.clearMarks(endMark);

  return duration;
}
