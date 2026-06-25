import type { TemplateConfig } from "./types"

// ── Doc / report-workspace templates ───────────────────────────────
// Each is anchored to a real job title and a document that role owns.

export const docTemplates: TemplateConfig[] = [
  {
    key: "doc-prd-feature",
    label: "Product PRD",
    workspace: "report",
    title: "Product: Write a PRD for a new feature",
    role: "Product Manager",
    tags: ["product", "pm", "prd", "spec", "b2b", "saas", "writing"],
    description:
      "You are a Product Manager at a 180-person B2B SaaS company (a customer support platform, ~$22M ARR). Support leaders keep asking for 'saved replies with variables', canned responses that auto-fill the customer's name, plan, and last order. Sales has flagged it in 3 lost deals this quarter. Engineering has roughly 3 sprints of capacity next quarter. You have usage data: 40% of replies are near-duplicates, median handle time is 7m12s, and the top 20 macros cover 55% of tickets.",
    rounds: [
      {
        round: 1,
        title: "Problem & goals",
        prompt:
          "Write the problem statement and goals section of the PRD. Define the problem in user terms, the measurable goals (tie to handle time and macro coverage), and explicit non-goals. State the target users and a one-sentence, falsifiable hypothesis.",
        success_criteria:
          "Problem is framed from the support agent's perspective, not the company's. At least two goals are measurable and reference the provided data (7m12s handle time or 55% macro coverage). Non-goals are present and specific. Hypothesis is a single falsifiable sentence.",
      },
      {
        round: 2,
        title: "Solution & scope",
        prompt:
          "Describe the proposed solution, the core user flow, and what ships in v1 vs. later given ~3 sprints of capacity. Call out the single riskiest assumption and how you would de-risk it before building.",
        success_criteria:
          "v1 scope is realistic for 3 sprints and explicitly defers nice-to-haves. The core flow is described step by step. The riskiest assumption is named with a concrete validation step (prototype, data check, or beta).",
      },
      {
        round: 3,
        title: "Success metrics & rollout",
        prompt:
          "Define how you measure success post-launch and the rollout plan: beta cohort, guardrail metrics, and kill criteria.",
        success_criteria:
          "Names a primary metric and at least one guardrail (e.g. CSAT must not drop). Rollout is staged with a defined beta cohort. Includes an explicit kill/rollback criterion.",
      },
    ],
  },
  {
    key: "doc-onboarding-plan",
    label: "Onboarding Plan",
    workspace: "report",
    title: "Customer Success: 90-day onboarding plan",
    role: "Implementation / Customer Success Manager",
    tags: ["customer-success", "onboarding", "implementation", "b2b", "saas", "writing"],
    description:
      "You are an Implementation Manager at a B2B analytics SaaS company. A new mid-market customer just signed a $60k/year contract. They are a 400-person logistics firm migrating off a tangle of spreadsheets and one part-time analyst. Their stated goal: a live executive dashboard and two trained power users within 90 days. Their exec sponsor is impatient and was skeptical during the sales cycle. You have a standard 6-week implementation playbook but this account needs a tailored plan.",
    rounds: [
      {
        round: 1,
        title: "Success plan",
        prompt:
          "Write the success plan: define what 'successful onboarding' means for this customer in concrete, verifiable terms, the named milestones across the 90 days, and who owns each (customer vs. your team). Tie milestones to the customer's stated goal.",
        success_criteria:
          "Success is defined in verifiable terms tied to the live dashboard and two trained power users. Milestones are time-bound across 90 days. Each milestone has a clear owner. The exec sponsor's skepticism is addressed with an early visible win.",
      },
      {
        round: 2,
        title: "Risks & mitigation",
        prompt:
          "Identify the top risks to on-time onboarding for this specific account and a mitigation for each. Include at least one data-migration risk and one stakeholder/adoption risk.",
        success_criteria:
          "Lists at least three specific risks, not generic ones. Includes a data-migration risk and a stakeholder/adoption risk. Each risk has a concrete, actionable mitigation, not 'communicate more'.",
      },
      {
        round: 3,
        title: "Executive summary",
        prompt:
          "Write a one-page executive summary the impatient sponsor can read in 2 minutes: the plan at a glance, the first win and when it lands, and what you need from them.",
        success_criteria:
          "Fits a single page and leads with the first win and its date. States exactly what is needed from the sponsor (people, data, decisions). Tone is confident and specific, not hedged.",
      },
    ],
  },
  {
    key: "doc-incident-postmortem",
    label: "Incident Postmortem",
    workspace: "report",
    title: "Engineering: Blameless incident postmortem",
    role: "Site Reliability Engineer",
    tags: ["engineering", "sre", "postmortem", "reliability", "incident", "writing"],
    description:
      "You are an SRE who just led the response to a production incident. Timeline: at 14:02 UTC the checkout API began returning 503s. Cause: a deploy raised the per-pod connection limit, and under afternoon peak the database connection pool (max 100) was exhausted; healthy pods could not acquire connections. Detection was slow, the first alert fired at 14:19 because the alert was on error rate, not pool saturation. Mitigation: rolled back the deploy at 14:41 and capacity recovered by 14:49. Total customer-facing impact: 47 minutes, an estimated 3,100 failed checkouts. No data was lost.",
    rounds: [
      {
        round: 1,
        title: "Timeline & impact",
        prompt:
          "Write the incident summary and timeline section. State the customer impact in plain terms up front, then a precise timeline with timestamps from detection through recovery. Keep it factual and blameless.",
        success_criteria:
          "Customer impact (47 min, ~3,100 failed checkouts, no data loss) is stated up front. Timeline includes the key timestamps (14:02, 14:19, 14:41, 14:49) in order. Language is blameless, describing systems and decisions, not individuals.",
      },
      {
        round: 2,
        title: "Root cause (5 whys)",
        prompt:
          "Write the root-cause analysis. Walk from the symptom to the underlying cause using a 5-whys chain. Distinguish the trigger (the deploy) from the deeper cause (why pool saturation was possible and undetected).",
        success_criteria:
          "Separates trigger from root cause. The 5-whys chain reaches a systemic cause (e.g. no pool-saturation alerting, no connection-limit review in deploy). Reasoning is logically connected at each step, not a list of unrelated facts.",
      },
      {
        round: 3,
        title: "Action items",
        prompt:
          "Write the action items. Each must be specific, assigned to a role, and prioritized. Include at least one detection improvement and one prevention improvement. Avoid vague 'be more careful' items.",
        success_criteria:
          "Includes a detection action (e.g. alert on pool saturation) and a prevention action (e.g. connection-limit check in CI). Each item is concrete, owned by a role, and prioritized. No vague or unactionable items.",
      },
    ],
  },
  {
    key: "doc-competitive-battlecard",
    label: "Sales Battlecard",
    workspace: "report",
    title: "Product Marketing: Competitive battlecard",
    role: "Product Marketing Manager",
    tags: ["product-marketing", "pmm", "battlecard", "competitive", "sales-enablement", "saas"],
    description:
      "You are a PMM at a mid-market HR software company (~$40M ARR). Your sales team keeps running into 'Brightpath', a cheaper, newer competitor that undercuts you by ~35% and markets aggressively on setup speed ('live in a week'). You win on depth: native payroll, a mature integrations marketplace, and SOC 2 + ISO compliance Brightpath lacks. But reps fumble the comparison on live calls. You are writing a one-page battlecard for the sales team.",
    rounds: [
      {
        round: 1,
        title: "Positioning & where we win",
        prompt:
          "Write the positioning section: a crisp 'how to frame us vs. Brightpath' statement and the 3 strongest, verifiable reasons a buyer chooses you. Anchor each to a concrete capability, not an adjective.",
        success_criteria:
          "Framing is a usable one-liner reps can say on a call. The 3 win reasons are concrete and verifiable (payroll, integrations marketplace, SOC 2/ISO), not vague claims like 'more robust'. Differentiation is tied to buyer value, not feature lists.",
      },
      {
        round: 2,
        title: "Objection handling",
        prompt:
          "Write objection-handling responses for the two objections reps hear most: 'Brightpath is 35% cheaper' and 'Brightpath says they go live in a week'. Reframe each toward total cost / risk rather than denying the claim.",
        success_criteria:
          "Addresses both objections without disparaging or denying facts. The price response reframes around total cost of ownership or risk (e.g. compliance, rework). The speed response acknowledges it and reframes around what 'live' actually requires. Responses are short enough to say aloud.",
      },
      {
        round: 3,
        title: "Landmines",
        prompt:
          "Write the 'landmines' section: 3 questions a rep can plant earlier in the deal that expose Brightpath's weaknesses without naming them negatively.",
        success_criteria:
          "Provides 3 buyer-facing questions that surface real Brightpath gaps (compliance, payroll depth, scaling). Questions are neutral and curiosity-framed, not smears. Each ties back to a strength you can then deliver on.",
      },
    ],
  },
  {
    key: "doc-okr-planning",
    label: "Company OKRs",
    workspace: "report",
    title: "Operations: Draft quarterly company OKRs",
    role: "Chief of Staff",
    tags: ["operations", "chief-of-staff", "okr", "strategy", "planning", "leadership"],
    description:
      "You are Chief of Staff at a 250-person SaaS company. The CEO has named three priorities for Q3: (1) reverse a slide in net revenue retention (NRR down from 112% to 104% over two quarters), (2) ship the long-delayed mobile app, and (3) get hiring back on plan after a slow Q2. Department leads tend to write fuzzy objectives and vanity key results. You are drafting the company-level OKR set to anchor the planning offsite.",
    rounds: [
      {
        round: 1,
        title: "Objectives",
        prompt:
          "Write 3 company objectives mapped to the CEO's three priorities. Each objective should be qualitative, ambitious, and memorable, not a metric. Explain in one line why each matters now.",
        success_criteria:
          "Exactly three objectives, each mapping cleanly to one CEO priority. Objectives are qualitative and directional, not metrics restated. Each has a one-line rationale grounded in the situation (e.g. the NRR decline).",
      },
      {
        round: 2,
        title: "Key results",
        prompt:
          "For each objective, write 2-3 key results. They must be measurable, outcome-based (not task lists), and have clear targets. For the NRR objective, include a target that would credibly move NRR back up.",
        success_criteria:
          "Every key result is measurable with a numeric target. KRs are outcomes, not activities ('ship X' is a task, not a KR). The NRR KRs are credibly tied to retention/expansion. No vanity metrics (e.g. raw activity counts with no outcome link).",
      },
      {
        round: 3,
        title: "Tradeoffs & focus",
        prompt:
          "Write a short tradeoffs section: what the company is explicitly NOT prioritizing this quarter to make these OKRs achievable, and where the biggest cross-team dependency or conflict will be.",
        success_criteria:
          "Names at least one explicit de-prioritization. Identifies a real cross-team dependency or resourcing conflict (e.g. eng split between mobile and retention work). Demonstrates that focus requires saying no, not just listing more goals.",
      },
    ],
  },
  {
    key: "doc-data-analysis-writeup",
    label: "Analysis Writeup",
    workspace: "report",
    title: "Data: Activation funnel drop writeup",
    role: "Data Analyst",
    tags: ["data", "analytics", "activation", "funnel", "writing", "saas"],
    description:
      "You are a Data Analyst at a product-led SaaS company. Self-serve signups grew 20% last month but activation (defined as 'created a first project and invited a teammate within 7 days') fell from 48% to 34%. You have the funnel: signup 100% -> verified email 91% -> created first project 61% -> invited teammate 34%. The biggest drop moved to the project-creation step after a UI redesign shipped on the 3rd. Mobile signups (now 38% of total, up from 22%) activate at less than half the desktop rate.",
    rounds: [
      {
        round: 1,
        title: "Findings",
        prompt:
          "Write the findings section. State what happened, where in the funnel the drop concentrated, and the two most likely contributing factors given the data (the redesign and the mobile mix shift). Quantify each where you can.",
        success_criteria:
          "Identifies the project-creation step as the main drop. Surfaces both the redesign timing and the mobile mix shift, with numbers (e.g. mobile now 38%, activates at <half desktop). Distinguishes correlation from proven cause.",
      },
      {
        round: 2,
        title: "Hypotheses & validation",
        prompt:
          "Write 2-3 testable hypotheses for the drop and, for each, the specific analysis or experiment that would confirm or kill it. Be explicit about what data you would pull.",
        success_criteria:
          "Hypotheses are distinct and testable (e.g. redesign hurt project creation; mobile UX is the bottleneck). Each has a concrete validation method (segment comparison, before/after on the redesign date, A/B test). Names the specific data needed.",
      },
      {
        round: 3,
        title: "Recommendation",
        prompt:
          "Write a recommendation for the product team: what to do now given uncertainty, framed by impact and confidence. Make a clear call rather than listing options.",
        success_criteria:
          "Makes an explicit recommendation, not a menu. Prioritizes by impact and confidence (e.g. roll back or A/B the redesign first as highest-confidence). Acknowledges what is still unknown without using it as an excuse to not decide.",
      },
    ],
  },
  {
    key: "doc-territory-plan",
    label: "Territory Plan",
    workspace: "report",
    title: "Sales: Territory and account plan",
    role: "Sales Manager",
    tags: ["sales", "territory-planning", "gtm", "quota", "b2b", "management"],
    description:
      "You are a Sales Manager building next year's territory plan for a 6-rep team selling a $25k-150k ACV B2B product. The company is pushing upmarket from SMB into mid-market. Reps' historical performance varies widely (top rep closed $2.1M, bottom closed $480k). You have ~1,800 accounts in your region, of which ~300 are mid-market targets. Total team quota next year is $9M, up from $6.2M attained this year.",
    rounds: [
      {
        round: 1,
        title: "Segmentation & coverage",
        prompt:
          "Write the segmentation and coverage model: how you divide the 1,800 accounts and assign them across 6 reps given the upmarket push. Explain the principle behind your split (e.g. by potential, geography, or named accounts) and why it fits the strategy.",
        success_criteria:
          "Presents a clear, defensible segmentation principle tied to the mid-market push. Accounts are allocated in a way that protects focus on the ~300 mid-market targets. Acknowledges rep skill differences in how high-value accounts are assigned.",
      },
      {
        round: 2,
        title: "Quota logic",
        prompt:
          "Write how you set per-rep quotas to sum to $9M. Decide whether quotas are equal or differentiated and justify it. Show the rough math and the reasoning, not just final numbers.",
        success_criteria:
          "Per-rep quotas sum to ~$9M. The equal-vs-differentiated choice is justified with reasoning (territory potential, ramp, fairness). Shows the math. Considers the risk of over-loading the top rep or setting up the bottom rep to fail.",
      },
      {
        round: 3,
        title: "Risks & first 90 days",
        prompt:
          "Identify the top risks in this plan and what you will do in the first 90 days to validate it is working, including a leading indicator you will watch.",
        success_criteria:
          "Names concrete risks (e.g. mid-market sales cycle is longer, reps lack upmarket motion). Defines a 90-day validation with a leading indicator (pipeline coverage, mid-market meetings booked), not just bookings. Shows the plan is adjustable.",
      },
    ],
  },
  {
    key: "doc-messaging-guide",
    label: "Messaging Guide",
    workspace: "report",
    title: "Marketing: Brand messaging guide",
    role: "Brand / Content Marketing Manager",
    tags: ["marketing", "brand", "messaging", "positioning", "content", "saas"],
    description:
      "You are a Brand Marketing Manager at a fintech SaaS company that just repositioned. The product began as 'expense tracking for startups' and now serves finance teams at 50-500 person companies with spend management, corporate cards, and close automation. The old messaging ('the easiest way to track expenses') now undersells the product and attracts the wrong buyers. Leadership wants a messaging guide so the website, sales deck, and content all tell one story.",
    rounds: [
      {
        round: 1,
        title: "Message pillars",
        prompt:
          "Write the core positioning statement and 3 message pillars for the repositioned product. Each pillar should capture a distinct value theme for finance teams (not startups) and be backed by a proof point.",
        success_criteria:
          "Positioning statement clearly targets finance teams at 50-500 person companies, not startups. Three distinct pillars with no overlap. Each pillar has a concrete proof point (capability or outcome), not just a slogan.",
      },
      {
        round: 2,
        title: "Voice & dos/don'ts",
        prompt:
          "Define the brand voice in 3-4 attributes and give a short dos-and-don'ts list with before/after examples that show the shift away from the old 'easy expense tracking' tone.",
        success_criteria:
          "Voice attributes are specific and would actually constrain writing (not 'friendly, professional'). Dos/don'ts include at least two before/after examples. Examples demonstrably move from the old positioning to the new one.",
      },
      {
        round: 3,
        title: "Applied example",
        prompt:
          "Apply the guide: rewrite the homepage hero headline + subhead and one paragraph of body copy in the new voice and positioning. Then note in one line why it fits the pillars.",
        success_criteria:
          "Hero and body copy reflect the new positioning (finance teams, spend management/close) and the defined voice. Copy is specific, not generic SaaS filler. The one-line rationale ties the copy back to a named pillar.",
      },
    ],
  },
  {
    key: "doc-partnership-proposal",
    label: "Partnership Proposal",
    workspace: "report",
    title: "Partnerships: Integration partnership proposal",
    role: "Partnerships Manager",
    tags: ["partnerships", "bizdev", "proposal", "integrations", "gtm", "saas"],
    description:
      "You are a Partnerships Manager at a project-management SaaS company (~$30M ARR). You want to propose a deeper integration partnership with a popular team-chat platform: a two-way integration plus co-marketing. Your mutual customer overlap is an estimated 8,000 accounts. The chat platform is bigger than you and gets dozens of partnership pitches a month, so the proposal has to make their upside obvious, not yours. Internally you will also need to justify the engineering cost (~1.5 quarters) to your VP.",
    rounds: [
      {
        round: 1,
        title: "Rationale & their upside",
        prompt:
          "Write the rationale section aimed at the partner: why this integration matters to THEIR users and business, backed by the overlap data and a clear user problem the integration solves. Lead with their benefit.",
        success_criteria:
          "Leads with the partner's upside (their user value, retention, or stickiness), not yours. Uses the 8,000-account overlap concretely. Names a specific user problem the two-way integration solves. Reads as written for a partner who gets dozens of pitches.",
      },
      {
        round: 2,
        title: "Deal structure",
        prompt:
          "Propose the partnership structure: integration scope (what's two-way), co-marketing commitments from each side, and how success is measured. Keep commitments balanced and realistic.",
        success_criteria:
          "Integration scope is concrete and bounded. Co-marketing commitments are specified for both sides and are balanced, not one-sided. Includes at least one shared success metric. Scope is realistic for ~1.5 quarters of eng.",
      },
      {
        round: 3,
        title: "Internal justification",
        prompt:
          "Write the short internal note to your VP justifying the ~1.5 quarters of engineering: expected return, the main risk, and what you'd cut if you only got one quarter.",
        success_criteria:
          "Frames expected return in business terms (pipeline, retention, or reach), not just 'a cool integration'. States the main risk honestly (partner may deprioritize). Includes a reduced-scope fallback for one quarter, showing prioritization.",
      },
    ],
  },
  {
    key: "doc-research-synthesis",
    label: "Research Synthesis",
    workspace: "report",
    title: "UX Research: Churn interview synthesis",
    role: "UX Researcher",
    tags: ["ux-research", "research", "churn", "synthesis", "product", "writing"],
    description:
      "You are a UX Researcher who ran 8 interviews with recently churned customers of a B2B scheduling product. Recurring threads: 5 of 8 said the product 'got more complicated' after a redesign; 4 mentioned a specific competitor with simpler recurring-booking; 3 said they 'never got it set up properly' and blamed thin onboarding; 2 left purely on price. The product team is divided: some think it's a pricing problem, others a UX problem. You are writing the synthesis that will settle the direction.",
    rounds: [
      {
        round: 1,
        title: "Themes",
        prompt:
          "Write the themes section: cluster the 8 interviews into the dominant themes with the rough count behind each, ranked by how strongly the evidence supports them. Be honest about a small-n sample.",
        success_criteria:
          "Themes are clustered with counts (e.g. complexity 5/8, competitor pull 4/8). Ranked by evidence strength. Explicitly notes the limits of n=8 rather than overclaiming. Separates the dominant complexity/onboarding signal from the minority price signal.",
      },
      {
        round: 2,
        title: "Evidence",
        prompt:
          "For the top two themes, present the supporting evidence in a way that would convince a skeptical PM, including the kind of representative quote or behavior pattern you'd cite (you may paraphrase plausibly from the setup).",
        success_criteria:
          "Top two themes are backed with specific, credible evidence and representative quotes/patterns. Evidence maps to the interview facts given. Distinguishes what customers said from what it implies, avoiding leading interpretation.",
      },
      {
        round: 3,
        title: "Opportunities",
        prompt:
          "Translate the findings into 2-3 prioritized opportunities for the product team and take a clear position on the pricing-vs-UX debate based on the evidence.",
        success_criteria:
          "Takes an explicit position (evidence points more to UX/onboarding than price) and justifies it. Opportunities are specific and prioritized. Does not simply restate themes; converts them into actionable directions.",
      },
    ],
  },
  {
    key: "doc-pricing-memo",
    label: "Pricing Memo",
    workspace: "report",
    title: "Finance: Usage-based pricing recommendation",
    role: "Finance / Pricing Manager",
    tags: ["finance", "pricing", "strategy", "saas", "monetization", "memo"],
    description:
      "You are a Pricing Manager at a B2B API company (~$15M ARR) currently on flat per-seat pricing. Heavy-usage customers are massively underpaying relative to the infrastructure cost they drive (your top 10% of accounts by API calls generate 60% of compute cost but only 22% of revenue), while light users feel they overpay. Leadership is considering a move to usage-based pricing but worries about revenue predictability and customer backlash. You are writing the recommendation memo for the exec team.",
    rounds: [
      {
        round: 1,
        title: "Analysis",
        prompt:
          "Write the analysis section: lay out the problem with the current model using the cost/revenue mismatch data, and what usage-based pricing would change for the three customer segments (heavy, mid, light).",
        success_criteria:
          "Quantifies the current mismatch (top 10% = 60% of cost, 22% of revenue). Walks through the impact on heavy/mid/light segments distinctly. Distinguishes margin problems from growth problems. Avoids assuming the conclusion before the analysis.",
      },
      {
        round: 2,
        title: "Recommendation",
        prompt:
          "Make a clear recommendation: stay flat, go fully usage-based, or a hybrid. Justify with the data and propose the rough pricing structure. Take a position.",
        success_criteria:
          "Makes an explicit, single recommendation (a hybrid is a valid choice if justified). Proposed structure is concrete enough to model. Justification ties directly to the segment analysis. Addresses the margin problem the heavy users create.",
      },
      {
        round: 3,
        title: "Risks & migration",
        prompt:
          "Address the exec team's two fears: revenue predictability and customer backlash. Propose how you'd migrate existing customers (grandfathering, caps, communication) to limit churn.",
        success_criteria:
          "Directly addresses revenue predictability (e.g. commitments, minimums) and backlash (grandfathering, phased migration, clear comms). Migration plan is concrete and sequenced. Acknowledges the customers most likely to churn and how to retain them.",
      },
    ],
  },
  {
    key: "doc-recruiting-strategy",
    label: "Hiring Plan",
    workspace: "report",
    title: "Recruiting: Engineering hiring strategy",
    role: "Technical Recruiter",
    tags: ["recruiting", "talent", "hiring", "engineering", "planning", "people"],
    description:
      "You are a Technical Recruiter tasked with filling 5 engineering roles (2 senior backend, 1 staff platform, 2 mid-level full-stack) over the next two quarters at a 150-person SaaS company. Last year time-to-hire averaged 71 days and the offer-accept rate was 58% (lost candidates mostly to comp and slow process). The hiring managers are busy and slow on feedback. You have a modest sourcing budget and one coordinator. You're writing the hiring plan to align recruiting and the eng leads.",
    rounds: [
      {
        round: 1,
        title: "Sourcing strategy",
        prompt:
          "Write the sourcing strategy across the 5 roles: where the candidates will come from for each role type, what you'll prioritize given a modest budget, and how you'll handle the hard-to-fill staff platform role differently.",
        success_criteria:
          "Sourcing channels are matched to role type (e.g. staff platform needs targeted outbound, not job boards). Prioritization reflects the modest budget. The staff role is treated as distinctly harder with a specific approach. Avoids 'post and pray'.",
      },
      {
        round: 2,
        title: "Funnel math",
        prompt:
          "Build the funnel math: given 5 hires needed and the 58% accept rate, estimate how many candidates you need at each stage (sourced, screened, onsite, offer) to hit the goal in two quarters. State your assumptions.",
        success_criteria:
          "Works backward from 5 hires through realistic stage conversion rates to a sourcing target. Uses the 58% accept rate. Assumptions are stated and reasonable. The math actually supports hitting 5 hires in the window, or flags if it doesn't.",
      },
      {
        round: 3,
        title: "Process fixes",
        prompt:
          "Propose fixes for the two biggest leaks, slow hiring-manager feedback and the 58% accept rate, with specific changes to process or comp positioning. Make the asks of hiring managers explicit.",
        success_criteria:
          "Targets both named leaks specifically. Feedback fix includes a concrete SLA or mechanism. Accept-rate fix addresses comp and/or process speed with real levers. Makes explicit, reasonable asks of the busy hiring managers.",
      },
    ],
  },
  {
    key: "doc-internal-change-comms",
    label: "Change Announcement",
    workspace: "report",
    title: "People: Internal change announcement",
    role: "People / HR Business Partner",
    tags: ["people", "hr", "internal-comms", "change-management", "writing", "leadership"],
    description:
      "You are a People Business Partner at a 300-person company. Leadership has decided to move from fully remote to a hybrid policy: 2 in-office days per week (Tuesday/Thursday) starting in 8 weeks, for everyone within 50 miles of an office. The decision is final, but morale risk is real, many people were hired as remote. Leadership wants the announcement to be honest about the 'why', avoid corporate doublespeak, and not pretend it's optional. You are drafting the all-company announcement and FAQ.",
    rounds: [
      {
        round: 1,
        title: "The announcement",
        prompt:
          "Write the all-company announcement: state the change and timeline clearly up front, give the honest reasoning, and acknowledge the impact on people hired as remote. Do not bury the lede or use euphemisms.",
        success_criteria:
          "States the change (2 days, Tue/Thu, 8 weeks, within 50 miles) clearly in the first lines. Gives genuine reasoning, not platitudes. Acknowledges the real impact on remote-hired staff honestly. Does not pretend the policy is optional.",
      },
      {
        round: 2,
        title: "Rationale depth",
        prompt:
          "Expand the rationale: give the specific reasons leadership made this call and the alternatives considered, so people feel the decision was reasoned rather than arbitrary, without over-justifying or sounding defensive.",
        success_criteria:
          "Provides specific, plausible reasons (collaboration, onboarding, culture) tied to evidence rather than vague belief. Mentions at least one alternative considered. Tone is confident and reasoned, neither defensive nor dismissive of concerns.",
      },
      {
        round: 3,
        title: "FAQ",
        prompt:
          "Write 5-6 FAQ entries covering the questions people will actually ask (edge cases on the 50-mile rule, exceptions, what happens if I refuse, equipment/commute support). Answer plainly, including the hard ones.",
        success_criteria:
          "Covers genuinely hard questions, including consequences of non-compliance and edge cases (distance, exceptions, accommodations). Answers are direct and don't dodge. Doesn't invent generous policies not implied; flags where 'talk to your manager' is the honest answer.",
      },
    ],
  },
  {
    key: "doc-rfp-response",
    label: "RFP Response",
    workspace: "report",
    title: "Solutions Engineering: Security RFP response",
    role: "Solutions / Sales Engineer",
    tags: ["solutions-engineering", "rfp", "security", "enterprise", "pre-sales", "writing"],
    description:
      "You are a Solutions Engineer supporting a large enterprise deal. The prospect's procurement team sent an RFP section on security and scalability. The hard questions: (1) 'Describe your data isolation model for multi-tenant architecture'; (2) 'What is your demonstrated throughput and how do you scale under load?'; (3) 'Detail your incident response and breach notification process'. Your product is genuinely strong on (1) and (3) but on (2) your largest reference customer runs ~4,000 req/s and you have not publicly load-tested beyond that. You must answer credibly without overstating.",
    rounds: [
      {
        round: 1,
        title: "Technical answers",
        prompt:
          "Write clear, technically credible answers to the data-isolation and incident-response questions. Be specific about the architecture and process; assume a technical evaluator who will spot hand-waving.",
        success_criteria:
          "Data-isolation answer describes a concrete model (e.g. tenant-scoped keys, row-level isolation, separate schemas) rather than 'we take security seriously'. Incident-response answer includes detection, escalation, and a notification timeline. Specific enough to satisfy a technical reviewer.",
      },
      {
        round: 2,
        title: "Honest scalability answer",
        prompt:
          "Answer the throughput/scalability question honestly given you have not load-tested beyond ~4,000 req/s. Present real evidence, frame the architecture's scaling path, and avoid claiming numbers you can't back.",
        success_criteria:
          "States the real reference figure (~4,000 req/s) rather than inventing one. Explains the scaling approach (horizontal scaling, where the limits are) credibly. Offers a path to validate higher load (a POC or load test) instead of overstating. Builds trust rather than risking a failed audit later.",
      },
      {
        round: 3,
        title: "Differentiation & risk framing",
        prompt:
          "Write a brief closing that frames your security/compliance strengths as a differentiator and reframes the unproven-at-scale point as a manageable, jointly-owned risk rather than a gap.",
        success_criteria:
          "Frames isolation and incident-response strengths as concrete differentiators tied to buyer risk reduction. Reframes the scale question as a manageable, mitigated risk (e.g. proposed joint load test) without dishonesty. Closes with a confident, specific next step.",
      },
    ],
  },
]
