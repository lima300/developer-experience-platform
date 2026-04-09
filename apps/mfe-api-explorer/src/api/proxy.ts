import { z } from 'zod';

export const ProxyResponseSchema = z.object({
  status: z.number(),
  headers: z.record(z.string()),
  body: z.unknown(),
  elapsedMs: z.number(),
});

export type ProxyResponse = z.infer<typeof ProxyResponseSchema>;

/**
 * Sends a request via the server-side proxy endpoint.
 *
 * SECURITY: The auth token is sent as a Bearer token to authenticate with the
 * proxy itself. The proxy injects the real downstream auth server-side.
 * The token NEVER appears in the forwarded request visible in the browser
 * network tab.
 */
export async function sendProxiedRequest(
  request: {
    method: string;
    path: string;
    headers: Array<{ key: string; value: string }>;
    body?: string;
  },
  proxyToken: string,
): Promise<ProxyResponse> {
  const start = performance.now();

  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${proxyToken}`,
    },
    body: JSON.stringify({
      method: request.method,
      path: request.path,
      headers: request.headers,
      body: request.body,
    }),
  });

  const elapsedMs = Math.round(performance.now() - start);
  const raw: unknown = await response.json();

  const parsed = ProxyResponseSchema.safeParse({ ...(raw as object), elapsedMs });
  if (!parsed.success) {
    // Return a well-formed response even if the proxy returns an unexpected shape
    return {
      status: response.status,
      headers: {},
      body: raw,
      elapsedMs,
    };
  }
  return parsed.data;
}
