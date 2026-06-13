import { createHmac, timingSafeEqual } from "crypto"

function getSecret(): string {
  const s = process.env.SESSION_COOKIE_SECRET
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_COOKIE_SECRET env var is required in production")
  }
  return s ?? "dev-insecure-secret-set-SESSION_COOKIE_SECRET-in-production"
}

/** Returns an HMAC-SHA256 hex string for a given sessionId. */
export function signSessionId(sessionId: string): string {
  return createHmac("sha256", getSecret()).update(sessionId).digest("hex")
}

/** Returns true iff the cookie value is a valid signature for sessionId. */
export function verifySessionCookie(cookie: string, sessionId: string): boolean {
  const expected = signSessionId(sessionId)
  try {
    return timingSafeEqual(Buffer.from(cookie, "hex"), Buffer.from(expected, "hex"))
  } catch {
    return false
  }
}
