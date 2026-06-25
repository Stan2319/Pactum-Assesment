import type { TemplateConfig } from "./types"

// ── Deck-workspace templates ───────────────────────────────────────
// Each anchors to a real role and a presentation that role builds.

export const deckTemplates: TemplateConfig[] = [
  {
    key: "deck-board-update",
    label: "Board Update",
    workspace: "deck",
    title: "Leadership: Quarterly board update deck",
    role: "CEO / Chief of Staff",
    tags: ["leadership", "board", "deck", "metrics", "strategy", "executive"],
    description:
      "You are preparing the quarterly board deck for a Series B SaaS company. The quarter: ARR grew to $14.2M (+11% QoQ), but net revenue retention slipped to 103% and a key enterprise launch slipped a quarter. Cash is $22M, ~20 months runway. You're hiring a CRO. The board is sophisticated and dislikes spin; they want the real picture, the plan, and clear asks.",
    rounds: [
      {
        round: 1,
        title: "Scorecard & narrative",
        prompt:
          "Build the opening: a metrics scorecard slide (ARR, growth, NRR, cash/runway) and a 'state of the business' narrative slide that tells the honest story, wins and misses together. One idea per slide.",
        success_criteria:
          "Scorecard shows the key numbers ($14.2M ARR, +11%, NRR 103%, runway) clearly. Narrative is honest about the NRR slip and the slipped launch, not buried. One clear point per slide. No spin; board-appropriate candor.",
      },
      {
        round: 2,
        title: "The problem & plan",
        prompt:
          "Build slides on the biggest issue (NRR decline) and the plan to fix it: root cause, the specific actions, and how you'll measure success next quarter.",
        success_criteria:
          "Diagnoses the NRR slip with a credible root cause, not a vague worry. Lays out specific actions and an owner/timeline. States the metric that proves progress. Reads as a leader in control, not surprised by their own numbers.",
      },
      {
        round: 3,
        title: "Asks",
        prompt:
          "Build the closing 'asks of the board' slide: where you genuinely need their help (CRO candidates, intros, a strategic decision). Make each ask specific and actionable.",
        success_criteria:
          "Asks are specific and board-actionable (CRO referrals, customer intros, a decision to ratify), not 'any feedback welcome'. Limited to a few high-value asks. Closes the deck with direction, not a data dump.",
      },
    ],
  },
  {
    key: "deck-fundraise",
    label: "Fundraise Pitch",
    workspace: "deck",
    title: "Founder: Seed-to-Series-A pitch deck",
    role: "Founder",
    tags: ["founder", "fundraising", "pitch", "deck", "startup", "investors"],
    description:
      "You are a founder raising a Series A. Your company sells AI-assisted contract review to mid-market legal teams. Traction: $2.1M ARR, growing 14% MoM for 6 months, 40 customers, net revenue retention 128%, two lighthouse logos. You're raising $12M to scale go-to-market. You'll pitch partners who see hundreds of decks; the story has to be tight and the numbers have to lead.",
    rounds: [
      {
        round: 1,
        title: "Problem, solution, why now",
        prompt:
          "Build the first three slides: the problem (sharp and real for legal teams), the solution (what you do, simply), and 'why now' (what changed that makes this possible/urgent). No jargon, no fluff.",
        success_criteria:
          "Problem is specific and felt by mid-market legal teams, not generic. Solution is explained in one clear idea, not a feature list. 'Why now' names a real shift (AI capability, market timing). Each slide makes one point an investor remembers.",
      },
      {
        round: 2,
        title: "Traction & market",
        prompt:
          "Build the traction slide (let the numbers lead: ARR, growth, NRR, logos) and a market-size slide that's credible, not a hand-wavy '$50B TAM'. Show why this is a venture-scale outcome.",
        success_criteria:
          "Traction slide foregrounds the strongest metrics ($2.1M ARR, 14% MoM, 128% NRR) cleanly. Market sizing is bottom-up and credible, not a top-down trillion-dollar claim. Together they make the venture-scale case honestly.",
      },
      {
        round: 3,
        title: "The ask & use of funds",
        prompt:
          "Build the ask slide: how much you're raising ($12M), what it buys (specific milestones), and the next-stage metrics you'll hit. Make the use of funds concrete.",
        success_criteria:
          "States the $12M ask and ties it to specific milestones (GTM hires, ARR target, new segments). Use of funds is concrete, not 'engineering and marketing'. Names the next-round metrics this capital should produce. Confident and specific.",
      },
    ],
  },
  {
    key: "deck-sales-demo",
    label: "Sales Demo Deck",
    workspace: "deck",
    title: "Sales: Tailored demo deck for a prospect",
    role: "Account Executive",
    tags: ["sales", "account-executive", "demo", "deck", "b2b", "discovery"],
    description:
      "You are an AE building a tailored deck for a discovery-to-demo meeting with a prospect: a 800-person retailer evaluating your inventory-management platform. From discovery you learned: their pain is stockouts during promotions (cost them an estimated $1.2M last year), they have 3 disconnected systems, and the VP of Supply Chain is the economic buyer but a skeptical ops lead is in the room. Generic product tours lose deals; this must speak to their problem.",
    rounds: [
      {
        round: 1,
        title: "Their problem, their words",
        prompt:
          "Build the opening slides that prove you understood discovery: restate their specific problem (promo stockouts, $1.2M, 3 disconnected systems) and the cost of inaction, before showing any product. Earn the right to demo.",
        success_criteria:
          "Restates the prospect's specific situation and the $1.2M cost, not a generic problem slide. Frames the cost of inaction. Leads with their world, not your product. Signals genuine discovery, which builds trust with the skeptical ops lead.",
      },
      {
        round: 2,
        title: "Solution mapped to pain",
        prompt:
          "Build the solution slides that map your capabilities directly to their three pain points. For each pain, show the specific outcome, not a feature tour. Address the skeptical ops lead's likely 'will this actually work here?' concern.",
        success_criteria:
          "Each capability is tied to one of their stated pains (stockouts, disconnected systems), framed as an outcome. Avoids a generic feature parade. Proactively addresses implementation/feasibility doubt for the skeptical ops lead.",
      },
      {
        round: 3,
        title: "Proof & next step",
        prompt:
          "Build the proof slide (a relevant customer result) and a clear next-step slide (a mutual action plan toward a decision). Make the close specific to the buyer's process.",
        success_criteria:
          "Proof is relevant to retail/supply-chain, with a concrete result, not a logo wall. Next-step slide proposes a specific mutual action plan (e.g. pilot scope, success criteria, timeline) aimed at the VP's decision process. Drives momentum.",
      },
    ],
  },
  {
    key: "deck-all-hands",
    label: "All-Hands Deck",
    workspace: "deck",
    title: "People: Monthly all-hands deck",
    role: "People / Operations Lead",
    tags: ["people", "operations", "all-hands", "internal-comms", "deck", "culture"],
    description:
      "You are preparing the monthly all-hands for a 220-person company. This month's context: the company hit a major product milestone, but also had to pause one team's project due to a strategy shift, which has people nervous about layoffs (there are none planned). You want the all-hands to celebrate the win, address the anxiety honestly, and refocus everyone on priorities, without being either falsely cheery or alarming.",
    rounds: [
      {
        round: 1,
        title: "Wins & recognition",
        prompt:
          "Build the opening: the milestone win told in a way that connects individual work to company impact, plus specific recognition. Make it genuine, not corporate cheerleading.",
        success_criteria:
          "Celebrates the milestone concretely and connects it to company goals. Recognition is specific (teams/contributions), not generic praise. Tone is genuine and energizing without being saccharine.",
      },
      {
        round: 2,
        title: "Address the elephant",
        prompt:
          "Build the slide(s) addressing the paused project and layoff anxiety head-on: explain the strategy shift, state plainly that no layoffs are planned, and what happens to the affected team. Don't dodge or over-reassure.",
        success_criteria:
          "Names the paused project and explains the strategy shift honestly. States clearly there are no layoffs planned, without making promises that could later break. Says what happens to the affected team (reassignment). Directly reduces anxiety with candor, not spin.",
      },
      {
        round: 3,
        title: "Refocus",
        prompt:
          "Build the closing: the top 2-3 priorities for the next month and what you're asking everyone to focus on, so people leave aligned rather than anxious.",
        success_criteria:
          "Names a short, clear set of priorities (not ten things). Connects them to the strategy shift so the pause makes sense. Ends on direction and alignment. Leaves people focused, not worried.",
      },
    ],
  },
  {
    key: "deck-roadmap-review",
    label: "Roadmap Review",
    workspace: "deck",
    title: "Product: Quarterly roadmap review deck",
    role: "Product Manager",
    tags: ["product", "pm", "roadmap", "deck", "planning", "stakeholders"],
    description:
      "You are a PM presenting the quarterly roadmap review to cross-functional stakeholders (sales, CS, eng, exec). Last quarter you shipped 4 of 6 planned items; two slipped. Sales wants more enterprise features; CS wants reliability/bug work; eng wants to pay down tech debt. You can't do it all. The deck must show what shipped, set next quarter's priorities with a clear rationale, and manage competing demands without pleasing everyone.",
    rounds: [
      {
        round: 1,
        title: "What shipped & what slipped",
        prompt:
          "Build the retro slides: what shipped and its impact, and an honest account of the two slipped items, why, and what you learned, without excuses.",
        success_criteria:
          "Shows shipped work with impact, not just a checklist. Addresses the two slips honestly with real reasons and a lesson. Avoids both blame and excuse-making. Builds credibility for the forward plan.",
      },
      {
        round: 2,
        title: "Next quarter priorities",
        prompt:
          "Build the priorities slide: the ranked roadmap for next quarter and the rationale that ties each item to a goal (revenue, retention, or stability). Make the prioritization logic explicit.",
        success_criteria:
          "Roadmap is ranked, not a flat wishlist. Each item maps to a business goal. The prioritization framework is explicit (e.g. weighing enterprise revenue vs. reliability). Shows deliberate choices, not 'everything is P1'.",
      },
      {
        round: 3,
        title: "Tradeoffs & the 'no'",
        prompt:
          "Build the tradeoffs slide that addresses the competing asks from sales, CS, and eng directly: what you're NOT doing and why, so stakeholders feel heard even when they don't get their item.",
        success_criteria:
          "Explicitly states what's deferred (some enterprise asks, some tech debt) and the reasoning. Acknowledges each stakeholder group's request so they feel heard. Defends the 'no' with logic, not politics. Manages expectations honestly.",
      },
    ],
  },
  {
    key: "deck-onboarding-kickoff",
    label: "Kickoff Deck",
    workspace: "deck",
    title: "Customer Success: New-customer kickoff deck",
    role: "Customer Success Manager",
    tags: ["customer-success", "onboarding", "kickoff", "deck", "b2b", "implementation"],
    description:
      "You are a CSM running the kickoff meeting for a newly closed customer ($75k/year, a 250-person company adopting your HR platform). Attendees: their project sponsor (VP People), two admins who'll do the work, and an IT contact. Goal of the kickoff: align on success criteria, set the implementation timeline, clarify roles, and build confidence. A weak kickoff sets up a rocky onboarding.",
    rounds: [
      {
        round: 1,
        title: "Success criteria & timeline",
        prompt:
          "Build the alignment slides: a 'what success looks like in 90 days' slide tied to their goals, and an implementation timeline with phases and key dates. Make success measurable and the timeline realistic.",
        success_criteria:
          "Success criteria are measurable and tied to the customer's goals, agreed not assumed. Timeline is phased with concrete milestones and dates. Realistic, not an aggressive fantasy. Sets shared expectations from day one.",
      },
      {
        round: 2,
        title: "Roles & responsibilities",
        prompt:
          "Build the RACI-style slide clarifying who does what across their team and yours (sponsor, admins, IT, CSM). Make ownership unambiguous so nothing falls through the cracks.",
        success_criteria:
          "Roles are clearly assigned across both teams for each workstream. Distinguishes sponsor vs. admin vs. IT responsibilities. No ambiguous ownership. Surfaces dependencies (e.g. IT for SSO) early.",
      },
      {
        round: 3,
        title: "Confidence & first step",
        prompt:
          "Build the closing slide that builds confidence (why this will go well) and the immediate next step they need to take this week. End the kickoff with momentum.",
        success_criteria:
          "Instills confidence with something concrete (proven process, early quick win), not just enthusiasm. States a specific next action with an owner and date. Leaves the customer clear on exactly what happens next.",
      },
    ],
  },
  {
    key: "deck-campaign-plan",
    label: "Campaign Plan",
    workspace: "deck",
    title: "Marketing: Integrated campaign plan deck",
    role: "Marketing Manager",
    tags: ["marketing", "campaign", "demand-gen", "deck", "planning", "gtm"],
    description:
      "You are a Marketing Manager presenting a campaign plan to launch a new product module to existing and new customers. Budget: $180k for the quarter. Goal: 400 qualified leads and $1.2M in influenced pipeline. Channels available: paid search, content, webinars, email, and a partner co-marketing push. You need exec sign-off, so the deck must show strategy, channel plan, budget allocation, and how you'll measure success.",
    rounds: [
      {
        round: 1,
        title: "Strategy & audience",
        prompt:
          "Build the strategy slides: the campaign's core message, the target audiences (new vs. existing customers), and the big idea that ties it together. Make the positioning sharp.",
        success_criteria:
          "Core message is sharp and tied to the new module's value. Distinguishes the new-customer and existing-customer audiences with different angles. The 'big idea' is more than a tagline; it gives the campaign coherence.",
      },
      {
        round: 2,
        title: "Channel plan & budget",
        prompt:
          "Build the channel and budget slide: how the $180k splits across channels, the role of each channel in the funnel, and the expected contribution to the 400-lead / $1.2M goal. Show the math is plausible.",
        success_criteria:
          "Budget allocates across channels with a rationale (each channel's funnel role). Expected lead/pipeline contribution is estimated per channel and sums toward the goal. The plan is plausible, not a wishlist; tradeoffs are visible.",
      },
      {
        round: 3,
        title: "Measurement",
        prompt:
          "Build the measurement slide: the KPIs you'll track, the leading indicators you'll watch early, and how you'll know within 30 days whether to double down or cut a channel.",
        success_criteria:
          "Names primary KPIs (leads, influenced pipeline) and leading indicators (CTR, MQL rate) that give an early read. Defines a 30-day checkpoint and the criteria to reallocate budget. Shows the plan is adaptive, not set-and-forget.",
      },
    ],
  },
  {
    key: "deck-eng-retro",
    label: "Engineering Retro",
    workspace: "deck",
    title: "Engineering: Quarterly retro deck",
    role: "Engineering Manager",
    tags: ["engineering-management", "retrospective", "deck", "delivery", "process", "team"],
    description:
      "You are an EM presenting your team's quarterly retrospective to engineering leadership. The quarter: shipped the major reliability initiative (cut incidents 40%), but velocity dropped and one project ran 6 weeks over. Causes you've identified: too much unplanned support work, an under-scoped project, and onboarding two new hires. You want to present an honest retro that drives real process changes, not a status update.",
    rounds: [
      {
        round: 1,
        title: "Outcomes",
        prompt:
          "Build the outcomes slides: what the team delivered and its impact (the reliability win), and an honest view of where delivery fell short (velocity, the 6-week overrun). Use data where you can.",
        success_criteria:
          "Quantifies the reliability win (incidents −40%) and the delivery miss (6-week overrun). Honest about both. Uses data, not vibes. Frames outcomes for an audience that wants substance, not a highlight reel.",
      },
      {
        round: 2,
        title: "Root causes",
        prompt:
          "Build the analysis slide: the root causes behind the velocity drop and overrun (unplanned support, under-scoping, onboarding load), distinguishing one-off causes from systemic ones.",
        success_criteria:
          "Identifies the real causes and separates one-off (onboarding ramp) from systemic (unplanned support, weak scoping). Avoids blaming individuals. Analysis is specific enough to act on.",
      },
      {
        round: 3,
        title: "Changes",
        prompt:
          "Build the action slide: 2-3 concrete process changes for next quarter, each tied to a root cause, with an owner and how you'll know it worked.",
        success_criteria:
          "Each change maps to a named root cause (e.g. support rotation to contain unplanned work, a scoping checkpoint). Has an owner and a success signal. Concrete and few, not a long vague list. Drives change, not just reflection.",
      },
    ],
  },
  {
    key: "deck-annual-strategy",
    label: "Annual Strategy",
    workspace: "deck",
    title: "Strategy: Annual strategy deck",
    role: "Strategy / Business Operations Lead",
    tags: ["strategy", "bizops", "planning", "deck", "executive", "annual"],
    description:
      "You are a Strategy lead building the annual strategy deck for the leadership team. Context: the company ($45M ARR) has grown fast but unfocused, chasing three segments at once (SMB, mid-market, enterprise) and winning in none decisively. Data shows mid-market has the best win rate (32%) and retention (NRR 119%). Leadership is divided on whether to focus or keep hedging. Your deck should make the case for a sharper strategy.",
    rounds: [
      {
        round: 1,
        title: "Where we are",
        prompt:
          "Build the situation slides: an honest assessment of the 'winning in none' problem, backed by the segment data (win rates, retention), so leadership confronts the cost of being unfocused.",
        success_criteria:
          "Lays out the current state honestly using the segment data (mid-market 32% win, 119% NRR vs. weaker others). Makes the cost of spreading thin tangible. Sets up the strategic question without prematurely answering it.",
      },
      {
        round: 2,
        title: "The strategic choice",
        prompt:
          "Build the recommendation slides: make the case for focusing on mid-market, what that means concretely (product, GTM, who you'd say no to), and the upside if it works. Take a clear position.",
        success_criteria:
          "Takes an explicit position (focus on mid-market) justified by the data. Spells out what focus means across product and GTM and what gets de-prioritized. Quantifies the upside. Doesn't hedge into 'do everything better'.",
      },
      {
        round: 3,
        title: "Risks & path",
        prompt:
          "Build the risk and roadmap slide: the main risks of focusing (giving up enterprise whales, SMB volume), how you'd mitigate them, and the phased path to execute over the year.",
        success_criteria:
          "Names the real risks of focus honestly (lost enterprise deals, SMB revenue) and credible mitigations. Lays out a phased execution path, not a big-bang change. Shows the strategy is executable and the risks are managed, not ignored.",
      },
    ],
  },
  {
    key: "deck-partnership",
    label: "Partnership Deck",
    workspace: "deck",
    title: "Partnerships: Partner pitch deck",
    role: "Partnerships Manager",
    tags: ["partnerships", "bizdev", "deck", "gtm", "integrations", "co-marketing"],
    description:
      "You are a Partnerships Manager pitching a potential channel partner: a consultancy that implements ERP systems for mid-market manufacturers. You want them to resell and implement your add-on analytics product. Their incentive: services revenue and stickier clients. Your incentive: distribution into a segment you can't reach directly. The deck pitches the partner's leadership, who care about margin, effort, and client risk, not your product's features.",
    rounds: [
      {
        round: 1,
        title: "Why partner with us",
        prompt:
          "Build the opening slides framed entirely around the partner's business: the revenue and client-stickiness opportunity, sized roughly, and why your product fits their existing ERP implementation motion. Lead with their upside.",
        success_criteria:
          "Leads with the partner's economic upside (services revenue, retention), sized credibly. Connects your product to their existing ERP motion so it's low-friction. Does not open with your features. Speaks to partner leadership's priorities.",
      },
      {
        round: 2,
        title: "The model",
        prompt:
          "Build the partnership-model slides: how the reselling/implementation works, the margin/revenue share, what each party is responsible for, and the effort required from them. Make it concrete and low-risk-feeling.",
        success_criteria:
          "Lays out a clear commercial model (revenue share or margin) and division of responsibilities. Is honest about the effort/enablement required from the partner. Frames client risk as managed. Concrete enough for leadership to evaluate.",
      },
      {
        round: 3,
        title: "Proof & first step",
        prompt:
          "Build the closing: evidence it works (a comparable partner result or pilot proposal) and a low-commitment first step (e.g. a pilot with 2-3 of their clients). Make saying yes easy.",
        success_criteria:
          "Provides credible proof or a concrete pilot proposal rather than asking for a big commitment up front. First step is low-risk and specific (named pilot scope). Reduces the partner's perceived risk of starting.",
      },
    ],
  },
  {
    key: "deck-enablement",
    label: "Enablement Deck",
    workspace: "deck",
    title: "Sales Enablement: New-product enablement deck",
    role: "Sales Enablement Manager",
    tags: ["sales-enablement", "training", "deck", "gtm", "sales", "product-launch"],
    description:
      "You are a Sales Enablement Manager. A new product tier is launching in 3 weeks and the 30-person sales team needs to be able to sell it. Reps are busy and skeptical of 'another thing to learn'. The deck is the core of a 45-minute enablement session: it must teach reps what the tier is, who it's for, how to position it, and how to handle the obvious objections, in a way that actually sticks and gets used on calls.",
    rounds: [
      {
        round: 1,
        title: "What it is & who it's for",
        prompt:
          "Build the foundational slides: what the new tier is in plain terms, the ideal customer for it (and who it's NOT for), and the one-sentence pitch a rep can use. Keep it rep-usable, not a product spec.",
        success_criteria:
          "Explains the tier in plain, sell-able language, not feature specs. Defines the ideal buyer and explicitly who it's not for (prevents mis-selling). Gives a memorable one-line pitch. Designed for busy reps to retain.",
      },
      {
        round: 2,
        title: "Positioning & talk track",
        prompt:
          "Build the positioning slides: when to introduce the tier in a deal, the value story tied to buyer outcomes, and a short talk track reps can adapt. Make it practical for live calls.",
        success_criteria:
          "Says when/where in the sales cycle to position the tier. Value story is outcome-based and buyer-centric. Provides an adaptable talk track, not a script to read robotically. Practical and call-ready.",
      },
      {
        round: 3,
        title: "Objections & reinforcement",
        prompt:
          "Build the objection-handling slide (the 3 objections reps will hit) and a 'what good looks like' reinforcement slide so the training sticks past the session.",
        success_criteria:
          "Anticipates the 3 most likely objections with crisp responses. Includes a reinforcement mechanism (a one-pager, a call to practice, a metric) so learning isn't lost after 45 minutes. Addresses rep skepticism about adoption.",
      },
    ],
  },
  {
    key: "deck-data-room",
    label: "Data-Room Deck",
    workspace: "deck",
    title: "Finance: Data-room narrative deck",
    role: "CFO / Finance Lead",
    tags: ["finance", "cfo", "fundraising", "deck", "diligence", "metrics"],
    description:
      "You are a Finance lead preparing the financial narrative deck for the data room in a Series B raise. Investors will scrutinize: revenue quality, margins, burn efficiency, and the path to profitability. The numbers are solid but not flawless, gross margin is 72% (good but below best-in-class), and CAC payback lengthened from 14 to 18 months last year during a growth push. The deck must present the financials credibly and pre-empt the hard diligence questions.",
    rounds: [
      {
        round: 1,
        title: "Revenue quality",
        prompt:
          "Build the revenue slides: ARR composition, growth, retention/NRR, and revenue quality signals (recurring vs. one-time, concentration risk). Present it the way a sharp investor reads it.",
        success_criteria:
          "Shows ARR growth and retention clearly. Addresses revenue quality (recurring mix, customer concentration) proactively. Anticipates how an investor evaluates durability of revenue. Honest, not dressed up.",
      },
      {
        round: 2,
        title: "Efficiency & margins",
        prompt:
          "Build the unit-economics and margin slides: gross margin (72%), CAC payback, and burn multiple. Address the lengthening payback (14→18 months) head-on with the why and the plan.",
        success_criteria:
          "Presents margin and efficiency metrics accurately. Confronts the CAC payback increase directly with the cause (growth push) and the path to improve it, rather than hoping no one notices. Pre-empts the obvious diligence question.",
      },
      {
        round: 3,
        title: "Path to profitability",
        prompt:
          "Build the forward slide: the path to profitability or improved efficiency, the key assumptions, and the sensitivity that matters most. Make the plan credible, not hockey-stick fantasy.",
        success_criteria:
          "Lays out a credible efficiency/profitability path with explicit assumptions. Shows the sensitivity to the most important driver. Avoids an implausible hockey stick. Builds investor confidence through realism.",
      },
    ],
  },
  {
    key: "deck-thought-leadership",
    label: "Conference Talk",
    workspace: "deck",
    title: "Marketing: Thought-leadership talk deck",
    role: "Content / Brand Marketer",
    tags: ["marketing", "content", "thought-leadership", "deck", "speaking", "brand"],
    description:
      "You are a Content Marketer building a 20-minute conference talk for a brand-building opportunity (a mid-size industry conference, ~300 attendees who are your target buyers). The talk must NOT be a product pitch, the audience will tune out a sales deck. It should deliver genuine insight on a trend in your space (the shift to AI-assisted workflows), establish your company as a thought leader, and earn interest without selling.",
    rounds: [
      {
        round: 1,
        title: "The big idea",
        prompt:
          "Build the opening: a hook that grabs a skeptical audience, and the one provocative-but-true big idea the whole talk delivers. No product, no logo dump. Make them want to listen.",
        success_criteria:
          "Opens with a genuine hook (a surprising stat, a contrarian claim, a real story), not 'hi, we're X'. The big idea is a single, memorable, non-obvious insight about the AI-workflow shift. Promises value, not a pitch.",
      },
      {
        round: 2,
        title: "The argument",
        prompt:
          "Build the core slides that develop the argument with evidence, examples, and a useful framework the audience can take home, the substance that earns credibility. Keep it educational, not promotional.",
        success_criteria:
          "Develops the idea with real evidence and concrete examples. Gives the audience a usable framework or takeaway. Stays educational; the product is at most an implicit beneficiary. Earns thought-leader credibility through genuine insight.",
      },
      {
        round: 3,
        title: "Landing & subtle CTA",
        prompt:
          "Build the closing: a memorable takeaway that reinforces the big idea and a soft, non-salesy call to action (a resource, a follow, a conversation) that captures interest without pitching.",
        success_criteria:
          "Closes with a crisp restatement of the big idea that sticks. CTA is soft and value-first (a resource or follow), not 'book a demo'. Captures audience interest in a way that builds the brand and pipeline indirectly.",
      },
    ],
  },
  {
    key: "deck-reorg-proposal",
    label: "Reorg Proposal",
    workspace: "deck",
    title: "People: Org redesign proposal deck",
    role: "VP of People",
    tags: ["people", "org-design", "leadership", "deck", "change-management", "strategy"],
    description:
      "You are a VP of People proposing an org redesign to the executive team. The problem: the company scaled to 280 people but the support and success functions are tangled, with unclear ownership causing dropped handoffs and customer complaints. Your proposal merges and restructures Support and Customer Success under one leader with clear swim lanes. It affects ~45 people and one director's scope shrinks. The exec team will worry about disruption and politics.",
    rounds: [
      {
        round: 1,
        title: "Problem & evidence",
        prompt:
          "Build the problem slides: the concrete cost of the current tangled structure (dropped handoffs, complaints) with evidence, so execs agree there IS a problem worth the disruption of a reorg.",
        success_criteria:
          "Demonstrates a real, evidenced problem (handoff failures, complaint data), not a structural preference. Quantifies the cost where possible. Makes the case that the status quo is more costly than the disruption of changing it.",
      },
      {
        round: 2,
        title: "The proposed structure",
        prompt:
          "Build the proposal slides: the new org structure, clear ownership/swim lanes, the single leader, and how it fixes the specific problems. Show the before/after clearly.",
        success_criteria:
          "Presents a clear before/after structure. Ownership and swim lanes are unambiguous and directly address the dropped-handoff problem. The single-leader rationale is justified. Execs can see how it solves the named issues.",
      },
      {
        round: 3,
        title: "Transition & people impact",
        prompt:
          "Build the transition slide handling the human and political reality: the affected ~45 people, the director whose scope shrinks, the communication and timeline, and how you'll minimize disruption and flight risk.",
        success_criteria:
          "Addresses the people impact honestly, including the director whose scope changes, with a respectful plan. Lays out a transition timeline and comms approach. Names flight/disruption risk and mitigations. Shows the reorg is manageable, not reckless.",
      },
    ],
  },
]
