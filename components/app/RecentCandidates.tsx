"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { SlidersHorizontal, Check } from "lucide-react"
import type { Session, Candidate, Score } from "@/lib/types"

interface SessionRow extends Session {
  candidates: Candidate
  assessments: { title: string; id: string }
  scores: Score[]
}

interface RecentCandidatesProps {
  sessions: SessionRow[]
  assessments: { id: string; title: string }[]
}

export function RecentCandidates({ sessions, assessments }: RecentCandidatesProps) {
  const assessmentOptions = assessments.map((a) => [a.id, a.title] as [string, string])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearAll() {
    setSelected(new Set())
  }

  const filtered = selected.size === 0
    ? sessions
    : sessions.filter((s) => s.assessments?.id && selected.has(s.assessments.id))

  const activeCount = selected.size

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
            Recent candidates
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "var(--color-canvas)",
              color: "var(--color-slate)",
              border: "1px solid var(--color-border)",
            }}
          >
            {activeCount > 0 ? `${filtered.length} of ${sessions.length}` : sessions.length}
          </span>
        </div>

        {assessmentOptions.length > 1 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                border: activeCount > 0 ? "1.5px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
                background: activeCount > 0 ? "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-canvas))" : "var(--color-surface)",
                color: activeCount > 0 ? "var(--color-cobalt)" : "var(--color-slate)",
                cursor: "pointer",
                fontWeight: activeCount > 0 ? 600 : 400,
              }}
            >
              <SlidersHorizontal size={12} />
              Filter
              {activeCount > 0 && (
                <span
                  className="flex items-center justify-center rounded-full text-white"
                  style={{ width: 16, height: 16, fontSize: 10, background: "var(--color-cobalt)" }}
                >
                  {activeCount}
                </span>
              )}
            </button>

            {open && (
              <div
                className="absolute right-0 top-full mt-1.5 w-64 rounded-xl py-1.5 z-20"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                }}
              >
                <div className="flex items-center justify-between px-3 pb-1.5 pt-0.5">
                  <span className="text-xs font-semibold" style={{ color: "var(--color-ink-near)" }}>
                    Filter by assessment
                  </span>
                  {activeCount > 0 && (
                    <button onClick={clearAll} className="text-xs" style={{ color: "var(--color-slate)", cursor: "pointer" }}>
                      Clear
                    </button>
                  )}
                </div>

                <div className="border-t mb-1" style={{ borderColor: "var(--color-border)" }} />

                {assessmentOptions.map(([id, title]) => {
                  const isChecked = selected.has(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors"
                      style={{ color: "var(--color-ink-near)", background: "transparent", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-canvas)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span
                        className="flex items-center justify-center flex-shrink-0 rounded-full transition-all"
                        style={{
                          width: 16,
                          height: 16,
                          border: isChecked ? "2px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
                          background: isChecked ? "var(--color-cobalt)" : "transparent",
                        }}
                      >
                        {isChecked && <Check size={9} color="white" strokeWidth={3} />}
                      </span>
                      <span className="truncate">{title}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        {/* Table header */}
        <div
          className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "1fr 1fr 96px 72px 64px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-canvas)",
          }}
        >
          {["Candidate", "Assessment", "Status", "Score", ""].map((h) => (
            <span key={h} className="text-xs font-semibold" style={{ color: "var(--color-silver)" }}>
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--color-slate)" }}>
            {sessions.length === 0
              ? "No candidates have started an assessment yet."
              : "No candidates match the selected filters."}
          </div>
        ) : (
          filtered.map((s, i) => {
            const name = s.candidates?.name ?? s.candidates?.email ?? "Anonymous"
            const initial = name.charAt(0).toUpperCase()
            const score = s.scores?.[0]?.total_score
            const isLast = i === filtered.length - 1

            return (
              <div
                key={s.id}
                className="grid px-5 py-3.5 items-center transition-colors"
                style={{
                  gridTemplateColumns: "1fr 1fr 96px 72px 64px",
                  borderBottom: isLast ? "none" : "1px solid var(--color-border)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-canvas)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Candidate */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold"
                    style={{
                      width: 28,
                      height: 28,
                      background: "var(--color-canvas)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-slate)",
                    }}
                  >
                    {initial}
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: "var(--color-ink-near)" }}>
                    {name}
                  </span>
                </div>

                {/* Assessment */}
                <span className="text-sm truncate pr-4" style={{ color: "var(--color-slate)" }}>
                  {s.assessments?.title}
                </span>

                {/* Status */}
                <div>
                  <StatusBadge status={s.status} />
                </div>

                {/* Score */}
                <div>
                  {score != null ? (
                    <ScoreChip score={score} />
                  ) : (
                    <span className="text-sm" style={{ color: "var(--color-silver)" }}>-</span>
                  )}
                </div>

                {/* View link */}
                <div className="text-right">
                  {s.status === "completed" && (
                    <Link
                      href={`/dashboard/results/${s.id}`}
                      className="text-xs font-semibold"
                      style={{ color: "var(--color-cobalt)" }}
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs"
      style={{ background: "var(--color-canvas)", color, border: `1px solid ${color}`, minWidth: "4rem" }}
    >
      <span className="font-bold">{score}</span>
      <span className="font-bold" style={{ opacity: 0.75 }}>/100</span>
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { color: string; label: string }> = {
    in_progress: { color: "#f59e0b", label: "In progress" },
    completed: { color: "#22c55e", label: "Completed" },
    abandoned: { color: "var(--color-silver)", label: "Abandoned" },
  }
  const s = styles[status] ?? styles.abandoned
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "var(--color-canvas)", color: s.color, border: `1px solid ${s.color}` }}
    >
      {s.label}
    </span>
  )
}
