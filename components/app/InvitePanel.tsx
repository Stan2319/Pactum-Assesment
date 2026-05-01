"use client"

import { useState } from "react"

interface Candidate {
  id: string
  name: string | null
  email: string
  invite_token: string
  created_at: string
  sessions?: { status: string }[] | null
}

interface InvitePanelProps {
  assessmentTitle: string
  assessmentId: string
  siteUrl: string
  initialCandidates: Candidate[]
}

function candidateStatus(c: Candidate): { label: string; color: string } {
  const session = c.sessions?.[0]
  if (session?.status === "completed") return { label: "Completed", color: "#065f46" }
  if (session?.status === "in_progress" || c.name) return { label: c.name ? `In progress · ${c.name}` : "In progress", color: "#92400e" }
  return { label: "Not started", color: "var(--color-silver)" }
}

export function InvitePanel({ assessmentTitle, assessmentId, siteUrl, initialCandidates }: InvitePanelProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate link")

      const newCandidate: Candidate = {
        id: crypto.randomUUID(),
        name: null,
        email: email.trim(),
        invite_token: data.token,
        created_at: new Date().toISOString(),
        sessions: null,
      }
      setCandidates((prev) => [newCandidate, ...prev])
      setEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(token: string) {
    const url = `${siteUrl}/candidate/${token}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement("textarea")
      el.value = url
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Generate form */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-slate)" }}>
          Assessment
        </p>
        <p className="font-semibold mb-5" style={{ color: "var(--color-ink)" }}>{assessmentTitle}</p>

        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="candidate@company.com"
            required
            className="flex-1 px-3.5 py-2.5 rounded-lg text-sm outline-none"
            style={{
              border: "1px solid var(--color-border-input)",
              background: "var(--color-canvas)",
              color: "var(--color-ink-near)",
            }}
            onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="cursor-pointer shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--color-ink)", color: "#fff" }}
          >
            {loading ? "Generating…" : "Generate link"}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Candidate list */}
      {candidates.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-slate)" }}>
              Invited candidates
            </p>
            <span className="text-xs font-semibold" style={{ color: "var(--color-silver)" }}>
              {candidates.length}
            </span>
          </div>

          <div style={{ background: "var(--color-surface)" }}>
            {candidates.map((c, i) => {
              const link = `${siteUrl}/candidate/${c.invite_token}`
              const isCopied = copiedToken === c.invite_token
              const status = candidateStatus(c)
              return (
                <div
                  key={c.id}
                  className="px-5 py-4 flex items-center gap-4"
                  style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : undefined }}
                >
                  {/* Email + status */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-ink-near)" }}>
                      {c.email}
                    </p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: status.color }}>
                      {status.label}
                    </p>
                  </div>

                  {/* Link preview */}
                  <div
                    className="hidden sm:flex items-center gap-2 rounded-lg px-2.5 py-1.5 max-w-[240px]"
                    style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}
                  >
                    <span className="text-xs font-mono truncate" style={{ color: "var(--color-slate)" }}>
                      {link.replace(/^https?:\/\//, "")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(c.invite_token)}
                    className="cursor-pointer shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: isCopied ? "#d1fae5" : "var(--color-ink)",
                      color: isCopied ? "#065f46" : "#fff",
                    }}
                  >
                    {isCopied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {candidates.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: "var(--color-silver)" }}>
          No candidates invited yet. Enter an email above to generate their unique link.
        </p>
      )}
    </div>
  )
}
