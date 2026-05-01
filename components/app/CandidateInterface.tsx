"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Assessment, Candidate, Session, Message, AssessmentRound, DocPatch, DocumentState, DocumentStateCode } from "@/lib/types"
import dynamic from "next/dynamic"
import { TaskContextDrawer } from "@/components/workspace/TaskContextDrawer"
import { PlanningWorkspace } from "@/components/workspace/PlanningWorkspace"

const WorkspacePanel = dynamic(
  () => import("@/components/workspace/WorkspacePanel").then((m) => m.WorkspacePanel),
  { ssr: false }
)

import { useDocumentPersistence } from "@/lib/hooks/useDocumentPersistence"

interface CandidateInterfaceProps {
  candidate: Candidate
  assessment: Assessment
  session: Session
  initialMessages: Message[]
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  saved?: boolean
  editedFile?: string
}

export function CandidateInterface({
  candidate,
  assessment,
  session,
  initialMessages,
}: CandidateInterfaceProps) {
  const [currentRound, setCurrentRound] = useState(session.current_round)

  // Build per-round message history from initialMessages (handles page reload mid-assessment)
  const buildRoundHistory = () => {
    const history: { roundNumber: number; roundTitle: string; messages: ChatMessage[] }[] = []
    for (let r = 1; r < session.current_round; r++) {
      const roundData = assessment.rounds[r - 1] as AssessmentRound
      const msgs = initialMessages
        .filter((m) => m.round === r)
        .map((m) => ({ role: m.role, content: m.content, saved: true }))
      if (msgs.length > 0) {
        history.push({ roundNumber: r, roundTitle: roundData.title, messages: msgs })
      }
    }
    return history
  }

  const [previousRounds, setPreviousRounds] = useState(buildRoundHistory)
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages
      .filter((m) => m.round === session.current_round)
      .map((m) => ({ role: m.role, content: m.content, saved: true }))
  )
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [sessionStatus, setSessionStatus] = useState(session.status)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [candidateName, setCandidateName] = useState(candidate.name ?? "")
  const [nameSubmitted, setNameSubmitted] = useState(!!candidate.name)
  const [darkMode, setDarkMode] = useState(assessment.workspace_type === "code")

  // Workspace state, initialize code workspaces with starter files if defined
  const [documentState, setDocumentState] = useState<DocumentState | null>(() => {
    if (session.document_state) return session.document_state
    if (assessment.workspace_type === "code") {
      const lang = assessment.language ?? "python"
      const mainFile = lang === "python" ? "main.py" : "main.js"
      const files = assessment.starter_files
        ?? { [mainFile]: lang === "python" ? "# Write your solution here\n\n\n" : "// Write your solution here\n\n\n" }
      const activeFile = Object.keys(files)[0]
      return { files, activeFile, language: lang } as DocumentStateCode
    }
    return null
  })
  const [suggestedPatch, setSuggestedPatch] = useState<DocPatch | null>(null)
  const [pendingPatch, setPendingPatch] = useState<DocPatch | null>(null)
  const [generatingPatch, setGeneratingPatch] = useState(false)

  // Task context drawer
  const [contextDrawerOpen, setContextDrawerOpen] = useState(true)
  const [hasNewRound, setHasNewRound] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Resizable split
  const [chatWidth, setChatWidth] = useState(460)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const onDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    const delta = e.clientX - dragStartX.current
    setChatWidth(Math.max(320, Math.min(680, dragStartWidth.current + delta)))
  }, [])

  const onDragEnd = useCallback(() => {
    isDragging.current = false
    document.removeEventListener("mousemove", onDragMove)
    document.removeEventListener("mouseup", onDragEnd)
  }, [onDragMove])

  function onDragStart(e: React.MouseEvent) {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWidth.current = chatWidth
    document.addEventListener("mousemove", onDragMove)
    document.addEventListener("mouseup", onDragEnd)
  }

  const totalRounds = assessment.rounds.length
  const round = assessment.rounds[currentRound - 1] as AssessmentRound

  // Persist document state
  useDocumentPersistence(session.id, documentState)

  // Timer
  useEffect(() => {
    const start = Date.now() - elapsedSeconds * 1000
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll chat only when user is near the bottom
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // "New round" pulse indicator
  useEffect(() => {
    if (currentRound === 1) return
    setHasNewRound(true)
    const t = setTimeout(() => setHasNewRound(false), 5000)
    return () => clearTimeout(t)
  }, [currentRound])

  async function saveMessage(roundNum: number, role: "user" | "assistant", content: string) {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, round: roundNum, role, content }),
    })
  }

  async function handleSend() {
    if (!input.trim() || sending || sessionStatus !== "in_progress") return

    const userMessage: ChatMessage = { role: "user", content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setSending(true)

    try {
      await saveMessage(currentRound, "user", userMessage.content)
      const roundContext = {
        roundNumber: currentRound,
        totalRounds,
        title: round.title,
        prompt: round.prompt,
        successCriteria: round.success_criteria,
        background: assessment.description,
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          tensionLevel: assessment.tension_level,
          round: roundContext,
          previousRounds: previousRounds.map((pr) => ({
            roundNumber: pr.roundNumber,
            roundTitle: pr.roundTitle,
            messages: pr.messages.map((m) => ({ role: m.role, content: m.content })),
          })),
          documentState,
          workspaceType: assessment.workspace_type,
        }),
      })

      if (!response.ok || !response.body) throw new Error("Chat request failed")

      // Add empty assistant message and start streaming into it
      setMessages([...updatedMessages, { role: "assistant", content: "" }])
      setIsStreaming(true)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullContent += decoder.decode(value, { stream: true })
        const captured = fullContent
        setMessages((prev) => {
          const msgs = [...prev]
          msgs[msgs.length - 1] = { role: "assistant", content: captured }
          return msgs
        })
      }

      setIsStreaming(false)

      if (fullContent) {
        await saveMessage(currentRound, "assistant", fullContent)
        // Auto-generate doc patch in background, candidate still accepts/dismisses
        handleApplyToDoc(fullContent)
      }
    } catch (err) {
      console.error("Send error:", err)
      setIsStreaming(false)
    } finally {
      setSending(false)
    }
  }

  async function handleApplyToDoc(messageContent: string) {
    setGeneratingPatch(true)
    try {
      const res = await fetch("/api/doc-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          messageContent,
          workspaceType: assessment.workspace_type,
          currentDocumentState: documentState,
        }),
      })
      const data = await res.json()
      if (data.patch) setSuggestedPatch(data.patch)
    } catch (err) {
      console.error("Doc patch error:", err)
    } finally {
      setGeneratingPatch(false)
    }
  }

  function handleAcceptPatch() {
    if (suggestedPatch && "path" in suggestedPatch) {
      const filePath = (suggestedPatch as import("@/lib/types").DocPatchCode).path
      setMessages((prev) => {
        const msgs = [...prev]
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "assistant") {
            msgs[i] = { ...msgs[i], editedFile: filePath }
            break
          }
        }
        return msgs
      })
    }
    setPendingPatch(suggestedPatch)
    setSuggestedPatch(null)
  }

  function handleDismissPatch() {
    setSuggestedPatch(null)
  }

  function handlePatchApplied() {
    setPendingPatch(null)
  }

  async function handleNextRound() {
    if (currentRound < totalRounds) {
      const nextRound = currentRound + 1
      await fetch("/api/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, current_round: nextRound }),
      })
      setPreviousRounds((prev) => [
        ...prev,
        { roundNumber: currentRound, roundTitle: round.title, messages },
      ])
      setCurrentRound(nextRound)
      setMessages([])
      setConfirming(false)
    }
  }

  async function handleFinish() {
    setSending(true)
    try {
      await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })
      setSessionStatus("completed")
    } catch (err) {
      console.error("Grade error:", err)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  // Name gate
  if (!nameSubmitted) {
    return (
      <NameGate
        assessmentTitle={assessment.title}
        showDarkToggle={assessment.workspace_type !== "code"}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
        onSubmit={async (name) => {
          await fetch("/api/session", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: session.id }),
          })
          setCandidateName(name)
          setNameSubmitted(true)
        }}
      />
    )
  }

  // Completed state
  if (sessionStatus === "completed") {
    return (
      <div data-dark={darkMode} className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-canvas)" }}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>
            Assessment complete
          </h1>
          <p className="text-sm" style={{ color: "var(--color-slate)" }}>
            Your responses have been submitted and scored. The hiring team will be in touch.
          </p>
          <p className="text-xs mt-4" style={{ color: "var(--color-silver)" }}>
            Time: {formatTime(elapsedSeconds)}
          </p>
        </div>
      </div>
    )
  }

  // ── Code workspace: round 1 = planning phase ─────────────────
  if (assessment.workspace_type === "code" && currentRound === 1) {
    return (
      <div data-dark="true" style={{ colorScheme: "dark" }}>
        <PlanningWorkspace
          assessment={assessment}
          round={round}
          onSubmit={async (notes) => {
            await saveMessage(1, "user", notes)
            await handleNextRound()
          }}
        />
      </div>
    )
  }

  return (
    <div data-dark={darkMode} className="flex h-screen overflow-hidden" style={{ background: "var(--color-canvas)" }}>
      {/* Left: Chat column */}
      <div
        className="flex flex-col shrink-0 overflow-hidden"
        style={{
          width: chatWidth,
          background: "var(--color-surface)",
        }}
      >
        {/* Task context drawer */}
        <TaskContextDrawer
          assessment={assessment}
          currentRound={currentRound}
          round={round}
          elapsedSeconds={elapsedSeconds}
          totalRounds={totalRounds}
          isOpen={contextDrawerOpen}
          onToggle={() => setContextDrawerOpen((v) => !v)}
          hasNewRound={hasNewRound}
        />

        {/* Chat header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>Claude AI</p>
            <p className="text-xs" style={{ color: "var(--color-slate)" }}>
              {assessment.tension_level === "junior" ? "Supportive mode" : "Executor mode"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs" style={{ color: "var(--color-silver)" }}>
              {messages.filter(m => m.role === "user").length} prompt{messages.filter(m => m.role === "user").length !== 1 ? "s" : ""}
            </p>
            {assessment.workspace_type !== "code" && (
              <button
                onClick={() => setDarkMode((v) => !v)}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-slate)",
                  cursor: "pointer",
                }}
              >
                {darkMode ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-10">
              <p className="text-sm font-medium" style={{ color: "var(--color-ink-near)" }}>
                Start by sending your first message
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-slate)" }}>
                Use Claude to work on the task. Apply responses to the workspace on the right.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ChatBubble
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            </motion.div>
          ))}
          <AnimatePresence>
            {sending && !isStreaming && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex gap-2 items-start"
              >
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--color-cobalt)" }}
                >
                  C
                </div>
                <div
                  className="px-3 py-2.5 rounded-2xl rounded-tl-sm text-sm"
                  style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Confirmation banner */}
        {confirming && (
          <div
            className="px-4 py-3 shrink-0 border-t"
            style={{ background: "#fffbeb", borderColor: "#fcd34d" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#92400e" }}>
              {currentRound < totalRounds
                ? `Submit Round ${currentRound} and move to Round ${currentRound + 1}?`
                : "Submit your assessment?"}
            </p>
            <p className="text-xs mb-2.5" style={{ color: "#b45309" }}>
              {currentRound < totalRounds
                ? "You won't be able to go back. Make sure your work reflects your best effort."
                : "This ends the assessment. Your full session will be scored."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={currentRound < totalRounds ? handleNextRound : handleFinish}
                disabled={sending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                style={{ background: "var(--color-ink)", color: "var(--color-canvas)", cursor: "pointer" }}
              >
                {sending ? "Submitting…" : currentRound < totalRounds ? `Move to Round ${currentRound + 1} →` : "Yes, submit"}
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

        {/* Input area */}
        {!confirming && (
          <div
            className="px-4 py-3 border-t shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div
              className="flex items-end gap-2 rounded-2xl px-3 py-2.5 mb-2"
              style={{ border: "1.5px solid var(--color-border-input)", background: "var(--color-canvas)" }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Claude…"
                rows={2}
                className="flex-1 bg-transparent text-sm outline-none resize-none"
                style={{ color: "var(--color-ink-near)" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-30"
                style={{ background: "var(--color-ink)", color: "var(--color-canvas)", cursor: "pointer" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
                </svg>
              </button>
            </div>

            {(() => {
              const userMessageCount = messages.filter(m => m.role === "user").length
              const isLastRound = currentRound === totalRounds
              if (userMessageCount === 0) return null
              return (
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "var(--color-silver)" }}>
                    All prompts are recorded.
                  </p>
                  <button
                    onClick={() => setConfirming(true)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                    style={{ background: "var(--color-canvas)", color: "var(--color-ink-near)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                  >
                    {isLastRound ? "Submit →" : `Done with Round ${currentRound} →`}
                  </button>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        className="shrink-0 hover:bg-blue-400 transition-colors"
        style={{ width: 4, cursor: "col-resize", background: "var(--color-border)" }}
      />

      {/* Right: Workspace */}
      <WorkspacePanel
        workspaceType={assessment.workspace_type}
        documentState={documentState}
        suggestedPatch={suggestedPatch}
        pendingPatch={pendingPatch}
        isGeneratingPatch={generatingPatch}
        onAcceptPatch={handleAcceptPatch}
        onDismissPatch={handleDismissPatch}
        onPatchApplied={handlePatchApplied}
        onDocumentChange={setDocumentState}
      />
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────

function ChatBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage
  isStreaming?: boolean
}) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-2 items-start ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ background: isUser ? "var(--color-ink)" : "var(--color-cobalt)", color: isUser ? "var(--color-canvas)" : "#fff" }}
      >
        {isUser ? "Y" : "C"}
      </div>
      <div className="min-w-0 max-w-[85%]">
        <div
          className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
          style={{
            background: isUser ? "var(--color-ink)" : "var(--color-surface)",
            color: isUser ? "var(--color-canvas)" : "var(--color-ink-near)",
            border: isUser ? "none" : "1px solid var(--color-border)",
          }}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : isStreaming ? (
            <span className="whitespace-pre-wrap">
              {message.content}
              <span
                className="inline-block w-0.5 h-3.5 rounded-full align-middle ml-0.5 animate-pulse"
                style={{ background: "var(--color-cobalt)", verticalAlign: "middle" }}
              />
            </span>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {message.editedFile && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono"
              style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {message.editedFile}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function NameGate({
  assessmentTitle,
  showDarkToggle,
  darkMode,
  onDarkModeChange,
  onSubmit,
}: {
  assessmentTitle: string
  showDarkToggle: boolean
  darkMode: boolean
  onDarkModeChange: (v: boolean) => void
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState("")

  return (
    <div
      data-dark={darkMode}
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-canvas)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold mb-1" style={{ color: "var(--color-ink)" }}>Pactum</p>
          <p className="text-sm" style={{ color: "var(--color-slate)" }}>{assessmentTitle}</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--color-ink)" }}>Before you begin</p>
          <p className="text-sm mb-6" style={{ color: "var(--color-slate)" }}>
            This assessment uses AI. Every prompt you write and every response you receive will be recorded and reviewed by the hiring team. Take your time and show your thinking.
          </p>

          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink-near)" }}>
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onSubmit(name.trim())}
            placeholder="Jane Smith"
            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none mb-6"
            style={{ border: "1px solid var(--color-border-input)", background: "var(--color-canvas)", color: "var(--color-ink-near)" }}
            autoFocus
          />

          {showDarkToggle && (
            <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-ink-near)" }}>Dark mode</p>
                <p className="text-xs" style={{ color: "var(--color-slate)" }}>Easier on the eyes during long sessions</p>
              </div>
              <button
                type="button"
                onClick={() => onDarkModeChange(!darkMode)}
                role="switch"
                aria-checked={darkMode}
                className="relative shrink-0 rounded-full transition-colors duration-200"
                style={{
                  width: 44,
                  height: 24,
                  background: darkMode ? "var(--color-cobalt)" : "var(--color-border-input)",
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                }}
              >
                <span
                  className="absolute top-0.5 rounded-full bg-white transition-transform duration-200"
                  style={{
                    width: 20,
                    height: 20,
                    left: 2,
                    transform: darkMode ? "translateX(20px)" : "translateX(0px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </div>
          )}

          <button
            onClick={() => name.trim() && onSubmit(name.trim())}
            disabled={!name.trim()}
            className="w-full btn-pill-dark disabled:opacity-40"
          >
            Start assessment →
          </button>
        </div>
      </div>
    </div>
  )
}
