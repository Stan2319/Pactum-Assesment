import type { TemplateConfig } from "./types"

// ── Excel / spreadsheet-workspace templates ────────────────────────
// Each anchors to a real role and embeds a small dataset to model.

export const excelTemplates: TemplateConfig[] = [
  {
    key: "excel-saas-metrics",
    label: "SaaS Metrics",
    workspace: "spreadsheet",
    title: "RevOps: Build a SaaS metrics model",
    role: "Revenue Operations Analyst",
    tags: ["revops", "saas-metrics", "mrr", "churn", "spreadsheet", "finance"],
    description:
      "You are a RevOps Analyst. Leadership wants a clean monthly metrics model from this raw movement data:\n\nMonth | New MRR | Expansion MRR | Contraction MRR | Churned MRR | Starting MRR\nJan | 38,000 | 12,000 | 4,000 | 9,000 | 520,000\nFeb | 41,000 | 15,000 | 3,000 | 14,000 | 557,000\nMar | 35,000 | 11,000 | 6,000 | 22,000 | 596,000\nApr | 44,000 | 18,000 | 5,000 | 12,000 | 614,000\n\nBuild the model in the spreadsheet.",
    rounds: [
      {
        round: 1,
        title: "Build the model",
        prompt:
          "Build a metrics table that computes, for each month: net new MRR, ending MRR, gross revenue churn rate, net revenue retention (NRR), and quick ratio. Use formulas referencing the input cells, not hardcoded results.",
        success_criteria:
          "Net new MRR = new + expansion − contraction − churned, computed correctly per month. Ending MRR rolls forward correctly. Gross churn and NRR use the right denominators (starting MRR). Quick ratio = (new+expansion)/(contraction+churned). Uses cell formulas, not pasted numbers.",
      },
      {
        round: 2,
        title: "Find the story",
        prompt:
          "Analyze the trend. Identify the most concerning movement in the data and quantify it. Add a short written takeaway (in a cell or note) on what's driving the trend.",
        success_criteria:
          "Correctly flags the March churn spike (22k churned, NRR dips) as the key concern and quantifies it. Distinguishes the healthy new-business trend from the retention problem. Takeaway is specific and supported by the computed numbers.",
      },
      {
        round: 3,
        title: "Recommendation",
        prompt:
          "Add a recommendation: based on the model, what should leadership focus on next quarter, and what single metric would best track whether it's working?",
        success_criteria:
          "Recommendation targets retention/churn given the data, not vanity growth. Names one tracking metric (e.g. NRR or gross churn) with rationale. Conclusion follows from the model, not generic advice.",
      },
    ],
  },
  {
    key: "excel-headcount-model",
    label: "Headcount Model",
    workspace: "spreadsheet",
    title: "Finance: Headcount and cost plan",
    role: "FP&A / People Operations Analyst",
    tags: ["finance", "fpa", "headcount", "planning", "spreadsheet", "people"],
    description:
      "You are an FP&A analyst building next year's headcount plan. Current state and planned hires:\n\nDept | Current HC | Planned New Hires | Avg Base Salary\nEngineering | 28 | 8 | 165,000\nSales | 14 | 6 | 120,000\nMarketing | 9 | 2 | 110,000\nCustomer Success | 11 | 4 | 95,000\nG&A | 7 | 1 | 130,000\n\nFully-loaded cost = base × 1.3 (benefits, taxes, overhead). New hires start mid-year on average (assume 50% of their annual cost lands this year).",
    rounds: [
      {
        round: 1,
        title: "Build the cost model",
        prompt:
          "Build a table computing, per department: ending headcount, fully-loaded cost of existing staff, fully-loaded cost of new hires (at 50% for mid-year starts), and total department cost. Sum to a company total.",
        success_criteria:
          "Ending HC = current + planned per dept. Existing cost = current × base × 1.3. New-hire cost = new × base × 1.3 × 0.5 (mid-year). Totals roll up correctly to a company figure. All via formulas referencing inputs.",
      },
      {
        round: 2,
        title: "Sensitivity",
        prompt:
          "Add a sensitivity: show total cost if all new hires instead start in Q1 (100% of annual cost) vs. the mid-year assumption. Quantify the delta.",
        success_criteria:
          "Correctly computes the full-year-cost scenario (new-hire factor 1.0). Shows the delta vs. mid-year clearly. Demonstrates understanding that hire timing materially changes the annual number.",
      },
      {
        round: 3,
        title: "Recommendation",
        prompt:
          "Given a budget constraint, which department's hiring would you phase or delay to save the most while least hurting growth? Justify with the numbers.",
        success_criteria:
          "Identifies where delaying hires saves the most money using the model. Weighs cost savings against growth impact (e.g. delaying Sales hurts revenue). Recommendation is data-grounded and explicit, not hand-wavy.",
      },
    ],
  },
  {
    key: "excel-budget-variance",
    label: "Budget Variance",
    workspace: "spreadsheet",
    title: "Finance: Budget vs. actual variance analysis",
    role: "Financial Analyst",
    tags: ["finance", "fpa", "budget", "variance", "spreadsheet", "reporting"],
    description:
      "You are a Financial Analyst closing the quarter. Department budgets vs. actuals:\n\nCategory | Budget | Actual\nSalaries | 1,450,000 | 1,512,000\nMarketing | 380,000 | 295,000\nSoftware/Tools | 120,000 | 158,000\nTravel | 60,000 | 22,000\nContractors | 90,000 | 171,000\nOffice/Facilities | 110,000 | 104,000\n\nBuild the variance analysis.",
    rounds: [
      {
        round: 1,
        title: "Variance table",
        prompt:
          "Build a variance table: absolute variance (actual − budget), percent variance, and a flag for whether each line is over or under budget. Add totals.",
        success_criteria:
          "Absolute and percent variance computed correctly per line (sign convention consistent). Over/under flag is correct. Totals sum correctly. Uses formulas. Percent variance handles the right base (budget).",
      },
      {
        round: 2,
        title: "Materiality & drivers",
        prompt:
          "Identify the material variances (define a threshold, e.g. >15% or >$40k) and write a short driver hypothesis for the two largest, distinguishing favorable from unfavorable.",
        success_criteria:
          "Applies a stated materiality threshold consistently. Flags Contractors (+90%) and Software (+32%) as key unfavorable, Marketing/Travel as favorable underspend. Driver hypotheses are plausible and tied to the numbers. Distinguishes favorable underspend from concerning overspend.",
      },
      {
        round: 3,
        title: "Narrative",
        prompt:
          "Write the variance commentary a CFO would read: net position vs. budget, the story behind it (is underspend good or a sign of stalled plans?), and one question you'd raise with a budget owner.",
        success_criteria:
          "States net total variance correctly. Interprets rather than just lists (e.g. marketing underspend may mean missed pipeline, not savings). Raises a sharp, specific question for a budget owner. Reads as analysis, not a data dump.",
      },
    ],
  },
  {
    key: "excel-pipeline-forecast",
    label: "Pipeline Forecast",
    workspace: "spreadsheet",
    title: "Sales Ops: Weighted pipeline forecast",
    role: "Sales Operations Analyst",
    tags: ["sales-ops", "forecasting", "pipeline", "crm", "spreadsheet", "revenue"],
    description:
      "You are a Sales Ops Analyst forecasting this quarter. Open pipeline:\n\nDeal | Amount | Stage | Stage Win % \nA | 80,000 | Proposal | 60%\nB | 150,000 | Discovery | 20%\nC | 45,000 | Negotiation | 80%\nD | 220,000 | Discovery | 20%\nE | 95,000 | Proposal | 60%\nF | 60,000 | Negotiation | 80%\nG | 30,000 | Closed Won | 100%\n\nQuarter target is $400,000. Build the forecast.",
    rounds: [
      {
        round: 1,
        title: "Weighted forecast",
        prompt:
          "Build the forecast: weighted value per deal (amount × stage win %), total weighted pipeline, total unweighted pipeline, and committed (Closed Won) value. Compare weighted forecast to the $400k target.",
        success_criteria:
          "Weighted value per deal correct. Totals for weighted, unweighted, and committed computed via formulas. Clear comparison of weighted forecast vs. $400k target (gap or surplus quantified).",
      },
      {
        round: 2,
        title: "Coverage & risk",
        prompt:
          "Compute pipeline coverage (unweighted pipeline ÷ target) and identify the forecast's biggest risk concentration. Is the quarter on track? Justify with the numbers.",
        success_criteria:
          "Coverage ratio computed correctly. Identifies that two Discovery deals (B, D = $370k at 20%) carry outsized, low-probability weight. Makes an evidence-based on-track / at-risk call rather than guessing.",
      },
      {
        round: 3,
        title: "Where to focus",
        prompt:
          "Recommend where the team should focus to most improve the forecast, and quantify the upside of moving one specific deal one stage forward.",
        success_criteria:
          "Targets the highest-leverage action (advancing a large Discovery deal, or closing late-stage deals). Quantifies the weighted-value upside of a specific stage progression. Recommendation is concrete and tied to the model.",
      },
    ],
  },
  {
    key: "excel-ab-test-results",
    label: "A/B Test Analysis",
    workspace: "spreadsheet",
    title: "Growth: Analyze an A/B test",
    role: "Growth Analyst",
    tags: ["growth", "experimentation", "ab-test", "conversion", "spreadsheet", "analytics"],
    description:
      "You are a Growth Analyst evaluating a checkout-button A/B test:\n\nVariant | Visitors | Conversions\nControl (A) | 12,400 | 868\nVariant (B) | 12,180 | 974\n\nThe PM wants to ship B. Before you do, analyze whether the lift is real.",
    rounds: [
      {
        round: 1,
        title: "Conversion & lift",
        prompt:
          "Compute conversion rate for each variant, the absolute lift (percentage points), and the relative lift (%). Show the formulas.",
        success_criteria:
          "Control rate ≈ 7.0%, Variant ≈ 8.0% computed correctly. Absolute lift (~1.0 pp) and relative lift (~14%) both computed and clearly distinguished. Uses formulas referencing the inputs.",
      },
      {
        round: 2,
        title: "Significance",
        prompt:
          "Assess whether the difference is statistically meaningful. Compute the standard error of the difference in proportions and an approximate z-score / confidence interval. State whether you'd call it significant and why.",
        success_criteria:
          "Computes standard error for the difference in proportions using a correct formula. Derives a z-score or CI. Reaches a defensible significance conclusion (the result is significant at ~95%). Shows the work, not just a verdict.",
      },
      {
        round: 3,
        title: "Ship decision",
        prompt:
          "Make the ship/no-ship recommendation. Beyond significance, note one practical caveat (sample period, novelty effect, segment differences) the PM should weigh.",
        success_criteria:
          "Makes a clear recommendation grounded in the significance result. Raises a real practical caveat (e.g. test duration, novelty, seasonality) rather than rubber-stamping. Balances statistical and business judgment.",
      },
    ],
  },
  {
    key: "excel-cohort-retention",
    label: "Cohort Retention",
    workspace: "spreadsheet",
    title: "Data: Cohort retention analysis",
    role: "Data Analyst",
    tags: ["data", "retention", "cohort", "analytics", "spreadsheet", "saas"],
    description:
      "You are a Data Analyst building a retention view. Monthly signup cohorts and how many remained active in later months:\n\nCohort | Size | M1 | M2 | M3 | M4\nJan | 1,000 | 720 | 610 | 540 | 500\nFeb | 1,200 | 840 | 700 | 620 | —\nMar | 950 | 670 | 560 | — | —\nApr | 1,100 | 760 | — | — | —\n\nBuild the retention analysis.",
    rounds: [
      {
        round: 1,
        title: "Retention curves",
        prompt:
          "Convert the counts to retention percentages (each month ÷ cohort size) in a triangle. Then compute the average retention by month-since-signup across available cohorts.",
        success_criteria:
          "Percentages computed correctly per cell against the right cohort size. Average-by-month handles the ragged triangle (only averages available cohorts per month). Uses formulas. Layout is a readable retention triangle.",
      },
      {
        round: 2,
        title: "Read the trend",
        prompt:
          "Analyze: is retention improving or worsening across cohorts? Identify where the steepest drop-off happens in the lifecycle and quantify it.",
        success_criteria:
          "Compares like-for-like points across cohorts (e.g. M1 retention: Jan 72% vs later cohorts) to assess the trend. Identifies the M0→M1 drop as the steepest and quantifies it. Conclusion is supported by the computed percentages.",
      },
      {
        round: 3,
        title: "Recommendation",
        prompt:
          "Where in the lifecycle should the team intervene to most improve long-term retention, and what does the data suggest about whether the problem is onboarding or ongoing value?",
        success_criteria:
          "Targets the early drop-off (onboarding) as highest-leverage, justified by the curve shape. Distinguishes an onboarding problem (steep early loss) from a value problem (later flattening). Recommendation follows from the analysis.",
      },
    ],
  },
  {
    key: "excel-unit-economics",
    label: "Unit Economics",
    workspace: "spreadsheet",
    title: "Finance: CAC, LTV, and payback by channel",
    role: "FP&A Analyst",
    tags: ["finance", "fpa", "unit-economics", "cac-ltv", "spreadsheet", "growth"],
    description:
      "You are an FP&A Analyst assessing channel efficiency:\n\nChannel | Spend | New Customers | Avg Monthly Revenue/Cust | Gross Margin | Monthly Churn\nPaid Search | 120,000 | 300 | 90 | 80% | 3%\nContent/SEO | 40,000 | 220 | 85 | 80% | 2%\nOutbound | 95,000 | 110 | 140 | 80% | 2.5%\nPartnerships | 30,000 | 60 | 160 | 80% | 1.5%\n\nBuild the unit-economics comparison.",
    rounds: [
      {
        round: 1,
        title: "CAC, LTV, payback",
        prompt:
          "Compute per channel: CAC (spend ÷ new customers), customer lifetime (1 ÷ monthly churn, in months), LTV (avg monthly revenue × gross margin × lifetime), LTV:CAC ratio, and CAC payback (months to recover CAC on gross-margin revenue).",
        success_criteria:
          "CAC correct per channel. Lifetime = 1/churn. LTV uses gross-margin-adjusted revenue × lifetime. LTV:CAC and payback computed correctly. All via formulas. Units (months, ratio) are clear.",
      },
      {
        round: 2,
        title: "Rank the channels",
        prompt:
          "Rank channels by efficiency. Note where a low CAC channel is undermined by churn, or a high CAC channel is saved by retention/value. Surface the non-obvious finding.",
        success_criteria:
          "Ranking uses LTV:CAC and payback, not just CAC. Surfaces that Partnerships/Outbound have high CAC but strong LTV (low churn, high revenue), while Paid Search's higher churn erodes value. Goes beyond 'cheapest CAC wins'.",
      },
      {
        round: 3,
        title: "Budget reallocation",
        prompt:
          "Recommend how to shift budget next quarter to improve blended efficiency, and name the main risk in scaling your top-ranked channel.",
        success_criteria:
          "Reallocates toward the best LTV:CAC / payback channels with reasoning. Names a real scaling risk (e.g. partnerships/outbound don't scale linearly, channel saturation). Recommendation is grounded in the computed metrics.",
      },
    ],
  },
  {
    key: "excel-capacity-planning",
    label: "Support Capacity",
    workspace: "spreadsheet",
    title: "Operations: Support capacity plan",
    role: "Operations Analyst",
    tags: ["operations", "capacity-planning", "support", "staffing", "spreadsheet", "forecasting"],
    description:
      "You are an Operations Analyst planning support staffing. Data:\n\n- Forecast tickets next quarter: Month1 9,200, Month2 10,400, Month3 12,000\n- An agent handles 22 tickets/day and works ~20 days/month\n- Target: no more than 90% utilization (buffer for spikes/PTO)\n- Current team: 18 agents\n\nBuild the capacity plan.",
    rounds: [
      {
        round: 1,
        title: "Capacity model",
        prompt:
          "Compute per month: tickets per agent capacity per month, required agents at 100% utilization, required agents at the 90% utilization target, and the gap vs. the current 18 agents.",
        success_criteria:
          "Monthly per-agent capacity = 22 × 20 = 440 tickets. Required agents = forecast ÷ capacity (and ÷ 0.9 for the target). Gap vs. 18 computed per month. Formulas used; rounding handled sensibly (can't hire 0.4 of a person).",
      },
      {
        round: 2,
        title: "Hiring plan",
        prompt:
          "Translate the gap into a hiring plan, accounting for the fact that new agents need ~4 weeks ramp before full productivity. When must you start hiring to be covered in Month 3?",
        success_criteria:
          "Accounts for ramp time when timing hires (must hire ahead of need). Produces a concrete start-by recommendation for Month 3 coverage. Acknowledges the lag between hiring and capacity. Math is consistent with Round 1.",
      },
      {
        round: 3,
        title: "Alternatives",
        prompt:
          "If hiring is frozen, propose two levers (other than headcount) to close the Month 3 gap and quantify the rough impact of one of them.",
        success_criteria:
          "Proposes realistic non-headcount levers (deflection/self-serve, temporary contractors, efficiency gains, triage). Quantifies the rough effect of at least one (e.g. 10% deflection reduces required agents by X). Stays grounded in the model.",
      },
    ],
  },
  {
    key: "excel-lead-scoring",
    label: "Lead Scoring",
    workspace: "spreadsheet",
    title: "Marketing Ops: Build a lead scoring model",
    role: "Marketing Operations Analyst",
    tags: ["marketing-ops", "lead-scoring", "demand-gen", "scoring", "spreadsheet", "b2b"],
    description:
      "You are a Marketing Ops Analyst. Sales complains about lead quality. You have 8 sample leads with attributes and whether they became opportunities:\n\nLead | Company Size | Title Level | Engagement (visits) | Requested Demo | Became Opp\nL1 | 500 | VP | 9 | Yes | Yes\nL2 | 40 | Manager | 2 | No | No\nL3 | 1200 | Director | 6 | Yes | Yes\nL4 | 80 | IC | 12 | No | No\nL5 | 300 | VP | 1 | No | No\nL6 | 900 | Director | 8 | Yes | Yes\nL7 | 25 | Manager | 4 | Yes | No\nL8 | 650 | VP | 5 | No | No\n\nDesign a scoring model.",
    rounds: [
      {
        round: 1,
        title: "Design the score",
        prompt:
          "Design a weighted lead score using the attributes (company size, title level, engagement, demo request). Assign point values, build a formula that scores each lead, and show the scores.",
        success_criteria:
          "Assigns sensible point weights (e.g. demo request and senior title weighted heavily, given the outcomes). Encodes categorical fields (title level, size bands) into points. A single formula scores each lead consistently. Scores are computed, not eyeballed.",
      },
      {
        round: 2,
        title: "Validate against outcomes",
        prompt:
          "Check your model against the 'Became Opp' column. Pick a score threshold and compute how well it separates opps from non-opps (true positives, false positives). Tune if needed.",
        success_criteria:
          "Sets a threshold and evaluates it against actual outcomes. Quantifies separation (e.g. how many real opps are above the line, how many false alarms). Adjusts weights/threshold if the fit is poor. Shows the model is validated, not just asserted.",
      },
      {
        round: 3,
        title: "Handoff rule",
        prompt:
          "Recommend the score threshold at which a lead routes to sales, and explain the tradeoff between sending too many low-quality leads vs. missing good ones.",
        success_criteria:
          "Recommends a defensible threshold tied to the validation. Articulates the precision/recall tradeoff in business terms (sales wasted time vs. missed pipeline). Decision is justified by the data, not arbitrary.",
      },
    ],
  },
  {
    key: "excel-pricing-sensitivity",
    label: "Pricing Scenarios",
    workspace: "spreadsheet",
    title: "Product: Pricing scenario model",
    role: "Product / Finance Analyst",
    tags: ["product", "pricing", "finance", "scenario-modeling", "spreadsheet", "revenue"],
    description:
      "You are modeling a price change. Current state: 2,000 customers at $50/month, monthly churn 4%. You're considering raising price to $65/month. Best estimate: the increase will lift monthly churn to 6% and reduce new-signup conversion, but revenue per remaining customer rises. Assume new signups stay ~120/month in both cases for simplicity. Model 12 months.",
    rounds: [
      {
        round: 1,
        title: "Two scenarios",
        prompt:
          "Build a 12-month projection of customers and MRR for both scenarios: (A) stay at $50 / 4% churn, (B) move to $65 / 6% churn. Each month: churn existing, add 120 new, compute MRR. Show both side by side.",
        success_criteria:
          "Month-over-month customer count correctly applies churn then adds new signups, for both scenarios. MRR = customers × price per scenario. 12-month build uses formulas that roll forward. Both scenarios are directly comparable.",
      },
      {
        round: 2,
        title: "Break-even",
        prompt:
          "Determine whether and when the higher-price scenario produces more MRR than the status quo, despite higher churn. Quantify the 12-month cumulative revenue difference.",
        success_criteria:
          "Correctly identifies the crossover (higher price wins on MRR despite churn, because price effect outweighs churn at these numbers) and when. Computes cumulative 12-month revenue for both and the delta. Conclusion is driven by the model.",
      },
      {
        round: 3,
        title: "Risk & recommendation",
        prompt:
          "Make a recommendation and stress-test it: at what churn level would the price increase stop being worth it? Note the key assumption you're least confident in.",
        success_criteria:
          "Makes a clear recommendation. Finds the approximate churn breakpoint where the increase no longer pays off (sensitivity on the churn assumption). Flags the least-confident assumption (churn or conversion impact) honestly. Shows the decision depends on assumptions.",
      },
    ],
  },
  {
    key: "excel-eng-capacity",
    label: "Sprint Capacity",
    workspace: "spreadsheet",
    title: "Engineering: Sprint capacity plan",
    role: "Engineering Manager",
    tags: ["engineering-management", "capacity", "planning", "agile", "spreadsheet", "delivery"],
    description:
      "You are an EM planning a 2-week sprint for a 6-person team. Inputs:\n\nEngineer | Available Days | Focus Factor | PTO Days\nA | 10 | 0.7 | 0\nB | 10 | 0.7 | 2\nC | 10 | 0.6 | 0\nD | 10 | 0.7 | 1\nE (new hire) | 10 | 0.4 | 0\nF | 10 | 0.7 | 0\n\n'Focus factor' is the fraction of time on sprint work (rest is meetings/support). The team historically delivers ~1.5 story points per effective engineer-day. Backlog asks for 60 points.",
    rounds: [
      {
        round: 1,
        title: "Capacity",
        prompt:
          "Compute each engineer's effective engineer-days ((available − PTO) × focus factor) and the team's total. Convert to a point capacity at 1.5 points/effective-day.",
        success_criteria:
          "Effective days per engineer correct, including PTO subtraction and the new hire's lower focus factor (0.4). Team total summed. Point capacity = total effective days × 1.5, computed via formula.",
      },
      {
        round: 2,
        title: "Commit vs. ask",
        prompt:
          "Compare the team's point capacity to the 60-point backlog ask. Is 60 realistic? Quantify the over/under and what it means for the sprint.",
        success_criteria:
          "Correctly computes the gap between capacity and the 60-point ask (capacity is below 60). States clearly that committing to 60 would over-allocate, with the number. Avoids the trap of ignoring focus factor and PTO.",
      },
      {
        round: 3,
        title: "Recommendation",
        prompt:
          "Recommend a realistic commitment and one structural change (other than overtime) that would raise sustainable capacity next sprint. Justify with the model.",
        success_criteria:
          "Recommends a commitment within computed capacity, not the inflated ask. Proposes a sustainable lever (reduce meeting load to raise focus factor, ramp the new hire, reduce support rotation) and ties it to the math. Does not solve it with overtime.",
      },
    ],
  },
  {
    key: "excel-commission-calc",
    label: "Commission Calculator",
    workspace: "spreadsheet",
    title: "Sales Comp: Tiered commission calculator",
    role: "Sales Compensation Analyst",
    tags: ["sales-comp", "finance", "commission", "incentives", "spreadsheet", "revenue"],
    description:
      "You are a Sales Comp Analyst. The plan: reps earn 8% on attainment up to quota, 12% on the portion from 100-120% of quota, and 15% on anything above 120% (accelerators). Quota is $500,000/quarter. Rep results:\n\nRep | Bookings\nNina | 420,000\nOmar | 500,000\nPriya | 560,000\nQuinn | 640,000\n\nBuild the commission calculator.",
    rounds: [
      {
        round: 1,
        title: "Tiered payout",
        prompt:
          "Build a calculator that computes each rep's commission across the three tiers correctly (8% to quota, 12% from 100-120%, 15% above 120%). Show the per-tier breakdown and total payout per rep.",
        success_criteria:
          "Tier math is correct: the marginal rate applies only to the portion in each band, not the whole amount. Below-quota reps (Nina) earn only the 8% tier on actual bookings. Quinn's payout correctly spans all three tiers. Uses formulas that would work for any bookings value.",
      },
      {
        round: 2,
        title: "Effective rate",
        prompt:
          "Compute each rep's effective commission rate (total commission ÷ bookings) and explain why the top performer's effective rate is higher than quota-attainers.",
        success_criteria:
          "Effective rate computed per rep. Correctly explains that accelerators raise the blended rate for over-performers. Distinguishes marginal rate from effective rate clearly.",
      },
      {
        round: 3,
        title: "Plan cost check",
        prompt:
          "Total the commission cost and compute it as a percent of total bookings. Flag one risk in this accelerator structure for the finance team.",
        success_criteria:
          "Total commission and commission-as-%-of-bookings computed correctly. Flags a real risk (e.g. accelerators are costly if quotas are set too low, or sandbagging incentives) for finance. Connects the payout structure to company cost.",
      },
    ],
  },
  {
    key: "excel-nps-analysis",
    label: "NPS Analysis",
    workspace: "spreadsheet",
    title: "Customer Experience: NPS and driver analysis",
    role: "Customer Experience Analyst",
    tags: ["customer-experience", "nps", "survey", "analytics", "spreadsheet", "voice-of-customer"],
    description:
      "You are a CX Analyst analyzing an NPS survey. Responses (0-10 score) by segment:\n\nSegment | Promoters (9-10) | Passives (7-8) | Detractors (0-6) | Total Responses\nEnterprise | 64 | 30 | 16 | 110\nMid-Market | 88 | 70 | 62 | 220\nSMB | 120 | 95 | 145 | 360\n\nBuild the NPS analysis.",
    rounds: [
      {
        round: 1,
        title: "NPS by segment",
        prompt:
          "Compute NPS per segment (% promoters − % detractors) and the overall blended NPS. Show the percentages behind each.",
        success_criteria:
          "Segment NPS computed correctly (%promoters − %detractors using each segment's total). Blended NPS uses total promoters/detractors across all responses, not an average of segment scores. Percentages shown. Formulas used.",
      },
      {
        round: 2,
        title: "Where's the problem",
        prompt:
          "Identify which segment is dragging the overall score and quantify the gap between the best and worst segments. Note the risk of the overall number masking the segment story.",
        success_criteria:
          "Correctly identifies SMB as the drag (negative or lowest NPS) and Enterprise as strongest. Quantifies the gap between segments. Makes the point that the blended score hides a segment problem.",
      },
      {
        round: 3,
        title: "Recommendation",
        prompt:
          "Recommend where to focus to most improve overall NPS, weighing segment volume against segment score, and propose one metric to track improvement.",
        success_criteria:
          "Weighs SMB's large volume + low score against Enterprise's high value when prioritizing. Makes a defensible focus recommendation. Names a tracking metric. Recognizes that fixing the largest, lowest segment moves the blended number most, but value matters too.",
      },
    ],
  },
  {
    key: "excel-burn-runway",
    label: "Burn & Runway",
    workspace: "spreadsheet",
    title: "Finance: Burn and runway model",
    role: "Finance / Founder",
    tags: ["finance", "burn-rate", "runway", "startup", "spreadsheet", "fundraising"],
    description:
      "You are modeling cash runway for a startup. Inputs: current cash $4.2M; monthly revenue $260k growing 6%/month; monthly operating costs $680k growing 2%/month (mostly headcount). Model the next 12 months. The board wants to know when you hit 6 months of runway (the point you'd need to fundraise).",
    rounds: [
      {
        round: 1,
        title: "Cash model",
        prompt:
          "Build a 12-month model: monthly revenue (growing 6%), monthly costs (growing 2%), net burn (costs − revenue), and ending cash each month rolling forward from $4.2M.",
        success_criteria:
          "Revenue and costs grow at the correct compounding rates month over month. Net burn = costs − revenue per month (and shrinks as revenue outgrows costs). Ending cash rolls forward correctly. Uses formulas, not static values.",
      },
      {
        round: 2,
        title: "Runway & fundraise trigger",
        prompt:
          "Identify total runway in months (when cash would reach zero on this trajectory) and the month you cross below 6 months of runway, the fundraise trigger. State the months explicitly.",
        success_criteria:
          "Correctly determines whether/when cash hits zero in the window, or that revenue growth extends runway. Identifies the 6-months-of-runway trigger point with the specific month. Distinguishes 'months of runway remaining' from raw cash balance.",
      },
      {
        round: 3,
        title: "Scenario",
        prompt:
          "Model a downside: revenue grows only 2%/month instead of 6%. Quantify how much sooner the fundraise trigger hits, and give the board a one-line read.",
        success_criteria:
          "Re-runs the model with 2% revenue growth and quantifies the earlier trigger / shorter runway. Compares to the base case clearly. One-line board read is accurate and decision-useful (e.g. 'fundraise X months sooner if growth slows').",
      },
    ],
  },
]
