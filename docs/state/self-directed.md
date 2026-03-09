# Self-Directed Work Tracker

Sessions rotate through these categories after completing queued tasks.
Record what was done so successive sessions don't duplicate effort.

| Category | Last session | What was done | Next suggested |
|----------|-------------|---------------|----------------|
| Research | 2026-03-09 | Goal decomposition (TSK-027) + privacy-preserving matching (TSK-026). Research files in docs/research/. Generated tasks TSK-031–038. Implemented TSK-031/032 (validation+retry in decompose.js) and TSK-035 (data minimisation in match.js). | — |
| Code quality | never | — | Run npm audit, review error handling in src/api/webhooks.js and src/services/ |
| Infrastructure | never | — | Check disk usage trends, memory, Docker image sizes, dependency CVEs |
| Mission alignment | never | — | Review recent-decisions.md against Constitution Articles 1 and 3 |
| Growth | never | — | Analyse what would attract the first external user; review the full submit-goal flow from a stranger's perspective |
| Communication | never | — | Draft next build-in-public post; review landing page copy for clarity |

## Rotation order

Research → Code quality → Infrastructure → Mission alignment → Growth → Communication → (repeat)

## Research files

All research output lives in `docs/research/`. Format: `YYYY-MM-DD-topic.md`.
Structure each file: **Question → Sources → Findings → Relevance → Tasks generated**.
