/**
 * Simple in-memory idempotency store.
 * For production with multiple instances, replace with Redis.
 */

interface Entry {
  result: unknown;
  expiresAt: number;
}

const store = new Map<string, Entry>();

/** Returns cached result for a key, or null if not found / expired. */
export function getIdempotencyResult(key: string): unknown | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.result;
}

/** Stores a result for a key with a TTL in milliseconds. */
export function setIdempotencyResult(key: string, result: unknown, ttlMs: number): void {
  store.set(key, { result, expiresAt: Date.now() + ttlMs });
}

/** Cleanup expired entries (call periodically). */
export function purgeExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}
