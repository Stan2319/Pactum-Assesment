import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import type { Message, Assessment, DocumentStateReport, DocumentStateEmail, DocumentStateSpreadsheet, DocumentStateDeck } from "@/lib/types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GRADER_SYSTEM = `You are an expert hiring evaluator scoring a candidate's performance on an AI-assisted work assessment.

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

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Fetch session with all related data
    const { data: session } = await supabase
      .from("sessions")
      .select("*, candidates(*), assessments(*), messages(*)")
      .eq("id", sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const assessment = session.assessments as Assessment
    const messages = (session.messages as Message[]).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // Build transcript grouped by round
    const roundGroups: Record<number, Message[]> = {}
    for (const msg of messages) {
      if (!roundGroups[msg.round]) roundGroups[msg.round] = []
      roundGroups[msg.round].push(msg)
    }

    let transcript = `ASSESSMENT: ${assessment.title}\nROLE: ${assessment.role}\n\n`

    for (const round of assessment.rounds) {
      transcript += `--- ROUND ${round.round}: ${round.title} ---\n`
      transcript += `Task: ${round.prompt}\n\n`
      const roundMessages = roundGroups[round.round] || []
      for (const msg of roundMessages) {
        transcript += `${msg.role === "user" ? "CANDIDATE" : "AI ASSISTANT"}: ${msg.content}\n\n`
      }
    }

    // Append final document state
    const docState = session.document_state
    const workspaceType = assessment.workspace_type ?? "report"
    if (docState) {
      transcript += `\n--- FINAL DOCUMENT STATE ---\n`
      if (workspaceType === "report") {
        transcript += `Document HTML:\n${(docState as DocumentStateReport).html}\n`
      } else if (workspaceType === "email") {
        const es = docState as DocumentStateEmail
        transcript += `To: ${es.to}\nFrom: ${es.from}\nSubject: ${es.subject}\nBody HTML:\n${es.html}\n`
      } else if (workspaceType === "spreadsheet") {
        transcript += `Spreadsheet data (JSON):\n${JSON.stringify((docState as DocumentStateSpreadsheet).data)}\n`
      } else if (workspaceType === "deck") {
        const { slides } = docState as DocumentStateDeck
        slides.forEach((slide, i) => {
          transcript += `Slide ${i + 1} [${slide.layout}]: Title="${slide.title}" Body="${slide.body ?? ""}" Bullets=${JSON.stringify(slide.bullets ?? [])}\n`
        })
      } else if (workspaceType === "code") {
        const code = (docState as { code?: string; language?: string }).code
        const lang = (docState as { code?: string; language?: string }).language ?? assessment.language ?? "python"
        if (code) {
          transcript += `Language: ${lang}\nFINAL CODE:\n\`\`\`${lang}\n${code}\n\`\`\`\n`
        }
      }
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: GRADER_SYSTEM,
      messages: [{ role: "user", content: transcript }],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}"

    let scoreData
    try {
      scoreData = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: "Failed to parse grader response" }, { status: 500 })
    }

    // Save score to database
    const { data: score, error } = await supabase
      .from("scores")
      .insert({
        session_id: sessionId,
        candidate_id: session.candidate_id,
        assessment_id: session.assessment_id,
        company_id: session.company_id,
        ...scoreData,
        raw_grader_response: rawText,
      })
      .select()
      .single()

    if (error) {
      console.error("Score insert error:", error)
      return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
    }

    // Mark session as completed
    await supabase
      .from("sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", sessionId)

    return NextResponse.json({ score })
  } catch (err) {
    console.error("Grade API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
