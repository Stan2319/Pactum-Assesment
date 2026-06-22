import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { randomUUID } from "crypto"
import { rateLimit } from "@/lib/rate-limit"
import { sendInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, emails } = await req.json()

    if (!assessmentId || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "assessmentId and a non-empty emails array are required" },
        { status: 400 }
      )
    }

    if (emails.length > 500) {
      return NextResponse.json({ error: "Maximum 500 invites per request" }, { status: 400 })
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
    const invalid = (emails as unknown[]).find(
      (e) => typeof e !== "string" || !emailRegex.test(e.trim())
    )
    if (invalid) {
      return NextResponse.json({ error: "One or more email addresses are invalid" }, { status: 400 })
    }

    // Deduplicate
    const uniqueEmails = [...new Set((emails as string[]).map((e) => e.trim().toLowerCase()))]

    // Verify caller is authenticated and owns the assessment
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    if (!await rateLimit(`bulk-invite:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = createAdminClient()

    const { data: assessment } = await supabase
      .from("assessments")
      .select("id, title, company_id, is_active")
      .eq("id", assessmentId)
      .eq("company_id", user.id)
      .eq("is_active", true)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found or inactive" }, { status: 404 })
    }

    const rows = uniqueEmails.map((email) => ({
      company_id: assessment.company_id,
      assessment_id: assessmentId,
      name: null,
      email,
      invite_token: randomUUID(),
    }))

    const { data: candidates, error } = await supabase
      .from("candidates")
      .insert(rows)
      .select("id, email, invite_token, created_at")

    if (error) {
      console.error("Bulk candidate insert error:", error)
      return NextResponse.json({ error: "Failed to create invites" }, { status: 500 })
    }

    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", user.id)
      .single()

    const companyName = company?.name ?? "A company"
    const assessmentTitle = assessment.title

    Promise.allSettled(
      (candidates ?? []).map((c) =>
        sendInviteEmail({
          to: c.email,
          companyName,
          assessmentTitle,
          inviteToken: c.invite_token,
        })
      )
    ).catch((err) => console.error("Bulk invite email error:", err))

    return NextResponse.json({ results: candidates ?? [] })
  } catch (err) {
    console.error("Bulk candidate route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
