"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { stagger, fadeInUp } from "@/lib/motion"

export const FinalCTA: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="final-cta"
      ref={ref}
      style={{
        padding: "120px 24px",
        background: "var(--color-banner-dark)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.p
          variants={fadeInUp}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 20,
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
            marginBottom: 20,
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
            marginBottom: 48,
            maxWidth: 440,
            margin: "0 auto 48px",
          }}
        >
          We&apos;re onboarding founding customers now. Spots are limited and
          pricing will increase at launch.
        </motion.p>

        {/* Tally embed — dark background */}
        <motion.div variants={fadeInUp}>
          <iframe
            data-tally-src="https://tally.so/embed/ODBEQg?alignLeft=0&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            loading="lazy"
            width="100%"
            height="160"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            title="Join the Pactum waitlist"
            style={{
              maxWidth: 480,
              display: "block",
              margin: "0 auto",
              filter: "invert(1) hue-rotate(180deg)",
            }}
          />
        </motion.div>

        <motion.p
          variants={fadeInUp}
          style={{
            marginTop: 24,
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          No spam. Unsubscribe anytime.
        </motion.p>
      </motion.div>
    </section>
  )
}
