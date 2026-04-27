import type { WebSocket } from "ws"
import type { IncomingMessage } from "http"
import { parse } from "url"
import { Sandbox } from "@e2b/code-interpreter"
import { createAdminClient } from "./supabase/admin"

const IDLE_TIMEOUT_MS = 15 * 60 * 1000  // pause sandbox after 15 min idle
const KEEPALIVE_MS    = 60 * 1000        // extend sandbox timeout every 60s

export function handlePtyWebSocket(ws: WebSocket, req: IncomingMessage) {
  const { query } = parse(req.url!, true)
  const sandboxId = query.sandboxId as string
  const sessionId = query.sessionId as string

  console.log("[ws] connection", { sandboxId, sessionId })

  if (!sandboxId || !sessionId) {
    ws.close(1008, "Missing sandboxId or sessionId")
    return
  }

  // Buffer messages that arrive before the PTY is ready
  const messageQueue: Buffer[] = []
  let ptyReady = false

  ws.on("message", (data) => {
    if (ptyReady) {
      flushInput(data as Buffer)
    } else {
      messageQueue.push(data as Buffer)
    }
  })

  ws.on("error", (err) => console.error("[ws] client error:", err))

  // Async setup runs in background — messages are buffered until it completes
  setup().catch((err) => {
    console.error("[ws] setup error:", err)
    ws.close(1011, "Setup failed")
  })

  let sandbox: Sandbox
  let activePtyId = 0
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let inputReceived = false

  function resetIdleTimer() {
    if (!inputReceived) return
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(async () => {
      console.log(`[ws] pausing idle sandbox ${sandboxId}`)
      try {
        await sandbox.pause()
        await createAdminClient()
          .from("sessions")
          .update({ sandbox_paused: true })
          .eq("id", sessionId)
      } catch (err) {
        console.error("[ws] pause error:", err)
      }
      ws.close(1000, "Paused due to inactivity")
    }, IDLE_TIMEOUT_MS)
  }

  async function flushInput(data: Buffer) {
    inputReceived = true
    resetIdleTimer()
    try {
      await sandbox.pty.sendInput(activePtyId, data)
    } catch (err) {
      console.error("[ws] sendInput error:", err)
    }
  }

  async function setup() {
    const supabase = createAdminClient()

    // Always read the current ptyId from DB — client-side ptyId may be stale after reconnects
    const { data: session } = await supabase
      .from("sessions")
      .select("sandbox_id, sandbox_paused")
      .eq("id", sessionId)
      .single()

    if (!session?.sandbox_id) {
      throw new Error("No sandbox_id found for session")
    }

    const [, ptyIdStr] = session.sandbox_id.split("::")
    activePtyId = Number(ptyIdStr)

    console.log("[ws] connecting to sandbox", sandboxId, "pty", activePtyId)
    sandbox = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY })

    if (session?.sandbox_paused) {
      await supabase.from("sessions").update({ sandbox_paused: false }).eq("id", sessionId)
    }

    await sandbox.pty.connect(activePtyId, {
      onData: (data: Uint8Array) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(data)
        }
      },
    })

    // PTY ready — flush any buffered messages
    ptyReady = true
    console.log("[ws] PTY ready, flushing", messageQueue.length, "buffered messages")
    for (const msg of messageQueue) {
      await flushInput(msg)
    }
    messageQueue.length = 0

    // Extend sandbox timeout periodically
    const keepAlive = setInterval(async () => {
      try {
        await sandbox.setTimeout(300_000)
      } catch {
        clearInterval(keepAlive)
      }
    }, KEEPALIVE_MS)

    ws.on("close", () => {
      if (idleTimer) clearTimeout(idleTimer)
      clearInterval(keepAlive)
    })
  }
}
