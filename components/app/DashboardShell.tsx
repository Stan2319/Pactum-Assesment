"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useRef, useEffect } from "react"
import { LayoutDashboard, Plus, CreditCard, Trash2, LogOut, ChevronUp, Moon, Sun } from "lucide-react"

interface DashboardShellProps {
  companyName: string
  userEmail: string
  children: React.ReactNode
}

export function DashboardShell({ companyName, userEmail, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [darkMode, setDarkMode] = useState<boolean>(false)

  useEffect(() => {
    setDarkMode(localStorage.getItem("dashboard-dark-mode") === "true")
  }, [])
  const popoverRef = useRef<HTMLDivElement>(null)

  function toggleDarkMode() {
    setDarkMode((v) => {
      const next = !v
      localStorage.setItem("dashboard-dark-mode", String(next))
      return next
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError("")
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { setDeleteError(data.error ?? "Something went wrong."); setDeleting(false); return }
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch {
      setDeleteError("Something went wrong.")
      setDeleting(false)
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    if (accountOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [accountOpen])

  const initial = userEmail.charAt(0).toUpperCase()

  return (
    <div data-dark={darkMode} suppressHydrationWarning className="min-h-screen" style={{ background: "var(--color-canvas)" }}>
      {/* Sidebar */}
      <div
        className="fixed inset-y-0 left-0 w-56 flex flex-col"
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2 mb-0.5">
            <Link href="/dashboard" className="text-base font-black tracking-tight" style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}>
              Pactum
            </Link>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: "var(--color-canvas)",
                color: "var(--color-slate)",
                border: "1px solid var(--color-border)",
                fontSize: 10,
                letterSpacing: "0.02em",
              }}
            >
              BETA
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--color-silver)" }}>
            {companyName}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLink
            href="/dashboard"
            active={pathname === "/dashboard"}
            label="Overview"
            icon={<LayoutDashboard size={14} />}
          />
          <NavLink
            href="/dashboard/assessments/new"
            active={pathname === "/dashboard/assessments/new"}
            label="New assessment"
            icon={<Plus size={14} />}
          />

        </nav>

        {/* Account button */}
        <div className="px-3 py-3 border-t relative" style={{ borderColor: "var(--color-border)" }} ref={popoverRef}>
          {/* Popover */}
          {accountOpen && (
            <div
              className="absolute left-3 right-3 bottom-full mb-2 rounded-xl py-1 overflow-hidden"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              }}
            >
              {/* Header */}
              <div className="px-3 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold text-white"
                    style={{ width: 28, height: 28, background: "var(--color-ink)" }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--color-ink-near)" }}>{companyName}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-silver)" }}>{userEmail}</p>
                  </div>
                </div>
              </div>

              <MenuAction icon={<CreditCard size={13} />} label="Billing · coming soon" onClick={() => setAccountOpen(false)} disabled />

              <div className="my-1 border-t" style={{ borderColor: "var(--color-border)" }} />

              {/* Dark mode toggle */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ cursor: "default" }}
              >
                <div className="flex items-center gap-2.5">
                  <span style={{ color: "var(--color-slate)" }}>
                    {darkMode ? <Moon size={13} /> : <Sun size={13} />}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-slate)" }}>Dark mode</span>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  role="switch"
                  aria-checked={darkMode}
                  className="relative shrink-0 rounded-full transition-colors duration-200"
                  style={{
                    width: 36,
                    height: 20,
                    background: darkMode ? "var(--color-cobalt)" : "var(--color-border-input)",
                    cursor: "pointer",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full bg-white transition-transform duration-200"
                    style={{
                      width: 16,
                      height: 16,
                      left: 2,
                      transform: darkMode ? "translateX(16px)" : "translateX(0px)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>

              <div className="my-1 border-t" style={{ borderColor: "var(--color-border)" }} />

              <MenuAction icon={<LogOut size={13} />} label="Sign out" onClick={handleSignOut} />

              <div className="my-1 border-t" style={{ borderColor: "var(--color-border)" }} />

              <MenuAction icon={<Trash2 size={13} />} label="Delete account" onClick={() => { setAccountOpen(false); setDeleteConfirm(true) }} danger />
            </div>
          )}

          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: accountOpen ? "var(--color-canvas)" : "transparent",
              cursor: "pointer",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold text-white"
              style={{ width: 26, height: 26, background: "var(--color-ink)" }}
            >
              {initial}
            </div>
            <span className="flex-1 text-left text-xs font-medium truncate" style={{ color: "var(--color-ink-near)" }}>
              Account
            </span>
            <ChevronUp
              size={13}
              style={{
                color: "var(--color-silver)",
                transform: accountOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.15s ease",
              }}
            />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-56">
        <main className="px-8 py-10">
          {children}
        </main>
      </div>

      {/* Delete account confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) { setDeleteConfirm(false); setDeleteError("") } }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
          >
            <h2 className="text-base font-bold mb-1" style={{ color: "var(--color-ink)" }}>Delete account</h2>
            <p className="text-sm mb-5" style={{ color: "var(--color-slate)" }}>
              This permanently deletes your company, all assessments, candidates, and results. This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteError("") }}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-canvas)", color: "var(--color-ink)", border: "1px solid var(--color-border)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#dc2626", color: "#fff", cursor: "pointer" }}
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavLink({
  href, active, label, icon,
}: {
  href: string
  active: boolean
  label: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{
        background: active ? "var(--color-canvas)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-slate)",
      }}
    >
      <span style={{ color: active ? "var(--color-ink)" : "var(--color-silver)" }}>
        {icon}
      </span>
      {label}
    </Link>
  )
}

function MenuAction({
  icon, label, onClick, danger, disabled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
      style={{
        color: disabled
          ? "var(--color-silver)"
          : danger
          ? hovered ? "#dc2626" : "#e57373"
          : hovered ? "var(--color-ink)" : "var(--color-slate)",
        background: hovered && !disabled ? "var(--color-canvas)" : "transparent",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  )
}
