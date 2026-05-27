import { createServiceClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
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

  // Set an httpOnly cookie binding this browser to the session.
  // API routes verify this cookie matches the sessionId in the request body,
  // preventing unauthenticated callers from targeting arbitrary sessions.
  const cookieStore = await cookies()
  cookieStore.set("pactum_cand_session", session.id, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === "production",
  })

  // Block re-entry once completed
  if (session.status === "completed") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--color-canvas)" }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>
            Assessment complete
          </h1>
          <p className="text-sm" style={{ color: "var(--color-slate)" }}>
            You&apos;ve already submitted this assessment. Your results have been sent to the hiring team.
          </p>
        </div>
      </div>
    )
  }

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
