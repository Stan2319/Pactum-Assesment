"use client"

import { motion } from "framer-motion"

export const Footer: React.FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: "var(--color-banner-dark)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "-0.04em",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Pactum
        </span>

        {/* Links */}
        <nav
          style={{ display: "flex", gap: 24, flexWrap: "wrap" }}
          aria-label="Footer navigation"
        >
          {[
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Contact", href: "mailto:hello@pactum.so" },
          ].map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ color: "rgba(255,255,255,0.9)" }}
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Copyright */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          &copy; {year} Pactum. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
