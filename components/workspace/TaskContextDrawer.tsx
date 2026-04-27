"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { Assessment, AssessmentRound } from "@/lib/types"

interface TaskContextDrawerProps {
  assessment: Assessment
  currentRound: number
  round: AssessmentRound
  elapsedSeconds: number
  totalRounds: number
  isOpen: boolean
  onToggle: () => void
  hasNewRound: boolean
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export function TaskContextDrawer({
  assessment,
  currentRound,
  round,
  elapsedSeconds,
  totalRounds,
  isOpen,
  onToggle,
  hasNewRound,
}: TaskContextDrawerProps) {
  return (
    <div
      className="shrink-0 border-b"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Always-visible header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ cursor: "pointer" }}
      >
        {/* Round progress pills */}
        <div className="flex gap-1 shrink-0">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-5 rounded-full"
              style={{
                background: i < currentRound ? "var(--color-cobalt)" : "var(--color-border)",
                opacity: i === currentRound - 1 ? 1 : i < currentRound - 1 ? 0.45 : 1,
              }}
            />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: "var(--color-ink-near)" }}>
            Round {currentRound} of {totalRounds}: {round.title}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasNewRound && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-full animate-pulse"
              style={{ background: "#eff6ff", color: "var(--color-cobalt)", fontSize: 10 }}
            >
              New
            </span>
          )}
          <span className="text-xs font-mono" style={{ color: "var(--color-slate)" }}>
            {formatTime(elapsedSeconds)}
          </span>
          <ChevronDown
            size={13}
            style={{
              color: "var(--color-slate)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="drawer-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-slate)" }}>
                  Background
                </p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-ink-near)" }}>
                  {assessment.description}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#eff6ff" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-cobalt)" }}>
                  Your task
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-ink-near)" }}>
                  {round.prompt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
