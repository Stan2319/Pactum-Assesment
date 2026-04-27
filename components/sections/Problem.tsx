"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { stagger, fadeInUp, scaleIn } from "@/lib/motion"
import { X, Check } from "lucide-react"

interface Comparison {
  broken: string
  fixed: string
}

const comparisons: Comparison[] = [
  {
    broken: "Tests who can memorize a sorting algorithm at 11 pm",
    fixed: "Tests who can turn a vague brief into a polished deliverable",
  },
  {
    broken: "Filters out candidates who google things, like every real engineer",
    fixed: "Rewards candidates who know which AI tool to reach for",
  },
  {
    broken: "Takes 5 hours and burns candidates out before day one",
    fixed: "45-minute focused task. Signals respect from the start",
  },
  {
    broken: "Evaluator bias: whoever reviewed it last sets the bar",
    fixed: "Consistent rubric-based scoring across every submission",
  },
]

export const Problem: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      style={{
        padding: "120px 24px",
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              marginBottom: 16,
              textAlign: "center",
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
              textAlign: "center",
              maxWidth: 680,
              margin: "0 auto 16px",
            }}
          >
            LeetCode tests the wrong thing. Take-homes waste everyone&apos;s
            time.
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-slate)",
              textAlign: "center",
              maxWidth: 520,
              margin: "0 auto 72px",
              lineHeight: 1.6,
            }}
          >
            The hiring stack hasn&apos;t changed since 2010. The work has.
            AI-native teams need AI-native screening.
          </motion.p>

          {/* Comparison table */}
          <motion.div
            variants={stagger}
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {/* Column headers */}
            <motion.div
              variants={fadeInUp}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 12,
                padding: "0 8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-silver)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Old way
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-silver)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Pactum way
              </span>
            </motion.div>

            {comparisons.map((c, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  padding: "20px 8px",
                  borderTop:
                    i === 0
                      ? "1px solid var(--color-border)"
                      : "1px solid var(--color-border)",
                  borderBottom:
                    i === comparisons.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                {/* Broken */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fee2e2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <X size={12} color="#ef4444" strokeWidth={2.5} />
                  </span>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--color-slate)",
                      lineHeight: 1.55,
                    }}
                  >
                    {c.broken}
                  </p>
                </div>

                {/* Fixed */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Check size={12} color="#16a34a" strokeWidth={2.5} />
                  </span>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--color-ink-near)",
                      lineHeight: 1.55,
                      fontWeight: 500,
                    }}
                  >
                    {c.fixed}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
