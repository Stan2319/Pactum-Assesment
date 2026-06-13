"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { fadeInUp, stagger } from "@/lib/motion"

// ─── Shared primitives ────────────────────────────────────────────

function ScoreBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      style={{ marginBottom: 10 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--color-slate)" }}>{label}</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "var(--color-border)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.08, duration: 0.55, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
    </motion.div>
  )
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
      style={{
        display: "inline-block", width: 2, height: "1em",
        background: "var(--color-ink)", marginLeft: 1, verticalAlign: "text-bottom",
      }}
    />
  )
}

function WidgetShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: "100%",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "var(--shadow-elevated)",
      fontFamily: "inherit",
    }}>
      {/* Chrome */}
      <div style={{
        background: "var(--color-canvas)",
        borderBottom: "1px solid var(--color-border)",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "var(--color-silver)", letterSpacing: "0.02em" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "18px" }}>
        {children}
      </div>
    </div>
  )
}

// ─── Widget 1: Assessment Builder ────────────────────────────────

const TASK_TYPES = ["Email task", "Written report", "Code review", "Slide deck"]
const BUILDER_PROMPT = "Write a follow-up to a VP of Engineering who expressed interest but went quiet after a product demo."
const CRITERIA = [
  "Tone matches the relationship stage",
  "No pressure tactics or urgency framing",
  "Clear next step with low friction",
]

const B_CHIPS   = 1400
const B_PROMPT  = 2600
const B_CRIT    = 1800
const B_HOLD    = 1400
const B_TOTAL   = B_CHIPS + B_PROMPT + B_CRIT + B_HOLD

function BuildWidget() {
  const [phase, setPhase]     = useState<"chips" | "prompt" | "criteria" | "hold">("chips")
  const [typedChars, setTypedChars] = useState(0)
  const [cycle, setCycle]     = useState(0)

  useEffect(() => {
    setPhase("chips")
    setTypedChars(0)
    const t1 = setTimeout(() => setPhase("prompt"),   B_CHIPS)
    const t2 = setTimeout(() => setPhase("criteria"), B_CHIPS + B_PROMPT)
    const t3 = setTimeout(() => setPhase("hold"),     B_CHIPS + B_PROMPT + B_CRIT)
    const t4 = setTimeout(() => setCycle(c => c + 1), B_TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [cycle])

  useEffect(() => {
    if (phase !== "prompt") return
    setTypedChars(0)
    const total = BUILDER_PROMPT.length
    const iv_ms = B_PROMPT / total
    let i = 0
    const iv = setInterval(() => { i++; setTypedChars(i); if (i >= total) clearInterval(iv) }, iv_ms)
    return () => clearInterval(iv)
  }, [phase])

  const showPrompt   = phase === "prompt" || phase === "criteria" || phase === "hold"
  const showCriteria = phase === "criteria" || phase === "hold"

  return (
    <WidgetShell title="Pactum - Builder">
      {/* Always-rendered layout — opacity only, no mount/unmount */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cobalt)", marginBottom: 10 }}>
          Round 1: Task type
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {TASK_TYPES.map((t, i) => (
            <span key={t} style={{
              fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: 99,
              border: "1px solid",
              borderColor: i === 0 ? "var(--color-cobalt)" : "var(--color-border)",
              background: i === 0 ? "rgba(13,116,206,0.08)" : "transparent",
              color: i === 0 ? "var(--color-cobalt)" : "var(--color-slate)",
              cursor: "default",
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Prompt — always in DOM, opacity animates */}
        <motion.div
          animate={{ opacity: showPrompt ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 12 }}
        >
          <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-slate)", marginBottom: 6 }}>
            Task prompt
          </div>
          <div style={{ background: "#fafafa", border: "1px solid var(--color-border-input)", borderRadius: 8, padding: "10px 12px", height: 72, overflow: "hidden" }}>
            <p style={{ fontSize: "0.79rem", lineHeight: 1.6, color: "var(--color-ink-near)", margin: 0, whiteSpace: "pre-wrap" }}>
              {BUILDER_PROMPT.slice(0, typedChars)}
              {phase === "prompt" && <Cursor />}
            </p>
          </div>
        </motion.div>

        {/* Criteria — always in DOM, opacity animates */}
        <motion.div animate={{ opacity: showCriteria ? 1 : 0 }} transition={{ duration: 0.3 }}>
          <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-slate)", marginBottom: 8 }}>
            Success criteria
          </div>
          {CRITERIA.map((c, i) => (
            <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: 1, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-ink-near)", lineHeight: 1.5 }}>{c}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </WidgetShell>
  )
}

// ─── Widget 2: Candidate workspace ───────────────────────────────

const CANDIDATE_PROMPT = "Review this SQL query for performance issues. The table has 40M rows and the query takes 12s."
const CANDIDATE_RESPONSE = "Main issue: the WHERE clause filters on a non-indexed column (created_at). Adding a composite index on (user_id, created_at) should cut this to under 500ms.\n\nAlso worth checking: the LIKE '%search%' on line 8 prevents index usage entirely."
const C_TYPING = 3000
const C_SCORES = 2200
const C_HOLD   = 1600
const C_TOTAL  = C_TYPING + C_SCORES + C_HOLD

function CandidateWidget() {
  const [phase, setPhase]           = useState<"typing" | "scores" | "hold">("typing")
  const [typedChars, setTypedChars] = useState(0)
  const [cycle, setCycle]           = useState(0)

  useEffect(() => {
    setPhase("typing")
    setTypedChars(0)
    const t1 = setTimeout(() => setPhase("scores"), C_TYPING)
    const t2 = setTimeout(() => setPhase("hold"),   C_TYPING + C_SCORES)
    const t3 = setTimeout(() => setCycle(c => c + 1), C_TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [cycle])

  useEffect(() => {
    if (phase !== "typing") return
    setTypedChars(0)
    const total = CANDIDATE_RESPONSE.length
    const iv_ms = C_TYPING / total
    let i = 0
    const iv = setInterval(() => { i++; setTypedChars(i); if (i >= total) clearInterval(iv) }, iv_ms)
    return () => clearInterval(iv)
  }, [phase])

  const showScores = phase === "scores" || phase === "hold"

  return (
    <WidgetShell title="Pactum - Candidate workspace">
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Task */}
        <div style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "11px 13px", marginBottom: 12 }}>
          <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cobalt)", marginBottom: 5 }}>
            Code review task
          </div>
          <p style={{ fontSize: "0.79rem", lineHeight: 1.5, color: "var(--color-ink-near)", margin: 0 }}>
            {CANDIDATE_PROMPT}
          </p>
        </div>

        {/* Response — fixed min-height so it never collapses during cycle reset */}
        <div style={{ background: "#fafafa", border: "1px solid var(--color-border-input)", borderRadius: 8, padding: "11px 13px", height: 120, overflow: "hidden", marginBottom: 12 }}>
          <p style={{ fontSize: "0.79rem", lineHeight: 1.65, color: "var(--color-ink-near)", margin: 0, whiteSpace: "pre-wrap" }}>
            {CANDIDATE_RESPONSE.slice(0, typedChars)}
            {phase === "typing" && <Cursor />}
          </p>
        </div>

        {/* Scores — always in DOM, opacity only */}
        <motion.div
          animate={{ opacity: showScores ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-slate)" }}>
              AI Analysis
            </span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 99 }}>
              Strong hire
            </span>
          </div>
          <ScoreBar label="Technical depth" value={92} color="#16a34a" delay={showScores ? 0.08 : 0} />
          <ScoreBar label="AI Fluency"      value={89} color="#0d74ce" delay={showScores ? 0.18 : 0} />
          <ScoreBar label="Clarity"         value={87} color="#7c3aed" delay={showScores ? 0.28 : 0} />
        </motion.div>
      </div>
    </WidgetShell>
  )
}

// ─── Widget 3: Results dashboard ─────────────────────────────────

const CANDIDATES = [
  {
    name: "Alex T.",
    role: "Senior PM",
    scores: [
      { label: "Communication", value: 94, color: "#16a34a" },
      { label: "AI Fluency",    value: 91, color: "#0d74ce" },
      { label: "Judgment",      value: 88, color: "#7c3aed" },
    ],
    verdict: "Strong hire",
    verdictStyle: { bg: "#dcfce7", text: "#15803d" },
  },
  {
    name: "Jamie S.",
    role: "PM",
    scores: [
      { label: "Communication", value: 78, color: "#ca8a04" },
      { label: "AI Fluency",    value: 72, color: "#0d74ce" },
      { label: "Judgment",      value: 80, color: "#7c3aed" },
    ],
    verdict: "Lean yes",
    verdictStyle: { bg: "#fef9c3", text: "#854d0e" },
  },
]

const R_ROWS  = 1200
const R_BARS  = 2400
const R_HOLD  = 2000
const R_TOTAL = R_ROWS + R_BARS + R_HOLD

function ResultsWidget() {
  const [phase, setPhase] = useState<"rows" | "bars" | "hold">("rows")
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    setPhase("rows")
    const t1 = setTimeout(() => setPhase("bars"), R_ROWS)
    const t2 = setTimeout(() => setPhase("hold"), R_ROWS + R_BARS)
    const t3 = setTimeout(() => setCycle(c => c + 1), R_TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [cycle])

  const showBars = phase === "bars" || phase === "hold"

  return (
    <WidgetShell title="Pactum - Results">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CANDIDATES.map((c, ci) => (
          <div
            key={c.name}
            style={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 14px" }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-ink)", display: "block" }}>{c.name}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--color-slate)" }}>{c.role}</span>
              </div>
              {/* Verdict — always in DOM, opacity only */}
              <motion.span
                animate={{ opacity: showBars ? 1 : 0 }}
                transition={{ delay: showBars ? ci * 0.15 + 0.3 : 0, duration: 0.3 }}
                style={{ fontSize: "0.68rem", fontWeight: 700, background: c.verdictStyle.bg, color: c.verdictStyle.text, padding: "2px 8px", borderRadius: 99 }}
              >
                {c.verdict}
              </motion.span>
            </div>

            {/* Score bars — always in DOM, opacity only */}
            <motion.div animate={{ opacity: showBars ? 1 : 0 }} transition={{ duration: 0.35 }}>
              {c.scores.map((s, i) => (
                <ScoreBar key={s.label} {...s} delay={showBars ? ci * 0.2 + i * 0.1 : 0} />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </WidgetShell>
  )
}

// ─── Step layout ─────────────────────────────────────────────────

interface StepProps {
  num: string
  title: string
  description: string
  detail: string
  widget: React.ReactNode
  reverse?: boolean
}

function Step({ num, title, description, detail, widget, reverse = false }: StepProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
        alignItems: "center",
        direction: reverse ? "rtl" : "ltr",
      }}
    >
      {/* Text */}
      <motion.div variants={fadeInUp} style={{ direction: "ltr" }}>
        <div style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-cobalt)",
          marginBottom: 12,
        }}>
          Step {num}
        </div>
        <h3 style={{
          fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          color: "var(--color-ink)",
          marginBottom: 16,
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: "1.0625rem",
          color: "var(--color-slate)",
          lineHeight: 1.65,
          marginBottom: 12,
        }}>
          {description}
        </p>
        <p style={{
          fontSize: "0.9375rem",
          color: "var(--color-silver)",
          lineHeight: 1.6,
          margin: 0,
        }}>
          {detail}
        </p>
      </motion.div>

      {/* Widget */}
      <motion.div variants={fadeInUp} style={{ direction: "ltr" }}>
        {widget}
      </motion.div>
    </motion.div>
  )
}

// ─── Section ─────────────────────────────────────────────────────

export function HowItWorks() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" })

  return (
    <section id="how-it-works" style={{ background: "var(--color-canvas)", padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Section header */}
        <motion.div
          ref={headerRef}
          variants={stagger}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 96 }}
        >
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--color-silver)", marginBottom: 12,
            }}
          >
            How it works
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em",
              color: "var(--color-ink)", margin: "0 auto", maxWidth: 560,
            }}
          >
            Three steps. Zero ambiguity.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
          <Step
            num="01"
            title="Set up in under 5 minutes"
            description="Pick task types that match the actual job: email, written analysis, code review, or slide deck. Add a prompt and tell Pactum what good looks like."
            detail="No test banks to license. No rubrics to write from scratch. Send your first assessment before your next meeting."
            widget={<BuildWidget />}
          />
          <Step
            num="02"
            title="See how candidates actually think"
            description="Candidates complete real tasks using built-in AI tools. Pactum captures every prompt, every revision, and every decision as they work."
            detail="You stop seeing only the polished final answer. You see the reasoning, the shortcuts, and the judgment calls behind it."
            widget={<CandidateWidget />}
            reverse
          />
          <Step
            num="03"
            title="Make faster, more confident calls"
            description="Every session is automatically scored on prompt quality, output quality, critical thinking, and AI fluency. Candidates are ranked and ready to act on."
            detail="Stop debating cover letters. Compare actual work output from people who used the same tools your team uses every day."
            widget={<ResultsWidget />}
          />
        </div>

      </div>
    </section>
  )
}
