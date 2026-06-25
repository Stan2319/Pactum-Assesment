"use client"

import { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, Code2, FileText,
  LayoutTemplate, PenLine, Check, Mail, Presentation, Table2,
} from "lucide-react"
import type { Assessment, AssessmentRound, WorkspaceType } from "@/lib/types"
import { TEMPLATES } from "@/lib/templates"
import type { TemplateConfig } from "@/lib/templates"

// ── Wizard ─────────────────────────────────────────────────────────

type WizardStep =
  | "start"
  | "type"
  | "search-coding"
  | "search-doc"
  | "search-email"
  | "search-deck"
  | "search-excel"

const STEP_INDEX: Record<WizardStep, number> = {
  start: 0,
  type: 1,
  "search-coding": 2,
  "search-doc": 2,
  "search-email": 2,
  "search-deck": 2,
  "search-excel": 2,
}

// Each search step maps to one workspace kind it filters templates by.
const SEARCH_WORKSPACE: Partial<Record<WizardStep, WorkspaceType>> = {
  "search-coding": "code",
  "search-doc": "report",
  "search-email": "email",
  "search-deck": "deck",
  "search-excel": "spreadsheet",
}

const SEARCH_STEPS = Object.keys(SEARCH_WORKSPACE) as WizardStep[]

const slideVariants = {
  enter: (d: number) => ({ x: d * 24, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (d: number) => ({
    x: d * -24,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
}

const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
  report: "Doc",
  email: "Email",
  spreadsheet: "Sheet",
  deck: "Deck",
  code: "Code",
}

// ── Main component ─────────────────────────────────────────────────

interface AssessmentCreatorProps {
  companyId: string
  initialData?: Assessment
  assessmentId?: string
}

export function AssessmentCreator({ companyId, initialData, assessmentId }: AssessmentCreatorProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!assessmentId && !!initialData

  // Form state — seeded from initialData when editing
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [role, setRole] = useState(initialData?.role ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [tensionLevel, setTensionLevel] = useState<"junior" | "senior">(initialData?.tension_level ?? "junior")
  const [notifyEmailsInput, setNotifyEmailsInput] = useState((initialData?.notify_emails ?? []).join(", "))
  const nextId = useRef(2)
  const [rounds, setRounds] = useState<(AssessmentRound & { _id: number })[]>(
    initialData
      ? initialData.rounds.map((r, i) => ({ ...r, _id: i + 1 }))
      : [{ _id: 1, round: 1, title: "", prompt: "", success_criteria: "" }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(initialData?.workspace_type ?? "report")
  const [language, setLanguage] = useState<"python" | "javascript">(initialData?.language ?? "python")
  const [starterFiles, setStarterFiles] = useState<Record<string, string> | undefined>(initialData?.starter_files)

  // Wizard state — skip wizard when editing
  const [wizardDone, setWizardDone] = useState(isEditing)
  const [wizardStep, setWizardStep] = useState<WizardStep>("start")
  const [wizardDir, setWizardDir] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [previewKey, setPreviewKey] = useState<string | null>(null)

  function goTo(step: WizardStep) {
    setWizardDir(STEP_INDEX[step] >= STEP_INDEX[wizardStep] ? 1 : -1)
    setWizardStep(step)
    setPreviewKey(null)
    setSearchQuery("")
  }

  function clearForm() {
    setTitle("")
    setRole("")
    setDescription("")
    setRounds([{ _id: nextId.current++, round: 1, title: "", prompt: "", success_criteria: "" }])
    setStarterFiles(undefined)
  }

  function loadTemplate(key: string) {
    const tpl = TEMPLATES.find(t => t.key === key)
    if (!tpl) return
    setActiveTemplate(key)
    setTitle(tpl.title)
    setRole(tpl.role)
    setDescription(tpl.description)
    setWorkspaceType(tpl.workspace)
    if (tpl.language) setLanguage(tpl.language)
    setStarterFiles(tpl.starter_files)
    setRounds(tpl.rounds.map(r => ({ ...r, _id: nextId.current++ })))
  }

  function finishWithTemplate(key: string) {
    loadTemplate(key)
    setWizardDone(true)
  }

  function finishScratch() {
    clearForm()
    setActiveTemplate(null)
    setWorkspaceType("report")
    setWizardDone(true)
  }

  function resetWizard() {
    setWizardDone(false)
    setWizardStep("start")
    setWizardDir(1)
    setPreviewKey(null)
    setSearchQuery("")
    clearForm()
    setActiveTemplate(null)
    setWorkspaceType("report")
    setLanguage("python")
  }

  const filteredTemplates = useMemo(() => {
    const ws = SEARCH_WORKSPACE[wizardStep]
    const pool = ws ? TEMPLATES.filter(t => t.workspace === ws) : []
    const q = searchQuery.toLowerCase().trim()
    if (!q) return pool
    return pool.filter(
      t =>
        t.label.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
    )
  }, [wizardStep, searchQuery])

  const previewTemplate = previewKey
    ? TEMPLATES.find(t => t.key === previewKey) ?? null
    : null

  function addRound() {
    const id = nextId.current++
    setRounds([...rounds, { _id: id, round: rounds.length + 1, title: "", prompt: "", success_criteria: "" }])
  }

  function removeRound(index: number) {
    const updated = rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, round: i + 1 }))
    setRounds(updated)
  }

  function updateRound(index: number, field: keyof AssessmentRound, value: string) {
    const updated = rounds.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    setRounds(updated)
  }

  async function handleSave() {
    if (
      !title ||
      !role ||
      !description ||
      rounds.some(r => !r.title || !r.prompt || !r.success_criteria)
    ) {
      setError("Please fill in all fields.")
      return
    }
    setSaving(true)
    setError("")

    const notifyEmails = notifyEmailsInput
      .split(",")
      .map(e => e.trim())
      .filter(e => e.includes("@"))

    const payload = {
      title,
      role,
      description,
      rounds: rounds.map(({ _id, ...r }) => r),
      workspace_type: workspaceType,
      ...(workspaceType === "code" ? { language } : {}),
      ...(starterFiles ? { starter_files: starterFiles } : {}),
      tension_level: tensionLevel,
      notify_emails: notifyEmails,
    }

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("assessments")
        .update(payload)
        .eq("id", assessmentId)
        .eq("company_id", companyId)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
    } else {
      const { data, error: insertError } = await supabase
        .from("assessments")
        .insert({ ...payload, company_id: companyId, is_active: true })
        .select()
        .single()
      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
      router.push(`/dashboard/assessments/${data.id}/invite`)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Wizard ── */}
      {!wizardDone ? (
        <div style={{ overflow: "hidden", padding: "6px", margin: "-6px" }}>
          <AnimatePresence custom={wizardDir} mode="wait" initial={false}>

            {/* Step 1: start */}
            {wizardStep === "start" && (
              <motion.div
                key="start"
                custom={wizardDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <p className="text-sm font-semibold mb-4 text-center" style={{ color: "var(--color-ink-near)" }}>
                  How would you like to start?
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <WizardCard
                    icon={<LayoutTemplate size={18} />}
                    title="Use a template"
                    description="Pick from a curated question or scenario built for real roles."
                    onClick={() => goTo("type")}
                  />
                  <WizardCard
                    icon={<PenLine size={18} />}
                    title="Start from scratch"
                    description="Build your own assessment, blank slate, full control."
                    onClick={finishScratch}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: type */}
            {wizardStep === "type" && (
              <motion.div
                key="type"
                custom={wizardDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <BackButton onClick={() => goTo("start")} />
                <p className="text-sm font-semibold mb-4 text-center" style={{ color: "var(--color-ink-near)" }}>
                  What type of assessment?
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <WizardCard
                    icon={<Code2 size={18} />}
                    title="Coding"
                    description="Test engineering skills with a live coding challenge."
                    onClick={() => goTo("search-coding")}
                  />
                  <WizardCard
                    icon={<FileText size={18} />}
                    title="Doc"
                    description="Briefs, memos, and reports, written communication skills."
                    onClick={() => goTo("search-doc")}
                  />
                  <WizardCard
                    icon={<Mail size={18} />}
                    title="Email"
                    description="Drafting and replying, customer and stakeholder comms."
                    onClick={() => goTo("search-email")}
                  />
                  <WizardCard
                    icon={<Presentation size={18} />}
                    title="Pitch deck"
                    description="Slide-based storytelling, pitches and exec presentations."
                    onClick={() => goTo("search-deck")}
                  />
                  <WizardCard
                    icon={<Table2 size={18} />}
                    title="Excel"
                    description="Spreadsheets and formulas, data and finance tasks."
                    onClick={() => goTo("search-excel")}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: search */}
            {SEARCH_STEPS.includes(wizardStep) && (
              <motion.div
                key={wizardStep}
                custom={wizardDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <BackButton onClick={() => goTo("type")} />
                <p className="text-sm font-semibold mb-4 text-center" style={{ color: "var(--color-ink-near)" }}>
                  {wizardStep === "search-coding" ? "Choose a coding question" : "Choose a template"}
                </p>

                {/* Search input */}
                <div className="relative mb-2">
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-slate)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, or tag…"
                    autoFocus
                    className="w-full text-sm outline-none rounded-xl"
                    style={{
                      paddingLeft: 32,
                      paddingRight: 14,
                      paddingTop: 10,
                      paddingBottom: 10,
                      border: "1px solid var(--color-border-input)",
                      background: "var(--color-surface)",
                      color: "var(--color-ink-near)",
                    }}
                    onFocus={e => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
                    onBlur={e => (e.target.style.boxShadow = "none")}
                  />
                </div>

                {/* Results list */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
                >
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((tpl, i) => (
                      <TemplateResultRow
                        key={tpl.key}
                        template={tpl}
                        selected={previewKey === tpl.key}
                        last={i === filteredTemplates.length - 1}
                        isCoding={wizardStep === "search-coding"}
                        onClick={() =>
                          setPreviewKey(previewKey === tpl.key ? null : tpl.key)
                        }
                        onUse={() => finishWithTemplate(tpl.key)}
                      />
                    ))
                  ) : (
                    <p
                      className="text-sm py-5 text-center"
                      style={{ color: "var(--color-slate)" }}
                    >
                      No templates match your search.
                    </p>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      ) : (
        /* Compact selected-template indicator */
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <Check size={13} style={{ color: "var(--color-cobalt)", flexShrink: 0 }} />
            {activeTemplate ? (
              <span className="text-sm" style={{ color: "var(--color-ink-near)" }}>
                Template:{" "}
                <strong>{TEMPLATES.find(t => t.key === activeTemplate)?.label}</strong>
                <span className="ml-1.5 text-xs" style={{ color: "var(--color-slate)" }}>
                  · {WORKSPACE_LABELS[workspaceType]}
                </span>
              </span>
            ) : (
              <span className="text-sm" style={{ color: "var(--color-ink-near)" }}>
                Starting from scratch
              </span>
            )}
          </div>
          <button
            onClick={resetWizard}
            className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
            style={{ color: "var(--color-slate)", cursor: "pointer" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--color-canvas)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            title="Go back"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      )}

      {/* ── Form, appears after wizard ── */}
      <AnimatePresence>
        {wizardDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }}
            className="space-y-8"
          >
            <hr style={{ borderColor: "var(--color-border)" }} />

            {/* Basic info */}
            <div className="space-y-4">
              <Field label="Assessment title" hint="e.g. Marketing: Go-to-Market Strategy">
                <Input
                  value={title}
                  onChange={setTitle}
                  placeholder="Marketing: Go-to-Market Strategy"
                />
              </Field>
              <Field label="Role being hired for" hint="Shown to the candidate">
                <Input value={role} onChange={setRole} placeholder="Marketing Manager" />
              </Field>
              <Field
                label="Task context / background"
                hint="Everything the candidate needs to know. Company, product, data, constraints."
              >
                <Textarea
                  value={description}
                  onChange={setDescription}
                  rows={12}
                  placeholder="Describe the scenario the candidate is stepping into…"
                />
              </Field>
            </div>

            {/* Workspace type */}
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink-near)" }}>
                Workspace type
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-slate)" }}>
                The editable workspace candidates work in alongside Claude.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <TensionOption
                  value="report"
                  selected={workspaceType === "report"}
                  onSelect={() => setWorkspaceType("report")}
                  label="Document"
                  description="Rich text editor. Best for written deliverables, memos, strategy docs."
                />
                <TensionOption
                  value="email"
                  selected={workspaceType === "email"}
                  onSelect={() => setWorkspaceType("email")}
                  label="Email"
                  description="Email composer with To, From, and Subject fields. Best for comms tasks."
                />
                <TensionOption
                  value="spreadsheet"
                  selected={workspaceType === "spreadsheet"}
                  onSelect={() => setWorkspaceType("spreadsheet")}
                  label="Spreadsheet"
                  description="Excel-like grid with formula support. Best for data and finance tasks."
                />
                <TensionOption
                  value="deck"
                  selected={workspaceType === "deck"}
                  onSelect={() => setWorkspaceType("deck")}
                  label="Deck"
                  description="Structured slide builder with layout templates. Best for presentations."
                />
                <TensionOption
                  value="code"
                  selected={workspaceType === "code"}
                  onSelect={() => setWorkspaceType("code")}
                  label="Code"
                  description="Code editor with AI assistance. Best for engineering and data roles."
                />
              </div>
              {workspaceType === "code" && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--color-slate)" }}>
                    Language
                  </p>
                  <div className="flex gap-2">
                    {(["python", "javascript"] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className="text-sm px-4 py-1.5 rounded-full transition-all duration-150"
                        style={{
                          border:
                            language === lang
                              ? "1.5px solid var(--color-cobalt)"
                              : "1.5px solid var(--color-border)",
                          background: language === lang ? "#eff6ff" : "var(--color-surface)",
                          color:
                            language === lang ? "var(--color-cobalt)" : "var(--color-ink-near)",
                          fontWeight: language === lang ? 600 : 400,
                          cursor: "pointer",
                        }}
                      >
                        {lang === "python" ? "Python" : "JavaScript"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Tension */}
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink-near)" }}>
                AI tension level
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-slate)" }}>
                Controls how the candidate-facing Claude behaves during the assessment.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <TensionOption
                  value="junior"
                  selected={tensionLevel === "junior"}
                  onSelect={() => setTensionLevel("junior")}
                  label="Junior mode"
                  description="Claude is educational and proactive. Offers hints, explains reasoning, guides step by step."
                />
                <TensionOption
                  value="senior"
                  selected={tensionLevel === "senior"}
                  onSelect={() => setTensionLevel("senior")}
                  label="Senior mode"
                  description="Claude is a dumb executor. Only does exactly what it's told. No hand-holding."
                />
              </div>
            </div>

            {/* Rounds */}
            <div>
              <div className="flex items-start justify-between gap-6 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-ink-near)" }}>
                    Assessment rounds
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-slate)" }}>
                    Each round presents a new task. Candidates must complete one round to unlock the
                    next.
                  </p>
                </div>
                <button
                  onClick={addRound}
                  className="btn-pill-outline text-xs px-3 py-1.5 flex-shrink-0"
                >
                  + Add round
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {rounds.map((round, i) => (
                    <motion.div
                      key={round._id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                        transition: { duration: 0.2, ease: "easeIn" },
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="rounded-2xl p-5 space-y-3"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--color-slate)" }}
                        >
                          Round {round.round}
                        </span>
                        {rounds.length > 1 && (
                          <RemoveButton onClick={() => removeRound(i)} />
                        )}
                      </div>
                      <Input
                        value={round.title}
                        onChange={v => updateRound(i, "title", v)}
                        placeholder="Round title (e.g. Go-to-market strategy)"
                      />
                      <Textarea
                        value={round.prompt}
                        onChange={v => updateRound(i, "prompt", v)}
                        rows={4}
                        placeholder="The task prompt shown to the candidate for this round…"
                      />
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--color-slate)" }}
                        >
                          What does "done" look like? (not shown to candidate, used to guide Claude)
                        </p>
                        <Textarea
                          value={round.success_criteria}
                          onChange={v => updateRound(i, "success_criteria", v)}
                          rows={6}
                          placeholder="e.g. A positioning statement, 3 differentiators, a target audience definition, and 3 campaign concepts…"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Notify emails */}
            <div
              className="rounded-2xl p-5 space-y-2"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-ink-near)" }}>
                  Notify when candidate finishes
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-slate)" }}>
                  Email addresses to notify with a results link once a candidate completes this assessment. Separate multiple with commas.
                </p>
              </div>
              <input
                type="text"
                value={notifyEmailsInput}
                onChange={e => setNotifyEmailsInput(e.target.value)}
                placeholder="recruiter@company.com, manager@company.com"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: "var(--color-canvas)",
                  border: "1px solid var(--color-border-input)",
                  color: "var(--color-ink-near)",
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-pill-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : isEditing ? "Save changes" : "Save and get invite link →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Wizard sub-components ──────────────────────────────────────────

function WizardCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="text-left p-5 rounded-2xl w-full"
      style={{
        background: "var(--color-surface)",
        border: hovered ? "1.5px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
        cursor: "pointer",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: "var(--color-canvas)", color: "var(--color-ink-near)" }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
        {title}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>
        {description}
      </p>
      <div className="flex justify-end mt-3">
        <ChevronRight size={14} style={{ color: "var(--color-slate)" }} />
      </div>
    </motion.button>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-1 text-xs mb-4 transition-colors"
      style={{ color: hovered ? "var(--color-ink-near)" : "var(--color-slate)", cursor: "pointer" }}
    >
      <ChevronLeft size={12} />
      Back
    </button>
  )
}


function TemplateResultRow({
  template,
  selected,
  last,
  isCoding,
  onClick,
  onUse,
}: {
  template: TemplateConfig
  selected: boolean
  last: boolean
  isCoding: boolean
  onClick: () => void
  onUse: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ borderBottom: last && !selected ? "none" : selected ? "none" : "1px solid var(--color-border)" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
        style={{
          background: selected ? "color-mix(in srgb, var(--color-cobalt) 8%, var(--color-surface))" : hovered ? "var(--color-canvas)" : "transparent",
          cursor: "pointer",
          borderBottom: selected ? "1px solid color-mix(in srgb, var(--color-cobalt) 20%, var(--color-border))" : "none",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink-near)" }}>
              {template.label}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: template.workspace === "code" ? "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-canvas))" : "var(--color-canvas)",
                color: template.workspace === "code" ? "var(--color-cobalt)" : "var(--color-slate)",
                border: template.workspace === "code" ? "none" : "1px solid var(--color-border)",
              }}
            >
              {WORKSPACE_LABELS[template.workspace]}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {template.tags.slice(0, 5).map(tag => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: selected ? "color-mix(in srgb, var(--color-cobalt) 15%, var(--color-canvas))" : "var(--color-canvas)", color: "var(--color-slate)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          animate={{ rotate: selected ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={14} style={{ color: selected ? "var(--color-cobalt)" : "var(--color-slate)" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
            style={{ overflow: "hidden", borderBottom: last ? "none" : "1px solid var(--color-border)" }}
          >
            <div className="px-4 pb-4 pt-3" style={{ background: "color-mix(in srgb, var(--color-cobalt) 5%, var(--color-surface))" }}>
              {/* Description */}
              <p
                className="text-xs leading-relaxed mb-3"
                style={{
                  color: "var(--color-slate)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {template.description}
              </p>

              {/* Rounds */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-slate)" }}>
                  {isCoding ? "Steps" : "Rounds"}
                </p>
                <div className="space-y-1.5">
                  {template.rounds.map(r => (
                    <div key={r.round} className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{
                          background: "color-mix(in srgb, var(--color-cobalt) 15%, var(--color-canvas))",
                          color: "var(--color-cobalt)",
                          border: "1px solid color-mix(in srgb, var(--color-cobalt) 30%, var(--color-border))",
                        }}
                      >
                        {r.round}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-ink-near)" }}>
                        {r.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button onClick={onUse} className="btn-pill-dark text-sm w-full py-2.5">
                Use this template →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TemplatePreviewPanel({
  template,
  isCoding,
  onUse,
}: {
  template: TemplateConfig
  isCoding: boolean
  onUse: () => void
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            {template.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-slate)" }}>
            {template.role}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {template.language && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-canvas))", color: "var(--color-cobalt)" }}
            >
              {template.language === "python" ? "Python" : "JavaScript"}
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-canvas)",
              color: "var(--color-slate)",
              border: "1px solid var(--color-border)",
            }}
          >
            {WORKSPACE_LABELS[template.workspace]}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-canvas)",
              color: "var(--color-slate)",
              border: "1px solid var(--color-border)",
            }}
          >
            {template.rounds.length} rounds
          </span>
        </div>
      </div>

      {/* Description excerpt */}
      <p
        className="text-xs leading-relaxed mb-4"
        style={{
          color: "var(--color-slate)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {template.description}
      </p>

      {/* Rounds */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--color-slate)" }}
        >
          {isCoding ? "Steps" : "Rounds"}
        </p>
        <div className="space-y-2">
          {template.rounds.map(r => (
            <div key={r.round} className="flex items-center gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{
                  background: "var(--color-canvas)",
                  color: "var(--color-slate)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {r.round}
              </span>
              <span className="text-xs" style={{ color: "var(--color-ink-near)" }}>
                {r.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={onUse} className="btn-pill-dark text-sm w-full py-2.5">
        Use this template →
      </button>
    </div>
  )
}

// ── Form sub-components ────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink-near)" }}>
        {label}
      </label>
      {hint && (
        <p className="text-xs mb-1.5" style={{ color: "var(--color-slate)" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={{
        border: "1px solid var(--color-border-input)",
        background: "var(--color-surface)",
        color: "var(--color-ink-near)",
      }}
      onFocus={e => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={e => (e.target.style.boxShadow = "none")}
    />
  )
}

function Textarea({
  value,
  onChange,
  rows,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows ?? 3}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-y"
      style={{
        border: "1px solid var(--color-border-input)",
        background: "var(--color-surface)",
        color: "var(--color-ink-near)",
      }}
      onFocus={e => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={e => (e.target.style.boxShadow = "none")}
    />
  )
}

function TensionOption({
  value,
  selected,
  onSelect,
  label,
  description,
}: {
  value: string
  selected: boolean
  onSelect: () => void
  label: string
  description: string
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 rounded-2xl transition-all"
      style={{
        border: selected ? "2px solid var(--color-cobalt)" : "2px solid var(--color-border)",
        background: selected ? "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-surface))" : "var(--color-surface)",
      }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
        {label}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>
        {description}
      </p>
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-xs transition-colors duration-150"
      style={{ color: hovered ? "#dc2626" : "var(--color-slate)", cursor: "pointer" }}
    >
      Remove
    </button>
  )
}
