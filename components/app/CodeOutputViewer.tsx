"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface Props {
  files: Record<string, string>
  language?: string
}

function detectLanguage(filename: string, fallback?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    tsx: "tsx",
    jsx: "jsx",
    json: "json",
    sh: "bash",
    bash: "bash",
    css: "css",
    html: "html",
    md: "markdown",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
  }
  return map[ext ?? ""] ?? fallback ?? "text"
}

export function CodeOutputViewer({ files, language }: Props) {
  const entries = Object.entries(files)
  const [activeFile, setActiveFile] = useState(entries[0]?.[0] ?? "")

  const activeContent = files[activeFile] ?? ""
  const lang = detectLanguage(activeFile, language)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #3c3c3c", background: "#1e1e1e" }}
    >
      {/* Tab bar */}
      <div
        className="flex items-end overflow-x-auto overflow-y-hidden"
        style={{ background: "#252526", borderBottom: "1px solid #3c3c3c", minHeight: 36 }}
      >
        {entries.map(([filename]) => {
          const isActive = filename === activeFile
          return (
            <button
              key={filename}
              onClick={() => setActiveFile(filename)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono whitespace-nowrap transition-colors cursor-pointer"
              style={{
                background: isActive ? "#1e1e1e" : "transparent",
                color: isActive ? "#cdd6f4" : "#858585",
                borderTop: isActive ? "1px solid #007acc" : "1px solid transparent",
                borderRight: "1px solid #3c3c3c",
                borderBottom: isActive ? "1px solid #1e1e1e" : "none",
                marginBottom: isActive ? -1 : 0,
                flexShrink: 0,
              }}
            >
              {filename}
            </button>
          )
        })}
      </div>

      {/* Code panel */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        showLineNumbers
        lineNumberStyle={{
          color: "#495057",
          minWidth: "3em",
          paddingRight: "1.5em",
          userSelect: "none",
          fontSize: 12,
        }}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: 13,
          lineHeight: 1.7,
          padding: "20px 20px 20px 0",
          background: "#1e1e1e",
          maxHeight: 520,
          overflow: "auto",
        }}
        className="code-output-scroll"
      >
        {activeContent}
      </SyntaxHighlighter>
    </div>
  )
}
