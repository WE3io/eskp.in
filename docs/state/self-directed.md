# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-11 (twenty-sixth) | Embedding-based matching without LLM call. docs/research/2026-03-11-embedding-based-matching.md. Investigated Voyage AI (Anthropic partner, $0.02-0.06/MTok), local @huggingface/transformers (free, ~300MB RAM), hybrid approach. Recommendation: don't implement yet (1 helper, negligible cost); trigger at 3+ helpers. TSK-114/115 generated. | Next: explore Anthropic prompt caching / batch API for cost reduction |
| Code quality | 2026-03-11 (twenty-seventh) | pnpm audit: 0 CVEs. Reviewed 12 files (webhooks.js, account.js API+service, payments.js, email.js, email-reply-token.js, email-suppression.js, platform.js, helper-application.js, decompose.js, match.js, goals.js, index.js). Found 2 bugs: TSK-116 (XSS in account.js — 3 unescaped user.name in HTML emails) and TSK-117 (unhandled JSON.parse in email.js — process crash risk). Both fixed. | Next: review scripts/ (helper-digest.js, followup.js, data-retention.js, outcome-roundup.js) |
| Infrastructure | 2026-03-11 (twenty-eighth) | Disk 16% (5.5G/38G), memory 1.2G/3.7G, 0 swap, 0 CVEs, all 3 containers healthy (42ms HTTPS). Backup confirmed running daily (latest 15KB, 2026-03-11 02:00). Docker dangling images pruned. 1 non-critical OS update pending (linux-base). Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. No issues found. | Next: check Docker image updates (postgres 16-alpine from Feb 26, nginx alpine from Feb 5) |
| Mission alignment | 2026-03-11 (twenty-ninth) | Reviewed Arts 10 + 11 against codebase. Found: AI opt-out had no processing path (Art 10.2.3(c) gap) — implemented TSK-118 (processGoalManual, detection regex, ai_opted_out column). Also found: no outcome measurement (Art 10.4.1) — TSK-119 generated. Added annual algorithm audit to recurring tasks. docs/research/2026-03-11-mission-alignment-art10-11.md | Next: review Art 2 (governance transparency) + Art 5 (economic principles) compliance |
| Growth | 2026-03-11 (thirtieth) | Conversion funnel review. Found SEO basics missing (no robots.txt, no sitemap.xml). Created both. 16 pages now in sitemap. Funnel itself is sound — binding constraint is helper supply, not demand friction. docs/research/2026-03-11-growth-conversion-funnel.md | Next: review whether blog content is attracting any organic traffic; consider structured data (JSON-LD) |
| Communication | 2026-03-11 (twenty-fifth) | Blog post 006 published (XSS in AI output, bias prevention in matching, status enums, social sharing fixes, empty queue reflection). Blog index updated. README.md updated (was stale — payments/matching/GDPR status all wrong). docs/updates/ reviewed (002/003 still current, ready for Sunil to post). | Next: review landing page copy freshness, consider whether blog needs a thematic summary post |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
