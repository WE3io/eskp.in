# Current Sprint

## Status: WEEK 3 COMPLETE — Platform live and revenue-generating

## Week 1 — Done ✅
- [x] Git repository initialised + pushed to github.com/WE3io/eskp.in
- [x] Constitution ratified — Sunil Parekh + Claude, 8th March 2026
- [x] Panel, budget ($30/mo), social channels, escalation email configured
- [x] PostgreSQL 16 running via Docker Compose (platform-db)
- [x] Node.js app scaffold (Express + pg), health endpoint live
- [x] Dockerfile + docker-compose app service
- [x] Deployment pipeline: scripts/deploy.sh
- [x] Token budget tracker: pnpm budget (local DB, accurate from 2026-03-08)
- [x] Cloudflare DNS configured and active
- [x] Email sending: hello@mail.eskp.in via Resend (verified, tested)
- [x] nginx reverse proxy (Docker), self-signed cert, Cloudflare Full SSL
- [x] Caddy disabled — docs/decisions/002-nginx-over-caddy.md

## Week 2 — Done ✅
- [x] DB schema: users, goals, helpers, matches, emails, feedback, token_usage
- [x] Goal decomposition engine (claude-haiku-4-5, structured JSON output)
- [x] Helper profiles (Sunil in DB with 13 expertise tags)
- [x] Matching logic (expertise tag overlap scoring)
- [x] Email interaction flow: submit → decompose → match → send intro + ack emails
- [x] Feedback collection: table + POST /webhooks/feedback endpoint
- [x] Inbound email: Cloudflare Email Routing → Worker → /webhooks/email (tested live)
- [x] Cloudflare Worker deployed: eskp-email-handler
- [x] Docker healthcheck fixed (node, not busybox wget)

## Week 3 — Done ✅
- [x] Infrastructure audit + security remediation
- [x] Rate limiting, input validation, PII fix, prompt injection defence
- [x] Credential hygiene: .mcp.json removed from history, secrets rotated
- [x] Cron jobs: DB backup (daily 2am) + auto-session (every 6h)
- [x] Landing page live at eskp.in
- [x] Branding: Option A, email templates, SVG social assets
- [x] Privacy policy + terms of service (live, draft banner)
- [x] Blog at /blog/ — first post published
- [x] Semantic matching (Claude Haiku relevance scoring, tag-overlap fallback)
- [x] Helper onboarding: /join.html, email routing, pnpm manage-helpers CLI
- [x] Stripe payment integration: £10/introduction, live mode, webhook verified
- [x] Deploy health check fixed (docker exec)

## Week 4 — Outstanding (priority order)

### Operational hardening — done 2026-03-09 ✅
- [x] Fix GET /goals/:id (`jsonb_array_elements`) — endpoint live and returning 200
- [x] `.claude/settings.json` — `Edit` added to permissions.allow (root cause fix)
- [x] `auto-session.sh` — `--permission-mode acceptEdits`, flock lock, `.env` export, outcome check, failure alerting, structured prompt
- [x] `scripts/session-end.sh` — post-session handoff checks, integrated into auto-session
- [x] `scripts/heartbeat.sh` — every 15min; alerts Sunil on failure
- [x] `scripts/check-cron-health.sh` — every 8h; alerts on absent session logs
- [x] `docs/state/task-queue.md` — structured task queue with P0–P3 priorities and recurring tasks
- [x] Weekly budget report sent to Sunil (TSK-002) — first ever
- [x] Backup restore test passed (TSK-004) — see `docs/operations/backup-restore-log.md`
- [x] All backlog files committed (phase-1, phase-2)
- [ ] **Off-site backup — BLOCKED: needs Sunil to provide S3-compatible bucket + credentials**

### Week 4 product tasks
7. [ ] Weekly budget/progress report to panel (overdue)
8. [ ] Second blog post (payment launch / progress update)
9. [x] Feedback mechanism surfaced to users — /feedback.html created 2026-03-09
10. [ ] Grow the helper network — promote /join.html, process applications
11. [ ] First external user (non-panel) through the full flow end-to-end
12. [ ] Privacy policy formal legal sign-off — target 2026-04-08 (1 month, confirmed by Sunil)

### Constitutional governance (completed this session)
- [x] Article 10 ratified — Platform Architecture Principles (Constitution v1.1, 2026-03-08)
- [x] Article 11 ratified — Professional Boundaries, Duty of Care, Trust Directory (Constitution v1.2, 2026-03-08)
- [x] Research committed: `docs/research/advisory-panel-structures-v2.md`, `docs/research/professional-boundaries-and-directory.md`
- [x] 24 backlog items generated and committed (9 from Art.10, 15 from Art.11 — see `docs/backlog/`)
- [x] `docs/operations/exclusion-register.md` created (Article 11.1 obligation; v1.0)
- [x] `docs/proposals/001` and `docs/proposals/002` — status: Ratified; process sections updated to reflect actual state
- [x] `CLAUDE.md` updated with Professional Boundaries and Safety operational section
- [x] `docs/state/recent-decisions.md` updated with Article 10/11 ratification entries

### Article 11 Phase 1 backlog
- [x] `hard-exclusion-content-triggers`: email webhook warm referral for hard exclusion domains — done 2026-03-09
- [x] `privacy-tension-disclosure`: user-facing OSA/dyadic privacy tension disclosure — done 2026-03-09
- [x] `safety-resources-page`: public /support page with UK signposting library — done 2026-03-09
- [x] `emergency-override-protocol`: protocol at `docs/operations/emergency-override-protocol.md` — done 2026-03-09
- [x] `safeguarding-disclosure-terms`: panel obligations in terms.html and join.html — done 2026-03-09

## Blockers
- Off-site backups: need S3-compatible destination + credentials from Sunil

### Autonomous agent operational changes — done 2026-03-09 ✅
- [x] auto-session.sh: self-directed work phase added (6 categories, rotation tracking)
- [x] docs/state/self-directed.md created
- [x] CLAUDE.md: Task Generation section added (6 sources of tasks)
- [x] CLAUDE.md: Operational Improvement section added (review every 10 sessions)
- [x] task-queue.md: 9 server stewardship recurring tasks added
- [x] task-queue.md: 5 research priority tasks added (TSK-026–030)
- [x] docs/research/ directory created with README

## Blockers
- Off-site backups: need S3-compatible destination + credentials from Sunil

### Session 2026-03-09 (second session) — done ✅
- [x] TSK-020: Archived completed Week 1–3 build sequence from CLAUDE.md (saves ~28 lines per session)
- [x] TSK-026: Research — privacy-preserving matching (docs/research/2026-03-09-privacy-preserving-matching.md); tasks TSK-035–038 generated
- [x] TSK-027: Research — goal decomposition approaches (docs/research/2026-03-09-goal-decomposition.md); tasks TSK-031–034 generated
- [x] TSK-031: Inline schema validation added to decompose.js (validateDecomposition function)
- [x] TSK-032: 1-retry logic added to decompose.js on JSON parse/validation failure
- [x] TSK-035: Data minimisation in match.js — LLM prompt now sends summary + tags only, not context/outcome (UK GDPR Art.5(1)(c))

### Session 2026-03-09 (third auto-session) — done ✅
- [x] Code quality rotation: pnpm audit (no CVEs); reviewed 5 core service files; 2 P3 issues logged
- [x] TSK-037: Privacy policy updated — section 3 now covers both decomposition + matching, legal basis, international transfer, Stripe added to data sharing
- [x] TSK-028: UK GDPR compliance checklist research complete — docs/research/2026-03-09-uk-gdpr-compliance-checklist.md; tasks TSK-039–045 generated
- [x] TSK-040: Article 30 ROPA created — docs/operations/ropa.md (8 processing activities)
- [x] TSK-043: Breach response procedure created — docs/operations/breach-response.md (Art.33/34)

**CRITICAL GAP FOUND**: TSK-039 — ICO registration not yet done. Must register with ICO and pay £52 data protection fee before opening to external users. This is a legal requirement; processing without registration is a criminal offence.

### Session 2026-03-10 (fourth auto-session) — done ✅
- [x] TSK-039: ICO registration escalation email sent to Sunil (awaiting action — legal requirement before external users)
- [x] Infrastructure rotation: disk 12%, memory 27%, no CVEs, no OS updates pending — all healthy. TSK-046/047 logged (swap, log rotation).
- [x] TSK-041: LIA written — docs/operations/lia.md (Art.6(1)(f) established for AI decomposition + matching)
- [x] TSK-042: DPIA written — docs/operations/dpia.md (5 risks identified; TSK-048/049 as required actions before external users)
- [x] TSK-048: decompose.js prompt updated to avoid reproducing special category data verbatim in structured output
- [x] TSK-029: Email deliverability research — docs/research/2026-03-10-email-deliverability.md; TSK-050–053 generated

---
*Last updated: 2026-03-10 — fourth auto-session complete*
*Next session should start with: TSK-053 (verify SPF/DKIM/DMARC in Cloudflare DNS — foundational deliverability), then TSK-049 (sensitive goal human-review flag), then TSK-033 (tool_use for decompose.js structured output), then TSK-009 (second blog post draft)*
