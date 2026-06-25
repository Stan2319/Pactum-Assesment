import type { AssessmentRound, WorkspaceType } from "@/lib/types"

export interface TemplateConfig {
  key: string
  label: string
  workspace: WorkspaceType
  language?: "python" | "javascript"
  title: string
  role: string
  description: string
  rounds: AssessmentRound[]
  tags: string[]
  starter_files?: Record<string, string>
}
