# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-13 (thirty-eighth) | Cold-start helper supply strategies. docs/research/2026-03-13-cold-start-helper-supply.md. Binding constraint is helper supply (1 helper). Most impactful action: Sunil posting existing recruitment drafts. TSK-165 generated (demand→supply flywheel CTA). | Next: research API error patterns or match quality metrics at scale |
| Code quality | 2026-03-14 (thirty-ninth) | pnpm audit: 0 CVEs. Reviewed apply-code-output.js, orch-infer.js, budget-report.js, src/orchestration/ (dispatch, budget, config, ledger), src/api/panel.js. One real bug fixed: simpleHtmlPage() in panel.js was interpolating title/message into HTML without escaping — err.message path could be user-influenced. Same XSS-in-HTML class as prior sessions. | Next: review src/services/panel.js (large new service, not yet reviewed) |
| Infrastructure | 2026-03-14 (fortieth) | Disk 31% (11G/38G), memory 1.1G/3.7G, 0 swap, 0 CVEs, all 3 containers healthy. Backup confirmed (daily + B2 offsite). Docker dangling images pruned (36.68MB freed). Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. | Next: check OS package updates manually if unattended-upgrades log shows pending |
| Mission alignment | 2026-03-14 (fortieth) | Reviewed Arts 4 + 6 against codebase. Art 4 (Build in Public): substantially aligned; X/LinkedIn channels never posted (blocked on Sunil; drafts ready). Art 6 (Dogfooding): TSK-136 covers Art 6.2 gap; Art 6.1 interpretation gap noted (Claude as operator not participant). No new P1/P2 tasks. TSK-167/168 generated. docs/research/2026-03-14-mission-alignment-art4-art6.md | Next: review Art 7 (Technical Principles) + Art 8 (Governance) — unreviewed since project start |
| Growth | 2026-03-13 (thirty-sixth) | JSON-LD structured data added to landing page (Organization + WebSite) and all 8 blog posts (BlogPosting). Enables article rich results in search. docs/research/2026-03-13-growth-seo-structured-data.md. Binding constraint remains helper supply (1 helper). | Next: assess whether blog posts are indexed by Google; check Search Console if Sunil has set it up |
| Communication | 2026-03-13 (thirty-seventh) | Blog post 009 published: "Orchestration, panels, logging, and governance rules" (sessions 33-36 recap: multi-LLM orchestration, panel design, Pino logging, governance rules). Blog index + sitemap updated. Copy review: all blog CTAs and landing page already updated in session 36. | Next: check blog traffic in Search Console if Sunil has set it up; consider writing about the peer advisory panel design in more depth |

| Content audit | Never | — | Review all public copy against ICP (docs/operations/icp.md), brand-voice.md, exclusion register, and public-claims-register.md. Fix violations found. Rotate quarterly or when significant new copy has been added. |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → Content audit (quarterly) → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
