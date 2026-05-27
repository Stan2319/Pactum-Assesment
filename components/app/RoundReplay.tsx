"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { AssessmentRound, Message } from "@/lib/types"

interface Props {
  rounds: AssessmentRound[]
  messages: Message[]
}

export function RoundReplay({ rounds, messages }: Props) {
  const [activeRound, setActiveRound] = useState(1)

  const roundMessages = messages.filter((m) => m.round === activeRound)
  const activeRoundData = rounds.find((r) => r.round === activeRound)
  const userCount = roundMessages.filter((m) => m.role === "user").length
  const totalRounds = rounds.length
  const canPrev = activeRound > 1
  const canNext = activeRound < totalRounds

  return (
    <div>
      {/* Round navigation */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 py-3"
        style={{ background: "var(--color-canvas)" }}
      >
        {/* Prev */}
        <button
          onClick={() => canPrev && setActiveRound(activeRound - 1)}
          disabled={!canPrev}
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: 28,
            height: 28,
            border: "1px solid var(--color-border)",
            background: canPrev ? "var(--color-surface)" : "transparent",
            color: canPrev ? "var(--color-ink)" : "var(--color-border)",
            cursor: canPrev ? "pointer" : "default",
            flexShrink: 0,
          }}
          aria-label="Previous round"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Pills */}
        <div className="flex items-center gap-1 flex-wrap flex-1">
          {rounds.map((round) => {
            const isActive = round.round === activeRound
            const roundMsgCount = messages.filter(
              (m) => m.round === round.round && m.role === "user"
            ).length

            return (
              <button
                key={round.round}
                onClick={() => setActiveRound(round.round)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: isActive ? "var(--color-ink)" : "var(--color-surface)",
                  color: isActive ? "#fff" : "var(--color-slate)",
                  border: `1px solid ${isActive ? "var(--color-ink)" : "var(--color-border)"}`,
                }}
              >
                <span>Round {round.round}</span>
                <span className="font-normal opacity-70" style={{ fontSize: 10 }}>
                  {roundMsgCount}p
                </span>
              </button>
            )
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => canNext && setActiveRound(activeRound + 1)}
          disabled={!canNext}
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: 28,
            height: 28,
            border: "1px solid var(--color-border)",
            background: canNext ? "var(--color-surface)" : "transparent",
            color: canNext ? "var(--color-ink)" : "var(--color-border)",
            cursor: canNext ? "pointer" : "default",
            flexShrink: 0,
          }}
          aria-label="Next round"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Round content */}
      {activeRoundData && (
        <div
          className="rounded-2xl overflow-hidden mt-3"
          style={{ border: "1px solid var(--color-border)" }}
        >
          {/* Round header */}
          <div
            className="px-5 py-4"
            style={{
              background: "var(--color-canvas)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-baseline justify-between gap-4 mb-1.5">
              <p className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                Round {activeRoundData.round}: {activeRoundData.title}
              </p>
              <span className="text-xs shrink-0" style={{ color: "var(--color-silver)" }}>
                {userCount} prompt{userCount !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>
              {activeRoundData.prompt}
            </p>
          </div>

          {/* Messages */}
          <div style={{ background: "var(--color-surface)" }}>
            {roundMessages.length === 0 ? (
              <p className="px-5 py-5 text-sm" style={{ color: "var(--color-silver)" }}>
                No messages in this round.
              </p>
            ) : (
              roundMessages.map((msg, i) => {
                const isUser = msg.role === "user"
                const isLast = i === roundMessages.length - 1
                return (
                  <div
                    key={msg.id}
                    className="px-5 py-4"
                    style={{
                      borderBottom: isLast ? "none" : "1px solid var(--color-border)",
                      background: isUser ? "var(--color-canvas)" : "var(--color-surface)",
                    }}
                  >
                    {/* Speaker row */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                        style={{
                          width: 20,
                          height: 20,
                          background: isUser ? "var(--color-ink)" : "var(--color-cobalt)",
                          color: "#fff",
                          fontSize: 10,
                        }}
                      >
                        {isUser ? "C" : "A"}
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isUser ? "var(--color-ink)" : "var(--color-cobalt)" }}
                      >
                        {isUser ? "Candidate" : "Claude"}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-silver)" }}>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Message body */}
                    <div style={{ paddingLeft: 28 }}>
                      {isUser ? (
                        <p
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                          style={{ color: "var(--color-ink-near)" }}
                        >
                          {msg.content}
                        </p>
                      ) : (
                        <MarkdownMessage content={msg.content} />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Renders AI message content as markdown with syntax-highlighted code blocks
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p({ children }) {
          return (
            <p
              className="text-sm leading-relaxed mb-3 last:mb-0"
              style={{ color: "var(--color-ink-near)" }}
            >
              {children}
            </p>
          )
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const isBlock = !!match || String(children).includes("\n")
          const codeString = String(children).replace(/\n$/, "")

          if (isBlock) {
            return (
              <div
                className="rounded-xl overflow-hidden my-3"
                style={{ border: "1px solid #3c3c3c" }}
              >
                {match && (
                  <div
                    className="px-4 py-2 text-xs font-mono font-medium"
                    style={{ background: "#1e1e1e", color: "#858585", borderBottom: "1px solid #3c3c3c" }}
                  >
                    {match[1]}
                  </div>
                )}
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match?.[1] ?? "text"}
                  PreTag="div"
                  showLineNumbers
                  lineNumberStyle={{ color: "#495057", minWidth: "2.5em", paddingRight: "1em", userSelect: "none" }}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    padding: "16px",
                    background: "#1e1e1e",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            )
          }

          return (
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: "var(--color-canvas)", color: "var(--color-cobalt)", border: "1px solid var(--color-border)" }}
              {...props}
            >
              {children}
            </code>
          )
        },
        pre({ children }) {
          // Prevent double-wrapping — ReactMarkdown wraps code in pre, we handle it above
          return <>{children}</>
        },
        ul({ children }) {
          return (
            <ul className="mb-3 space-y-1 pl-4 last:mb-0" style={{ color: "var(--color-ink-near)" }}>
              {children}
            </ul>
          )
        },
        ol({ children }) {
          return (
            <ol className="mb-3 space-y-1 pl-4 list-decimal last:mb-0" style={{ color: "var(--color-ink-near)" }}>
              {children}
            </ol>
          )
        },
        li({ children }) {
          return <li className="text-sm leading-relaxed list-disc">{children}</li>
        },
        strong({ children }) {
          return <strong className="font-semibold" style={{ color: "var(--color-ink)" }}>{children}</strong>
        },
        h1({ children }) {
          return <h1 className="text-base font-bold mb-2 mt-4 first:mt-0" style={{ color: "var(--color-ink)" }}>{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-sm font-bold mb-2 mt-4 first:mt-0" style={{ color: "var(--color-ink)" }}>{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold mb-1.5 mt-3 first:mt-0" style={{ color: "var(--color-ink)" }}>{children}</h3>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
