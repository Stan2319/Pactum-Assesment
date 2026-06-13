/**
 * In-memory sliding-window rate limiter.
 * Works for single-process deployments (dev, single server).
 * For serverless/multi-instance production, replace with Upstash:
 *   https://github.com/upstash/ratelimit-js
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, win] of store) {
      if (win.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key     Identifier (e.g. IP address or "ip:route")
 * @param limit   Max requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (existing.count >= limit) return false

  existing.count++
  return true
}
