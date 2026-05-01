import { createClient, createServiceClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/app/DashboardShell"
import { AssessmentCreator } from "@/components/app/AssessmentCreator"

export default async function NewAssessmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", user.id)
    .single()

  // Create company row if missing (e.g. signup race condition or direct nav)
  if (!company && user.email) {
    const serviceSupabase = await createServiceClient()
    const name = user.user_metadata?.company_name ?? user.email.split("@")[0]
    await serviceSupabase
      .from("companies")
      .upsert({ id: user.id, name, email: user.email }, { onConflict: "id" })
    const { data: refetched } = await serviceSupabase
      .from("companies")
      .select("name")
      .eq("id", user.id)
      .single()
    company = refetched
  }

  return (
    <DashboardShell companyName={company?.name ?? "Your Company"} userEmail={user.email ?? ""}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
            Create assessment
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
            Define the task, rounds, and how much AI support the candidate receives.
          </p>
        </div>
        <AssessmentCreator companyId={user.id} />
      </div>
    </DashboardShell>
  )
}
