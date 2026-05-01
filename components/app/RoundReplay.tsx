"use client"

import { useState } from "react"
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

  return (
    <div>
      {/* Round switcher */}
      <div
        className="sticky top-0 z-10 flex items-center gap-1 flex-wrap py-3 -mx-1 px-1"
        style={{ background: "var(--color-canvas)" }}
      >
        {rounds.map((round, i) => {
          const isActive = round.round === activeRound
          const roundMsgCount = messages.filter(
            (m) => m.round === round.round && m.role === "user"
          ).length

          return (
            <div key={round.round} className="flex items-center gap-1">
              <button
                onClick={() => setActiveRound(round.round)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: isActive ? "var(--color-ink)" : "var(--color-surface)",
                  color: isActive ? "#fff" : "var(--color-slate)",
                  border: `1px solid ${isActive ? "var(--color-ink)" : "var(--color-border)"}`,
                  boxShadow: isActive ? "none" : undefined,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--color-canvas)"
                    ;(e.currentTarget as HTMLButtonElement).style.color = "var(--color-ink)"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-ink)"
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)"
                    ;(e.currentTarget as HTMLButtonElement).style.color = "var(--color-slate)"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)"
                  }
                }}
              >
                <span>Round {round.round}</span>
                <span
                  className="font-normal opacity-75"
                  style={{ fontSize: 10 }}
                >
                  {roundMsgCount}p
                </span>
              </button>

              {i < rounds.length - 1 && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{ color: "var(--color-silver)", flexShrink: 0 }}
                >
                  <path
                    d="M4 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          )
        })}
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
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "var(--color-ink-near)", paddingLeft: 28 }}
                    >
                      {msg.content}
                    </p>
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
