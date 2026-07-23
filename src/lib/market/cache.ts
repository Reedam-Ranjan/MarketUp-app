/**
 * Tiny in-memory TTL cache used to throttle calls to the free-tier market API
 * (Finnhub's free plan is ~60 req/min). Lives in the Node.js server process,
 * shared across requests. Good enough for a single instance / dev; swap for
 * the Supabase `quote_cache` table if we scale horizontally.
 */

type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

/**
 * Returns the cached value for `key`, or computes it via `fetcher`, caches it
 * for `ttlMs`, and returns it. Concurrent identical keys share one fetch.
 */
const inFlight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const value = await fetcher();
      store.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise as Promise<T>;
}
