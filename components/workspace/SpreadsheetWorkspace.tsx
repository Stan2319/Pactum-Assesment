"use client"

import { useEffect, useState } from "react"
import { Workbook } from "@fortune-sheet/react"
import "@fortune-sheet/react/dist/index.css"
import type { DocPatchSpreadsheet } from "@/lib/types"

interface SpreadsheetWorkspaceProps {
  initialData: unknown | null
  pendingPatch: DocPatchSpreadsheet | null
  onPatchApplied: () => void
  onChange: (data: unknown) => void
}

function makeBlankSheet() {
  return [
    {
      name: "Sheet1",
      id: "sheet1",
      data: Array.from({ length: 30 }, () => Array.from({ length: 20 }, () => null)),
      row: 30,
      column: 20,
    },
  ]
}

export function SpreadsheetWorkspace({ initialData, pendingPatch, onPatchApplied, onChange }: SpreadsheetWorkspaceProps) {
  const [sheets, setSheets] = useState<unknown[]>(
    (initialData as unknown[]) ?? makeBlankSheet()
  )

  // Apply cell patch
  useEffect(() => {
    if (!pendingPatch) return

    setSheets((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as {
        data: ({ v?: string } | null)[][]
      }[]
      const sheet = next[0]
      if (!sheet?.data) return prev

      for (const { row, col, value } of pendingPatch.changes) {
        if (!sheet.data[row]) sheet.data[row] = []
        sheet.data[row][col] = { v: value }
      }
      return next
    })
    onPatchApplied()
  }, [pendingPatch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Propagate sheet changes up
  function handleChange(data: unknown) {
    setSheets(data as unknown[])
    onChange(data)
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Workbook
        data={sheets as Parameters<typeof Workbook>[0]["data"]}
        onChange={handleChange}
        showToolbar={true}
        showFormulaBar={true}
        showSheetTabs={false}
      />
    </div>
  )
}
