"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { DocPatch, WorkspaceType } from "@/lib/types"

interface SuggestionOverlayProps {
  patch: DocPatch
  workspaceType: WorkspaceType
  onAccept: () => void
  onDismiss: () => void
}

function describePatch(patch: DocPatch, workspaceType: WorkspaceType): string {
  if (workspaceType === "spreadsheet" && "changes" in patch) {
    return `${patch.changes.length} cell${patch.changes.length !== 1 ? "s" : ""} to update`
  }
  if (workspaceType === "deck" && "slideIndex" in patch) {
    return `changes to slide ${patch.slideIndex + 1}`
  }
  if ("type" in patch && patch.type === "code_replace") {
    return "a code update"
  }
  if ("type" in patch && (patch.type === "replace" || patch.type === "append")) {
    return patch.type === "replace" ? "a full document replacement" : "content to append"
  }
  return "changes to your document"
}

export function SuggestionOverlay({ patch, workspaceType, onAccept, onDismiss }: SuggestionOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute bottom-6 right-6 z-20 rounded-2xl px-4 py-3.5 flex items-start gap-3"
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-cobalt)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        maxWidth: 320,
      }}
    >
      <span
        className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
        style={{ width: 24, height: 24, background: "#eff6ff", color: "var(--color-cobalt)" }}
      >
        <Sparkles size={12} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-ink)" }}>
          Claude suggested {describePatch(patch, workspaceType)}
        </p>
        <p className="text-xs mb-2.5" style={{ color: "var(--color-slate)" }}>
          Accept to apply it to your workspace, or dismiss to ignore.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onAccept}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "var(--color-ink)", color: "#fff", cursor: "pointer" }}
          >
            Accept
          </button>
          <button
            onClick={onDismiss}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "transparent", color: "var(--color-slate)", border: "1px solid var(--color-border)", cursor: "pointer" }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  )
}
