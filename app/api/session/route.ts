import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// POST: save a message to the session
export async function POST(req: NextRequest) {
  try {
    const { sessionId, round, role, content } = await req.json()

    if (!sessionId || !round || !role || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data, error } = await supabase
      .from("messages")
      .insert({ session_id: sessionId, round, role, content })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data })
  } catch (err) {
    console.error("Session message error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: update session round or status
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, current_round, status } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const updates: Record<string, unknown> = {}
    if (current_round !== undefined) updates.current_round = current_round
    if (status !== undefined) updates.status = status

    const { error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Session update error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
