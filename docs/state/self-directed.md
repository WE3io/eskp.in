# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-11 (thirty-second) | Prompt caching + batch API for cost reduction. docs/research/2026-03-11-prompt-caching-batch-api.md. Haiku 4.5 cache threshold is 4,096 tokens — our prompts (~800 tokens) are too small. Batch API requires async (24h) — doesn't fit real-time email flow. $0.014/month spend makes optimisation premature. No tasks generated; revisit at $5+/month or when prompts grow past threshold. | Next: research error monitoring / observability for Node.js (structured logging, crash reporting) |
| Code quality | 2026-03-11 (twenty-seventh) | pnpm audit: 0 CVEs. Reviewed 12 files (webhooks.js, account.js API+service, payments.js, email.js, email-reply-token.js, email-suppression.js, platform.js, helper-application.js, decompose.js, match.js, goals.js, index.js). Found 2 bugs: TSK-116 (XSS in account.js — 3 unescaped user.name in HTML emails) and TSK-117 (unhandled JSON.parse in email.js — process crash risk). Both fixed. | Next: review scripts/ (helper-digest.js, followup.js, data-retention.js, outcome-roundup.js) |
| Infrastructure | 2026-03-11 (twenty-eighth) | Disk 16% (5.5G/38G), memory 1.2G/3.7G, 0 swap, 0 CVEs, all 3 containers healthy (42ms HTTPS). Backup confirmed running daily (latest 15KB, 2026-03-11 02:00). Docker dangling images pruned. 1 non-critical OS update pending (linux-base). Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. No issues found. | Next: check Docker image updates (postgres 16-alpine from Feb 26, nginx alpine from Feb 5) |
| Mission alignment | 2026-03-11 (twenty-ninth) | Reviewed Arts 10 + 11 against codebase. Found: AI opt-out had no processing path (Art 10.2.3(c) gap) — implemented TSK-118 (processGoalManual, detection regex, ai_opted_out column). Also found: no outcome measurement (Art 10.4.1) — TSK-119 generated. Added annual algorithm audit to recurring tasks. docs/research/2026-03-11-mission-alignment-art10-11.md | Next: review Art 2 (governance transparency) + Art 5 (economic principles) compliance |
| Growth | 2026-03-11 (thirtieth) | Conversion funnel review. Found SEO basics missing (no robots.txt, no sitemap.xml). Created both. 16 pages now in sitemap. Funnel itself is sound — binding constraint is helper supply, not demand friction. docs/research/2026-03-11-growth-conversion-funnel.md | Next: review whether blog content is attracting any organic traffic; consider structured data (JSON-LD) |
| Communication | 2026-03-11 (thirty-first) | Landing page: broadened Sunil's bio to reduce self-selection bias, added clarification loop to step 2. Blog post 007: "How an AI runs a platform" (session loop, self-directed work, guardrails, costs, limits). Blog index + sitemap updated. docs/updates/ still current (002/003 ready for Sunil). | Next: review whether blog is generating organic traffic; consider structured data (JSON-LD) for rich snippets |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
