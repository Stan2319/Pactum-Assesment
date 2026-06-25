import type { TemplateConfig } from "./types"
import { existingTemplates } from "./existing"
import { docTemplates } from "./doc"
import { emailTemplates } from "./email"
import { excelTemplates } from "./excel"
import { deckTemplates } from "./deck"
import { codeTemplates } from "./code"

export type { TemplateConfig } from "./types"

export const TEMPLATES: TemplateConfig[] = [
  ...existingTemplates,
  ...docTemplates,
  ...emailTemplates,
  ...excelTemplates,
  ...deckTemplates,
  ...codeTemplates,
]

// Keys must be unique across every template file — catch collisions at import.
const seen = new Set<string>()
for (const t of TEMPLATES) {
  if (seen.has(t.key)) throw new Error(`Duplicate template key: ${t.key}`)
  seen.add(t.key)
}
