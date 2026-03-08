# Recent Decisions

## 2026-03-08 — Use pnpm as package manager
- **Decision:** pnpm over npm
- **Reason:** Faster installs, disk-efficient via content-addressable store, preferred by Sunil
- **Confidence:** 100%

## 2026-03-08 — Resend for transactional email (pending)
- **Decision:** Evaluate Resend as first choice for email
- **Reason:** Free tier (3,000/month, 100/day) covers Phase 1 needs; developer-friendly API; no credit card required. Postmark more expensive; AWS SES adds unnecessary complexity on a $30 budget.
- **Confidence:** 80% — pending domain setup to confirm

## 2026-03-08 — X API: OAuth 1.0a for posting
- **Decision:** Use OAuth 1.0a (Access Token + Secret) for posting
- **Reason:** No callback URL or refresh token flow needed. Simpler for server-side autonomous posting.
- **Confidence:** 95%

## 2026-03-08 — Constitution ratified
- **Decision:** Constitution v1.0 ratified by Sunil Parekh and Claude Instance (Sonnet 4.6), 8th March 2026
- **Confidence:** 100%

## 2026-03-08 — Safety lens amended for mission autonomy
- **Decision:** Amended safety-lens to defer to constitution Article 8 escalation triggers
- **Reason:** Original language contradicted autonomous operational authority in CLAUDE.md and Constitution Article 2.2
- **Confidence:** 100%

## 2026-03-08 — Skip social API automation in Phase 1
- **Decision:** Draft posts for manual publishing; no OAuth posting automation yet
- **Reason:** $30 budget should fund platform, not posting infrastructure. Revisit Phase 2.
- **Confidence:** 90%

## 2026-03-08 — PostgreSQL via Docker on Hetzner
- **Decision:** Self-hosted PostgreSQL 16 in Docker, bound to 127.0.0.1:5432
- **Reason:** Consistent with open-source/self-hosted constitutional preference. Avoids managed DB costs.
- **Confidence:** 95%

## 2026-03-08 — GitHub remote: WE3io/eskp.in
- **Decision:** Version control hosted on GitHub at git@github.com:WE3io/eskp.in.git
- **Reason:** Specified by Sunil. GitHub provides CI/CD hooks, issue tracking, and public visibility for build-in-public.
- **Confidence:** 100%
