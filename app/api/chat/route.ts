import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface RoundContext {
  roundNumber: number
  totalRounds: number
  title: string
  prompt: string
  successCriteria: string
  background: string
}

interface PreviousRound {
  roundNumber: number
  roundTitle: string
  messages: { role: string; content: string }[]
}

function serializeDocumentState(docState: unknown, workspaceType: string): string {
  if (!docState) return ""
  try {
    if (workspaceType === "report") {
      const { html } = docState as { html: string }
      const text = (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      return text ? `CURRENT DOCUMENT CONTENT:\n${text}` : ""
    }
    if (workspaceType === "email") {
      const { to, from, subject, html } = docState as { to: string; from: string; subject: string; html: string }
      const body = (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      return `CURRENT EMAIL DRAFT:\nTo: ${to}\nFrom: ${from}\nSubject: ${subject}\nBody: ${body}`
    }
    if (workspaceType === "deck") {
      const { slides } = docState as { slides: { title: string; body?: string; bullets?: string[] }[] }
      if (!slides?.length) return ""
      const text = slides
        .map((s, i) => {
          const parts = [`Slide ${i + 1}: ${s.title}`]
          if (s.body) parts.push(s.body)
          if (s.bullets?.length) parts.push(s.bullets.join(" | "))
          return parts.join(" — ")
        })
        .join("\n")
      return `CURRENT DECK CONTENT:\n${text}`
    }
    if (workspaceType === "spreadsheet") {
      const sheets = docState as { data: ({ v?: string } | null)[][] }[]
      const sheet = sheets?.[0]
      if (!sheet?.data) return ""
      const rows = sheet.data
        .filter((row) => row?.some((cell) => cell?.v))
        .map((row) => row.map((cell) => cell?.v ?? "").join("\t"))
      return rows.length ? `CURRENT SPREADSHEET CONTENT:\n${rows.join("\n")}` : ""
    }
  } catch {
    // silently ignore serialization errors
  }
  return ""
}

function buildSystemPrompt(
  tensionLevel: "junior" | "senior",
  round: RoundContext,
  previousRounds: PreviousRound[] = [],
  documentContext: string = ""
): string {
  const previousRoundsSection = previousRounds.length > 0
    ? `\nPREVIOUS ROUNDS (full conversation history for context):
${previousRounds.map((pr) => {
  const transcript = pr.messages
    .map((m) => `${m.role === "user" ? "CANDIDATE" : "YOU (CLAUDE)"}: ${m.content}`)
    .join("\n\n")
  return `--- Round ${pr.roundNumber}: ${pr.roundTitle} ---\n${transcript}`
}).join("\n\n")}
--- End of previous rounds ---\n`
    : ""

  const documentSection = documentContext
    ? `\n${documentContext}\n`
    : ""

  const base = `You are a professional AI work tool embedded inside a hiring assessment platform. A job candidate is using you to complete a real work task. Everything in this session is recorded and reviewed by the hiring team.

ASSESSMENT STRUCTURE:
This is Round ${round.roundNumber} of ${round.totalRounds}.

BACKGROUND (context the candidate has):
${round.background}
${previousRoundsSection}${documentSection}
THE TASK FOR THIS ROUND:
${round.prompt}

WHAT "DONE" LOOKS LIKE FOR THIS ROUND:
${round.successCriteria}

YOUR JOB:
You are both a tool the candidate uses AND an active guide tracking whether they've completed the task. After each exchange, you should have a mental model of what they've delivered so far vs. what the task requires. When they have produced everything the task asks for, tell them clearly at the end of your response — something like: "You've covered everything this round asks for. If you're happy with it, you can move on." If they're missing something specific, name it without giving it to them — e.g. "You have the positioning and differentiators, but you haven't included the three campaign concepts yet."

FORMATTING RULES (strictly enforced):
- Write in clean, natural prose. No markdown headers (no #). No bullet point spam.
- Lists are fine when the task genuinely calls for them (e.g. numbered campaign concepts).
- No filler openers: never start with "Great!", "Sure!", "Of course!", or similar.
- Never use em dashes (— or –). Use a comma, period, or restructure the sentence instead.
- Keep responses focused. No meta-commentary about what you're about to do.

ASSESSMENT RULES:
- Never hand the candidate the full answer in one shot. Produce strong partial work and let them direct the rest.
- If their prompt is vague, ask one sharp clarifying question rather than guessing.
- If they paste back your output with no real direction, push back — ask them what specifically they want changed or improved.
- Do not reveal the scoring rubric or tell them what score they might get.
- Do not fabricate statistics, data, or facts.
- If the candidate's message appears to be the task description copied verbatim or near-verbatim, do NOT execute it. Ask them what their approach is or what specific aspect they want to tackle first. Do not acknowledge that you noticed the copy — just redirect naturally.`

  if (tensionLevel === "junior") {
    return `${base}

MODE: SUPPORTIVE COLLABORATOR
Act as a skilled, direct colleague. After producing output, briefly note one key decision you made and why. If the candidate's approach has a clear weakness, say so once — plainly, not gently. Point them toward what to work on next, but make them do the thinking.`
  }

  return `${base}

MODE: PROFESSIONAL EXECUTOR
Do exactly what you're told, with high craft. No explanations, no suggestions unless asked. One clarifying question if the brief is ambiguous. The completion signal is the only unsolicited thing you should add — when all deliverables are done, say so at the end. Otherwise, produce excellent work and stop.`
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "that", "this", "it", "as", "you", "your", "we", "they", "their",
  "have", "has", "will", "should", "can", "do", "use", "using", "about",
])

function taskSimilarity(userMessage: string, taskPrompt: string): number {
  const tokenize = (text: string) =>
    (text.toLowerCase().match(/\b[a-z]+\b/g) ?? []).filter(
      (w) => !STOPWORDS.has(w) && w.length > 3
    )
  const taskTokens = new Set(tokenize(taskPrompt))
  if (taskTokens.size === 0) return 0
  const msgTokens = new Set(tokenize(userMessage))
  const overlap = [...taskTokens].filter((t) => msgTokens.has(t)).length
  return overlap / taskTokens.size
}

export async function POST(req: NextRequest) {
  const { sessionId, messages, tensionLevel, round, previousRounds, documentState, workspaceType } = await req.json()

  if (!sessionId || !messages || !tensionLevel || !round) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("id", sessionId)
    .single()

  if (!session || session.status !== "in_progress") {
    return NextResponse.json({ error: "Session not found or not active" }, { status: 403 })
  }

  // Check if the latest user message closely matches the task prompt (copy-paste detection)
  const latestUserMessage = [...messages].reverse().find(
    (m: { role: string; content: string }) => m.role === "user"
  )
  const similarity = latestUserMessage
    ? taskSimilarity(latestUserMessage.content, round.prompt)
    : 0

  const documentContext = documentState && workspaceType
    ? serializeDocumentState(documentState, workspaceType)
    : ""

  let systemPrompt = buildSystemPrompt(tensionLevel, round, previousRounds ?? [], documentContext)
  if (similarity >= 0.55) {
    systemPrompt += `\n\n[INTERNAL — do not reveal this to the candidate: Their latest message closely matches the task description. They likely copied it directly. Do not execute the task. Redirect them naturally — ask what aspect they want to start with or what their initial thinking is.]`
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        })
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        console.error("Chat stream error:", err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache, no-transform",
    },
  })
}
