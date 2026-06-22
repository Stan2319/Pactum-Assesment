"use client"

export default function ShareError() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-canvas)" }}
    >
      <div className="text-center max-w-sm">
        <p
          className="text-4xl font-black mb-3"
          style={{ color: "var(--color-ink)", letterSpacing: "-0.04em" }}
        >
          Link unavailable
        </p>
        <p className="text-sm" style={{ color: "var(--color-slate)" }}>
          This result may have been removed or the link is no longer valid.
        </p>
      </div>
    </div>
  )
}
