"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [exchanging, setExchanging] = useState(true)
  const [exchangeError, setExchangeError] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) {
      setExchangeError("Invalid or expired reset link. Please request a new one.")
      setExchanging(false)
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) setExchangeError("This link has expired or already been used. Please request a new one.")
      setExchanging(false)
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push("/dashboard")
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
  const inputStyle = {
    border: "1px solid var(--color-border-input)",
    background: "var(--color-surface)",
    color: "var(--color-ink-near)",
  }

  if (exchanging) {
    return (
      <p className="text-sm text-center" style={{ color: "var(--color-slate)" }}>Verifying link…</p>
    )
  }

  if (exchangeError) {
    return (
      <div className="text-center">
        <p className="text-sm mb-4" style={{ color: "var(--color-slate)" }}>{exchangeError}</p>
        <a href="/login" className="btn-pill-dark text-sm">Back to sign in</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
          New password
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
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: "var(--color-ink)", color: "#fff" }}
      >
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>Pactum</span>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>Set a new password</p>
        </div>
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-whisper)" }}
        >
          <Suspense fallback={<p className="text-sm text-center" style={{ color: "var(--color-slate)" }}>Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
