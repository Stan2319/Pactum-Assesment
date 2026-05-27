"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

export function RegradeButton({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegrade() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, regrade: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Re-grade failed")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
      <button
        onClick={handleRegrade}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
        style={{ color: "var(--color-silver)" }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.color = "var(--color-ink)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-silver)")}
      >
        <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
        {loading ? "Re-grading…" : "Re-grade"}
      </button>
    </div>
  )
}
