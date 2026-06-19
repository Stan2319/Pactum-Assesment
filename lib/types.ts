export interface Company {
  id: string
  name: string
  email: string
  created_at: string
}

export interface AssessmentRound {
  round: number
  title: string
  prompt: string
  success_criteria: string
  context?: string
}

// ── Workspace types ──────────────────────────────────────────────

export type WorkspaceType = "report" | "email" | "spreadsheet" | "deck" | "code"

export type DeckLayout = "title-only" | "title-body" | "title-bullets" | "two-column"

export interface DeckSlide {
  id: string
  layout: DeckLayout
  title: string
  body?: string
  bullets?: string[]
}

// Doc patches (AI-proposed edits per workspace type)
export interface DocPatchReportEmail {
  type: "replace" | "append"
  html: string
}

export interface DocPatchSpreadsheet {
  type: "cells"
  changes: { row: number; col: number; value: string }[]
}

export interface DocPatchDeck {
  type: "slide_update"
  slideIndex: number
  field: "title" | "body" | "bullets"
  value: string
}

export interface DocPatchCode {
  type: "code_replace"
  path: string
  content: string
}

export type DocPatch = DocPatchReportEmail | DocPatchSpreadsheet | DocPatchDeck | DocPatchCode

// Document state shapes (stored in sessions.document_state)
export interface DocumentStateReport {
  html: string
}

export interface DocumentStateEmail {
  to: string
  from: string
  subject: string
  html: string
}

export interface DocumentStateSpreadsheet {
  data: unknown
}

export interface DocumentStateDeck {
  slides: DeckSlide[]
}

export interface DocumentStateCode {
  files: Record<string, string>
  activeFile: string
  language: string
}

export type DocumentState =
  | DocumentStateReport
  | DocumentStateEmail
  | DocumentStateSpreadsheet
  | DocumentStateDeck
  | DocumentStateCode

// ── Core entities ────────────────────────────────────────────────

export interface Assessment {
  id: string
  company_id: string
  title: string
  role: string
  description: string
  rounds: AssessmentRound[]
  tension_level: "junior" | "senior"
  workspace_type: WorkspaceType
  language?: "python" | "javascript"
  starter_files?: Record<string, string>
  is_active: boolean
  notify_emails: string[]
  created_at: string
}

export interface Candidate {
  id: string
  company_id: string
  assessment_id: string
  name: string | null
  email: string | null
  invite_token: string
  created_at: string
}

export interface Session {
  id: string
  candidate_id: string
  assessment_id: string
  company_id: string
  started_at: string
  completed_at: string | null
  current_round: number
  status: "in_progress" | "completed" | "abandoned"
  document_state: DocumentState | null
  sandbox_id?: string | null
  share_token: string
}

export interface Message {
  id: string
  session_id: string
  round: number
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface Score {
  id: string
  session_id: string
  candidate_id: string
  assessment_id: string
  company_id: string
  total_score: number
  prompt_quality: number
  iteration_score: number
  output_quality: number
  critical_thinking: number
  efficiency: number
  summary: string
  strengths: string[]
  improvements: string[]
  red_flags: string[]
  created_at: string
}

export interface SessionWithDetails extends Session {
  candidates: Candidate
  assessments: Assessment
  messages: Message[]
  scores: Score[]
}
