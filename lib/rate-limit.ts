import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Supabase-backed rate limiter — works on Vercel serverless (no shared memory).
 * Requires a `rate_limits` table in Supabase:
 *
 *   create table rate_limits (
 *     key text primary key,
 *     count integer not null default 1,
 *     reset_at timestamptz not null
 *   );
 *
 * Fails open (allows request) if the DB is unreachable.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const now = Date.now()
    const resetAt = new Date(now + windowMs).toISOString()

    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count, reset_at")
      .eq("key", key)
      .maybeSingle()

    if (!existing || new Date(existing.reset_at).getTime() < now) {
      await supabase
        .from("rate_limits")
        .upsert({ key, count: 1, reset_at: resetAt }, { onConflict: "key" })
      return true
    }

    if (existing.count >= limit) return false

    await supabase
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("key", key)

    return true
  } catch {
    return true
  }
}
