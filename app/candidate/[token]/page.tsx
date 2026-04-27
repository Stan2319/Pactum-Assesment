import { createServiceClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CandidateInterface } from "@/components/app/CandidateInterface"

interface Props {
  params: Promise<{ token: string }>
}

export default async function CandidatePage({ params }: Props) {
  const { token } = await params
  const supabase = await createServiceClient()

  // Look up candidate by invite token
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*, assessments(*)")
    .eq("invite_token", token)
    .single()

  if (!candidate) notFound()

  // Check if a session already exists for this candidate
  const { data: existingSession } = await supabase
    .from("sessions")
    .select("*")
    .eq("candidate_id", candidate.id)
    .single()

  let session = existingSession

  // Create session if it doesn't exist
  if (!session) {
    const { data: newSession } = await supabase
      .from("sessions")
      .insert({
        candidate_id: candidate.id,
        assessment_id: candidate.assessment_id,
        company_id: candidate.company_id,
        current_round: 1,
        status: "in_progress",
      })
      .select()
      .single()

    session = newSession
  }

  if (!session) notFound()

  // Fetch existing messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })

  return (
    <CandidateInterface
      candidate={candidate}
      assessment={candidate.assessments}
      session={session}
      initialMessages={messages ?? []}
    />
  )
}
