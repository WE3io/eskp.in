# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-15 (forty-fifth) | Helper join page conversion analysis. docs/research/2026-03-15-helper-join-conversion.md. Key finding: auto-reply + CTA copy already in place; binding constraint remains Sunil posting recruitment drafts. TSK-177+178 generated but verified already implemented. | Next: research error monitoring patterns at scale, or AI matching quality metrics |
| Code quality | 2026-03-15 (forty-sixth) | pnpm audit: 0 CVEs. Reviewed webhooks.js, followup.js, platform.js (sendAcknowledgement), decompose.js, stats.js, budget-check.js. 2 bugs found and fixed: (1) close-goal webhook excluded 'introduced' but not 'resolved' — resolved goals could be overwritten to 'closed'; (2) clarification fallback query lacked `u.deleted_at IS NULL` filter. Both fixed in webhooks.js and deployed. decompose.js, stats.js, budget-check.js: all clean. public-claims-register: all Aligned. | Next: Infrastructure — check OS packages, unattended-upgrades log, disk, containers |
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
