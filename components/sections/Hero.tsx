"use client"

import { motion } from "framer-motion"
import { stagger, fadeInUp } from "@/lib/motion"

export const Hero: React.FC = () => {
  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle dot grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{
          maxWidth: 780,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} style={{ marginBottom: 32 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-input)",
              borderRadius: 9999,
              padding: "6px 14px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-slate)",
              boxShadow: "var(--shadow-whisper)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
            Now in private beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          style={{
            fontSize: "clamp(2.75rem, 7vw, 5.25rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "var(--color-ink)",
            marginBottom: 24,
          }}
        >
          Hire for AI fluency,{" "}
          <span
            style={{
              display: "inline-block",
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              padding: "0 12px",
              borderRadius: 10,
            }}
          >
            not memory.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={fadeInUp}
          style={{
            fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)",
            fontWeight: 400,
            lineHeight: 1.55,
            color: "var(--color-slate)",
            maxWidth: 560,
            margin: "0 auto 48px",
          }}
        >
          Pactum gives candidates a real work task and lets them use any AI tool
          to complete it, then hands you every prompt, every decision, and an
          automatic score. No more trivia. No more six-hour take-homes.
        </motion.p>

        {/* Tally embed */}
        <motion.div variants={fadeInUp} id="waitlist">
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
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var d = document, s = d.createElement('script');
                  s.src = 'https://tally.so/widgets/embed.js';
                  s.onload = function() { if (typeof Tally !== 'undefined') Tally.loadEmbeds(); };
                  s.onerror = function() {
                    d.querySelectorAll('[data-tally-src]').forEach(function(e) {
                      e.src = e.dataset.tallySrc;
                    });
                  };
                  d.body.appendChild(s);
                })();
              `,
            }}
          />
        </motion.div>

        {/* Social proof blurb */}
        <motion.p
          variants={fadeInUp}
          style={{
            marginTop: 24,
            fontSize: "0.8125rem",
            color: "var(--color-silver)",
            fontWeight: 400,
          }}
        >
          Trusted by early teams at Series A–C companies
        </motion.p>
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
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 1,
            height: 32,
            background:
              "linear-gradient(to bottom, var(--color-silver), transparent)",
            borderRadius: 1,
            margin: "0 auto",
          }}
        />
      </motion.div>
    </section>
  )
}
