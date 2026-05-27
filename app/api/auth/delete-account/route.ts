import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE() {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createAdminClient()

    // Delete scores first — missing CASCADE FKs would block the cascade chain
    const { error: scoresError } = await supabase
      .from("scores")
      .delete()
      .eq("company_id", user.id)

    if (scoresError) {
      console.error("Delete scores error:", scoresError)
      return NextResponse.json({ error: scoresError.message }, { status: 500 })
    }

    // Delete the auth user — cascades to companies → assessments → candidates → sessions → messages
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error("Delete user error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Delete account error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
