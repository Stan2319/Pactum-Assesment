"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { Plus, Minus } from "lucide-react"
import { fadeInUp, stagger } from "@/lib/motion"

const faqs = [
  {
    question: "What is AI fluency testing?",
    answer:
      "AI fluency testing measures how well a candidate uses AI tools to produce high-quality work output. It evaluates prompt quality, the ability to critique and revise AI-generated content, and sound judgment about when to trust or override AI suggestions. It reflects the skill that actually matters in most jobs today.",
  },
  {
    question: "How is Pactum different from LeetCode or HackerRank?",
    answer:
      "LeetCode tests whether candidates have memorized algorithms. Pactum tests whether candidates can do the actual job. Candidates complete realistic tasks -- email drafts, code reviews, written analysis -- using the same AI tools your team uses. You see every prompt and decision, not just the final answer.",
  },
  {
    question: "Can candidates cheat if AI tools are allowed?",
    answer:
      "Cheating isn't possible because AI assistance is the point. Pactum records every prompt, every revision, and every AI interaction. Two candidates using the same tools will produce very different sessions. The assessment reveals judgment, critical thinking, and how well someone directs AI to produce good work -- not whether they can bypass a detector.",
  },
  {
    question: "What types of tasks does Pactum support?",
    answer:
      "Pactum supports email tasks, written analysis, code review, and slide deck tasks. Each task type has a structured workspace with built-in AI tools relevant to that format. You provide the prompt and success criteria; Pactum handles the rest.",
  },
  {
    question: "How long does a Pactum assessment take?",
    answer:
      "Most assessments are designed to take 30 to 60 minutes. Unlike open-ended take-homes, tasks are scoped and time-bounded, which makes completion rates significantly higher. Candidates complete them async on their own schedule.",
  },
  {
    question: "How does automatic scoring work?",
    answer:
      "After a candidate submits, Pactum scores the session across dimensions including technical depth, AI fluency, output quality, and clarity. Scores are generated using the success criteria you defined when building the assessment. Each candidate receives a structured report and an overall verdict, so you can compare candidates without manual review.",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
  total: number
}

function FAQItem({ question, answer, isOpen, onToggle, index, total }: FAQItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      style={{
        borderBottom: index < total - 1 ? "1px solid var(--color-border)" : "none",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--color-ink)",
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--color-border)",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          {isOpen ? (
            <Minus size={14} style={{ color: "var(--color-ink)" }} />
          ) : (
            <Plus size={14} style={{ color: "var(--color-ink)" }} />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-slate)",
                lineHeight: 1.65,
                paddingBottom: 20,
                margin: 0,
              }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      style={{
        background: "var(--color-canvas)",
        borderTop: "1px solid var(--color-border)",
        padding: "120px 24px",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              marginBottom: 12,
            }}
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              marginBottom: 16,
            }}
          >
            Common questions.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-slate)",
              lineHeight: 1.6,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Everything you need to know before your first assessment.
          </motion.p>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
              total={faqs.length}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
