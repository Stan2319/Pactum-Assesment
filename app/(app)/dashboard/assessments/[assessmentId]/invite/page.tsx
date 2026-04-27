import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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
  const openLink = `${siteUrl}/a/${assessmentId}`

  return (
    <DashboardShell companyName={company?.name ?? "Your Company"} userEmail={user.email ?? ""}>
      <div className="max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
            Assessment ready
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
            Share this link with every candidate you want to assess for this role.
          </p>
        </div>
        <InvitePanel
          assessmentTitle={assessment.title}
          inviteUrl={openLink}
          assessmentId={assessmentId}
        />
      </div>
    </DashboardShell>
  )
}
