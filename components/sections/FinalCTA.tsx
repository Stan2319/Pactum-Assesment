"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeInUp, stagger } from "@/lib/motion"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="final-cta"
      style={{
        background: "var(--color-banner-dark)",
        padding: "120px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <motion.div
        ref={ref}
        variants={stagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <motion.p
          variants={fadeInUp}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 16,
          }}
        >
          Early access
        </motion.p>

        <motion.h2
          variants={fadeInUp}
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.07,
            letterSpacing: "-0.04em",
            color: "#fff",
            marginBottom: 16,
          }}
        >
          Be first.
          <br />
          Hire better.
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          style={{
            fontSize: "1.0625rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            maxWidth: 440,
            margin: "0 auto 36px",
          }}
        >
          We&apos;re onboarding a small number of companies in our private beta. Spots are limited.
        </motion.p>

        <motion.div variants={fadeInUp} style={{ maxWidth: 480, margin: "0 auto" }}>
          <iframe
            data-tally-src="https://tally.so/embed/ODBEQg?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            loading="lazy"
            width="100%"
            height="160"
            style={{
              border: "none",
              display: "block",
              filter: "invert(1) hue-rotate(180deg)",
            }}
            title="Get early access"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
