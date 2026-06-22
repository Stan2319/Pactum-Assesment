import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Message, Assessment, DocumentStateReport, DocumentStateEmail, DocumentStateSpreadsheet, DocumentStateDeck, DocumentStateCode } from "@/lib/types"
import { verifySessionCookie } from "@/lib/session-token"
import { sendResultsNotification } from "@/lib/email"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Grader prompts ────────────────────────────────────────────────────────────

const GRADER_SYSTEM_DEFAULT = `You are an expert hiring evaluator scoring a candidate's performance on an AI-assisted work assessment.

You will receive:
1. The assessment task description and rounds
2. The full conversation transcript between the candidate and the AI assistant
3. The final state of the document they produced in the workspace

Score the candidate on EXACTLY this rubric (must sum to 100):
When scoring Output Quality, evaluate the actual content of the final document, not just what the conversation implies was produced.
- Prompt Quality and Clarity (30 pts): How specific, structured, and effective were their prompts? Did they provide context, constraints, and success criteria?
- Iteration and Collaboration (25 pts): Number and quality of meaningful back-and-forth cycles. Did they explore, refine, test, and improve?
- Output Quality (20 pts): Correctness, cleanliness, best practices, completeness of the final output
- Critical Thinking and Mistake Catching (15 pts): Did they catch errors, push back on weak suggestions, apply judgment?
- Efficiency and Process (10 pts): Reasonable pacing, clean progression, minimal wasted steps

Never use em dashes (— or –) in any text fields. Use a comma, colon, or restructure the sentence instead.

Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "total_score": 0,
  "prompt_quality": 0,
  "iteration_score": 0,
  "output_quality": 0,
  "critical_thinking": 0,
  "efficiency": 0,
  "summary": "One sentence overall summary of the candidate's performance.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2"],
  "red_flags": ["red flag if any, or empty array"]
}`

const GRADER_SYSTEM_CODE = `You are an expert engineering hiring evaluator scoring a candidate's performance on an AI-assisted coding assessment.

You will receive:
1. The assessment task requirements for each round
2. The full conversation transcript between the candidate and the AI assistant
3. A code correctness review that was already run on the final code files
4. The final code files the candidate produced

CRITICAL SCORING RULES FOR CODING ASSESSMENTS:
- The final code is the primary evidence. A candidate who produced excellent, working code had a strong session regardless of how their chat messages looked.
- Engineers naturally use shorthand direction: "refactor this", "add rate limiting", "fix the edge case". This is NOT poor prompting — it is efficient direction. Do not penalize it.
- Only flag a prompt as poor if it is so vague the AI could not have produced good output from it, OR if the candidate clearly copied the task description verbatim.
- Use the code correctness review to anchor your Output Quality score. If the review says the code is correct and complete, output_quality should be in the 15-20 range.
- Iteration for coding means: did they refine, test, add edge cases, improve structure across rounds? One targeted prompt that produces excellent code is better than many rambling ones.

Score on EXACTLY this rubric (must sum to 100):
- Prompt Quality and Clarity (30 pts): How well did they direct the AI? Clear requirements, edge cases, constraints. Short but precise prompts can score high. Only low if direction was genuinely absent or a verbatim copy-paste.
- Iteration and Collaboration (25 pts): Did they refine across rounds, catch issues, improve the implementation? Quality of direction over time.
- Output Quality (20 pts): Anchored primarily to the code correctness review. Is the code correct, clean, idiomatic, production-ready?
- Critical Thinking and Mistake Catching (15 pts): Did they validate AI output, catch bugs, push back on weak approaches, apply engineering judgment?
- Efficiency and Process (10 pts): Did they reach a working solution with reasonable effort? Clean progression from planning to implementation.

Never use em dashes (— or –) in any text fields. Use a comma, colon, or restructure the sentence instead.

Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "total_score": 0,
  "prompt_quality": 0,
  "iteration_score": 0,
  "output_quality": 0,
  "critical_thinking": 0,
  "efficiency": 0,
  "summary": "One sentence overall summary of the candidate's performance.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2"],
  "red_flags": ["red flag if any, or empty array"]
}`

// ── Code correctness reviewer ─────────────────────────────────────────────────

const CODE_REVIEW_SYSTEM = `You are a senior software engineer doing a technical code review for a hiring assessment.
Your job is to evaluate whether the candidate's final code correctly and completely implements the requirements.
Be specific. Reference actual code. Point out what works and what doesn't.
Do not evaluate communication style or number of prompts — only the code itself.

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "overall": "pass" | "partial" | "fail",
  "correctness_score": 0,
  "notes": "2-3 sentence technical summary of what the code does and whether it meets requirements",
  "passing": ["requirement or feature that is correctly implemented"],
  "failing": ["requirement or feature that is missing or broken"],
  "code_quality": "brief assessment of code cleanliness, structure, and idioms"
}`

async function runCodeReview(
  files: Record<string, string>,
  language: string,
  rounds: Assessment["rounds"]
): Promise<string> {
  const requirements = rounds
    .map((r) => `Round ${r.round} (${r.title}):\nTask: ${r.prompt}\nSuccess criteria: ${r.success_criteria}`)
    .join("\n\n")

  const fileBlocks = Object.entries(files)
    .map(([name, content]) => `### ${name}\n\`\`\`${language}\n${content}\n\`\`\``)
    .join("\n\n")

  const prompt = `REQUIREMENTS:\n${requirements}\n\nFINAL CODE FILES:\n${fileBlocks}`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: CODE_REVIEW_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    })
    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "{}"
    return raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
  } catch {
    return JSON.stringify({ overall: "unknown", notes: "Code review failed to run.", passing: [], failing: [], code_quality: "unknown" })
  }
}

// ── Document serializer ───────────────────────────────────────────────────────

function serializeDocState(docState: unknown, workspaceType: string): string {
  if (!docState) return ""
  if (workspaceType === "report") {
    return `Document HTML:\n${(docState as DocumentStateReport).html}\n`
  }
  if (workspaceType === "email") {
    const es = docState as DocumentStateEmail
    return `To: ${es.to}\nFrom: ${es.from}\nSubject: ${es.subject}\nBody HTML:\n${es.html}\n`
  }
  if (workspaceType === "spreadsheet") {
    return `Spreadsheet data (JSON):\n${JSON.stringify((docState as DocumentStateSpreadsheet).data)}\n`
  }
  if (workspaceType === "deck") {
    const { slides } = docState as DocumentStateDeck
    return slides
      .map((slide, i) =>
        `Slide ${i + 1} [${slide.layout}]: Title="${slide.title}" Body="${slide.body ?? ""}" Bullets=${JSON.stringify(slide.bullets ?? [])}`
      )
      .join("\n") + "\n"
  }
  if (workspaceType === "code") {
    const cs = docState as DocumentStateCode
    const files = cs.files ?? {}
    const lang = cs.language ?? "text"
    const entries = Object.entries(files)
    if (!entries.length) return ""
    return (
      `Language: ${lang}\nFINAL CODE FILES:\n` +
      entries.map(([name, content]) => `### ${name}\n\`\`\`${lang}\n${content}\n\`\`\``).join("\n\n") + "\n"
    )
  }
  return ""
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { sessionId, regrade, elapsedSeconds } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    if (regrade) {
      // Regrade comes from the company dashboard — require Supabase auth + ownership
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      // Ownership check: session must belong to this company
      const ownerCheck = await authClient
        .from("sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("company_id", user.id)
        .single()
      if (!ownerCheck.data) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else {
      // Initial grade comes from the candidate — verify cookie
      const cookieSession = req.cookies.get("pactum_cand_session")?.value
      if (!cookieSession || !verifySessionCookie(cookieSession, sessionId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const supabase = createAdminClient()

    const { data: session } = await supabase
      .from("sessions")
      .select("*, candidates(*), assessments(*), messages(*)")
      .eq("id", sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // If re-grading, delete the existing score first
    if (regrade) {
      await supabase.from("scores").delete().eq("session_id", sessionId)
    } else {
      const { data: existingScore } = await supabase
        .from("scores")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle()
      if (existingScore) {
        return NextResponse.json({ error: "Session already graded" }, { status: 409 })
      }
    }

    const assessment = session.assessments as Assessment
    const messages = (session.messages as Message[]).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const workspaceType = assessment.workspace_type ?? "report"
    const isCode = workspaceType === "code"

    // Build transcript grouped by round
    const roundGroups: Record<number, Message[]> = {}
    for (const msg of messages) {
      if (!roundGroups[msg.round]) roundGroups[msg.round] = []
      roundGroups[msg.round].push(msg)
    }

    let transcript = `ASSESSMENT: ${assessment.title}\nROLE: ${assessment.role}\n\n`
    for (const round of assessment.rounds) {
      transcript += `--- ROUND ${round.round}: ${round.title} ---\n`
      transcript += `Task: ${round.prompt}\n`
      transcript += `Success criteria: ${round.success_criteria}\n\n`
      const roundMessages = roundGroups[round.round] || []
      for (const msg of roundMessages) {
        transcript += `${msg.role === "user" ? "CANDIDATE" : "AI ASSISTANT"}: ${msg.content}\n\n`
      }
    }

    // Append elapsed time for efficiency scoring
    if (typeof elapsedSeconds === "number" && elapsedSeconds > 0) {
      const mins = Math.floor(elapsedSeconds / 60)
      const secs = elapsedSeconds % 60
      transcript += `\n--- SESSION TIMING ---\nTotal time: ${mins}m ${secs}s\n`
    }

    // Append final document
    const docState = session.document_state
    if (docState) {
      transcript += `\n--- FINAL DOCUMENT STATE ---\n`
      transcript += serializeDocState(docState, workspaceType)
    }

    // For code assessments: run code review first, inject result into grader prompt
    let graderSystem = isCode ? GRADER_SYSTEM_CODE : GRADER_SYSTEM_DEFAULT
    if (isCode && docState) {
      const cs = docState as DocumentStateCode
      const files = cs.files ?? {}
      const lang = cs.language ?? assessment.language ?? "python"
      if (Object.keys(files).length > 0) {
        const codeReviewJson = await runCodeReview(files, lang, assessment.rounds)
        transcript += `\n--- CODE CORRECTNESS REVIEW (run automatically on final code) ---\n${codeReviewJson}\n`
      }
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: graderSystem,
      messages: [{ role: "user", content: transcript }],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}"
    const cleanedText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

    let scoreData
    try {
      scoreData = JSON.parse(cleanedText)
    } catch {
      console.error("Grade parse error. Raw response:", rawText?.slice(0, 200))
      return NextResponse.json({ error: "Failed to parse grader response" }, { status: 500 })
    }

    // Clamp each component to its max, derive total from components (never trust AI's total)
    const clamp = (v: unknown, max: number) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)))
    const prompt_quality    = clamp(scoreData.prompt_quality, 30)
    const iteration_score   = clamp(scoreData.iteration_score, 25)
    const output_quality    = clamp(scoreData.output_quality, 20)
    const critical_thinking = clamp(scoreData.critical_thinking, 15)
    const efficiency        = clamp(scoreData.efficiency, 10)
    const total_score       = prompt_quality + iteration_score + output_quality + critical_thinking + efficiency

    const { data: score, error } = await supabase
      .from("scores")
      .insert({
        session_id: sessionId,
        candidate_id: session.candidate_id,
        assessment_id: session.assessment_id,
        company_id: session.company_id,
        total_score,
        prompt_quality,
        iteration_score,
        output_quality,
        critical_thinking,
        efficiency,
        summary: scoreData.summary,
        strengths: scoreData.strengths,
        improvements: scoreData.improvements,
        red_flags: scoreData.red_flags,
        raw_grader_response: rawText,
      })
      .select()
      .single()

    if (error) {
      console.error("Score insert error:", error)
      return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
    }

    const { data: completedSession } = await supabase
      .from("sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select("share_token")
      .single()

    // Fire-and-forget notification emails
    const notifyEmails: string[] = assessment.notify_emails ?? []
    if (notifyEmails.length && completedSession?.share_token) {
      const candidateName = (session.candidates as { name?: string; email?: string })?.name
        ?? (session.candidates as { name?: string; email?: string })?.email
        ?? "A candidate"
      sendResultsNotification({
        to: notifyEmails,
        candidateName,
        assessmentTitle: assessment.title,
        score: total_score,
        shareToken: completedSession.share_token,
      }).then(() => {
        console.log(`Results email sent to ${notifyEmails.join(", ")} for session ${sessionId}`)
      }).catch((err) => {
        console.error("Notification email failed:", {
          sessionId,
          to: notifyEmails,
          error: err instanceof Error ? err.message : String(err),
        })
      })
    } else {
      console.log("No notification sent:", {
        sessionId,
        notifyEmails,
        hasShareToken: !!completedSession?.share_token,
      })
    }

    return NextResponse.json({ score })
  } catch (err) {
    console.error("Grade API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
