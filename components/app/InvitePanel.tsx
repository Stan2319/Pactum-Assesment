"use client"

import { useState } from "react"
import Link from "next/link"

interface InvitePanelProps {
  assessmentTitle: string
  inviteUrl: string
  assessmentId: string
}

export function InvitePanel({ assessmentTitle, inviteUrl, assessmentId }: InvitePanelProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    console.log("[copy] inviteUrl:", inviteUrl)
    try {
      await navigator.clipboard.writeText(inviteUrl)
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea")
      el.value = inviteUrl
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-slate)" }}>
          Assessment
        </p>
        <p className="font-semibold mb-4" style={{ color: "var(--color-ink)" }}>{assessmentTitle}</p>

        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-slate)" }}>
          Candidate link
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}
        >
          <span className="flex-1 text-sm font-mono truncate" style={{ color: "var(--color-ink-near)" }}>
            {inviteUrl}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: copied ? "#d1fae5" : "var(--color-ink)",
              color: copied ? "#065f46" : "#fff",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--color-slate)" }}>
          Send this link to everyone applying for this role. Each candidate enters their name and email when they open it, and gets their own tracked session.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-pill-dark text-sm">
          Back to dashboard
        </Link>
        <Link
          href={`/dashboard/assessments/${assessmentId}`}
          className="btn-pill-outline text-sm"
        >
          Edit assessment
        </Link>
      </div>
    </div>
  )
}
