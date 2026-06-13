"use client"

import { motion } from "framer-motion"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: "var(--color-banner-dark)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: "1rem",
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.04em",
          }}
        >
          Pactum
        </span>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Contact", href: "mailto:hello@pactum.so" },
          ].map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              whileHover={{ color: "rgba(255,255,255,0.9)" }}
              transition={{ duration: 0.15 }}
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.875rem",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {label}
            </motion.a>
          ))}
        </div>

        <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)" }}>
          © {year} Pactum. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
