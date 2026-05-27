import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/app/DashboardShell"
import { RecentCandidates } from "@/components/app/RecentCandidates"
import { DeleteAssessmentButton } from "@/components/app/DeleteAssessmentButton"
import type { Assessment } from "@/lib/types"
import { Pencil } from "lucide-react"

const WORKSPACE_LABELS: Record<string, string> = {
  report: "Doc",
  email: "Email",
  spreadsheet: "Sheet",
  deck: "Deck",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!company && user.email) {
    const serviceSupabase = await createServiceClient()
    const name = user.user_metadata?.company_name ?? user.email.split("@")[0]
    const { error: upsertError } = await serviceSupabase
      .from("companies")
      .upsert({ id: user.id, name, email: user.email }, { onConflict: "id" })
    if (upsertError) console.error("Company upsert error:", upsertError.message)
    const { data: refetched } = await serviceSupabase
      .from("companies")
      .select("*")
      .eq("id", user.id)
      .single()
    company = refetched
  }

  const [
    { data: assessments },
    { data: allSessions },
    { data: scores },
    { data: recentSessions },
  ] = await Promise.all([
    supabase.from("assessments").select("*").eq("company_id", user.id).order("created_at", { ascending: false }),
    supabase.from("sessions").select("assessment_id, status").eq("company_id", user.id),
    supabase.from("scores").select("total_score").eq("company_id", user.id),
    supabase
      .from("sessions")
      .select("*, candidates(*), assessments(id, title), scores(total_score)")
      .eq("company_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10),
  ])

  const allSessionsArr = allSessions ?? []
  const totalCandidates = allSessionsArr.length
  const completedCount = allSessionsArr.filter((s) => s.status === "completed").length
  const scoresArr = scores ?? []
  const avgScore =
    scoresArr.length > 0
      ? Math.round(scoresArr.reduce((a, s) => a + (s.total_score ?? 0), 0) / scoresArr.length)
      : null
  const completionRate =
    totalCandidates > 0 ? Math.round((completedCount / totalCandidates) * 100) : null

  const sessionsByAssessment: Record<string, number> = {}
  for (const s of allSessionsArr) {
    if (s.assessment_id) {
      sessionsByAssessment[s.assessment_id] = (sessionsByAssessment[s.assessment_id] ?? 0) + 1
    }
  }

  return (
    <DashboardShell companyName={company?.name ?? "Your Company"} userEmail={user.email ?? ""}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}>
              Overview
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--color-slate)" }}>
              {company?.name ?? "Your Company"}
            </p>
          </div>
          <Link href="/dashboard/assessments/new" className="btn-pill-dark text-sm">
            + New assessment
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Assessments"
            value={assessments?.length ?? 0}
          />
          <StatCard
            label="Candidates"
            value={totalCandidates}
          />
          <StatCard
            label="Avg score"
            value={avgScore != null ? String(avgScore) : "-"}
            suffix={avgScore != null ? "/100" : undefined}
          />
          <StatCard
            label="Completion rate"
            value={completionRate != null ? `${completionRate}%` : "-"}
          />
        </div>

        {/* Two-column: assessments left, candidates right */}
        <div className="grid grid-cols-5 gap-10 items-start">
          {/* Assessments — narrower left column */}
          <section className="col-span-2">
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--color-silver)" }}>
              Assessments
            </h2>

            {!assessments || assessments.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ border: "1.5px dashed var(--color-border)", background: "var(--color-surface)" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink-near)" }}>
                  No assessments yet
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--color-slate)" }}>
                  Create your first to start evaluating candidates.
                </p>
                <Link href="/dashboard/assessments/new" className="btn-pill-dark text-xs inline-flex">
                  Create assessment
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {(assessments as Assessment[]).map((a) => (
                  <AssessmentCard
                    key={a.id}
                    assessment={a}
                    sessionCount={sessionsByAssessment[a.id] ?? 0}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent candidates — wider right column */}
          <section className="col-span-3">
            <RecentCandidates sessions={recentSessions as any ?? []} assessments={assessments ?? []} />
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <p className="text-xs font-medium mb-3" style={{ color: "var(--color-slate)" }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span
          className="text-4xl font-black"
          style={{ color: "var(--color-ink)", letterSpacing: "-0.04em", lineHeight: 1 }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-medium" style={{ color: "var(--color-silver)" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function AssessmentCard({ assessment, sessionCount }: { assessment: Assessment; sessionCount: number }) {
  const workspaceLabel = WORKSPACE_LABELS[assessment.workspace_type ?? "report"] ?? "Doc"
  const inviteBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  void inviteBase

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-6">
        {/* Left: metadata + title */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "var(--color-canvas)",
                color: "var(--color-slate)",
                border: "1px solid var(--color-border)",
              }}
            >
              {workspaceLabel}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "var(--color-canvas)",
                color: "var(--color-slate)",
                border: "1px solid var(--color-border)",
              }}
            >
              {assessment.tension_level === "junior" ? "Junior" : "Senior"}
            </span>
          </div>
          <p className="font-bold text-base" style={{ color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
            {assessment.title}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-slate)" }}>
            {assessment.role}
          </p>
        </div>

        {/* Right: session count + actions */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-2xl font-black"
              style={{ color: "var(--color-ink)", letterSpacing: "-0.04em", lineHeight: 1 }}
            >
              {sessionCount}
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--color-silver)" }}>
              candidate{sessionCount !== 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href={`/dashboard/assessments/${assessment.id}/invite`}
            className="btn-pill-dark text-xs px-4 py-2"
          >
            Invite
          </Link>
        </div>
      </div>

      {/* Footer row */}
      <div
        className="flex items-center justify-between gap-4 mt-4 pt-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: "var(--color-silver)" }}>
            {assessment.rounds.length} round{assessment.rounds.length !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "var(--color-border)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--color-silver)" }}>
            Created{" "}
            {new Date(assessment.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/assessments/${assessment.id}/edit`}
            className="flex items-center gap-1 text-xs transition-colors hover:text-[var(--color-ink)]"
            style={{ color: "var(--color-silver)" }}
          >
            <Pencil size={12} />
            Edit
          </Link>
          <DeleteAssessmentButton assessmentId={assessment.id} />
        </div>
      </div>
    </div>
  )
}
