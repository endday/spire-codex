/**
 * Simple in-memory fetch cache for API responses.
 * Keyed by URL — identical requests return cached data instantly.
 * Cache lives for the browser session (cleared on page reload).
 */

const cache = new Map<string, { data: unknown; timestamp: number }>();
const inflight = new Map<string, Promise<unknown>>();
const MAX_AGE = 5 * 60 * 1000; // 5 minutes

export function clearCache() {
  cache.clear();
}

export async function cachedFetch<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.timestamp < MAX_AGE) {
    return cached.data as T;
  }

  // Deduplicate in-flight requests to the same URL
  const existing = inflight.get(url);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    })
    .then((data) => {
      cache.set(url, { data, timestamp: Date.now() });
      inflight.delete(url);
      return data as T;
    })
    .catch((err) => {
      inflight.delete(url);
      throw err;
    });

  inflight.set(url, promise);
  return promise;
}
