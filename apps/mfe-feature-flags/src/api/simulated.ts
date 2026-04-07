/**
 * Simulates network latency so TanStack Query loading states are
 * exercised in both dev mode and tests that check pending UI.
 */
export function simulateAsync<T>(value: T, delay = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}
