# Recent Decisions

## 2026-03-13 — Pino structured logging replaces console.* (TSK-123)
- **Decision:** Adopted Pino + pino-http as the structured logging framework across all 21 src/ files. PII redaction configured for 8 field paths (email, content, authorization headers).
- **Reason:** Structured JSON logs required before external users; console.* provides no redaction, no levels, no request correlation. Pino chosen per observability research (docs/research/2026-03-13-error-monitoring-observability.md).
- **Confidence:** 95%

## 2026-03-13 — Art 5.1 compliance: automated weekly budget report (TSK-126)
- **Decision:** Created scripts/budget-report.js to send weekly HTML+text budget report email to panel. Cron Monday 09:00 UTC. Includes month-to-date spend by model, week spend, revenue, goals, budget status.
- **Reason:** Mission alignment audit found this was the only outright constitutional non-compliance. Art 5.1 requires "Report spend weekly to the panel." Previously manual (sent once 2026-03-09).
- **Confidence:** 95%

## 2026-03-10 — Agent context architecture restructure
- **Decision:** Restructured CLAUDE.md and supporting agent context files based on a formal audit.
- **Key changes:** CLAUDE.md rewritten from 401→176 lines; added codebase map, DB schema, commands, documentation index; created /session-start and /session-end custom commands; added .githooks/pre-commit secret scanner; resolved duplication (escalation triggers now single-source in CLAUDE.md, credential rules single-source in security.md); safety-lens now references CLAUDE.md instead of restating triggers.
- **Rationale:** Audit found ~30% of always-on context was governance narrative with no coding-task value, critical technical context (codebase map, commands, schema) was missing, and duplication between CLAUDE.md/security.md/safety-lens created drift risk.
- **Result:** Always-on context reduced from ~7,300 to ~3,800 tokens (~48%) while adding missing technical reference content.
- **Confidence:** 85%

## 2026-03-10 — reply-to default changed to hello@mail.eskp.in
- **Decision:** `email.js` default `REPLY_TO` changed from `panel@eskp.in` to `hello@mail.eskp.in`.
- **Reason:** Sunil reported that when he replied to an escalation email, replies went to `panel@eskp.in` (the escalation address) instead of the platform's inbound processing pipeline (`hello@mail.eskp.in`). This means user replies would have been misrouted.
- **Side effect:** Decoupled `ALERT_EMAIL` env var in auto-session.sh — operational alerts now use `ALERT_EMAIL` not `EMAIL_REPLY_TO`.
- **Confidence:** 100%

## 2026-03-10 — ICO registration complete (TSK-039)
- **Decision:** Sunil registered eskp.in with the ICO and paid the Tier 1 data protection fee. ICO number: **C1889388**.
- **Action taken:** Privacy policy updated (section 1 now displays ICO number); ROPA updated with registration number; TSK-039 marked complete.
- **Confidence:** 100%

## 2026-03-10 — raw_text nulled immediately after decomposition (TSK-054)
- **Decision:** `goals.raw_text` is now set to NULL in the same DB transaction that writes the `decomposed` column. The column was changed from NOT NULL to nullable.
- **Reason:** UK GDPR Art.5(1)(e) storage limitation — raw_text serves only the decomposition step, which completes in seconds. The decomposed JSONB contains all matching-relevant data.
- **Scope:** Applies to both `processGoal()` and `processClarification()`. raw_text retained while `pending_clarification` (needed to build combined text on reply).
- **Confidence:** 95%

## 2026-03-10 — Erasure cascade now covers helpers + helper_applications (TSK-044)
- **Decision:** `executeDeletion()` now also deletes records from `helpers` (user_id) and `helper_applications` (email). Data export now includes both.
- **Reason:** Cascade audit found these tables contained PII but were not covered. UK GDPR Art.17 right to erasure covers all personal data regardless of table.
- **Confidence:** 100%

## 2026-03-10 — tool_use replaces JSON-in-text for decompose.js (TSK-033)
- **Decision:** Switched decompose.js from system-prompt-described JSON schema to Anthropic tool_use with explicit `input_schema` and `tool_choice: { type: 'tool', name: 'decompose_goal' }`.
- **Reason:** API enforces schema compliance; eliminates JSON parse failures; schema is self-documenting in code.
- **Live test:** candle business goal decomposed correctly first call.
- **Confidence:** 95%

## 2026-03-10 — Sensitive-domain goals held for human review (TSK-049)
- **Decision:** Goals touching mental health crisis, domestic abuse, child safeguarding, grief, addiction, eating disorders, relationship breakdown are flagged by `detectSensitiveDomain()` and routed to `processGoalSensitive()` — held for panel review, no automated matching or payment link.
- **Reason:** DPIA risk 3; Art.11.2 witnessed reflection principle; Art.3.1.1 never exploit vulnerability.
- **Design choice:** High-recall patterns (false positive = human review delay; false negative = unsafe auto-match).
- **Confidence:** 90%

## 2026-03-10 — TSK-021/022 promoted to P2 (constitutional rights, pre-external-user requirement)
- **Decision:** Account deletion flow (TSK-021) and data export endpoint (TSK-022) promoted from P3 to P2. These are constitutional rights under Art.10 and UK GDPR Art.17/20, not optional features.
- **Reason:** Mission alignment review identified these as required before external users, not post-launch add-ons.
- **Confidence:** 100%

## 2026-03-09 — Autonomous agent operational model established
- **Decision:** Claude operates as a self-directing agent, not just a task executor. Self-directed work (research, code quality, infrastructure, mission alignment, growth, communication) added as 5th priority in every auto-session. Task generation formalised as a first-class responsibility. Server stewardship recurring tasks added. Research priorities queued (TSK-026–030). Operational review every 10 sessions.
- **Constitutional basis:** Art.1 (purpose-driven evolution), Art.2.3 (Claude proposes and critiques), Art.2 (builder and operator role)
- **Confidence:** 100%

## 2026-03-09 — Operational hardening complete (blocks 1-6)
- **Decision:** All six hardening blocks implemented in one session. Root cause fix (Edit permission) verified working by test run. All monitoring, task queue, session-end checks in place.
- **Key changes:** .claude/settings.json (Edit added), auto-session.sh (6 hardening items), session-end.sh, heartbeat.sh, check-cron-health.sh, task-queue.md, goals.js fix, backup restore test PASS
- **Confidence:** 100%

## 2026-03-08 — Orchestration architecture: harden cron now, Agent SDK at Phase 2
- **Decision:** Keep cron + `claude --print` for Phase 1. Fix root cause (missing `--permission-mode acceptEdits` flag + `Edit` absent from permissions allow list). Agent SDK orchestrator deferred to Phase 2.
- **Root cause identified:** All auto-session failures trace to one missing flag. The 18:00 session stalled because `Edit` is not in `.claude/settings.json` permissions.allow — Claude hit a permission prompt it could not answer in non-interactive mode.
- **Agent SDK assessment:** Suitable for Phase 2 when real event-driven volume justifies the orchestrator complexity. Not appropriate at zero external users.
- **Confidence:** 95%

## 2026-03-08 — nginx over Caddy as reverse proxy
- **Decision:** nginx (Docker container) instead of Caddy (host service)
- **Reason:** Cloudflare terminates public TLS; nginx in Docker is consistent with containerised stack; Caddy's auto-cert advantage irrelevant here. Caddy was failing to start due to port conflicts. Full write-up: docs/decisions/002-nginx-over-caddy.md
- **Confidence:** 85%

## 2026-03-08 — Local token tracking over Anthropic usage API
- **Decision:** Log token usage per API call to local token_usage table; budget-check.js queries DB
- **Reason:** Anthropic usage API (/v1/usage) returns 404 for non-admin keys. Local tracking is more accurate (per-call granularity) and has no external dependency.
- **Confidence:** 95%

## 2026-03-08 — Cloudflare Email Routing + Worker for inbound email
- **Decision:** Cloudflare Email Routing routes hello@mail.eskp.in → Worker → platform webhook
- **Reason:** No server-side SMTP listener needed; Cloudflare handles MX; Worker is stateless and reliable
- **Confidence:** 90%

## 2026-03-08 — claude-haiku-4-5-20251001 for goal decomposition
- **Decision:** Haiku for all decompose() calls
- **Reason:** Cheapest Anthropic model; decomposition is a structured task that doesn't require reasoning. Sonnet reserved for development; Opus not used in Phase 1.
- **Confidence:** 95%

## 2026-03-08 — Resend on mail.eskp.in subdomain (not root)
- **Decision:** Resend sends from hello@mail.eskp.in; Google Workspace owns eskp.in MX
- **Reason:** Prevents SPF conflict; keeps panel email (sunil@eskp.in) on Google Workspace unaffected
- **Confidence:** 100%

## 2026-03-08 — Use pnpm as package manager
- **Decision:** pnpm over npm
- **Reason:** Faster installs, disk-efficient, preferred by Sunil
- **Confidence:** 100%

## 2026-03-08 — PostgreSQL via Docker on Hetzner
- **Decision:** Self-hosted PostgreSQL 16 in Docker, bound to 127.0.0.1:5432
- **Reason:** Open-source/self-hosted constitutional preference; avoids managed DB costs
- **Confidence:** 95%

## 2026-03-08 — GitHub remote: WE3io/eskp.in
- **Decision:** Version control hosted at git@github.com:WE3io/eskp.in.git
- **Reason:** Specified by Sunil; public visibility supports build-in-public
- **Confidence:** 100%

## 2026-03-08 — Skip social API automation in Phase 1
- **Decision:** Draft posts for Sunil to publish manually; no OAuth posting automation
- **Reason:** $30 budget should fund platform, not posting infrastructure. Revisit Phase 2.
- **Confidence:** 90%

## 2026-03-08 — Constitution ratified
- **Decision:** Constitution v1.0 ratified by Sunil Parekh and Claude Instance (Sonnet 4.6), 8th March 2026
- **Confidence:** 100%

## 2026-03-08 — Article 10 ratified: Platform Architecture Principles (Constitution v1.1)
- **Decision:** Article 10 added to CONSTITUTION.md by consensus — Sunil Parekh + Claude (Sonnet 4.6), 8th March 2026
- **Research basis:** `docs/research/advisory-panel-structures-v2.md`
- **Key constraints encoded:** Dyadic privacy architecture (four-tier visibility model, AI cross-thread data prohibition); anti-enshittification framework (no advertiser class, data portability as constitutional right, algorithmic transparency, User Advisory Council); panel model principles (self-efficacy not dependency, user-formed panels, bilateral integrity); empirical honesty obligation (measure actual effects, report honestly, do not overclaim)
- **9 backlog items generated** across phases 1–3 (see `docs/backlog/`)
- **Confidence:** 100%

## 2026-03-08 — Article 11 ratified: Professional Boundaries, Duty of Care, and Trust Directory (Constitution v1.2)
- **Decision:** Article 11 added to CONSTITUTION.md by consensus — Sunil Parekh + Claude (Sonnet 4.6), 8th March 2026
- **Research basis:** `docs/research/professional-boundaries-and-directory.md`
- **Key constraints encoded:** Exclusion framework (maintained register, hard exclusions architectural not self-regulatory, sensitive handling is additive not substitutive); duty of care under OSA 2023 (irresolvable privacy tension disclosed, safety infrastructure designed not monitored); emergency override on vital interests basis only (DPA 2018 s.15, documented, panel notification, retrospective review); trust directory provider-payment-free permanently (any proposal triggers constitutional review); witnessed reflection principle as platform default mode
- **Note:** FCA financial promotions constraint (originally 11.3.5) moved to operational guidance at Sunil's direction — captured in `docs/operations/exclusion-register.md`
- **15 backlog items generated** across phases 1–3 (see `docs/backlog/`)
- **Confidence:** 100%

## 2026-03-08 — git history rewritten to purge leaked credentials
- **Decision:** Use git filter-repo to replace all instances of old Context7 key, both old CF tokens, and CF account ID with REDACTED placeholders; force-push
- **Reason:** .mcp.json was tracked in git; multiple token values committed across 9 commits
- **Commands:** `git filter-repo --replace-text /tmp/replacements.txt --force` then `git push origin main --force`
- **Confidence:** 100%

## 2026-03-08 — Rate limiting via express-rate-limit + nginx limit_req
- **Decision:** Two-layer rate limiting: app-level (express-rate-limit) + nginx (limit_req_zone)
- **Reason:** Defence in depth; nginx layer catches abuse before it hits Node; app layer enforces per-route limits
- **Confidence:** 90%

## 2026-03-08 — Prompt injection defence via input delimiters
- **Decision:** Wrap all user-submitted text in <user_submission> XML tags; system prompt instructs model to treat content as untrusted; strip control characters before passing
- **Reason:** Raw email body was being injected directly into prompt — injection risk for jailbreak/exfiltration attempts
- **Confidence:** 85% (delimiters reduce risk significantly; semantic attacks remain possible)

## 2026-03-08 — Autonomous operation readiness audit findings
- **Decision:** Audit findings logged; bugs and gaps converted to backlog items (fix-goals-endpoint-jsonb, harden-auto-session)
- **Key findings:** GET /goals/:id broken (json_array_elements vs jsonb_array_elements); auto-session lacks lock file + .env export + accomplishment verification; backups on same server, untested, no off-site copy
- **Blocked on:** Sunil providing off-site backup destination
- **Confidence:** 100% (observed, not inferred)

## 2026-03-08 — Auto-session autonomous scope confirmed
- **Decision:** Claude may operate autonomously within the guidelines of the Constitution (Article 2.2). No separate per-session approval required for cron sessions. Cron sessions may deploy, send emails, and modify state files within constitutional bounds.
- **Reason:** Sunil confirmed. Consistent with Article 2.2 (operational decisions are autonomous) and Article 8.3 (routine operations do not require escalation).
- **Confidence:** 100%

## 2026-03-08 — Privacy policy legal review timeline: 1 month
- **Decision:** Legal review of privacy.html and terms.html to be completed by approximately 2026-04-08. Draft banner remains until review is complete.
- **Reason:** Sunil confirmed timeline.
- **Confidence:** 100%

## 2026-03-08 — $5/month Haiku cost cap on decomposition
- **Decision:** If monthly Haiku spend on decomposition exceeds $5, submissions queue rather than auto-process
- **Reason:** Open POST /goals could drain budget; $5 cap leaves $25 for other operations; queued submissions alert panel
- **Confidence:** 95%
