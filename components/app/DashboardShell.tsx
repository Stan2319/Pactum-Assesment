"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useRef, useEffect } from "react"
import { LayoutDashboard, Plus, CreditCard, Trash2, LogOut, ChevronUp } from "lucide-react"

interface DashboardShellProps {
  companyName: string
  userEmail: string
  children: React.ReactNode
}

export function DashboardShell({ companyName, userEmail, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
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
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>
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

              <MenuAction icon={<CreditCard size={13} />} label="Billing" onClick={() => setAccountOpen(false)} />

              <div className="my-1 border-t" style={{ borderColor: "var(--color-border)" }} />

              <MenuAction icon={<LogOut size={13} />} label="Sign out" onClick={handleSignOut} />

              <div className="my-1 border-t" style={{ borderColor: "var(--color-border)" }} />

              <MenuAction icon={<Trash2 size={13} />} label="Delete account" onClick={() => setAccountOpen(false)} danger />
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
        <main className="max-w-5xl mx-auto px-8 py-10">
          {children}
        </main>
      </div>
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
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
      style={{
        color: danger
          ? hovered ? "#dc2626" : "#e57373"
          : hovered ? "var(--color-ink)" : "var(--color-slate)",
        background: hovered ? "var(--color-canvas)" : "transparent",
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  )
}
