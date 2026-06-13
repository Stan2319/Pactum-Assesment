"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
const inputStyle = {
  border: "1px solid var(--color-border-input)",
  background: "var(--color-surface)",
  color: "var(--color-ink-near)",
}

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 12) { setError("Password must be at least 12 characters."); return }
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>Pactum</span>
          <p className="mt-2 text-sm" style={{ color: "var(--color-slate)" }}>
            Welcome. Set a password so you can log in next time.
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-whisper)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "var(--color-ink)", color: "#fff" }}
            >
              {loading ? "Saving…" : "Set password & continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
