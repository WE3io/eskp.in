# Public Claims Register

Every user-facing promise on the website is listed here with a pointer to the code or config that implements it. When code changes affect user-facing behavior, update this register. Session-end should check: "Did I change behavior that affects a claim below?"

Last verified: 2026-03-10

---

## SLAs and Timelines

| Claim | Where stated | Implementation | Status |
|---|---|---|---|
| "We'll be in touch within 24 hours" | index.html (CTA note) | `scripts/followup.js` — 24h ack email for unmatched goals | Aligned |
| "Within 24 hours: acknowledgement email" | index.html (timeline) | `src/services/platform.js` — sendAcknowledgement() fires immediately on goal processing | Aligned |
| "Within a few days: match" | index.html (timeline) | Matching runs immediately in processGoal(); no delay. Actual time depends on helper availability | Aligned (vague by design) |
| "We'll tell you within 24 hours if we can't find anyone" | index.html (no-match guarantee) | `scripts/followup.js` — 24h no-match ack (ack_24h_sent_at); 7-day full timeout (follow_up_sent_at) | Aligned |
| "We'll confirm receipt and review within a few days" (helper apps) | join.html | `src/services/helper-application.js` — immediate ack email; manual review by panel | Aligned |

## Pricing

| Claim | Where stated | Implementation | Status |
|---|---|---|---|
| "A £10 fee applies if we make an introduction" | index.html, terms.html | `src/services/payments.js` — STRIPE_INTRO_PRICE_PENCE=1000 | Aligned |
| "No charge to submit a request" | index.html | No payment required before matching | Aligned |
| "No advertising, no data sale" | terms.html s11, index.html | No ad code exists; constitutional constraint Art.10.2.1 | Aligned |

## Data Handling

| Claim | Where stated | Implementation | Status |
|---|---|---|---|
| "Your email is used only to reply to you and make an introduction" | index.html (CTA privacy) | Email used for: ack, clarification, match notification, intro, follow-up, support. All service-related | Aligned |
| "We never sell your data" | index.html, privacy.html | No data-selling code exists | Aligned |
| "Active goals with no activity for 90 days: automatically closed" | privacy.html s4 | `scripts/data-retention.js` — STALE_ACTIVE_DAYS=90 | Aligned |
| "Introduced goals: 180 days" | privacy.html s4 | `scripts/data-retention.js` — STALE_INTRODUCED_DAYS=180 | Aligned |
| "Closed goals: decomposition purged after 365 days" | privacy.html s4 | `scripts/data-retention.js` — PURGE_CLOSED_DAYS=365 | Aligned |
| "Backups: overwritten on a 30-day rolling cycle" | privacy.html s4 | `scripts/backup-db.sh` — find -mtime +30 -delete | Aligned |
| "We will respond within 30 days" (data requests) | privacy.html s6 | Manual process; no SLA enforcement in code | Monitor |
| "AI opt-out: handle it manually" | privacy.html s3 | No automation for manual path; relies on panel processing | Monitor |

## AI Processing

| Claim | Where stated | Implementation | Status |
|---|---|---|---|
| "Goal decomposition assisted by AI (Claude Haiku)" | index.html, privacy.html | `src/services/decompose.js` — claude-haiku-4-5-20251001 | Aligned |
| "Matching is AI-assisted" | index.html | `src/services/match.js` — Haiku semantic ranking + tag-overlap fallback | Aligned |
| "Sensitive domains reviewed by oversight panel" | index.html, privacy.html | `src/services/sensitive-flag.js` + `platform.js` processGoalSensitive() — sends to panel | Aligned |
| "Your email address and name are never included in API requests" | privacy.html s3 | `src/services/match.js` lines 69-73 — sends only summary + tags | Aligned |

## Platform Description

| Claim | Where stated | Implementation | Status |
|---|---|---|---|
| "No form, no signup" | index.html | Email-only submission; no user accounts/passwords | Aligned |
| "Helpers are independent individuals, not employees" | terms.html | No employment/contractor relationship in code or legal docs | Aligned |
| "We do not vet helpers for professional qualifications" | terms.html | No credential verification in helper-application.js | Aligned |
| "ICO registration number: C1889388" | privacy.html, roadmap.html | Confirmed registered | Aligned |

## Sensitive Domains

| Claim | Where stated | Implementation | Status |
|---|---|---|---|
| "Goals in health, legal, and financial domains handled with extra care" | roadmap.html | `src/services/hard-exclusion.js` (hard) + `src/services/sensitive-flag.js` (soft) | Aligned |
| "Sensitive goals may be reviewed by oversight panel" | privacy.html s3 | `src/services/platform.js` processGoalSensitive() sends raw text to panel | Aligned |
| "Platform does not monitor conversations" | privacy.html, terms.html, join.html | No conversation monitoring code exists | Aligned |

---

## How to use this register

- **After changing code that affects user-facing behavior**: check if a claim above needs updating. If the code diverges from a claim, either update the code or update the website.
- **After changing website copy**: add or update the corresponding row here.
- **Monthly review**: recurring task in task-queue.md — verify all rows still say "Aligned".
