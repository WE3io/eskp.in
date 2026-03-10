# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-10 (eighteenth) | Helper onboarding quality & tag accuracy. docs/research/2026-03-10-helper-onboarding-quality.md. Found: tag normalization gap in fallback matching (fixed), decompose tags not aligned to canonical list (fixed), missing migrations (fixed), Sunil's tags migrated to canonical form. TSK-100–103 generated; 100/101/102 done. | Next: matching algorithm quality / multi-helper ranking |
| Code quality | 2026-03-10 (sixteenth) | pnpm audit: no CVEs. Reviewed platform.js, match.js, webhooks.js, followup.js, decompose.js, email.js, email-template.js. Two real bugs found and fixed: (1) clarification loop not limited — added clarification_attempts column, max 2 rounds enforced (TSK-098); (2) HTML-unsafe user names in email bodies — escHtml() now applied to all user-supplied strings in HTML email bodies (TSK-099). | — |
| Infrastructure | 2026-03-10 (seventeenth) | Disk 15%, memory 1.4GB/3.7GB, 0 swap used, 0 CVEs, all 3 containers healthy (HTTPS 36ms). Docker build cache pruned: 97.62MB freed. Platform baseline: 12 goals, 4 users, 1 helper, 10 matches. Backup cron confirmed working (session 14 chmod +x fix). No new tasks needed — all green. | — |
| Mission alignment | 2026-03-10 | Re-read Arts 1 + 3. Found: AI disclosure gap in emails (fixed, TSK-055); raw_text retention no policy (TSK-054); TSK-021/022 promoted to P2 (constitutional rights); TSK-056/057 generated. Existing hard exclusion + sensitive-domain work confirmed aligned. | — |
| Growth | 2026-03-10 | Reviewed all public pages from a stranger's perspective. Key finding: helper network bottleneck (1 helper = no external matches). Nav inconsistency fixed (4 pages missing "Become a helper"). Tasks TSK-058–063 generated. See docs/research/2026-03-10-growth-first-user.md. | — |
| Communication | 2026-03-10 | Blog post 004 published (user rights, landing page, helper network bottleneck). Blog index updated. X thread draft for helper recruitment created at docs/updates/002-helper-recruitment-thread.md. | — |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
