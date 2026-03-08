# Worked Example — Task Scope Gate in Action

Shows the gate applied to a real prompt, from raw intake through to clearance.

---

## Raw prompt (as submitted by user)

> "Build a REST API with authentication, rate limiting, and comprehensive tests.
> Please use a team of specialists for this."

## Initial Scorecard

| Dimension                | Score | Status  | Rationale                                          |
|--------------------------|-------|---------|----------------------------------------------------|
| 1. Objective Clarity     | 4/10  | BLOCKED | Three features named but no detail on any.         |
| 2. Decomposability       | 6/10  | BLOCKED | Natural split exists but not articulated.          |
| 3. Boundary Definition   | 2/10  | BLOCKED | No files, directories, or modules mentioned.       |
| 4. Acceptance Criteria   | 1/10  | BLOCKED | "Comprehensive tests" is the only nod.             |
| 5. Context Sufficiency   | 1/10  | BLOCKED | No tech stack, framework, or codebase reference.   |
| 6. Dependency Mapping    | 2/10  | BLOCKED | Implicit deps not stated.                          |
| 7. Risk & Constraint     | 1/10  | BLOCKED | No constraints or requirements.                    |
| 8. Coordination Model    | 3/10  | BLOCKED | "Team of specialists" with no structure.            |
| **OVERALL**              | **20/80** | **BLOCKED** |                                               |

**Diagnostic:** This prompt names a goal but provides almost no actionable detail.
Every dimension is below threshold. The three features hint at decomposability, but
without tech stack, file boundaries, acceptance criteria, or a coordination model,
an agent team would burn tokens exploring the possibility space rather than executing.

## Remediation Questions (Round 1)

1. **(Context, 1/10):** What tech stack are you using? Language, framework, database,
   key libraries — or is this greenfield?
2. **(Acceptance, 1/10):** What commands should pass when this is done? What does a
   working version look like concretely?
3. **(Risk, 1/10):** What must NOT happen? Forbidden dependencies, security requirements,
   backward compatibility constraints?
4. **(Boundary, 2/10):** What does the directory structure look like? Which directories
   should each specialist own?
5. **(Dependency, 2/10):** Should auth be built first so rate-limiting can use it?
6. **(Coordination, 3/10):** How many specialists and should they message each other?
7. **(Objective, 4/10):** For each feature — what specifically? JWT vs session-based?
   Per-IP or per-user rate limits? Unit or integration tests?

## User Answers (summarised)

1. Express + TypeScript, PostgreSQL via Prisma, new project
2. npm test must pass, npm run lint must pass, curl commands for each endpoint
3. No new ORMs, no API keys in env files, must use httpOnly cookies
4. src/routes/, src/middleware/, src/services/, tests/ — standard Express layout
5. Auth first, then rate-limiting uses the auth middleware
6. Three specialists + lead. Message each other on contract changes.
7. JWT with refresh tokens, per-user 100 req/min, unit + integration tests

## Revised Prompt (after one remediation round)

Create an agent team to build a REST API with authentication and rate-limiting.

**Stack:** Express + TypeScript, PostgreSQL via Prisma. New project.

**Team (3 specialists + lead in delegate mode):**
- **auth-specialist** owns src/routes/auth/, src/services/auth/, src/middleware/auth.ts
- **rate-limit-specialist** owns src/middleware/rate-limit.ts, src/services/rate-limit/
- **test-specialist** owns tests/ (mirrors src/), runs continuous validation

**Wave 1:** auth-specialist implements JWT with refresh tokens. Register, login, refresh.
httpOnly cookies. Access token 15min, refresh 7 days. Publishes middleware signature,
messages rate-limit-specialist.

**Wave 2 (after Wave 1):** rate-limit-specialist implements per-user rate-limiting.
100 req/min tracked in Redis. Uses auth middleware. Returns 429 with Retry-After.
Messages test-specialist when contracts finalised.

**Continuous:** test-specialist writes unit + integration tests as each wave completes.
vitest + supertest.

**Constraints:** Prisma only. No API keys in .env. httpOnly cookies. Plan approval required.

**Acceptance criteria:**
- npm test exits 0
- npm run lint exits 0
- POST /api/auth/register returns 201
- POST /api/auth/login returns 200 + sets httpOnly cookie
- GET /api/protected without token returns 401
- 101st request in 60s returns 429 with Retry-After
- npx tsc --noEmit exits 0

## Re-scored

| Dimension                | Score | Status    | Delta |
|--------------------------|-------|-----------|-------|
| 1. Objective Clarity     | 9/10  | PASS      | +5    |
| 2. Decomposability       | 9/10  | PASS      | +3    |
| 3. Boundary Definition   | 9/10  | PASS      | +7    |
| 4. Acceptance Criteria   | 10/10 | PASS      | +9    |
| 5. Context Sufficiency   | 8/10  | PASS      | +7    |
| 6. Dependency Mapping    | 9/10  | PASS      | +7    |
| 7. Risk & Constraint     | 8/10  | PASS      | +7    |
| 8. Coordination Model    | 9/10  | PASS      | +6    |
| **OVERALL**              | **71/80** | **CLEARED** |   |

**Gate decision: CLEARED.** The task is ready for agent team execution.