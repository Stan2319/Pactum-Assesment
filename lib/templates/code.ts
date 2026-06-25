import type { TemplateConfig } from "./types"

// ── Code-workspace templates ───────────────────────────────────────
// Each ships a runnable stub + a test file in starter_files, plus a
// language. Self-contained: no external services or packages.

export const codeTemplates: TemplateConfig[] = [
  {
    key: "code-lru-cache",
    label: "LRU Cache",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: LRU Cache",
    role: "Backend Engineer",
    tags: ["javascript", "data-structures", "cache", "algorithms", "medium"],
    description:
      "You are a backend engineering candidate. Implement a fixed-capacity LRU (least-recently-used) cache with O(1) get and put. Use the AI assistant to plan and iterate; edit your code in the editor on the right and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Plan the structure",
        prompt:
          "Read lru.js. Before writing code, explain in your own words why a plain object or array can't give O(1) for both get and put with LRU eviction, and which two data structures combined solve it. Describe what get and put must each do to maintain recency order.",
        success_criteria:
          "Explains that maintaining recency order plus O(1) lookup needs a hash map combined with a doubly linked list (or an equivalent like an insertion-ordered Map). Correctly states that both get and put must mark an item as most-recently-used, and put must evict the least-recently-used when over capacity.",
      },
      {
        round: 2,
        title: "Implement get/put",
        prompt:
          "Implement get(key) and put(key, value) so both are O(1) and the cache evicts the least-recently-used entry when it exceeds capacity. Run the tests.",
        success_criteria:
          "get returns the value and marks it most-recently-used; returns undefined/null for a miss. put inserts/updates and evicts the LRU entry when over capacity. Recency updates on both reads and writes. All provided tests pass.",
      },
      {
        round: 3,
        title: "Edge cases",
        prompt:
          "Harden the implementation: capacity of 0, updating an existing key (should not grow size or wrongly evict), and getting a missing key. Make sure these are handled and tested.",
        success_criteria:
          "Capacity 0 stores nothing. Updating an existing key refreshes recency without increasing size or evicting incorrectly. Missing keys are handled cleanly. The candidate added or described tests for these cases.",
      },
    ],
    starter_files: {
      "lru.js": `/**
 * LRUCache - fixed-capacity least-recently-used cache.
 * Both get and put must run in O(1).
 *
 * Usage:
 *   const c = new LRUCache(2)
 *   c.put('a', 1)
 *   c.put('b', 2)
 *   c.get('a')      // 1 (now 'a' is most-recently-used)
 *   c.put('c', 3)   // evicts 'b' (least-recently-used)
 *   c.get('b')      // undefined
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    // TODO: choose your internal structures
  }

  get(key) {
    throw new Error('Implement get()')
  }

  put(key, value) {
    throw new Error('Implement put()')
  }

  get size() {
    throw new Error('Implement size')
  }
}

module.exports = { LRUCache }
`,
      "test_lru.js": `const assert = require('assert')
const { LRUCache } = require('./lru')

const c = new LRUCache(2)
c.put('a', 1)
c.put('b', 2)
assert.strictEqual(c.get('a'), 1)   // touch 'a'
c.put('c', 3)                       // should evict 'b'
assert.strictEqual(c.get('b'), undefined)
assert.strictEqual(c.get('c'), 3)
assert.strictEqual(c.size, 2)

// update existing key should not grow size
c.put('c', 30)
assert.strictEqual(c.size, 2)
assert.strictEqual(c.get('c'), 30)

// capacity 0 stores nothing
const z = new LRUCache(0)
z.put('x', 1)
assert.strictEqual(z.get('x'), undefined)

console.log('All LRU tests passed')
`,
    },
  },
  {
    key: "code-retry-backoff",
    label: "Retry with Backoff",
    workspace: "code",
    language: "python",
    title: "Python: Retry with Exponential Backoff",
    role: "Backend Engineer",
    tags: ["python", "reliability", "retry", "backoff", "resilience", "medium"],
    description:
      "You are a backend engineering candidate. Implement a retry helper with exponential backoff and jitter for flaky operations (e.g. network calls). Use the AI assistant to plan and iterate; edit retry.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Design the policy",
        prompt:
          "Read retry.py. Before coding, explain the difference between retrying on every exception vs. only retryable ones, why exponential backoff is better than a fixed delay, and what problem jitter solves. State how you'll cap the maximum delay.",
        success_criteria:
          "Explains that blindly retrying all exceptions can hide real errors and retry non-idempotent failures; only specified retryable exceptions should retry. Correctly motivates exponential backoff (avoid hammering a struggling service) and jitter (avoid thundering-herd synchronization). Mentions capping the max delay.",
      },
      {
        round: 2,
        title: "Implement retry",
        prompt:
          "Implement retry_call(fn, attempts, base_delay, max_delay, retryable) so it retries fn on the given exception types with exponential backoff, returns the result on success, and re-raises the last exception after exhausting attempts. Make delay computation testable (inject the sleep function). Run the tests.",
        success_criteria:
          "Retries only on retryable exception types, succeeds and returns when fn eventually works, and re-raises after the final attempt. Backoff grows exponentially and is capped at max_delay. Sleep is injectable so tests don't actually wait. Provided tests pass.",
      },
      {
        round: 3,
        title: "Edge cases",
        prompt:
          "Handle: attempts=1 (no retry), a non-retryable exception (must raise immediately without retrying), and success on the first try (no sleep). Ensure these are covered.",
        success_criteria:
          "attempts=1 calls fn once and does not retry. A non-retryable exception propagates immediately with no further attempts. First-try success performs zero sleeps. The candidate verified these with tests or assertions.",
      },
    ],
    starter_files: {
      "retry.py": `"""
retry_call - run a function with exponential backoff + jitter.

Example:
    retry_call(lambda: flaky(), attempts=4, base_delay=0.1,
               max_delay=2.0, retryable=(ConnectionError,))
"""


def retry_call(fn, attempts=3, base_delay=0.1, max_delay=5.0,
               retryable=(Exception,), sleep=None, rand=None):
    """
    Call fn() and retry on 'retryable' exceptions with exponential backoff.

    Args:
        fn:        zero-arg callable to execute.
        attempts:  total number of tries (>= 1).
        base_delay: delay before the 2nd attempt, in seconds.
        max_delay: cap on any single delay.
        retryable: tuple of exception types that trigger a retry.
        sleep:     function(seconds) used to wait (injectable for tests).
        rand:      function() -> float in [0,1) for jitter (injectable).

    Returns:
        Whatever fn() returns on success.

    Raises:
        The last exception if all attempts fail, or a non-retryable
        exception immediately.
    """
    raise NotImplementedError("Implement retry_call()")
`,
      "test_retry.py": `import retry

calls = {"n": 0}
slept = []


def sleeper(s):
    slept.append(s)


def flaky_then_ok():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("boom")
    return "ok"


# succeeds on the 3rd try, sleeps twice, backoff grows
calls["n"] = 0
slept.clear()
result = retry.retry_call(flaky_then_ok, attempts=5, base_delay=0.1,
                          max_delay=2.0, retryable=(ConnectionError,),
                          sleep=sleeper, rand=lambda: 0.0)
assert result == "ok", result
assert calls["n"] == 3, calls["n"]
assert len(slept) == 2, slept
assert slept[1] >= slept[0], slept  # exponential

# non-retryable raises immediately, no sleeps
slept.clear()


def bad():
    raise ValueError("nope")


try:
    retry.retry_call(bad, attempts=3, retryable=(ConnectionError,),
                     sleep=sleeper, rand=lambda: 0.0)
    assert False, "should have raised"
except ValueError:
    pass
assert slept == [], slept

print("All retry tests passed")
`,
    },
  },
  {
    key: "code-hmac-webhook",
    label: "Webhook Verifier",
    workspace: "code",
    language: "python",
    title: "Python: HMAC Webhook Signature Verification",
    role: "Backend / Security Engineer",
    tags: ["python", "security", "hmac", "webhooks", "authentication", "medium"],
    description:
      "You are a backend engineering candidate. Implement secure verification of inbound webhook signatures (HMAC-SHA256 with a timestamp to prevent replay), the way Stripe/GitHub-style webhooks work. Use the AI assistant to plan and iterate; edit verify.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Threats & approach",
        prompt:
          "Read verify.py. Before coding, explain what attacks signature verification defends against, why you must use a constant-time comparison (not ==) for the signature, and why a timestamp tolerance window is needed to prevent replay attacks.",
        success_criteria:
          "Explains that HMAC verification ensures payload authenticity/integrity from someone holding the secret. Correctly justifies constant-time comparison to avoid timing attacks that leak the signature. Explains the timestamp window prevents replay of old, validly-signed requests.",
      },
      {
        round: 2,
        title: "Implement verification",
        prompt:
          "Implement verify_signature(payload, header, secret, tolerance_seconds, now). Parse the signature header (format: 't=<timestamp>,v1=<hex_hmac>'), recompute the HMAC-SHA256 over 't.payload', compare in constant time, and reject if the timestamp is outside the tolerance. Run the tests.",
        success_criteria:
          "Parses t and v1 from the header. Recomputes HMAC-SHA256 over the signed payload ('timestamp.payload') with the secret. Uses hmac.compare_digest (constant-time). Rejects expired timestamps outside tolerance. Returns True only when valid. Provided tests pass.",
      },
      {
        round: 3,
        title: "Edge cases",
        prompt:
          "Handle malformed headers (missing parts, bad hex), a tampered payload, and a wrong secret, all must return False (or raise a clear, caught error) rather than crashing or accidentally passing.",
        success_criteria:
          "Malformed headers, tampered payloads, and wrong secrets all fail verification safely without raising unhandled exceptions or false-passing. No path returns True for invalid input. Covered by tests.",
      },
    ],
    starter_files: {
      "verify.py": `"""
verify_signature - validate an HMAC-signed webhook request.

Header format (like Stripe):  "t=1700000000,v1=<hex hmac-sha256>"
Signed payload is the string:  f"{t}.{raw_body}"
"""
import hashlib
import hmac
import time


def verify_signature(payload, header, secret, tolerance_seconds=300, now=None):
    """
    Args:
        payload: raw request body as a str.
        header:  the signature header value (see format above).
        secret:  the shared signing secret (str).
        tolerance_seconds: max allowed age of the timestamp.
        now:     current unix time (int); defaults to time.time() if None.

    Returns:
        True if the signature is valid and fresh, else False.
    """
    raise NotImplementedError("Implement verify_signature()")


def sign(payload, secret, t):
    """Helper for tests: produce a valid header for the given payload/time."""
    mac = hmac.new(secret.encode(), f"{t}.{payload}".encode(), hashlib.sha256)
    return f"t={t},v1={mac.hexdigest()}"
`,
      "test_verify.py": `import verify

secret = "whsec_test"
payload = '{"event":"payment.succeeded","amount":4200}'
now = 1_700_000_000

good = verify.sign(payload, secret, now)
assert verify.verify_signature(payload, good, secret, 300, now) is True

# expired timestamp
old = verify.sign(payload, secret, now - 1000)
assert verify.verify_signature(payload, old, secret, 300, now) is False

# tampered payload
assert verify.verify_signature(payload + "x", good, secret, 300, now) is False

# wrong secret
assert verify.verify_signature(payload, good, "wrong", 300, now) is False

# malformed header
assert verify.verify_signature(payload, "garbage", secret, 300, now) is False

print("All HMAC verify tests passed")
`,
    },
  },
  {
    key: "code-cursor-pagination",
    label: "Cursor Pagination",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: Cursor-Based Pagination",
    role: "Backend Engineer",
    tags: ["javascript", "api", "pagination", "backend", "encoding", "medium"],
    description:
      "You are a backend engineering candidate. Implement cursor-based (keyset) pagination over a sorted dataset, the approach robust APIs use instead of offset pagination. Use the AI assistant to plan and iterate; edit paginate.js and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Cursor vs offset",
        prompt:
          "Read paginate.js. Before coding, explain why offset/limit pagination breaks or duplicates rows when items are inserted/deleted between page loads, and how an opaque cursor encoding the last-seen sort key fixes it. Describe what your cursor should encode.",
        success_criteria:
          "Explains that offset pagination shifts when rows are added/removed, causing skipped or duplicated items. Explains a keyset cursor anchored to the last item's sort key gives stable paging. States the cursor should encode the sort key (and a tiebreaker like id) of the last returned row.",
      },
      {
        round: 2,
        title: "Implement paginate",
        prompt:
          "Implement paginate(items, { limit, cursor }) returning { page, nextCursor }. items are pre-sorted by (createdAt, id). Use the cursor to return the next slice after the last-seen item, and produce a nextCursor (null when no more). Run the tests.",
        success_criteria:
          "Returns exactly `limit` items per page (fewer on the last page). The cursor correctly resumes after the last-seen (createdAt, id), with no skips or duplicates across pages. nextCursor is null at the end. Cursor is an opaque encoded string, not a raw offset.",
      },
      {
        round: 3,
        title: "Stability under mutation",
        prompt:
          "Show your pagination is stable: simulate an item being inserted near the start between fetching page 1 and page 2, and confirm page 2 does not skip or duplicate the items the user already saw. Handle an invalid/garbage cursor gracefully.",
        success_criteria:
          "Demonstrates that an insertion between pages does not cause page 2 to skip or repeat already-seen items (the keyset anchor handles it). An invalid cursor is handled gracefully (clear error or treated as start) rather than crashing. Covered by a test.",
      },
    ],
    starter_files: {
      "paginate.js": `/**
 * Cursor-based (keyset) pagination over items pre-sorted by (createdAt, id).
 *
 * paginate(items, { limit, cursor }) -> { page, nextCursor }
 *   - cursor: opaque string from a previous call, or null/undefined for page 1
 *   - nextCursor: opaque string, or null when there are no more items
 */

function encodeCursor(item) {
  // TODO: encode the last-seen sort key (createdAt + id) into an opaque string
  throw new Error('Implement encodeCursor()')
}

function decodeCursor(cursor) {
  // TODO: parse the opaque string back into { createdAt, id }
  throw new Error('Implement decodeCursor()')
}

function paginate(items, { limit, cursor } = {}) {
  throw new Error('Implement paginate()')
}

module.exports = { paginate, encodeCursor, decodeCursor }
`,
      "test_paginate.js": `const assert = require('assert')
const { paginate } = require('./paginate')

// sorted by (createdAt, id)
function make(n) {
  const out = []
  for (let i = 1; i <= n; i++) out.push({ id: i, createdAt: i * 10, name: 'item' + i })
  return out
}

const items = make(10)

const p1 = paginate(items, { limit: 4 })
assert.strictEqual(p1.page.length, 4)
assert.strictEqual(p1.page[0].id, 1)
assert.ok(p1.nextCursor)

const p2 = paginate(items, { limit: 4, cursor: p1.nextCursor })
assert.strictEqual(p2.page[0].id, 5)   // no overlap with page 1

const p3 = paginate(items, { limit: 4, cursor: p2.nextCursor })
assert.strictEqual(p3.page.length, 2)
assert.strictEqual(p3.nextCursor, null) // end reached

// stability: insert an early item between page 1 and page 2
const mutated = [{ id: 99, createdAt: 5, name: 'inserted' }, ...items]
mutated.sort((a, b) => a.createdAt - b.createdAt || a.id - b.id)
const p2b = paginate(mutated, { limit: 4, cursor: p1.nextCursor })
assert.strictEqual(p2b.page[0].id, 5)  // still resumes correctly, no skip/dup

console.log('All pagination tests passed')
`,
    },
  },
  {
    key: "code-csv-diff",
    label: "CSV Reconcile",
    workspace: "code",
    language: "python",
    title: "Python: CSV Diff and Reconciliation",
    role: "Data Engineer",
    tags: ["python", "data", "csv", "reconciliation", "etl", "medium"],
    description:
      "You are a data engineering candidate. Implement a reconciliation that compares two snapshots of records (old vs new) keyed by id and reports added, removed, and changed rows, the core of a sync/audit job. Use the AI assistant to plan; edit reconcile.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Plan the diff",
        prompt:
          "Read reconcile.py. Before coding, describe how you'll key the rows, how you'll detect 'changed' rows (and which fields changed), and the time/space tradeoff of building lookup dicts vs. nested scanning of the two lists.",
        success_criteria:
          "Plans to index both snapshots by id into dicts for O(n) comparison rather than O(n*m) nested scans. Defines 'changed' as same id, differing field values, and plans to capture which fields changed. Notes the memory cost of the dicts is acceptable for the speed gain.",
      },
      {
        round: 2,
        title: "Implement reconcile",
        prompt:
          "Implement reconcile(old_rows, new_rows) returning a dict with 'added', 'removed', and 'changed' (each a list; changed items include id and the per-field old/new values). Run the tests.",
        success_criteria:
          "Correctly classifies rows present only in new (added), only in old (removed), and in both but differing (changed). Changed entries report the specific fields with old and new values. Uses dict lookups, not nested loops. Provided tests pass.",
      },
      {
        round: 3,
        title: "Edge cases",
        prompt:
          "Handle: duplicate ids within a snapshot (decide and document the behavior), rows with differing column sets, and empty inputs. Make the behavior explicit and tested.",
        success_criteria:
          "Defines and implements clear behavior for duplicate ids (e.g. last wins, or raise) rather than silently corrupting output. Handles rows with missing/extra fields without crashing. Empty inputs return empty result sets. Behavior is covered by tests.",
      },
    ],
    starter_files: {
      "reconcile.py": `"""
reconcile - compare two snapshots of dict rows keyed by "id".

reconcile(old_rows, new_rows) -> {
    "added":   [row, ...],          # ids only in new
    "removed": [row, ...],          # ids only in old
    "changed": [{"id": .., "fields": {field: {"old": .., "new": ..}}}, ...],
}
"""


def reconcile(old_rows, new_rows):
    raise NotImplementedError("Implement reconcile()")
`,
      "test_reconcile.py": `import reconcile

old = [
    {"id": 1, "name": "A", "price": 10},
    {"id": 2, "name": "B", "price": 20},
    {"id": 3, "name": "C", "price": 30},
]
new = [
    {"id": 1, "name": "A", "price": 10},     # unchanged
    {"id": 2, "name": "B", "price": 25},     # price changed
    {"id": 4, "name": "D", "price": 40},     # added
]                                            # id 3 removed

r = reconcile.reconcile(old, new)

assert [x["id"] for x in r["added"]] == [4], r["added"]
assert [x["id"] for x in r["removed"]] == [3], r["removed"]
assert len(r["changed"]) == 1, r["changed"]
ch = r["changed"][0]
assert ch["id"] == 2
assert ch["fields"]["price"]["old"] == 20
assert ch["fields"]["price"]["new"] == 25

# empty inputs
empty = reconcile.reconcile([], [])
assert empty["added"] == [] and empty["removed"] == [] and empty["changed"] == []

print("All reconcile tests passed")
`,
    },
  },
  {
    key: "code-dedup-records",
    label: "Record Dedup",
    workspace: "code",
    language: "python",
    title: "Python: Fuzzy Record Deduplication",
    role: "Data Engineer",
    tags: ["python", "data", "deduplication", "normalization", "etl", "medium"],
    description:
      "You are a data engineering candidate. Implement deduplication of contact records that are 'the same' despite formatting differences (case, whitespace, punctuation in emails/phones), keeping the most complete record. Use the AI assistant to plan; edit dedup.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Define 'duplicate'",
        prompt:
          "Read dedup.py. Before coding, define your match key: how you'll normalize email and phone so 'John.Doe@X.com' and 'johndoe@x.com ' collide, and how you'll decide which of two duplicates to keep. Note a risk of over-merging.",
        success_criteria:
          "Defines a normalization (lowercase + trim email; strip non-digits from phone) to form a canonical match key. Specifies a keep rule (e.g. the record with the most non-empty fields, or newest). Acknowledges the risk that aggressive normalization can wrongly merge distinct people.",
      },
      {
        round: 2,
        title: "Implement dedup",
        prompt:
          "Implement dedup(records) returning a list with duplicates merged: group by normalized key, keep the most complete record, and merge in any non-empty fields the kept record is missing. Run the tests.",
        success_criteria:
          "Groups records by the normalized key. Keeps the most complete record per group and back-fills missing fields from its duplicates. Output has one record per real entity. Original formatting of the kept record is preserved where reasonable. Provided tests pass.",
      },
      {
        round: 3,
        title: "Edge cases",
        prompt:
          "Handle records missing email or phone (can't be keyed on a missing field), and ensure a record with no usable key isn't wrongly merged with others. Decide the behavior and test it.",
        success_criteria:
          "Records lacking the keyable fields are not collapsed together by their shared emptiness; each is preserved (or handled by an explicit documented rule). No data is lost for unkeyable records. Behavior is covered by tests.",
      },
    ],
    starter_files: {
      "dedup.py": `"""
dedup - merge contact records that refer to the same person.

A record is a dict like:
    {"name": "John Doe", "email": "John.Doe@X.com", "phone": "(555) 123-4567"}

Two records are duplicates if their normalized email OR normalized phone match.
Keep the most complete record and back-fill missing fields from duplicates.
"""


def dedup(records):
    raise NotImplementedError("Implement dedup()")
`,
      "test_dedup.py": `import dedup

records = [
    {"name": "John Doe", "email": "John.Doe@X.com", "phone": "(555) 123-4567"},
    {"name": "J. Doe",   "email": "johndoe@x.com ", "phone": ""},
    {"name": "Jane Roe",  "email": "jane@r.com", "phone": "555.000.1111"},
]

out = dedup.dedup(records)

# John's two records collapse into one
emails = sorted(r["email"].strip().lower() for r in out)
assert emails == ["jane@r.com", "johndoe@x.com"], emails
assert len(out) == 2, out

# kept John record retains the phone from the more complete duplicate
john = [r for r in out if "doe" in r["email"].lower()][0]
assert john["phone"].strip() != "", john

print("All dedup tests passed")
`,
    },
  },
  {
    key: "code-state-machine",
    label: "State Machine",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: Finite State Machine",
    role: "Frontend / Backend Engineer",
    tags: ["javascript", "state-machine", "patterns", "validation", "medium"],
    description:
      "You are an engineering candidate. Implement a small finite state machine that enforces allowed transitions (e.g. an order lifecycle), rejecting illegal moves. Use the AI assistant to plan; edit machine.js and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Model the transitions",
        prompt:
          "Read machine.js. Before coding, explain why encoding allowed transitions as data (a map of state -> allowed next states) is better than scattering if/else checks across the code, and how you'll reject an illegal transition clearly.",
        success_criteria:
          "Explains that a data-driven transition table centralizes the rules, is easier to extend and test, and avoids tangled conditionals. States that an illegal transition should fail loudly (throw or return a clear error), not silently no-op.",
      },
      {
        round: 2,
        title: "Implement the FSM",
        prompt:
          "Implement StateMachine(definition) with transition(event) that moves to the next state if allowed and throws on an illegal transition, plus can(event) to test without moving. Run the tests.",
        success_criteria:
          "transition applies a valid event and updates current state; throws a clear error on an illegal event. can(event) returns a boolean without changing state. The transition table drives behavior. Provided tests pass.",
      },
      {
        round: 3,
        title: "Guards & terminals",
        prompt:
          "Extend it: support terminal states (no outgoing transitions) and an optional guard function per transition that can veto a move. Ensure illegal moves from terminal states and vetoed guards are rejected.",
        success_criteria:
          "Terminal states reject all events. Per-transition guards are evaluated and can block an otherwise-allowed transition. Rejections are clear. Behavior is covered by tests.",
      },
    ],
    starter_files: {
      "machine.js": `/**
 * StateMachine - enforce allowed transitions.
 *
 * const m = new StateMachine({
 *   initial: 'pending',
 *   states: {
 *     pending:   { confirm: 'confirmed', cancel: 'cancelled' },
 *     confirmed: { ship: 'shipped', cancel: 'cancelled' },
 *     shipped:   { deliver: 'delivered' },
 *     delivered: {},   // terminal
 *     cancelled: {},   // terminal
 *   },
 * })
 * m.transition('confirm')  // -> 'confirmed'
 * m.can('ship')            // true
 */
class StateMachine {
  constructor(definition) {
    this.definition = definition
    this.current = definition.initial
  }

  can(event) {
    throw new Error('Implement can()')
  }

  transition(event) {
    throw new Error('Implement transition()')
  }
}

module.exports = { StateMachine }
`,
      "test_machine.js": `const assert = require('assert')
const { StateMachine } = require('./machine')

const def = {
  initial: 'pending',
  states: {
    pending:   { confirm: 'confirmed', cancel: 'cancelled' },
    confirmed: { ship: 'shipped', cancel: 'cancelled' },
    shipped:   { deliver: 'delivered' },
    delivered: {},
    cancelled: {},
  },
}

const m = new StateMachine(def)
assert.strictEqual(m.current, 'pending')
assert.strictEqual(m.can('confirm'), true)
assert.strictEqual(m.can('ship'), false)

m.transition('confirm')
assert.strictEqual(m.current, 'confirmed')
m.transition('ship')
assert.strictEqual(m.current, 'shipped')

// illegal transition throws
assert.throws(() => m.transition('cancel'))

// terminal state rejects everything
m.transition('deliver')
assert.strictEqual(m.current, 'delivered')
assert.strictEqual(m.can('confirm'), false)
assert.throws(() => m.transition('confirm'))

console.log('All state machine tests passed')
`,
    },
  },
  {
    key: "code-event-debounce",
    label: "Debounce & Throttle",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: Debounce and Throttle",
    role: "Frontend Engineer",
    tags: ["javascript", "async", "timing", "debounce", "throttle", "medium"],
    description:
      "You are a frontend engineering candidate. Implement debounce and throttle, the two timing utilities that tame high-frequency events (typing, scroll, resize). Use the AI assistant to plan; edit timing.js and run the tests. A fake clock is provided so tests are deterministic.",
    rounds: [
      {
        round: 1,
        title: "Debounce vs throttle",
        prompt:
          "Read timing.js. Before coding, explain the difference between debounce (fire once after activity stops) and throttle (fire at most once per interval), and give a real use case where each is the right choice.",
        success_criteria:
          "Correctly distinguishes debounce (waits for a quiet period, fires once) from throttle (caps rate to one call per window). Gives apt use cases (e.g. debounce for search-as-you-type; throttle for scroll handlers). Demonstrates understanding of the timing semantics.",
      },
      {
        round: 2,
        title: "Implement both",
        prompt:
          "Implement debounce(fn, wait, { setTimeout, clearTimeout }) and throttle(fn, interval, { now, setTimeout }) using the injected timer functions (so tests use a fake clock). Run the tests.",
        success_criteria:
          "debounce resets its timer on each call and invokes fn once after `wait` ms of quiet, with the latest arguments. throttle invokes fn immediately then suppresses calls until `interval` elapses. Both use the injected timer/clock, not the global. Provided tests pass.",
      },
      {
        round: 3,
        title: "Trailing calls & cancel",
        prompt:
          "Add a cancel() method to the debounced function (discards a pending call), and ensure throttle still delivers the last call's arguments when invoked during the cooldown (trailing invocation). Test both.",
        success_criteria:
          "The debounced function exposes cancel() that prevents a pending invocation. throttle captures and eventually fires the trailing call's latest arguments rather than dropping them. Both behaviors are verified with the fake clock.",
      },
    ],
    starter_files: {
      "timing.js": `/**
 * debounce(fn, wait, deps)  -> debounced function with .cancel()
 * throttle(fn, interval, deps) -> throttled function
 *
 * deps lets tests inject a fake clock:
 *   debounce deps: { setTimeout, clearTimeout }
 *   throttle deps: { now, setTimeout }
 */

function debounce(fn, wait, deps = {}) {
  const setT = deps.setTimeout || setTimeout
  const clearT = deps.clearTimeout || clearTimeout
  throw new Error('Implement debounce()')
}

function throttle(fn, interval, deps = {}) {
  const now = deps.now || Date.now
  const setT = deps.setTimeout || setTimeout
  throw new Error('Implement throttle()')
}

module.exports = { debounce, throttle }
`,
      "test_timing.js": `const assert = require('assert')
const { debounce, throttle } = require('./timing')

// --- fake clock ---
let t = 0
const timers = []
function fakeSetTimeout(cb, ms) {
  const id = timers.length
  timers.push({ at: t + ms, cb, id, active: true })
  return id
}
function fakeClearTimeout(id) { if (timers[id]) timers[id].active = false }
function advance(ms) {
  const target = t + ms
  for (;;) {
    const due = timers.filter(x => x.active && x.at <= target).sort((a, b) => a.at - b.at)[0]
    if (!due) break
    t = due.at
    due.active = false
    due.cb()
  }
  t = target
}

// debounce: only fires once after quiet period
let calls = []
const d = debounce((x) => calls.push(x), 100, { setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout })
d(1); advance(50); d(2); advance(50); d(3)
assert.deepStrictEqual(calls, [])   // still within quiet window
advance(100)
assert.deepStrictEqual(calls, [3])  // last args win, single call

// cancel discards pending
calls = []
d(9); d.cancel(); advance(200)
assert.deepStrictEqual(calls, [])

console.log('All timing tests passed')
`,
    },
  },
  {
    key: "code-query-builder",
    label: "Query Builder",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: Safe SQL Query Builder",
    role: "Backend Engineer",
    tags: ["javascript", "sql", "query-builder", "security", "api", "medium-hard"],
    description:
      "You are a backend engineering candidate. Implement a small fluent query builder that produces a parameterized SQL string and an ordered params array, never interpolating user values directly (SQL-injection safe). Use the AI assistant to plan; edit query.js and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Why parameterize",
        prompt:
          "Read query.js. Before coding, explain why building SQL by string-concatenating user input is dangerous, and how returning a parameterized query (with $1, $2 placeholders) plus a separate params array prevents injection. Note what must NOT be parameterized (column/table names) and how you'll keep those safe.",
        success_criteria:
          "Explains SQL injection from concatenated input and how placeholders + a params array keep values out of the SQL text. Correctly notes that identifiers (columns/tables) can't be parameters and must be validated against an allowlist instead. Shows security awareness.",
      },
      {
        round: 2,
        title: "Implement the builder",
        prompt:
          "Implement a builder supporting .select(cols).from(table).where(col, op, value).limit(n).build() returning { text, params }, where values become $1, $2... placeholders in order. Run the tests.",
        success_criteria:
          "build() returns a SQL string with ordered numbered placeholders and a params array whose order matches. Multiple .where() calls AND together with correctly numbered params. No user value is ever inlined into the text. Provided tests pass.",
      },
      {
        round: 3,
        title: "Validate identifiers",
        prompt:
          "Guard identifiers: column and table names must match a safe pattern (or an allowlist) so they can't carry injection. Reject an unsafe identifier with a clear error, and confirm operators are restricted to a known set.",
        success_criteria:
          "Table/column identifiers are validated against a safe pattern or allowlist; unsafe ones throw a clear error. The operator in where() is restricted to a known set (e.g. =, <, >, LIKE). Values still always go through params. Covered by tests.",
      },
    ],
    starter_files: {
      "query.js": `/**
 * Tiny parameterized query builder.
 *
 * query().select(['id', 'name']).from('users')
 *        .where('age', '>', 21).where('status', '=', 'active')
 *        .limit(10).build()
 *  -> {
 *       text: 'SELECT id, name FROM users WHERE age > $1 AND status = $2 LIMIT 10',
 *       params: [21, 'active'],
 *     }
 *
 * Values MUST become placeholders. Identifiers (table/column) must be validated.
 */
function query() {
  throw new Error('Implement query()')
}

module.exports = { query }
`,
      "test_query.js": `const assert = require('assert')
const { query } = require('./query')

const q = query()
  .select(['id', 'name'])
  .from('users')
  .where('age', '>', 21)
  .where('status', '=', 'active')
  .limit(10)
  .build()

assert.strictEqual(
  q.text,
  'SELECT id, name FROM users WHERE age > $1 AND status = $2 LIMIT 10'
)
assert.deepStrictEqual(q.params, [21, 'active'])

// unsafe identifier rejected
assert.throws(() => query().select(['*']).from('users; DROP TABLE users').build())
assert.throws(() => query().select(['id']).from('users').where('a; --', '=', 1).build())

// unknown operator rejected
assert.throws(() => query().select(['id']).from('users').where('age', 'INJECT', 1).build())

console.log('All query builder tests passed')
`,
    },
  },
  {
    key: "code-job-scheduler",
    label: "Job Scheduler",
    workspace: "code",
    language: "python",
    title: "Python: Priority Job Scheduler",
    role: "Backend Engineer",
    tags: ["python", "scheduling", "heap", "data-structures", "medium-hard"],
    description:
      "You are a backend engineering candidate. Implement a scheduler that runs due jobs in priority order using a fake clock, the core of a background-job runner. Use the AI assistant to plan; edit scheduler.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Pick the structure",
        prompt:
          "Read scheduler.py. Before coding, explain why a heap (priority queue) ordered by (run_at, -priority) is the right structure for 'get the next due job efficiently', versus scanning a list each tick. State how you'll break ties between jobs with the same run_at.",
        success_criteria:
          "Justifies a heap for O(log n) push and O(1) peek of the next job rather than O(n) scanning. Defines a clear ordering key (earliest run_at first, then higher priority) and an explicit tiebreak (e.g. insertion order) to keep ordering deterministic.",
      },
      {
        round: 2,
        title: "Implement schedule/run",
        prompt:
          "Implement Scheduler with schedule(job, run_at, priority) and run_until(now) that executes all jobs due at or before `now` in correct order, returning the executed job names in execution order. Use a fake clock (pass `now` in). Run the tests.",
        success_criteria:
          "Jobs due at or before `now` execute; future jobs do not. Execution order is by run_at then priority then tiebreak. run_until returns the executed names in order. Uses a heap. Provided tests pass.",
      },
      {
        round: 3,
        title: "Recurring & cancel",
        prompt:
          "Extend it: support a recurring job (re-schedules itself every interval) and a cancel(job_id) that removes a pending job. Ensure a cancelled job never runs and a recurring job re-appears at the next interval.",
        success_criteria:
          "A recurring job re-schedules at run_at + interval and fires again on a later run_until. cancel removes a pending job so it never executes (handle the heap removal correctly, e.g. tombstoning). Covered by tests.",
      },
    ],
    starter_files: {
      "scheduler.py": `"""
Scheduler - run due jobs in priority order using an injected clock.

    s = Scheduler()
    s.schedule("email", run_at=10, priority=1)
    s.schedule("report", run_at=10, priority=5)   # higher priority first
    s.run_until(now=10)   # -> ["report", "email"]
"""


class Scheduler:
    def __init__(self):
        raise NotImplementedError("Implement __init__")

    def schedule(self, job, run_at, priority=0):
        """Register a job (a name or callable) to run at time run_at."""
        raise NotImplementedError("Implement schedule()")

    def run_until(self, now):
        """Execute all jobs with run_at <= now, in order; return names run."""
        raise NotImplementedError("Implement run_until()")
`,
      "test_scheduler.py": `import scheduler

s = scheduler.Scheduler()
s.schedule("email", run_at=10, priority=1)
s.schedule("report", run_at=10, priority=5)   # same time, higher priority
s.schedule("cleanup", run_at=20, priority=1)  # future

ran = s.run_until(now=10)
assert ran == ["report", "email"], ran   # priority order at same time

# future job not yet run
ran2 = s.run_until(now=15)
assert ran2 == [], ran2

ran3 = s.run_until(now=25)
assert ran3 == ["cleanup"], ran3

print("All scheduler tests passed")
`,
    },
  },
  {
    key: "code-graph-bfs",
    label: "Shortest Path (BFS)",
    workspace: "code",
    language: "python",
    title: "Python: Shortest Path with BFS",
    role: "Software Engineer",
    tags: ["python", "algorithms", "graph", "bfs", "data-structures", "medium"],
    description:
      "You are an engineering candidate. Implement breadth-first shortest path on an unweighted graph (e.g. fewest hops between users, or steps in a dependency graph). Use the AI assistant to plan; edit graph.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Why BFS",
        prompt:
          "Read graph.py. Before coding, explain why BFS (not DFS) finds the shortest path in an unweighted graph, what role the visited set and the queue play, and how you'll reconstruct the actual path, not just its length.",
        success_criteria:
          "Explains BFS explores by distance so the first time it reaches a node is via a shortest path, which DFS does not guarantee. Correctly describes the queue (frontier) and visited set (avoid revisiting/cycles). Plans to track parent pointers to reconstruct the path.",
      },
      {
        round: 2,
        title: "Implement shortest_path",
        prompt:
          "Implement shortest_path(graph, start, goal) returning the list of nodes on a shortest path (inclusive of both ends), or None if unreachable. graph is an adjacency dict. Run the tests.",
        success_criteria:
          "Returns a valid shortest path as a node list from start to goal, or None when unreachable. Uses a queue and visited set (no infinite loops on cycles). Reconstructs the path via parents. Provided tests pass.",
      },
      {
        round: 3,
        title: "Edge cases",
        prompt:
          "Handle: start == goal (path is just [start]), a disconnected goal (None), and a graph with cycles (must terminate). Confirm these are covered.",
        success_criteria:
          "start == goal returns [start]. An unreachable goal returns None. Cyclic graphs terminate correctly thanks to the visited set. Covered by tests.",
      },
    ],
    starter_files: {
      "graph.py": `"""
shortest_path - BFS shortest path on an unweighted graph.

    graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
    shortest_path(graph, "a", "d")  -> ["a", "b", "d"]  (length 3)

Returns the node list on a shortest path, or None if goal is unreachable.
"""


def shortest_path(graph, start, goal):
    raise NotImplementedError("Implement shortest_path()")
`,
      "test_graph.py": `import graph as g

graph = {
    "a": ["b", "c"],
    "b": ["d"],
    "c": ["d", "e"],
    "d": ["f"],
    "e": ["f"],
    "f": [],
    "x": ["y"],   # disconnected component
    "y": [],
}

p = g.shortest_path(graph, "a", "f")
assert p is not None and p[0] == "a" and p[-1] == "f", p
assert len(p) == 4, p   # a -> (b|c) -> d|e -> f, shortest is 4 nodes

# start == goal
assert g.shortest_path(graph, "a", "a") == ["a"]

# unreachable
assert g.shortest_path(graph, "a", "y") is None

# cycle terminates
cyclic = {"1": ["2"], "2": ["3"], "3": ["1", "4"], "4": []}
assert g.shortest_path(cyclic, "1", "4") == ["1", "2", "3", "4"]

print("All graph tests passed")
`,
    },
  },
  {
    key: "code-stream-file-parser",
    label: "Streaming Parser",
    workspace: "code",
    language: "python",
    title: "Python: Streaming Log Parser",
    role: "Data / Backend Engineer",
    tags: ["python", "streaming", "generators", "parsing", "memory", "medium"],
    description:
      "You are a data/backend engineering candidate. Implement a memory-efficient parser that processes a large log line-by-line via a generator and aggregates stats without loading the whole file into memory. Use the AI assistant to plan; edit parser.py and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Why streaming",
        prompt:
          "Read parser.py. Before coding, explain what goes wrong if you read a multi-GB log with file.read() or readlines(), and how a generator that yields one parsed record at a time keeps memory flat. Note how you'll handle malformed lines.",
        success_criteria:
          "Explains that loading the whole file into memory can exhaust RAM, while a generator processes one line at a time keeping memory roughly constant. States a plan for malformed lines (skip + count, or yield an error marker) rather than crashing the whole parse.",
      },
      {
        round: 2,
        title: "Implement parse + aggregate",
        prompt:
          "Implement parse_lines(lines) as a generator yielding dicts for each valid log line (format: 'LEVEL timestamp message'), and aggregate(records) returning counts per level and the count of malformed lines skipped. Run the tests.",
        success_criteria:
          "parse_lines is a generator (yields, doesn't build a list). It parses well-formed lines into dicts and handles malformed ones per the documented rule. aggregate returns per-level counts and a malformed count. Memory stays flat over the stream. Provided tests pass.",
      },
      {
        round: 3,
        title: "Robustness",
        prompt:
          "Ensure the parser handles empty lines, lines with extra whitespace, and an unknown level gracefully, and that aggregate still works when given an empty stream. Confirm with tests.",
        success_criteria:
          "Empty/whitespace lines are skipped or handled without error. Unknown levels are counted under a defined bucket or as malformed per the rule. aggregate on an empty input returns zeroed counts. Covered by tests.",
      },
    ],
    starter_files: {
      "parser.py": `"""
Streaming log parser.

Line format:  "LEVEL timestamp message..."   e.g.  "ERROR 1700000000 db timeout"

parse_lines(lines) -> generator of {"level":.., "ts":.., "message":..}
aggregate(records) -> {"counts": {level: n, ...}, "malformed": n}

'lines' is any iterable of strings (a file object, a list, a generator) so the
whole file is never required in memory at once.
"""


def parse_lines(lines):
    raise NotImplementedError("Implement parse_lines() as a generator")


def aggregate(records):
    raise NotImplementedError("Implement aggregate()")
`,
      "test_parser.py": `import parser

sample = [
    "INFO 1700000000 started",
    "ERROR 1700000001 db timeout",
    "INFO 1700000002 served request",
    "",                         # blank -> skipped
    "garbage line",            # malformed
    "WARN 1700000003 retry",
]

gen = parser.parse_lines(sample)
assert hasattr(gen, "__next__"), "parse_lines must return a generator"

records = list(gen)
levels = [r["level"] for r in records]
assert levels == ["INFO", "ERROR", "INFO", "WARN"], levels

# aggregate over the stream again
agg = parser.aggregate(parser.parse_lines(sample))
assert agg["counts"]["INFO"] == 2, agg
assert agg["counts"]["ERROR"] == 1, agg

# empty input
empty = parser.aggregate(parser.parse_lines([]))
assert sum(empty["counts"].values()) == 0, empty

print("All parser tests passed")
`,
    },
  },
  {
    key: "code-sliding-rate-limiter",
    label: "Sliding-Window Limiter",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: Sliding-Window Rate Limiter",
    role: "Backend Engineer",
    tags: ["javascript", "rate-limiting", "algorithms", "backend", "medium-hard"],
    description:
      "You are a backend engineering candidate. Implement a sliding-window rate limiter (e.g. max 5 requests per 10 seconds per key) using a fake clock. Use the AI assistant to plan; edit limiter.js and run the tests.",
    rounds: [
      {
        round: 1,
        title: "Fixed vs sliding window",
        prompt:
          "Read limiter.js. Before coding, explain the burst problem with a naive fixed-window counter (requests clustering at a window boundary can allow 2x the limit), and how a sliding window of recent timestamps avoids it. Note the memory tradeoff.",
        success_criteria:
          "Explains the fixed-window boundary burst (e.g. limit requests at the end of one window and start of the next double the effective rate). Explains a sliding window tracks individual timestamps so the limit holds over any rolling interval. Notes it costs more memory per key.",
      },
      {
        round: 2,
        title: "Implement allow()",
        prompt:
          "Implement RateLimiter(limit, windowMs, { now }) with allow(key) returning true if the request is within the limit for that key in the trailing window, false otherwise. Use the injected clock. Run the tests.",
        success_criteria:
          "allow returns true up to `limit` requests within any trailing windowMs per key, false beyond it. Timestamps older than the window are pruned so capacity frees up as time passes. Uses the injected clock. Per-key isolation is correct. Provided tests pass.",
      },
      {
        round: 3,
        title: "Cleanup & isolation",
        prompt:
          "Ensure old timestamps are pruned so memory doesn't grow unbounded, and that two different keys have independent limits. Add a way to inspect remaining capacity for a key. Confirm with tests.",
        success_criteria:
          "Old timestamps are removed from each key's record (no unbounded growth). Different keys are fully independent. A remaining-capacity accessor returns the correct count. Covered by tests.",
      },
    ],
    starter_files: {
      "limiter.js": `/**
 * Sliding-window rate limiter.
 *
 * const rl = new RateLimiter(5, 10000, { now: () => clock })
 * rl.allow('user:1')   // true up to 5 times per rolling 10s, then false
 *
 * Uses an injected now() so tests can control time.
 */
class RateLimiter {
  constructor(limit, windowMs, deps = {}) {
    this.limit = limit
    this.windowMs = windowMs
    this.now = deps.now || Date.now
    // TODO: per-key store of recent timestamps
  }

  allow(key) {
    throw new Error('Implement allow()')
  }

  remaining(key) {
    throw new Error('Implement remaining()')
  }
}

module.exports = { RateLimiter }
`,
      "test_limiter.js": `const assert = require('assert')
const { RateLimiter } = require('./limiter')

let clock = 0
const rl = new RateLimiter(3, 1000, { now: () => clock })

// 3 allowed in the window
assert.strictEqual(rl.allow('a'), true)
assert.strictEqual(rl.allow('a'), true)
assert.strictEqual(rl.allow('a'), true)
assert.strictEqual(rl.allow('a'), false)   // 4th blocked
assert.strictEqual(rl.remaining('a'), 0)

// different key is independent
assert.strictEqual(rl.allow('b'), true)

// after the window slides, capacity frees up
clock += 1001
assert.strictEqual(rl.allow('a'), true)
assert.strictEqual(rl.remaining('a'), 2)

console.log('All rate limiter tests passed')
`,
    },
  },
  {
    key: "code-read-through-cache",
    label: "Read-Through Cache",
    workspace: "code",
    language: "javascript",
    title: "JavaScript: Read-Through Cache with TTL",
    role: "Backend Engineer",
    tags: ["javascript", "cache", "async", "ttl", "backend", "medium-hard"],
    description:
      "You are a backend engineering candidate. Implement a read-through cache that fetches on miss, caches with a TTL, and de-duplicates concurrent fetches for the same key (no thundering herd). Use the AI assistant to plan; edit cache.js and run the tests. A fake clock is provided.",
    rounds: [
      {
        round: 1,
        title: "Read-through & stampedes",
        prompt:
          "Read cache.js. Before coding, explain how a read-through cache differs from a cache the caller fills manually, what a TTL does, and the 'cache stampede' problem when many requests miss the same key at once. Describe how you'll de-duplicate concurrent fetches.",
        success_criteria:
          "Explains read-through: the cache itself loads on miss via a loader function, so callers just ask the cache. Explains TTL expiry. Identifies the stampede: concurrent misses each trigger the expensive loader. Plans to share a single in-flight promise per key so concurrent misses await one fetch.",
      },
      {
        round: 2,
        title: "Implement get()",
        prompt:
          "Implement Cache(loader, { ttlMs, now }) with async get(key): return the cached value if fresh, else call loader(key), cache it with the TTL, and return it. Use the injected clock for expiry. Run the tests.",
        success_criteria:
          "get returns cached values while fresh and calls loader only on miss/expiry. Values expire after ttlMs per the injected clock. The loader is not called when a fresh value exists. Provided tests pass.",
      },
      {
        round: 3,
        title: "De-dupe concurrent misses",
        prompt:
          "Ensure that N concurrent get(key) calls during a miss invoke loader exactly once (share the in-flight promise), and that a failed load doesn't cache the error permanently. Confirm with tests.",
        success_criteria:
          "Concurrent misses for the same key call loader exactly once and all resolve with the same value. A loader rejection is not cached as a permanent value (a later get retries). In-flight tracking is cleaned up after settle. Covered by tests.",
      },
    ],
    starter_files: {
      "cache.js": `/**
 * Read-through cache with TTL and single-flight de-duplication.
 *
 * const cache = new Cache(loadUser, { ttlMs: 1000, now: () => clock })
 * await cache.get('u1')   // miss -> calls loadUser('u1'), caches result
 * await cache.get('u1')   // hit  -> returns cached value, no loader call
 *
 * loader: async (key) => value
 */
class Cache {
  constructor(loader, deps = {}) {
    this.loader = loader
    this.ttlMs = deps.ttlMs || 60000
    this.now = deps.now || Date.now
    // TODO: value store + in-flight promise store
  }

  async get(key) {
    throw new Error('Implement get()')
  }
}

module.exports = { Cache }
`,
      "test_cache.js": `const assert = require('assert')
const { Cache } = require('./cache')

async function main() {
  let clock = 0
  let loads = 0
  const loader = async (key) => { loads++; return 'value:' + key }

  const cache = new Cache(loader, { ttlMs: 1000, now: () => clock })

  assert.strictEqual(await cache.get('a'), 'value:a')
  assert.strictEqual(await cache.get('a'), 'value:a')
  assert.strictEqual(loads, 1)            // second call was a hit

  // expire
  clock += 1001
  await cache.get('a')
  assert.strictEqual(loads, 2)            // reloaded after TTL

  // concurrent misses share one load
  loads = 0
  const [x, y, z] = await Promise.all([cache.get('b'), cache.get('b'), cache.get('b')])
  assert.strictEqual(x, 'value:b')
  assert.strictEqual(y, 'value:b')
  assert.strictEqual(z, 'value:b')
  assert.strictEqual(loads, 1)            // single-flight

  console.log('All cache tests passed')
}

main()
`,
    },
  },
]
