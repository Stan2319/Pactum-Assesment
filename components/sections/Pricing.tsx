"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check } from "lucide-react"
import { fadeInUp, stagger, scaleIn } from "@/lib/motion"

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  function handleCTA() {
    document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="pricing"
      style={{
        background: "var(--color-canvas)",
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
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              marginBottom: 12,
            }}
          >
            Simple, transparent pricing.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-slate)",
              lineHeight: 1.6,
              maxWidth: 420,
              margin: "0 auto",
            }}
          >
            Start free. Scale when you&apos;re ready.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {/* Starter */}
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 20,
              padding: "36px 32px",
              boxShadow: "var(--shadow-whisper)",
            }}
          >
            <p style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-silver)", marginBottom: 20 }}>
              Starter
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: "2.75rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--color-ink)", lineHeight: 1 }}>$99</span>
              <span style={{ fontSize: "0.9375rem", color: "var(--color-slate)", fontWeight: 400 }}>/month</span>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-slate)", lineHeight: 1.5, marginBottom: 24 }}>
              For teams hiring 1–5 roles per month
            </p>
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 9999,
                fontSize: "0.9375rem",
                fontWeight: 600,
                background: "transparent",
                color: "var(--color-ink)",
                border: "1.5px solid var(--color-border-input)",
                cursor: "pointer",
                marginBottom: 24,
              }}
            >
              Get started
            </motion.button>
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20 }}>
              {["Up to 5 active assessments", "All workspace types", "Unlimited candidates", "AI scoring & rubrics", "Email support"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Check size={14} style={{ color: "var(--color-slate)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", color: "var(--color-slate)" }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Professional */}
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{
              background: "var(--color-ink)",
              borderRadius: 20,
              padding: "36px 32px",
              position: "relative",
              boxShadow: "rgba(0,0,0,0.25) 0px 16px 40px",
            }}
          >
            <span style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 9999,
            }}>
              Most popular
            </span>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
              Professional
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: "2.75rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>$549</span>
              <span style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>/month</span>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 24 }}>
              For teams scaling hiring across departments
            </p>
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 9999,
                fontSize: "0.9375rem",
                fontWeight: 600,
                background: "#fff",
                color: "var(--color-ink)",
                border: "none",
                cursor: "pointer",
                marginBottom: 24,
              }}
            >
              Get started
            </motion.button>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
              {["Unlimited assessments", "All workspace types", "Unlimited candidates", "AI scoring & rubrics", "Custom rubric builder", "Priority support"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Check size={14} style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
