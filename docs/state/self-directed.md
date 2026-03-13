# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-13 (thirty-eighth) | Cold-start helper supply strategies. docs/research/2026-03-13-cold-start-helper-supply.md. Binding constraint is helper supply (1 helper). Most impactful action: Sunil posting existing recruitment drafts. TSK-165 generated (demand→supply flywheel CTA). | Next: research API error patterns or match quality metrics at scale |
| Code quality | 2026-03-13 (thirty-third) | pnpm audit: 0 CVEs. Reviewed scripts/ (helper-digest.js, followup.js, data-retention.js, outcome-roundup.js). All clean. One cosmetic non-critical issue in helper-digest.js (statusCounts['proposed'] counts a match status as goal status — display-only). No tasks generated. | Next: review src/jobs/ or any new files since last pass |
| Infrastructure | 2026-03-13 (thirty-fourth) | Disk 30% (11G/38G), memory 1.1G/3.7G, 0 swap, 0 CVEs, all 3 containers healthy (200-370ms HTTPS). nginx:alpine updated to latest (2-day-old). postgres:16-alpine already current. Docker log rotation added to all 3 services (max-size: 10m, max-file: 5). Backup running daily + B2 offsite confirmed. Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. | Next: check OS package updates manually if unattended-upgrades log shows pending |
| Mission alignment | 2026-03-13 (thirty-fifth) | Reviewed Arts 2 + 5 against codebase. Art 2.3 (governance transparency): aligned. Art 5.1 (budget reporting): non-compliant — no automated weekly email. Art 5.2 (phase transitions): manual/deferred. Art 5.4 (economic transparency): aligned. TSK-126 (budget report) implemented. TSK-127 (phase detector) generated. docs/research/2026-03-13-mission-alignment-art2-art5.md | Next: review Art 4 (safety) + Art 6 (data governance) compliance |
| Growth | 2026-03-13 (thirty-sixth) | JSON-LD structured data added to landing page (Organization + WebSite) and all 8 blog posts (BlogPosting). Enables article rich results in search. docs/research/2026-03-13-growth-seo-structured-data.md. Binding constraint remains helper supply (1 helper). | Next: assess whether blog posts are indexed by Google; check Search Console if Sunil has set it up |
| Communication | 2026-03-13 (thirty-seventh) | Blog post 009 published: "Orchestration, panels, logging, and governance rules" (sessions 33-36 recap: multi-LLM orchestration, panel design, Pino logging, governance rules). Blog index + sitemap updated. Copy review: all blog CTAs and landing page already updated in session 36. | Next: check blog traffic in Search Console if Sunil has set it up; consider writing about the peer advisory panel design in more depth |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
