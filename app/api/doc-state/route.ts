import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, documentState } = await req.json()

    if (!sessionId || documentState === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { error } = await supabase
      .from("sessions")
      .update({ document_state: documentState })
      .eq("id", sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Doc state error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
