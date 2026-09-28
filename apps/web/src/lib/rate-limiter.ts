/**
 * Sliding-window rate limiter.
 * In production with multiple server instances, replace the store with Redis.
 */

interface Window {
  timestamps: number[];
}

const windows = new Map<string, Window>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key      Unique key e.g. `login:${ip}` or `checkout:${userId}`
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function isAllowed(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  let win = windows.get(key);
  if (!win) {
    win = { timestamps: [] };
    windows.set(key, win);
  }

  // Remove expired timestamps
  win.timestamps = win.timestamps.filter((t) => t > windowStart);

  if (win.timestamps.length >= limit) return false;

  win.timestamps.push(now);
  return true;
}

/** Remaining requests for a key in the current window. */
export function remaining(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  const windowStart = now - windowMs;
  const win = windows.get(key);
  if (!win) return limit;
  const active = win.timestamps.filter((t) => t > windowStart).length;
  return Math.max(0, limit - active);
}

/** Cleanup old entries to prevent memory leaks. Call every few minutes. */
export function purge(): void {
  const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour
  for (const [key, win] of windows.entries()) {
    if (win.timestamps.every((t) => t < cutoff)) windows.delete(key);
  }
}
