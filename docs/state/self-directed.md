# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-11 (twenty-sixth) | Embedding-based matching without LLM call. docs/research/2026-03-11-embedding-based-matching.md. Investigated Voyage AI (Anthropic partner, $0.02-0.06/MTok), local @huggingface/transformers (free, ~300MB RAM), hybrid approach. Recommendation: don't implement yet (1 helper, negligible cost); trigger at 3+ helpers. TSK-114/115 generated. | Next: explore Anthropic prompt caching / batch API for cost reduction |
| Code quality | 2026-03-11 (twenty-seventh) | pnpm audit: 0 CVEs. Reviewed 12 files (webhooks.js, account.js API+service, payments.js, email.js, email-reply-token.js, email-suppression.js, platform.js, helper-application.js, decompose.js, match.js, goals.js, index.js). Found 2 bugs: TSK-116 (XSS in account.js — 3 unescaped user.name in HTML emails) and TSK-117 (unhandled JSON.parse in email.js — process crash risk). Both fixed. | Next: review scripts/ (helper-digest.js, followup.js, data-retention.js, outcome-roundup.js) |
| Infrastructure | 2026-03-10 (twenty-second) | Disk 15%, memory 1.1G/3.7G, 0 swap, 0 CVEs, all 3 containers healthy (29ms). SSL expires 2036. Backup manually tested OK; stale log entries cleared. Docker 376MB cache (44MB reclaimable). Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. Code review of 5 handler/service files — clean. | Next: check Docker image updates (postgres, nginx alpine) |
| Mission alignment | 2026-03-10 (twenty-third) | Re-read Arts 1 + 3 against codebase. Fixed: helper names in matching LLM prompt (bias risk, TSK-113). Confirmed: identity/intent separation good; structural privacy strong. Noted: at-rest encryption gap (mitigated by data design). docs/research/2026-03-10-mission-alignment-session23.md | Next: review Art 10 (anti-enshittification) + Art 11 (exclusion framework) compliance |
| Growth | 2026-03-10 (twenty-fourth) | Social sharing was broken: all 13 pages lacked OG/Twitter meta tags (bare URLs on social). Added OG+Twitter cards to all pages, SVG favicon, fixed footer separators on 6 pages, fixed broken roadmap link. docs/research/2026-03-10-growth-social-sharing.md. Prerequisite for social growth strategy. | Next: review conversion funnel (landing page → email → acknowledgement → match) |
| Communication | 2026-03-11 (twenty-fifth) | Blog post 006 published (XSS in AI output, bias prevention in matching, status enums, social sharing fixes, empty queue reflection). Blog index updated. README.md updated (was stale — payments/matching/GDPR status all wrong). docs/updates/ reviewed (002/003 still current, ready for Sunil to post). | Next: review landing page copy freshness, consider whether blog needs a thematic summary post |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
