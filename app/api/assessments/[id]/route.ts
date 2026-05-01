import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    // Verify caller is authenticated
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await createServiceClient()

    // Confirm the assessment belongs to this company before deleting
    const { data: assessment } = await supabase
      .from("assessments")
      .select("id, company_id")
      .eq("id", id)
      .eq("company_id", user.id)
      .single()

    if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Delete scores first — they have FKs to assessments/candidates without CASCADE,
    // which would block the cascade chain when deleting the assessment.
    const { error: scoresError } = await supabase
      .from("scores")
      .delete()
      .eq("assessment_id", id)

    if (scoresError) {
      console.error("Delete scores error:", scoresError)
      return NextResponse.json({ error: scoresError.message }, { status: 500 })
    }

    const { error } = await supabase.from("assessments").delete().eq("id", id)

    if (error) {
      console.error("Delete assessment error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Delete assessment error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
