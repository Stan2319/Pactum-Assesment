import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/app/DashboardShell"
import { InvitePanel } from "@/components/app/InvitePanel"

interface Props {
  params: Promise<{ assessmentId: string }>
}

export default async function InvitePage({ params }: Props) {
  const { assessmentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", user.id)
    .single()

  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("company_id", user.id)
    .single()

  if (!assessment) redirect("/dashboard")

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { data: existingCandidates } = await supabase
    .from("candidates")
    .select("id, name, email, invite_token, created_at, sessions(status)")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: false })

  return (
    <DashboardShell companyName={company?.name ?? "Your Company"} userEmail={user.email ?? ""}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
              Invite candidates
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
              Generate a unique link for each candidate. Each link expires once the assessment is completed.
            </p>
          </div>
          <Link href="/dashboard" className="btn-pill-dark text-sm shrink-0 ml-6">
            ← Dashboard
          </Link>
        </div>
        <InvitePanel
          assessmentTitle={assessment.title}
          assessmentId={assessmentId}
          siteUrl={siteUrl}
          initialCandidates={existingCandidates ?? []}
        />
      </div>
    </DashboardShell>
  )
}
