import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifySessionCookie } from "@/lib/session-token"

const ALLOWED_STATUSES = new Set(["in_progress", "completed", "abandoned"])

function getCandidateSession(req: NextRequest): string | null {
  return req.cookies.get("pactum_cand_session")?.value ?? null
}

// POST: save a message to the session
export async function POST(req: NextRequest) {
  try {
    const { sessionId, round, role, content } = await req.json()

    if (!sessionId || !round || !role || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the caller owns this session via cookie
    const cookieSession = getCandidateSession(req)
    if (!cookieSession || !verifySessionCookie(cookieSession, sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate role
    if (role !== "user" && role !== "assistant") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("messages")
      .insert({ session_id: sessionId, round, role, content })
      .select()
      .single()

    if (error) {
      console.error("Session message error:", error)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    return NextResponse.json({ message: data })
  } catch (err) {
    console.error("Session message error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: update session round, status, or candidate name
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, current_round, status, candidate_name } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const cookieSession = getCandidateSession(req)
    if (!cookieSession || !verifySessionCookie(cookieSession, sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    if (candidate_name !== undefined) {
      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("candidate_id")
        .eq("id", sessionId)
        .single()
      if (sessionRow?.candidate_id) {
        await supabase
          .from("candidates")
          .update({ name: typeof candidate_name === "string" ? candidate_name.trim() || null : null })
          .eq("id", sessionRow.candidate_id)
      }
    }

    const updates: Record<string, unknown> = {}
    if (current_round !== undefined) {
      if (typeof current_round !== "number" || current_round < 1) {
        return NextResponse.json({ error: "Invalid current_round" }, { status: 400 })
      }
      updates.current_round = current_round
    }
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updates.status = status
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId)

      if (error) {
        console.error("Session update error:", error)
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Session update error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
