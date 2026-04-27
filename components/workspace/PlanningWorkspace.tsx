"use client"

import { useState } from "react"
import type { Assessment, AssessmentRound } from "@/lib/types"

interface PlanningWorkspaceProps {
  assessment: Assessment
  round: AssessmentRound
  onSubmit: (notes: string) => Promise<void>
}

export function PlanningWorkspace({ assessment, round, onSubmit }: PlanningWorkspaceProps) {
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!notes.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(notes.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--color-canvas)" }}>
      {/* Left: context */}
      <div
        className="w-80 shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-silver)" }}>
            Planning phase
          </p>
          <p className="text-base font-bold" style={{ color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
            {assessment.title}
          </p>
        </div>

        <div className="px-5 py-5 space-y-5 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-silver)" }}>
              Background
            </p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-slate)" }}>
              {assessment.description}
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-cobalt)" }}>
              Your task
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-ink-near)" }}>
              {round.prompt}
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-ink-near)" }}>
              What to write
            </p>
            <ul className="space-y-1">
              {[
                "Your understanding of the problem",
                "Your high-level approach",
                "Edge cases you'll handle",
                "Any tools or libraries you plan to use",
              ].map((item) => (
                <li key={item} className="text-xs flex gap-1.5" style={{ color: "var(--color-slate)" }}>
                  <span style={{ color: "var(--color-cobalt)" }}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right: notepad */}
      <div className="flex-1 flex flex-col">
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              Planning notes
            </p>
            <p className="text-xs" style={{ color: "var(--color-slate)" }}>
              Write your approach before you start coding. You can reference these during the assessment.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!notes.trim() || submitting}
            className="btn-pill-dark text-sm disabled:opacity-40"
          >
            {submitting ? "Starting…" : "Start coding →"}
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write out your plan here…&#10;&#10;What does the problem ask for? What's your approach? What edge cases will you handle?"
          className="flex-1 resize-none outline-none px-8 py-6 text-sm leading-relaxed font-mono"
          style={{
            background: "var(--color-canvas)",
            color: "var(--color-ink-near)",
            caretColor: "var(--color-cobalt)",
          }}
          autoFocus
        />

        <div
          className="px-6 py-3 flex items-center justify-between border-t shrink-0"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-silver)" }}>
            Your notes are saved when you start coding and visible any time during the assessment.
          </p>
          <p className="text-xs" style={{ color: "var(--color-silver)" }}>
            {notes.length > 0 ? `${notes.length} chars` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
