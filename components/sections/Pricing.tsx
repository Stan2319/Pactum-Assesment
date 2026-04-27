"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { stagger, fadeInUp, scaleIn } from "@/lib/motion"
import { Check } from "lucide-react"

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlight: boolean
  cta: string
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "For teams running a handful of hires a month.",
    features: [
      "Up to 10 assessments/month",
      "3 active job templates",
      "Full prompt-by-prompt replay",
      "Automatic rubric scoring",
      "Email support",
    ],
    highlight: false,
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$599",
    period: "/month",
    description: "For scaling teams with high-volume pipelines.",
    features: [
      "Unlimited assessments",
      "Unlimited job templates",
      "Custom rubrics & scoring weights",
      "ATS integrations (Greenhouse, Lever)",
      "Analytics dashboard",
      "Slack notifications",
      "Priority support",
    ],
    highlight: true,
    cta: "Get started",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large orgs with compliance, SSO, and custom workflows.",
    features: [
      "Everything in Pro",
      "SSO & SCIM provisioning",
      "Custom data retention policies",
      "Dedicated success manager",
      "SLA-backed uptime",
      "On-prem option available",
    ],
    highlight: false,
    cta: "Talk to us",
  },
]

export const Pricing: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const handleCTA = () => {
    document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="pricing"
      ref={ref}
      style={{
        padding: "120px 24px",
        background: "var(--color-canvas)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
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
              textAlign: "center",
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
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Straightforward pricing.
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-slate)",
              textAlign: "center",
              marginBottom: 64,
              lineHeight: 1.6,
            }}
          >
            No per-seat fees. No hidden assessment costs. Just clean, predictable billing.
          </motion.p>

          {/* Cards */}
          <motion.div
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                style={{
                  background: tier.highlight
                    ? "var(--color-ink)"
                    : "var(--color-surface)",
                  border: tier.highlight
                    ? "1px solid var(--color-ink)"
                    : "1px solid var(--color-border)",
                  borderRadius: 20,
                  padding: "36px 32px",
                  boxShadow: tier.highlight
                    ? "rgba(0,0,0,0.25) 0px 16px 40px"
                    : "var(--shadow-whisper)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {tier.highlight && (
                  <span
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 9999,
                    }}
                  >
                    Most popular
                  </span>
                )}

                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: tier.highlight ? "rgba(255,255,255,0.6)" : "var(--color-silver)",
                    marginBottom: 8,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {tier.name}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: "2.75rem",
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      color: tier.highlight ? "#fff" : "var(--color-ink)",
                      lineHeight: 1,
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        color: tier.highlight
                          ? "rgba(255,255,255,0.5)"
                          : "var(--color-slate)",
                        fontWeight: 400,
                      }}
                    >
                      {tier.period}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: tier.highlight ? "rgba(255,255,255,0.65)" : "var(--color-slate)",
                    marginBottom: 28,
                    lineHeight: 1.5,
                  }}
                >
                  {tier.description}
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
                    cursor: "pointer",
                    border: tier.highlight
                      ? "none"
                      : "1px solid var(--color-border-input)",
                    background: tier.highlight ? "#fff" : "transparent",
                    color: tier.highlight ? "var(--color-ink)" : "var(--color-ink-near)",
                    marginBottom: 28,
                  }}
                >
                  {tier.cta}
                </motion.button>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          color: tier.highlight ? "rgba(255,255,255,0.7)" : "var(--color-slate)",
                        }}
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: tier.highlight ? "rgba(255,255,255,0.8)" : "var(--color-slate)",
                          lineHeight: 1.5,
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
