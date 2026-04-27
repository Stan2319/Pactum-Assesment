"use client"

import { useEffect, useState } from "react"
import { ChevronUp, ChevronDown, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { DeckSlide, DeckLayout, DocPatchDeck } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface DeckWorkspaceProps {
  initialSlides: DeckSlide[] | null
  pendingPatch: DocPatchDeck | null
  onPatchApplied: () => void
  onChange: (slides: DeckSlide[]) => void
}

function blankSlide(layout: DeckLayout = "title-body"): DeckSlide {
  return { id: uuidv4(), layout, title: "", body: "", bullets: [""] }
}

const LAYOUTS: { value: DeckLayout; label: string; icon: React.ReactNode }[] = [
  {
    value: "title-only",
    label: "Title only",
    icon: (
      <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
        <rect x="2" y="10" width="32" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    value: "title-body",
    label: "Title + body",
    icon: (
      <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
        <rect x="2" y="4" width="32" height="5" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="2" y="12" width="32" height="3" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="2" y="17" width="24" height="3" rx="1" fill="currentColor" opacity="0.25" />
      </svg>
    ),
  },
  {
    value: "title-bullets",
    label: "Title + bullets",
    icon: (
      <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
        <rect x="2" y="4" width="32" height="5" rx="1.5" fill="currentColor" opacity="0.5" />
        <circle cx="5" cy="15" r="1.5" fill="currentColor" opacity="0.35" />
        <rect x="9" y="13.5" width="22" height="3" rx="1" fill="currentColor" opacity="0.25" />
        <circle cx="5" cy="21" r="1.5" fill="currentColor" opacity="0.35" />
        <rect x="9" y="19.5" width="18" height="3" rx="1" fill="currentColor" opacity="0.25" />
      </svg>
    ),
  },
  {
    value: "two-column",
    label: "Two column",
    icon: (
      <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
        <rect x="2" y="4" width="32" height="4" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="2" y="11" width="15" height="3" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="2" y="16" width="12" height="3" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="20" y="11" width="14" height="3" rx="1" fill="currentColor" opacity="0.25" />
        <rect x="20" y="16" width="10" height="3" rx="1" fill="currentColor" opacity="0.25" />
      </svg>
    ),
  },
]

export function DeckWorkspace({ initialSlides, pendingPatch, onPatchApplied, onChange }: DeckWorkspaceProps) {
  const [slides, setSlides] = useState<DeckSlide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : [blankSlide("title-body")]
  )
  const [activeIndex, setActiveIndex] = useState(0)

  function update(updated: DeckSlide[]) {
    setSlides(updated)
    onChange(updated)
  }

  // Apply patch
  useEffect(() => {
    if (!pendingPatch) return
    const { slideIndex, field, value } = pendingPatch
    setSlides((prev) => {
      const next = prev.map((s, i) => {
        if (i !== slideIndex) return s
        if (field === "bullets") {
          try {
            return { ...s, bullets: JSON.parse(value) as string[] }
          } catch {
            return { ...s, bullets: [value] }
          }
        }
        return { ...s, [field]: value }
      })
      onChange(next)
      return next
    })
    setActiveIndex(slideIndex)
    onPatchApplied()
  }, [pendingPatch]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateSlide(index: number, changes: Partial<DeckSlide>) {
    update(slides.map((s, i) => (i === index ? { ...s, ...changes } : s)))
  }

  function addSlide() {
    const next = [...slides, blankSlide()]
    update(next)
    setActiveIndex(next.length - 1)
  }

  function removeSlide(index: number) {
    if (slides.length === 1) return
    const next = slides.filter((_, i) => i !== index)
    update(next)
    setActiveIndex(Math.min(index, next.length - 1))
  }

  function moveSlide(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= slides.length) return
    const next = [...slides]
    ;[next[index], next[target]] = [next[target], next[index]]
    update(next)
    setActiveIndex(target)
  }

  const active = slides[activeIndex]

  return (
    <div className="flex h-full">
      {/* Slide thumbnail sidebar */}
      <div
        className="w-48 shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex-1 py-3 px-2 space-y-1.5">
          <AnimatePresence initial={false}>
            {slides.map((slide, i) => (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={() => setActiveIndex(i)}
                  className="w-full text-left rounded-lg p-2 transition-colors group"
                  style={{
                    background: i === activeIndex ? "var(--color-canvas)" : "transparent",
                    border: i === activeIndex ? "1.5px solid var(--color-cobalt)" : "1.5px solid transparent",
                  }}
                >
                  {/* Mini slide preview */}
                  <div
                    className="w-full aspect-video rounded mb-1.5 flex items-center justify-center overflow-hidden"
                    style={{ background: "#ffffff", border: "1px solid var(--color-border)" }}
                  >
                    <div className="w-full px-2 py-1">
                      <div
                        className="text-center font-semibold leading-tight mb-0.5 truncate"
                        style={{ fontSize: 5, color: "var(--color-ink)" }}
                      >
                        {slide.title || "Untitled"}
                      </div>
                      {slide.layout !== "title-only" && (
                        <div style={{ fontSize: 4, color: "var(--color-slate)", lineHeight: 1.4 }} className="truncate">
                          {slide.body || (slide.bullets ?? []).join(" · ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: i === activeIndex ? "var(--color-cobalt)" : "var(--color-slate)", fontWeight: i === activeIndex ? 600 : 400 }}>
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); moveSlide(i, -1) }} className="p-0.5 rounded hover:bg-gray-100" style={{ color: "var(--color-slate)", cursor: "pointer" }}>
                        <ChevronUp size={10} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 1) }} className="p-0.5 rounded hover:bg-gray-100" style={{ color: "var(--color-slate)", cursor: "pointer" }}>
                        <ChevronDown size={10} />
                      </button>
                      {slides.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); removeSlide(i) }} className="p-0.5 rounded hover:bg-red-50" style={{ color: "var(--color-slate)", cursor: "pointer" }}>
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="px-2 pb-3">
          <button
            onClick={addSlide}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors"
            style={{ border: "1.5px dashed var(--color-border)", color: "var(--color-slate)", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-slate)")}
          >
            <Plus size={12} /> Add slide
          </button>
        </div>
      </div>

      {/* Active slide editor */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Layout picker */}
        <div
          className="flex items-center gap-2 px-5 py-3 border-b shrink-0"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <span className="text-xs font-medium mr-1" style={{ color: "var(--color-slate)" }}>Layout</span>
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              onClick={() => updateSlide(activeIndex, { layout: l.value })}
              title={l.label}
              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all"
              style={{
                border: active.layout === l.value ? "1.5px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
                background: active.layout === l.value ? "#eff6ff" : "transparent",
                color: active.layout === l.value ? "var(--color-cobalt)" : "var(--color-slate)",
                cursor: "pointer",
              }}
            >
              {l.icon}
              <span style={{ fontSize: 9 }}>{l.label}</span>
            </button>
          ))}
        </div>

        {/* Slide fields */}
        <div className="flex-1 px-8 py-6 space-y-4">
          {/* Always: title */}
          <SlideField
            label="Title"
            value={active.title}
            onChange={(v) => updateSlide(activeIndex, { title: v })}
            placeholder="Slide title"
            rows={2}
            large
          />

          {/* title-body or two-column left */}
          {(active.layout === "title-body" || active.layout === "two-column") && (
            <div className={active.layout === "two-column" ? "grid grid-cols-2 gap-4" : ""}>
              <SlideField
                label={active.layout === "two-column" ? "Left column" : "Body"}
                value={active.body ?? ""}
                onChange={(v) => updateSlide(activeIndex, { body: v })}
                placeholder="Write your content here…"
                rows={8}
              />
              {active.layout === "two-column" && (
                <BulletsField
                  label="Right column (bullets)"
                  bullets={active.bullets ?? [""]}
                  onChange={(bullets) => updateSlide(activeIndex, { bullets })}
                />
              )}
            </div>
          )}

          {/* title-bullets */}
          {active.layout === "title-bullets" && (
            <BulletsField
              label="Bullet points"
              bullets={active.bullets ?? [""]}
              onChange={(bullets) => updateSlide(activeIndex, { bullets })}
            />
          )}
        </div>

        {/* Slide preview bar */}
        <div
          className="shrink-0 px-5 py-2.5 border-t text-xs"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-slate)" }}
        >
          Slide {activeIndex + 1} of {slides.length} · {LAYOUTS.find((l) => l.value === active.layout)?.label}
        </div>
      </div>
    </div>
  )
}

function SlideField({ label, value, onChange, placeholder, rows, large }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; rows: number; large?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-slate)" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
        style={{
          fontSize: large ? 18 : 14,
          fontWeight: large ? 600 : 400,
          border: "1px solid var(--color-border-input)",
          background: "var(--color-surface)",
          color: "var(--color-ink-near)",
        }}
        onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
        onBlur={(e) => (e.target.style.boxShadow = "none")}
      />
    </div>
  )
}

function BulletsField({ label, bullets, onChange }: {
  label: string; bullets: string[]; onChange: (bullets: string[]) => void
}) {
  function updateBullet(i: number, value: string) {
    onChange(bullets.map((b, idx) => (idx === i ? value : b)))
  }
  function addBullet() {
    onChange([...bullets, ""])
  }
  function removeBullet(i: number) {
    if (bullets.length === 1) return
    onChange(bullets.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-slate)" }}>
        {label}
      </label>
      <div className="space-y-2">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--color-border)", flexShrink: 0 }}>·</span>
            <input
              type="text"
              value={b}
              onChange={(e) => updateBullet(i, e.target.value)}
              placeholder={`Bullet ${i + 1}`}
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={{ border: "1px solid var(--color-border-input)", background: "var(--color-surface)", color: "var(--color-ink-near)" }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
            {bullets.length > 1 && (
              <button onClick={() => removeBullet(i)} style={{ color: "var(--color-slate)", cursor: "pointer", flexShrink: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addBullet}
          className="text-xs flex items-center gap-1 mt-1"
          style={{ color: "var(--color-slate)", cursor: "pointer" }}
        >
          <Plus size={11} /> Add bullet
        </button>
      </div>
    </div>
  )
}
