import { NextRequest, NextResponse } from "next/server"
import { Sandbox } from "@e2b/code-interpreter"

interface Props {
  params: Promise<{ sandboxId: string }>
}

export async function GET(req: NextRequest, { params }: Props) {
  const { sandboxId } = await params
  const path = req.nextUrl.searchParams.get("path")

  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 })

  try {
    const sandbox = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY })
    const content = await sandbox.files.read(path)
    return NextResponse.json({ content })
  } catch (err) {
    console.error("[file] read error:", err)
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 })
  }
}
