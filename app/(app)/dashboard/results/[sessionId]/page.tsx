import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/app/DashboardShell"
import type { Message, Score, Assessment, Candidate } from "@/lib/types"

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
      <div className="max-w-3xl space-y-8">
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
                  {score.summary}
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

        {/* Session replay */}
        <div>
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
            Session replay
          </h2>
          <div className="space-y-4">
            {assessment.rounds.map((round) => {
              const roundMessages = messages.filter((m) => m.round === round.round)
              const userCount = roundMessages.filter((m) => m.role === "user").length

              return (
                <div
                  key={round.round}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  {/* Round header */}
                  <div
                    className="px-5 py-4"
                    style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-1.5">
                      <p className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                        Round {round.round}: {round.title}
                      </p>
                      <span className="text-xs shrink-0" style={{ color: "var(--color-silver)" }}>
                        {userCount} prompt{userCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>
                      {round.prompt}
                    </p>
                  </div>

                  {/* Messages */}
                  <div style={{ background: "var(--color-surface)" }}>
                    {roundMessages.length === 0 ? (
                      <p className="px-5 py-5 text-sm" style={{ color: "var(--color-silver)" }}>
                        No messages in this round.
                      </p>
                    ) : (
                      roundMessages.map((msg, i) => {
                        const isUser = msg.role === "user"
                        const isLast = i === roundMessages.length - 1
                        return (
                          <div
                            key={msg.id}
                            className="px-5 py-4"
                            style={{
                              borderBottom: isLast ? "none" : "1px solid var(--color-border)",
                              background: isUser ? "var(--color-canvas)" : "var(--color-surface)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                                style={{
                                  width: 20,
                                  height: 20,
                                  background: isUser ? "var(--color-ink)" : "var(--color-cobalt)",
                                  color: "#fff",
                                  fontSize: 10,
                                }}
                              >
                                {isUser ? "C" : "A"}
                              </div>
                              <span
                                className="text-xs font-semibold"
                                style={{ color: isUser ? "var(--color-ink)" : "var(--color-cobalt)" }}
                              >
                                {isUser ? "Candidate" : "Claude"}
                              </span>
                              <span className="text-xs" style={{ color: "var(--color-silver)" }}>
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p
                              className="text-sm leading-relaxed whitespace-pre-wrap"
                              style={{
                                color: "var(--color-ink-near)",
                                paddingLeft: 28,
                              }}
                            >
                              {msg.content}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
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
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
