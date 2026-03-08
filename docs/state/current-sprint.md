# Current Sprint

## Status: WEEK 2 COMPLETE — Week 3 in progress (security + dogfooding)

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

## Week 3 — In Progress
- [x] Infrastructure audit completed
- [x] Security remediation: rate limiting, input validation, PII fix, prompt injection defence
- [x] .mcp.json removed from git tracking, history rewritten, credentials rotated
- [x] CLAUDE.md: Credential Rule + Risk Assessment Protocol added
- [x] Cron jobs: DB backup (daily 2am) + auto-session (every 6h)
- [x] docs/decisions/003-post-goals-auth.md
- [x] Dogfooded goal submitted: privacy policy / T&C (goal bae3d067, matched to Sunil)
- [x] Build-in-public post #1 — approved draft, ready to publish after sign-off
- [x] Landing page live at eskp.in (public/index.html)
- [x] Platform branding: Option A (warm correspondence), email templates, SVG social assets
- [x] docs/decisions/004-branding.md
- [x] Privacy policy (public/privacy.html) — GDPR-compliant, draft banner, live
- [x] Terms of service (public/terms.html) — plain English, England & Wales, live
- [x] Blog at /blog/ — first post (week 2 update) published
- [x] README updated to reflect live status
- [x] Semantic matching — replaced tag-overlap with Claude Haiku relevance scoring (tag-overlap fallback retained)
- [x] Deploy health check fixed (docker exec, not curl to unexposed port)
- [x] External user onboarding — helper application flow live (/join.html)
- [x] Helper network: application email routing, admin CLI (pnpm manage-helpers)
- [ ] Payment integration — needs Stripe keys from Sunil

## Blockers
- Payment integration: needs Stripe account + keys from Sunil

## Next: payment integration once Stripe keys received; grow helper network by promoting /join.html

---
*Last updated: 2026-03-08T13:15:00Z*
