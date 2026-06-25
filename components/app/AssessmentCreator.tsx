"use client"

import { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, Code2, FileText,
  LayoutTemplate, PenLine, Check, Mail, Presentation, Table2,
} from "lucide-react"
import type { Assessment, AssessmentRound, WorkspaceType } from "@/lib/types"

// ── Template round data ────────────────────────────────────────────

const MARKETING_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Go-to-market strategy",
    prompt:
      "Using the company and product description above, build a full go-to-market messaging strategy. Include: positioning statement, 3 key differentiators, target audience definition, and 3 campaign concepts with brief descriptions.",
    success_criteria:
      "A positioning statement, exactly 3 key differentiators, a defined target audience, and 3 distinct campaign concepts each with a brief description. All four elements must be present and specific to the company described.",
  },
  {
    round: 2,
    title: "Tone revision",
    prompt:
      "The client says the tone in your Round 1 output is too aggressive and feels like it's punching down on competitors. Revise the positioning and at least one campaign concept to fix this. Explain what you changed and why.",
    success_criteria:
      "A revised positioning statement with a noticeably different tone, at least one revised campaign concept, and a clear explanation of what specifically changed and the reasoning behind it. The explanation must be substantive, not just 'I made it friendlier.'",
  },
  {
    round: 3,
    title: "Legal revision",
    prompt:
      "One of your campaign concepts has been flagged by legal for making an unsubstantiated performance claim. Identify which one, fix it, and briefly explain your reasoning.",
    success_criteria:
      "Correct identification of the problematic campaign concept, a revised version that removes the unsubstantiated claim while keeping the concept compelling, and a brief explanation of why the original was a problem and what makes the fix compliant.",
  },
]

const FINANCE_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Executive summary",
    prompt:
      "Using the customer data and market context above, write an executive summary with the top 3 business insights and a strategic recommendation for the next quarter.",
    success_criteria:
      "An executive summary that contains exactly 3 numbered business insights drawn from the data (not generic observations), and one specific strategic recommendation for next quarter with a clear rationale tied to the data. Both must be grounded in the numbers provided.",
  },
  {
    round: 2,
    title: "Defend your recommendation",
    prompt:
      "The CEO is pushing back on your second recommendation, saying the data doesn't support it. Defend your position with specific evidence from the data, or revise it with a stronger alternative and new reasoning.",
    success_criteria:
      "Either a defense of the original recommendation that cites specific data points from the brief, or a revised recommendation that is meaningfully different and backed by stronger evidence. Vague restatements or minor rewording do not count; the reasoning must be substantively new or evidenced.",
  },
  {
    round: 3,
    title: "Board memo",
    prompt:
      "Translate the executive summary and final recommendation into a one-page board memo. It should be formal, scannable, and end with a clear ask.",
    success_criteria:
      "A memo that reads as a formal board document (not a chat message), is scannable with clear sections, incorporates the insights and recommendation from earlier rounds, and ends with a specific ask or decision point for the board. It should not exceed what a one-pager would contain.",
  },
]

const CS_EMAIL_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "De-escalation response",
    prompt:
      "Draft a response to Marcus's cancellation email. Address the cancellation request directly, don't dodge it. Acknowledge both outages with accountability, mention that the root causes have been fixed, and make a case for a conversation before finalizing the decision. Do not offer discounts or make promises you can't keep.",
    success_criteria:
      "Email must directly address the cancellation (not deflect), acknowledge both specific outages with accountability, reference the fixes, and request a call or conversation. No empty promises or pressuring language. 150–300 words.",
  },
  {
    round: 2,
    title: "Follow-up after a difficult call",
    prompt:
      "Marcus agreed to a call. On the call he said reliability was the breaking point, but hinted the real issue is that his team finds the product 'too complicated' and has already built internal workarounds. He will not renew at current price but did not hang up. Write a follow-up email that: summarizes what you heard, proposes one concrete next step (a scoped pilot, a product walkthrough, or a restructured contract), and asks a single focused question to keep the conversation moving.",
    success_criteria:
      "Email accurately reflects both issues Marcus raised (reliability and complexity/workarounds). Proposes exactly one specific actionable next step, not multiple vague options. Asks a single focused question. Professional tone without desperation.",
  },
  {
    round: 3,
    title: "Internal handoff note",
    prompt:
      "Write a brief internal note to your Head of Customer Success summarizing the situation: what happened, what you tried, where things stand, and what you recommend as the next move. This is not a customer-facing email, it's an internal summary.",
    success_criteria:
      "Internal memo format (not customer-facing language or tone). Covers: root issue, what was offered, current status of the account, and a clear recommendation with rationale. Scannable format acceptable. Under 200 words.",
  },
]

const CAMPAIGN_SPREADSHEET_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the core analysis",
    prompt:
      "Using the Q1 campaign data in the context above, build a performance analysis in the spreadsheet. Calculate CPL (cost per conversion) and ROAS (revenue ÷ spend) for each channel. Add a column for each metric, then rank the channels from most to least efficient by ROAS.",
    success_criteria:
      "Spreadsheet contains CPL and ROAS columns with arithmetically correct values for all 5 channels. Channels are ranked by ROAS. Reference values: Email ≈ 48.6x ROAS, Content/SEO ≈ 11.3x, Google ≈ 3.8x, LinkedIn ≈ 3.35x, Facebook ≈ 1.58x.",
  },
  {
    round: 2,
    title: "Investigate the anomaly",
    prompt:
      "LinkedIn and Facebook both target similar audiences but their performance is dramatically different. Identify the exact gap between them across all metrics. Then add a row showing the blended average CPL and ROAS across paid channels only (exclude Email and Content/SEO). What does this tell you?",
    success_criteria:
      "Correct side-by-side comparison of LinkedIn vs Facebook across all 6 metrics. Blended average row added with correct arithmetic for the 3 paid channels (Google, LinkedIn, Facebook). A substantive observation about what the gap implies, not just repeating numbers.",
  },
  {
    round: 3,
    title: "Q2 budget recommendation",
    prompt:
      "Propose a Q2 budget allocation across all 5 channels. Total budget: $43,400 (same as Q1). Add a new section with your allocation and reasoning. At least one channel must receive meaningfully less than Q1. At least one must receive meaningfully more. Defend each change with a specific data point from your analysis.",
    success_criteria:
      "Q2 allocations sum to exactly $43,400. At least one cut and one increase, each with a specific data-backed rationale. Facebook should logically be cut (1.58x ROAS). Email and Content/SEO should logically be maintained or increased. Reasoning references specific numbers from earlier analysis.",
  },
]

const PRODUCT_DECK_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the core pitch",
    prompt:
      "Build the core pitch deck for the AI Deal Score feature. Required slides: title, problem (why this matters now), solution (what the feature does), traction (the model accuracy data), and next steps. Keep each slide tight, one clear idea per slide, no text walls.",
    success_criteria:
      "Deck has at least 5 slides covering all required sections. Problem slide references the win rate decline (18%, down from 23%). Solution slide describes the feature without jargon. Traction slide prominently shows the 74% accuracy stat with context. Each slide has a single clear point.",
  },
  {
    round: 2,
    title: "Handle the CFO objection",
    prompt:
      "The CFO asks: 'If the model is 74% accurate, that means it's wrong 26% of the time. Why would sales reps trust it?' Add a slide (or revise an existing one) that directly addresses this objection and the broader question of rep adoption. Also add an ROI slide: if win rate improves from 18% to 20% and average deal size is $24,000, what is the revenue impact? Current open pipeline: 480 deals.",
    success_criteria:
      "Slide directly addresses the 74% objection without dismissing it, should acknowledge the limitation and reframe it (e.g. vs. gut feel baseline). ROI slide shows correct math: 480 × 2% = 9.6 additional wins × $24,000 = $230,400. Contextualizes why that justifies the build investment.",
  },
  {
    round: 3,
    title: "Write the close",
    prompt:
      "The exec team is generally supportive but hasn't committed. Add a closing slide that states the specific decision you're asking them to make today, sets a timeline (propose a 4-week discovery sprint), and names one key risk of inaction tied to the win rate data. This should feel like a close, not a summary.",
    success_criteria:
      "Closing slide states a specific ask (not vague 'support the initiative', e.g. 'approve a 4-week discovery sprint with 2 engineering hours/week'). Includes a concrete timeline. Names one specific consequence of inaction tied to the win rate trend. Tone is confident and forward-looking.",
  },
]

const PYTHON_CODING_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt:
      "Before you write any code, write out your plan. What does the problem ask for? What is your high-level approach? What edge cases will you handle? What data structures or libraries will you use?",
    success_criteria:
      "A written plan that demonstrates understanding of the problem, a clear high-level approach, identification of at least two edge cases, and a note on the tools or libraries the candidate intends to use.",
  },
  {
    round: 2,
    title: "Implement the solution",
    prompt:
      "Implement a Python function that reads a CSV file of sales transactions (columns: date, product_id, quantity, unit_price), calculates total revenue per product, and returns the top 5 products by revenue as a sorted list of (product_id, total_revenue) tuples. The function signature should be: get_top_products(filepath: str) -> list[tuple[str, float]]",
    success_criteria:
      "A working Python function that correctly reads the CSV, calculates revenue (quantity × unit_price), aggregates by product_id, and returns the top 5 sorted by revenue descending. Edge cases handled: missing values, zero quantities, duplicate product IDs.",
  },
  {
    round: 3,
    title: "Handle scale",
    prompt:
      "The CSV file could be 10GB. Refactor your solution to handle files that don't fit in memory. Explain your approach before implementing.",
    success_criteria:
      "Solution uses chunked reading (e.g. pandas chunksize or csv.reader with a running dict). The candidate explains the memory tradeoff before coding. Final solution produces the same correct output for large files without loading the entire file at once.",
  },
]

const JS_CODING_TEMPLATE: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt:
      "Before you write any code, write out your plan. What does the problem ask for? What is your high-level approach? What edge cases will you handle? What JavaScript patterns or libraries will you use?",
    success_criteria:
      "A written plan that demonstrates understanding of the problem, a clear high-level approach, identification of at least two edge cases, and a note on the JavaScript patterns or Node.js modules the candidate intends to use.",
  },
  {
    round: 2,
    title: "Implement the endpoint",
    prompt:
      "Implement a Node.js Express endpoint: POST /api/notifications/send. It should accept a JSON body with { userId: string, message: string, channel: 'email' | 'sms' | 'push' }, validate the input, look up the user's preferences from an in-memory store (you define the shape), and return { success: boolean, queued: boolean, reason?: string }. Don't implement real sending, stub the delivery logic.",
    success_criteria:
      "A working Express endpoint that validates required fields and types, references a user preferences store, returns the correct response shape, and handles invalid input with appropriate status codes (400 for bad input, 404 for unknown user). Delivery logic is stubbed but clearly indicated.",
  },
  {
    round: 3,
    title: "Add rate limiting",
    prompt:
      "The endpoint is being abused, some users are sending hundreds of notifications per minute. Add per-user rate limiting: max 10 notifications per minute per userId. Explain your design before implementing. It should work in-process (no Redis) and handle the window correctly.",
    success_criteria:
      "Rate limiting implemented in-process using a sliding window or token bucket approach. The 429 response includes a retry-after value. The design explanation demonstrates understanding of the tradeoff (in-process vs distributed). Window resets correctly after 60 seconds.",
  },
]

// ── New coding template round data ────────────────────────────────

const PY_SALES_REPORT_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Read through the transaction data in transactions.py and the function stubs in report.py. Before writing any code, describe your plan: what does generate_report() need to do, what data structures will you use internally, and what edge cases (nulls, zero-quantity items, duplicate transactions) should you handle?",
    success_criteria: "A clear written plan that identifies the required output shape (total_revenue, top_5_products, revenue_by_category, avg_order_value), describes the aggregation approach, and names at least two edge cases to handle.",
  },
  {
    round: 2,
    title: "Implement generate_report()",
    prompt: "Implement the generate_report() function in report.py. It should take the TRANSACTIONS list and return a dict with: total_revenue (float), total_transactions (int), avg_order_value (float), top_5_products (list of {product_name, revenue, units_sold} sorted by revenue desc), and revenue_by_category (dict of category -> float). Test it by running the file.",
    success_criteria: "generate_report(TRANSACTIONS) returns a dict with all five keys. top_5_products is correctly sorted by revenue descending. revenue_by_category sums correctly across all categories. avg_order_value equals total_revenue / total_transactions. Edge cases (zero qty, missing fields) handled without crashing.",
  },
  {
    round: 3,
    title: "Add period comparison",
    prompt: "Implement compare_periods(current, previous) in report.py. It takes two report dicts (from generate_report) and returns the percentage change for total_revenue, total_transactions, and avg_order_value. Handle the case where a previous metric is zero. Then call it with TRANSACTIONS split into first-half and second-half of January to demonstrate it works.",
    success_criteria: "compare_periods returns a dict with *_change_pct keys. Percentage is correctly calculated as (current - previous) / previous * 100. Division by zero for zero-value previous metrics is handled (return None or float('inf') with a comment). A working demo split is shown.",
  },
]

const PY_LOG_ANALYZER_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Look at the log lines in sample_logs.py and the LogAnalyzer stub in analyzer.py. Describe your plan: what regex or parsing strategy will you use for parse(), what data you'll accumulate in analyze(), and how you'll handle malformed lines? Identify at least two ways a log line could be malformed.",
    success_criteria: "Plan names a concrete parsing strategy (regex with groups, or split-based). Correctly identifies the fields to extract (ip, method, path, status, bytes, response_time). Names at least two malformed line cases (missing fields, non-numeric response time, wrong date format).",
  },
  {
    round: 2,
    title: "Implement parse() and analyze()",
    prompt: "Implement parse() and analyze() in analyzer.py. parse() should return a LogEntry or None for malformed lines. analyze() should return a dict with: slowest_endpoints (top 5 by avg response_time_ms), error_rate_by_endpoint (path -> pct of 4xx/5xx, only for endpoints with >= 5 requests), and requests_by_hour (hour string -> count). Test with the sample log data.",
    success_criteria: "parse() correctly extracts all LogEntry fields. Malformed lines return None without exceptions. analyze() returns the three required keys with correct values. slowest_endpoints is sorted correctly. error_rate_by_endpoint filters to endpoints with >= 5 requests. requests_by_hour groups correctly by hour.",
  },
  {
    round: 3,
    title: "Add alerting",
    prompt: "Implement the alert(threshold_ms, error_rate_pct) method. It should return a list of dicts, one for each endpoint that breaches either threshold: {'endpoint': path, 'avg_response_ms': float, 'error_rate_pct': float, 'reasons': list[str]}. The reasons list should say which threshold(s) were breached. Also implement report() to print a human-readable summary.",
    success_criteria: "alert() correctly identifies endpoints breaching either or both thresholds. Each result includes all required fields. reasons list accurately describes which threshold(s) were breached. report() prints a readable multi-line summary with key metrics.",
  },
]

const PY_INVENTORY_SYNC_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Read models.py, warehouse_a.py, and warehouse_b.py. Before writing any code: describe your sync strategy. How will you identify matching SKUs? What counts as a conflict (the threshold is already defined in sync.py)? How will you handle SKUs that only exist in one warehouse? What should the return value look like for a conflict?",
    success_criteria: "Plan correctly identifies the conflict condition (quantity OR price diverges by > threshold). Describes using SKU as the key for matching. Handles the three cases: match without conflict, match with conflict, SKU only in one source. Describes the SyncResult shape.",
  },
  {
    round: 2,
    title: "Implement sync_inventory()",
    prompt: "Implement sync_inventory() in sync.py. For matching SKUs without conflict: take the record with the more recent last_updated timestamp. For conflicts: include both versions in the conflicts list. SKUs only in one warehouse go in only_in_a or only_in_b. Return a SyncResult with all four fields populated. Test with the provided warehouse data.",
    success_criteria: "sync_inventory returns a SyncResult with correct merged, conflicts, only_in_a, and only_in_b lists. Conflict detection uses the threshold correctly (> not >=). Non-conflicting duplicates correctly pick the newer record. only_in_a and only_in_b are correctly populated. The total product count across all four lists adds up correctly.",
  },
  {
    round: 3,
    title: "Add conflict resolution strategies",
    prompt: "Add a ConflictStrategy enum (or string literal type) with options: take_a, take_b, take_newer, take_min_quantity, take_max_quantity, average_price. Update sync_inventory() to accept a strategy: ConflictStrategy = 'take_newer' parameter. When a strategy is provided, resolve conflicts automatically instead of putting them in the conflicts list. Add at least one test demonstrating the average_price strategy.",
    success_criteria: "ConflictStrategy is defined as an enum or Literal type. sync_inventory accepts the strategy param. All 5+ strategies are implemented correctly. When a strategy is active, conflicts list is empty (all resolved). average_price rounds to 2 decimal places. Demo test shows correct resolution.",
  },
]

const PY_RATE_LIMITER_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Read the RateLimiter stub in rate_limiter.py and the test cases in test_rate_limiter.py. Before coding: explain the token bucket algorithm in your own words. How will you track time between allow() calls to refill tokens correctly? Why does the test mock time.time, what would go wrong if tests used real wall-clock time?",
    success_criteria: "Explanation correctly describes token bucket: tokens accumulate up to capacity at refill_rate/sec, each request consumes 1 token. Identifies that time.time() is mocked so tests don't depend on real timing. Describes storing (tokens, last_refill_timestamp) per user.",
  },
  {
    round: 2,
    title: "Implement allow() and status()",
    prompt: "Implement allow(), status(), and reset() in rate_limiter.py. Run the test suite with 'python -m pytest test_rate_limiter.py -v', all 8 tests should pass. Pay attention to: how tokens are refilled lazily (only when allow() or status() is called), the capacity cap, and handling users who haven't made any requests yet (they start with a full bucket).",
    success_criteria: "All 8 tests pass. Tokens refill lazily based on elapsed time since last call. New users start at full capacity. Tokens are capped at capacity after refill. allow() atomically checks-and-decrements. status() returns all three required fields. reset() removes the bucket entry.",
  },
  {
    round: 3,
    title: "Add burst tolerance",
    prompt: "Add a burst_multiplier parameter to RateLimiter (default 1.0). When burst_multiplier > 1, a user who has been idle for at least 5 seconds gets a temporary capacity of capacity * burst_multiplier for their next burst, reverting to normal capacity afterward. Implement this and write 2 new tests: one that confirms burst is granted after 5s idle, one that confirms it's NOT granted if idle < 5s.",
    success_criteria: "burst_multiplier param added to __init__. After >= 5s idle, allow() uses burst capacity. After the burst is consumed or any sub-5s activity occurs, capacity reverts to normal. Two new tests written and passing. Existing 8 tests still pass.",
  },
]

const PY_DATA_PIPELINE_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Read the code and find the bugs",
    prompt: "Read pipeline.py carefully. The pipeline is supposed to: extract raw records, deduplicate them, bucket by 7-day periods, aggregate amounts by (source, period), and produce a summary report. It runs without errors on normal data but produces wrong output on edge cases. Without running any code yet, read through each function and identify what you think is wrong. Write your hypotheses as comments or a planning doc.",
    success_criteria: "Identifies at least 2 of the 3 bugs: (1) dedup uses id-only key, missing source in composite key; (2) float amounts accumulated without rounding causing precision errors; (3) min_date computed before dedup so removed records can shift the period baseline. Describes what each bug would cause in practice.",
  },
  {
    round: 2,
    title: "Fix the bugs",
    prompt: "Run 'python test_pipeline.py' to see which tests fail. Fix all three bugs in pipeline.py: the deduplication key, the float precision in load(), and the min_date timing issue. After each fix, re-run the tests to confirm. Explain each bug and fix in a comment above the changed line.",
    success_criteria: "All tests in test_pipeline.py pass after fixes. Bug 1 fixed: dedup key changed to (id, source). Bug 2 fixed: amounts rounded to 2 decimal places in load(). Bug 3 fixed: min_date computed after dedup. Each fix has a comment explaining what was wrong and why the fix is correct.",
  },
  {
    round: 3,
    title: "Optimize for 10M rows",
    prompt: "The pipeline currently loads all records into memory. Describe what would happen with 10M records (memory, performance). Then refactor transform() and load() to use generators or streaming where possible. You don't need a real 10M dataset, write a generator that produces synthetic records and show that your refactored pipeline processes them without loading everything into RAM at once.",
    success_criteria: "A written analysis of the memory/performance problem with the current approach. transform() refactored to yield results instead of building a full list. A synthetic generator function is written. Demo shows the pipeline processing records in a streaming fashion. Memory usage is O(unique sources * periods) not O(n records).",
  },
]

const PY_TASK_QUEUE_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Map the bugs before touching code",
    prompt: "Read queue.py, worker.py, and scheduler.py carefully. The test suite in test_scheduler.py is currently failing. Before writing a single line of code, map out: (1) what the intended behavior of each class is, (2) what the actual broken behavior is, and (3) how you'd fix each issue. Identify all 4 bugs: wrong heap ordering in PriorityQueue, missing timeout in Worker, broken shutdown in TaskScheduler, and missing post-shutdown guard.",
    success_criteria: "All 4 bugs correctly identified with a clear description of each: heap ordering uses min-heap but higher priority numbers should run first; Worker.run() doesn't wrap task execution in a timeout; TaskScheduler.shutdown() doesn't drain the queue before stopping workers; no guard prevents submit() after shutdown. Each description names the specific line or pattern that's wrong.",
  },
  {
    round: 2,
    title: "Fix all 4 bugs",
    prompt: "Fix all 4 bugs identified in Round 1. Run 'python test_scheduler.py' after each fix to see tests go from red to green. Fixes needed: (1) PriorityQueue should be a max-heap (higher priority number = runs first), (2) Worker should timeout tasks after task.timeout_seconds if set, marking them as FAILED, (3) TaskScheduler.shutdown() should drain remaining queued tasks before joining workers, (4) submit() should raise RuntimeError if called after shutdown().",
    success_criteria: "All tests in test_scheduler.py pass. Heap ordering is correct (priority 10 runs before priority 1). Workers timeout tasks that exceed timeout_seconds. shutdown() processes all queued tasks before returning. submit() after shutdown() raises RuntimeError. No regression on previously passing behavior.",
  },
  {
    round: 3,
    title: "Add a dead letter queue",
    prompt: "Add a DeadLetterQueue to the system. Tasks that fail (raise an exception) should be retried up to 3 times. After 3 failures, the task is moved to the DeadLetterQueue with its full error history (list of exception messages). Add TaskScheduler.get_dead_letters() -> list[Task] and TaskScheduler.retry_failed() which re-queues all dead letter tasks with a reset attempt counter. Write 2 tests: one confirming a task lands in DLQ after 3 failures, one confirming retry_failed() re-queues it.",
    success_criteria: "DeadLetterQueue class implemented. Tasks retry up to 3 times before DLQ. Each Task in DLQ has error_history: list[str] populated. get_dead_letters() returns correct tasks. retry_failed() re-queues all DLQ tasks and clears the DLQ. Two new tests written and passing.",
  },
]

const JS_SHOPPING_CART_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Read products.js (the catalog), coupons.js, and the Cart stub in cart.js. Before coding: describe the internal state the Cart class needs to hold (what data structure for items?), how addItem() should behave when called twice with the same product, what getTotal() should return for an empty cart, and what edge cases exist around quantity and out-of-stock items.",
    success_criteria: "Plan correctly identifies that items should be stored as a Map or object keyed by productId. Describes that addItem() with an existing product increments quantity. Handles edge cases: out-of-stock items, quantity <= 0, product not in catalog. getSummary() shape described.",
  },
  {
    round: 2,
    title: "Implement the Cart class",
    prompt: "Implement all Cart methods in cart.js. Requirements: addItem(productId, qty) throws if product not found or out of stock; removeItem removes completely; updateQty(productId, qty) with qty <= 0 removes the item; getTotal() returns the sum of (price * qty) for all items; getSummary() returns { items: [{product, qty, subtotal}], total, itemCount }. Test using the examples in test_cart.js.",
    success_criteria: "addItem throws for unknown productId and out-of-stock items. updateQty with qty <= 0 removes item. getTotal() returns correct sum. getSummary() returns all required fields with correct values. Each item in getSummary.items has product (from CATALOG), qty, and subtotal. Test examples produce expected output.",
  },
  {
    round: 3,
    title: "Add coupon support",
    prompt: "Implement applyCoupon(code) using the COUPONS data in coupons.js. A coupon has a type ('percent' or 'flat'), a value, and a minOrder requirement. applyCoupon() should throw if the coupon code is invalid, throw if the cart total doesn't meet minOrder, and otherwise store the applied coupon. Update getTotal() to apply the discount. Coupons should not stack, applying a second coupon replaces the first. Add clearCoupon() too.",
    success_criteria: "applyCoupon() validates code and minOrder, throws with descriptive messages. Percent discount correctly reduces total. Flat discount doesn't make total go below 0. Applied coupon is accessible (e.g. cart.appliedCoupon). getTotal() reflects the discount. clearCoupon() removes it. Stacking is prevented.",
  },
]

const JS_FORM_VALIDATOR_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Read validator.js (the class stubs) and test_validator.js (expected usage). The API is a fluent chain: new Validator().field('email').required().email(). Describe how you'll implement this: what does field() return, how do rules accumulate, how does validate(data) collect errors across all fields, and what should the error object shape look like?",
    success_criteria: "Describes that field() returns a FieldValidator instance and stores it in the Validator. Rules are stored as an array of functions on FieldValidator. validate() iterates all fields, runs each rule, collects errors. Error shape described: {fieldName: [errorMessage, ...]}. Returns {valid: bool, errors: {}}.",
  },
  {
    round: 2,
    title: "Implement the Validator",
    prompt: "Implement Validator and FieldValidator in validator.js, and all 8 rule functions in rules.js (required, minLength, maxLength, email, numeric, matches, min, max). validate(data) should return {valid: boolean, errors: {fieldName: string[]}}. All rules from the field chain should run even if an earlier rule fails (collect all errors, don't stop at first). Test with the examples in test_validator.js.",
    success_criteria: "Fluent chaining works: new Validator().field('x').required().minLength(3). validate() returns correct shape. All 8 rules implemented correctly. Errors are collected for all failing rules (not short-circuited). Valid data returns {valid: true, errors: {}}. Invalid data returns {valid: false, errors: {fieldName: [...]}}.",
  },
  {
    round: 3,
    title: "Add async validation",
    prompt: "Add an asyncCustom(fn) method to FieldValidator, fn is an async function that receives the field value and returns null (valid) or an error string (invalid). Update validate() to detect if any asyncCustom validators are registered and return a Promise<ValidationResult> in that case (synchronous validate still returns synchronously when no async rules). Add a field that uses mockCheckUsername() from mock_api.js and test it.",
    success_criteria: "asyncCustom(fn) added to FieldValidator. validate() returns a Promise when any async rules exist, plain object otherwise. Async rules are awaited in parallel (Promise.all, not sequential). Mock username check works correctly. Synchronous validate() still works unchanged for forms without async rules.",
  },
]

const JS_PROMISE_POOL_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Plan your approach",
    prompt: "Read pool.js and test_pool.js. The test shows 10 tasks being added to a pool with concurrency=3, at most 3 should run simultaneously. Before coding: explain why Promise.all() can't solve this, describe how you'll track in-flight vs queued tasks, and walk through what happens step by step when a slot frees up (a running task completes).",
    success_criteria: "Correctly explains that Promise.all() launches all tasks immediately with no concurrency control. Describes tracking active count and a queue of waiting task functions. Walk-through correctly describes: task completes → active count decreases → next task dequeued → active count increases → recursive or iterative continuation.",
  },
  {
    round: 2,
    title: "Implement PromisePool",
    prompt: "Implement PromisePool in pool.js. add(fn, opts) enqueues a task function (fn returns a Promise). run() executes all added tasks with at most this.concurrency running at once and returns a Promise that resolves when all tasks complete. Use the mock functions in mock_api.js to test, the console output should show max 3 tasks running concurrently. Also emit progress: call this.onProgress(completed, total) after each task finishes if set.",
    success_criteria: "run() starts exactly concurrency tasks simultaneously. As tasks complete, new ones start immediately (no idle slots). run() resolves only after ALL tasks complete. Concurrency limit is never exceeded. onProgress is called after each completion with correct counts. Works correctly when total tasks < concurrency.",
  },
  {
    round: 3,
    title: "Add timeout and cancellation",
    prompt: "Extend add(fn, { timeout }), if timeout (ms) is set and the task doesn't resolve/reject within that time, it should be rejected with a TimeoutError and the slot freed. Add pool.cancel(), prevents any not-yet-started tasks from running and rejects their promises with a CancelledError. Already-running tasks complete normally. Update run() to resolve with results array (including errors) rather than throwing on first failure.",
    success_criteria: "Timeout correctly rejects tasks that take too long. TimeoutError has a descriptive message. cancel() stops queued tasks without affecting running ones. CancelledError used for cancelled tasks. run() resolves with {results: [], errors: []} or similar, doesn't throw on individual task failure. All previous functionality still works.",
  },
]

const JS_EVENT_STORE_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Read the code and find the bugs",
    prompt: "Read store.js, projections.js, and events.js. The EventStore is supposed to: append events, notify subscribers, maintain projections, and support replaying from a past version. Run the tests: 'node test_store.js', some will fail. Before fixing anything, read every method carefully and write down: (1) what event sourcing is supposed to do, (2) what each bug is and what it causes, (3) what subscribe() should do (it's incomplete). Identify all 3 bugs.",
    success_criteria: "Correctly describes event sourcing: events are immutable facts, state is derived by replaying them. Identifies all 3 bugs: (1) replayFrom() doesn't reset/rebuild projections before replaying; (2) subscribers are notified before the event is committed to this._events; (3) getState() returns a direct reference to internal state, not a copy. Describes what subscribe() should do: register a handler called for matching event types.",
  },
  {
    round: 2,
    title: "Fix the bugs and complete subscribe()",
    prompt: "Fix all 3 bugs in store.js and implement subscribe(eventType, handler). Bug 1: replayFrom() must reset projections to their initial state and replay from the specified version. Bug 2: commit the event to this._events BEFORE notifying subscribers. Bug 3: getState() must return a deep copy (JSON parse/stringify or structuredClone). For subscribe(): store handlers by eventType, call matching handlers after an event is committed. Re-run tests, all should pass.",
    success_criteria: "All tests in test_store.js pass. replayFrom() correctly rebuilds state from scratch. Subscribers receive events only after commit. getState() returns a deep copy, mutating it doesn't affect internal state. subscribe() registers handlers that are called with committed events. Unsubscribe function returned from subscribe() works correctly.",
  },
  {
    round: 3,
    title: "Add snapshotting",
    prompt: "Implement createSnapshot(aggregateId), saves the current projected state for an aggregate so that replayFrom() can start from the snapshot instead of event 0. Implement getSnapshot(aggregateId) -> {version, state} | null. Update replayFrom(version, aggregateId) to check for a snapshot at or before the requested version and start replay from there. Write a test that creates 100 events, snapshots at 50, then calls replayFrom(75) and confirms it only replays events 50-75.",
    success_criteria: "createSnapshot() stores current state with the current version number. getSnapshot() returns the latest snapshot before or at the requested version. replayFrom() uses the snapshot as starting state and only replays events after the snapshot version. A test with 100 events demonstrates that only 25 events are replayed (not 75). Snapshot does not break normal append/subscribe flow.",
  },
]

const SALES_DEAL_MEMO_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Write the deal summary",
    prompt:
      "You are preparing an internal deal memo for a $340,000 enterprise opportunity at Northgate Financial Services (1,200 employees, regional bank). The deal is for a 3-year contract on your company's document automation platform. The economic buyer is the CFO; the champion is the VP of Operations. Key context: Northgate currently uses a legacy system that requires 4 FTE to manage document workflows; your platform reduces that to 1.5 FTE. Their Q3 board meeting is in 6 weeks and the CFO wants a cost reduction story. Write the deal summary section of the memo. Include: opportunity overview (size, term, product), business problem being solved, why now (the timing driver), and the economic case (FTE savings, payback period at a blended $85k/yr FTE cost).",
    success_criteria:
      "Memo includes opportunity overview with contract value ($340k), term (3 years), and product named. Business problem is specific to Northgate's 4-FTE workflow burden. 'Why now' references the Q3 board timeline as a concrete driver. Economic case shows correct math: 2.5 FTE saved x $85k = $212,500/yr savings, payback period under 2 years. All four sections present and clearly labeled.",
  },
  {
    round: 2,
    title: "Handle the competitive threat",
    prompt:
      "New information: Northgate is also evaluating DocuFlow Pro, a competitor priced at $280,000 for the same term. DocuFlow Pro has a stronger brand in the banking sector but lacks API integrations with Northgate's core banking system (Temenos T24). Your platform has a certified Temenos connector. The VP of Operations has sent you a note saying the CFO is leaning toward DocuFlow because of the price gap. Add a competitive positioning section to the memo. Address: the $60,000 price delta and how to reframe it, the integration risk DocuFlow creates, and the recommendation for how your champion should position this with the CFO.",
    success_criteria:
      "Competitive section addresses the $60k price gap with a framing that quantifies integration risk or implementation cost for DocuFlow (not just 'we're better'). References the Temenos T24 connector as a concrete differentiator. Provides a specific recommendation the VP of Operations can use with the CFO, not generic talking points. Section is concise and reads as internal strategy, not a sales pitch.",
  },
  {
    round: 3,
    title: "Assess risk and write the close plan",
    prompt:
      "Complete the memo with two final sections. First, a risk assessment: identify the top 3 risks to this deal closing (consider procurement timeline, CFO conviction, internal politics, and integration scope) and rate each as High, Medium, or Low with a mitigation action. Second, a close plan: write a 6-week action plan with specific milestones tied to the Q3 board meeting. Name who owns each milestone (you as AE, your champion, or a mutual action). The memo should now read as a complete, executive-ready document.",
    success_criteria:
      "Risk section names 3 distinct risks, each with a H/M/L rating and a specific mitigation action. Close plan has at least 4 milestones over 6 weeks with dates or week numbers. Each milestone has a clear owner. The final memo reads as a cohesive internal document a VP of Sales could pick up and review without asking follow-up questions.",
  },
]

const PR_CRISIS_EMAIL_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Draft the initial holding statement",
    prompt:
      "You are the Head of Communications at Meridian Health Tech, a 400-person health data analytics company. At 7:14 AM this morning, a security researcher posted on X that a misconfigured S3 bucket exposed patient demographic records for approximately 14,000 individuals from three hospital clients. The data included names, dates of birth, and zip codes (no SSNs, no medical records). Your CEO has just called and needs a holding statement to send to the three affected hospital clients within the hour, before this hits the press. Engineering has already taken the bucket offline. Write the email holding statement. It must: acknowledge the situation without speculation, state what is and is not known, confirm the immediate action taken, and commit to a follow-up timeline (within 4 hours). Do not minimize or use passive voice around the breach itself.",
    success_criteria:
      "Email acknowledges the exposure directly and specifically (not 'a potential issue'). States clearly what data was involved (names, DOB, zip codes) and what was not (SSNs, medical records). Confirms the bucket has been taken offline. Commits to a specific follow-up time (4 hours or similar). Does not use phrases that minimize responsibility or shift blame. Appropriate tone for a hospital client. Under 250 words.",
  },
  {
    round: 2,
    title: "Write the full client notification email",
    prompt:
      "Four hours have passed. Forensics confirmed: the bucket was exposed for 11 days (April 3 to April 14), the misconfiguration was caused by a contractor who bypassed the standard IAM policy review, the contractor's access has been revoked, and there is no evidence of data exfiltration (no download logs). Send the full formal notification email to the hospital clients. This email will likely be shared with their legal and compliance teams and possibly regulators. Include: a complete incident description with timeline, root cause, scope of exposure, confirmed findings (no exfiltration), remediation actions taken, and three specific measures you are implementing to prevent recurrence. Also include a point of contact for questions.",
    success_criteria:
      "Email includes all six required sections (incident description, timeline with April 3 to 14 dates, root cause referencing contractor and IAM bypass, scope with 14,000 individuals and data types, no-exfiltration finding, remediation steps). Three distinct prevention measures listed. Named contact provided. Tone is formal and appropriate for legal and compliance review. Would pass a basic HIPAA breach notification structure review.",
  },
  {
    round: 3,
    title: "Draft the internal all-hands message",
    prompt:
      "The CEO needs to send an all-hands message to Meridian's 400 employees by 5 PM today. The story has been picked up by Healthcare IT News. Employees are nervous and some have received questions from friends and family. Write the all-hands email in the CEO's voice. It should: explain what happened in plain language, acknowledge seriousness without catastrophizing, describe what has been done, and give employees clear guidance on what to say if asked by clients or contacts (direct them to a single spokesperson). Do not use corporate-speak or hollow reassurance framing.",
    success_criteria:
      "Written in a credible CEO voice, not a PR template. Explains the incident in plain language a non-technical employee can understand and repeat. Acknowledges seriousness without catastrophizing. Gives employees one specific instruction for handling external questions. Avoids hollow reassurance phrases. 300 to 450 words. Does not contradict the external notification email.",
  },
]

const HR_HIRING_RUBRIC_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the competency framework",
    prompt:
      "You are a Senior People Ops Partner at a 180-person B2B SaaS company (Series B, remote-first). The hiring manager for a Senior Product Designer role has complained that the last two panels gave wildly inconsistent feedback: one candidate was rated 4/5 by three interviewers and 1/5 by a fourth, with no explanation of the gap. You have been asked to design a structured hiring rubric for this role before the next panel starts in two weeks. The role requires: strong systems thinking in design (not just visual polish), experience shipping features in an Agile environment, ability to present and defend design decisions to non-designers, and cross-functional collaboration. Start by defining the 5 core competencies you will evaluate. For each, write a one-sentence definition and explain why it matters for this specific role.",
    success_criteria:
      "Exactly 5 competencies defined. Each has a concise one-sentence definition that is specific (not 'communication skills'). Each includes a rationale tied to the Senior Product Designer role context. Competencies are meaningfully distinct from each other. At least one competency addresses the systems thinking requirement mentioned in the brief.",
  },
  {
    round: 2,
    title: "Write the scoring guide",
    prompt:
      "Now build the scoring guide for your 5 competencies. For each competency, write behavioral anchors for three performance levels: Does Not Meet Bar (1 to 2), Meets Bar (3), and Exceeds Bar (4 to 5). A behavioral anchor is a specific, observable behavior, not an adjective. Example of a bad anchor: 'Shows creativity.' Example of a good anchor: 'Proposes at least two alternative design solutions when presenting, proactively names the tradeoffs of each.' Also add one example interview question per competency that would elicit evidence for that competency.",
    success_criteria:
      "All 5 competencies have anchors at all 3 levels. Anchors are behavioral and observable (describe what someone does, not what they 'are'). No anchor uses adjectives without behavioral specificity. Each higher-level anchor is meaningfully more demanding than the lower level. 5 interview questions included, each genuinely likely to surface evidence for its mapped competency.",
  },
  {
    round: 3,
    title: "Write the calibration protocol",
    prompt:
      "The rubric is ready. Now write the calibration protocol: the process interviewers follow before, during, and after each interview to ensure scores stay consistent and unbiased. Address: (1) what each interviewer must do before meeting the candidate, (2) how scoring should be submitted (individually and when, to prevent anchoring), (3) how to run the debrief meeting (time limit, agenda, who speaks first, how to handle outlier scores), and (4) what the hiring manager is NOT allowed to do during calibration. Also add a short section on two common bias patterns in design interviews and how this process mitigates them.",
    success_criteria:
      "Protocol has four clearly labeled sections. Pre-interview requirements are specific. Scoring submission process prevents anchoring (individual scoring before debrief). Debrief agenda includes a rule about outlier scores. Hiring manager restriction is stated explicitly. Two bias patterns are named (not just 'unconscious bias') and linked to specific protocol steps. Reads as a document an interviewer could follow without additional coaching.",
  },
]

const OPS_VENDOR_SCORECARD_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the evaluation framework",
    prompt:
      "You are the Head of Operations at a 90-person DTC e-commerce company (apparel, $22M annual revenue). Your 3PL contract is up for renewal in 90 days and you are running a competitive evaluation. Three providers are in the running: ShipCore (incumbent, 4-year relationship), FastFulfill (challenger, 25% cheaper per unit), and PrecisionLogistics (premium option, same price as current, stronger technology). Build the vendor scorecard framework: define the 8 evaluation categories you will score, assign a weight to each (weights must sum to 100%), and write a one-sentence description of what you are measuring in each category. Choose weights that reflect what matters most for a DTC apparel company with high SKU count and seasonal demand spikes.",
    success_criteria:
      "Exactly 8 categories defined. Weights sum to exactly 100%. Each category has a one-sentence description. Weight distribution reflects DTC apparel context: fulfillment accuracy, speed, and peak capacity should carry higher weight than, for example, international shipping. No single category weighted above 25% without a strong implied rationale.",
  },
  {
    round: 2,
    title: "Score the three vendors",
    prompt:
      "You have completed demos and reference calls. ShipCore: fulfillment accuracy 99.1%, avg ship time 2.4 days, on-time delivery 96.8%, technology is dated (no real-time inventory API), support is responsive, poor peak season performance in 2022 (missed SLAs for 3 weeks), pricing $2.18/unit. FastFulfill: accuracy 97.4%, ship time 1.9 days, on-time delivery 94.2%, modern technology (Shopify integration, real-time inventory), offshore support (slow to escalate), no peak track record (launched 2022), pricing $1.63/unit. PrecisionLogistics: accuracy 99.6%, ship time 2.1 days, on-time delivery 98.1%, best-in-class technology (custom API, EDI support), dedicated account manager, strong peak track record (maintained SLAs through Q4 2022 and Q4 2023), pricing $2.20/unit. Score each vendor 1 to 5 on each of your 8 categories. Show your weighted score for each. Identify the winner and explain why the data supports that conclusion.",
    success_criteria:
      "All three vendors scored 1 to 5 on all 8 categories. Weighted scores correctly calculated. Scores are internally consistent with the data: FastFulfill scores poorly on peak performance and support, ShipCore scores poorly on technology and peak history, PrecisionLogistics leads overall but is not perfect. Winner identified with a rationale referencing at least two specific data points.",
  },
  {
    round: 3,
    title: "Write the recommendation memo",
    prompt:
      "Based on your scorecard analysis, write the vendor recommendation memo to your CEO and CFO. The CFO's primary concern is unit economics (she will push back on any option that costs more than FastFulfill). The CEO cares most about customer experience and the brand's 4.7-star average review score. Your memo should: state your recommendation clearly in the first sentence, present the financial comparison (total annual cost difference at 1.2M units shipped per year), address the CFO's concern with a risk-adjusted framing (what does a 1% accuracy miss cost in returns and re-ships vs. the per-unit savings?), and include one specific contract term you will negotiate regardless of which vendor is chosen.",
    success_criteria:
      "Recommendation stated in first sentence, unambiguously. Financial comparison shows correct math: at 1.2M units, FastFulfill saves $660k/year vs. PrecisionLogistics ($1.63 vs $2.20 x 1.2M). Risk-adjusted framing quantifies cost of accuracy gap: 2.2% difference x 1.2M units = 26,400 additional errors at $8 to $12 per re-ship. One specific contract term named. Memo is concise and written for a CEO and CFO audience.",
  },
]

const LEGAL_CONTRACT_REVIEW_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Identify and classify the risk clauses",
    prompt:
      "You are a Legal/Compliance Analyst at a 250-person SaaS company (HR tech, Series C). Your company is being asked to sign a Master Services Agreement with Talmadge Group, a 12,000-employee manufacturing client. The contract value is $1.8M over 3 years. Below are five excerpts. Read each and produce a risk classification table: clause name, risk level (High/Medium/Low), what the specific risk is in plain language, and whether this clause is standard, unusual, or aggressive relative to typical SaaS MSA terms.\n\nClause 1 (Indemnification, Section 8.3): 'Vendor shall indemnify, defend, and hold harmless Talmadge Group and its affiliates, officers, directors, and employees from and against any and all claims, damages, losses, and expenses, including reasonable attorneys fees, arising out of or relating to Vendor's performance under this Agreement, regardless of the negligence of Talmadge Group.'\n\nClause 2 (Liability Cap, Section 9.1): 'Notwithstanding anything to the contrary, each party's total aggregate liability shall not exceed the amounts paid by Customer in the twelve months preceding the claim.'\n\nClause 3 (Data Processing, Section 12.4): 'Vendor shall process Customer Data solely as directed by Customer and shall not retain Customer Data for more than 30 days following termination of this Agreement. Vendor agrees to delete all Customer Data within 7 days of a written deletion request.'\n\nClause 4 (Audit Rights, Section 14.1): 'Customer may audit Vendor's systems, processes, and facilities related to this Agreement upon 5 business days written notice, no more than twice per calendar year. Customer may engage a third-party auditor at its own expense.'\n\nClause 5 (Governing Law, Section 18.2): 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware. Any disputes shall be resolved exclusively by the state or federal courts located in New Castle County, Delaware.'",
    success_criteria:
      "All five clauses analyzed. Risk levels are defensible: Clause 1 should be High risk (unlimited indemnification regardless of Talmadge negligence is aggressive), Clause 2 should be Low to Medium (12-month cap is standard), Clause 3 should be Low (protective of customer, standard for data processors), Clause 4 should be Medium (5-day notice with third-party auditor is somewhat aggressive), Clause 5 should be Low (Delaware governing law is standard). Plain-language risk descriptions are accurate and non-lawyer-readable.",
  },
  {
    round: 2,
    title: "Draft the redlines",
    prompt:
      "Draft proposed redline language for the two highest-risk clauses you identified. For each redline: show the original language, show your proposed replacement language, and write a negotiation note (2 to 3 sentences) explaining the business rationale your legal team will use when presenting this to Talmadge's counsel. The goal is to protect your company while keeping the deal alive. The language should be legally plausible, not just vague softening.",
    success_criteria:
      "Two clauses redlined with original and proposed language shown side by side. Proposed language is substantively different, not just minor word changes. For Clause 1: redline should limit indemnification to Vendor's own negligence or breach, removing the 'regardless of Talmadge negligence' language. Negotiation notes are written for a business audience and explain why the original creates unacceptable risk. Language is plausible for a real negotiation.",
  },
  {
    round: 3,
    title: "Write the executive risk brief",
    prompt:
      "The VP of Legal needs a one-page executive brief she can bring to the CEO and CFO before they approve this contract. They are not lawyers. Write the brief covering: a deal summary (value, term, counterparty), an overall risk assessment (1 to 3 sentence verdict), the top 3 issues and their current status (open for negotiation, resolved, or accepted), and a go/no-go recommendation with one specific condition. The brief must be scannable and written for a non-lawyer executive.",
    success_criteria:
      "Brief is structured and scannable. Deal summary is accurate to the scenario ($1.8M, 3 years, Talmadge Group). Overall risk assessment gives a clear verdict sentence. Top 3 issues listed with status labels. Go/no-go recommendation is stated explicitly (not 'it depends'), with one specific condition attached. Written in plain language a non-lawyer CFO could read in 90 seconds.",
  },
]

const PRODUCT_COMPETITIVE_DECK_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Map the competitive landscape",
    prompt:
      "You are a Product Manager at Relay, a 60-person B2B workflow automation startup ($6M ARR, Series A). Your primary competitors are Zapier (market leader, 2.5M users, broad integrations), Make (formerly Integromat, strong with technical users, complex multi-step flows), and n8n (open-source, self-hostable, developer-first). Relay's differentiation: purpose-built for human-in-the-loop workflows, where automation pauses for a human to review, approve, or decide before continuing. Build the landscape analysis section of the competitive teardown deck. Create a comparison matrix slide covering: core use case, target user, pricing model, human-in-the-loop capability (1 to 5 rating with one-line justification), and one sentence on where each competitor is weakest. Include a slide framing where Relay wins (the specific scenarios where human-in-the-loop matters most).",
    success_criteria:
      "Comparison matrix covers all four players (Relay, Zapier, Make, n8n). All five comparison dimensions populated for each. Human-in-the-loop ratings are defensible: Zapier should be 1 to 2, Make should be 2 to 3, n8n should be 2 to 3, Relay should be 4 to 5. Competitor weaknesses are specific. 'Where Relay wins' slide names at least 3 concrete use case scenarios.",
  },
  {
    round: 2,
    title: "Analyze Zapier in depth",
    prompt:
      "The product team wants a deep dive on Zapier specifically, since 65% of Relay's inbound leads mention coming from Zapier. Build 2 to 3 slides analyzing Zapier's product strategy: what jobs-to-be-done their product serves best, where their product design creates friction for complex approval workflows (cite specific product decisions, not just 'it's simple'), their pricing model and how it creates a ceiling that drives users toward alternatives, and one slide on Relay's 'land and expand' opportunity given Zapier's weaknesses. This section should read as rigorous product analysis, not a sales hit piece.",
    success_criteria:
      "Jobs-to-be-done framing used correctly (describes what users hire Zapier to do, not feature lists). Friction points are specific and product-level (e.g., step-based model, limited conditional branching, no native approval UI). Pricing model analysis correctly describes task-based pricing and why power users hit ceilings. Land and expand opportunity names specific Relay features that address Zapier gaps. Tone is analytical, not disparaging.",
  },
  {
    round: 3,
    title: "Write the strategic recommendations",
    prompt:
      "Close the deck with a strategic recommendations section. Based on your competitive analysis, write: (1) one offensive move Relay should make in the next 6 months to widen its moat against the most dangerous competitive threat, (2) one defensive move to protect Relay's position against the most likely response from Zapier if Relay continues to grow, and (3) one product gap in Relay that could become a competitive vulnerability within 12 months if not addressed. Each recommendation must include a 'how to measure success' metric. End with one 'bottom line' sentence a CEO could quote in a board meeting.",
    success_criteria:
      "Three distinct strategic recommendations (offensive, defensive, product gap). Each is specific enough to be actionable. Each has a measurable success metric. The offensive and defensive moves are logically tied to findings from the earlier analysis. Bottom line is a single crisp sentence that could credibly appear in a board deck.",
  },
]

const CONTENT_SEO_STRATEGY_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Audit and prioritize",
    prompt:
      "You are a Content Strategist at Trove, a 45-person fintech startup that helps freelancers and independent contractors manage business finances (invoicing, expense tracking, estimated taxes). The marketing team has been publishing blog content for 18 months but organic traffic has plateaued at 12,000 sessions per month and almost none of it converts. Data: Top 10 organic landing pages by traffic: 6 are generic 'freelance tips' posts (e.g., '10 Tips for Freelancers'), 3 are product feature pages with thin content, 1 is a comparison post ('Trove vs. QuickBooks') that drives 40% of all trial signups despite being only 8% of traffic. Target ICP: US-based freelancers, $50k to $200k annual revenue, primary pain points are tax time stress and cash flow unpredictability. Conduct a content audit and strategic gap analysis. Identify: what the current content is doing wrong (3 specific issues, not 'the content is bad'), the 3 highest-leverage content categories you would invest in next, and the strategic insight the comparison post data reveals about buyer intent.",
    success_criteria:
      "Three specific issues identified, each tied to the data (e.g., 'generic tips posts attract searchers who are not the ICP and have no purchase intent'). Three content categories are specific and tied to ICP pain points. Comparison post insight correctly identifies high-intent bottom-of-funnel traffic as the highest conversion opportunity and draws a strategic conclusion from it.",
  },
  {
    round: 2,
    title: "Build the 90-day content plan",
    prompt:
      "Based on your audit, build the 90-day content plan. Constraints: 2 full-time content writers, $4,000/month budget, publishing cadence of 8 pieces per month. The plan must include: a content mix breakdown (types and ratio), the 4 specific content pillars you will build around, a sample content calendar for month 1 (8 pieces with working titles, target keyword, and primary goal for each piece), and one distribution channel you will prioritize for amplification and why.",
    success_criteria:
      "Content mix breakdown adds up to 8 pieces per month. Four content pillars are specific and tied to the ICP. Month 1 calendar has 8 pieces with working titles specific enough to brief a writer. Each piece has a target keyword and a labeled goal (e.g., bottom-of-funnel conversion, top-of-funnel awareness). Distribution channel choice is justified with a reason tied to the ICP.",
  },
  {
    round: 3,
    title: "Define the measurement framework",
    prompt:
      "The VP of Marketing will ask 'how do we know this is working?' at 30, 60, and 90 days. Build the measurement framework. Define: the 3 North Star metrics for the content program (not vanity metrics), the leading indicators you will track in the first 30 days before you can measure organic traffic impact, and the specific thresholds that would cause you to change strategy at the 60-day check-in. Also write a 3-sentence answer to the question: 'Why will this plan work when the last 18 months of content did not?'",
    success_criteria:
      "Three North Star metrics are outcome-oriented (e.g., organic trial signups, not 'pageviews'). Leading indicators are genuinely measurable in 30 days and predictive of 90-day outcomes. Strategy-change thresholds are specific numbers, not 'if results are poor.' The 3-sentence answer directly addresses what is different about this plan, referencing specific strategic changes made.",
  },
]

const AM_QBR_DECK_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Build the account health review",
    prompt:
      "You are a Senior Account Manager at a B2B SaaS company (project management and resource planning tool). You are preparing a Q2 QBR for Hartwell Engineering, a 600-person civil engineering firm, 2-year customer at $148,000 ARR. They have 3 active modules (Project Planning, Time Tracking, Budget Management) and 2 underutilized modules (Resource Forecasting at 12% adoption, Document Collaboration at 8% adoption). NPS last quarter: 31. Executive sponsor: the CTO, who championed the purchase. Day-to-day contact: the Director of PMO. Renewal is in 5 months. Build the 'account health' section of the QBR deck. Include slides covering: usage and adoption summary (with the adoption gap clearly visualized), the ROI story based on their usage (be specific, make reasonable assumptions about time saved in project planning), and a risk assessment slide the CTO would find credible.",
    success_criteria:
      "Adoption summary clearly shows the gap between purchased and active modules. ROI story makes specific assumptions explicit (e.g., '40 PMs save 2 hours/week at a $75/hr blended rate') and calculates an annual value figure. Risk assessment identifies at least 2 specific risks tied to the account data (low adoption, NPS of 31). Slides are scannable and executive-appropriate.",
  },
  {
    round: 2,
    title: "Design the success plan slide",
    prompt:
      "The QBR's most important slide is the mutual success plan for the next 90 days. Design this slide. It must include: 2 specific initiatives to drive adoption on the underutilized modules (Resource Forecasting and Document Collaboration), each with a target metric, a timeline, and who is responsible (your team vs. Hartwell). Also include 1 initiative tied to the CTO's strategic agenda (hint: civil engineering firms are under pressure to improve project delivery predictability). Make the success plan feel like a joint commitment, not a vendor roadmap.",
    success_criteria:
      "Two adoption initiatives are specific and actionable: each names a specific intervention, a target metric with a number (e.g., 'Resource Forecasting from 12% to 45% of licensed users'), a timeline, and ownership split. The CTO-aligned initiative connects to a real business outcome. The slide reads as a joint plan, not a one-sided vendor promise.",
  },
  {
    round: 3,
    title: "Prepare for the hard conversation",
    prompt:
      "During the QBR, the CTO opens by saying: 'I need to be honest with you. We're spending $148,000 a year on this platform and two of our five modules are basically unused. My board is asking me to cut SaaS spend by 15% next quarter. Help me make the case for keeping the full contract.' Write the talking track you will use in response, and add one slide you would pull up during this conversation. The talking track should: acknowledge the valid concern directly, reframe the underutilization as an opportunity with a specific upside number, and propose a concrete alternative to a price cut that protects the relationship. Do not be defensive.",
    success_criteria:
      "Talking track opens with acknowledgment, not defense. Reframe quantifies the upside: if Resource Forecasting and Document Collaboration reach reasonable adoption, what is the incremental ROI? (Make the math explicit.) Proposed alternative to price cut is specific (e.g., a 90-day value sprint with a performance milestone tied to renewal terms). Supplementary slide makes the upside case visually. Tone is confident and collaborative.",
  },
]

const SUPPORT_ESCALATION_EMAIL_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Triage the queue and set priorities",
    prompt:
      "You are a Senior Customer Support Specialist at Lumio, a 120-person B2B SaaS company (cloud-based project reporting tool, 3,200 business customers). It is Monday morning and you have inherited 5 escalated tickets from the weekend on-call team. Triage them, assign a priority order (1 to 5, where 1 is most urgent), and write a 2-sentence internal note for each explaining your reasoning. The tickets: (A) Enterprise customer DataPath Inc. ($320k ARR) reports their weekly automated report job failed silently on Friday and their Monday board presentation is in 4 hours. An exec is CC'd. (B) Mid-market customer Birchwood Consulting ($28k ARR) has submitted 6 tickets in 7 days about the same export formatting bug, no reply from the team yet. (C) A customer reports a typo in the app's onboarding UI ('Wellcome to Lumio'). (D) Agency customer Stelmar Digital ($95k ARR) says their client-facing dashboard is showing incorrect revenue figures and they have already escalated to their client. (E) A free trial user says they cannot figure out how to add a team member and is threatening to 'post on Reddit.'",
    success_criteria:
      "Priority order is defensible: A should be 1 (enterprise, board presentation in 4 hours, exec CC'd), D should be 2 (client-facing data accuracy issue, reputational risk for Stelmar), B should be 3 (pattern of neglect risks churn despite lower ARR), E should be 4 or 5 (free trial, no ARR at risk), C should be 5 (cosmetic bug, no business impact). Internal notes for each ticket explain the prioritization reasoning using the actual data given.",
  },
  {
    round: 2,
    title: "Write the customer responses",
    prompt:
      "Handle the top two priorities. For ticket A (DataPath Inc.): Engineering confirmed the report job failed due to a data export timeout from a new query optimization deployed Friday evening. The fix is a 15-minute configuration change that requires a maintenance window. The on-call engineer is available now. Write the response to DataPath's account contact (copy the exec). For ticket D (Stelmar Digital): Engineering confirmed a timezone offset error introduced in last Thursday's deployment caused revenue figures to double-count transactions crossing midnight UTC. A hotfix was deployed 40 minutes ago and data is now correct. But Stelmar already told their client the data was wrong. Write the response to Stelmar's account contact.",
    success_criteria:
      "DataPath response: immediately actionable (proposes specific next step in the next 15 minutes), acknowledges the stakes (board presentation), confirms the fix timeline, copies the exec appropriately. Does not over-apologize or under-commit. Stelmar response: confirms the bug is fixed with specifics (timezone offset, deployed at [time]), acknowledges the client-facing impact without making Stelmar feel blamed, offers specific support for their client conversation. Neither response uses hollow phrases like 'We apologize for any inconvenience.'",
  },
  {
    round: 3,
    title: "Write the incident post-mortem summary",
    prompt:
      "The timezone offset bug (ticket D) affected 23 customers total: 3 enterprise, 14 mid-market, 6 SMB. The bug was live for 4 days (Thursday 6 PM to Monday 9 AM UTC). No customers lost data; the displayed figures were wrong but underlying data was intact. You have been asked to write the customer-facing incident summary that will be posted to Lumio's status page and emailed to all 23 affected customers. Include: incident summary, timeline, root cause (plain language), impact scope, resolution, and what you are doing to prevent recurrence (name 2 specific process changes, not 'we will do better').",
    success_criteria:
      "All six sections present and clearly labeled. Timeline uses specific dates and times consistent with the scenario. Root cause is explained in plain language a non-engineer can understand. Impact is accurately scoped (23 customers, 4 days, display error only, data intact). Two prevention measures are specific process changes (e.g., 'adding a post-deployment data validation check for revenue calculations'). Tone is direct and professional, appropriate for a status page.",
  },
]

const STRATEGY_MARKET_ENTRY_ROUNDS: AssessmentRound[] = [
  {
    round: 1,
    title: "Size the opportunity",
    prompt:
      "You are a Strategy Manager at Vanta (compliance automation SaaS, approximately $100M ARR). The executive team is evaluating whether to launch a dedicated product for the healthcare vertical (HIPAA compliance automation). Use a bottoms-up approach to build the market sizing analysis. Inputs: approximately 6,200 US healthcare organizations with 50 to 1,000 employees that would be target customers; current average contract value for Vanta's compliance products is $18,000 to $28,000 per year; estimated sales cycle for healthcare: 6 to 9 months; estimated win rate for a new vertical entrant: 8 to 12% in year 1, growing to 20 to 25% by year 3. Build the market sizing spreadsheet. Calculate: Total Addressable Market (TAM), Serviceable Addressable Market (SAM, assuming you can realistically reach 40% of the total market in 3 years), and your Serviceable Obtainable Market (SOM) for year 1 and year 3 under both conservative and aggressive assumptions. Show all assumptions explicitly.",
    success_criteria:
      "TAM calculated correctly: 6,200 x $23,000 midpoint ACV = approximately $142.6M. SAM correctly applies 40% reach to TAM = approximately $57M. Year 1 SOM conservative: 6,200 x 40% x 8% x $18,000 = approximately $3.6M. Year 1 SOM aggressive: 6,200 x 40% x 12% x $28,000 = approximately $8.3M. Year 3 ranges similarly derived. All assumptions labeled. Conservative and aggressive cases shown as separate columns or scenarios.",
  },
  {
    round: 2,
    title: "Assess feasibility and risks",
    prompt:
      "The market is large enough to pursue. Now assess feasibility. Add a second section to the spreadsheet covering: go-to-market feasibility (score each of 4 factors: sales channel readiness, marketing ICP fit, product gap assessment, partnership ecosystem, on a 1 to 5 scale with one-line rationale), competitive intensity (map the top 3 healthcare compliance competitors: Compliancy Group, Sprinto, and Accountable HQ, with one row per competitor covering their positioning, pricing tier, and a one-sentence assessment of how hard they are to displace), and a risk register with the top 4 risks to this expansion, each rated by probability (High/Med/Low) and impact (High/Med/Low) with a mitigation strategy.",
    success_criteria:
      "Go-to-market scoring is internally consistent with Vanta's context: sales channel and marketing should score medium (3/5), product gaps should score lower (2 to 3/5) since HIPAA is more specialized. Competitor table covers all 3 named competitors with defensible positioning. Risk register has 4 distinct risks with probability and impact ratings that make sense together.",
  },
  {
    round: 3,
    title: "Build the go/no-go recommendation",
    prompt:
      "Based on your market sizing and feasibility analysis, build the go/no-go recommendation section for the executive team. Include: a clear go or no-go recommendation with a one-sentence rationale, the 3 conditions that must be true for the 'go' to remain valid at the 6-month check-in (your trip wires), a resource requirement summary (headcount and investment estimate for the first 12 months, make reasonable assumptions), and a phased entry strategy: what does 'phase 1' look like in the first 6 months vs. 'phase 2' in months 7 to 12. The recommendation section should be written so the CEO could read it in 3 minutes and make a decision.",
    success_criteria:
      "Recommendation is explicit (go or no-go, not 'it depends without conditions'). One-sentence rationale summarizes the key driver from the analysis. Three trip wires are specific and measurable (e.g., 'achieve $500k in pipeline from healthcare leads within 90 days'). Resource estimate includes at least headcount and an annual cost assumption. Phase 1 and Phase 2 are meaningfully different in scope. Section is concise and decision-ready.",
  },
]

// ── Template config ────────────────────────────────────────────────

type TemplateKey =
  | "marketing"
  | "finance"
  | "cs-email"
  | "campaign-spreadsheet"
  | "product-deck"
  | "python-coding"
  | "js-coding"
  | "py-sales-report"
  | "py-log-analyzer"
  | "py-inventory-sync"
  | "py-rate-limiter"
  | "py-data-pipeline"
  | "py-task-queue"
  | "js-shopping-cart"
  | "js-form-validator"
  | "js-promise-pool"
  | "js-event-store"
  | "sales-deal-memo"
  | "pr-crisis-email"
  | "hr-hiring-rubric"
  | "ops-vendor-scorecard"
  | "legal-contract-review"
  | "product-competitive-deck"
  | "content-seo-strategy"
  | "am-qbr-deck"
  | "support-escalation-email"
  | "strategy-market-entry"

interface TemplateConfig {
  key: TemplateKey
  label: string
  workspace: WorkspaceType
  language?: "python" | "javascript"
  title: string
  role: string
  description: string
  rounds: AssessmentRound[]
  tags: string[]
  starter_files?: Record<string, string>
}

const TEMPLATES: TemplateConfig[] = [
  {
    key: "marketing",
    label: "Marketing GTM",
    workspace: "report",
    title: "Marketing: Go-to-Market Strategy",
    role: "Marketing Manager",
    tags: ["marketing", "strategy", "gtm", "b2b", "positioning", "messaging"],
    description:
      "You are a marketing candidate being assessed on your ability to build strategic messaging. The company you are working with is a B2B SaaS startup in the project management space. Their product: a Notion alternative built for engineering teams, with native GitHub integration and automated sprint planning. Target customers: engineering managers at companies with 20 to 200 engineers.",
    rounds: MARKETING_TEMPLATE,
  },
  {
    key: "finance",
    label: "Finance Analysis",
    workspace: "report",
    title: "Finance: Strategic Analysis",
    role: "Finance / Strategy Analyst",
    tags: ["finance", "analysis", "data", "strategy", "churn", "saas-metrics"],
    description:
      "You are a strategy analyst being assessed on your ability to interpret data and communicate insights clearly. Below is 6 months of customer data for a SaaS company:\n\n- Monthly churn rate: 3.2% (industry avg: 1.8%)\n- Top churn reasons (exit surveys): pricing (38%), missing features (31%), switching to competitor (21%), other (10%)\n- Net new MRR: +$42k/mo (growing)\n- ARPU: $180/mo (flat for 4 months)\n- Top growth channel: LinkedIn ads (42% of new signups)\n- Market context: two well-funded competitors launched in the last quarter",
    rounds: FINANCE_TEMPLATE,
  },
  {
    key: "cs-email",
    label: "Customer Success",
    workspace: "email",
    title: "Customer Success: Churn Recovery",
    role: "Customer Success Manager",
    tags: ["customer-success", "churn", "account-management", "email", "b2b", "saas"],
    description:
      "You are a Customer Success Manager at a B2B SaaS company (project management tool, mid-market segment, ~$18k ARR contract). You've just received this email from Marcus Webb, VP of Engineering at a customer account:\n\n---\n\nSubject: Cancellation request, contract ends May 31\n\nHi team,\n\nAfter much deliberation, we've decided not to renew. The product has been increasingly unreliable, we had two major outages this month that cost us several hours of downtime. Our team has largely stopped using the platform and migrated to our own internal tooling.\n\nI'd like to confirm the cancellation and ensure there's no auto-renewal on our account.\n\nMarcus Webb\nVP Engineering\n\n---\n\nYou've checked internally: the two outages were real (a database issue on April 3, and a CDN failure on April 17). The product team has since fixed both root causes. Your company does not auto-renew without a signed contract, so that concern is easy to address.",
    rounds: CS_EMAIL_TEMPLATE,
  },
  {
    key: "campaign-spreadsheet",
    label: "Campaign ROI",
    workspace: "spreadsheet",
    title: "Marketing: Campaign Performance Analysis",
    role: "Marketing Analyst",
    tags: ["marketing", "analytics", "roi", "spreadsheet", "data", "paid-media", "budget"],
    description:
      "You are a marketing analyst reviewing Q1 campaign performance. You have the following data:\n\nChannel | Spend | Impressions | Clicks | Conversions | Revenue\nGoogle Search | $12,400 | 180,000 | 4,200 | 310 | $47,500\nLinkedIn Ads | $18,600 | 95,000 | 1,800 | 190 | $62,300\nFacebook Ads | $6,200 | 320,000 | 2,100 | 85 | $9,800\nEmail (outbound) | $1,400 |, | 8,400 | 420 | $68,000\nContent/SEO | $4,800 | 210,000 | 12,600 | 380 | $54,200\n\nYour task is to analyze this data and provide recommendations for Q2 budget allocation. Total Q2 budget: $43,400 (same as Q1).",
    rounds: CAMPAIGN_SPREADSHEET_TEMPLATE,
  },
  {
    key: "product-deck",
    label: "Product Pitch Deck",
    workspace: "deck",
    title: "Product: Feature Launch Pitch",
    role: "Product Manager",
    tags: ["product", "presentation", "pitch", "deck", "pm", "exec", "roi"],
    description:
      "You are a PM at a B2B SaaS company (CRM platform, mid-market, ~$8M ARR). You've been asked to pitch the addition of an AI-powered deal scoring feature to an executive audience.\n\nThe proposed feature: AI Deal Score, a model that analyzes deal activity (email frequency, call logs, time in stage, stakeholder engagement) and gives each open deal a score from 1–100 with a confidence rating and key risk factors.\n\nWhy now: Sales reps currently use gut feel to prioritize deals. Win rate is 18% (down from 23% two years ago). The data science team has prototyped the model; it correctly predicted deal outcomes with 74% accuracy on 6 months of historical data.",
    rounds: PRODUCT_DECK_TEMPLATE,
  },
  {
    key: "python-coding",
    label: "Python Data Pipeline",
    workspace: "code",
    language: "python",
    title: "Engineering: Python Data Pipeline",
    role: "Data Engineer / Backend Engineer",
    tags: ["python", "data", "csv", "pandas", "backend", "pipeline", "beginner"],
    description:
      "You are a data engineering candidate being assessed on your ability to write clean, correct Python. Use the AI assistant to plan, implement, and iterate on your solution. Edit your code in the editor on the right.",
    rounds: PYTHON_CODING_TEMPLATE,
  },
  {
    key: "js-coding",
    label: "Node.js API Feature",
    workspace: "code",
    language: "javascript",
    title: "Engineering: Node.js API Feature",
    role: "Backend Engineer / Full-Stack Engineer",
    tags: ["javascript", "node", "express", "api", "backend", "rate-limiting", "rest"],
    description:
      "You are a backend engineering candidate being assessed on your ability to design and implement a Node.js API feature. Use the AI assistant to plan, implement, and iterate on your solution. Edit your code in the editor on the right.",
    rounds: JS_CODING_TEMPLATE,
  },

  // ── 10 new templates with starter files ──────────────────────

  {
    key: "py-sales-report",
    label: "Sales Report Generator",
    workspace: "code",
    language: "python",
    tags: ["python", "data", "aggregation", "easy", "functions", "csv"],
    title: "Python: Sales Report Generator",
    role: "Data Analyst / Backend Engineer",
    description: "You are a data analyst at a retail company. You have a list of sales transactions and need to build a report generator that summarizes revenue, top products, and category performance. The data and function stubs are already in your editor, your job is to implement the logic.",
    rounds: PY_SALES_REPORT_ROUNDS,
    starter_files: {
      "transactions.py": `from datetime import date

TRANSACTIONS = [
    {"id": "T001", "date": date(2024, 1, 3),  "product_id": "P01", "product_name": "Wireless Mouse",    "category": "Electronics", "quantity": 2,  "unit_price": 29.99,  "customer_id": "C101"},
    {"id": "T002", "date": date(2024, 1, 4),  "product_id": "P02", "product_name": "USB-C Hub",         "category": "Electronics", "quantity": 1,  "unit_price": 49.99,  "customer_id": "C102"},
    {"id": "T003", "date": date(2024, 1, 5),  "product_id": "P03", "product_name": "Desk Lamp",         "category": "Office",      "quantity": 3,  "unit_price": 34.99,  "customer_id": "C103"},
    {"id": "T004", "date": date(2024, 1, 6),  "product_id": "P01", "product_name": "Wireless Mouse",    "category": "Electronics", "quantity": 1,  "unit_price": 29.99,  "customer_id": "C104"},
    {"id": "T005", "date": date(2024, 1, 7),  "product_id": "P04", "product_name": "Notebook",          "category": "Stationery",  "quantity": 5,  "unit_price": 4.99,   "customer_id": "C101"},
    {"id": "T006", "date": date(2024, 1, 8),  "product_id": "P05", "product_name": "Standing Desk",     "category": "Furniture",   "quantity": 1,  "unit_price": 349.00, "customer_id": "C105"},
    {"id": "T007", "date": date(2024, 1, 9),  "product_id": "P02", "product_name": "USB-C Hub",         "category": "Electronics", "quantity": 2,  "unit_price": 49.99,  "customer_id": "C106"},
    {"id": "T008", "date": date(2024, 1, 10), "product_id": "P06", "product_name": "Ergonomic Chair",   "category": "Furniture",   "quantity": 1,  "unit_price": 299.00, "customer_id": "C107"},
    {"id": "T009", "date": date(2024, 1, 11), "product_id": "P03", "product_name": "Desk Lamp",         "category": "Office",      "quantity": 2,  "unit_price": 34.99,  "customer_id": "C108"},
    {"id": "T010", "date": date(2024, 1, 12), "product_id": "P07", "product_name": "Monitor Stand",     "category": "Office",      "quantity": 2,  "unit_price": 39.99,  "customer_id": "C109"},
    {"id": "T011", "date": date(2024, 1, 13), "product_id": "P01", "product_name": "Wireless Mouse",    "category": "Electronics", "quantity": 4,  "unit_price": 29.99,  "customer_id": "C110"},
    {"id": "T012", "date": date(2024, 1, 14), "product_id": "P08", "product_name": "Keyboard",          "category": "Electronics", "quantity": 2,  "unit_price": 89.99,  "customer_id": "C102"},
    {"id": "T013", "date": date(2024, 1, 15), "product_id": "P04", "product_name": "Notebook",          "category": "Stationery",  "quantity": 10, "unit_price": 4.99,   "customer_id": "C103"},
    {"id": "T014", "date": date(2024, 1, 16), "product_id": "P09", "product_name": "Webcam",            "category": "Electronics", "quantity": 1,  "unit_price": 79.99,  "customer_id": "C111"},
    {"id": "T015", "date": date(2024, 1, 17), "product_id": "P05", "product_name": "Standing Desk",     "category": "Furniture",   "quantity": 1,  "unit_price": 349.00, "customer_id": "C112"},
    {"id": "T016", "date": date(2024, 1, 17), "product_id": "P10", "product_name": "Pen Set",           "category": "Stationery",  "quantity": 3,  "unit_price": 12.99,  "customer_id": "C104"},
    {"id": "T017", "date": date(2024, 1, 18), "product_id": "P06", "product_name": "Ergonomic Chair",   "category": "Furniture",   "quantity": 2,  "unit_price": 299.00, "customer_id": "C113"},
    {"id": "T018", "date": date(2024, 1, 19), "product_id": "P08", "product_name": "Keyboard",          "category": "Electronics", "quantity": 3,  "unit_price": 89.99,  "customer_id": "C114"},
    {"id": "T019", "date": date(2024, 1, 20), "product_id": "P02", "product_name": "USB-C Hub",         "category": "Electronics", "quantity": 1,  "unit_price": 49.99,  "customer_id": "C115"},
    {"id": "T020", "date": date(2024, 1, 21), "product_id": "P07", "product_name": "Monitor Stand",     "category": "Office",      "quantity": 1,  "unit_price": 39.99,  "customer_id": "C116"},
    {"id": "T021", "date": date(2024, 1, 22), "product_id": "P01", "product_name": "Wireless Mouse",    "category": "Electronics", "quantity": 2,  "unit_price": 29.99,  "customer_id": "C117"},
    {"id": "T022", "date": date(2024, 1, 23), "product_id": "P09", "product_name": "Webcam",            "category": "Electronics", "quantity": 2,  "unit_price": 79.99,  "customer_id": "C118"},
    {"id": "T023", "date": date(2024, 1, 24), "product_id": "P03", "product_name": "Desk Lamp",         "category": "Office",      "quantity": 1,  "unit_price": 34.99,  "customer_id": "C119"},
    {"id": "T024", "date": date(2024, 1, 25), "product_id": "P05", "product_name": "Standing Desk",     "category": "Furniture",   "quantity": 1,  "unit_price": 349.00, "customer_id": "C120"},
    {"id": "T025", "date": date(2024, 1, 26), "product_id": "P10", "product_name": "Pen Set",           "category": "Stationery",  "quantity": 6,  "unit_price": 12.99,  "customer_id": "C105"},
    {"id": "T026", "date": date(2024, 1, 27), "product_id": "P04", "product_name": "Notebook",          "category": "Stationery",  "quantity": 4,  "unit_price": 4.99,   "customer_id": "C121"},
    {"id": "T027", "date": date(2024, 1, 28), "product_id": "P06", "product_name": "Ergonomic Chair",   "category": "Furniture",   "quantity": 1,  "unit_price": 299.00, "customer_id": "C122"},
    {"id": "T028", "date": date(2024, 1, 29), "product_id": "P08", "product_name": "Keyboard",          "category": "Electronics", "quantity": 1,  "unit_price": 89.99,  "customer_id": "C123"},
    {"id": "T029", "date": date(2024, 1, 30), "product_id": "P02", "product_name": "USB-C Hub",         "category": "Electronics", "quantity": 3,  "unit_price": 49.99,  "customer_id": "C124"},
    {"id": "T030", "date": date(2024, 1, 31), "product_id": "P07", "product_name": "Monitor Stand",     "category": "Office",      "quantity": 2,  "unit_price": 39.99,  "customer_id": "C125"},
]

# First half of January (for compare_periods demo in Round 3)
TRANSACTIONS_JAN_FIRST_HALF  = [t for t in TRANSACTIONS if t["date"].day <= 15]
TRANSACTIONS_JAN_SECOND_HALF = [t for t in TRANSACTIONS if t["date"].day > 15]
`,
      "report.py": `from transactions import TRANSACTIONS, TRANSACTIONS_JAN_FIRST_HALF, TRANSACTIONS_JAN_SECOND_HALF
from typing import Any


def generate_report(transactions: list[dict]) -> dict[str, Any]:
    """
    Analyze a list of sales transactions and return a summary report.

    Each transaction dict has keys:
        id, date, product_id, product_name, category, quantity, unit_price, customer_id

    Returns:
        {
            "total_revenue": float,           # sum of quantity * unit_price across all transactions
            "total_transactions": int,        # count of transactions
            "avg_order_value": float,         # total_revenue / total_transactions (0 if no transactions)
            "top_5_products": [               # top 5 products by total revenue, sorted desc
                {"product_name": str, "revenue": float, "units_sold": int},
                ...
            ],
            "revenue_by_category": {          # total revenue grouped by category
                str: float,
                ...
            },
        }
    """
    raise NotImplementedError("Implement generate_report, Round 2")


def compare_periods(current: dict, previous: dict) -> dict[str, Any]:
    """
    Compare two report dicts (output of generate_report) and return % change for key metrics.

    Returns:
        {
            "total_revenue_change_pct":      float | None,  # None if previous was 0
            "total_transactions_change_pct": float | None,
            "avg_order_value_change_pct":    float | None,
        }

    Formula: (current - previous) / previous * 100
    """
    raise NotImplementedError("Implement compare_periods, Round 3")


if __name__ == "__main__":
    print("=== Full January Report ===")
    report = generate_report(TRANSACTIONS)
    print(f"Total revenue:      \${report['total_revenue']:.2f}")
    print(f"Total transactions: {report['total_transactions']}")
    print(f"Avg order value:    \${report['avg_order_value']:.2f}")
    print("\\nTop 5 products:")
    for p in report["top_5_products"]:
        print(f"  {p['product_name']}: \${p['revenue']:.2f} ({p['units_sold']} units)")
    print("\\nRevenue by category:")
    for cat, rev in sorted(report["revenue_by_category"].items(), key=lambda x: -x[1]):
        print(f"  {cat}: \${rev:.2f}")
`,
    },
  },

  {
    key: "py-log-analyzer",
    label: "Server Log Analyzer",
    workspace: "code",
    language: "python",
    tags: ["python", "logs", "parsing", "regex", "easy-medium", "backend"],
    title: "Python: Server Log Analyzer",
    role: "Backend Engineer / SRE",
    description: "You're on-call at a SaaS company and the team needs better visibility into API performance. You have a sample of server access logs and a LogAnalyzer class stub. Build the parser and analyzer to surface slow endpoints, error rates, and traffic patterns.",
    rounds: PY_LOG_ANALYZER_ROUNDS,
    starter_files: {
      "sample_logs.py": `# Apache Combined Log Format:
# IP - - [DD/Mon/YYYY:HH:MM:SS +0000] "METHOD /path HTTP/1.1" STATUS BYTES RESPONSE_TIME_MS

SAMPLE_LOGS = [
    '10.0.1.1 - - [15/Jan/2024:09:00:01 +0000] "GET /api/users HTTP/1.1" 200 1423 45',
    '10.0.1.2 - - [15/Jan/2024:09:00:03 +0000] "POST /api/orders HTTP/1.1" 201 890 210',
    '10.0.1.3 - - [15/Jan/2024:09:00:05 +0000] "GET /api/products HTTP/1.1" 200 5621 88',
    '10.0.1.1 - - [15/Jan/2024:09:00:07 +0000] "GET /api/users/42 HTTP/1.1" 200 312 32',
    '10.0.1.4 - - [15/Jan/2024:09:00:09 +0000] "DELETE /api/orders/99 HTTP/1.1" 404 89 12',
    '10.0.1.5 - - [15/Jan/2024:09:00:11 +0000] "GET /api/reports HTTP/1.1" 200 18920 1840',
    '10.0.1.2 - - [15/Jan/2024:09:00:13 +0000] "GET /api/products HTTP/1.1" 200 5621 91',
    '10.0.1.6 - - [15/Jan/2024:09:00:15 +0000] "POST /api/users HTTP/1.1" 500 234 3200',
    '10.0.1.7 - - [15/Jan/2024:09:00:17 +0000] "GET /api/orders HTTP/1.1" 200 4410 156',
    '10.0.1.1 - - [15/Jan/2024:09:00:19 +0000] "GET /api/reports HTTP/1.1" 200 18920 2100',
    '10.0.1.8 - - [15/Jan/2024:09:00:21 +0000] "PUT /api/users/42 HTTP/1.1" 200 312 67',
    '10.0.1.9 - - [15/Jan/2024:09:00:23 +0000] "GET /api/products HTTP/1.1" 500 89 4500',
    '10.0.1.3 - - [15/Jan/2024:09:00:25 +0000] "GET /api/users HTTP/1.1" 200 1423 41',
    '10.0.1.4 - - [15/Jan/2024:10:00:01 +0000] "GET /api/orders HTTP/1.1" 200 4410 145',
    '10.0.1.5 - - [15/Jan/2024:10:00:03 +0000] "POST /api/orders HTTP/1.1" 422 445 38',
    '10.0.1.6 - - [15/Jan/2024:10:00:05 +0000] "GET /api/reports HTTP/1.1" 200 18920 1950',
    '10.0.1.2 - - [15/Jan/2024:10:00:07 +0000] "GET /api/users HTTP/1.1" 200 1423 39',
    '10.0.1.7 - - [15/Jan/2024:10:00:09 +0000] "GET /api/products HTTP/1.1" 200 5621 95',
    '10.0.1.8 - - [15/Jan/2024:10:00:11 +0000] "POST /api/users HTTP/1.1" 500 234 2800',
    '10.0.1.9 - - [15/Jan/2024:10:00:13 +0000] "GET /api/reports HTTP/1.1" 500 89 5100',
    '10.0.1.1 - - [15/Jan/2024:10:00:15 +0000] "GET /api/users/42 HTTP/1.1" 404 89 8',
    '10.0.1.3 - - [15/Jan/2024:10:00:17 +0000] "GET /api/orders HTTP/1.1" 200 4410 178',
    '10.0.1.4 - - [15/Jan/2024:10:00:19 +0000] "PUT /api/orders/12 HTTP/1.1" 200 567 89',
    '10.0.1.5 - - [15/Jan/2024:10:00:21 +0000] "GET /api/products HTTP/1.1" 200 5621 82',
    '10.0.1.6 - - [15/Jan/2024:10:00:23 +0000] "GET /api/users HTTP/1.1" 200 1423 44',
    'MALFORMED LINE - missing fields',
    '10.0.1.7 - - [15/Jan/2024:11:00:01 +0000] "GET /api/reports HTTP/1.1" 200 18920 1720',
    '10.0.1.8 - - [15/Jan/2024:11:00:03 +0000] "GET /api/products HTTP/1.1" 200 5621 79',
    '10.0.1.9 - - [15/Jan/2024:11:00:05 +0000] "POST /api/orders HTTP/1.1" 201 890 195',
    '10.0.1.1 - - [15/Jan/2024:11:00:07 +0000] "GET /api/users HTTP/1.1" 500 234 3400',
    '10.0.1.2 - - [15/Jan/2024:11:00:09 +0000] "GET /api/reports HTTP/1.1" 200 18920 1680',
    '10.0.1.3 - - [15/Jan/2024:11:00:11 +0000] "GET /api/orders HTTP/1.1" 200 4410 134',
    '10.0.1.4 - - [15/Jan/2024:11:00:13 +0000] "GET /api/products HTTP/1.1" 500 89 6200',
    '',  # empty line, also malformed
    '10.0.1.5 - - [15/Jan/2024:11:00:17 +0000] "GET /api/users HTTP/1.1" 200 1423 38',
    '10.0.1.6 - - [15/Jan/2024:11:00:19 +0000] "DELETE /api/users/7 HTTP/1.1" 204 0 22',
]
`,
      "analyzer.py": `import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class LogEntry:
    ip: str
    timestamp: str    # raw timestamp string e.g. "15/Jan/2024:09:00:01 +0000"
    method: str       # GET, POST, etc.
    path: str         # /api/users (strip query string)
    status: int       # 200, 404, 500, etc.
    bytes_sent: int
    response_time_ms: int


class LogAnalyzer:
    def __init__(self):
        self._results: dict = {}  # populated by analyze()

    def parse(self, line: str) -> Optional[LogEntry]:
        """
        Parse a single Apache Combined Log Format line.
        Returns a LogEntry, or None if the line is malformed.
        Never raises an exception, always returns None for bad input.

        Format:
            IP - - [timestamp] "METHOD /path HTTP/version" STATUS BYTES RESPONSE_MS
        """
        raise NotImplementedError

    def analyze(self, lines: list[str]) -> dict:
        """
        Parse all lines (skipping malformed), then compute and return:
        {
            "total_requests": int,
            "malformed_count": int,
            "slowest_endpoints": [          # top 5 by avg response_time_ms
                {"path": str, "avg_ms": float, "request_count": int}, ...
            ],
            "error_rate_by_endpoint": {     # only endpoints with >= 5 total requests
                "/api/path": float,         # pct of 4xx + 5xx responses (0–100)
                ...
            },
            "requests_by_hour": {           # e.g. {"09": 14, "10": 11, "11": 10}
                str: int,
                ...
            },
        }
        Also stores results internally so report() can use them.
        """
        raise NotImplementedError

    def alert(self, threshold_ms: float, error_rate_pct: float) -> list[dict]:
        """
        Return endpoints that breach either threshold (run analyze() first).
        Each result: {"endpoint": str, "avg_ms": float, "error_rate_pct": float, "reasons": list[str]}
        reasons contains "slow" and/or "high_error_rate" as applicable.
        """
        raise NotImplementedError("Implement alert(), Round 3")

    def report(self) -> str:
        """Return a human-readable multi-line summary of the last analyze() run."""
        raise NotImplementedError("Implement report(), Round 3")


if __name__ == "__main__":
    from sample_logs import SAMPLE_LOGS
    analyzer = LogAnalyzer()
    results = analyzer.analyze(SAMPLE_LOGS)
    print(f"Total requests: {results['total_requests']} ({results['malformed_count']} malformed)")
    print("\\nSlowest endpoints:")
    for e in results["slowest_endpoints"]:
        print(f"  {e['path']}: {e['avg_ms']:.0f}ms avg ({e['request_count']} requests)")
`,
    },
  },

  {
    key: "py-inventory-sync",
    label: "Inventory Sync Engine",
    workspace: "code",
    language: "python",
    tags: ["python", "data", "merging", "conflict-resolution", "medium", "dataclasses"],
    title: "Python: Inventory Sync Engine",
    role: "Backend Engineer / Data Engineer",
    description: "You're building a sync service for a retail company that operates two warehouses with separate inventory systems. Both systems track the same SKUs but can drift out of sync. Your job is to merge the two sources, identify conflicts, and (in a later round) apply configurable resolution strategies.",
    rounds: PY_INVENTORY_SYNC_ROUNDS,
    starter_files: {
      "models.py": `from dataclasses import dataclass
from datetime import datetime


@dataclass
class Product:
    sku: str
    name: str
    quantity: int
    unit_price: float
    last_updated: datetime

    def __repr__(self) -> str:
        return f"Product({self.sku!r}, qty={self.quantity}, price=\${self.unit_price:.2f})"
`,
      "warehouse_a.py": `from datetime import datetime
from models import Product

# Warehouse A, primary distribution center (East Coast)
WAREHOUSE_A: list[Product] = [
    Product("SKU-001", "Wireless Keyboard",   150, 79.99,  datetime(2024, 1, 15, 9, 0)),
    Product("SKU-002", "USB-C Hub 7-port",    200, 49.99,  datetime(2024, 1, 14, 14, 30)),
    Product("SKU-003", "Ergonomic Mouse",      95, 44.99,  datetime(2024, 1, 15, 11, 0)),
    Product("SKU-004", "Monitor Stand",        60, 89.99,  datetime(2024, 1, 13, 8, 0)),
    Product("SKU-005", "Webcam HD 1080p",      80, 69.99,  datetime(2024, 1, 15, 10, 0)),
    Product("SKU-006", "Desk Lamp LED",       120, 34.99,  datetime(2024, 1, 12, 16, 0)),
    Product("SKU-007", "Laptop Stand",         75, 54.99,  datetime(2024, 1, 15, 9, 30)),
    Product("SKU-008", "Cable Management Kit", 200, 19.99, datetime(2024, 1, 11, 10, 0)),
    Product("SKU-009", "Noise-Cancel Headset", 45, 129.99, datetime(2024, 1, 14, 13, 0)),
    Product("SKU-010", "HDMI 2.1 Cable 2m",   300, 14.99,  datetime(2024, 1, 10, 9, 0)),
    Product("SKU-011", "USB-C Charging Cable", 400, 12.99, datetime(2024, 1, 15, 8, 0)),
    Product("SKU-012", "Screen Cleaning Kit",  180, 9.99,  datetime(2024, 1, 9, 11, 0)),
    Product("SKU-013", "Wrist Rest Pad",        90, 24.99, datetime(2024, 1, 14, 15, 0)),
    Product("SKU-014", "Portable SSD 1TB",      35, 89.99, datetime(2024, 1, 15, 12, 0)),
    Product("SKU-015", "Thunderbolt 4 Dock",    25, 199.99, datetime(2024, 1, 13, 9, 0)),
    Product("SKU-016", "Mechanical Keyboard",   55, 149.99, datetime(2024, 1, 14, 10, 0)),
    Product("SKU-017", "4K Webcam",             30, 119.99, datetime(2024, 1, 15, 11, 30)),
    Product("SKU-018", "Mouse Pad XL",         140, 29.99,  datetime(2024, 1, 12, 14, 0)),
    Product("SKU-019", "Mini DisplayPort Cable", 85, 17.99, datetime(2024, 1, 11, 9, 0)),
    Product("SKU-020", "USB 3.0 Hub 4-port",   110, 22.99, datetime(2024, 1, 15, 8, 30)),
]
`,
      "warehouse_b.py": `from datetime import datetime
from models import Product

# Warehouse B, secondary fulfillment center (West Coast)
# Some quantities/prices differ from Warehouse A (system drift).
# SKU-021 to SKU-025 exist only in Warehouse B (recent arrivals not synced yet).
WAREHOUSE_B: list[Product] = [
    Product("SKU-001", "Wireless Keyboard",   155, 79.99,  datetime(2024, 1, 15, 10, 0)),   # qty +5 (minor, no conflict)
    Product("SKU-002", "USB-C Hub 7-port",    170, 49.99,  datetime(2024, 1, 14, 12, 0)),   # qty -30 (15% diff, CONFLICT)
    Product("SKU-003", "Ergonomic Mouse",      90, 44.99,  datetime(2024, 1, 15, 9, 0)),    # qty -5 (minor, no conflict)
    Product("SKU-004", "Monitor Stand",        66, 99.99,  datetime(2024, 1, 14, 8, 0)),    # price +11%, CONFLICT
    Product("SKU-005", "Webcam HD 1080p",      80, 69.99,  datetime(2024, 1, 15, 10, 0)),   # exact match
    Product("SKU-006", "Desk Lamp LED",       100, 34.99,  datetime(2024, 1, 13, 16, 0)),   # qty -17%, CONFLICT
    Product("SKU-007", "Laptop Stand",         75, 54.99,  datetime(2024, 1, 15, 8, 0)),    # exact (A is newer)
    Product("SKU-008", "Cable Management Kit", 220, 19.99, datetime(2024, 1, 12, 10, 0)),   # qty +10%, CONFLICT
    Product("SKU-009", "Noise-Cancel Headset", 45, 119.99, datetime(2024, 1, 14, 14, 0)),   # price -8% (minor, no conflict)
    Product("SKU-010", "HDMI 2.1 Cable 2m",   300, 14.99,  datetime(2024, 1, 10, 9, 0)),   # exact match
    Product("SKU-011", "USB-C Charging Cable", 380, 12.99, datetime(2024, 1, 15, 7, 30)),   # qty -5% (minor, no conflict)
    Product("SKU-012", "Screen Cleaning Kit",  200, 9.99,  datetime(2024, 1, 10, 11, 0)),   # qty +11%, CONFLICT
    Product("SKU-013", "Wrist Rest Pad",        90, 24.99, datetime(2024, 1, 14, 15, 0)),   # exact match
    Product("SKU-014", "Portable SSD 1TB",      30, 89.99, datetime(2024, 1, 15, 11, 0)),   # qty -14%, CONFLICT
    Product("SKU-015", "Thunderbolt 4 Dock",    25, 189.99, datetime(2024, 1, 14, 9, 0)),   # price -5% (minor, no conflict)
    Product("SKU-016", "Mechanical Keyboard",   55, 149.99, datetime(2024, 1, 14, 10, 0)),  # exact match
    Product("SKU-017", "4K Webcam",             30, 109.99, datetime(2024, 1, 15, 10, 0)),  # price -8% (minor, no conflict)
    Product("SKU-018", "Mouse Pad XL",         168, 29.99,  datetime(2024, 1, 13, 14, 0)),  # qty +20%, CONFLICT
    Product("SKU-019", "Mini DisplayPort Cable", 85, 17.99, datetime(2024, 1, 11, 9, 0)),   # exact match
    Product("SKU-020", "USB 3.0 Hub 4-port",   110, 22.99, datetime(2024, 1, 15, 8, 30)),  # exact match
    # Only in Warehouse B:
    Product("SKU-021", "USB-A to USB-C Adapter", 250, 8.99,  datetime(2024, 1, 15, 9, 0)),
    Product("SKU-022", "Magnetic Cable Clip",     180, 6.99,  datetime(2024, 1, 14, 11, 0)),
    Product("SKU-023", "Laptop Privacy Screen",    40, 49.99, datetime(2024, 1, 15, 13, 0)),
    Product("SKU-024", "Wireless Charging Pad",    70, 29.99, datetime(2024, 1, 15, 8, 0)),
    Product("SKU-025", "Cable Organizer Box",      95, 39.99, datetime(2024, 1, 14, 16, 0)),
]
`,
      "sync.py": `from typing import NamedTuple, Literal
from models import Product


class SyncResult(NamedTuple):
    merged: list[Product]       # non-conflicting matches (newer record wins)
    conflicts: list[dict]       # {"sku": str, "a": Product, "b": Product, "reasons": list[str]}
    only_in_a: list[Product]    # SKUs present only in warehouse_a
    only_in_b: list[Product]    # SKUs present only in warehouse_b


ConflictStrategy = Literal["take_a", "take_b", "take_newer", "take_min_quantity", "take_max_quantity", "average_price"]


def sync_inventory(
    warehouse_a: list[Product],
    warehouse_b: list[Product],
    conflict_threshold: float = 0.10,
    strategy: ConflictStrategy | None = None,
) -> SyncResult:
    """
    Merge two warehouse inventories.

    Conflict definition: same SKU exists in both sources AND
    - abs(qty_a - qty_b) / max(qty_a, qty_b) > conflict_threshold, OR
    - abs(price_a - price_b) / max(price_a, price_b) > conflict_threshold

    For non-conflicting matches: keep the record with the more recent last_updated.

    If strategy is provided (Round 3), resolve conflicts automatically.
    If strategy is None, conflicting products go into the conflicts list.

    Returns SyncResult with all four lists populated.
    """
    raise NotImplementedError("Implement sync_inventory, Round 2")


if __name__ == "__main__":
    from warehouse_a import WAREHOUSE_A
    from warehouse_b import WAREHOUSE_B

    result = sync_inventory(WAREHOUSE_A, WAREHOUSE_B)
    print(f"Merged (no conflict): {len(result.merged)}")
    print(f"Conflicts:            {len(result.conflicts)}")
    print(f"Only in A:            {len(result.only_in_a)}")
    print(f"Only in B:            {len(result.only_in_b)}")
    print("\\nConflicting SKUs:")
    for c in result.conflicts:
        print(f"  {c['sku']}: {c['reasons']}")
`,
    },
  },

  {
    key: "py-rate-limiter",
    label: "Token Bucket Rate Limiter",
    workspace: "code",
    language: "python",
    tags: ["python", "algorithms", "rate-limiting", "classes", "medium", "backend"],
    title: "Python: Token Bucket Rate Limiter",
    role: "Backend Engineer",
    description: "Your API is being hammered. You need to implement a token bucket rate limiter that enforces per-user request limits. The class interface and a full test suite are already written, your job is to implement the algorithm correctly so all tests pass.",
    rounds: PY_RATE_LIMITER_ROUNDS,
    starter_files: {
      "rate_limiter.py": `import time


class RateLimiter:
    """
    Token bucket rate limiter.

    Each user gets an independent 'bucket' that:
    - Starts full (at capacity)
    - Drains by 1 token per allowed request
    - Refills at refill_rate tokens per second, up to capacity

    The bucket is refilled LAZILY, only when allow() or status() is called,
    based on elapsed time since the last call for that user.

    Token bucket vs alternatives:
    - Fixed window: simple but allows 2x burst at window boundaries
    - Sliding window: accurate but expensive (stores every request timestamp)
    - Token bucket: smooth enforcement, controlled burst, O(1) per check ← this one
    """

    def __init__(self, capacity: int, refill_rate: float):
        """
        Args:
            capacity:     max tokens per user (also the initial amount and max burst size)
            refill_rate:  tokens added per second (can be fractional, e.g. 0.5 = 1 token/2s)
        """
        self._capacity = capacity
        self._refill_rate = refill_rate
        # Internal state: user_id -> {"tokens": float, "last_check": float (unix timestamp)}
        self._buckets: dict[str, dict] = {}

    def _get_bucket(self, user_id: str) -> dict:
        """Get or initialize a bucket for user_id. New users start at full capacity."""
        if user_id not in self._buckets:
            self._buckets[user_id] = {
                "tokens": float(self._capacity),
                "last_check": time.time(),
            }
        return self._buckets[user_id]

    def allow(self, user_id: str) -> bool:
        """
        Check if user_id can make a request.
        - Refills tokens based on elapsed time since last call
        - Consumes 1 token if available and returns True
        - Returns False (without consuming) if bucket is empty
        """
        raise NotImplementedError

    def status(self, user_id: str) -> dict:
        """
        Return current bucket state after applying any pending refill.
        Does NOT consume a token.

        Returns:
            {"tokens": float, "capacity": int, "refill_rate": float}
        """
        raise NotImplementedError

    def reset(self, user_id: str) -> None:
        """Remove user_id's bucket entry. Next call will create a fresh full bucket."""
        raise NotImplementedError
`,
      "test_rate_limiter.py": `import time
import unittest
from unittest.mock import patch
from rate_limiter import RateLimiter


class TestRateLimiter(unittest.TestCase):

    def test_allows_up_to_capacity(self):
        """Exactly capacity requests should succeed immediately."""
        rl = RateLimiter(capacity=5, refill_rate=1.0)
        results = [rl.allow("user1") for _ in range(5)]
        self.assertEqual(results, [True] * 5)

    def test_blocks_after_capacity_exhausted(self):
        """The (capacity+1)th request should be denied."""
        rl = RateLimiter(capacity=3, refill_rate=1.0)
        for _ in range(3):
            rl.allow("user1")
        self.assertFalse(rl.allow("user1"))

    def test_users_are_independent(self):
        """Exhausting one user's bucket should not affect other users."""
        rl = RateLimiter(capacity=2, refill_rate=1.0)
        rl.allow("alice")
        rl.allow("alice")
        self.assertFalse(rl.allow("alice"))
        self.assertTrue(rl.allow("bob"))   # bob has a full bucket

    def test_tokens_refill_over_time(self):
        """Tokens should accumulate at refill_rate tokens/second."""
        rl = RateLimiter(capacity=5, refill_rate=2.0)
        for _ in range(5):
            rl.allow("user1")
        self.assertFalse(rl.allow("user1"))

        base_time = time.time()
        with patch("time.time", return_value=base_time + 1.0):
            # 1 second passed → 2 tokens added, 2 requests allowed
            self.assertTrue(rl.allow("user1"))
            self.assertTrue(rl.allow("user1"))
            self.assertFalse(rl.allow("user1"))

    def test_tokens_capped_at_capacity(self):
        """Tokens should never exceed capacity even after long idle period."""
        rl = RateLimiter(capacity=5, refill_rate=10.0)
        base_time = time.time()
        with patch("time.time", return_value=base_time + 100.0):
            s = rl.status("user1")
            self.assertLessEqual(s["tokens"], 5)

    def test_status_returns_correct_shape(self):
        """status() should return tokens, capacity, and refill_rate."""
        rl = RateLimiter(capacity=10, refill_rate=5.0)
        rl.allow("user1")
        s = rl.status("user1")
        self.assertIn("tokens", s)
        self.assertIn("capacity", s)
        self.assertIn("refill_rate", s)
        self.assertEqual(s["capacity"], 10)
        self.assertEqual(s["refill_rate"], 5.0)

    def test_reset_restores_full_bucket(self):
        """After reset, user should have a full bucket again."""
        rl = RateLimiter(capacity=3, refill_rate=1.0)
        for _ in range(3):
            rl.allow("user1")
        self.assertFalse(rl.allow("user1"))
        rl.reset("user1")
        self.assertTrue(rl.allow("user1"))

    def test_fractional_refill_accumulates(self):
        """Fractional token accumulation: 0.5 tokens/sec needs 2s for 1 token."""
        rl = RateLimiter(capacity=10, refill_rate=0.5)
        for _ in range(10):
            rl.allow("user1")
        self.assertFalse(rl.allow("user1"))

        base_time = time.time()
        with patch("time.time", return_value=base_time + 1.0):
            # Only 0.5 tokens added, not enough for a full token
            self.assertFalse(rl.allow("user1"))

        with patch("time.time", return_value=base_time + 2.0):
            # 1.0 tokens added now, exactly 1 allowed
            self.assertTrue(rl.allow("user1"))
            self.assertFalse(rl.allow("user1"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
`,
    },
  },

  {
    key: "py-data-pipeline",
    label: "Debug the ETL Pipeline",
    workspace: "code",
    language: "python",
    tags: ["python", "debugging", "etl", "pipeline", "medium-hard", "data"],
    title: "Python: Debug the ETL Pipeline",
    role: "Data Engineer / Backend Engineer",
    description: "You've inherited an ETL pipeline that runs without errors on normal data but produces subtly wrong output on edge cases. Three bugs are hiding in the code. Your job is to find them, explain them, fix them, and then optimize the pipeline for large-scale data.",
    rounds: PY_DATA_PIPELINE_ROUNDS,
    starter_files: {
      "models.py": `from dataclasses import dataclass
from datetime import date


@dataclass
class RawRecord:
    id: str
    source: str      # e.g. "crm", "pos", "web"
    amount: float
    date: date


@dataclass
class ProcessedRecord:
    source: str
    period: int      # 0-indexed 7-day bucket (0 = days 0–6 from min_date, 1 = days 7–13, etc.)
    total_amount: float
`,
      "pipeline.py": `from models import RawRecord, ProcessedRecord


def extract(raw_data: list[dict]) -> list[RawRecord]:
    """Convert raw dicts to RawRecord objects. Skip records missing required fields."""
    records = []
    for item in raw_data:
        if not all(k in item for k in ("id", "source", "amount", "date")):
            continue
        try:
            records.append(RawRecord(
                id=str(item["id"]),
                source=str(item["source"]),
                amount=float(item["amount"]),
                date=item["date"],
            ))
        except (ValueError, TypeError):
            continue
    return records


def transform(records: list[RawRecord]) -> list[ProcessedRecord]:
    """
    1. Deduplicate records (keep first occurrence of each unique record)
    2. Compute 7-day period bucket for each record relative to the dataset's min date
    3. Aggregate total_amount by (source, period)
    """
    # BUG 1: dedup key should be (id, source), records from different sources
    # CAN share the same id (they come from different systems). Using id alone
    # silently drops valid records from a second source.
    seen = set()
    deduped = []
    for r in records:
        if r.id not in seen:          # <-- BUG 1 is here
            seen.add(r.id)
            deduped.append(r)

    if not deduped:
        return []

    # BUG 2: min_date is computed from ALL records BEFORE dedup.
    # If the record with the true minimum date gets dropped by dedup,
    # the baseline shifts and every period assignment is wrong.
    min_date = min(r.date for r in records)  # <-- BUG 2 is here (should use deduped)

    aggregated: dict[tuple, float] = {}
    for r in deduped:
        delta = (r.date - min_date).days
        period = delta // 7
        key = (r.source, period)
        aggregated[key] = aggregated.get(key, 0.0) + r.amount

    return [
        ProcessedRecord(source=source, period=period, total_amount=total)
        for (source, period), total in sorted(aggregated.items())
    ]


def load(records: list[ProcessedRecord]) -> dict:
    """
    Summarise processed records into a report dict:
    {
        "by_source": {source: total_amount},
        "by_period": {period: total_amount},
        "grand_total": float,
    }
    """
    by_source: dict[str, float] = {}
    by_period: dict[int, float] = {}

    for r in records:
        # BUG 3: float amounts accumulated without rounding.
        # 0.1 + 0.2 in IEEE 754 = 0.30000000000000004.
        # With many small transactions this compounds into visible errors.
        by_source[r.source] = by_source.get(r.source, 0.0) + r.total_amount
        by_period[r.period] = by_period.get(r.period, 0.0) + r.total_amount

    grand_total = sum(by_source.values())

    return {
        "by_source": by_source,
        "by_period": by_period,
        "grand_total": grand_total,   # <-- BUG 3 manifests here
    }
`,
      "fixtures.py": `from datetime import date
from models import RawRecord

# ── Normal data (pipeline works correctly) ────────────────────────
NORMAL_RECORDS = [
    {"id": "R001", "source": "crm", "amount": 100.00, "date": date(2024, 1, 1)},
    {"id": "R002", "source": "crm", "amount": 200.00, "date": date(2024, 1, 3)},
    {"id": "R003", "source": "pos", "amount": 150.00, "date": date(2024, 1, 5)},
    {"id": "R004", "source": "web", "amount": 75.00,  "date": date(2024, 1, 8)},
    {"id": "R005", "source": "crm", "amount": 300.00, "date": date(2024, 1, 10)},
]

# ── Bug 1: same id, different source ─────────────────────────────
# R001 appears in both CRM and POS with different amounts.
# They're legitimate separate records from different systems.
# The buggy dedup key (id only) will drop one of them.
BUG1_RECORDS = [
    {"id": "R001", "source": "crm", "amount": 100.00, "date": date(2024, 1, 1)},
    {"id": "R001", "source": "pos", "amount": 250.00, "date": date(2024, 1, 1)},  # dropped by bug!
    {"id": "R002", "source": "crm", "amount": 200.00, "date": date(2024, 1, 3)},
]
# Expected grand_total after fix: 550.00
# Buggy grand_total: 300.00

# ── Bug 2: min_date shifts after dedup ────────────────────────────
# R000 is a duplicate (same id+source) that should be dropped.
# R000 has the earliest date. After correct dedup R000 is gone,
# so min_date should be Jan 2. If min_date stays at Jan 1 (bug),
# period assignments are all 1 day off.
BUG2_RECORDS = [
    {"id": "R000", "source": "crm", "amount": 50.00, "date": date(2024, 1, 1)},   # dup, should be removed
    {"id": "R000", "source": "crm", "amount": 50.00, "date": date(2024, 1, 1)},   # dup of above
    {"id": "R001", "source": "crm", "amount": 100.00, "date": date(2024, 1, 2)},  # period 0 (days 0–6 from Jan 2)
    {"id": "R002", "source": "crm", "amount": 200.00, "date": date(2024, 1, 9)},  # period 1 (days 7–13 from Jan 2)
]
# After correct dedup: R000 removed, min_date = Jan 2
# R001 delta=0 → period 0, R002 delta=7 → period 1
# With bug: min_date = Jan 1, R001 delta=1 → period 0, R002 delta=8 → period 1
#   (happens to match for this case, but try with a delta that crosses a boundary)

# ── Bug 3: float precision ─────────────────────────────────────────
# Ten transactions of $0.10 should total exactly $1.00.
# Without rounding, float arithmetic gives $0.9999999999999999.
BUG3_RECORDS = [
    {"id": f"R{i:03}", "source": "web", "amount": 0.10, "date": date(2024, 1, 1)}
    for i in range(10)
]
# Expected grand_total: 1.00
# Buggy grand_total:    0.9999999999999999
`,
      "test_pipeline.py": `import unittest
from datetime import date
from pipeline import extract, transform, load
from fixtures import NORMAL_RECORDS, BUG1_RECORDS, BUG2_RECORDS, BUG3_RECORDS


class TestNormalData(unittest.TestCase):
    def test_normal_pipeline_runs(self):
        records = extract(NORMAL_RECORDS)
        processed = transform(records)
        report = load(processed)
        self.assertIn("grand_total", report)
        self.assertAlmostEqual(report["grand_total"], 825.00, places=2)


class TestBug1Dedup(unittest.TestCase):
    def test_same_id_different_source_not_deduped(self):
        """Records with same id but different source are distinct and both should be kept."""
        records = extract(BUG1_RECORDS)
        # After correct dedup: 3 records remain (R001/crm, R001/pos, R002/crm)
        processed = transform(records)
        report = load(processed)
        # Total should be 100 + 250 + 200 = 550
        self.assertAlmostEqual(report["grand_total"], 550.00, places=2,
            msg="Bug 1: dedup key should be (id, source), not just id")


class TestBug2MinDate(unittest.TestCase):
    def test_min_date_computed_after_dedup(self):
        """Period buckets should be based on the min date of the de-duplicated set."""
        records = extract(BUG2_RECORDS)
        processed = transform(records)
        # R001 (Jan 2) and R002 (Jan 9). min_date = Jan 2.
        # R001: delta=0 → period 0. R002: delta=7 → period 1.
        by_period = load(processed)["by_period"]
        self.assertIn(0, by_period, "Bug 2: R001 should be in period 0")
        self.assertIn(1, by_period, "Bug 2: R002 should be in period 1")
        self.assertAlmostEqual(by_period[0], 100.00, places=2)
        self.assertAlmostEqual(by_period[1], 200.00, places=2)


class TestBug3FloatPrecision(unittest.TestCase):
    def test_float_totals_are_rounded(self):
        """Summing floats without rounding can produce results like 0.9999999999999999."""
        records = extract(BUG3_RECORDS)
        processed = transform(records)
        report = load(processed)
        self.assertAlmostEqual(report["grand_total"], 1.00, places=2,
            msg="Bug 3: totals should be rounded to 2 decimal places")
        # Strict equality check to catch the precision bug
        self.assertEqual(round(report["grand_total"], 10), round(1.00, 10))


if __name__ == "__main__":
    unittest.main(verbosity=2)
`,
    },
  },

  {
    key: "py-task-queue",
    label: "Priority Task Queue",
    workspace: "code",
    language: "python",
    tags: ["python", "concurrency", "threading", "priority-queue", "hard", "debugging"],
    title: "Python: Priority Task Queue",
    role: "Senior Backend Engineer",
    description: "You've inherited a priority task queue implementation used for background job processing. It has 4 known bugs that cause incorrect task ordering, silent failures, and improper shutdown behavior. Your job is to find and fix them all, then extend the system with a dead letter queue.",
    rounds: PY_TASK_QUEUE_ROUNDS,
    starter_files: {
      "queue.py": `import heapq
import threading
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Optional
import time


class TaskStatus(Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    DONE      = "done"
    FAILED    = "failed"
    TIMEOUT   = "timeout"


@dataclass
class Task:
    id: str
    fn: Callable
    priority: int          # Higher number = higher priority (should run first)
    timeout_seconds: Optional[float] = None
    status: TaskStatus = field(default=TaskStatus.PENDING, compare=False)
    result: object = field(default=None, compare=False)
    error: Optional[str] = field(default=None, compare=False)
    error_history: list = field(default_factory=list, compare=False)
    attempts: int = field(default=0, compare=False)
    created_at: float = field(default_factory=time.time, compare=False)

    def __lt__(self, other: "Task") -> bool:
        # BUG 1: This creates a MIN-heap (lower priority runs first).
        # We want a MAX-heap (higher priority number = more urgent).
        # Fix: negate priority so heapq (which is min-heap) gives max-priority-first order.
        return self.priority < other.priority   # <-- BUG 1


class PriorityQueue:
    def __init__(self):
        self._heap: list[Task] = []
        self._lock = threading.Lock()

    def push(self, task: Task) -> None:
        with self._lock:
            heapq.heappush(self._heap, task)

    def pop(self) -> Optional[Task]:
        with self._lock:
            if self._heap:
                return heapq.heappop(self._heap)
            return None

    def empty(self) -> bool:
        with self._lock:
            return len(self._heap) == 0

    def size(self) -> int:
        with self._lock:
            return len(self._heap)
`,
      "worker.py": `import threading
import time
from queue import Queue as StdQueue
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from queue import PriorityQueue
    from queue import Task


class Worker(threading.Thread):
    """Worker thread that pulls tasks from a PriorityQueue and executes them."""

    def __init__(self, worker_id: int, task_queue, stop_event: threading.Event):
        super().__init__(daemon=True, name=f"Worker-{worker_id}")
        self.worker_id = worker_id
        self._queue = task_queue
        self._stop = stop_event
        self.tasks_completed = 0
        self.tasks_failed = 0

    def run(self) -> None:
        while not self._stop.is_set():
            task = self._queue.pop()
            if task is None:
                time.sleep(0.01)   # nothing to do, brief sleep
                continue

            task.status = task.status.__class__.RUNNING
            task.attempts += 1

            # BUG 2: No timeout enforcement. If task.fn() hangs forever,
            # this worker hangs too. We need to run the task in a sub-thread
            # and join() it with a timeout, then mark TIMEOUT if it exceeds limit.
            try:
                task.result = task.fn()
                task.status = task.status.__class__.DONE
                self.tasks_completed += 1
            except Exception as e:
                # BUG 2 continued: we set status to FAILED here, but we don't
                # save the error message to task.error, so callers can't diagnose failures.
                task.status = task.status.__class__.FAILED
                self.tasks_failed += 1
`,
      "scheduler.py": `import threading
import time
from queue import PriorityQueue, Task, TaskStatus


class TaskScheduler:
    """Manages a pool of Worker threads and a shared PriorityQueue."""

    def __init__(self, num_workers: int = 4):
        from worker import Worker
        self._queue = PriorityQueue()
        self._stop_event = threading.Event()
        self._workers = [
            Worker(i, self._queue, self._stop_event)
            for i in range(num_workers)
        ]
        self._tasks: dict[str, Task] = {}
        self._lock = threading.Lock()
        self._is_shutdown = False

        for w in self._workers:
            w.start()

    def submit(self, task: Task) -> Task:
        # BUG 4: No guard against submitting after shutdown.
        # Should raise RuntimeError if self._is_shutdown is True.
        with self._lock:
            self._tasks[task.id] = task
        self._queue.push(task)
        return task

    def get_task(self, task_id: str) -> Task | None:
        return self._tasks.get(task_id)

    def shutdown(self, wait: bool = True) -> None:
        """
        Stop the scheduler.
        BUG 3: Sets the stop event IMMEDIATELY without draining the queue first.
        Workers will stop as soon as they finish their current task, leaving
        queued-but-not-yet-started tasks in PENDING state forever.
        Fix: drain the queue (wait until empty) before setting stop event.
        """
        self._is_shutdown = True
        self._stop_event.set()    # <-- BUG 3: should drain first

        if wait:
            for w in self._workers:
                w.join(timeout=5.0)

    def stats(self) -> dict:
        with self._lock:
            statuses = [t.status.value for t in self._tasks.values()]
        return {
            s: statuses.count(s)
            for s in ("pending", "running", "done", "failed", "timeout")
        }
`,
      "tasks.py": `import time
import random


def fast_task():
    """Completes in ~10ms."""
    time.sleep(0.01)
    return "fast_done"


def slow_task():
    """Completes in ~200ms."""
    time.sleep(0.2)
    return "slow_done"


def flaky_task():
    """Fails ~40% of the time."""
    if random.random() < 0.4:
        raise ValueError("flaky_task: random failure")
    return "flaky_done"


def cpu_task():
    """Does some computation (~50ms)."""
    total = sum(i * i for i in range(10_000))
    return total


def hanging_task():
    """Hangs for 10 seconds, tests timeout enforcement."""
    time.sleep(10)
    return "should_never_reach_here"
`,
      "test_scheduler.py": `import time
import unittest
from queue import Task, TaskStatus
from scheduler import TaskScheduler
from tasks import fast_task, slow_task, flaky_task, hanging_task


def wait_for(condition, timeout=3.0, interval=0.05):
    """Helper: poll condition until True or timeout."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if condition():
            return True
        time.sleep(interval)
    return False


class TestTaskOrdering(unittest.TestCase):
    def test_high_priority_runs_first(self):
        """Tasks with higher priority numbers should execute before lower-priority ones."""
        scheduler = TaskScheduler(num_workers=1)  # single worker forces ordering
        results = []

        def make_task(label, priority):
            def fn():
                results.append(label)
                return label
            return Task(id=label, fn=fn, priority=priority)

        # Submit low priority first, then high, high should run first
        scheduler.submit(make_task("low",  priority=1))
        scheduler.submit(make_task("high", priority=10))
        scheduler.submit(make_task("med",  priority=5))

        wait_for(lambda: len(results) == 3, timeout=3.0)
        scheduler.shutdown()

        self.assertEqual(results[0], "high", f"Expected high first, got: {results}")
        self.assertEqual(results[1], "med")
        self.assertEqual(results[2], "low")


class TestTaskTimeout(unittest.TestCase):
    def test_hanging_task_is_timed_out(self):
        """A task that exceeds timeout_seconds should be marked TIMEOUT."""
        scheduler = TaskScheduler(num_workers=2)
        task = Task(id="hang", fn=hanging_task, priority=5, timeout_seconds=0.5)
        scheduler.submit(task)

        completed = wait_for(
            lambda: task.status in (TaskStatus.TIMEOUT, TaskStatus.FAILED),
            timeout=3.0
        )
        scheduler.shutdown()
        self.assertTrue(completed, "Task should have timed out")
        self.assertEqual(task.status, TaskStatus.TIMEOUT)


class TestShutdownDrainsQueue(unittest.TestCase):
    def test_all_queued_tasks_complete_before_shutdown(self):
        """shutdown() should process all queued tasks, not abandon them."""
        scheduler = TaskScheduler(num_workers=2)
        tasks = [Task(id=f"t{i}", fn=fast_task, priority=1) for i in range(10)]
        for t in tasks:
            scheduler.submit(t)

        scheduler.shutdown(wait=True)

        pending = [t for t in tasks if t.status == TaskStatus.PENDING]
        self.assertEqual(pending, [],
            f"Bug 3: {len(pending)} tasks still pending after shutdown")


class TestPostShutdownGuard(unittest.TestCase):
    def test_submit_after_shutdown_raises(self):
        """Submitting a task after shutdown should raise RuntimeError."""
        scheduler = TaskScheduler(num_workers=1)
        scheduler.shutdown()
        with self.assertRaises(RuntimeError):
            scheduler.submit(Task(id="late", fn=fast_task, priority=1))


class TestErrorCapture(unittest.TestCase):
    def test_failed_task_captures_error_message(self):
        """A failed task should have its error message in task.error."""
        scheduler = TaskScheduler(num_workers=1)

        def always_fails():
            raise ValueError("something went wrong")

        task = Task(id="fail", fn=always_fails, priority=1)
        scheduler.submit(task)
        wait_for(lambda: task.status == TaskStatus.FAILED, timeout=3.0)
        scheduler.shutdown()

        self.assertEqual(task.status, TaskStatus.FAILED)
        self.assertIsNotNone(task.error, "task.error should contain the error message")
        self.assertIn("something went wrong", task.error)


if __name__ == "__main__":
    unittest.main(verbosity=2)
`,
    },
  },

  {
    key: "js-shopping-cart",
    label: "Shopping Cart",
    workspace: "code",
    language: "javascript",
    tags: ["javascript", "classes", "state", "cart", "easy", "oop"],
    title: "JavaScript: Shopping Cart",
    role: "Frontend / Full-Stack Engineer",
    description: "You're building the core shopping cart logic for an e-commerce site. The product catalog and coupon data are already loaded. Implement the Cart class so it correctly manages items, computes totals, and handles coupon discounts.",
    rounds: JS_SHOPPING_CART_ROUNDS,
    starter_files: {
      "products.js": `// Product catalog, do not modify
const CATALOG = [
  { id: "p001", name: "Mechanical Keyboard",   price: 149.99, category: "electronics", inStock: true  },
  { id: "p002", name: "Wireless Mouse",         price:  49.99, category: "electronics", inStock: true  },
  { id: "p003", name: "USB-C Hub",              price:  39.99, category: "electronics", inStock: true  },
  { id: "p004", name: "Monitor Stand",          price:  89.99, category: "accessories", inStock: true  },
  { id: "p005", name: "Webcam 1080p",           price:  79.99, category: "electronics", inStock: true  },
  { id: "p006", name: "Standing Desk Mat",      price:  59.99, category: "accessories", inStock: true  },
  { id: "p007", name: "Cable Management Kit",   price:  19.99, category: "accessories", inStock: true  },
  { id: "p008", name: "Laptop Stand",           price:  54.99, category: "accessories", inStock: true  },
  { id: "p009", name: "4K Webcam",              price: 129.99, category: "electronics", inStock: false }, // out of stock
  { id: "p010", name: "Ergonomic Chair",        price: 399.99, category: "furniture",   inStock: true  },
  { id: "p011", name: "Desk Lamp",              price:  34.99, category: "accessories", inStock: true  },
  { id: "p012", name: "Noise-Cancel Headset",   price: 199.99, category: "electronics", inStock: true  },
  { id: "p013", name: "HDMI Cable 2m",          price:  12.99, category: "accessories", inStock: true  },
  { id: "p014", name: "Portable SSD 1TB",       price:  89.99, category: "electronics", inStock: true  },
  { id: "p015", name: "Phone Stand",            price:  24.99, category: "accessories", inStock: true  },
]

module.exports = { CATALOG }
`,
      "coupons.js": `// Coupon definitions, do not modify
// type: "percent" = discount by percentage; "flat" = fixed dollar discount
// minOrder: minimum cart total required to apply coupon (before discount)
const COUPONS = {
  "SAVE10":   { type: "percent", value: 10,  minOrder: 0,      description: "10% off everything" },
  "SAVE25":   { type: "percent", value: 25,  minOrder: 100,    description: "25% off orders over $100" },
  "FLAT20":   { type: "flat",    value: 20,  minOrder: 75,     description: "$20 off orders over $75" },
  "FLAT50":   { type: "flat",    value: 50,  minOrder: 200,    description: "$50 off orders over $200" },
  "NEWUSER":  { type: "percent", value: 15,  minOrder: 0,      description: "15% off for new users" },
}

module.exports = { COUPONS }
`,
      "cart.js": `const { CATALOG } = require('./products')
const { COUPONS } = require('./coupons')

class Cart {
  constructor() {
    // TODO: initialize internal state
    // Hint: you need to track items (productId → quantity) and any applied coupon
  }

  /**
   * Add qty units of productId to the cart.
   * If productId is already in the cart, increment its quantity.
   * @throws {Error} if productId not found in CATALOG
   * @throws {Error} if product is out of stock
   * @throws {Error} if qty <= 0
   */
  addItem(productId, qty = 1) {
    throw new Error('Not implemented')
  }

  /**
   * Remove productId from the cart entirely.
   * No-op if productId is not in the cart.
   */
  removeItem(productId) {
    throw new Error('Not implemented')
  }

  /**
   * Set the quantity of productId to qty.
   * If qty <= 0, remove the item from the cart.
   * @throws {Error} if productId not found in CATALOG
   */
  updateQty(productId, qty) {
    throw new Error('Not implemented')
  }

  /**
   * Return the cart total AFTER applying any coupon discount.
   * Never returns a negative number.
   * @returns {number} total in dollars, rounded to 2 decimal places
   */
  getTotal() {
    throw new Error('Not implemented')
  }

  /**
   * Return a full cart summary.
   * @returns {{
   *   items: Array<{ product: object, qty: number, subtotal: number }>,
   *   subtotal: number,       // total before coupon
   *   discount: number,       // discount amount (0 if no coupon)
   *   total: number,          // subtotal - discount
   *   itemCount: number,      // total units across all line items
   *   appliedCoupon: object|null
   * }}
   */
  getSummary() {
    throw new Error('Not implemented')
  }

  /**
   * Apply a coupon code to the cart.
   * @throws {Error} if code is not in COUPONS
   * @throws {Error} if cart subtotal is below coupon's minOrder
   * Only one coupon can be active at a time, applying a new one replaces the old.
   */
  applyCoupon(code) {
    throw new Error('Not implemented, Round 3')
  }

  /**
   * Remove any applied coupon.
   */
  clearCoupon() {
    throw new Error('Not implemented, Round 3')
  }
}

module.exports = { Cart }
`,
      "test_cart.js": `// Usage examples, run with: node test_cart.js
const { Cart } = require('./cart')

console.log('=== Basic cart operations ===')
const cart = new Cart()
cart.addItem('p001')            // Keyboard x1
cart.addItem('p002', 2)         // Mouse x2
cart.addItem('p001')            // Keyboard again, should be x2 now

console.log('Expected total: $299.96 (149.99*2 + 49.99*2)')
console.log('Actual total:  $' + cart.getTotal().toFixed(2))

const summary = cart.getSummary()
console.log('Item count:', summary.itemCount, '(expected 4)')
console.log('Items:')
summary.items.forEach(i => console.log(\`  \${i.product.name} x\${i.qty} = \$\${i.subtotal.toFixed(2)}\`))

console.log('\\n=== Edge cases ===')
cart.updateQty('p002', 1)       // reduce mouse to x1
console.log('After updateQty mouse to 1, total should be $349.97:', cart.getTotal().toFixed(2))
cart.updateQty('p002', 0)       // qty 0 removes item
console.log('After updateQty mouse to 0, item count should be 2:', cart.getSummary().itemCount)

console.log('\\n=== Error cases ===')
try {
  cart.addItem('p999')
} catch(e) {
  console.log('Unknown product error (expected):', e.message)
}
try {
  cart.addItem('p009')          // out of stock
} catch(e) {
  console.log('Out of stock error (expected):', e.message)
}

console.log('\\n=== Coupon (Round 3) ===')
const cart2 = new Cart()
cart2.addItem('p010')           // Ergonomic Chair $399.99
cart2.applyCoupon('SAVE25')     // 25% off orders over $100
console.log('After SAVE25, total should be $299.99:', cart2.getTotal().toFixed(2))
`,
    },
  },

  {
    key: "js-form-validator",
    label: "Form Validation Engine",
    workspace: "code",
    language: "javascript",
    tags: ["javascript", "validation", "fluent-api", "easy-medium", "classes", "async"],
    title: "JavaScript: Composable Form Validator",
    role: "Frontend / Full-Stack Engineer",
    description: "You're building a reusable form validation library for your company's design system. The API uses a fluent chain: new Validator().field('email').required().email(). All rule stubs, class interfaces, and tests are already written, implement them.",
    rounds: JS_FORM_VALIDATOR_ROUNDS,
    starter_files: {
      "rules.js": `/**
 * Validation rules, each returns null if valid, or an error string if invalid.
 * These are used internally by FieldValidator; you don't call them directly.
 */

/** Field must not be null, undefined, or empty string */
const required = () => (value) => {
  throw new Error('Implement required rule')
}

/** String must be at least n characters */
const minLength = (n) => (value) => {
  throw new Error('Implement minLength rule')
}

/** String must be at most n characters */
const maxLength = (n) => (value) => {
  throw new Error('Implement maxLength rule')
}

/** Must be a valid email address format */
const email = () => (value) => {
  throw new Error('Implement email rule')
}

/** Must contain only digits (string or number) */
const numeric = () => (value) => {
  throw new Error('Implement numeric rule')
}

/** Must match the provided regex */
const matches = (regex, message) => (value) => {
  throw new Error('Implement matches rule')
}

/** Number must be >= min */
const min = (n) => (value) => {
  throw new Error('Implement min rule')
}

/** Number must be <= max */
const max = (n) => (value) => {
  throw new Error('Implement max rule')
}

module.exports = { required, minLength, maxLength, email, numeric, matches, min, max }
`,
      "validator.js": `const { required, minLength, maxLength, email, numeric, matches, min, max } = require('./rules')

/**
 * FieldValidator, builder for per-field rules.
 * Methods return 'this' for chaining.
 */
class FieldValidator {
  /**
   * @param {string} fieldName
   * @param {Validator} parent - the parent Validator instance
   */
  constructor(fieldName, parent) {
    this._name = fieldName
    this._parent = parent
    this._rules = []          // array of sync rule functions (value) => string | null
    this._asyncRules = []     // array of async rule functions (value) => Promise<string | null>
  }

  required()                  { this._rules.push(required());         return this }
  minLength(n)                { this._rules.push(minLength(n));       return this }
  maxLength(n)                { this._rules.push(maxLength(n));       return this }
  email()                     { this._rules.push(email());            return this }
  numeric()                   { this._rules.push(numeric());          return this }
  matches(regex, msg)         { this._rules.push(matches(regex,msg)); return this }
  min(n)                      { this._rules.push(min(n));             return this }
  max(n)                      { this._rules.push(max(n));             return this }

  /**
   * Custom sync rule.
   * @param {(value: any) => string | null} fn - return null if valid, error string if invalid
   */
  custom(fn) { this._rules.push(fn); return this }

  /**
   * Custom async rule (Round 3).
   * @param {(value: any) => Promise<string | null>} fn
   */
  asyncCustom(fn) {
    this._asyncRules.push(fn)
    return this
  }

  /** Return to the parent Validator for chaining more fields */
  and() { return this._parent }
}


/**
 * Validator, collects FieldValidators and runs them against a data object.
 */
class Validator {
  constructor() {
    this._fields = {}  // fieldName -> FieldValidator
  }

  /**
   * Define rules for a field. Returns a FieldValidator for chaining.
   * @param {string} name - the field name (key in the data object)
   * @returns {FieldValidator}
   */
  field(name) {
    throw new Error('Implement field()')
  }

  /**
   * Validate a data object against all registered fields.
   *
   * - Runs ALL rules for each field (does not stop at first failure).
   * - If any asyncCustom rules are registered on ANY field, returns Promise<result>.
   * - Otherwise returns result synchronously.
   *
   * Result shape:
   * {
   *   valid: boolean,
   *   errors: { [fieldName]: string[] }   // only fields with errors are included
   * }
   *
   * @param {object} data
   * @returns {{ valid: boolean, errors: object } | Promise<{ valid: boolean, errors: object }>}
   */
  validate(data) {
    throw new Error('Implement validate()')
  }
}

module.exports = { Validator, FieldValidator }
`,
      "mock_api.js": `/**
 * Simulates an async API call to check username availability.
 * Resolves after 100ms.
 * Returns null if username is available, error string if taken.
 */
const TAKEN_USERNAMES = new Set(['admin', 'root', 'user', 'test', 'pactum'])

function mockCheckUsername(username) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (TAKEN_USERNAMES.has(username.toLowerCase())) {
        resolve(\`Username "\${username}" is already taken\`)
      } else {
        resolve(null)  // available
      }
    }, 100)
  })
}

module.exports = { mockCheckUsername }
`,
      "test_validator.js": `const { Validator } = require('./validator')
const { mockCheckUsername } = require('./mock_api')

// ── Sync validation ────────────────────────────────────────────────
console.log('=== Sync validation ===')

const v = new Validator()
v.field('email').required().email()
v.field('password').required().minLength(8).maxLength(64)
v.field('age').required().numeric().min(18).max(120)

const result1 = v.validate({ email: 'bad-email', password: 'short', age: '15' })
console.log('valid:', result1.valid)    // expected: false
console.log('errors:', result1.errors)
// expected errors: { email: ['...'], password: ['...'], age: ['...'] }

const result2 = v.validate({ email: 'user@example.com', password: 'securepass123', age: '25' })
console.log('\\nValid input:')
console.log('valid:', result2.valid)    // expected: true
console.log('errors:', result2.errors) // expected: {}

// ── Collect ALL errors (don't stop at first) ───────────────────────
console.log('\\n=== All errors collected ===')
const v2 = new Validator()
v2.field('username').required().minLength(3).maxLength(20).matches(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscore')

const result3 = v2.validate({ username: 'A B' })  // too short, has space, not lowercase
console.log('username errors:', result3.errors.username)
// expected: 3 errors (length might pass, but pattern fails; test with '' to get required too)

const result4 = v2.validate({ username: '' })
console.log('empty username errors:', result4.errors.username)
// expected: at least 'required' and 'minLength' errors

// ── Async validation (Round 3) ─────────────────────────────────────
console.log('\\n=== Async validation (Round 3) ===')

const v3 = new Validator()
v3.field('username').required().minLength(3).asyncCustom(mockCheckUsername)

const asyncResult = v3.validate({ username: 'admin' })  // 'admin' is taken
if (asyncResult instanceof Promise) {
  asyncResult.then(r => {
    console.log('async valid:', r.valid)   // expected: false
    console.log('async errors:', r.errors) // expected: { username: ['Username "admin" is already taken'] }
  })
} else {
  console.error('validate() should return a Promise when async rules exist')
}
`,
    },
  },

  {
    key: "js-promise-pool",
    label: "Concurrent Promise Pool",
    workspace: "code",
    language: "javascript",
    tags: ["javascript", "promises", "concurrency", "async", "medium-hard", "patterns"],
    title: "JavaScript: Concurrent Promise Pool",
    role: "Senior Frontend / Backend Engineer",
    description: "You need to process 50 API calls but your server can only handle 5 concurrent requests without falling over. Build a PromisePool that executes task functions with a configurable concurrency limit, then extend it with per-task timeouts and cancellation.",
    rounds: JS_PROMISE_POOL_ROUNDS,
    starter_files: {
      "pool.js": `/**
 * PromisePool, execute async task functions with bounded concurrency.
 *
 * Usage:
 *   const pool = new PromisePool(3)
 *   pool.add(() => fetchUser(1))
 *   pool.add(() => fetchUser(2))
 *   pool.add(() => fetchUser(3), { timeout: 5000 })
 *   await pool.run()
 */
class PromisePool {
  /**
   * @param {number} concurrency - max number of tasks running simultaneously
   */
  constructor(concurrency) {
    this._concurrency = concurrency
    this._queue = []           // pending tasks: { fn, opts, resolve, reject }
    this._active = 0           // currently running task count
    this._cancelled = false
    this.onProgress = null     // optional: (completed, total) => void
  }

  /**
   * Enqueue a task.
   * @param {() => Promise<any>} fn      - async task function
   * @param {{ timeout?: number }} opts   - optional: timeout in ms (Round 3)
   * @returns {Promise<any>} resolves/rejects with the task's result
   */
  add(fn, opts = {}) {
    throw new Error('Implement add()')
  }

  /**
   * Start executing all queued tasks and return a Promise that resolves
   * when ALL tasks have completed (or rejected).
   *
   * The returned Promise should ALWAYS resolve (never reject) -
   * individual task failures are captured in the results.
   *
   * @returns {Promise<{ results: any[], errors: Error[] }>}
   */
  run() {
    throw new Error('Implement run()')
  }

  /**
   * Cancel all not-yet-started tasks (Round 3).
   * Already-running tasks complete normally.
   * Cancelled tasks' promises reject with a CancelledError.
   */
  cancel() {
    throw new Error('Implement cancel(), Round 3')
  }

  /**
   * Internal: start the next task from the queue if a slot is available.
   * Called after each task completes to keep slots filled.
   * @private
   */
  _runNext() {
    throw new Error('Implement _runNext()')
  }
}

class TimeoutError extends Error {
  constructor(ms) { super(\`Task timed out after \${ms}ms\`); this.name = 'TimeoutError' }
}

class CancelledError extends Error {
  constructor() { super('Task was cancelled'); this.name = 'CancelledError' }
}

module.exports = { PromisePool, TimeoutError, CancelledError }
`,
      "mock_api.js": `/**
 * Mock async API functions that simulate real network calls.
 * Use these to test your PromisePool.
 */

let _callCount = 0
let _concurrentCalls = 0
let _peakConcurrency = 0

/** Reset counters between test runs */
function resetCounters() {
  _callCount = 0
  _concurrentCalls = 0
  _peakConcurrency = 0
}

function getStats() {
  return { totalCalls: _callCount, peakConcurrency: _peakConcurrency }
}

/**
 * Simulate fetching a user, takes 100–300ms, occasionally fails.
 * Tracks concurrency so you can verify the pool is working.
 */
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    _callCount++
    _concurrentCalls++
    _peakConcurrency = Math.max(_peakConcurrency, _concurrentCalls)

    const delay = 100 + Math.random() * 200
    setTimeout(() => {
      _concurrentCalls--
      if (id % 7 === 0) {
        reject(new Error(\`fetchUser(\${id}): simulated network error\`))
      } else {
        resolve({ id, name: \`User \${id}\`, email: \`user\${id}@example.com\` })
      }
    }, delay)
  })
}

/**
 * Simulate a slow processing task, takes 200–500ms, never fails.
 */
function processRecord(data) {
  return new Promise((resolve) => {
    const delay = 200 + Math.random() * 300
    setTimeout(() => resolve({ ...data, processed: true, ts: Date.now() }), delay)
  })
}

module.exports = { fetchUser, processRecord, resetCounters, getStats }
`,
      "test_pool.js": `const { PromisePool } = require('./pool')
const { fetchUser, processRecord, resetCounters, getStats } = require('./mock_api')

async function runTests() {
  console.log('=== Test 1: Concurrency limit ===')
  resetCounters()
  const pool = new PromisePool(3)  // max 3 concurrent

  for (let i = 1; i <= 10; i++) {
    pool.add(() => fetchUser(i))
  }

  const start = Date.now()
  await pool.run()
  const elapsed = Date.now() - start
  const stats = getStats()

  console.log(\`Peak concurrency: \${stats.peakConcurrency} (expected <= 3)\`)
  console.log(\`Total calls: \${stats.totalCalls} (expected 10)\`)
  console.assert(stats.peakConcurrency <= 3, 'FAIL: concurrency exceeded limit!')
  console.assert(stats.totalCalls === 10, 'FAIL: wrong number of calls!')
  console.log(\`Completed in \${elapsed}ms\\n\`)

  console.log('=== Test 2: Progress callback ===')
  resetCounters()
  const pool2 = new PromisePool(2)
  const progressLog = []
  pool2.onProgress = (done, total) => progressLog.push({ done, total })

  for (let i = 1; i <= 5; i++) {
    pool2.add(() => processRecord({ id: i }))
  }

  await pool2.run()
  console.log('Progress events:', progressLog.length, '(expected 5)')
  console.log('Last event:', progressLog[progressLog.length - 1], '(expected { done: 5, total: 5 })')
  console.assert(progressLog.length === 5, 'FAIL: wrong progress event count')

  console.log('\\n=== Test 3: Individual task failures do not abort pool ===')
  resetCounters()
  const pool3 = new PromisePool(3)
  // IDs divisible by 7 will fail in fetchUser
  for (let i = 1; i <= 10; i++) {
    pool3.add(() => fetchUser(i))
  }
  const { results, errors } = await pool3.run()
  console.log(\`Completed: \${results.length}, Failed: \${errors.length}\`)
  console.assert(results.length + errors.length === 10, 'FAIL: total results should be 10')
  console.log('All tasks accounted for ✓')
}

runTests().catch(console.error)
`,
    },
  },

  {
    key: "js-event-store",
    label: "Event Sourcing Store",
    workspace: "code",
    language: "javascript",
    tags: ["javascript", "event-sourcing", "architecture", "hard", "debugging", "patterns"],
    title: "JavaScript: Event Sourcing Store",
    role: "Senior Backend / Full-Stack Engineer",
    description: "You've been handed an event sourcing implementation that's almost right but has 3 subtle bugs causing state corruption and phantom reads. Find and fix the bugs, complete the subscribe() method, then add snapshotting for performance.",
    rounds: JS_EVENT_STORE_ROUNDS,
    starter_files: {
      "events.js": `// Event type constants
const EventTypes = {
  ORDER_CREATED:    'ORDER_CREATED',
  ORDER_UPDATED:    'ORDER_UPDATED',
  ORDER_CANCELLED:  'ORDER_CANCELLED',
  ITEM_ADDED:       'ITEM_ADDED',
  ITEM_REMOVED:     'ITEM_REMOVED',
  INVENTORY_SET:    'INVENTORY_SET',
  INVENTORY_ADJUST: 'INVENTORY_ADJUST',
}

// Factory functions for creating events
function createOrderEvent(type, orderId, payload) {
  return { type, aggregateId: \`order:\${orderId}\`, payload, timestamp: Date.now() }
}

function createInventoryEvent(type, productId, payload) {
  return { type, aggregateId: \`inventory:\${productId}\`, payload, timestamp: Date.now() }
}

module.exports = { EventTypes, createOrderEvent, createInventoryEvent }
`,
      "projections.js": `/**
 * Projections derive current state by replaying a stream of events.
 * Each projection handles a specific aggregate type.
 */

class OrderProjection {
  constructor() {
    this.reset()
  }

  reset() {
    this._orders = {}  // orderId -> { status, items, total }
  }

  /**
   * Apply a single event to update the projection state.
   * Only handles ORDER_* and ITEM_* event types.
   * @param {{ type: string, aggregateId: string, payload: object }} event
   */
  apply(event) {
    throw new Error('Implement OrderProjection.apply()')
    // Hint: parse orderId from event.aggregateId ("order:123" -> "123")
    // ORDER_CREATED:   create entry with status: 'open', items: [], total: 0
    // ORDER_UPDATED:   merge payload fields into existing order
    // ORDER_CANCELLED: set status: 'cancelled'
    // ITEM_ADDED:      push payload to items, add payload.price to total
    // ITEM_REMOVED:    remove item by payload.itemId, subtract price from total
  }

  /**
   * Return a COPY of current state (not a reference).
   * @returns {{ [orderId]: object }}
   */
  getState() {
    throw new Error('Implement OrderProjection.getState()')
  }
}


class InventoryProjection {
  constructor() {
    this.reset()
  }

  reset() {
    this._stock = {}  // productId -> { quantity, reserved }
  }

  /**
   * Apply a single inventory event.
   * @param {{ type: string, aggregateId: string, payload: object }} event
   */
  apply(event) {
    throw new Error('Implement InventoryProjection.apply()')
    // Hint: parse productId from event.aggregateId ("inventory:SKU-001" -> "SKU-001")
    // INVENTORY_SET:    set stock[productId] = { quantity: payload.quantity, reserved: 0 }
    // INVENTORY_ADJUST: add payload.delta to stock[productId].quantity (can be negative)
  }

  /**
   * Return a COPY of current state.
   * @returns {{ [productId]: { quantity: number, reserved: number } }}
   */
  getState() {
    throw new Error('Implement InventoryProjection.getState()')
  }
}

module.exports = { OrderProjection, InventoryProjection }
`,
      "store.js": `const { OrderProjection, InventoryProjection } = require('./projections')

/**
 * EventStore, append-only log of events with projection maintenance and pub/sub.
 *
 * KNOWN BUGS (find and fix them in Round 2):
 * Bug 1: replayFrom() doesn't reset projections before replaying, state accumulates
 * Bug 2: subscribers are notified BEFORE the event is committed to this._events
 * Bug 3: getState() returns a direct reference, mutating it corrupts internal state
 */
class EventStore {
  constructor() {
    this._events = []       // all committed events, in order
    this._projections = {
      order:     new OrderProjection(),
      inventory: new InventoryProjection(),
    }
    this._subscribers = {}  // eventType -> [handler, ...]
    this._snapshots = {}    // aggregateId -> { version, state }  (Round 3)
  }

  /**
   * Append an event to the store and update projections.
   * @param {{ type: string, aggregateId: string, payload: object }} event
   * @returns {{ ...event, version: number }} committed event with version number
   */
  append(event) {
    const committed = { ...event, version: this._events.length }

    // BUG 2: notify subscribers BEFORE committing, if a subscriber calls
    // getState() it will see the PREVIOUS state, not the one including this event.
    this._notifySubscribers(committed)    // <-- BUG 2: should happen after push

    this._events.push(committed)

    const [aggregateType] = committed.aggregateId.split(':')
    if (this._projections[aggregateType]) {
      this._projections[aggregateType].apply(committed)
    }

    return committed
  }

  /**
   * Get current projected state for an aggregate type.
   * @param {'order'|'inventory'} aggregateType
   * @returns {object}
   */
  getState(aggregateType) {
    // BUG 3: returns direct reference to internal state, callers can mutate it
    return this._projections[aggregateType].getState()  // getState() itself may return ref
    // After fixing projections.getState() to return a copy, this method is fine.
    // But if getState() still returns a ref, you also need: JSON.parse(JSON.stringify(...))
  }

  /**
   * Replay events starting from a given version to rebuild projection state.
   * @param {number} fromVersion - replay events with version >= fromVersion
   */
  replayFrom(fromVersion) {
    // BUG 1: does not reset projections before replaying.
    // State from before the replay persists and merges with replayed state.
    const eventsToReplay = this._events.filter(e => e.version >= fromVersion)
    for (const event of eventsToReplay) {
      const [aggregateType] = event.aggregateId.split(':')
      if (this._projections[aggregateType]) {
        this._projections[aggregateType].apply(event)  // accumulates on top of existing state
      }
    }
  }

  /**
   * Subscribe to events of a given type.
   * @param {string} eventType
   * @param {(event: object) => void} handler
   * @returns {() => void} unsubscribe function
   */
  subscribe(eventType, handler) {
    throw new Error('Implement subscribe(), Round 2')
    // Store handler in this._subscribers[eventType]
    // Return a function that removes the handler
  }

  /**
   * Create a snapshot of current state for faster future replays (Round 3).
   */
  createSnapshot(aggregateId) {
    throw new Error('Implement createSnapshot(), Round 3')
  }

  /**
   * Retrieve the most recent snapshot for an aggregateId (Round 3).
   * @returns {{ version: number, state: object } | null}
   */
  getSnapshot(aggregateId) {
    throw new Error('Implement getSnapshot(), Round 3')
  }

  _notifySubscribers(event) {
    const handlers = this._subscribers[event.type] || []
    handlers.forEach(h => {
      try { h(event) } catch (e) { /* subscriber errors must not break the store */ }
    })
  }
}

module.exports = { EventStore }
`,
      "test_store.js": `const { EventStore } = require('./store')
const { EventTypes, createOrderEvent, createInventoryEvent } = require('./events')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(\`  ✓ \${message}\`)
    passed++
  } else {
    console.error(\`  ✗ FAIL: \${message}\`)
    failed++
  }
}

console.log('\\n=== Test: Basic append and projection ===')
{
  const store = new EventStore()
  store.append(createInventoryEvent(EventTypes.INVENTORY_SET, 'SKU-001', { quantity: 100 }))
  store.append(createInventoryEvent(EventTypes.INVENTORY_ADJUST, 'SKU-001', { delta: -10 }))
  const state = store.getState('inventory')
  assert(state['SKU-001']?.quantity === 90, 'Inventory quantity should be 90 after set+adjust')
}

console.log('\\n=== Test: Bug 3, getState() returns a copy ===')
{
  const store = new EventStore()
  store.append(createOrderEvent(EventTypes.ORDER_CREATED, '42', {}))
  const state = store.getState('order')
  state['42'] = { MUTATED: true }  // mutate the returned object
  const state2 = store.getState('order')
  assert(!state2['MUTATED'], 'Mutating returned state should not affect store (Bug 3)')
  assert(state2['42'] !== undefined, 'Order 42 should still exist after mutation attempt')
}

console.log('\\n=== Test: Bug 2, subscriber sees committed state ===')
{
  const store = new EventStore()
  let stateInHandler = null
  store.subscribe(EventTypes.INVENTORY_SET, (event) => {
    // When handler is called, the event should already be in the store
    stateInHandler = store.getState('inventory')
  })
  store.append(createInventoryEvent(EventTypes.INVENTORY_SET, 'SKU-002', { quantity: 50 }))
  assert(
    stateInHandler?.['SKU-002']?.quantity === 50,
    'Subscriber should see committed state (Bug 2), quantity should be 50'
  )
}

console.log('\\n=== Test: Bug 1, replayFrom() rebuilds state from scratch ===')
{
  const store = new EventStore()
  store.append(createInventoryEvent(EventTypes.INVENTORY_SET,    'SKU-003', { quantity: 100 }))
  store.append(createInventoryEvent(EventTypes.INVENTORY_ADJUST, 'SKU-003', { delta: -20 }))  // version 1
  store.append(createInventoryEvent(EventTypes.INVENTORY_ADJUST, 'SKU-003', { delta: -10 }))  // version 2

  // State is now 70. Replay from version 1 should produce 80 (100 - 20),
  // not 70+adjustment (which is what Bug 1 causes).
  store.replayFrom(1)
  const state = store.getState('inventory')
  assert(
    state['SKU-003']?.quantity === 80,
    'After replayFrom(1), quantity should be 80, not accumulated with prior state (Bug 1)'
  )
}

console.log('\\n=== Test: subscribe() and unsubscribe() ===')
{
  const store = new EventStore()
  const received = []
  const unsub = store.subscribe(EventTypes.ORDER_CREATED, (e) => received.push(e))
  store.append(createOrderEvent(EventTypes.ORDER_CREATED, '1', {}))
  store.append(createOrderEvent(EventTypes.ORDER_CREATED, '2', {}))
  unsub()
  store.append(createOrderEvent(EventTypes.ORDER_CREATED, '3', {}))
  assert(received.length === 2, 'Should receive 2 events before unsubscribe')
  assert(!received.find(e => e.aggregateId === 'order:3'), 'Should not receive event after unsubscribe')
}

console.log(\`\\n=== Results: \${passed} passed, \${failed} failed ===\\n\`)
process.exit(failed > 0 ? 1 : 0)
`,
    },
  },

  {
    key: "sales-deal-memo",
    label: "Enterprise Deal Memo",
    workspace: "report",
    title: "Sales: Enterprise Deal Memo",
    role: "Enterprise Account Executive",
    tags: ["sales", "enterprise", "deal-strategy", "b2b", "account-executive", "memo"],
    description:
      "You are an Enterprise Account Executive preparing an internal deal memo for a $340,000 opportunity at Northgate Financial Services, a 1,200-employee regional bank. The deal is a 3-year contract for your company's document automation platform. The economic buyer is the CFO, the champion is the VP of Operations, and the Q3 board meeting in 6 weeks is the critical timing driver. The memo will be reviewed by your VP of Sales before it goes to the executive team.",
    rounds: SALES_DEAL_MEMO_ROUNDS,
  },

  {
    key: "pr-crisis-email",
    label: "PR Crisis Response",
    workspace: "email",
    title: "PR/Comms: Crisis Response",
    role: "Head of Communications",
    tags: ["pr", "communications", "crisis", "email", "data-breach", "stakeholder", "incident"],
    description:
      "You are the Head of Communications at Meridian Health Tech, a 400-person health data analytics company. A security researcher posted this morning that a misconfigured S3 bucket exposed patient demographic records (names, dates of birth, zip codes) for approximately 14,000 individuals across three hospital clients. No SSNs or medical records were exposed. Engineering has already taken the bucket offline. You need to manage communications to clients, employees, and internally over the course of the day.",
    rounds: PR_CRISIS_EMAIL_ROUNDS,
  },

  {
    key: "hr-hiring-rubric",
    label: "Hiring Rubric Design",
    workspace: "report",
    title: "HR/People Ops: Hiring Rubric",
    role: "Senior People Ops Partner",
    tags: ["hr", "people-ops", "hiring", "rubric", "structured-interviews", "talent", "calibration"],
    description:
      "You are a Senior People Ops Partner at a 180-person remote-first B2B SaaS company (Series B). The last two hiring panels for Senior Product Designer produced wildly inconsistent scores with no documented reasoning. You have been tasked with designing a structured hiring rubric and calibration protocol before the next panel in two weeks. The role requires systems thinking in design, Agile delivery experience, and strong cross-functional communication.",
    rounds: HR_HIRING_RUBRIC_ROUNDS,
  },

  {
    key: "ops-vendor-scorecard",
    label: "Vendor Evaluation Scorecard",
    workspace: "spreadsheet",
    title: "Operations: Vendor Scorecard",
    role: "Head of Operations",
    tags: ["operations", "vendor", "scorecard", "3pl", "logistics", "procurement", "spreadsheet"],
    description:
      "You are the Head of Operations at a 90-person DTC apparel company ($22M annual revenue). Your 3PL contract is up in 90 days and you are running a competitive evaluation between three providers: ShipCore (incumbent, 4-year relationship), FastFulfill (challenger, 25% cheaper per unit), and PrecisionLogistics (premium option, stronger technology). You need a rigorous vendor scorecard to guide the decision and present to the CEO and CFO.",
    rounds: OPS_VENDOR_SCORECARD_ROUNDS,
  },

  {
    key: "legal-contract-review",
    label: "Contract Review Brief",
    workspace: "report",
    title: "Legal/Compliance: Contract Review Brief",
    role: "Legal / Compliance Analyst",
    tags: ["legal", "compliance", "contract", "msa", "risk", "redlines", "enterprise"],
    description:
      "You are a Legal/Compliance Analyst at a 250-person HR tech SaaS company (Series C). You have been asked to review a Master Services Agreement from Talmadge Group, a 12,000-employee manufacturing client, before it goes to the VP of Legal. The contract value is $1.8M over 3 years. Five key clauses have been flagged for your analysis, covering indemnification, liability caps, data processing, audit rights, and governing law.",
    rounds: LEGAL_CONTRACT_REVIEW_ROUNDS,
  },

  {
    key: "product-competitive-deck",
    label: "Competitive Teardown Deck",
    workspace: "deck",
    title: "Product: Competitive Teardown",
    role: "Product Manager",
    tags: ["product", "competitive-analysis", "deck", "strategy", "positioning", "pm", "saas"],
    description:
      "You are a Product Manager at Relay, a 60-person B2B workflow automation startup ($6M ARR, Series A). Relay is purpose-built for human-in-the-loop workflows, where automation pauses for human review or approval. You are preparing a competitive teardown deck for the executive team and board, covering Zapier, Make (formerly Integromat), and n8n. The goal is to clarify where Relay wins, where it is vulnerable, and what to do about it.",
    rounds: PRODUCT_COMPETITIVE_DECK_ROUNDS,
  },

  {
    key: "content-seo-strategy",
    label: "Content Strategy Report",
    workspace: "report",
    title: "Content/SEO: Content Strategy",
    role: "Content Strategist",
    tags: ["content", "seo", "strategy", "fintech", "organic", "editorial", "marketing"],
    description:
      "You are a Content Strategist at Trove, a 45-person fintech startup helping freelancers and independent contractors manage business finances. Organic traffic has plateaued at 12,000 sessions per month despite 18 months of publishing, and almost none of it converts. The team has 2 writers and a $4,000/month content budget. Your job is to audit what is broken and build a 90-day plan to turn content into a real acquisition channel.",
    rounds: CONTENT_SEO_STRATEGY_ROUNDS,
  },

  {
    key: "am-qbr-deck",
    label: "QBR Presentation",
    workspace: "deck",
    title: "Account Management: QBR Prep",
    role: "Senior Account Manager",
    tags: ["account-management", "qbr", "deck", "renewal", "customer-success", "b2b", "saas"],
    description:
      "You are a Senior Account Manager preparing a Q2 Quarterly Business Review for Hartwell Engineering, a 600-person civil engineering firm at $148,000 ARR. Two of their five modules (Resource Forecasting at 12% adoption, Document Collaboration at 8% adoption) are critically underutilized. NPS is 31. Renewal is in 5 months. The CTO is your executive sponsor, but he opened your last call by saying the board is asking him to cut SaaS spend.",
    rounds: AM_QBR_DECK_ROUNDS,
  },

  {
    key: "support-escalation-email",
    label: "Escalation Triage",
    workspace: "email",
    title: "Customer Support: Escalation Triage",
    role: "Senior Customer Support Specialist",
    tags: ["customer-support", "escalation", "triage", "email", "incident", "b2b", "saas"],
    description:
      "You are a Senior Customer Support Specialist at Lumio, a 120-person B2B SaaS company (cloud-based project reporting tool, 3,200 business customers). It is Monday morning and you have inherited 5 priority escalation tickets from the weekend on-call team, including a board presentation deadline in 4 hours, a client-facing data accuracy bug, and a pattern of neglected tickets from a mid-market account. A timezone offset bug from Thursday's deployment has affected 23 customers.",
    rounds: SUPPORT_ESCALATION_EMAIL_ROUNDS,
  },

  {
    key: "strategy-market-entry",
    label: "Market Entry Analysis",
    workspace: "spreadsheet",
    title: "Strategy/BizDev: Market Entry Analysis",
    role: "Strategy Manager",
    tags: ["strategy", "bizdev", "market-entry", "tam-sam-som", "spreadsheet", "healthcare", "saas"],
    description:
      "You are a Strategy Manager at Vanta (compliance automation SaaS, approximately $100M ARR). The executive team is evaluating a launch into the healthcare vertical with a dedicated HIPAA compliance automation product. You have been asked to build the full market entry analysis: market sizing, feasibility assessment, competitive landscape, and a go/no-go recommendation with resource requirements and a phased entry plan.",
    rounds: STRATEGY_MARKET_ENTRY_ROUNDS,
  },
]

// ── Wizard ─────────────────────────────────────────────────────────

type WizardStep =
  | "start"
  | "type"
  | "search-coding"
  | "search-doc"
  | "search-email"
  | "search-deck"
  | "search-excel"

const STEP_INDEX: Record<WizardStep, number> = {
  start: 0,
  type: 1,
  "search-coding": 2,
  "search-doc": 2,
  "search-email": 2,
  "search-deck": 2,
  "search-excel": 2,
}

// Each search step maps to one workspace kind it filters templates by.
const SEARCH_WORKSPACE: Partial<Record<WizardStep, WorkspaceType>> = {
  "search-coding": "code",
  "search-doc": "report",
  "search-email": "email",
  "search-deck": "deck",
  "search-excel": "spreadsheet",
}

const SEARCH_STEPS = Object.keys(SEARCH_WORKSPACE) as WizardStep[]

const slideVariants = {
  enter: (d: number) => ({ x: d * 24, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (d: number) => ({
    x: d * -24,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
}

const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
  report: "Doc",
  email: "Email",
  spreadsheet: "Sheet",
  deck: "Deck",
  code: "Code",
}

// ── Main component ─────────────────────────────────────────────────

interface AssessmentCreatorProps {
  companyId: string
  initialData?: Assessment
  assessmentId?: string
}

export function AssessmentCreator({ companyId, initialData, assessmentId }: AssessmentCreatorProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!assessmentId && !!initialData

  // Form state — seeded from initialData when editing
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [role, setRole] = useState(initialData?.role ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [tensionLevel, setTensionLevel] = useState<"junior" | "senior">(initialData?.tension_level ?? "junior")
  const [notifyEmailsInput, setNotifyEmailsInput] = useState((initialData?.notify_emails ?? []).join(", "))
  const nextId = useRef(2)
  const [rounds, setRounds] = useState<(AssessmentRound & { _id: number })[]>(
    initialData
      ? initialData.rounds.map((r, i) => ({ ...r, _id: i + 1 }))
      : [{ _id: 1, round: 1, title: "", prompt: "", success_criteria: "" }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey | null>(null)
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(initialData?.workspace_type ?? "report")
  const [language, setLanguage] = useState<"python" | "javascript">(initialData?.language ?? "python")
  const [starterFiles, setStarterFiles] = useState<Record<string, string> | undefined>(initialData?.starter_files)

  // Wizard state — skip wizard when editing
  const [wizardDone, setWizardDone] = useState(isEditing)
  const [wizardStep, setWizardStep] = useState<WizardStep>("start")
  const [wizardDir, setWizardDir] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [previewKey, setPreviewKey] = useState<TemplateKey | null>(null)

  function goTo(step: WizardStep) {
    setWizardDir(STEP_INDEX[step] >= STEP_INDEX[wizardStep] ? 1 : -1)
    setWizardStep(step)
    setPreviewKey(null)
    setSearchQuery("")
  }

  function clearForm() {
    setTitle("")
    setRole("")
    setDescription("")
    setRounds([{ _id: nextId.current++, round: 1, title: "", prompt: "", success_criteria: "" }])
    setStarterFiles(undefined)
  }

  function loadTemplate(key: TemplateKey) {
    const tpl = TEMPLATES.find(t => t.key === key)
    if (!tpl) return
    setActiveTemplate(key)
    setTitle(tpl.title)
    setRole(tpl.role)
    setDescription(tpl.description)
    setWorkspaceType(tpl.workspace)
    if (tpl.language) setLanguage(tpl.language)
    setStarterFiles(tpl.starter_files)
    setRounds(tpl.rounds.map(r => ({ ...r, _id: nextId.current++ })))
  }

  function finishWithTemplate(key: TemplateKey) {
    loadTemplate(key)
    setWizardDone(true)
  }

  function finishScratch() {
    clearForm()
    setActiveTemplate(null)
    setWorkspaceType("report")
    setWizardDone(true)
  }

  function resetWizard() {
    setWizardDone(false)
    setWizardStep("start")
    setWizardDir(1)
    setPreviewKey(null)
    setSearchQuery("")
    clearForm()
    setActiveTemplate(null)
    setWorkspaceType("report")
    setLanguage("python")
  }

  const filteredTemplates = useMemo(() => {
    const ws = SEARCH_WORKSPACE[wizardStep]
    const pool = ws ? TEMPLATES.filter(t => t.workspace === ws) : []
    const q = searchQuery.toLowerCase().trim()
    if (!q) return pool
    return pool.filter(
      t =>
        t.label.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
    )
  }, [wizardStep, searchQuery])

  const previewTemplate = previewKey
    ? TEMPLATES.find(t => t.key === previewKey) ?? null
    : null

  function addRound() {
    const id = nextId.current++
    setRounds([...rounds, { _id: id, round: rounds.length + 1, title: "", prompt: "", success_criteria: "" }])
  }

  function removeRound(index: number) {
    const updated = rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, round: i + 1 }))
    setRounds(updated)
  }

  function updateRound(index: number, field: keyof AssessmentRound, value: string) {
    const updated = rounds.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    setRounds(updated)
  }

  async function handleSave() {
    if (
      !title ||
      !role ||
      !description ||
      rounds.some(r => !r.title || !r.prompt || !r.success_criteria)
    ) {
      setError("Please fill in all fields.")
      return
    }
    setSaving(true)
    setError("")

    const notifyEmails = notifyEmailsInput
      .split(",")
      .map(e => e.trim())
      .filter(e => e.includes("@"))

    const payload = {
      title,
      role,
      description,
      rounds: rounds.map(({ _id, ...r }) => r),
      workspace_type: workspaceType,
      ...(workspaceType === "code" ? { language } : {}),
      ...(starterFiles ? { starter_files: starterFiles } : {}),
      tension_level: tensionLevel,
      notify_emails: notifyEmails,
    }

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("assessments")
        .update(payload)
        .eq("id", assessmentId)
        .eq("company_id", companyId)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
    } else {
      const { data, error: insertError } = await supabase
        .from("assessments")
        .insert({ ...payload, company_id: companyId, is_active: true })
        .select()
        .single()
      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
      router.push(`/dashboard/assessments/${data.id}/invite`)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Wizard ── */}
      {!wizardDone ? (
        <div style={{ overflow: "hidden", padding: "6px", margin: "-6px" }}>
          <AnimatePresence custom={wizardDir} mode="wait" initial={false}>

            {/* Step 1: start */}
            {wizardStep === "start" && (
              <motion.div
                key="start"
                custom={wizardDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <p className="text-sm font-semibold mb-4 text-center" style={{ color: "var(--color-ink-near)" }}>
                  How would you like to start?
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <WizardCard
                    icon={<LayoutTemplate size={18} />}
                    title="Use a template"
                    description="Pick from a curated question or scenario built for real roles."
                    onClick={() => goTo("type")}
                  />
                  <WizardCard
                    icon={<PenLine size={18} />}
                    title="Start from scratch"
                    description="Build your own assessment, blank slate, full control."
                    onClick={finishScratch}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: type */}
            {wizardStep === "type" && (
              <motion.div
                key="type"
                custom={wizardDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <BackButton onClick={() => goTo("start")} />
                <p className="text-sm font-semibold mb-4 text-center" style={{ color: "var(--color-ink-near)" }}>
                  What type of assessment?
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <WizardCard
                    icon={<Code2 size={18} />}
                    title="Coding"
                    description="Test engineering skills with a live coding challenge."
                    onClick={() => goTo("search-coding")}
                  />
                  <WizardCard
                    icon={<FileText size={18} />}
                    title="Doc"
                    description="Briefs, memos, and reports, written communication skills."
                    onClick={() => goTo("search-doc")}
                  />
                  <WizardCard
                    icon={<Mail size={18} />}
                    title="Email"
                    description="Drafting and replying, customer and stakeholder comms."
                    onClick={() => goTo("search-email")}
                  />
                  <WizardCard
                    icon={<Presentation size={18} />}
                    title="Pitch deck"
                    description="Slide-based storytelling, pitches and exec presentations."
                    onClick={() => goTo("search-deck")}
                  />
                  <WizardCard
                    icon={<Table2 size={18} />}
                    title="Excel"
                    description="Spreadsheets and formulas, data and finance tasks."
                    onClick={() => goTo("search-excel")}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: search */}
            {SEARCH_STEPS.includes(wizardStep) && (
              <motion.div
                key={wizardStep}
                custom={wizardDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <BackButton onClick={() => goTo("type")} />
                <p className="text-sm font-semibold mb-4 text-center" style={{ color: "var(--color-ink-near)" }}>
                  {wizardStep === "search-coding" ? "Choose a coding question" : "Choose a template"}
                </p>

                {/* Search input */}
                <div className="relative mb-2">
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-slate)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, or tag…"
                    autoFocus
                    className="w-full text-sm outline-none rounded-xl"
                    style={{
                      paddingLeft: 32,
                      paddingRight: 14,
                      paddingTop: 10,
                      paddingBottom: 10,
                      border: "1px solid var(--color-border-input)",
                      background: "var(--color-surface)",
                      color: "var(--color-ink-near)",
                    }}
                    onFocus={e => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
                    onBlur={e => (e.target.style.boxShadow = "none")}
                  />
                </div>

                {/* Results list */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
                >
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((tpl, i) => (
                      <TemplateResultRow
                        key={tpl.key}
                        template={tpl}
                        selected={previewKey === tpl.key}
                        last={i === filteredTemplates.length - 1}
                        isCoding={wizardStep === "search-coding"}
                        onClick={() =>
                          setPreviewKey(previewKey === tpl.key ? null : tpl.key)
                        }
                        onUse={() => finishWithTemplate(tpl.key)}
                      />
                    ))
                  ) : (
                    <p
                      className="text-sm py-5 text-center"
                      style={{ color: "var(--color-slate)" }}
                    >
                      No templates match your search.
                    </p>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      ) : (
        /* Compact selected-template indicator */
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <Check size={13} style={{ color: "var(--color-cobalt)", flexShrink: 0 }} />
            {activeTemplate ? (
              <span className="text-sm" style={{ color: "var(--color-ink-near)" }}>
                Template:{" "}
                <strong>{TEMPLATES.find(t => t.key === activeTemplate)?.label}</strong>
                <span className="ml-1.5 text-xs" style={{ color: "var(--color-slate)" }}>
                  · {WORKSPACE_LABELS[workspaceType]}
                </span>
              </span>
            ) : (
              <span className="text-sm" style={{ color: "var(--color-ink-near)" }}>
                Starting from scratch
              </span>
            )}
          </div>
          <button
            onClick={resetWizard}
            className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
            style={{ color: "var(--color-slate)", cursor: "pointer" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--color-canvas)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            title="Go back"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      )}

      {/* ── Form, appears after wizard ── */}
      <AnimatePresence>
        {wizardDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }}
            className="space-y-8"
          >
            <hr style={{ borderColor: "var(--color-border)" }} />

            {/* Basic info */}
            <div className="space-y-4">
              <Field label="Assessment title" hint="e.g. Marketing: Go-to-Market Strategy">
                <Input
                  value={title}
                  onChange={setTitle}
                  placeholder="Marketing: Go-to-Market Strategy"
                />
              </Field>
              <Field label="Role being hired for" hint="Shown to the candidate">
                <Input value={role} onChange={setRole} placeholder="Marketing Manager" />
              </Field>
              <Field
                label="Task context / background"
                hint="Everything the candidate needs to know. Company, product, data, constraints."
              >
                <Textarea
                  value={description}
                  onChange={setDescription}
                  rows={12}
                  placeholder="Describe the scenario the candidate is stepping into…"
                />
              </Field>
            </div>

            {/* Workspace type */}
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink-near)" }}>
                Workspace type
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-slate)" }}>
                The editable workspace candidates work in alongside Claude.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <TensionOption
                  value="report"
                  selected={workspaceType === "report"}
                  onSelect={() => setWorkspaceType("report")}
                  label="Document"
                  description="Rich text editor. Best for written deliverables, memos, strategy docs."
                />
                <TensionOption
                  value="email"
                  selected={workspaceType === "email"}
                  onSelect={() => setWorkspaceType("email")}
                  label="Email"
                  description="Email composer with To, From, and Subject fields. Best for comms tasks."
                />
                <TensionOption
                  value="spreadsheet"
                  selected={workspaceType === "spreadsheet"}
                  onSelect={() => setWorkspaceType("spreadsheet")}
                  label="Spreadsheet"
                  description="Excel-like grid with formula support. Best for data and finance tasks."
                />
                <TensionOption
                  value="deck"
                  selected={workspaceType === "deck"}
                  onSelect={() => setWorkspaceType("deck")}
                  label="Deck"
                  description="Structured slide builder with layout templates. Best for presentations."
                />
                <TensionOption
                  value="code"
                  selected={workspaceType === "code"}
                  onSelect={() => setWorkspaceType("code")}
                  label="Code"
                  description="Code editor with AI assistance. Best for engineering and data roles."
                />
              </div>
              {workspaceType === "code" && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--color-slate)" }}>
                    Language
                  </p>
                  <div className="flex gap-2">
                    {(["python", "javascript"] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className="text-sm px-4 py-1.5 rounded-full transition-all duration-150"
                        style={{
                          border:
                            language === lang
                              ? "1.5px solid var(--color-cobalt)"
                              : "1.5px solid var(--color-border)",
                          background: language === lang ? "#eff6ff" : "var(--color-surface)",
                          color:
                            language === lang ? "var(--color-cobalt)" : "var(--color-ink-near)",
                          fontWeight: language === lang ? 600 : 400,
                          cursor: "pointer",
                        }}
                      >
                        {lang === "python" ? "Python" : "JavaScript"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Tension */}
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink-near)" }}>
                AI tension level
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-slate)" }}>
                Controls how the candidate-facing Claude behaves during the assessment.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <TensionOption
                  value="junior"
                  selected={tensionLevel === "junior"}
                  onSelect={() => setTensionLevel("junior")}
                  label="Junior mode"
                  description="Claude is educational and proactive. Offers hints, explains reasoning, guides step by step."
                />
                <TensionOption
                  value="senior"
                  selected={tensionLevel === "senior"}
                  onSelect={() => setTensionLevel("senior")}
                  label="Senior mode"
                  description="Claude is a dumb executor. Only does exactly what it's told. No hand-holding."
                />
              </div>
            </div>

            {/* Rounds */}
            <div>
              <div className="flex items-start justify-between gap-6 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-ink-near)" }}>
                    Assessment rounds
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-slate)" }}>
                    Each round presents a new task. Candidates must complete one round to unlock the
                    next.
                  </p>
                </div>
                <button
                  onClick={addRound}
                  className="btn-pill-outline text-xs px-3 py-1.5 flex-shrink-0"
                >
                  + Add round
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {rounds.map((round, i) => (
                    <motion.div
                      key={round._id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                        transition: { duration: 0.2, ease: "easeIn" },
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="rounded-2xl p-5 space-y-3"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--color-slate)" }}
                        >
                          Round {round.round}
                        </span>
                        {rounds.length > 1 && (
                          <RemoveButton onClick={() => removeRound(i)} />
                        )}
                      </div>
                      <Input
                        value={round.title}
                        onChange={v => updateRound(i, "title", v)}
                        placeholder="Round title (e.g. Go-to-market strategy)"
                      />
                      <Textarea
                        value={round.prompt}
                        onChange={v => updateRound(i, "prompt", v)}
                        rows={4}
                        placeholder="The task prompt shown to the candidate for this round…"
                      />
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--color-slate)" }}
                        >
                          What does "done" look like? (not shown to candidate, used to guide Claude)
                        </p>
                        <Textarea
                          value={round.success_criteria}
                          onChange={v => updateRound(i, "success_criteria", v)}
                          rows={6}
                          placeholder="e.g. A positioning statement, 3 differentiators, a target audience definition, and 3 campaign concepts…"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Notify emails */}
            <div
              className="rounded-2xl p-5 space-y-2"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-ink-near)" }}>
                  Notify when candidate finishes
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-slate)" }}>
                  Email addresses to notify with a results link once a candidate completes this assessment. Separate multiple with commas.
                </p>
              </div>
              <input
                type="text"
                value={notifyEmailsInput}
                onChange={e => setNotifyEmailsInput(e.target.value)}
                placeholder="recruiter@company.com, manager@company.com"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: "var(--color-canvas)",
                  border: "1px solid var(--color-border-input)",
                  color: "var(--color-ink-near)",
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-pill-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : isEditing ? "Save changes" : "Save and get invite link →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Wizard sub-components ──────────────────────────────────────────

function WizardCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="text-left p-5 rounded-2xl w-full"
      style={{
        background: "var(--color-surface)",
        border: hovered ? "1.5px solid var(--color-cobalt)" : "1.5px solid var(--color-border)",
        cursor: "pointer",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: "var(--color-canvas)", color: "var(--color-ink-near)" }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
        {title}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>
        {description}
      </p>
      <div className="flex justify-end mt-3">
        <ChevronRight size={14} style={{ color: "var(--color-slate)" }} />
      </div>
    </motion.button>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-1 text-xs mb-4 transition-colors"
      style={{ color: hovered ? "var(--color-ink-near)" : "var(--color-slate)", cursor: "pointer" }}
    >
      <ChevronLeft size={12} />
      Back
    </button>
  )
}


function TemplateResultRow({
  template,
  selected,
  last,
  isCoding,
  onClick,
  onUse,
}: {
  template: TemplateConfig
  selected: boolean
  last: boolean
  isCoding: boolean
  onClick: () => void
  onUse: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ borderBottom: last && !selected ? "none" : selected ? "none" : "1px solid var(--color-border)" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
        style={{
          background: selected ? "color-mix(in srgb, var(--color-cobalt) 8%, var(--color-surface))" : hovered ? "var(--color-canvas)" : "transparent",
          cursor: "pointer",
          borderBottom: selected ? "1px solid color-mix(in srgb, var(--color-cobalt) 20%, var(--color-border))" : "none",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink-near)" }}>
              {template.label}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: template.workspace === "code" ? "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-canvas))" : "var(--color-canvas)",
                color: template.workspace === "code" ? "var(--color-cobalt)" : "var(--color-slate)",
                border: template.workspace === "code" ? "none" : "1px solid var(--color-border)",
              }}
            >
              {WORKSPACE_LABELS[template.workspace]}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {template.tags.slice(0, 5).map(tag => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: selected ? "color-mix(in srgb, var(--color-cobalt) 15%, var(--color-canvas))" : "var(--color-canvas)", color: "var(--color-slate)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          animate={{ rotate: selected ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={14} style={{ color: selected ? "var(--color-cobalt)" : "var(--color-slate)" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
            style={{ overflow: "hidden", borderBottom: last ? "none" : "1px solid var(--color-border)" }}
          >
            <div className="px-4 pb-4 pt-3" style={{ background: "color-mix(in srgb, var(--color-cobalt) 5%, var(--color-surface))" }}>
              {/* Description */}
              <p
                className="text-xs leading-relaxed mb-3"
                style={{
                  color: "var(--color-slate)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {template.description}
              </p>

              {/* Rounds */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-slate)" }}>
                  {isCoding ? "Steps" : "Rounds"}
                </p>
                <div className="space-y-1.5">
                  {template.rounds.map(r => (
                    <div key={r.round} className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{
                          background: "color-mix(in srgb, var(--color-cobalt) 15%, var(--color-canvas))",
                          color: "var(--color-cobalt)",
                          border: "1px solid color-mix(in srgb, var(--color-cobalt) 30%, var(--color-border))",
                        }}
                      >
                        {r.round}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-ink-near)" }}>
                        {r.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button onClick={onUse} className="btn-pill-dark text-sm w-full py-2.5">
                Use this template →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TemplatePreviewPanel({
  template,
  isCoding,
  onUse,
}: {
  template: TemplateConfig
  isCoding: boolean
  onUse: () => void
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            {template.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-slate)" }}>
            {template.role}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {template.language && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-canvas))", color: "var(--color-cobalt)" }}
            >
              {template.language === "python" ? "Python" : "JavaScript"}
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-canvas)",
              color: "var(--color-slate)",
              border: "1px solid var(--color-border)",
            }}
          >
            {WORKSPACE_LABELS[template.workspace]}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-canvas)",
              color: "var(--color-slate)",
              border: "1px solid var(--color-border)",
            }}
          >
            {template.rounds.length} rounds
          </span>
        </div>
      </div>

      {/* Description excerpt */}
      <p
        className="text-xs leading-relaxed mb-4"
        style={{
          color: "var(--color-slate)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {template.description}
      </p>

      {/* Rounds */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--color-slate)" }}
        >
          {isCoding ? "Steps" : "Rounds"}
        </p>
        <div className="space-y-2">
          {template.rounds.map(r => (
            <div key={r.round} className="flex items-center gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{
                  background: "var(--color-canvas)",
                  color: "var(--color-slate)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {r.round}
              </span>
              <span className="text-xs" style={{ color: "var(--color-ink-near)" }}>
                {r.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={onUse} className="btn-pill-dark text-sm w-full py-2.5">
        Use this template →
      </button>
    </div>
  )
}

// ── Form sub-components ────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink-near)" }}>
        {label}
      </label>
      {hint && (
        <p className="text-xs mb-1.5" style={{ color: "var(--color-slate)" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
      style={{
        border: "1px solid var(--color-border-input)",
        background: "var(--color-surface)",
        color: "var(--color-ink-near)",
      }}
      onFocus={e => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={e => (e.target.style.boxShadow = "none")}
    />
  )
}

function Textarea({
  value,
  onChange,
  rows,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows ?? 3}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-y"
      style={{
        border: "1px solid var(--color-border-input)",
        background: "var(--color-surface)",
        color: "var(--color-ink-near)",
      }}
      onFocus={e => (e.target.style.boxShadow = "0 0 0 2px var(--color-cobalt)")}
      onBlur={e => (e.target.style.boxShadow = "none")}
    />
  )
}

function TensionOption({
  value,
  selected,
  onSelect,
  label,
  description,
}: {
  value: string
  selected: boolean
  onSelect: () => void
  label: string
  description: string
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 rounded-2xl transition-all"
      style={{
        border: selected ? "2px solid var(--color-cobalt)" : "2px solid var(--color-border)",
        background: selected ? "color-mix(in srgb, var(--color-cobalt) 10%, var(--color-surface))" : "var(--color-surface)",
      }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
        {label}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-slate)" }}>
        {description}
      </p>
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-xs transition-colors duration-150"
      style={{ color: hovered ? "#dc2626" : "var(--color-slate)", cursor: "pointer" }}
    >
      Remove
    </button>
  )
}
