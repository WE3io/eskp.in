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

### Bugs (fix before anything else)
1. [ ] **Fix GET /goals/:id — uses `json_array_elements` on jsonb column, needs `jsonb_array_elements`** (src/api/goals.js:52) — endpoint returns 500 for all calls

### Autonomous operation gaps (from audit 2026-03-08)
2. [ ] Add lock file to auto-session.sh to prevent concurrent sessions
3. [ ] Explicitly load .env vars before `claude --print` call in auto-session.sh
4. [ ] Add session outcome check to auto-session.sh (did state files change? did commit happen?)
5. [ ] Stage + commit 10 untracked backlog files (docs/backlog/phase-1/, phase-2/)
6. [ ] **Off-site backup — BLOCKED: needs Sunil to provide S3-compatible bucket + credentials**
   - Items 1–5 backlogged: fix-goals-endpoint-jsonb.md, harden-auto-session.md (both in docs/backlog/phase-1/)

### Week 4 product tasks
7. [ ] Weekly budget/progress report to panel (overdue)
8. [ ] Second blog post (payment launch / progress update)
9. [ ] Feedback mechanism surfaced to users (currently DB-only, no user-facing UI)
10. [ ] Grow the helper network — promote /join.html, process applications
11. [ ] First external user (non-panel) through the full flow end-to-end
12. [ ] Privacy policy formal legal sign-off — target 2026-04-08 (1 month, confirmed by Sunil)

## Blockers
- Off-site backups: need S3-compatible destination + credentials from Sunil

---
*Last updated: 2026-03-08 — autonomous operation readiness audit*
*Next session should start with: Fix GET /goals/:id bug (item 1), then fix auto-session.sh gaps (items 2–4), then send overdue budget report (item 7)*
