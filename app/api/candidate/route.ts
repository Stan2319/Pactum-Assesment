import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, name, email } = await req.json()

    if (!assessmentId || !email?.trim()) {
      return NextResponse.json({ error: "Email and assessment are required" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: assessment } = await supabase
      .from("assessments")
      .select("id, company_id, is_active")
      .eq("id", assessmentId)
      .eq("is_active", true)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found or no longer active" }, { status: 404 })
    }

    const token = randomUUID()

    const { data: candidate, error } = await supabase
      .from("candidates")
      .insert({
        company_id: assessment.company_id,
        assessment_id: assessmentId,
        name: name?.trim() ?? null,
        email: email.trim(),
        invite_token: token,
      })
      .select()
      .single()

    if (error || !candidate) {
      console.error("Candidate insert error:", error)
      return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 })
    }

    return NextResponse.json({ token })
  } catch (err) {
    console.error("Candidate route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
