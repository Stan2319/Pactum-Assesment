"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen } from "lucide-react"

interface FileEntry {
  name: string
  path: string
  type: "file" | "dir"
}

interface FileTreeProps {
  sandboxId: string
  rootPath?: string
  onFileOpen: (path: string, content: string) => void
}

const POLL_INTERVAL = 3000

const HIDDEN = new Set([".claude", ".config", ".npm", ".local", ".bashrc", ".profile", ".bash_logout", ".bash_history"])

function isVisible(name: string) {
  if (HIDDEN.has(name)) return false
  if (name.startsWith(".") && name !== "CLAUDE.md") return false
  return true
}

function extIcon(name: string) {
  return <FileCode size={12} style={{ color: "#888", flexShrink: 0 }} />
}

function TreeNode({
  entry,
  sandboxId,
  depth,
  onFileOpen,
}: {
  entry: FileEntry
  sandboxId: string
  depth: number
  onFileOpen: (path: string, content: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (entry.type === "dir") {
      if (!expanded) {
        setLoading(true)
        try {
          const res = await fetch(`/api/sandbox/${sandboxId}/files?path=${encodeURIComponent(entry.path)}`)
          const data = await res.json()
          setChildren((data.entries ?? []).filter((e: FileEntry) => isVisible(e.name)))
        } finally {
          setLoading(false)
        }
      }
      setExpanded((v) => !v)
    } else {
      const res = await fetch(`/api/sandbox/${sandboxId}/file?path=${encodeURIComponent(entry.path)}`)
      const data = await res.json()
      onFileOpen(entry.path, data.content ?? "")
    }
  }

  const paddingLeft = 8 + depth * 12

  return (
    <div>
      <button
        onClick={toggle}
        className="w-full flex items-center gap-1.5 text-left py-0.5 pr-2 rounded hover:bg-white/5 transition-colors"
        style={{ paddingLeft, fontSize: 12, color: "#ccc" }}
      >
        {entry.type === "dir" ? (
          <>
            <span style={{ color: "#888", flexShrink: 0, width: 12 }}>
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
            {expanded
              ? <FolderOpen size={12} style={{ color: "#febc2e", flexShrink: 0 }} />
              : <Folder size={12} style={{ color: "#febc2e", flexShrink: 0 }} />
            }
          </>
        ) : (
          <>
            <span style={{ width: 12, flexShrink: 0 }} />
            {extIcon(entry.name)}
          </>
        )}
        <span className="truncate">{entry.name}</span>
        {loading && <span style={{ color: "#555", marginLeft: "auto" }}>…</span>}
      </button>

      {entry.type === "dir" && expanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              sandboxId={sandboxId}
              depth={depth + 1}
              onFileOpen={onFileOpen}
            />
          ))}
          {children.length === 0 && !loading && (
            <p style={{ paddingLeft: paddingLeft + 24, fontSize: 11, color: "#555" }}>empty</p>
          )}
        </div>
      )}
    </div>
  )
}

export function FileTree({ sandboxId, rootPath = "/home/user", onFileOpen }: FileTreeProps) {
  const [entries, setEntries] = useState<FileEntry[]>([])

  const fetchRoot = useCallback(async () => {
    try {
      const res = await fetch(`/api/sandbox/${sandboxId}/files?path=${encodeURIComponent(rootPath)}`)
      const data = await res.json()
      setEntries((data.entries ?? []).filter((e: FileEntry) => isVisible(e.name)))
    } catch {
      // silently ignore poll errors
    }
  }, [sandboxId, rootPath])

  useEffect(() => {
    fetchRoot()
    const id = setInterval(fetchRoot, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchRoot])

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#111", borderRight: "1px solid #333" }}>
      <div
        className="px-3 py-2 shrink-0 flex items-center justify-between"
        style={{ borderBottom: "1px solid #2a2a2a" }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Files
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {entries.length === 0 ? (
          <p style={{ fontSize: 11, color: "#444", padding: "8px 8px" }}>No files yet</p>
        ) : (
          entries.map((entry) => (
            <TreeNode
              key={entry.path}
              entry={entry}
              sandboxId={sandboxId}
              depth={0}
              onFileOpen={onFileOpen}
            />
          ))
        )}
      </div>
    </div>
  )
}
