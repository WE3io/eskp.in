# Scoring Dimensions — Full Specification

Each dimension includes: what it measures, scoring rubric, failure signature,
question bank, and weak vs strong examples.

---

## 1. Objective Clarity

**What it measures:** Can a teammate who has never seen this project understand
exactly what "done" looks like from the prompt alone?

**Scoring rubric:**
- 9–10: Single, unambiguous completion state. A stranger could verify it.
- 7–8: Clear but one minor ambiguity remains.
- 5–6: Identifiable objective but requires interpretation. Reasonable people disagree on "done".
- 3–4: Objective buried in context or split across conflicting goals.
- 1–2: A wish or topic, not a task with a completion state.

**Failure signature:** "Build me an app" / "Fix the bugs" / "Handle authentication"

**Question bank (ask when below 7):**
- Q1a: What is the single most important thing that must be true when this task is done?
- Q1b: If I finished this and showed you the result, what would you check first?
- Q1c: Is this one task or several? If I can only do one part, which matters most?

**Example:**
- Weak: "Add user authentication to the app"
- Strong: "Add JWT-based authentication to the Express API. Users register with
  email/password, log in to receive a token, and access protected routes. Tokens
  expire after 24 hours."

---

## 2. Decomposability

**What it measures:** Can this task be broken into parallel, independent work
streams that do not require constant synchronisation?

**Scoring rubric:**
- 9–10: Naturally splits into 2–5 independent tracks with clear interfaces.
- 7–8: Can be parallelised but has 1–2 known handoff points.
- 5–6: Significant interdependencies. Parallelisation is risky.
- 3–4: Mostly sequential. Forced parallelism creates more overhead than it saves.
- 1–2: Cannot be meaningfully split, or too vague to decompose.

**Failure signature:** "Refactor the entire codebase" / monolithic tasks touching every file.

**Question bank (ask when below 7):**
- Q2a: Can you identify 2–4 independent pieces of work within this task?
- Q2b: If two people worked on this simultaneously, where would they conflict?
- Q2c: Which parts could proceed in parallel without waiting for each other?
- Q2d: Is there a natural split (frontend/backend, different modules, different data sets)?

**Example:**
- Weak: "Refactor the payment system"
- Strong: "Refactor in three tracks: (1) extract Stripe integration into standalone
  adapter, (2) rewrite billing calculation to use new adapter interface, (3) update
  all tests to cover new structure."

---

## 3. Boundary Definition

**What it measures:** Does the prompt specify exactly which files, directories, or
modules each piece of work covers — and what is OUT of scope?

**Scoring rubric:**
- 9–10: Explicit file/directory ownership per work stream. Clear exclusions.
- 7–8: General scope clear but file-level boundaries not explicit.
- 5–6: Scope at feature level but multiple interpretations plausible.
- 3–4: Vague area ("the backend", "the UI"). Two teammates could edit same file.
- 1–2: No boundaries stated. Entire codebase implicitly in scope.

**Failure signature:** Two teammates editing the same file. Silent overwrites.

**Question bank (ask when below 7):**
- Q3a: Which specific files or directories does each piece of work need to touch?
- Q3b: Are there shared files that more than one teammate might edit? Who owns them?
- Q3c: What should explicitly NOT be changed as part of this task?
- Q3d: Does this touch shared utilities, configs, or type definitions? Who coordinates?

**Example:**
- Weak: "One handles the API, another handles the frontend"
- Strong: "Backend teammate owns src/api/users/ and src/api/auth/. Frontend teammate
  owns src/components/auth/ and src/pages/login/. Neither touches src/lib/shared-types.ts
  — the lead updates that after both tracks complete."

---

## 4. Acceptance Criteria

**What it measures:** Is there a concrete, verifiable definition of "done" — not
just for the task as a whole, but for each subtask?

**Scoring rubric:**
- 9–10: Each subtask has explicit pass/fail criteria: tests, commands, expected outputs.
- 7–8: Overall criteria clear but per-subtask verification implicit.
- 5–6: General sense of "good" but no concrete verification steps.
- 3–4: Acceptance implied ("it should work"). No tests or review criteria.
- 1–2: No acceptance criteria. Done means "whenever the agent stops".

**Failure signature:** Plausible-looking code that fails on first run. Agents declaring
done with no verification. Silent regressions.

**Question bank (ask when below 7):**
- Q4a: What command(s) should pass when this is done? (npm test, curl, a specific script)
- Q4b: What is the minimum you would check to confirm the result is correct?
- Q4c: Are there existing tests that must continue to pass, or do new tests need writing?
- Q4d: What does a failed attempt look like? What symptoms indicate something is wrong?

**Example:**
- Weak: "Make sure it works"
- Strong: "npm test exits 0. POST /api/auth/register returns 201. GET /dashboard
  without valid JWT returns 401. npx tsc --noEmit exits 0."

---

## 5. Context Sufficiency

**What it measures:** Does the prompt contain enough background for a teammate
starting with zero conversation history to work without guessing?

**Scoring rubric:**
- 9–10: Tech stack, architecture decisions, naming conventions, reference file pointers.
- 7–8: Key context present but one or two important details missing.
- 5–6: Some context but significant gaps. Substantial orientation needed.
- 3–4: Minimal context. Extensive codebase exploration required.
- 1–2: No project context. Prompt assumes the teammate already knows everything.

**Failure signature:** Teammates asking basic orientation questions. Incorrect tech
stack assumptions. Code contradicting existing patterns.

**Question bank (ask when below 7):**
- Q5a: What tech stack? (language, framework, database, key libraries)
- Q5b: Are there existing patterns or conventions teammates should follow?
- Q5c: Which existing files should a teammate read first to understand the codebase?
- Q5d: Is there a CLAUDE.md, README, or architecture doc covering project conventions?
- Q5e: Any non-obvious gotchas about this codebase?

**Example:**
- Weak: "Add a new endpoint to the API"
- Strong: "Express/TypeScript API. Routes in src/api/routes/ export a Router.
  Validation uses zod schemas in src/api/schemas/. Tests use vitest mirroring src/.
  PostgreSQL via Prisma (prisma/schema.prisma). See CLAUDE.md for conventions."

---

## 6. Dependency Mapping

**What it measures:** Are the ordering constraints and handoff points between
subtasks explicitly stated?

**Scoring rubric:**
- 9–10: Explicit dependencies with handoff artefacts ("publishes API types before frontend starts").
- 7–8: Major dependencies identified but handoff mechanisms unspecified.
- 5–6: Some dependencies implied but not stated.
- 3–4: Dependencies exist but are not mentioned. Discovered mid-execution.
- 1–2: Presented as if all subtasks are independent when they are not.

**Failure signature:** Teammates blocked. Frontend built against changed API contract.
Integration failures at seams.

**Question bank (ask when below 7):**
- Q6a: Which subtasks must complete before others can start?
- Q6b: Are there shared interfaces or contracts that need agreeing before parallel work?
- Q6c: Who defines the contract between tracks and when?
- Q6d: What happens if one track finishes much earlier or later than expected?

**Example:**
- Weak: "Build the API and the UI in parallel"
- Strong: "Wave 1: Backend defines API contract in src/shared/api-types.ts. Wave 2:
  Frontend builds against those types while backend implements handlers. Wave 3:
  Integration testing after both complete."

---

## 7. Risk & Constraint Awareness

**What it measures:** Does the prompt identify things that could go wrong, things
that must not happen, and hard constraints on the solution?

**Scoring rubric:**
- 9–10: Explicit constraints (performance, security, compatibility, forbidden approaches).
  Known risks stated with mitigations.
- 7–8: Key constraints mentioned but risks not explicitly addressed.
- 5–6: Some constraints implied but not specific.
- 3–4: No constraints mentioned.
- 1–2: No constraint thinking at all, or actively encourages unconstrained approach.

**Failure signature:** Breaking changes. Security vulnerabilities. Performance regressions.
Inappropriate library choices.

**Question bank (ask when below 7):**
- Q7a: What must NOT happen? (no breaking changes, no new deps, no schema changes)
- Q7b: Are there performance, security, or compatibility requirements?
- Q7c: Approaches already considered and rejected? Why?
- Q7d: What is the worst realistic outcome if this goes wrong?
- Q7e: Should teammates require plan approval, or execute freely?

**Example:**
- Weak: "Add caching to the API"
- Strong: "Add Redis caching to /api/products. Cache TTL configurable via env var
  (default 5min). No new npm deps beyond ioredis. Do not cache authenticated responses.
  Plan approval required."

---

## 8. Coordination Model

**What it measures:** Does the prompt specify how teammates should communicate,
what messaging patterns to use, and how the lead should orchestrate?

**Scoring rubric:**
- 9–10: Team size, roles, communication expectations, synthesis plan, conflict resolution.
- 7–8: Team structure and roles clear but communication protocols not explicit.
- 5–6: Implies parallel work but does not specify interaction model.
- 3–4: No team structure. Expects multi-agent work without coordination thought.
- 1–2: Written for a single agent.

**Failure signature:** Duplicated work. Lead implementing instead of delegating.
Teammates in silent isolation. No synthesis step.

**Question bank (ask when below 7):**
- Q8a: How many teammates, and what role would each play?
- Q8b: Should teammates communicate as they go, or only report at the end?
- Q8c: If two teammates disagree on an approach, how should that be resolved?
- Q8d: Should the lead be delegate-only or also do work?
- Q8e: Do you want debate/challenge, or independent work with merge at end?

**Example:**
- Weak: "Use a few agents to do this"
- Strong: "3 + lead in delegate mode. Teammate 'api' owns src/api/. Teammate 'ui'
  owns src/components/. Teammate 'test' owns tests/. When 'api' finishes an endpoint
  it messages 'test' directly. Lead synthesises integration report when all complete."

---

## Scoring Quick Reference

| Score | Meaning                                                  |
|-------|----------------------------------------------------------|
| 10    | Exemplary. Could be used as documentation.               |
| 9     | Excellent. No meaningful gaps.                           |
| 8     | Good. One minor detail could be sharper.                 |
| 7     | Adequate. Threshold met. No blockers.                    |
| 6     | Near-miss. One specific gap that needs filling.          |
| 5     | Middling. Workable but significant ambiguity.            |
| 4     | Weak. Multiple gaps. Likely to cause problems.           |
| 3     | Poor. Dimension is mostly unspecified.                   |
| 2     | Very poor. Token mention at best.                        |
| 1     | Absent. Not addressed at all.                            |
| 0     | Actively harmful. Specification contradicts itself.      |

## Gate Thresholds

- Per-dimension minimum: 7
- Overall minimum: 60 out of 80
- Hard block: Any single dimension below 5 triggers an immediate flag