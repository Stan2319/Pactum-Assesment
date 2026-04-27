"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"

interface CandidateTerminalProps {
  sandboxId: string
  ptyId: string
  sessionId: string
  autoStartClaude?: boolean
}

export function CandidateTerminal({ sandboxId, ptyId, sessionId, autoStartClaude = false }: CandidateTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef  = useRef<Terminal | null>(null)
  const wsRef        = useRef<WebSocket | null>(null)
  const destroyedRef = useRef(false)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    destroyedRef.current = false

    const terminal = new Terminal({
      theme: {
        background: "#0d0d0d",
        foreground: "#e8e8e8",
        cursor: "#e8e8e8",
        selectionBackground: "rgba(255,255,255,0.15)",
        black: "#000000",
        red: "#cc4444",
        green: "#44cc44",
        yellow: "#cccc44",
        blue: "#4488ff",
        magenta: "#cc44cc",
        cyan: "#44cccc",
        white: "#cccccc",
        brightBlack: "#555555",
        brightBlue: "#6699ff",
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      scrollback: 5000,
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(containerRef.current)
    fitAddon.fit()
    terminalRef.current = terminal

    let isFirstConnect = true

    function connect() {
      if (destroyedRef.current) return

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const url = `${protocol}//${window.location.host}/api/ws?sandboxId=${sandboxId}&sessionId=${sessionId}`
      const ws = new WebSocket(url)
      ws.binaryType = "arraybuffer"
      wsRef.current = ws

      ws.onopen = () => {
        if (autoStartClaude && isFirstConnect) {
          isFirstConnect = false
          // cd to home first so claude has a proper working directory
          ws.send(new TextEncoder().encode("cd /home/user && claude\n"))
        }
      }

      ws.onmessage = (e) => {
        terminal.write(new Uint8Array(e.data as ArrayBuffer))
      }

      ws.onclose = (e) => {
        if (destroyedRef.current) return
        if (e.reason === "Paused due to inactivity") {
          terminal.write("\r\n\x1b[33m[Session paused — reconnecting will resume where you left off]\x1b[0m\r\n")
        } else {
          terminal.write("\r\n\x1b[33m[Reconnecting…]\x1b[0m\r\n")
          reconnectRef.current = setTimeout(connect, 2000)
        }
      }

      ws.onerror = () => {
        // onclose fires after onerror, so reconnect is handled there
      }
    }

    connect()

    // Send keystrokes over WS
    terminal.onData((data) => {
      const ws = wsRef.current
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(new TextEncoder().encode(data))
      }
    })

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit() } catch { /* ignore */ }
    })
    resizeObserver.observe(containerRef.current!)

    return () => {
      destroyedRef.current = true
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      resizeObserver.disconnect()
      wsRef.current?.close()
      terminal.dispose()
    }
  }, [sandboxId, ptyId, sessionId])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ background: "#0d0d0d", padding: "8px" }}
    />
  )
}
