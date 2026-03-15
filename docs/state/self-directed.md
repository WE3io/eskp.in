# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-15 (forty-fifth) | Helper join page conversion analysis. docs/research/2026-03-15-helper-join-conversion.md. Key finding: auto-reply + CTA copy already in place; binding constraint remains Sunil posting recruitment drafts. TSK-177+178 generated but verified already implemented. | Next: research error monitoring patterns at scale, or AI matching quality metrics |
| Code quality | 2026-03-15 (forty-sixth) | pnpm audit: 0 CVEs. Reviewed webhooks.js, followup.js, platform.js (sendAcknowledgement), decompose.js, stats.js, budget-check.js. 2 bugs found and fixed: (1) close-goal webhook excluded 'introduced' but not 'resolved' — resolved goals could be overwritten to 'closed'; (2) clarification fallback query lacked `u.deleted_at IS NULL` filter. Both fixed in webhooks.js and deployed. decompose.js, stats.js, budget-check.js: all clean. public-claims-register: all Aligned. | Next: Infrastructure — check OS packages, unattended-upgrades log, disk, containers |
| Infrastructure | 2026-03-15 (forty-seventh) | Disk 31% (11G/38G), memory 1.2G/3.7G, 0 CVEs, all 3 containers healthy (268ms HTTPS). Backup: 2026-03-15 02:00 clean. 0 pending OS upgrades. Docker dangling images pruned (14.45MB freed). Platform baseline unchanged: 12 goals, 4 users, 1 helper, 10 matches. Budget report dry-run verified working. | Next: no pending OS issues; check Docker base image freshness at monthly due date |
| Mission alignment | 2026-03-15 (forty-eighth) | Reviewed Art 9 + Art 10/11 (update since session 29). Art 9: compliant — informal amendment process has worked correctly. Art 10: fully compliant (TSK-118 closed the opt-out gap). Art 11: onboarding page verified — crisis recognition, warm referral, witnessed reflection all present. No new gaps. docs/research/2026-03-15-mission-alignment-art9-art10-11-update.md | Next: review Art 1/3 or Communication rotation |
| Growth | 2026-03-15 (forty-eighth) | SEO + referral check. Google not yet indexed eskp.in (7 days old — normal). 0 referral_source values (no external users yet). Nudges deployed but unmeasured. Key recommendation: Sunil verify domain in Google Search Console + request indexing. docs/research/2026-03-15-growth-seo-and-referral-check.md | Next: check indexing again in 2 weeks; measure referral conversion on first external users |
| Communication | 2026-03-14 (forty-third) | Blog post 010 published: "Copy discipline, code review, and a phase detector" (sessions 39-42 recap: orchestrator fixes, brand voice guide, panel.js review, Ollama fallback, phase detector). Blog index + sitemap updated. | Next: consider writing about the advisory panel design for a non-technical audience |

| Content audit | 2026-03-15 (forty-seventh) | Full audit of all public pages + 10 blog posts. No hard-exclusion violations, no language violations, ICP alignment strong. Found: blog posts 001, 002, 003, index.html missing Support link in footer. Fixed all 4. docs/research/2026-03-15-content-audit.md | Next content audit: quarterly (due ~2026-06-15) or when significant new copy added |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → Content audit (quarterly) → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
