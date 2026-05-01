"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function DeleteAssessmentButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="cursor-pointer text-xs font-semibold px-2 py-0.5 rounded-md transition-opacity disabled:opacity-50"
          style={{ background: "#fee2e2", color: "#991b1b" }}
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="cursor-pointer text-xs font-semibold"
          style={{ color: "var(--color-silver)" }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="cursor-pointer flex items-center gap-1 text-xs transition-colors"
      style={{ color: "var(--color-silver)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-silver)")}
    >
      <Trash2 size={12} />
      Delete
    </button>
  )
}
