"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { AssessmentRound, WorkspaceType } from "@/lib/types"

const MARKETING_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Go-to-market strategy",
    prompt:
      "Using the company and product description above, build a full go-to-market messaging strategy. Include: positioning statement, 3 key differentiators, target audience definition, and 3 campaign concepts with brief descriptions.",
    success_criteria:
      "A positioning statement, exactly 3 key differentiators, a defined target audience, and 3 distinct campaign concepts each with a brief description. All four elements must be present and specific to the company described.",
  },
  {
    round: 2,
    title: "Tone revision",
    prompt:
      "The client says the tone in your Round 1 output is too aggressive and feels like it's punching down on competitors. Revise the positioning and at least one campaign concept to fix this. Explain what you changed and why.",
    success_criteria:
      "A revised positioning statement with a noticeably different tone, at least one revised campaign concept, and a clear explanation of what specifically changed and the reasoning behind it. The explanation must be substantive, not just 'I made it friendlier.'",
  },
  {
    round: 3,
    title: "Legal revision",
    prompt:
      "One of your campaign concepts has been flagged by legal for making an unsubstantiated performance claim. Identify which one, fix it, and briefly explain your reasoning.",
    success_criteria:
      "Correct identification of the problematic campaign concept, a revised version that removes the unsubstantiated claim while keeping the concept compelling, and a brief explanation of why the original was a problem and what makes the fix compliant.",
  },
]

const FINANCE_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Executive summary",
    prompt:
      "Using the customer data and market context above, write an executive summary with the top 3 business insights and a strategic recommendation for the next quarter.",
    success_criteria:
      "An executive summary that contains exactly 3 numbered business insights drawn from the data (not generic observations), and one specific strategic recommendation for next quarter with a clear rationale tied to the data. Both must be grounded in the numbers provided.",
  },
  {
    round: 2,
    title: "Defend your recommendation",
    prompt:
      "The CEO is pushing back on your second recommendation, saying the data doesn't support it. Defend your position with specific evidence from the data, or revise it with a stronger alternative and new reasoning.",
    success_criteria:
      "Either a defense of the original recommendation that cites specific data points from the brief, or a revised recommendation that is meaningfully different and backed by stronger evidence. Vague restatements or minor rewording do not count; the reasoning must be substantively new or evidenced.",
  },
  {
    round: 3,
    title: "Board memo",
    prompt:
      "Translate the executive summary and final recommendation into a one-page board memo. It should be formal, scannable, and end with a clear ask.",
    success_criteria:
      "A memo that reads as a formal board document (not a chat message), is scannable with clear sections, incorporates the insights and recommendation from earlier rounds, and ends with a specific ask or decision point for the board. It should not exceed what a one-pager would contain.",
  },
]

const CS_EMAIL_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "De-escalation response",
    prompt:
      "Draft a response to Marcus's cancellation email. Address the cancellation request directly — don't dodge it. Acknowledge both outages with accountability, mention that the root causes have been fixed, and make a case for a conversation before finalizing the decision. Do not offer discounts or make promises you can't keep.",
    success_criteria:
      "Email must directly address the cancellation (not deflect), acknowledge both specific outages with accountability, reference the fixes, and request a call or conversation. No empty promises or pressuring language. 150–300 words.",
  },
  {
    round: 2,
    title: "Follow-up after a difficult call",
    prompt:
      "Marcus agreed to a call. On the call he said reliability was the breaking point, but hinted the real issue is that his team finds the product 'too complicated' and has already built internal workarounds. He will not renew at current price but did not hang up. Write a follow-up email that: summarizes what you heard, proposes one concrete next step (a scoped pilot, a product walkthrough, or a restructured contract), and asks a single focused question to keep the conversation moving.",
    success_criteria:
      "Email accurately reflects both issues Marcus raised (reliability and complexity/workarounds). Proposes exactly one specific actionable next step — not multiple vague options. Asks a single focused question. Professional tone without desperation.",
  },
  {
    round: 3,
    title: "Internal handoff note",
    prompt:
      "Write a brief internal note to your Head of Customer Success summarizing the situation: what happened, what you tried, where things stand, and what you recommend as the next move. This is not a customer-facing email — it's an internal summary.",
    success_criteria:
      "Internal memo format (not customer-facing language or tone). Covers: root issue, what was offered, current status of the account, and a clear recommendation with rationale. Scannable format acceptable. Under 200 words.",
  },
]

const CAMPAIGN_SPREADSHEET_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the core analysis",
    prompt:
      "Using the Q1 campaign data in the context above, build a performance analysis in the spreadsheet. Calculate CPL (cost per conversion) and ROAS (revenue ÷ spend) for each channel. Add a column for each metric, then rank the channels from most to least efficient by ROAS.",
    success_criteria:
      "Spreadsheet contains CPL and ROAS columns with arithmetically correct values for all 5 channels. Channels are ranked by ROAS. Reference values: Email ≈ 48.6x ROAS, Content/SEO ≈ 11.3x, Google ≈ 3.8x, LinkedIn ≈ 3.35x, Facebook ≈ 1.58x.",
  },
  {
    round: 2,
    title: "Investigate the anomaly",
    prompt:
      "LinkedIn and Facebook both target similar audiences but their performance is dramatically different. Identify the exact gap between them across all metrics. Then add a row showing the blended average CPL and ROAS across paid channels only (exclude Email and Content/SEO). What does this tell you?",
    success_criteria:
      "Correct side-by-side comparison of LinkedIn vs Facebook across all 6 metrics. Blended average row added with correct arithmetic for the 3 paid channels (Google, LinkedIn, Facebook). A substantive observation about what the gap implies — not just repeating numbers.",
  },
  {
    round: 3,
    title: "Q2 budget recommendation",
    prompt:
      "Propose a Q2 budget allocation across all 5 channels. Total budget: $43,400 (same as Q1). Add a new section with your allocation and reasoning. At least one channel must receive meaningfully less than Q1. At least one must receive meaningfully more. Defend each change with a specific data point from your analysis.",
    success_criteria:
      "Q2 allocations sum to exactly $43,400. At least one cut and one increase, each with a specific data-backed rationale. Facebook should logically be cut (1.58x ROAS). Email and Content/SEO should logically be maintained or increased. Reasoning references specific numbers from earlier analysis.",
  },
]

const PRODUCT_DECK_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the core pitch",
    prompt:
      "Build the core pitch deck for the AI Deal Score feature. Required slides: title, problem (why this matters now), solution (what the feature does), traction (the model accuracy data), and next steps. Keep each slide tight — one clear idea per slide, no text walls.",
    success_criteria:
      "Deck has at least 5 slides covering all required sections. Problem slide references the win rate decline (18%, down from 23%). Solution slide describes the feature without jargon. Traction slide prominently shows the 74% accuracy stat with context. Each slide has a single clear point.",
  },
  {
    round: 2,
    title: "Handle the CFO objection",
    prompt:
      "The CFO asks: 'If the model is 74% accurate, that means it's wrong 26% of the time. Why would sales reps trust it?' Add a slide (or revise an existing one) that directly addresses this objection and the broader question of rep adoption. Also add an ROI slide: if win rate improves from 18% to 20% and average deal size is $24,000, what is the revenue impact? Current open pipeline: 480 deals.",
    success_criteria:
      "Slide directly addresses the 74% objection without dismissing it — should acknowledge the limitation and reframe it (e.g. vs. gut feel baseline). ROI slide shows correct math: 480 × 2% = 9.6 additional wins × $24,000 = $230,400. Contextualizes why that justifies the build investment.",
  },
  {
    round: 3,
    title: "Write the close",
    prompt:
      "The exec team is generally supportive but hasn't committed. Add a closing slide that states the specific decision you're asking them to make today, sets a timeline (propose a 4-week discovery sprint), and names one key risk of inaction tied to the win rate data. This should feel like a close, not a summary.",
    success_criteria:
      "Closing slide states a specific ask (not vague 'support the initiative' — e.g. 'approve a 4-week discovery sprint with 2 engineering hours/week'). Includes a concrete timeline. Names one specific consequence of inaction tied to the win rate trend. Tone is confident and forward-looking.",
  },
]

const PYTHON_CODING_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt:
      "Before you write any code, write out your plan. What does the problem ask for? What is your high-level approach? What edge cases will you handle? What data structures or libraries will you use?",
    success_criteria:
      "A written plan that demonstrates understanding of the problem, a clear high-level approach, identification of at least two edge cases, and a note on the tools or libraries the candidate intends to use.",
  },
  {
    round: 2,
    title: "Implement the solution",
    prompt:
      "Using Claude Code in the terminal below, implement a Python function that reads a CSV file of sales transactions (columns: date, product_id, quantity, unit_price), calculates total revenue per product, and returns the top 5 products by revenue as a sorted list of (product_id, total_revenue) tuples. The function signature should be: get_top_products(filepath: str) -> list[tuple[str, float]]",
    success_criteria:
      "A working Python function that correctly reads the CSV, calculates revenue (quantity × unit_price), aggregates by product_id, and returns the top 5 sorted by revenue descending. Edge cases handled: missing values, zero quantities, duplicate product IDs.",
  },
  {
    round: 3,
    title: "Handle scale",
    prompt:
      "The CSV file could be 10GB. Refactor your solution to handle files that don't fit in memory. Explain your approach in Claude Code before implementing.",
    success_criteria:
      "Solution uses chunked reading (e.g. pandas chunksize or csv.reader with a running dict). The candidate explains the memory tradeoff before coding. Final solution produces the same correct output for large files without loading the entire file at once.",
  },
]

const JS_CODING_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt:
      "Before you write any code, write out your plan. What does the problem ask for? What is your high-level approach? What edge cases will you handle? What JavaScript patterns or libraries will you use?",
    success_criteria:
      "A written plan that demonstrates understanding of the problem, a clear high-level approach, identification of at least two edge cases, and a note on the JavaScript patterns or Node.js modules the candidate intends to use.",
  },
  {
    round: 2,
    title: "Implement the endpoint",
    prompt:
      "Using Claude Code in the terminal below, implement a Node.js Express endpoint: POST /api/notifications/send. It should accept a JSON body with { userId: string, message: string, channel: 'email' | 'sms' | 'push' }, validate the input, look up the user's preferences from an in-memory store (you define the shape), and return { success: boolean, queued: boolean, reason?: string }. Don't implement real sending — stub the delivery logic.",
    success_criteria:
      "A working Express endpoint that validates required fields and types, references a user preferences store, returns the correct response shape, and handles invalid input with appropriate status codes (400 for bad input, 404 for unknown user). Delivery logic is stubbed but clearly indicated.",
  },
  {
    round: 3,
    title: "Add rate limiting",
    prompt:
      "The endpoint is being abused — some users are sending hundreds of notifications per minute. Add per-user rate limiting: max 10 notifications per minute per userId. Explain your design to Claude Code before implementing. It should work in-process (no Redis) and handle the window correctly.",
    success_criteria:
      "Rate limiting implemented in-process using a sliding window or token bucket approach. The 429 response includes a retry-after value. The design explanation in the terminal demonstrates understanding of the tradeoff (in-process vs distributed). Window resets correctly after 60 seconds.",
  },
]

type TemplateKey = "marketing" | "finance" | "cs-email" | "campaign-spreadsheet" | "product-deck" | "python-coding" | "js-coding"

interface TemplateConfig {
  key: TemplateKey
  label: string
  workspace: WorkspaceType
  language?: "python" | "javascript"
  title: string
  role: string
  description: string
  rounds: AssessmentRound[]
}

const TEMPLATES: TemplateConfig[] = [
  {
    key: "marketing",
    label: "Marketing GTM",
    workspace: "report",
    title: "Marketing: Go-to-Market Strategy",
    role: "Marketing Manager",
    description:
      "You are a marketing candidate being assessed on your ability to build strategic messaging. The company you are working with is a B2B SaaS startup in the project management space. Their product: a Notion alternative built for engineering teams, with native GitHub integration and automated sprint planning. Target customers: engineering managers at companies with 20 to 200 engineers.",
    rounds: MARKETING_TEMPLATE,
  },
  {
    key: "finance",
    label: "Finance Analysis",
    workspace: "report",
    title: "Finance: Strategic Analysis",
    role: "Finance / Strategy Analyst",
    description:
      "You are a strategy analyst being assessed on your ability to interpret data and communicate insights clearly. Below is 6 months of customer data for a SaaS company:\n\n- Monthly churn rate: 3.2% (industry avg: 1.8%)\n- Top churn reasons (exit surveys): pricing (38%), missing features (31%), switching to competitor (21%), other (10%)\n- Net new MRR: +$42k/mo (growing)\n- ARPU: $180/mo (flat for 4 months)\n- Top growth channel: LinkedIn ads (42% of new signups)\n- Market context: two well-funded competitors launched in the last quarter",
    rounds: FINANCE_TEMPLATE,
  },
  {
    key: "cs-email",
    label: "Customer Success",
    workspace: "email",
    title: "Customer Success: Churn Recovery",
    role: "Customer Success Manager",
    description:
      "You are a Customer Success Manager at a B2B SaaS company (project management tool, mid-market segment, ~$18k ARR contract). You've just received this email from Marcus Webb, VP of Engineering at a customer account:\n\n---\n\nSubject: Cancellation request — contract ends May 31\n\nHi team,\n\nAfter much deliberation, we've decided not to renew. The product has been increasingly unreliable — we had two major outages this month that cost us several hours of downtime. Our team has largely stopped using the platform and migrated to our own internal tooling.\n\nI'd like to confirm the cancellation and ensure there's no auto-renewal on our account.\n\nMarcus Webb\nVP Engineering\n\n---\n\nYou've checked internally: the two outages were real (a database issue on April 3, and a CDN failure on April 17). The product team has since fixed both root causes. Your company does not auto-renew without a signed contract, so that concern is easy to address.",
    rounds: CS_EMAIL_TEMPLATE,
  },
  {
    key: "campaign-spreadsheet",
    label: "Campaign ROI",
    workspace: "spreadsheet",
    title: "Marketing: Campaign Performance Analysis",
    role: "Marketing Analyst",
    description:
      "You are a marketing analyst reviewing Q1 campaign performance. You have the following data:\n\nChannel | Spend | Impressions | Clicks | Conversions | Revenue\nGoogle Search | $12,400 | 180,000 | 4,200 | 310 | $47,500\nLinkedIn Ads | $18,600 | 95,000 | 1,800 | 190 | $62,300\nFacebook Ads | $6,200 | 320,000 | 2,100 | 85 | $9,800\nEmail (outbound) | $1,400 | — | 8,400 | 420 | $68,000\nContent/SEO | $4,800 | 210,000 | 12,600 | 380 | $54,200\n\nYour task is to analyze this data and provide recommendations for Q2 budget allocation. Total Q2 budget: $43,400 (same as Q1).",
    rounds: CAMPAIGN_SPREADSHEET_TEMPLATE,
  },
  {
    key: "product-deck",
    label: "Product Pitch Deck",
    workspace: "deck",
    title: "Product: Feature Launch Pitch",
    role: "Product Manager",
    description:
      "You are a PM at a B2B SaaS company (CRM platform, mid-market, ~$8M ARR). You've been asked to pitch the addition of an AI-powered deal scoring feature to an executive audience.\n\nThe proposed feature: AI Deal Score — a model that analyzes deal activity (email frequency, call logs, time in stage, stakeholder engagement) and gives each open deal a score from 1–100 with a confidence rating and key risk factors.\n\nWhy now: Sales reps currently use gut feel to prioritize deals. Win rate is 18% (down from 23% two years ago). The data science team has prototyped the model; it correctly predicted deal outcomes with 74% accuracy on 6 months of historical data.\n\nStakeholders in the room: VP Sales, CFO, Head of Engineering.\n\nKey objections you anticipate: Engineering will push back on the build effort. CFO will want to see an ROI case. VP Sales may worry this undermines rep autonomy.",
    rounds: PRODUCT_DECK_TEMPLATE,
  },
  {
    key: "python-coding",
    label: "Python Engineering",
    workspace: "code",
    language: "python",
    title: "Engineering: Python Data Pipeline",
    role: "Data Engineer / Backend Engineer",
    description:
      "You are a data engineering candidate being assessed on your ability to write clean, correct Python using Claude Code. You will work in a real Linux sandbox with Python and common data libraries (pandas, csv) available. Use Claude Code in the terminal to plan, implement, and iterate on your solution. Edit your code in the editor on the right.",
    rounds: PYTHON_CODING_TEMPLATE,
  },
  {
    key: "js-coding",
    label: "JavaScript Engineering",
    workspace: "code",
    language: "javascript",
    title: "Engineering: Node.js API Feature",
    role: "Backend Engineer / Full-Stack Engineer",
    description:
      "You are a backend engineering candidate being assessed on your ability to design and implement a Node.js API feature using Claude Code. You will work in a real Linux sandbox with Node.js and npm available. Use Claude Code in the terminal to plan, implement, and iterate. Edit your code in the editor on the right.",
    rounds: JS_CODING_TEMPLATE,
  },
]

interface AssessmentCreatorProps {
  companyId: string
}

export function AssessmentCreator({ companyId }: AssessmentCreatorProps) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [role, setRole] = useState("")
  const [description, setDescription] = useState("")
  const [tensionLevel, setTensionLevel] = useState<"junior" | "senior">("junior")
  const nextId = useRef(2)
  const [rounds, setRounds] = useState<(AssessmentRound & { _id: number })[]>([
    { _id: 1, round: 1, title: "", prompt: "", success_criteria: "" },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey | null>(null)
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>("report")
  const [language, setLanguage] = useState<"python" | "javascript">("python")

  function clearForm() {
    setTitle("")
    setRole("")
    setDescription("")
    setRounds([{ _id: nextId.current++, round: 1, title: "", prompt: "", success_criteria: "" }])
  }

  function loadTemplate(key: TemplateKey) {
    if (activeTemplate === key) {
      setActiveTemplate(null)
      clearForm()
      setWorkspaceType("report")
      setLanguage("python")
      return
    }
    const tpl = TEMPLATES.find((t) => t.key === key)
    if (!tpl) return
    setActiveTemplate(key)
    setTitle(tpl.title)
    setRole(tpl.role)
    setDescription(tpl.description)
    setWorkspaceType(tpl.workspace)
    if (tpl.language) setLanguage(tpl.language)
    setRounds(tpl.rounds.map((r) => ({ ...r, _id: nextId.current++ })))
  }

  function addRound() {
    const id = nextId.current++
    setRounds([...rounds, { _id: id, round: rounds.length + 1, title: "", prompt: "", success_criteria: "" }])
  }

  function removeRound(index: number) {
    const updated = rounds.filter((_, i) => i !== index).map((r, i) => ({ ...r, round: i + 1 }))
    setRounds(updated)
  }

  function updateRound(index: number, field: keyof AssessmentRound, value: string) {
    const updated = rounds.map((r, i) => i === index ? { ...r, [field]: value } : r)
    setRounds(updated)
  }

  async function handleSave() {
    if (!title || !role || !description || rounds.some((r) => !r.title || !r.prompt || !r.success_criteria)) {
      setError("Please fill in all fields.")
      return
    }

    setSaving(true)
    setError("")

    const { data, error: insertError } = await supabase
      .from("assessments")
      .insert({
        company_id: companyId,
        title,
        role,
        description,
        rounds: rounds.map(({ _id, ...r }) => r),
        workspace_type: workspaceType,
        ...(workspaceType === "code" ? { language } : {}),
        tension_level: tensionLevel,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/assessments/${data.id}/invite`)
  }

  return (
    <div className="space-y-8">
      {/* Templates */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink-near)" }}>
          Start from a template
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--color-slate)" }}>
          Selecting a template fills in all fields and sets the workspace type automatically.
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tpl) => (
            <TemplateButton
              key={tpl.key}
              label={tpl.label}
              workspace={tpl.workspace}
              selected={activeTemplate === tpl.key}
              onClick={() => loadTemplate(tpl.key)}
            />
          ))}
        </div>
      </div>

      <hr style={{ borderColor: "var(--color-border)" }} />

      {/* Basic info */}
      <div className="space-y-4">
        <Field label="Assessment title" hint="e.g. Marketing: Go-to-Market Strategy">
          <Input value={title} onChange={setTitle} placeholder="Marketing: Go-to-Market Strategy" />
        </Field>
        <Field label="Role being hired for" hint="Shown to the candidate">
          <Input value={role} onChange={setRole} placeholder="Marketing Manager" />
        </Field>
        <Field
          label="Task context / background"
          hint="Everything the candidate needs to know. Company, product, data, constraints."
        >
          <Textarea value={description} onChange={setDescription} rows={12} placeholder="Describe the scenario the candidate is stepping into…" />
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
            description="Code editor + Claude Code terminal. Best for engineering and data roles."
          />
        </div>

        {/* Language selector — shown only for code workspace */}
        {workspaceType === "code" && (
          <div className="mt-3">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--color-slate)" }}>Language</p>
            <div className="flex gap-2">
              {(["python", "javascript"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="text-sm px-4 py-1.5 rounded-full transition-all duration-150"
                  style={{
                    border: language === lang ? "1.5px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
                    background: language === lang ? "#eff6ff" : "var(--color-surface)",
                    color: language === lang ? "var(--color-cobalt)" : "var(--color-ink-near)",
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

      {/* AI Tension Slider */}
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
              Each round presents a new task. Candidates must complete one round to unlock the next.
            </p>
          </div>
          <button onClick={addRound} className="btn-pill-outline text-xs px-3 py-1.5 flex-shrink-0">
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
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-slate)" }}>
                  Round {round.round}
                </span>
                {rounds.length > 1 && (
                  <RemoveButton onClick={() => removeRound(i)} />
                )}
              </div>
              <Input
                value={round.title}
                onChange={(v) => updateRound(i, "title", v)}
                placeholder="Round title (e.g. Go-to-market strategy)"
              />
              <Textarea
                value={round.prompt}
                onChange={(v) => updateRound(i, "prompt", v)}
                rows={4}
                placeholder="The task prompt shown to the candidate for this round…"
              />
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--color-slate)" }}>
                  What does "done" look like? (not shown to candidate, used to guide Claude)
                </p>
                <Textarea
                  value={round.success_criteria}
                  onChange={(v) => updateRound(i, "success_criteria", v)}
                  rows={6}
                  placeholder="e.g. A positioning statement, 3 differentiators, a target audience definition, and 3 campaign concepts, all specific to the company described."
                />
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-pill-dark disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save and get invite link →"}
      </button>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink-near)" }}>
        {label}
      </label>
      {hint && <p className="text-xs mb-1.5" style={{ color: "var(--color-slate)" }}>{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={{
        border: "1px solid var(--color-border-input)",
        background: "var(--color-surface)",
        color: "var(--color-ink-near)",
      }}
      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  )
}

function Textarea({
  value, onChange, rows, placeholder,
}: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows ?? 3}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-y"
      style={{
        border: "1px solid var(--color-border-input)",
        background: "var(--color-surface)",
        color: "var(--color-ink-near)",
      }}
      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  )
}

function TensionOption({
  value, selected, onSelect, label, description,
}: {
  value: string; selected: boolean; onSelect: () => void; label: string; description: string
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 rounded-2xl transition-all"
      style={{
        border: selected ? "2px solid var(--color-cobalt)" : "2px solid var(--color-border)",
        background: selected ? "#eff6ff" : "var(--color-surface)",
      }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>{description}</p>
    </button>
  )
}

const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
  report: "Doc",
  email: "Email",
  spreadsheet: "Sheet",
  deck: "Deck",
  code: "Code",
}

function TemplateButton({
  label, workspace, selected, onClick,
}: {
  label: string
  workspace: WorkspaceType
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm px-3.5 py-2 rounded-full transition-all duration-150"
      style={{
        border: selected ? "1.5px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
        background: selected ? "#eff6ff" : "var(--color-surface)",
        color: selected ? "var(--color-cobalt)" : "var(--color-ink-near)",
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
      }}
    >
      {label}
      <span
        className="text-xs px-1.5 py-0.5 rounded-full"
        style={{
          background: selected ? "rgba(13,116,206,0.12)" : "var(--color-canvas)",
          color: selected ? "var(--color-cobalt)" : "var(--color-slate)",
          border: selected ? "none" : "1px solid var(--color-border)",
          fontWeight: 500,
        }}
      >
        {WORKSPACE_LABELS[workspace]}
      </span>
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
      style={{
        color: hovered ? "#dc2626" : "var(--color-slate)",
        cursor: "pointer",
      }}
    >
      Remove
    </button>
  )
}
