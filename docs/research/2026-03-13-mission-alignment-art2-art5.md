# Research: Mission Alignment — Articles 2 (Governance) and 5 (Economic Principles)

**Date:** 2026-03-13
**Question:** Does the codebase comply with constitutional Articles 2 and 5?

---

## Findings

### Art 2.3 — Governance Transparency

| Requirement | Status | Notes |
|---|---|---|
| Explain reasoning for significant decisions | Aligned | docs/state/recent-decisions.md has 33 documented decisions |
| Decisions available to panel and public | Aligned | Blog (8 posts), decisions log, build-in-public |
| Flag uncertainty to panel | Aligned | Escalation triggers in CLAUDE.md; panel emails sent |

**Minor gap:** Decision recording is manual (relies on session discipline). Could miss decisions made during exploratory work. Mitigation: session-end.sh prompts for state updates.

### Art 5.1 — Budget Management

| Requirement | Status | Notes |
|---|---|---|
| Track token spend | Aligned | token_usage table, scripts/budget-check.js, pnpm budget |
| Allocate tokens deliberately | Aligned | Haiku for routine, Sonnet for dev; orchestration layer routes by role |
| Report spend weekly to panel | **Non-compliant** | No automated weekly email. Manual only (sent once 2026-03-09). Recurring task exists in task-queue.md but has no implementing script. |
| Never exceed budget without approval | Aligned | BudgetExceededError in orchestration; 70% alert threshold |

### Art 5.2 — Phase Transitions

| Requirement | Status | Notes |
|---|---|---|
| Detect "revenue covers costs for 2 consecutive months" | Manual | budget-tracker.md has static placeholders. stats.js queries revenue but result not fed into any transition detector. |

### Art 5.4 — Economic Transparency

| Requirement | Status | Notes |
|---|---|---|
| All API spending captured | Aligned | Every infer() call logs to token_usage via ledger.js |
| Infrastructure costs documented | Partial | Not auto-tracked; known fixed costs ($6.67/mo Hetzner) |
| Build-in-public financial transparency | Aligned | Blog post 007 discusses token costs openly |

---

## Gaps Requiring Action

1. **Weekly budget report email (Art 5.1)** — Constitutional obligation. Create scripts/budget-report.js that emails panel with weekly spend summary. Schedule Monday 09:00 UTC cron. **Priority: P1** — this is the only outright non-compliance found.

2. **Phase transition detector (Art 5.2)** — Extend budget-report.js or stats.js to compare monthly revenue vs costs. Low priority at $0 revenue. **Priority: P3.**

---

## Tasks Generated

| ID | Task | Priority |
|---|---|---|
| TSK-126 | Automated weekly budget report email to panel (Art 5.1 compliance) | P1 |
| TSK-127 | Phase transition detection: compare revenue vs costs, alert when Phase 2 eligible | P3 |
