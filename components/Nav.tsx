"use client"

import { motion, useScroll } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"

export const Nav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    return scrollY.on("change", (y) => setScrolled(y > 20))
  }, [scrollY])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? "rgba(240,240,243,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--color-border)"
          : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "-0.04em",
            color: "var(--color-ink)",
            textDecoration: "none",
          }}
        >
          Pactum
        </a>

        {/* Nav links, desktop only */}
        <nav
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
          className="hidden md:flex"
        >
          {["How it works", "Pricing"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--color-slate)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  "var(--color-ink)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  "var(--color-slate)")
              }
            >
              {link}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link
            href="/login"
            className="btn-pill-dark"
            style={{ padding: "9px 22px", fontSize: "0.875rem", display: "inline-block", textDecoration: "none" }}
          >
            Log in
          </Link>
        </motion.div>
      </div>
    </motion.header>
  )
}
