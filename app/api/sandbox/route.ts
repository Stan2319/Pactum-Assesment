import { NextRequest, NextResponse } from "next/server"
import { Sandbox } from "@e2b/code-interpreter"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const { sessionId, language } = await req.json()

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status, sandbox_id, sandbox_paused")
    .eq("id", sessionId)
    .single()

  if (!session || session.status !== "in_progress") {
    return NextResponse.json({ error: "Session not found or not active" }, { status: 403 })
  }

  // Reconnect to existing sandbox — PTY processes die on pause, so always create a fresh one
  if (session.sandbox_id) {
    const [existingSandboxId] = session.sandbox_id.split("::")
    try {
      const existing = await Sandbox.connect(existingSandboxId, {
        apiKey: process.env.E2B_API_KEY,
      })
      await existing.setTimeout(300_000)

      const pty = await existing.pty.create({
        cols: 200,
        rows: 50,
        timeoutMs: 300_000,
        onData: () => {},
        envs: {
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
          TERM: "xterm-256color",
        },
      })
      const newPtyId = String(pty.pid)

      await supabase
        .from("sessions")
        .update({ sandbox_id: `${existingSandboxId}::${newPtyId}`, sandbox_paused: false })
        .eq("id", sessionId)

      return NextResponse.json({ sandboxId: existingSandboxId, ptyId: newPtyId, isNew: false })
    } catch {
      // Sandbox expired or unresumable — create a new one below
    }
  }

  // Create a fresh sandbox
  const sandbox = await Sandbox.create("claude", {
    apiKey: process.env.E2B_API_KEY,
    envs: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
    timeoutMs: 300_000,
  })

  // Pre-authenticate Claude Code — approved value is the last 20 chars of the key
  const apiKey = process.env.ANTHROPIC_API_KEY ?? ""
  await sandbox.files.write("/home/user/.claude.json", JSON.stringify({
    primaryApiKey: apiKey,
    hasCompletedOnboarding: true,
    numStartups: 1,
    customApiKeyResponses: { approved: [apiKey.slice(-20)], rejected: [] },
  }))

  // Scaffold starter project
  await Promise.all([
    sandbox.files.write("/home/user/server.js", `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// GET /
app.get('/', (req, res) => {
  res.json({ message: 'Hello from your Express server!' })
})

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`)
})
`),
    sandbox.files.write("/home/user/package.json", JSON.stringify({
      name: "express-server",
      version: "1.0.0",
      main: "server.js",
      scripts: { start: "node server.js" },
      dependencies: { express: "^4.18.2" },
    }, null, 2) + "\n"),
    sandbox.files.write("/home/user/CLAUDE.md", `# Express Server Task

You have a simple Express server in \`server.js\`. Your task will be described by the interviewer.

## Getting started
\`\`\`
npm install
node server.js
\`\`\`

## Files
- \`server.js\` — main Express app
- \`package.json\` — dependencies
`),
  ])

  // Run npm install in the background — don't block sandbox creation
  sandbox.commands.run("cd /home/user && npm install --silent", { timeoutMs: 60_000 }).catch(() => {})

  if (language === "python") {
    await sandbox.commands.run("pip install -q requests pandas 2>&1 | tail -3", { timeoutMs: 30_000 })
  }

  const pty = await sandbox.pty.create({
    cols: 200,
    rows: 50,
    timeoutMs: 300_000,
    onData: () => { /* output streamed via WebSocket */ },
    envs: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      TERM: "xterm-256color",
    },
  })

  const sandboxId = sandbox.sandboxId
  const ptyId = String(pty.pid)

  await supabase
    .from("sessions")
    .update({ sandbox_id: `${sandboxId}::${ptyId}`, sandbox_paused: false })
    .eq("id", sessionId)

  return NextResponse.json({ sandboxId, ptyId, isNew: true })
}
