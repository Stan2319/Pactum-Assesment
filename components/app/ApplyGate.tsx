"use client"

import { useState } from "react"

interface ApplyGateProps {
  assessment: {
    id: string
    title: string
    role: string
  }
}

export function ApplyGate({ assessment }: ApplyGateProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleStart() {
    if (!name.trim() || !email.trim() || loading) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          name: name.trim(),
          email: email.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to start assessment")
      window.location.href = `/candidate/${data.token}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && name.trim() && email.trim()) handleStart()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-canvas)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold mb-1" style={{ color: "var(--color-ink)" }}>
            Pactum
          </p>
          <p className="text-sm" style={{ color: "var(--color-slate)" }}>
            {assessment.title}
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
            Before you begin
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--color-slate)" }}>
            This assessment uses AI. Every prompt you write and every response you receive will be
            recorded and reviewed by the hiring team. Take your time and show your thinking.
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-ink-near)" }}
              >
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jane Smith"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid var(--color-border-input)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink-near)",
                }}
                autoFocus
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-ink-near)" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid var(--color-border-input)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink-near)",
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleStart}
            disabled={!name.trim() || !email.trim() || loading}
            className="w-full btn-pill-dark disabled:opacity-40"
          >
            {loading ? "Starting…" : "Start assessment →"}
          </button>
        </div>
      </div>
    </div>
  )
}
