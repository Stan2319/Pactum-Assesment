"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { stagger, fadeInUp, scaleIn } from "@/lib/motion"
import { Building2, BrainCircuit, BarChart3 } from "lucide-react"

interface Step {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: "01",
    icon: <Building2 size={22} />,
    title: "Company creates a task",
    description:
      "Define a real piece of work: a data analysis, a marketing brief, a code review, a strategy memo. Not a brain teaser. Actual work.",
  },
  {
    number: "02",
    icon: <BrainCircuit size={22} />,
    title: "Candidate completes it using AI",
    description:
      "Inside a secure, sandboxed environment, the candidate uses ChatGPT, Claude, Copilot, whatever they prefer. Their workflow is recorded in full.",
  },
  {
    number: "03",
    icon: <BarChart3 size={22} />,
    title: "You see everything. Instantly.",
    description:
      "Every prompt, every refinement, every decision. Plus an automatic rubric score. You hire on judgment, not performance anxiety.",
  },
]

export const HowItWorks: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{
        padding: "120px 24px",
        background: "var(--color-canvas)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              marginBottom: 16,
            }}
          >
            How it works
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Three steps. Zero ambiguity.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={scaleIn}
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "36px 32px",
                position: "relative",
                boxShadow: "var(--shadow-whisper)",
                cursor: "default",
              }}
            >
              {/* Step number — large background */}
              <span
                style={{
                  position: "absolute",
                  top: 24,
                  right: 28,
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--color-border)",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {step.number}
              </span>

              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--color-canvas)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "var(--color-ink-near)",
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-ink-near)",
                  marginBottom: 10,
                  letterSpacing: "-0.02em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-slate)",
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </p>

              {/* Connector line between cards (not last) */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  style={{
                    display: "none", // shown via CSS on desktop
                  }}
                  className="step-connector"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
