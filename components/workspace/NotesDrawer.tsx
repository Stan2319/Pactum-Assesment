"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface NotesDrawerProps {
  notes: string
  isOpen: boolean
  onClose: () => void
}

export function NotesDrawer({ notes, isOpen, onClose }: NotesDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-20"
            style={{ background: "rgba(0,0,0,0.25)" }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute top-0 right-0 bottom-0 z-30 flex flex-col overflow-hidden"
            style={{
              width: 380,
              background: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                  Your planning notes
                </p>
                <p className="text-xs" style={{ color: "var(--color-slate)" }}>
                  Written before you started coding
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-lg w-7 h-7 transition-colors"
                style={{ color: "var(--color-slate)", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-canvas)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {notes ? (
                <pre
                  className="text-sm leading-relaxed whitespace-pre-wrap font-mono"
                  style={{ color: "var(--color-ink-near)" }}
                >
                  {notes}
                </pre>
              ) : (
                <p className="text-sm" style={{ color: "var(--color-silver)" }}>
                  No planning notes were saved.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
