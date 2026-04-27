import { NextRequest, NextResponse } from "next/server"
import { Sandbox } from "@e2b/code-interpreter"

interface Props {
  params: Promise<{ sandboxId: string }>
}

export async function GET(req: NextRequest, { params }: Props) {
  const { sandboxId } = await params
  const path = req.nextUrl.searchParams.get("path") ?? "/home/user"

  try {
    const sandbox = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY })
    const entries = await sandbox.files.list(path)
    return NextResponse.json({ entries })
  } catch (err) {
    console.error("[files] list error:", err)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
