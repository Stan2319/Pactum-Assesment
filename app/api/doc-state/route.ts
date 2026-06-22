import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifySessionCookie } from "@/lib/session-token"

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, documentState } = await req.json()

    if (!sessionId || documentState === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (JSON.stringify(documentState).length > 2_000_000) {
      return NextResponse.json({ error: "Document state too large" }, { status: 400 })
    }

    // Verify the caller owns this session via cookie
    const cookieSession = req.cookies.get("pactum_cand_session")?.value
    if (!cookieSession || !verifySessionCookie(cookieSession, sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from("sessions")
      .update({ document_state: documentState })
      .eq("id", sessionId)

    if (error) {
      console.error("Doc state error:", error)
      return NextResponse.json({ error: "Failed to update document state" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Doc state error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
