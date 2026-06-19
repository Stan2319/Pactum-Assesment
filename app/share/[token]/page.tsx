import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { RoundReplay } from "@/components/app/RoundReplay"
import { CodeOutputViewer } from "@/components/app/CodeOutputViewer"
import sanitizeHtmlLib from "sanitize-html"
import type { Message, Score, Assessment, DocumentStateReport, DocumentStateEmail, DocumentStateSpreadsheet, DocumentStateDeck } from "@/lib/types"

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("*, candidates(*), assessments(*), messages(*), scores(*)")
    .eq("share_token", token)
    .single()

  if (!session || session.status !== "completed") notFound()

  const assessment = session.assessments as Assessment
  const candidate = session.candidates as { name: string | null; email: string | null }
  const messages = (session.messages as Message[]).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const score = session.scores?.[0] as Score | undefined
  const candidateLabel = candidate.name ?? candidate.email ?? "Candidate"

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>
      {/* Header bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <span className="text-sm font-black tracking-tight" style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}>
          Pactum
        </span>
        <span className="text-xs" style={{ color: "var(--color-silver)" }}>
          Shared result · view only
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Candidate header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}>
            {candidateLabel}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-slate)" }}>
            {assessment.title}
            {" · "}
            {new Date(session.started_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Score card */}
        {score && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="p-6 flex items-start gap-8">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 96, height: 96, border: `4px solid ${scoreColor(score.total_score)}`, background: "var(--color-surface)" }}
                >
                  <span className="font-black" style={{ fontSize: 36, color: scoreColor(score.total_score), letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {score.total_score}
                  </span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: scoreColor(score.total_score) }}>
                  {scoreGrade(score.total_score)}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-2">
                <p className="text-base leading-relaxed" style={{ color: "var(--color-ink-near)" }}>
                  {score.summary?.replace(/—|–/g, ",")}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 grid grid-cols-5 gap-3">
              <ScoreCell label="Prompt quality" score={score.prompt_quality} max={30} />
              <ScoreCell label="Iteration" score={score.iteration_score} max={25} />
              <ScoreCell label="Output quality" score={score.output_quality} max={20} />
              <ScoreCell label="Critical thinking" score={score.critical_thinking} max={15} />
              <ScoreCell label="Efficiency" score={score.efficiency} max={10} />
            </div>

            <div className="px-6 pb-6 grid grid-cols-3 gap-4" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 24 }}>
              <FeedbackColumn title="Strengths" items={score.strengths} accentColor="#22c55e" />
              <FeedbackColumn title="Areas to improve" items={score.improvements} accentColor="#f59e0b" />
              <FeedbackColumn
                title="Red flags"
                items={score.red_flags?.length ? score.red_flags : ["None detected"]}
                accentColor={score.red_flags?.length ? "#ef4444" : "#22c55e"}
              />
            </div>
          </div>
        )}

        {/* Final output */}
        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
            Final output
          </h2>
          {session.document_state
            ? <FinalOutput workspaceType={assessment.workspace_type} docState={session.document_state} />
            : <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-sm" style={{ color: "var(--color-silver)" }}>No output produced.</p>
              </div>
          }
        </div>

        {/* Session replay */}
        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
            Session replay
          </h2>
          <RoundReplay rounds={assessment.rounds} messages={messages} />
        </div>
      </div>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e"
  if (score >= 60) return "#f59e0b"
  return "#ef4444"
}

function scoreGrade(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 55) return "Average"
  return "Needs work"
}

function ScoreCell({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const bar = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444"
  return (
    <div className="rounded-xl p-3.5" style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-baseline gap-0.5 mb-2">
        <span className="font-black" style={{ fontSize: 28, color: "var(--color-ink)", letterSpacing: "-0.04em", lineHeight: 1 }}>{score}</span>
        <span className="text-xs font-medium" style={{ color: "var(--color-silver)" }}>/{max}</span>
      </div>
      <div className="h-1.5 rounded-full mb-2" style={{ background: "var(--color-border)" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: bar }} />
      </div>
      <p className="text-xs leading-snug" style={{ color: "var(--color-slate)" }}>{label}</p>
    </div>
  )
}

function FeedbackColumn({ title, items, accentColor }: { title: string; items: string[]; accentColor: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)", borderLeft: `3px solid ${accentColor}` }}>
      <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-canvas)" }}>
        <span className="text-xs font-semibold" style={{ color: accentColor }}>{title}</span>
      </div>
      <ul style={{ background: "var(--color-surface)" }}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 px-3 py-2.5 text-xs leading-relaxed" style={{ borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]" style={{ background: accentColor }} />
            <span style={{ color: "var(--color-ink-near)" }}>{item.replace(/—|–/g, ",")}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function sanitizeHtml(html: string) {
  return sanitizeHtmlLib(html, {
    allowedTags: ["p","br","b","i","strong","em","u","s","h1","h2","h3","h4","ul","ol","li","blockquote","pre","code","table","thead","tbody","tr","th","td","a","hr"],
    allowedAttributes: { "a": ["href","target","rel"], "td": ["colspan","rowspan"], "th": ["colspan","rowspan"], "*": ["class","style"] },
    allowedSchemes: ["https","http","mailto"],
  })
}

function FinalOutput({ workspaceType, docState }: { workspaceType: string; docState: unknown }) {
  const shell = (children: React.ReactNode) => (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      {children}
    </div>
  )
  if (workspaceType === "report") {
    return shell(<div className="p-6 prose prose-sm max-w-none" style={{ color: "var(--color-ink-near)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml((docState as DocumentStateReport).html || "") }} />)
  }
  if (workspaceType === "email") {
    const { to, from, subject, html } = docState as DocumentStateEmail
    return shell(<>
      <div className="px-5 py-4 space-y-1.5" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-canvas)" }}>
        {[["To", to], ["From", from], ["Subject", subject]].map(([l, v]) => (
          <div key={l} className="flex gap-3 text-sm">
            <span className="w-14 shrink-0 font-medium" style={{ color: "var(--color-silver)" }}>{l}</span>
            <span style={{ color: "var(--color-ink-near)" }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="p-6 prose prose-sm max-w-none" style={{ color: "var(--color-ink-near)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || "") }} />
    </>)
  }
  if (workspaceType === "spreadsheet") {
    const rows = Array.isArray((docState as DocumentStateSpreadsheet).data) ? (docState as DocumentStateSpreadsheet).data as string[][] : []
    return shell(<div className="overflow-x-auto"><table className="w-full text-xs border-collapse"><tbody>
      {rows.map((row, ri) => (
        <tr key={ri} style={{ borderBottom: "1px solid var(--color-border)" }}>
          {(Array.isArray(row) ? row : []).map((cell, ci) => (
            <td key={ci} className="px-3 py-2" style={{ color: ri === 0 ? "var(--color-ink)" : "var(--color-ink-near)", fontWeight: ri === 0 ? 600 : 400, borderRight: "1px solid var(--color-border)", background: ri === 0 ? "var(--color-canvas)" : "transparent" }}>{String(cell ?? "")}</td>
          ))}
        </tr>
      ))}
    </tbody></table></div>)
  }
  if (workspaceType === "deck") {
    const { slides } = docState as DocumentStateDeck
    return <div className="space-y-3">{slides?.map((slide, i) => (
      <div key={i} className="rounded-2xl p-5" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold mb-3 inline-block" style={{ background: "var(--color-canvas)", color: "var(--color-slate)", border: "1px solid var(--color-border)" }}>Slide {i + 1}</span>
        {slide.title && <p className="font-bold text-base mb-1" style={{ color: "var(--color-ink)" }}>{slide.title}</p>}
        {slide.body && <p className="text-sm" style={{ color: "var(--color-ink-near)" }}>{slide.body}</p>}
        {slide.bullets?.length ? <ul className="mt-2 space-y-1">{slide.bullets.map((b, bi) => <li key={bi} className="text-sm flex gap-2" style={{ color: "var(--color-ink-near)" }}><span style={{ color: "var(--color-silver)" }}>·</span>{b}</li>)}</ul> : null}
      </div>
    ))}</div>
  }
  if (workspaceType === "code") {
    const state = docState as { files?: Record<string, string>; code?: string; language?: string }
    const files = state.files ?? (state.code ? { "main": state.code } : {})
    return <CodeOutputViewer files={files} language={state.language} />
  }
  return null
}
