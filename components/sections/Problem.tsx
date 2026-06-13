"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { X, Check } from "lucide-react"
import { fadeInUp, stagger, scaleIn } from "@/lib/motion"

const rows = [
  { old: "Tests memorization and endurance", new: "Tests real work output with AI tools" },
  { old: "You see the answer, nothing else", new: "You see every prompt, revision, and decision" },
  { old: "Manual review takes hours per candidate", new: "Every session scored automatically in seconds" },
  { old: "Top candidates skip long unpaid take-homes", new: "Async, focused tasks candidates actually respect" },
]

export function Problem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "120px 24px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 56 }}
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
            The problem
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              marginBottom: 16,
            }}
          >
            Your hiring process was designed before AI existed.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-slate)",
              lineHeight: 1.6,
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            LeetCode tests memory. Take-homes test endurance. Neither one tells you whether a candidate can do the job now that AI is part of every job.
          </motion.p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-silver)", margin: 0, paddingLeft: 8 }}>
              Old way
            </p>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-silver)", margin: 0, paddingLeft: 8 }}>
              Pactum way
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((row, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  padding: "14px 8px",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <X size={12} style={{ color: "#ef4444", strokeWidth: 2.5 }} />
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "var(--color-slate)", lineHeight: 1.55 }}>
                    {row.old}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#dcfce7",
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <Check size={12} style={{ color: "#16a34a", strokeWidth: 2.5 }} />
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "var(--color-ink-near)", lineHeight: 1.55, fontWeight: 500 }}>
                    {row.new}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
