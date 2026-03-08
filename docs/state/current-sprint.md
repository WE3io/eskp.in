# Current Sprint

## Status: WEEK 2 COMPLETE → Week 3 (Dogfooding + Public)

## Week 1 — Done ✅
- [x] Git repository initialised + pushed to github.com/WE3io/eskp.in
- [x] Constitution ratified — Sunil Parekh + Claude, 8th March 2026
- [x] Panel, budget ($30/mo), social channels, escalation email configured
- [x] X API credentials verified (@awebot1529222)
- [x] PostgreSQL 16 running via Docker Compose (platform-db)
- [x] Node.js app scaffold (Express + pg), health endpoint live
- [x] Dockerfile + docker-compose app service
- [x] Deployment pipeline: scripts/deploy.sh (build → health check → rollback)
- [x] Token budget tracker: pnpm budget (local DB tracking, accurate from 2026-03-08)
- [x] Cloudflare DNS: eskp.in → 157.180.112.245, proxied, active
- [x] Cloudflare MCP server configured
- [x] Email sending: hello@mail.eskp.in via Resend (verified, tested)
- [x] src/services/email.js — reusable send() module
- [x] nginx reverse proxy (Docker), self-signed cert, Cloudflare Full SSL mode
- [x] Caddy disabled — documented in docs/decisions/002-nginx-over-caddy.md

## Week 2 — Done ✅
- [x] DB schema: users, goals, helpers, matches, emails, feedback, token_usage
- [x] Goal decomposition engine (claude-haiku-4-5, structured JSON output)
- [x] Helper profiles (Sunil in DB with 13 expertise tags)
- [x] Matching logic (expertise tag overlap scoring)
- [x] Email interaction flow: submit → decompose → match → send intro + ack emails
- [x] Feedback collection: table + POST /webhooks/feedback endpoint
- [x] Inbound email: Cloudflare Email Routing → Worker → /webhooks/email (tested live)
- [x] Cloudflare Worker deployed: eskp-email-handler (sunil-parekh.workers.dev)
- [x] Docker healthcheck fixed (node, not busybox wget)
- [x] Budget tracker: local token_usage logging per Haiku call

## Week 3 — In Progress
- [x] Infrastructure audit completed (2026-03-08)
- [ ] First dogfooded goal submitted (privacy policy / T&C — in progress this session)
- [ ] Build-in-public post #1 — drafted, pending Sunil review
- [ ] Landing page
- [ ] Platform branding (visual identity, email templates, social assets)
- [ ] Privacy policy + terms of service (dogfooded via platform)
- [ ] External user onboarding

## What's blocked
- Nothing currently blocked.

## Known gaps
- Cron backup job: not configured (DB backup should be added)
- Social media posting: manual for now (deferred to Phase 2)

## Next session should start with:
Submit dogfooded privacy policy goal via POST /goals and confirm Sunil receives intro email. Then proceed with landing page build.

---
*Last updated: 2026-03-08T11:45:00Z*
