"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { X } from "lucide-react"
import { NotesDrawer } from "./NotesDrawer"
import { FileTree } from "./FileTree"
import type { Assessment, AssessmentRound, DocumentState } from "@/lib/types"

const CodeEditor = dynamic(
  () => import("./CodeEditor").then((m) => m.CodeEditor),
  { ssr: false, loading: () => <div style={{ background: "#0d0d0d", height: "100%" }} /> }
)

const CandidateTerminal = dynamic(
  () => import("./CandidateTerminal").then((m) => m.CandidateTerminal),
  { ssr: false, loading: () => <div style={{ background: "#0d0d0d", height: "100%" }} /> }
)

interface CodeWorkspaceProps {
  assessment: Assessment
  currentRound: number
  round: AssessmentRound
  totalRounds: number
  sessionId: string
  elapsedSeconds: number
  planningNotes: string
  initialCode: string
  onCodeChange: (state: DocumentState) => void
  onSubmit: () => void
  onNextRound: () => void
  submitting: boolean
}

const STARTER_CODE: Record<string, string> = {
  python: `# Write your solution here\n\n\n`,
  javascript: `// Write your solution here\n\n\n`,
}

interface OpenFile {
  path: string
  label: string
  content: string
  language: string
}

function langFromPath(path: string): string {
  const ext = path.split(".").pop() ?? ""
  const map: Record<string, string> = {
    py: "python", js: "javascript", ts: "typescript",
    tsx: "typescript", jsx: "javascript", json: "json",
    md: "markdown", sh: "shell", html: "html", css: "css",
  }
  return map[ext] ?? "plaintext"
}

export function CodeWorkspace({
  assessment,
  currentRound,
  round,
  totalRounds,
  sessionId,
  elapsedSeconds,
  planningNotes,
  initialCode,
  onCodeChange,
  onSubmit,
  onNextRound,
  submitting,
}: CodeWorkspaceProps) {
  const language = assessment.language ?? "python"
  const [code, setCode] = useState(initialCode || STARTER_CODE[language])
  const [notesOpen, setNotesOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [ptyId, setPtyId] = useState<string | null>(null)
  const [sandboxLoading, setSandboxLoading] = useState(true)
  const [sandboxError, setSandboxError] = useState(false)
  const [isNewSandbox, setIsNewSandbox] = useState(false)
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const isLastRound = currentRound === totalRounds
  const initialized = useRef(false)

  const handleFileOpen = useCallback((path: string, content: string) => {
    const label = path.split("/").pop() ?? path
    const fileLang = langFromPath(path)
    setOpenFiles((prev) => {
      if (prev.find((f) => f.path === path)) return prev
      return [...prev, { path, label, content, language: fileLang }]
    })
    setActiveFilePath(path)
  }, [])

  function closeTab(path: string) {
    setOpenFiles((prev) => {
      const next = prev.filter((f) => f.path !== path)
      if (activeFilePath === path) {
        setActiveFilePath(next.length > 0 ? next[next.length - 1].path : null)
      }
      return next
    })
  }

  const activeFile = openFiles.find((f) => f.path === activeFilePath) ?? null

  // Start sandbox on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function initSandbox() {
      try {
        const res = await fetch("/api/sandbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, language }),
        })
        if (!res.ok) throw new Error("Sandbox init failed")
        const { sandboxId: sid, ptyId: pid, isNew } = await res.json()
        setSandboxId(sid)
        setPtyId(pid)
        setIsNewSandbox(!!isNew)
      } catch {
        setSandboxError(true)
      } finally {
        setSandboxLoading(false)
      }
    }

    initSandbox()
  }, [sessionId, language])

  function handleCodeChange(value: string) {
    setCode(value)
    onCodeChange({ code: value, language } as unknown as DocumentState)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0d0d0d" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          minHeight: 48,
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold" style={{ color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
            Pactum
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalRounds - 1 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-6 rounded-full"
                style={{
                  background: i < currentRound - 1
                    ? "var(--color-cobalt)"
                    : i === currentRound - 2
                    ? "var(--color-cobalt)"
                    : "var(--color-border)",
                  opacity: i < currentRound - 2 ? 0.45 : 1,
                }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--color-slate)" }}>
            Round {currentRound - 1} of {totalRounds - 1} · {round.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono" style={{ color: "var(--color-slate)" }}>
            {formatTime(elapsedSeconds)}
          </span>
          {planningNotes && (
            <button
              onClick={() => setNotesOpen(true)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-slate)",
                background: "var(--color-canvas)",
                cursor: "pointer",
              }}
            >
              View notes
            </button>
          )}
          <button
            onClick={() => setConfirming(true)}
            disabled={submitting}
            className="btn-pill-dark text-xs px-4 py-1.5 disabled:opacity-50"
          >
            {isLastRound ? "Submit →" : `Done with Round ${currentRound - 1} →`}
          </button>
        </div>
      </div>

      {/* Confirmation banner */}
      {confirming && (
        <div
          className="px-4 py-3 shrink-0 flex items-center justify-between"
          style={{ background: "#fffbeb", borderBottom: "1px solid #fcd34d" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#92400e" }}>
            {isLastRound
              ? "Submit your assessment? This ends the session and triggers scoring."
              : `Move to the next round? You won't be able to return to this one.`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={isLastRound ? onSubmit : onNextRound}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
              style={{ background: "var(--color-ink)", color: "#fff", cursor: "pointer" }}
            >
              {submitting ? "Submitting…" : isLastRound ? "Yes, submit" : "Yes, next round"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "transparent", color: "#92400e", border: "1px solid #fcd34d", cursor: "pointer" }}
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Problem panel */}
        <div
          className="shrink-0 flex flex-col overflow-y-auto border-r"
          style={{
            width: 320,
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="px-5 py-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-silver)" }}>
                Background
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-slate)" }}>
                {assessment.description}
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-cobalt)" }}>
                Round task
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-ink-near)" }}>
                {round.prompt}
              </p>
            </div>

            <div
              className="rounded-xl p-3"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-xs" style={{ color: "var(--color-silver)" }}>
                Language: <span style={{ color: "var(--color-slate)" }}>{language === "python" ? "Python" : "JavaScript"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: file tree + editor + terminal */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Editor row: file tree sidebar + editor/tabs */}
          <div className="flex overflow-hidden" style={{ flex: "0 0 60%", borderBottom: "1px solid #333" }}>
            {/* File tree sidebar — only shown once sandbox is ready */}
            {sandboxId && (
              <div style={{ width: 180, flexShrink: 0 }}>
                <FileTree sandboxId={sandboxId} onFileOpen={handleFileOpen} />
              </div>
            )}

            {/* Editor + tab bar */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab bar */}
              {openFiles.length > 0 && (
                <div
                  className="flex items-center overflow-x-auto shrink-0"
                  style={{ background: "#1a1a1a", borderBottom: "1px solid #333", minHeight: 32 }}
                >
                  {openFiles.map((f) => (
                    <div
                      key={f.path}
                      className="flex items-center gap-1.5 px-3 shrink-0 cursor-pointer border-r"
                      style={{
                        height: 32,
                        fontSize: 12,
                        borderColor: "#333",
                        background: activeFilePath === f.path ? "#0d0d0d" : "transparent",
                        color: activeFilePath === f.path ? "#e8e8e8" : "#777",
                        borderBottom: activeFilePath === f.path ? "1px solid #0d0d0d" : "none",
                      }}
                      onClick={() => setActiveFilePath(f.path)}
                    >
                      <span>{f.label}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); closeTab(f.path) }}
                        className="rounded hover:bg-white/10 transition-colors"
                        style={{ color: "#555", lineHeight: 1, padding: "1px 2px" }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Editor — shows active open file, or falls back to main solution file */}
              <div className="flex-1 overflow-hidden">
                {activeFile ? (
                  <CodeEditor
                    key={activeFile.path}
                    value={activeFile.content}
                    language={activeFile.language as "python" | "javascript"}
                    onChange={(val) => {
                      setOpenFiles((prev) =>
                        prev.map((f) => f.path === activeFile.path ? { ...f, content: val } : f)
                      )
                    }}
                  />
                ) : (
                  <CodeEditor
                    value={code}
                    language={language}
                    onChange={handleCodeChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Terminal (bottom 40%) */}
          <div style={{ flex: "0 0 40%", overflow: "hidden", background: "#0d0d0d", position: "relative" }}>
            {/* Terminal header */}
            <div
              className="flex items-center justify-between px-3 py-1.5 shrink-0"
              style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                </div>
                <span className="text-xs" style={{ color: "#888" }}>Terminal — Claude Code</span>
                <span className="text-xs" style={{ color: "#444" }}>
                  · If Claude doesn&apos;t start, type <code style={{ color: "#666", fontFamily: "monospace" }}>claude</code> and press Enter
                </span>
              </div>
              {sandboxLoading && (
                <span className="text-xs animate-pulse" style={{ color: "#888" }}>
                  Starting sandbox…
                </span>
              )}
            </div>

            {sandboxError ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: "#888" }}>
                  Failed to start sandbox. Please refresh and try again.
                </p>
              </div>
            ) : sandboxLoading ? (
              <div
                className="h-full flex items-center justify-center"
                style={{ background: "#0d0d0d" }}
              >
                <p className="text-xs font-mono animate-pulse" style={{ color: "#555" }}>
                  Initializing Claude Code…
                </p>
              </div>
            ) : sandboxId && ptyId ? (
              <div style={{ height: "calc(100% - 32px)" }}>
                <CandidateTerminal sandboxId={sandboxId} ptyId={ptyId} sessionId={sessionId} autoStartClaude={isNewSandbox} />
              </div>
            ) : null}
          </div>

          {/* Notes drawer overlays the right pane */}
          <NotesDrawer
            notes={planningNotes}
            isOpen={notesOpen}
            onClose={() => setNotesOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
