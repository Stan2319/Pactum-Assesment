"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PactumMark } from "@/components/PactumLogo"

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
const inputStyle = {
  border: "1px solid var(--color-border-input)",
  background: "var(--color-surface)",
  color: "var(--color-ink-near)",
}

function Input({ type, value, onChange, placeholder }: {
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      placeholder={placeholder}
      className={inputClass}
      style={inputStyle}
      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get("next") ?? ""
  const redirectTo = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\")
    ? rawNext
    : "/dashboard"

  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { company_name: companyName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })

    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    // Email confirmation disabled — session returned immediately
    if (data.session) {
      router.push(redirectTo)
      return
    }

    // Email confirmation required
    setCheckEmail(true)
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Check your email</h2>
          <p className="text-sm" style={{ color: "var(--color-slate)" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <p className="mt-4 text-xs" style={{ color: "var(--color-silver)" }}>
            Already confirmed?{" "}
            <Link href="/login" className="underline" style={{ color: "var(--color-cobalt)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3"><PactumMark height={48} variant="dark" /></div>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
            Create your free account
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-whisper)" }}
        >
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                Company name
              </label>
              <Input type="text" value={companyName} onChange={setCompanyName} placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                Work email
              </label>
              <Input type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
                Password
              </label>
              <Input type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "var(--color-ink)", color: "#fff", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: "var(--color-slate)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline" style={{ color: "var(--color-cobalt)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
