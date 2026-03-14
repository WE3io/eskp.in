# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-13 (thirty-eighth) | Cold-start helper supply strategies. docs/research/2026-03-13-cold-start-helper-supply.md. Binding constraint is helper supply (1 helper). Most impactful action: Sunil posting existing recruitment drafts. TSK-165 generated (demand→supply flywheel CTA). | Next: research API error patterns or match quality metrics at scale |
| Code quality | 2026-03-14 (forty-first) | Comprehensive review of src/services/panel.js (TSK-167). 1 bug fixed: dead RETURNING goal_id clause in declinePanelInvitation. 1 pre-existing auth gap noted (userId from body on POST /panel/invite — Phase 2 bootstrap). Service otherwise clean: thread isolation enforced, safeHtml throughout, all queries parameterised. Also reviewed src/api/panel.js (auth middleware, cookie handling, simpleHtmlPage escaping already fixed last session). | Next: review scripts/session-orchestrator.sh and orch-infer.js for edge cases |
| Infrastructure | 2026-03-14 (fortieth) | Disk 31% (11G/38G), memory 1.1G/3.7G, 0 swap, 0 CVEs, all 3 containers healthy. Backup confirmed (daily + B2 offsite). Docker dangling images pruned (36.68MB freed). Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. | Next: check OS package updates manually if unattended-upgrades log shows pending |
| Mission alignment | 2026-03-14 (forty-second) | Reviewed Arts 7 + 8 against codebase. Art 7: substantially aligned; Agent SDK deferral known/intentional (ADR-006). Art 8: 2 gaps found — budget alert and phase transition alert only logged to console, not emailed. TSK-169 + TSK-170 generated and implemented same session (email alerts + flag deduplication). docs/research/2026-03-14-mission-alignment-art7-art8.md | Next: review Art 9 (Amendments) + Art 10+11 alignment updates |
| Growth | 2026-03-14 (forty-third) | Referral mechanics research. TSK-172: referral nudge added to match acknowledgement email ("Know someone else who could use this?"). TSK-173 + TSK-174 generated (attribution tracking + clarification response rate). docs/research/2026-03-14-growth-referral-and-conversion.md. Binding constraint remains helper supply. | Next: check if referral nudge is driving any inbound; assess whether Google has indexed blog posts via site: query |
| Communication | 2026-03-14 (forty-third) | Blog post 010 published: "Copy discipline, code review, and a phase detector" (sessions 39-42 recap: orchestrator fixes, brand voice guide, panel.js review, Ollama fallback, phase detector). Blog index + sitemap updated. | Next: consider writing about the advisory panel design for a non-technical audience |

| Content audit | Never | — | Review all public copy against ICP (docs/operations/icp.md), brand-voice.md, exclusion register, and public-claims-register.md. Fix violations found. Rotate quarterly or when significant new copy has been added. |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → Content audit (quarterly) → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
