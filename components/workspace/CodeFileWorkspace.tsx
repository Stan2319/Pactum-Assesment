"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Check, X } from "lucide-react"
import type { DocPatchCode, DocumentStateCode } from "@/lib/types"

const CodeEditor = dynamic(
  () => import("./CodeEditor").then((m) => m.CodeEditor),
  { ssr: false, loading: () => <div style={{ background: "#0d0d0d", height: "100%" }} /> }
)

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  { ssr: false, loading: () => <div style={{ background: "#0d0d0d", height: "100%" }} /> }
)

function langFromPath(path: string): "python" | "javascript" {
  return path.endsWith(".py") ? "python" : "javascript"
}

function fileIcon(path: string): string {
  if (path.endsWith(".py")) return "🐍"
  if (path.endsWith(".js") || path.endsWith(".ts")) return "📜"
  if (path.endsWith(".json")) return "{ }"
  if (path.endsWith(".md")) return "📝"
  return "📄"
}

interface CodeFileWorkspaceProps {
  initialState: DocumentStateCode
  suggestedPatch: DocPatchCode | null
  pendingPatch: DocPatchCode | null
  onAcceptPatch: () => void
  onDismissPatch: () => void
  onPatchApplied: () => void
  onChange: (state: DocumentStateCode) => void
}

export function CodeFileWorkspace({
  initialState,
  suggestedPatch,
  pendingPatch,
  onAcceptPatch,
  onDismissPatch,
  onPatchApplied,
  onChange,
}: CodeFileWorkspaceProps) {
  // Migrate old single-file shape { code, language } → new multi-file shape
  const normalizeState = (s: DocumentStateCode): Record<string, string> => {
    if (s.files && typeof s.files === "object") return s.files
    const legacy = s as unknown as { code?: string; language?: string }
    const mainFile = (s.language ?? "python") === "python" ? "main.py" : "main.js"
    return { [mainFile]: legacy.code ?? "" }
  }

  const [files, setFiles] = useState<Record<string, string>>(() => normalizeState(initialState))
  const [activeFile, setActiveFile] = useState<string>(() => {
    const f = normalizeState(initialState)
    return initialState.activeFile || Object.keys(f)[0] || ""
  })

  // Apply confirmed patch
  useEffect(() => {
    if (!pendingPatch) return
    setFiles((prev) => {
      const next = { ...prev, [pendingPatch.path]: pendingPatch.content }
      onChange({ files: next, activeFile: pendingPatch.path, language: initialState.language })
      return next
    })
    setActiveFile(pendingPatch.path)
    onPatchApplied()
  }, [pendingPatch]) // eslint-disable-line react-hooks/exhaustive-deps

  // When a suggestion arrives, switch to the affected file
  useEffect(() => {
    if (suggestedPatch) setActiveFile(suggestedPatch.path)
  }, [suggestedPatch])

  function handleEditorChange(content: string) {
    setFiles((prev) => {
      const next = { ...prev, [activeFile]: content }
      onChange({ files: next, activeFile, language: initialState.language })
      return next
    })
  }

  function switchFile(path: string) {
    if (suggestedPatch) return // lock file switching during a diff review
    setActiveFile(path)
    onChange({ files, activeFile: path, language: initialState.language })
  }

  const sortedPaths = Object.keys(files).sort()
  const activeContent = files[activeFile] ?? ""
  const activeLang = langFromPath(activeFile)
  const diffLang = suggestedPatch ? langFromPath(suggestedPatch.path) : activeLang
  const isInDiff = !!suggestedPatch

  return (
    <div className="flex h-full" style={{ background: "#0d0d0d" }}>
      {/* File tree sidebar */}
      <div
        className="flex flex-col shrink-0"
        style={{ width: 180, background: "#111", borderRight: "1px solid #2a2a2a" }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 shrink-0"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <span style={{ color: "#666", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Files
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {sortedPaths.map((path) => {
            const isPatchTarget = suggestedPatch?.path === path
            return (
              <button
                key={path}
                onClick={() => switchFile(path)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
                style={{
                  background: activeFile === path ? "#1e1e1e" : "transparent",
                  borderLeft: isPatchTarget
                    ? "2px solid #22c55e"
                    : activeFile === path
                    ? "2px solid #4f8ef7"
                    : "2px solid transparent",
                  color: isPatchTarget ? "#86efac" : activeFile === path ? "#e8e8e8" : "#888",
                  fontSize: 12,
                  cursor: suggestedPatch && !isPatchTarget ? "not-allowed" : "pointer",
                  opacity: suggestedPatch && !isPatchTarget ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: 10 }}>{fileIcon(path)}</span>
                <span className="truncate">{path}</span>
                {isPatchTarget && (
                  <span style={{ marginLeft: "auto", fontSize: 9, color: "#22c55e", flexShrink: 0 }}>
                    ●
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div
          className="flex items-center justify-between overflow-x-auto shrink-0"
          style={{ background: "#1a1a1a", borderBottom: "1px solid #333", minHeight: 34 }}
        >
          <div className="flex items-center overflow-x-auto">
            {sortedPaths.map((path) => {
              const isActive = path === activeFile
              const isPatch = suggestedPatch?.path === path
              return (
                <button
                  key={path}
                  onClick={() => switchFile(path)}
                  className="flex items-center gap-1.5 px-3 shrink-0 border-r"
                  style={{
                    height: 34,
                    fontSize: 12,
                    borderColor: "#333",
                    borderBottom: isActive
                      ? `2px solid ${isPatch ? "#22c55e" : "#4f8ef7"}`
                      : "2px solid transparent",
                    background: isActive ? "#0d0d0d" : "transparent",
                    color: isPatch ? "#86efac" : isActive ? "#e8e8e8" : "#666",
                    cursor: suggestedPatch && !isPatch ? "not-allowed" : "pointer",
                  }}
                >
                  {path}
                  {isPatch && <span style={{ fontSize: 8, color: "#22c55e", marginLeft: 2 }}>●</span>}
                </button>
              )
            })}
          </div>

          {/* Accept / Reject buttons shown during diff */}
          {isInDiff && (
            <div className="flex items-center gap-1 px-2 shrink-0">
              <button
                onClick={onAcceptPatch}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold"
                style={{ background: "#166534", color: "#86efac", border: "1px solid #22c55e", cursor: "pointer" }}
              >
                <Check size={11} />
                Accept
              </button>
              <button
                onClick={onDismissPatch}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold"
                style={{ background: "#1a1a1a", color: "#888", border: "1px solid #444", cursor: "pointer" }}
              >
                <X size={11} />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Monaco editor or diff editor */}
        <div className="flex-1 overflow-hidden">
          {isInDiff ? (
            <DiffEditor
              height="100%"
              language={diffLang}
              original={files[suggestedPatch!.path] ?? ""}
              modified={suggestedPatch!.content}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                lineHeight: 1.6,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                wordWrap: "on",
                readOnly: true,
                renderSideBySide: false,
              }}
            />
          ) : activeFile ? (
            <CodeEditor
              key={activeFile}
              value={activeContent}
              language={activeLang}
              onChange={handleEditorChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: "#444", fontSize: 13 }}>No file selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
