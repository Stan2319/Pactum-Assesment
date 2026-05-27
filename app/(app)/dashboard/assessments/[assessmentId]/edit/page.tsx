import { createClient, createServiceClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardShell } from "@/components/app/DashboardShell"
import { AssessmentCreator } from "@/components/app/AssessmentCreator"

interface Props {
  params: Promise<{ assessmentId: string }>
}

export default async function EditAssessmentPage({ params }: Props) {
  const { assessmentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", user.id)
    .single()

  const serviceSupabase = await createServiceClient()
  const { data: assessment } = await serviceSupabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("company_id", user.id)
    .single()

  if (!assessment) notFound()

  return (
    <DashboardShell companyName={company?.name ?? "Your Company"} userEmail={user.email ?? ""}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
            Edit assessment
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-slate)" }}>
            Update the task, rounds, or AI settings for this assessment.
          </p>
        </div>
        <AssessmentCreator
          companyId={user.id}
          initialData={assessment}
          assessmentId={assessmentId}
        />
      </div>
    </DashboardShell>
  )
}
