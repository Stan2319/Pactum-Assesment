"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"

export function ShareButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const url = `${window.location.origin}/share/${shareToken}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
      style={{
        border: "1px solid var(--color-border)",
        background: copied ? "color-mix(in srgb, #22c55e 10%, var(--color-canvas))" : "var(--color-canvas)",
        color: copied ? "#22c55e" : "var(--color-slate)",
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={12} /> : <Link2 size={12} />}
      {copied ? "Copied!" : "Copy share link"}
    </button>
  )
}
