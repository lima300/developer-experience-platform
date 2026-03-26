import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';

import { fetchRegistry, RegistryFetchError, RegistryValidationError } from '../fetch.js';

const REGISTRY_URL = 'http://localhost/registry.json';

const validRegistry = {
  mfes: [
    {
      name: 'featureFlags',
      route: '/flags',
      scope: 'featureFlags',
      module: './App',
      url: 'http://localhost:3001/remoteEntry.js',
      permissions: ['admin'],
      enabled: true,
      version: '0.1.0',
      canaryPercent: 0,
    },
  ],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.stubGlobal('sessionStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe('fetchRegistry', () => {
  it('returns parsed registry on success', async () => {
    server.use(http.get(REGISTRY_URL, () => HttpResponse.json(validRegistry)));

    const result = await fetchRegistry(REGISTRY_URL);
    expect(result.mfes).toHaveLength(1);
    expect(result.mfes[0]?.name).toBe('featureFlags');
  });

  it('throws RegistryFetchError on HTTP 500', async () => {
    server.use(http.get(REGISTRY_URL, () => new HttpResponse(null, { status: 500 })));

    await expect(fetchRegistry(REGISTRY_URL)).rejects.toBeInstanceOf(RegistryFetchError);
  }, 30_000);

  it('throws RegistryValidationError on schema mismatch', async () => {
    server.use(http.get(REGISTRY_URL, () => HttpResponse.json({ mfes: [{ invalid: true }] })));

    await expect(fetchRegistry(REGISTRY_URL)).rejects.toBeInstanceOf(RegistryValidationError);
  });

  it('writes to sessionStorage on success', async () => {
    server.use(http.get(REGISTRY_URL, () => HttpResponse.json(validRegistry)));
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    await fetchRegistry(REGISTRY_URL);
    expect(sessionStorage.setItem).toHaveBeenCalledWith('dxp:registry', expect.any(String));
  });
});
