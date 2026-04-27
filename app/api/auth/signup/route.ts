import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { userId, name, email } = await req.json()
    if (!userId || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Upsert so it's safe to call multiple times
    const { error } = await supabase
      .from("companies")
      .upsert({ id: userId, name, email }, { onConflict: "id" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Signup route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
