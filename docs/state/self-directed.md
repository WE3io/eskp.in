# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-10 (twentieth) | Matching algorithm quality & multi-helper ranking. docs/research/2026-03-10-matching-algorithm-quality.md. Manual matching correct at bootstrap; weighted multi-signal scoring for 3+ helpers; feedback loop highest ROI. TSK-107 done (tool_use for match scoring), TSK-103 done, TSK-108/109 generated. | Next: embedding-based matching / semantic similarity without LLM call |
| Code quality | 2026-03-10 (nineteenth) | pnpm audit: 0 CVEs. Reviewed 11 files (match.js, decompose.js, migrate.js, platform.js, webhooks.js, email-reply-token.js, helper-application.js, helper-digest.js, followup.js, outcome-roundup.js, data-retention.js). Three XSS bugs fixed (TSK-104), SQL string interpolation fixed (TSK-105), invalid status values fixed (TSK-106). | — |
| Infrastructure | 2026-03-10 (seventeenth) | Disk 15%, memory 1.4GB/3.7GB, 0 swap used, 0 CVEs, all 3 containers healthy (HTTPS 36ms). Docker build cache pruned: 97.62MB freed. Platform baseline: 12 goals, 4 users, 1 helper, 10 matches. Backup cron confirmed working (session 14 chmod +x fix). No new tasks needed — all green. | — |
| Mission alignment | 2026-03-10 | Re-read Arts 1 + 3. Found: AI disclosure gap in emails (fixed, TSK-055); raw_text retention no policy (TSK-054); TSK-021/022 promoted to P2 (constitutional rights); TSK-056/057 generated. Existing hard exclusion + sensitive-domain work confirmed aligned. | — |
| Growth | 2026-03-10 | Reviewed all public pages from a stranger's perspective. Key finding: helper network bottleneck (1 helper = no external matches). Nav inconsistency fixed (4 pages missing "Become a helper"). Tasks TSK-058–063 generated. See docs/research/2026-03-10-growth-first-user.md. | — |
| Communication | 2026-03-10 | Blog post 004 published (user rights, landing page, helper network bottleneck). Blog index updated. X thread draft for helper recruitment created at docs/updates/002-helper-recruitment-thread.md. | — |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
