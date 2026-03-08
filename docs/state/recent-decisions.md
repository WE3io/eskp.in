# Recent Decisions

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
