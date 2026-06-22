import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"
import { rateLimit } from "@/lib/rate-limit"
import { sendInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, name, email } = await req.json()

    if (!assessmentId || !email?.trim()) {
      return NextResponse.json({ error: "Email and assessment are required" }, { status: 400 })
    }

    // Require authenticated company user
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    if (!await rateLimit(`invite:${ip}`, 30, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = createAdminClient()

    // Ownership check: assessment must belong to the calling user's company
    const { data: assessment } = await supabase
      .from("assessments")
      .select("id, title, company_id, is_active")
      .eq("id", assessmentId)
      .eq("company_id", user.id)
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

    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", user.id)
      .single()

    sendInviteEmail({
      to: email.trim(),
      companyName: company?.name ?? "A company",
      assessmentTitle: assessment.title,
      inviteToken: token,
    }).catch((err) => console.error("Invite email error:", err))

    return NextResponse.json({ token })
  } catch (err) {
    console.error("Candidate route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
