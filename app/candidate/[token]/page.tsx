import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { CandidateInterface } from "@/components/app/CandidateInterface"
import { signSessionId } from "@/lib/session-token"

interface Props {
  params: Promise<{ token: string }>
}

export default async function CandidatePage({ params }: Props) {
  const { token } = await params
  const supabase = createAdminClient()

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
  cookieStore.set("pactum_cand_session", signSessionId(session.id), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === "production",
  })

  // Block re-entry once completed
  if (session.status === "completed") {
    const firstName = candidate.name?.split(" ")[0]
    const assessmentTitle = (candidate.assessments as { title?: string } | null)?.title

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--color-canvas)" }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="inline-flex items-center justify-center rounded-full mb-6"
            style={{ width: 56, height: 56, background: "color-mix(in srgb, #22c55e 12%, var(--color-canvas))", border: "1.5px solid #22c55e" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            className="text-2xl font-black mb-2"
            style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}
          >
            {firstName ? `Nice work, ${firstName}.` : "Nice work."}
          </h1>
          {assessmentTitle && (
            <p className="text-sm font-medium mb-3" style={{ color: "var(--color-slate)" }}>
              {assessmentTitle}
            </p>
          )}
          <p className="text-sm" style={{ color: "var(--color-slate)", lineHeight: 1.6 }}>
            Your submission has been received. The hiring team will be in touch soon.
          </p>
          <p className="mt-8 text-xs" style={{ color: "var(--color-silver)" }}>
            Assessed by Pactum
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
