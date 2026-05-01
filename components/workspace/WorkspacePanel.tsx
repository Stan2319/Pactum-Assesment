"use client"

import { AnimatePresence } from "framer-motion"
import { ReportWorkspace } from "./ReportWorkspace"
import { EmailWorkspace } from "./EmailWorkspace"
import { SpreadsheetWorkspace } from "./SpreadsheetWorkspace"
import { DeckWorkspace } from "./DeckWorkspace"
import { CodeFileWorkspace } from "./CodeFileWorkspace"
import { SuggestionOverlay } from "./SuggestionOverlay"
import type {
  WorkspaceType,
  DocumentState,
  DocumentStateReport,
  DocumentStateEmail,
  DocumentStateSpreadsheet,
  DocumentStateDeck,
  DocumentStateCode,
  DocPatch,
  DocPatchReportEmail,
  DocPatchSpreadsheet,
  DocPatchDeck,
  DocPatchCode,
} from "@/lib/types"

interface WorkspacePanelProps {
  workspaceType: WorkspaceType
  documentState: DocumentState | null
  /** The patch waiting for user approval, drives the overlay */
  suggestedPatch: DocPatch | null
  /** The confirmed patch, passed to workspaces to apply */
  pendingPatch: DocPatch | null
  /** True while the patch API call is in flight */
  isGeneratingPatch: boolean
  onAcceptPatch: () => void
  onDismissPatch: () => void
  onPatchApplied: () => void
  onDocumentChange: (state: DocumentState) => void
}

export function WorkspacePanel({
  workspaceType,
  documentState,
  suggestedPatch,
  pendingPatch,
  isGeneratingPatch,
  onAcceptPatch,
  onDismissPatch,
  onPatchApplied,
  onDocumentChange,
}: WorkspacePanelProps) {
  const label: Record<WorkspaceType, string> = {
    report: "Document",
    email: "Email",
    spreadsheet: "Spreadsheet",
    deck: "Deck",
    code: "Code",
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{ background: "var(--color-canvas)", borderLeft: "1px solid var(--color-border)" }}
    >
      {/* Workspace header */}
      <div
        className="px-5 py-3 flex items-center justify-between shrink-0 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          {label[workspaceType]}
        </p>
        <div className="flex items-center gap-2">
          {isGeneratingPatch && (
            <span className="text-xs" style={{ color: "var(--color-slate)" }}>
              <span className="inline-flex gap-0.5">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
              </span>
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-canvas)",
              color: "var(--color-slate)",
              border: "1px solid var(--color-border)",
            }}
          >
            Editable
          </span>
        </div>
      </div>

      {/* Workspace content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Cobalt ring overlay when suggestion is pending (not for code, uses inline diff) */}
        {suggestedPatch && workspaceType !== "code" && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 2px var(--color-cobalt)", opacity: 0.4 }}
          />
        )}

        {workspaceType === "report" && (
          <ReportWorkspace
            initialHtml={(documentState as DocumentStateReport)?.html ?? ""}
            pendingPatch={pendingPatch as DocPatchReportEmail | null}
            onPatchApplied={onPatchApplied}
            onChange={(html) => onDocumentChange({ html })}
          />
        )}

        {workspaceType === "email" && (
          <EmailWorkspace
            initialState={documentState as DocumentStateEmail | null}
            pendingPatch={pendingPatch as DocPatchReportEmail | null}
            onPatchApplied={onPatchApplied}
            onChange={(state) => onDocumentChange(state)}
          />
        )}

        {workspaceType === "spreadsheet" && (
          <SpreadsheetWorkspace
            initialData={(documentState as DocumentStateSpreadsheet)?.data ?? null}
            pendingPatch={pendingPatch as DocPatchSpreadsheet | null}
            onPatchApplied={onPatchApplied}
            onChange={(data) => onDocumentChange({ data })}
          />
        )}

        {workspaceType === "deck" && (
          <DeckWorkspace
            initialSlides={(documentState as DocumentStateDeck)?.slides ?? null}
            pendingPatch={pendingPatch as DocPatchDeck | null}
            onPatchApplied={onPatchApplied}
            onChange={(slides) => onDocumentChange({ slides })}
          />
        )}

        {workspaceType === "code" && documentState != null && (
          <CodeFileWorkspace
            initialState={documentState as DocumentStateCode}
            suggestedPatch={suggestedPatch as DocPatchCode | null}
            pendingPatch={pendingPatch as DocPatchCode | null}
            onAcceptPatch={onAcceptPatch}
            onDismissPatch={onDismissPatch}
            onPatchApplied={onPatchApplied}
            onChange={(state) => onDocumentChange(state)}
          />
        )}

        {/* Suggestion overlay, shown when patch is waiting for approval (not for code) */}
        <AnimatePresence>
          {suggestedPatch && workspaceType !== "code" && (
            <SuggestionOverlay
              patch={suggestedPatch}
              workspaceType={workspaceType}
              onAccept={onAcceptPatch}
              onDismiss={onDismissPatch}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
