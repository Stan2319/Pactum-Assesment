"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

// ── Syntax highlighting ───────────────────────────────────────────

const C = {
  keyword: "#569cd6",
  string:  "#ce9178",
  comment: "#6a9955",
  number:  "#b5cea8",
  fn:      "#dcdcaa",
  default: "#d4d4d8",
}

const KW: Record<string, RegExp> = {
  javascript: /^(function|const|let|var|return|if|else|for|while|of|in|new|async|await|typeof|class|extends|true|false|null|undefined|Map|has|get|set)$/,
  sql:        /^(SELECT|FROM|WHERE|JOIN|LEFT|ON|GROUP|ORDER|BY|HAVING|CREATE|INDEX|INSERT|UPDATE|DELETE|AND|OR|NOT|IN|AS|DESC|ASC|COUNT|SUM|DISTINCT|LIMIT|TABLE|INTERVAL|NULL|ADD)$/i,
  python:     /^(def|return|async|await|with|as|try|except|import|from|None|True|False|if|else|elif|for|while|class|int|str|dict|list|raise)$/,
}

interface Token { text: string; color: string }

function tokenize(code: string, lang: string): Token[] {
  const kw = KW[lang]
  const tokens: Token[] = []
  let pos = 0

  while (pos < code.length) {
    const rest = code.slice(pos)

    // Single-line comment: --, //, #
    if (rest.startsWith("--") || rest.startsWith("//") || rest.startsWith("#")) {
      const end = rest.indexOf("\n")
      const text = end === -1 ? rest : rest.slice(0, end)
      tokens.push({ text, color: C.comment })
      pos += text.length
      continue
    }

    // String literal
    if (rest[0] === '"' || rest[0] === "'" || rest[0] === "`") {
      const q = rest[0]
      let i = 1
      while (i < rest.length && rest[i] !== q) { if (rest[i] === "\\") i++; i++ }
      const text = rest.slice(0, i + 1)
      tokens.push({ text, color: C.string })
      pos += text.length
      continue
    }

    // Number
    const num = rest.match(/^\d+\.?\d*/)
    if (num) { tokens.push({ text: num[0], color: C.number }); pos += num[0].length; continue }

    // Word — keyword or identifier
    const word = rest.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)
    if (word) {
      const w = word[0]
      const color = kw && kw.test(w) ? C.keyword : C.default
      tokens.push({ text: w, color })
      pos += w.length
      continue
    }

    // Fallthrough — single char
    tokens.push({ text: code[pos], color: C.default })
    pos++
  }

  return tokens
}

function renderTokens(tokens: Token[], charLimit: number): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let remaining = charLimit
  for (let i = 0; i < tokens.length && remaining > 0; i++) {
    const { text, color } = tokens[i]
    const slice = text.slice(0, remaining)
    out.push(<span key={i} style={{ color }}>{slice}</span>)
    remaining -= text.length
  }
  return out
}

// ── Tasks ─────────────────────────────────────────────────────────

const TASKS = [
  {
    num: "01",
    title: "Two Sum",
    category: "Algorithms",
    difficulty: "Easy",
    diffColor: { bg: "#dcfce7", text: "#15803d" },
    lang: "javascript",
    description: "Given an array of integers and a target, return the indices of the two numbers that add up to the target. Each input has exactly one solution.",
    context: [
      "You may not use the same element twice",
      "Return indices in any order",
      "Aim for O(n) time complexity",
    ],
    response:
      "function twoSum(nums, target) {\n  const seen = new Map();\n\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n\n    if (seen.has(diff)) {\n      return [seen.get(diff), i];\n    }\n    seen.set(nums[i], i);\n  }\n\n  return [];\n}",
    scores: [
      { label: "Correctness", value: 96, color: "#22c55e" },
      { label: "AI Fluency",  value: 91, color: "#3b82f6" },
      { label: "Efficiency",  value: 93, color: "#a78bfa" },
    ],
    verdict: "Strong hire",
    verdictColor: "#22c55e",
  },
  {
    num: "02",
    title: "Slow Query Fix",
    category: "Databases",
    difficulty: "Medium",
    diffColor: { bg: "#fef9c3", text: "#854d0e" },
    lang: "sql",
    description: "An orders endpoint takes 4.2s. The table has 12M rows. Diagnose the bottleneck and rewrite the query to run under 200ms.",
    context: [
      "PostgreSQL, no query cache enabled",
      "Filters: user_id, created_at, status",
      "Includes a LIKE search on a text column",
    ],
    response:
      "-- Probably needs an index\nCREATE INDEX idx_created_at\n  ON orders (created_at);\n\n-- Cleaned up the query\nSELECT *\nFROM orders\nWHERE user_id = $1\n  AND created_at > NOW() - INTERVAL '30 days'\nGROUP BY user_id;",
    scores: [
      { label: "Correctness",     value: 58, color: "#ef4444" },
      { label: "AI Fluency",      value: 71, color: "#f59e0b" },
      { label: "Technical depth", value: 63, color: "#f59e0b" },
    ],
    verdict: "No hire",
    verdictColor: "#ef4444",
  },
  {
    num: "03",
    title: "Async Fetch Handler",
    category: "Backend",
    difficulty: "Medium",
    diffColor: { bg: "#fef9c3", text: "#854d0e" },
    lang: "python",
    description: "Write an async function that fetches a user by ID from an internal API. Handle timeouts and HTTP errors gracefully without crashing the caller.",
    context: [
      "Use httpx.AsyncClient",
      "Timeout after 5 seconds",
      "Return None on any error",
    ],
    response:
      "async def get_user(user_id: int) -> dict | None:\n    try:\n        async with httpx.AsyncClient() as client:\n            res = await client.get(\n                f\"/api/users/{user_id}\",\n                timeout=5.0\n            )\n            res.raise_for_status()\n            return res.json()\n    except httpx.HTTPError:\n        return None",
    scores: [
      { label: "Correctness", value: 95, color: "#22c55e" },
      { label: "AI Fluency",  value: 92, color: "#3b82f6" },
      { label: "Clarity",     value: 90, color: "#a78bfa" },
    ],
    verdict: "Strong hire",
    verdictColor: "#22c55e",
  },
]

const T_TYPING = 3200
const T_HOLD   = 2400
const T_TASK   = T_TYPING + T_HOLD

// ── Cursor ────────────────────────────────────────────────────────
function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      style={{
        display: "inline-block", width: "1px", height: "1em",
        background: "#aeafad", marginLeft: 1, verticalAlign: "text-bottom",
      }}
    />
  )
}

// ── Score bar ─────────────────────────────────────────────────────
function ScoreBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      style={{ marginBottom: 10 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "0.7rem", color: "#71717a" }}>{label}</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: "#3f3f46", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.08, duration: 0.55, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
    </motion.div>
  )
}

// ── Widget ────────────────────────────────────────────────────────
export function HeroDemoWidget() {
  const [taskIdx, setTaskIdx]         = useState(0)
  const [typedChars, setTypedChars]   = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [typing, setTyping]           = useState(true)

  const task   = TASKS[taskIdx]
  const tokens = useMemo(() => tokenize(task.response, task.lang), [task])

  useEffect(() => {
    setTypedChars(0)
    setShowResults(false)
    setTyping(true)
    const tDone = setTimeout(() => { setTyping(false); setShowResults(true) }, T_TYPING)
    const tNext = setTimeout(() => setTaskIdx(i => (i + 1) % TASKS.length), T_TASK)
    return () => { clearTimeout(tDone); clearTimeout(tNext) }
  }, [taskIdx])

  useEffect(() => {
    if (!typing) return
    setTypedChars(0)
    const total = task.response.length
    const ms    = T_TYPING / total
    let i = 0
    const iv = setInterval(() => { i++; setTypedChars(i); if (i >= total) clearInterval(iv) }, ms)
    return () => clearInterval(iv)
  }, [typing, task.response])

  const lines = task.response.slice(0, typedChars).split("\n").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        width: "100%",
        maxWidth: 1000,
        margin: "0 auto",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.14)",
        border: "1px solid #27272a",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
      }}
    >
      {/* Chrome */}
      <div style={{
        background: "#18181b",
        borderBottom: "1px solid #27272a",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
      }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "#52525b", letterSpacing: "0.04em" }}>
          Pactum - Assessment
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          {TASKS.map((_, i) => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: "50%", display: "inline-block",
              background: i === taskIdx ? "#3b82f6" : "#3f3f46",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ aspectRatio: "16/9", display: "flex", background: "#18181b", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={taskIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: "contents" }}
          >
            {/* Left: problem description */}
            <div style={{
              flex: "0 0 38%",
              background: "#111113",
              borderRight: "1px solid #27272a",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #27272a", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#52525b" }}>{task.num}</span>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 600,
                    background: task.diffColor.bg, color: task.diffColor.text,
                    padding: "2px 7px", borderRadius: 99,
                  }}>{task.difficulty}</span>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 600,
                    background: "#27272a", color: "#71717a",
                    padding: "2px 7px", borderRadius: 99,
                  }}>{task.category}</span>
                </div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f4f4f5", lineHeight: 1.3, margin: 0 }}>
                  {task.title}
                </h3>
              </div>
              <div style={{ padding: "14px 18px", overflow: "hidden" }}>
                <p style={{ fontSize: "0.8rem", lineHeight: 1.65, color: "#a1a1aa", margin: "0 0 14px" }}>
                  {task.description}
                </p>
                <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3f3f46", marginBottom: 8 }}>
                  Constraints
                </div>
                {task.context.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                    <span style={{ color: "#3f3f46", fontSize: "0.75rem", flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: "0.775rem", color: "#71717a", lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: code editor */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              {/* Tab bar */}
              <div style={{
                background: "#18181b",
                borderBottom: "1px solid #27272a",
                display: "flex",
                alignItems: "center",
                height: 36,
                padding: "0 0 0 0",
                flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", height: "100%",
                  borderBottom: "2px solid #3b82f6", padding: "0 16px",
                }}>
                  <span style={{ fontSize: "0.72rem", color: "#e4e4e7", fontWeight: 500 }}>
                    solution.{task.lang === "javascript" ? "js" : task.lang === "sql" ? "sql" : "py"}
                  </span>
                </div>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: "0.65rem", color: "#3f3f46", paddingRight: 14 }}>
                  {task.lang === "javascript" ? "JavaScript" : task.lang === "sql" ? "SQL" : "Python"}
                </span>
              </div>

              {/* Editor */}
              <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {/* Gutter */}
                <div style={{
                  width: 44,
                  background: "#18181b",
                  paddingTop: 14,
                  paddingBottom: 14,
                  paddingRight: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  flexShrink: 0,
                  userSelect: "none",
                }}>
                  {task.response.split("\n").map((_, i) => (
                    <div key={i} style={{
                      fontSize: "0.8125rem",
                      lineHeight: "1.7",
                      color: i < lines ? "#4a4a52" : "#27272a",
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      transition: "color 0.15s",
                    }}>
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code */}
                <div style={{ flex: 1, padding: "14px 16px 14px 0", overflow: "hidden" }}>
                  <pre style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    lineHeight: 1.7,
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textAlign: "left",
                    color: C.default,
                  }}>
                    {renderTokens(tokens, typedChars)}
                    {typing && <Cursor />}
                  </pre>
                </div>
              </div>

              {/* Results drawer — absolutely positioned so it never affects layout height */}
              <motion.div
                initial={false}
                animate={{
                  opacity: showResults ? 1 : 0,
                  y: showResults ? 0 : 24,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "#111113",
                  borderTop: "1px solid #27272a",
                  pointerEvents: showResults ? "auto" : "none",
                }}
              >
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52525b" }}>
                      AI Analysis
                    </span>
                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 350, damping: 18 }}
                      style={{
                        fontSize: "0.68rem", fontWeight: 700,
                        color: task.verdictColor,
                        background: "rgba(34,197,94,0.1)",
                        padding: "3px 10px", borderRadius: 99,
                      }}
                    >
                      {task.verdict}
                    </motion.span>
                  </div>
                  {showResults && task.scores.map((s, i) => (
                    <ScoreBar key={s.label} {...s} delay={0.1 + i * 0.1} />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
