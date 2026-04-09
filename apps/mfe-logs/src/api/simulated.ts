/**
 * Simulates network latency so TanStack Query loading states are exercised.
 */
export function simulateAsync<T>(value: T, delay = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}
