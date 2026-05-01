import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/app/DashboardShell"
import { RoundReplay } from "@/components/app/RoundReplay"
import type { Message, Score, Assessment, Candidate, DocumentStateReport, DocumentStateEmail, DocumentStateSpreadsheet, DocumentStateDeck } from "@/lib/types"

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", user.id)
    .single()

  const { data: session } = await supabase
    .from("sessions")
    .select("*, candidates(*), assessments(*), messages(*), scores(*)")
    .eq("id", sessionId)
    .eq("company_id", user.id)
    .single()

  if (!session) notFound()

  const assessment = session.assessments as Assessment
  const candidate = session.candidates as Candidate
  const messages = (session.messages as Message[]).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const score = session.scores?.[0] as Score | undefined

  const durationMs = session.completed_at
    ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
    : null
  const durationMin = durationMs ? Math.round(durationMs / 60000) : null

  const candidateLabel = candidate.name ?? candidate.email ?? "Candidate"
  const userMessageCount = messages.filter((m) => m.role === "user").length

  return (
    <DashboardShell companyName={company?.name ?? "Your Company"} userEmail={user.email ?? ""}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm mb-4"
            style={{ color: "var(--color-slate)" }}
          >
            ← Dashboard
          </Link>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}
          >
            {candidateLabel}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-slate)" }}>
            {assessment.title}
            {" · "}
            {new Date(session.started_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {durationMin ? ` · ${durationMin} min` : ""}
            {" · "}
            {userMessageCount} prompt{userMessageCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Score card */}
        {score ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            {/* Top: big score + summary */}
            <div className="p-6 flex items-start gap-8">
              {/* Score circle */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 96,
                    height: 96,
                    border: `3px solid ${scoreColor(score.total_score).border}`,
                    background: scoreColor(score.total_score).bg,
                  }}
                >
                  <span
                    className="font-black"
                    style={{
                      fontSize: 36,
                      color: scoreColor(score.total_score).text,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {score.total_score}
                  </span>
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: scoreColor(score.total_score).text }}
                >
                  {scoreGrade(score.total_score)}
                </span>
              </div>

              {/* Summary */}
              <div className="flex-1 min-w-0 pt-2">
                <p className="text-base leading-relaxed" style={{ color: "var(--color-ink-near)" }}>
                  {score.summary?.replace(/\u2014|\u2013/g, ",")}
                </p>
              </div>
            </div>

            {/* Sub-scores */}
            <div
              className="px-6 pb-6 grid grid-cols-5 gap-3"
            >
              <ScoreCell label="Prompt quality" score={score.prompt_quality} max={30} />
              <ScoreCell label="Iteration" score={score.iteration_score} max={25} />
              <ScoreCell label="Output quality" score={score.output_quality} max={20} />
              <ScoreCell label="Critical thinking" score={score.critical_thinking} max={15} />
              <ScoreCell label="Efficiency" score={score.efficiency} max={10} />
            </div>

            {/* Strengths / Improvements / Red flags */}
            <div
              className="px-6 pb-6 grid grid-cols-3 gap-4"
              style={{ borderTop: "1px solid var(--color-border)", paddingTop: 24 }}
            >
              <FeedbackColumn title="Strengths" items={score.strengths} color="#065f46" bg="#d1fae5" />
              <FeedbackColumn title="Areas to improve" items={score.improvements} color="#92400e" bg="#fef3c7" />
              <FeedbackColumn
                title="Red flags"
                items={score.red_flags?.length ? score.red_flags : ["None detected"]}
                color={score.red_flags?.length ? "#991b1b" : "#065f46"}
                bg={score.red_flags?.length ? "#fee2e2" : "#d1fae5"}
              />
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink-near)" }}>
              Score not yet available
            </p>
            <p className="text-sm" style={{ color: "var(--color-slate)" }}>
              The session may still be in progress or the grader hasn&apos;t run yet.
            </p>
          </div>
        )}

        {/* Final output */}
        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
            Final output
          </h2>
          {session.document_state ? (
            <FinalOutput workspaceType={assessment.workspace_type} docState={session.document_state} />
          ) : (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--color-silver)" }}>
                The candidate did not produce any output.
              </p>
            </div>
          )}
        </div>

        {/* Session replay */}
        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
            Session replay
          </h2>
          <RoundReplay rounds={assessment.rounds} messages={messages} />
        </div>
      </div>
    </DashboardShell>
  )
}

// Strip dangerous elements/attributes from candidate-generated HTML before rendering.
// Allows only the Tiptap-compatible subset: block elements, inline formatting, tables.
function sanitizeHtml(html: string): string {
  return html
    // Remove script, style, iframe, object, embed, form, input, link, meta tags entirely
    .replace(/<(script|style|iframe|object|embed|form|input|button|link|meta|base|noscript)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|link|meta|base|noscript)[^>]*\/?>/gi, "")
    // Remove on* event attributes (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove javascript: and data: URIs in href/src/action
    .replace(/\s+(href|src|action)\s*=\s*["']?\s*(javascript:|data:|vbscript:)[^"'\s>]*/gi, "")
}

function FinalOutput({ workspaceType, docState }: { workspaceType: string; docState: unknown }) {
  const shell = (children: React.ReactNode) => (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
    >
      {children}
    </div>
  )

  if (workspaceType === "report") {
    const { html } = docState as DocumentStateReport
    return shell(
      <div
        className="p-6 prose prose-sm max-w-none"
        style={{ color: "var(--color-ink-near)" }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || "") || "<p style='color:var(--color-silver)'>No content.</p>" }}
      />
    )
  }

  if (workspaceType === "email") {
    const { to, from, subject, html } = docState as DocumentStateEmail
    return shell(
      <>
        <div className="px-5 py-4 space-y-1.5" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-canvas)" }}>
          {[["To", to], ["From", from], ["Subject", subject]].map(([label, val]) => (
            <div key={label} className="flex gap-3 text-sm">
              <span className="w-14 shrink-0 font-medium" style={{ color: "var(--color-silver)" }}>{label}</span>
              <span style={{ color: "var(--color-ink-near)" }}>{val}</span>
            </div>
          ))}
        </div>
        <div
          className="p-6 prose prose-sm max-w-none"
          style={{ color: "var(--color-ink-near)" }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || "") || "<p style='color:var(--color-silver)'>No content.</p>" }}
        />
      </>
    )
  }

  if (workspaceType === "spreadsheet") {
    const { data } = docState as DocumentStateSpreadsheet
    const rows = Array.isArray(data) ? data as string[][] : []
    if (!rows.length) return shell(<p className="p-6 text-sm" style={{ color: "var(--color-silver)" }}>No data.</p>)
    return shell(
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid var(--color-border)" }}>
                {(Array.isArray(row) ? row : []).map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2"
                    style={{
                      color: ri === 0 ? "var(--color-ink)" : "var(--color-ink-near)",
                      fontWeight: ri === 0 ? 600 : 400,
                      borderRight: "1px solid var(--color-border)",
                      background: ri === 0 ? "var(--color-canvas)" : "transparent",
                    }}
                  >
                    {String(cell ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (workspaceType === "deck") {
    const { slides } = docState as DocumentStateDeck
    if (!slides?.length) return shell(<p className="p-6 text-sm" style={{ color: "var(--color-silver)" }}>No slides.</p>)
    return (
      <div className="space-y-3">
        {slides.map((slide, i) => (
          <div
            key={slide.id ?? i}
            className="rounded-2xl p-5"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "var(--color-canvas)", color: "var(--color-slate)", border: "1px solid var(--color-border)" }}
              >
                Slide {i + 1}
              </span>
              <span className="text-xs" style={{ color: "var(--color-silver)" }}>{slide.layout}</span>
            </div>
            {slide.title && <p className="font-bold text-base mb-1" style={{ color: "var(--color-ink)", letterSpacing: "-0.01em" }}>{slide.title}</p>}
            {slide.body && <p className="text-sm" style={{ color: "var(--color-ink-near)" }}>{slide.body}</p>}
            {slide.bullets?.length ? (
              <ul className="mt-2 space-y-1">
                {slide.bullets.map((b, bi) => (
                  <li key={bi} className="text-sm flex gap-2" style={{ color: "var(--color-ink-near)" }}>
                    <span style={{ color: "var(--color-silver)" }}>·</span> {b}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    )
  }

  if (workspaceType === "code") {
    const state = docState as { files?: Record<string, string>; code?: string; language?: string }
    const files = state.files ?? (state.code ? { "main": state.code } : {})
    const entries = Object.entries(files)
    if (!entries.length) return shell(<p className="p-6 text-sm" style={{ color: "var(--color-silver)" }}>No files.</p>)
    return (
      <div className="space-y-3">
        {entries.map(([filename, content]) => (
          <div key={filename} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
            <div
              className="px-4 py-2.5 text-xs font-semibold"
              style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-border)", color: "var(--color-slate)", fontFamily: "monospace" }}
            >
              {filename}
            </div>
            <pre
              className="p-4 text-xs overflow-x-auto"
              style={{ color: "var(--color-ink-near)", fontFamily: "monospace", lineHeight: 1.6, margin: 0, background: "var(--color-surface)" }}
            >
              {content}
            </pre>
          </div>
        ))}
      </div>
    )
  }

  return null
}

function scoreColor(score: number) {
  if (score >= 80) return { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46" }
  if (score >= 60) return { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" }
  return { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" }
}

function scoreGrade(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 55) return "Average"
  return "Needs work"
}

function ScoreCell({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const barColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"

  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-baseline gap-0.5 mb-2">
        <span
          className="font-black"
          style={{ fontSize: 28, color: "var(--color-ink)", letterSpacing: "-0.04em", lineHeight: 1 }}
        >
          {score}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--color-silver)" }}>
          /{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full mb-2" style={{ background: "var(--color-border)" }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <p className="text-xs leading-snug" style={{ color: "var(--color-slate)" }}>
        {label}
      </p>
    </div>
  )
}

function FeedbackColumn({
  title, items, color, bg,
}: {
  title: string
  items: string[]
  color: string
  bg: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-ink-near)" }}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-xs leading-relaxed px-2.5 py-1.5 rounded-lg"
            style={{ background: bg, color }}
          >
            {item.replace(/\u2014|\u2013/g, ",")}
          </li>
        ))}
      </ul>
    </div>
  )
}
