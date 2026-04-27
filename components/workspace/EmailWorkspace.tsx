"use client"

import { useEffect, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { Bold, Italic, List, ListOrdered } from "lucide-react"
import { useTiptapEditor } from "@/lib/hooks/useTiptapEditor"
import type { DocumentStateEmail, DocPatchReportEmail } from "@/lib/types"

interface EmailWorkspaceProps {
  initialState: DocumentStateEmail | null
  pendingPatch: DocPatchReportEmail | null
  onPatchApplied: () => void
  onChange: (state: DocumentStateEmail) => void
}

const EMPTY_STATE: DocumentStateEmail = { to: "", from: "", subject: "", html: "" }

export function EmailWorkspace({ initialState, pendingPatch, onPatchApplied, onChange }: EmailWorkspaceProps) {
  const [fields, setFields] = useState<Omit<DocumentStateEmail, "html">>(
    initialState
      ? { to: initialState.to, from: initialState.from, subject: initialState.subject }
      : { to: "", from: "", subject: "" }
  )

  const editor = useTiptapEditor({
    initialHtml: initialState?.html ?? "",
    placeholder: "Write your email body here…",
    onChange: (html) => onChange({ ...fields, html }),
  })

  // Sync fields into onChange whenever they change
  useEffect(() => {
    if (!editor) return
    onChange({ ...fields, html: editor.getHTML() })
  }, [fields]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply patch to body only
  useEffect(() => {
    if (!pendingPatch || !editor) return
    if (pendingPatch.type === "replace") {
      editor.commands.setContent(pendingPatch.html)
    } else {
      editor.commands.insertContentAt(editor.state.doc.content.size, pendingPatch.html)
    }
    onChange({ ...fields, html: editor.getHTML() })
    onPatchApplied()
  }, [pendingPatch]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* Email header fields */}
      <div
        className="shrink-0 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {(["to", "from", "subject"] as const).map((key) => (
          <div key={key} className="flex items-center border-b px-5 py-2.5" style={{ borderColor: "var(--color-border)" }}>
            <span className="text-xs font-semibold w-14 shrink-0 capitalize" style={{ color: "var(--color-slate)" }}>
              {key}
            </span>
            <input
              type="text"
              value={fields[key]}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={key === "to" ? "recipient@company.com" : key === "from" ? "you@company.com" : "Subject line"}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--color-ink-near)" }}
            />
          </div>
        ))}

        {/* Body toolbar */}
        <div className="flex items-center gap-1 px-4 py-2">
          <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <Bold size={13} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <Italic size={13} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
            <List size={13} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
            <ListOrdered size={13} />
          </ToolbarBtn>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: "#ffffff" }}>
        <EditorContent editor={editor} className="prose-report h-full outline-none" />
      </div>
    </div>
  )
}

function ToolbarBtn({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded transition-colors"
      style={{ background: active ? "var(--color-canvas)" : "transparent", color: active ? "var(--color-ink)" : "var(--color-slate)", cursor: "pointer" }}
    >
      {children}
    </button>
  )
}
