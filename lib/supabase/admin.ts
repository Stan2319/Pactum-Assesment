import { createClient } from "@supabase/supabase-js"

// Plain service-role client, safe to use outside Next.js request context (e.g. WS handler)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
