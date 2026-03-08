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
