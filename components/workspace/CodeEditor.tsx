"use client"

import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"

interface CodeEditorProps {
  value: string
  language: "python" | "javascript"
  onChange: (value: string) => void
}

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  function handleMount(editor: editor.IStandaloneCodeEditor) {
    editor.focus()
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={language === "python" ? "python" : "javascript"}
        value={value}
        theme="vs-dark"
        onChange={(val) => onChange(val ?? "")}
        onMount={handleMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          lineHeight: 1.6,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          tabSize: language === "python" ? 4 : 2,
          wordWrap: "on",
          renderWhitespace: "boundary",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
