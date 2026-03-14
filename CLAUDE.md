# CLAUDE.md — Project Operating Instructions

eskp.in: a platform connecting people with helpers who can help them achieve their goals.
Phase 1 (Bootstrap). Built and operated by Claude with human panel oversight.
Governance charter: CONSTITUTION.md. Operational state: docs/state/.

---

## Commands

```
pnpm start              # Production server
pnpm dev                # Development server (nodemon)
pnpm budget             # Check token spend against monthly budget
pnpm stats              # Goal funnel, payment rate, match ratings, revenue
pnpm manage-helpers     # CLI: list, approve, set-notes, suggest-tags
scripts/deploy.sh       # Blue-green deploy (Docker Compose, health checks, auto-rollback)
```

**There is no test suite.** `pnpm test` will error. Do not attempt to run tests.

---

## Codebase Map

```
src/index.js            — Express server, Stripe/Resend webhooks, rate limiting, health check
src/api/
  goals.js              — POST /goals (submit), GET /goals/:id (status)
  account.js            — GET /account/export, GET /account/delete/confirm (GDPR)
  webhooks.js           — POST /webhooks/email (inbound routing), helper apps, clarifications
src/services/
  platform.js           — Core orchestration: goal processing, decomposition, matching, emails
  decompose.js          — AI goal decomposition (Claude Haiku), token spend tracking
  match.js              — AI matching (Claude Haiku), tag-overlap fallback, sensitive-domain defence
  email.js              — Transactional email via Resend, suppression filtering
  email-template.js     — HTML email rendering with branding; exports escHtml()
  email-reply-token.js  — Stateless token generation (user_id, context, timestamp)
  email-suppression.js  — Bounce/complaint suppression list (DB-backed)
  hard-exclusion.js     — Detects regulated advice domains, sends warm referrals
  sensitive-flag.js     — Flags sensitive-handling domains (mental health, abuse, etc.)
  payments.js           — Stripe checkout session creation
  account.js            — GDPR data export and deletion cascade
  helper-application.js — Processes "become a helper" email requests
src/db/
  connection.js         — PostgreSQL connection pool
  migrate.js            — Schema migrations (runs on app startup)
src/jobs/               — Scheduled job definitions
scripts/
  auto-session.sh       — Hourly Claude Code session with budget checks and failure alerts
  session-end.sh        — Post-session handoff (docs/state/ updates, git commit)
  heartbeat.sh          — Infrastructure health every 15min
  check-cron-health.sh  — Auto-session freshness check 3x/day
  backup-db.sh          — Daily PostgreSQL backup
  helper-digest.js      — Weekly helper email digest (Monday 08:00 UTC)
  followup.js           — Daily follow-up emails (post-intro check-in, stale goal timeout)
  outcome-roundup.js    — Monthly outcome roundup email (1st of month)
  data-retention.js     — Monthly: close stale goals, purge old JSONB
  budget-check.js       — Token budget checker
  stats.js              — Funnel and revenue statistics
worker/
  email-handler.js      — Cloudflare Worker: inbound email → /webhooks/email (deployed separately via wrangler)
public/                 — Static pages: landing, join, feedback, roadmap, support, privacy, terms, blog, payment callbacks
```

---

## DB Schema

9 tables. Migrations in `src/db/migrate.js`, applied on startup via raw SQL.

| Table | Key columns | Notes |
|---|---|---|
| users | id (UUID), email (unique), name, deleted_at, email_suppressed_at | Soft-delete; suppression tracking |
| goals | id, user_id→users, raw_text (nullable), decomposed (JSONB), status, sensitive_domain, clarification_attempts | raw_text nulled after decomposition (GDPR Art.5(1)(e)) |
| helpers | id, user_id→users, expertise (text[]), bio, is_active | Expertise as array |
| matches | id, goal_id→goals, helper_id→helpers, status, stripe_session_id, paid_at, feedback_token, user_rating | Payment + quality tracking |
| emails | id, direction, from/to, goal_id, match_id, resend_id | Transactional log |
| feedback | id, user_id, goal_id, source, content, processed | User feedback queue |
| helper_applications | id, email, status, helper_id (nullable post-approval) | Application workflow |
| account_tokens | id, user_id→users, token (unique), type (export/delete_confirm), expires_at | GDPR token-based actions |
| deletion_log | id, event_at, tables_affected, rows_deleted | Anonymised audit trail |

Goal statuses: submitted → decomposing → matched → introduced → resolved/closed; also pending_clarification.
Match statuses: proposed → introduced → accepted/declined/completed.

---

## Key Conventions

- **Library docs**: Use context7 MCP (`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`) before relying on training data. Training data may reflect outdated APIs.
- **Parameterised queries only.** Never string-concatenate SQL. All credential/security rules are in `.claude/rules/security.md`.
- **Email flow**: Inbound via Cloudflare Email Routing → Worker (`worker/email-handler.js`) → POST /webhooks/email. Outbound via Resend from `hello@mail.eskp.in`.
- **Hard exclusions**: `src/services/hard-exclusion.js` + `docs/operations/exclusion-register.md`. Regulated advice domains must be warm-referred, never matched. Changes to hard exclusion classifications require panel notification.
- **Sensitive domains**: `src/services/sensitive-flag.js`. May be matched but require professional signposting.
- **GDPR from day one**: UK GDPR + EU GDPR. Data minimisation (raw_text nulled post-decomposition), right to erasure, data portability. See `docs/operations/` for DPIA, ROPA, data subject rights procedure.
- **Data architecture**: Structured abstractions over raw narratives. Separate identity from intent. Schema should be structurally boring to attackers.
- **Build-vs-buy**: For new dependencies, create an entry in `docs/decisions/` with build cost, buy cost, and reasoning.
- **Deployment**: All changes via git. Deploy with `scripts/deploy.sh` (Docker Compose, health checks, auto-rollback). Never deploy directly to the live process.
- **Cloudflare MCP**: Autonomous for subdomains, cache/page/firewall rules. Requires panel approval for main A/AAAA records, nameservers, SSL changes.
- **Operational review**: Every 10 auto-sessions, review session logs. Track count in `docs/state/self-directed.md`.

---

## Documentation Index

| Path | Contents |
|---|---|
| `CONSTITUTION.md` | Founding charter: governance, ethics, articles 1–11 |
| `docs/decisions/` | ADRs: nginx, auth, branding, payments, agent SDK |
| `docs/operations/exclusion-register.md` | Hard exclusion + sensitive handling register (annual review due 2027-03-08) |
| `docs/operations/emergency-override-protocol.md` | Imminent-threat-to-life override (4 conditions, all must be met) |
| `docs/operations/` | Also: DPIA, LIA, ROPA, breach response, data subject rights, raw-text retention, processor DPAs, helper community, backup restore log |
| `docs/state/current-sprint.md` | Sprint progress, session-by-session log, blockers |
| `docs/state/task-queue.md` | All tasks (P0–P3) + recurring tasks table |
| `docs/state/budget-tracker.md` | Monthly token spend tracking |
| `docs/state/recent-decisions.md` | Last 10 decisions with reasoning |
| `docs/state/public-claims-register.md` | User-facing promises mapped to implementation; coherence check |
| `docs/state/feedback-queue.md` | Unprocessed user feedback |
| `docs/state/self-directed.md` | Session count, rotation tracking |
| `docs/research/` | Technical research notes (19 files) |
| `docs/updates/` | Build-in-public posts and recruitment drafts |
| `docs/backlog/` | Work item definitions by phase (phase-1/2/3); each has a Status line (draft/done) |
| `docs/copy/shared-strings.md` | Canonical nav, footer, CTA, tagline, pricing copy — use when creating/editing HTML pages |
| `docs/operations/brand-voice.md` | Voice, tone, vocabulary rules, before/after examples — use when writing any public-facing copy |

---

## Task Management

**Work item lifecycle:** backlog file → task queue → done.

1. **Design**: Use `work-item-designer` skill to create a structured `.md` file in `docs/backlog/<phase>/` (Outcome, Constraints, Acceptance Checks, Non-goals). Add `**Status:** draft` at top.
2. **Promote**: When ready for execution, assign a TSK-NNN ID and priority (P0–P3), add a row to `docs/state/task-queue.md`. Each session scans the backlog for untracked current-phase items.
3. **Execute**: Use `implementation-executor` skill for well-formed backlog items. Work through task queue in priority order: P0 → inbound emails/feedback → overdue recurring → highest P1.
4. **Close**: Mark `**Status:** done (YYYY-MM-DD)` in the backlog file. Mark `**done**` in task-queue.md.

Tasks use stable IDs (TSK-NNN). Never reuse an ID. Recurring tasks tracked in the `## Recurring Tasks` table — update `Last completed` and `Next due` after completing any recurring task.

Session start: run `/session-start` (reads state files + scans backlog, outputs orientation).
Session end: run `/session-end` (updates all state files, commits, pushes). **This is mandatory.**

---

## Authority Boundaries

**Panel contact:** panel@eskp.in | **Founder:** Sunil (sunil@eskp.in)

**MUST escalate to panel:**
- Security incidents
- Legal or regulatory questions
- User safety concerns
- Budget overruns (>$30/month without approval)
- Constitutional uncertainty
- System failures affecting user data
- Changes to hard exclusion classifications

**Autonomous (no escalation):**
- Routine development, bug fixes, feature iterations
- Build-in-public posts
- Deployment operations
- Open-source dependency decisions
- Token allocation within monthly budget

**Budget:** $30/month. Use Sonnet for routine work, Opus for strategic/architectural decisions. If spend >70% before the 21st, reduce activity and notify panel. Check with `pnpm budget`.
**Phase transition:** Phase 1 → 2 when revenue covers operational costs for two consecutive months.

---

## Infrastructure

**Cloudflare Worker** (`worker/email-handler.js`): Deployed separately via `wrangler`. Parses inbound email and forwards to /webhooks/email. Changes to email handling may require updating the worker independently.

**Social:** X @awebot1529222 (build-in-public) | LinkedIn linkedin.com/in/sunilparekhlondon

| Script | Checks | Schedule | Alert |
|---|---|---|---|
| `scripts/heartbeat.sh` | App, PostgreSQL, nginx, disk | `*/15 * * * *` | sunil@eskp.in |
| `scripts/check-cron-health.sh` | Auto-session freshness (<7h) | `0 4,12,20 * * *` | sunil@eskp.in |
| `scripts/backup-db.sh` | Daily backup | `0 2 * * *` | ~/logs/backup.log |
| `scripts/auto-session.sh` | Claude session + outcome report | `0 */4 * * *` | sunil@eskp.in on failure |

Alerts from `hello@mail.eskp.in` via Resend. Subject prefix: `[eskp.in]`.
