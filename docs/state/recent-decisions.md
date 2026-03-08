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
- **Decision:** Audit findings logged; no immediate architectural changes; bugs and gaps prioritised in current-sprint.md
- **Key findings:** GET /goals/:id broken (json_array_elements vs jsonb_array_elements); auto-session lacks lock file + .env export + accomplishment verification; backups on same server, untested, no off-site copy; cron session scope undefined
- **Blocked on:** Sunil providing off-site backup destination, auto-session scope decision, privacy policy legal review
- **Confidence:** 100% (observed, not inferred)

## 2026-03-08 — $5/month Haiku cost cap on decomposition
- **Decision:** If monthly Haiku spend on decomposition exceeds $5, submissions queue rather than auto-process
- **Reason:** Open POST /goals could drain budget; $5 cap leaves $25 for other operations; queued submissions alert panel
- **Confidence:** 95%
