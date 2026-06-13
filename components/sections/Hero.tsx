"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeInUp, stagger } from "@/lib/motion"
import { HeroDemoWidget } from "./HeroDemoWidget"

export function Hero() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "var(--color-canvas)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        overflow: "hidden",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <motion.div
        ref={ref}
        variants={stagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{
          textAlign: "center",
          maxWidth: 960,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} style={{ marginBottom: 28 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 9999,
            padding: "4px 12px",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-slate)",
            boxShadow: "var(--shadow-whisper)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Now in private beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            color: "var(--color-ink)",
            margin: "0 0 20px",
          }}
        >
          <span style={{ display: "block" }}>Hire for AI fluency,</span>
          <span style={{ display: "block", marginTop: "0.15em" }}>
            <span style={{
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              padding: "2px 10px",
              borderRadius: 6,
            }}>
              not memory.
            </span>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeInUp}
          style={{
            fontSize: "1.125rem",
            color: "var(--color-slate)",
            lineHeight: 1.6,
            maxWidth: 520,
            margin: "0 auto 28px",
          }}
        >
          Give candidates real work tasks. Let them use AI. Pactum records every prompt and decision, then scores the session automatically.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeInUp} style={{ marginBottom: 40 }}>
          <motion.a
            href="#final-cta"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              padding: "12px 32px",
              borderRadius: 9999,
              fontSize: "0.9375rem",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Join the waitlist
          </motion.a>
        </motion.div>

        {/* Product demo animation */}
        <motion.div variants={fadeInUp}>
          <p style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-silver)",
            marginBottom: 12,
          }}>
            Live candidate session
          </p>
          <HeroDemoWidget />
        </motion.div>

      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 1,
            height: 40,
            background: "linear-gradient(to bottom, var(--color-silver), transparent)",
          }}
        />
      </motion.div>
    </section>
  )
}
