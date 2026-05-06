"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

/**
 * Handles Supabase auth tokens delivered as URL hash fragments.
 * This happens when Supabase uses implicit flow and redirects to the site root
 * with tokens like: /#access_token=xxx&refresh_token=xxx&type=invite
 */
export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes("access_token")) return

    const params = new URLSearchParams(hash.slice(1))
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (!accessToken || !refreshToken) return

    const supabase = createClient()
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      // Clear the hash so tokens don't linger in the URL
      window.history.replaceState(null, "", window.location.pathname)
      if (!error) {
        router.push("/dashboard")
      } else {
        router.push("/login?error=invite_expired")
      }
    })
  }, [router])

  return null
}
