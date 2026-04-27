"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { company_name: companyName } },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Create company record via server route (uses service key, bypasses RLS)
      if (data.user) {
        await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id, name: companyName, email }),
        })
      }

      // If Supabase email confirmation is ON, session will be null
      if (data.session) {
        router.push("/dashboard")
      } else {
        setLoading(false)
        setAwaitingConfirmation(true)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      router.push("/dashboard")
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Check your email</h2>
          <p className="text-sm" style={{ color: "var(--color-slate)" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in here.
          </p>
          <button
            onClick={() => { setAwaitingConfirmation(false); setIsSignUp(false) }}
            className="mt-6 btn-pill-dark text-sm"
          >
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
            Pactum
          </span>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
            {isSignUp ? "Create your company account" : "Sign in to your dashboard"}
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-whisper)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                  Company name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Acme Inc."
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
                  style={{
                    border: "1px solid var(--color-border-input)",
                    background: "var(--color-surface)",
                    color: "var(--color-ink-near)",
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
                style={{
                  border: "1px solid var(--color-border-input)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink-near)",
                }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

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
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
                style={{
                  border: "1px solid var(--color-border-input)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink-near)",
                }}
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
              {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm" style={{ color: "var(--color-slate)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError("") }}
              className="font-medium underline"
              style={{ color: "var(--color-cobalt)" }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
