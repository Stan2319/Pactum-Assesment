"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { fadeInUp, stagger, scaleIn } from "@/lib/motion"

// ─── Animated counter ─────────────────────────────────────────────

function Counter({ target, suffix, prefix = "", decimals = 0 }: {
  target: number
  suffix: string
  prefix?: string
  decimals?: number
}) {
  const [count, setCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const started = useRef(false)
  const el = useRef<HTMLSpanElement>(null)
  const inView = useInView(el, { once: true, margin: "-60px" })

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const duration = 1400
    const steps = 60
    const stepMs = duration / steps
    let current = 0

    intervalRef.current = setInterval(() => {
      current++
      const progress = current / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target * Math.pow(10, decimals)) / Math.pow(10, decimals))
      if (current >= steps) {
        setCount(target)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, stepMs)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [inView, target, decimals])

  return (
    <span ref={el}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────

interface Stat {
  value: number
  suffix: string
  prefix?: string
  decimals?: number
  label: string
  description: string
  source: string
  journal: string
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <motion.div
      variants={scaleIn}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{
        fontSize: "clamp(2.75rem, 5vw, 3.75rem)",
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color: "var(--color-ink)",
      }}>
        <Counter
          target={stat.value}
          suffix={stat.suffix}
          prefix={stat.prefix ?? ""}
          decimals={stat.decimals ?? 0}
        />
      </div>

      <p style={{
        fontSize: "1rem",
        fontWeight: 600,
        color: "var(--color-ink-near)",
        margin: 0,
        lineHeight: 1.35,
      }}>
        {stat.label}
      </p>

      <p style={{
        fontSize: "0.875rem",
        color: "var(--color-slate)",
        lineHeight: 1.6,
        margin: 0,
        flexGrow: 1,
      }}>
        {stat.description}
      </p>

      <div style={{
        paddingTop: 10,
        borderTop: "1px solid var(--color-border)",
      }}>
        <p style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--color-ink-near)",
          margin: "0 0 2px",
        }}>
          {stat.journal}
        </p>
        <p style={{
          fontSize: "0.72rem",
          color: "var(--color-silver)",
          margin: 0,
          letterSpacing: "0.01em",
        }}>
          {stat.source}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────

const stats: Stat[] = [
  {
    value: 40,
    suffix: "%",
    label: "faster on writing tasks",
    description:
      "In a preregistered RCT with 453 college-educated professionals, ChatGPT access cut task completion time by 40% and raised output quality by 18%, graded by independent human evaluators.",
    journal: "Science, 2023",
    source: "Noy & Zhang, MIT Department of Economics",
  },
  {
    value: 40,
    suffix: "%",
    prefix: ">",
    label: "higher quality scores",
    description:
      "758 BCG consultants using GPT-4 completed work rated over 40% higher quality. Below-average performers improved 43%. Tasks outside AI's capability range saw a 19-point drop (the \"jagged frontier\").",
    journal: "Organization Science, 2026",
    source: "Dell'Acqua et al., Harvard Business School / BCG",
  },
  {
    value: 14,
    suffix: "%",
    label: "more issues resolved per hour",
    description:
      "Across 5,172 customer-support agents, AI access raised hourly productivity 14% on average, with a 34% gain for novice workers. Customer sentiment scores improved alongside throughput.",
    journal: "Quarterly Journal of Economics, 2025",
    source: "Brynjolfsson, Li & Raymond, Stanford / MIT",
  },
  {
    value: 56,
    suffix: "%",
    label: "wage premium for AI-skilled workers",
    description:
      "Analysis of over 1 billion job postings found AI-required roles command a 56% wage premium, up from 25% the prior year. AI-skilled jobs grew 7.5% even as total postings fell 11%.",
    journal: "Global AI Jobs Barometer, 2025",
    source: "PwC, analysis across 6 continents",
  },
]

// ─── Section ─────────────────────────────────────────────────────

export function ResearchStudy() {
  const headerRef = useRef(null)
  const isInView = useInView(headerRef, { once: true, margin: "-80px" })

  return (
    <section
      style={{
        background: "var(--color-canvas)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "120px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          ref={headerRef}
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              marginBottom: 12,
            }}
          >
            The research
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              maxWidth: 640,
              margin: "0 auto 20px",
            }}
          >
            AI does not replace workers. It makes skilled ones dramatically better.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-slate)",
              lineHeight: 1.6,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Independent randomized controlled trials confirm large, replicable gains in speed and quality. The catch: the gains go to workers who know how to use AI well.
          </motion.p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--color-silver)",
            margin: "56px auto 0",
            maxWidth: 500,
            lineHeight: 1.7,
          }}
        >
          Studies used GPT-3.5 through GPT-4 era models. Directional findings (that skilled AI use outperforms unskilled AI use) are consistent across model generations and independently replicated.
        </motion.p>

      </div>
    </section>
  )
}
