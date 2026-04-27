"use client"

import { useEffect } from "react"
import { EditorContent } from "@tiptap/react"
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Table as TableIcon,
} from "lucide-react"
import { useTiptapEditor } from "@/lib/hooks/useTiptapEditor"
import type { DocPatchReportEmail } from "@/lib/types"

interface ReportWorkspaceProps {
  initialHtml: string
  pendingPatch: DocPatchReportEmail | null
  onPatchApplied: () => void
  onChange: (html: string) => void
}

export function ReportWorkspace({ initialHtml, pendingPatch, onPatchApplied, onChange }: ReportWorkspaceProps) {
  const editor = useTiptapEditor({ initialHtml, placeholder: "Start writing your report…", onChange })

  // Apply patch when one arrives
  useEffect(() => {
    if (!pendingPatch || !editor) return
    if (pendingPatch.type === "replace") {
      editor.commands.setContent(pendingPatch.html)
    } else {
      editor.commands.insertContentAt(editor.state.doc.content.size, pendingPatch.html)
    }
    onChange(editor.getHTML())
    onPatchApplied()
  }, [pendingPatch]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-4 py-2 border-b shrink-0"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarBtn>
        <div className="w-px h-4 mx-1" style={{ background: "var(--color-border)" }} />
        <ToolbarBtn
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarBtn>
        <div className="w-px h-4 mx-1" style={{ background: "var(--color-border)" }} />
        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered size={14} />
        </ToolbarBtn>
        <div className="w-px h-4 mx-1" style={{ background: "var(--color-border)" }} />
        <ToolbarBtn
          active={false}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="Insert table"
        >
          <TableIcon size={14} />
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <EditorContent
          editor={editor}
          className="prose-report h-full outline-none"
        />
      </div>
    </div>
  )
}

function ToolbarBtn({
  children, active, onClick, title,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded transition-colors"
      style={{
        background: active ? "var(--color-canvas)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-slate)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}
