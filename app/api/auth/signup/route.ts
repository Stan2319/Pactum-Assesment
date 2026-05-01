import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Verify the caller is authenticated — never trust a client-supplied userId
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServiceClient()

    // Upsert so it's safe to call multiple times
    const { error } = await supabase
      .from("companies")
      .upsert({ id: user.id, name, email }, { onConflict: "id" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Signup route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
