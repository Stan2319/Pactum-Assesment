import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import type { WorkspaceType, DocumentState } from "@/lib/types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPatchSystemPrompt(workspaceType: WorkspaceType, currentDocState: DocumentState | null): string {
  const stateContext = currentDocState
    ? `\nCurrent document state:\n${JSON.stringify(currentDocState)}\n`
    : ""

  const formatInstructions: Record<WorkspaceType, string> = {
    report: `Return ONLY valid JSON with no markdown or explanation:
{ "type": "replace" | "append", "html": "<html string>" }
- Use "replace" to overwrite the entire document, "append" to add after existing content.
- HTML must be valid Tiptap-compatible: p, h2, h3, ul, ol, li, table, thead, tbody, tr, td, th, strong, em, br.
- STRUCTURE RULES (strictly enforced):
  - Every distinct section or topic gets an <h2> or <h3> heading — never dump multiple sections into one block.
  - Each paragraph is ONE idea or point. Split long content into multiple <p> tags.
  - Any list of items (concepts, differentiators, steps, options) must use <ul><li>...</li></ul> or <ol><li>...</li></ul> — never write a list as a single paragraph.
  - Use <strong> for key terms, names, or labels within a paragraph.
  - Never output a single <p> containing everything. If the content has sections, use headings. If it has items, use lists.`,
    email: `Return ONLY valid JSON with no markdown or explanation:
{ "type": "replace" | "append", "html": "<html string>" }
- Only patch the email body HTML. Do not touch To/From/Subject.
- Same HTML and structure rules as report format: headings for sections, lists for items, one idea per paragraph.`,
    spreadsheet: `Return ONLY valid JSON with no markdown or explanation:
{ "type": "cells", "changes": [{ "row": 0, "col": 0, "value": "string" }] }
- row and col are 0-indexed integers.
- value is always a string (stringify numbers).
- Only include cells that need to change.`,
    deck: `Return ONLY valid JSON with no markdown or explanation:
{ "type": "slide_update", "slideIndex": 0, "field": "title" | "body" | "bullets", "value": "string" }
- slideIndex is 0-indexed.
- For field "bullets", value must be a JSON array string: "[\"bullet 1\", \"bullet 2\"]"
- Only one field per patch.`,
    code: `Return exactly: { "skip": true }
Code workspaces do not use document patches.`,
  }

  return `You are a document patch generator for a hiring assessment platform.
Your job is to decide whether an AI assistant message contains substantive document content that should be applied to the candidate's workspace.

FIRST: decide if this message contains content that belongs in the document.
- Skip if the message is: asking a question, requesting clarification, giving directional feedback, discussing what to do next, or otherwise conversational with no actual deliverable content.
- Generate a patch only if the message contains actual document content: written copy, structured data, slide content, email body, etc.

If you decide to skip, return exactly: { "skip": true }
${stateContext}
If you decide to generate a patch, the workspace type is: ${workspaceType}

${formatInstructions[workspaceType]}

Do not include any explanation, markdown fences, or text outside the JSON object.`
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messageContent, workspaceType, currentDocumentState } = await req.json()

    if (!sessionId || !messageContent || !workspaceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: session } = await supabase
      .from("sessions")
      .select("id, status")
      .eq("id", sessionId)
      .single()

    if (!session || session.status !== "in_progress") {
      return NextResponse.json({ error: "Session not active" }, { status: 403 })
    }

    const systemPrompt = buildPatchSystemPrompt(workspaceType, currentDocumentState)

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: messageContent }],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text.trim() : "{}"

    // Strip markdown fences if Claude wrapped it anyway
    const cleaned = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()

    let patch
    try {
      patch = JSON.parse(cleaned)
    } catch {
      console.error("Failed to parse patch JSON:", cleaned)
      return NextResponse.json({ error: "Failed to parse patch" }, { status: 500 })
    }

    // Model decided there's nothing document-worthy in this message
    if (patch.skip === true) {
      return NextResponse.json({ patch: null })
    }

    return NextResponse.json({ patch })
  } catch (err) {
    console.error("Doc patch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
