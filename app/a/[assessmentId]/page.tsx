import { createServiceClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ApplyGate } from "@/components/app/ApplyGate"

interface Props {
  params: Promise<{ assessmentId: string }>
}

export default async function ApplyPage({ params }: Props) {
  const { assessmentId } = await params
  const supabase = await createServiceClient()

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, title, role, is_active")
    .eq("id", assessmentId)
    .eq("is_active", true)
    .single()

  if (!assessment) notFound()

  return <ApplyGate assessment={assessment} />
}
