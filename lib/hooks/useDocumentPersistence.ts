"use client"

import { useEffect, useRef } from "react"
import type { DocumentState } from "@/lib/types"

export function useDocumentPersistence(
  sessionId: string,
  documentState: DocumentState | null,
  debounceMs: number = 2000
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (documentState === null) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/doc-state", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, documentState }),
        })
      } catch (err) {
        console.error("Document persistence error:", err)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [sessionId, documentState, debounceMs])
}
