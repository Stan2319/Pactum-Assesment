import type { TemplateConfig } from "./types"

// ── Email-workspace templates ──────────────────────────────────────
// Each anchors to a real role and an inbound message or context the
// candidate must respond to.

export const emailTemplates: TemplateConfig[] = [
  {
    key: "email-cold-outbound",
    label: "Cold Outbound",
    workspace: "email",
    title: "Sales: Cold outbound to a target account",
    role: "Sales Development Representative",
    tags: ["sales", "sdr", "outbound", "prospecting", "b2b", "email"],
    description:
      "You are an SDR at a developer-tooling SaaS company that cuts CI build times. You're prospecting Lena Ortiz, VP of Engineering at a 600-person fintech. Research notes: the company is hiring 12 engineers this quarter, their engineering blog recently complained about '40-minute CI runs killing flow', and they use a competitor's older CI product. You have never spoken to them. This is a first-touch cold email.",
    rounds: [
      {
        round: 1,
        title: "First-touch email",
        prompt:
          "Write the cold email to Lena. It must earn a reply: relevant, specific to her context, short, with a low-friction ask. Avoid generic flattery and feature dumps.",
        success_criteria:
          "References a specific, real signal (the 40-minute CI complaint or the hiring surge), not generic praise. Leads with her problem, not your product. Under ~120 words. Ends with one low-friction, specific ask (not 'do you have 30 minutes?'). No spammy clichés.",
      },
      {
        round: 2,
        title: "Subject lines & follow-up",
        prompt:
          "Write 3 subject-line options and a single short follow-up email to send if she doesn't reply in 4 days. The follow-up must add value, not just 'bumping this'.",
        success_criteria:
          "Subject lines are specific and non-clickbait; at least one references her context. The follow-up adds a new angle or proof point rather than nagging. Stays short. Does not guilt-trip or fake urgency.",
      },
    ],
  },
  {
    key: "email-pricing-pushback",
    label: "Pricing Pushback",
    workspace: "email",
    title: "Sales: Reply to a price objection",
    role: "Account Executive",
    tags: ["sales", "account-executive", "negotiation", "objection-handling", "b2b", "email"],
    description:
      "You are an AE in a late-stage deal (~$48k/year). The champion, a Director of Operations, just emailed: 'We love the product, but your quote is about 30% above [Competitor]. My CFO is asking why we'd pay the premium. Can you do better on price?' You have some discounting room (up to ~12%) but your real edge is implementation support and a proven integration that the competitor lacks, which the CFO cares about. You don't want to race to the bottom on price.",
    rounds: [
      {
        round: 1,
        title: "The reply",
        prompt:
          "Write the reply to the Director. Acknowledge the concern, reframe toward value and total cost rather than just conceding price, and arm the champion to defend the premium to their CFO.",
        success_criteria:
          "Acknowledges the objection without getting defensive. Reframes around value the CFO cares about (implementation, integration, risk), not just features. Equips the champion with a CFO-ready justification. Holds the line without flatly refusing to discuss price.",
      },
      {
        round: 2,
        title: "Concession with a trade",
        prompt:
          "Now suppose you decide to offer a modest concession. Write the part of the email that offers it in exchange for something (term length, case study, faster close) rather than giving it away. Keep it within your ~12% room.",
        success_criteria:
          "Any discount is traded for something of value (longer term, multi-year, reference, expedited signature), never given unconditionally. Stays within ~12%. Framed as a mutual deal, not capitulation. Keeps deal momentum toward a close date.",
      },
    ],
  },
  {
    key: "email-bug-report-reply",
    label: "Bug Report Reply",
    workspace: "email",
    title: "Support: Reply to an angry customer bug report",
    role: "Customer Support Specialist",
    tags: ["support", "customer-support", "bug", "de-escalation", "b2b", "email"],
    description:
      "You are a Support Specialist. A frustrated customer emailed: 'Your CSV export has been broken for THREE DAYS. I have a board meeting tomorrow and I can't get my data out. This is unacceptable. Either fix it now or I'm canceling.' Internally you've confirmed: a bug does affect CSV export for accounts with custom fields (a fix ships tonight), but there's a working manual workaround (export via the API or use the XLSX export). You cannot promise an exact fix time beyond 'tonight'.",
    rounds: [
      {
        round: 1,
        title: "The reply",
        prompt:
          "Write the reply. De-escalate genuinely, take ownership of the bug, give the customer the workaround so they're unblocked for tomorrow's board meeting, and set honest expectations on the fix. Don't over-promise.",
        success_criteria:
          "Opens by acknowledging the impact and owning the bug, not a canned apology. Immediately provides the concrete workaround (XLSX or API) so they're unblocked for the board meeting. Sets honest expectation on the fix ('tonight', no false precision). Calm and human, not defensive or robotic.",
      },
      {
        round: 2,
        title: "Follow-through",
        prompt:
          "Write the short follow-up email to send once the fix ships tonight, confirming resolution and rebuilding trust without grovelling or making new promises you can't keep.",
        success_criteria:
          "Confirms the fix is live and invites them to verify. Briefly notes what was done to prevent recurrence (if reasonable) without over-promising. Rebuilds trust without excessive apology. Closes the loop cleanly.",
      },
    ],
  },
  {
    key: "email-investor-update",
    label: "Investor Update",
    workspace: "email",
    title: "Founder: Monthly investor update",
    role: "Founder / CEO",
    tags: ["founder", "fundraising", "investor-relations", "startup", "metrics", "email"],
    description:
      "You are the founder of a 35-person Series A SaaS startup writing the monthly investor update. This month is mixed: MRR grew 9% to $410k, but gross churn spiked to 3.4% (from 2.1%) after a buggy release upset two large accounts (both retained after intervention). You closed a key VP of Sales hire. Runway is 14 months. You may need investor intros for two enterprise prospects. Good investor updates are honest about the bad, specific with numbers, and make clear asks.",
    rounds: [
      {
        round: 1,
        title: "The update",
        prompt:
          "Write the investor update: highlights, the churn problem (told straight, with what you're doing about it), key metrics (MRR, churn, runway), and the VP hire. Be transparent about the bad month without sounding panicked.",
        success_criteria:
          "Reports the metrics accurately (MRR $410k +9%, churn 3.4%, 14mo runway). Addresses the churn spike honestly with a concrete remediation, not spin. Balances good and bad credibly. Concise and scannable. Does not hide the problem or catastrophize it.",
      },
      {
        round: 2,
        title: "The ask",
        prompt:
          "Write the 'asks' section: the two enterprise intros you want and anything else investors can help with. Make each ask specific enough that an investor can act on it immediately.",
        success_criteria:
          "Asks are specific and actionable (named target type, why, what a warm intro unlocks), not 'let us know if you can help'. Limited to a few high-value asks. Makes it easy for a busy investor to say yes and act.",
      },
    ],
  },
  {
    key: "email-empathetic-rejection",
    label: "Candidate Rejection",
    workspace: "email",
    title: "Recruiting: Reject a final-round candidate",
    role: "Technical Recruiter",
    tags: ["recruiting", "talent", "candidate-experience", "rejection", "people", "email"],
    description:
      "You are a Technical Recruiter. A candidate reached the final onsite for a senior backend role and was strong, but the team chose another finalist who had deeper distributed-systems experience. This candidate invested significant time, was gracious throughout, and you'd genuinely want them to apply again in 6-12 months. Company policy: you may give light, honest directional feedback but must avoid anything legally risky or overly specific that invites debate.",
    rounds: [
      {
        round: 1,
        title: "The rejection",
        prompt:
          "Write the rejection email. Be warm and human, deliver the 'no' clearly and early, give honest light-touch feedback, and leave a genuine door open for the future. Avoid false hope and corporate boilerplate.",
        success_criteria:
          "Delivers the decision clearly and early, not buried. Tone is warm and respectful of their time investment. Feedback is honest but light and non-debatable (relative experience fit), not a performance critique. Door is left open sincerely, not as a platitude. No legal-risk specifics.",
      },
    ],
  },
  {
    key: "email-bd-intro",
    label: "Partner Outreach",
    workspace: "email",
    title: "Partnerships: Warm intro to a potential partner",
    role: "Partnerships Manager",
    tags: ["partnerships", "bizdev", "outreach", "integrations", "gtm", "email"],
    description:
      "You are a Partnerships Manager at a CRM SaaS company. A mutual contact agreed to introduce you to the Head of Partnerships at a popular e-signature product. The intro email is going out and you need to write the response that lands once they reply 'happy to chat, what did you have in mind?'. The opportunity: a native integration plus joint webinars; your customer bases overlap heavily in SMB. You want to be concrete enough to be taken seriously but not presumptuous about deal terms this early.",
    rounds: [
      {
        round: 1,
        title: "The reply",
        prompt:
          "Write the reply to their 'what did you have in mind?'. Establish credibility, articulate the mutual opportunity centered on their benefit, propose a concrete but low-pressure next step, and avoid over-specifying terms prematurely.",
        success_criteria:
          "Leads with mutual/partner value (overlapping SMB base) and a clear opportunity, not a hard pitch. Concrete enough to be credible (integration + joint webinars) without dictating terms. Proposes a specific, easy next step (a short call). Respects that it's early-stage.",
      },
    ],
  },
  {
    key: "email-deprecation-notice",
    label: "Deprecation Notice",
    workspace: "email",
    title: "Product: Announce an API deprecation",
    role: "Product Manager",
    tags: ["product", "pm", "api", "deprecation", "developer-comms", "email"],
    description:
      "You are a PM at a developer platform. You must email affected customers that v1 of your REST API will be deprecated in 90 days in favor of v2. Reality: ~300 accounts still call v1, including a few large ones; v2 has migration guides but requires real code changes; some endpoints changed shape. You need to communicate firmly (this IS happening) while minimizing churn and support load. Developers hate vague deprecation emails.",
    rounds: [
      {
        round: 1,
        title: "The announcement",
        prompt:
          "Write the deprecation email to affected developers. State the timeline and what's changing precisely, link the migration path, and make the firm-but-supportive tone clear. Don't sugarcoat the requirement, but reduce panic.",
        success_criteria:
          "States the 90-day timeline and the deprecation clearly up front. Is specific about what changes (endpoints, shape) rather than vague. Points to a concrete migration path and support. Tone is firm (it's happening) but supportive. Anticipates the developer's first question: 'what do I have to change?'",
      },
      {
        round: 2,
        title: "Large-account handling",
        prompt:
          "Write a tailored variant for the few large accounts that need white-glove help, offering hands-on migration support and a path to escalate, without promising an indefinite extension.",
        success_criteria:
          "Acknowledges their scale and offers concrete white-glove support (dedicated help, migration review). Provides an escalation path. Does NOT promise an open-ended extension that undermines the deadline. Preserves the relationship while holding the timeline.",
      },
    ],
  },
  {
    key: "email-exec-escalation",
    label: "Exec Escalation",
    workspace: "email",
    title: "Customer Success: Escalate an at-risk account",
    role: "Customer Success Manager",
    tags: ["customer-success", "escalation", "churn-risk", "internal-comms", "b2b", "email"],
    description:
      "You are a CSM. A $90k/year account is at serious renewal risk (renewal in 6 weeks). Signs: usage down 40% in two months, your champion left the company, the new stakeholder is a former user of a competitor, and two support tickets stalled. You need to escalate internally to your VP of CS and loop in the AE, asking for specific help (an exec sponsor, a roadmap conversation, possibly a commercial concession). This is an internal email, so it should be crisp and action-oriented.",
    rounds: [
      {
        round: 1,
        title: "The escalation",
        prompt:
          "Write the internal escalation email to your VP (cc the AE). Summarize the risk with evidence, your read on the root cause, what you've already tried, and the specific help you need. Make it easy to act on in 60 seconds.",
        success_criteria:
          "Leads with the stakes ($90k, 6 weeks) and a crisp risk summary backed by the signals (usage -40%, champion left, competitor history). States root-cause read and what's already been tried. Asks for specific, prioritized help (exec sponsor, roadmap call, concession). Scannable; no rambling.",
      },
    ],
  },
  {
    key: "email-upsell-expansion",
    label: "Expansion Pitch",
    workspace: "email",
    title: "Account Management: Propose an expansion",
    role: "Account Manager",
    tags: ["account-management", "expansion", "upsell", "renewal", "b2b", "email"],
    description:
      "You are an Account Manager. A healthy customer (currently 25 seats, $30k/year) is approaching renewal in 8 weeks. Their usage data shows: two new teams started using the product organically (now ~40 active users on 25 paid seats), and they've hit limits on a feature only available in your higher tier. You want to propose expanding seats and upgrading tiers at renewal, framed as value they're already getting, not a money grab. Your champion is friendly but budget-conscious.",
    rounds: [
      {
        round: 1,
        title: "The expansion email",
        prompt:
          "Write the expansion email to your champion. Lead with the value they're already realizing (organic adoption, hitting tier limits), propose the seat/tier expansion, and frame the budget conversation around ROI rather than cost. Keep it consultative.",
        success_criteria:
          "Opens with evidence of value already realized (40 users on 25 seats, tier limits hit), not a pitch. Proposes a specific expansion (seats + tier) tied to that usage. Frames spend as ROI for the budget-conscious champion. Consultative tone, not pushy. Connects to the renewal timing naturally.",
      },
    ],
  },
  {
    key: "email-vendor-negotiation",
    label: "Vendor Negotiation",
    workspace: "email",
    title: "Operations: Push back on a vendor renewal",
    role: "Procurement / Operations Manager",
    tags: ["operations", "procurement", "negotiation", "vendor-management", "cost", "email"],
    description:
      "You are an Operations Manager. A SaaS vendor you rely on (a data-enrichment tool, currently $36k/year) just sent a renewal with a 22% increase 'due to added value and usage growth'. Your actual usage is flat, you've had two notable outages this year, and a competitor quoted you ~15% less for comparable coverage. You'd prefer to stay (switching has a real migration cost) but not at a 22% hike. You're writing to your account rep to negotiate.",
    rounds: [
      {
        round: 1,
        title: "The negotiation email",
        prompt:
          "Write the email to the rep. Push back on the 22% increase with specific leverage (flat usage, the outages, the competitor quote), signal genuine willingness to stay, and propose your target outcome. Be firm and professional, not hostile.",
        success_criteria:
          "Pushes back using concrete leverage (flat usage, two outages, the ~15%-cheaper competitor quote) rather than just complaining. Signals real intent to renew if terms work. States a clear target (e.g. flat renewal or small decrease). Professional and firm; leaves room for the rep to say yes.",
      },
    ],
  },
  {
    key: "email-peer-feedback",
    label: "Performance Feedback",
    workspace: "email",
    title: "Engineering Management: Written feedback to a report",
    role: "Engineering Manager",
    tags: ["engineering-management", "feedback", "performance", "leadership", "people", "email"],
    description:
      "You are an Engineering Manager. One of your engineers, capable and well-liked, has missed three sprint commitments in a row. The pattern: he over-commits, goes quiet when stuck, and surfaces blockers too late. He is not a low performer overall, but this is becoming a team problem. You want to send written feedback ahead of your 1:1 so the conversation is grounded. The goal is to correct the pattern while keeping him motivated, not to write a warning.",
    rounds: [
      {
        round: 1,
        title: "The feedback",
        prompt:
          "Write the feedback email. Be specific about the pattern and its impact, separate the behavior from his worth as an engineer, and frame it as solvable. Make it a basis for the 1:1, not a verdict.",
        success_criteria:
          "Describes the specific behavior (over-commits, late on blockers) with examples, not character judgments. Names the team impact concretely. Affirms his value while being clear the pattern must change. Frames it as coachable and forward-looking. Sets up the 1:1 conversation rather than closing it down.",
      },
    ],
  },
  {
    key: "email-press-reply",
    label: "Press Reply",
    workspace: "email",
    title: "Communications: Respond to a journalist on an outage",
    role: "Communications / PR Manager",
    tags: ["communications", "pr", "media-relations", "crisis", "reputation", "email"],
    description:
      "You are a Comms Manager. A tech journalist emailed asking for comment on yesterday's 3-hour outage that affected ~15% of customers: 'Can you confirm the cause, how many customers were affected, and whether any data was compromised? On deadline in 2 hours.' Internally confirmed: cause was a failed database failover, ~15% of customers had degraded service (not full outage for all), no data was lost or compromised, and a fix plus prevention is in place. Legal wants accuracy; you want to be responsive and not look evasive.",
    rounds: [
      {
        round: 1,
        title: "The statement",
        prompt:
          "Write the on-the-record reply to the journalist. Be responsive and factual within what's confirmed, address the data-security question directly (the reader's real concern), and avoid both spin and admissions beyond the facts. Hit the deadline.",
        success_criteria:
          "Answers the concrete questions within confirmed facts (cause, ~15% affected, no data compromised). Directly reassures on data security, the key reader concern. Factual and calm; no spin, no speculation, no blame-shifting. Concise and quotable. Doesn't say 'no comment' or stonewall.",
      },
    ],
  },
  {
    key: "email-renewal-recap",
    label: "Renewal Value Recap",
    workspace: "email",
    title: "Customer Success: Renewal value recap",
    role: "Customer Success Manager",
    tags: ["customer-success", "renewal", "value", "retention", "b2b", "email"],
    description:
      "You are a CSM whose customer's annual renewal is 5 weeks out. The account ($54k/year) has been quiet but successful: over the past year they onboarded 3 departments, the product handled ~120k transactions for them, and a feature you advocated for shipped that they specifically requested. The new buyer-side contact joined 4 months ago and wasn't part of the original purchase, so they may not know the value delivered. You want to send a value-recap email that makes renewal feel obvious.",
    rounds: [
      {
        round: 1,
        title: "The recap",
        prompt:
          "Write the renewal value-recap email aimed at the newer contact. Recap the concrete value delivered over the year, connect it to their goals, and tee up the renewal conversation positively, without sounding like a hard sell.",
        success_criteria:
          "Surfaces concrete value the new contact may not know (3 departments onboarded, ~120k transactions, the requested feature shipped). Ties value to business outcomes, not usage trivia. Tees up renewal as a natural next step, not a pressured ask. Warm, partnership-oriented tone.",
      },
    ],
  },
  {
    key: "email-billing-dispute",
    label: "Billing Dispute",
    workspace: "email",
    title: "Finance Ops: Resolve a billing dispute",
    role: "Billing / Finance Operations Specialist",
    tags: ["finance", "billing", "operations", "dispute", "retention", "email"],
    description:
      "You are a Finance Ops Specialist. A customer emailed, upset: 'I was charged $2,400 twice this month. I want a refund immediately and an explanation.' You investigated: there was a genuine double-charge caused by a failed-then-retried payment on your side, the duplicate will be refunded (it takes 5-7 business days to appear), and you can offer a small credit for the inconvenience. The customer is otherwise valuable and not usually difficult. You need to resolve it cleanly and keep them.",
    rounds: [
      {
        round: 1,
        title: "The resolution",
        prompt:
          "Write the reply. Own the error plainly, explain what happened without jargon, state exactly what you're doing (refund + timeline + goodwill credit), and set the 5-7 day expectation clearly so they don't email again worried.",
        success_criteria:
          "Takes clear ownership of the double-charge, no deflection. Explains the cause simply. States the concrete resolution: full refund, the 5-7 business day timeline, and the goodwill credit. Sets expectations so the customer isn't left wondering. Tone rebuilds trust; keeps a valuable customer.",
      },
    ],
  },
]
