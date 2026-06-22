import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { signSessionId } from "@/lib/session-token"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.redirect(new URL("/", req.url))

  const supabase = createAdminClient()

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id, assessment_id, company_id")
    .eq("invite_token", token)
    .single()

  if (!candidate) return NextResponse.redirect(new URL("/", req.url))

  let { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("candidate_id", candidate.id)
    .single()

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
      .select("id")
      .single()
    session = newSession
  }

  if (!session) return NextResponse.redirect(new URL("/", req.url))

  const response = NextResponse.redirect(new URL(`/candidate/${token}`, req.url))
  response.cookies.set("pactum_cand_session", signSessionId(session.id), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
