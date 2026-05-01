"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type View = "signin" | "signup" | "forgot" | "forgot-sent" | "awaiting-confirmation"

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
const inputStyle = {
  border: "1px solid var(--color-border-input)",
  background: "var(--color-surface)",
  color: "var(--color-ink-near)",
}

function Input({ type, value, onChange, placeholder, required = true }: {
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className={inputClass}
      style={inputStyle}
      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<View>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function reset(next: View) {
    setError("")
    setView(next)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push("/dashboard")
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) {
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, email }),
      })
    }
    if (data.session) {
      router.push("/dashboard")
    } else {
      setLoading(false)
      setView("awaiting-confirmation")
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/reset-password`
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)
    if (err) { setError(err.message); return }
    setView("forgot-sent")
  }

  // ── Full-screen info states ─────────────────────────────────

  if (view === "awaiting-confirmation") {
    return (
      <Screen>
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Check your email</h2>
        <p className="text-sm" style={{ color: "var(--color-slate)" }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
        </p>
        <button onClick={() => reset("signin")} className="mt-6 btn-pill-dark text-sm">
          Go to sign in
        </button>
      </Screen>
    )
  }

  if (view === "forgot-sent") {
    return (
      <Screen>
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Check your email</h2>
        <p className="text-sm" style={{ color: "var(--color-slate)" }}>
          We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
        </p>
        <button onClick={() => reset("signin")} className="mt-6 btn-pill-dark text-sm">
          Back to sign in
        </button>
      </Screen>
    )
  }

  // ── Forms ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>Pactum</span>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
            {view === "signup" ? "Create your company account" : view === "forgot" ? "Reset your password" : "Sign in to your dashboard"}
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-whisper)" }}
        >
          {/* Sign in */}
          {view === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>Work email</label>
                <Input type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--color-ink-near)" }}>Password</label>
                  <button
                    type="button"
                    onClick={() => reset("forgot")}
                    className="text-xs"
                    style={{ color: "var(--color-cobalt)" }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60" style={{ background: "var(--color-ink)", color: "#fff" }}>
                {loading ? "Please wait…" : "Sign in"}
              </button>
            </form>
          )}

          {/* Sign up */}
          {view === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>Company name</label>
                <Input type="text" value={companyName} onChange={setCompanyName} placeholder="Acme Inc." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>Work email</label>
                <Input type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>Password</label>
                <Input type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60" style={{ background: "var(--color-ink)", color: "#fff" }}>
                {loading ? "Please wait…" : "Create account"}
              </button>
            </form>
          )}

          {/* Forgot password */}
          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>Work email</label>
                <Input type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60" style={{ background: "var(--color-ink)", color: "#fff" }}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          {/* Footer link */}
          <p className="mt-4 text-center text-sm" style={{ color: "var(--color-slate)" }}>
            {view === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => reset("signin")} className="font-medium underline" style={{ color: "var(--color-cobalt)" }}>Sign in</button>
              </>
            ) : view === "forgot" ? (
              <>Remembered it?{" "}
                <button onClick={() => reset("signin")} className="font-medium underline" style={{ color: "var(--color-cobalt)" }}>Back to sign in</button>
              </>
            ) : (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => reset("signup")} className="font-medium underline" style={{ color: "var(--color-cobalt)" }}>Sign up</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="w-full max-w-sm text-center">{children}</div>
    </div>
  )
}
