"use client"

import { motion, useScroll } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import { PactumMark } from "@/components/PactumLogo"

export default function Nav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 20))
  }, [scrollY])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 60,
        display: "flex",
        alignItems: "center",
        background: scrolled ? "rgba(240,240,243,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      <div style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <PactumMark height={28} variant="dark" />
        </Link>

        <div className="hidden md:flex" style={{ gap: 32, alignItems: "center" }}>
          {["How it works", "Pricing"].map((label) => (
            <Link
              key={label}
              href={`#${label === "How it works" ? "how-it-works" : "pricing"}`}
              style={{
                color: "var(--color-slate)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-slate)")}
            >
              {label}
            </Link>
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
          <Link
            href="/login"
            className="btn-pill-dark"
            style={{ padding: "9px 22px", fontSize: "0.875rem" }}
          >
            Log in
          </Link>
        </motion.div>
      </div>
    </motion.nav>
  )
}
