# Task Queue

Every session (automated and manual) reads this file before deciding what to work on.
Update it before ending any session: mark completed tasks, add new ones, refresh recurring task dates.

## Priority Levels

| Level | Meaning | Response |
|---|---|---|
| P0 | CRITICAL — broken production, security, data loss | Fix immediately, before any other work |
| P1 | HIGH — user-facing bugs, overdue commitments, blockers | Do this session |
| P2 | MEDIUM — feature work, improvements, obligations with future deadlines | Do this week |
| P3 | LOW — nice-to-haves, refactoring, housekeeping | Do when P0–P2 queue is clear |

---

## Recurring Tasks

| Task | Frequency | Last completed | Next due | SLA |
|---|---|---|---|---|
| Budget report to panel | Weekly (Monday) | 2026-03-09 | 2026-03-16 | Send by EOD Monday |
| Build-in-public post | Weekly (Friday) | never | **OVERDUE** | Blocked — repo not yet public |
| Backup verification (restore test) | Weekly (Sunday) | 2026-03-09 | 2026-03-15 | See backup-restore-log.md |
| State file accuracy check | Every session | 2026-03-09 | Next session | Before session ends |
| Security dependency audit | Monthly | never | 2026-04-08 | — |

---

## Active Tasks

### P0 — Critical

| ID | Task | Status | Backlog item |
|---|---|---|---|
| TSK-001 | Fix `GET /goals/:id` — `json_array_elements` on jsonb column returns 500 | **done** 2026-03-09 | `fix-goals-endpoint-jsonb.md` |

---

### P1 — High

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-002 | Send first weekly budget report to Sunil | **done** 2026-03-09 | Sent via Resend |
| TSK-003 | First build-in-public post | blocked | Blocked — repo not yet public |
| TSK-004 | Backup restore test (first ever) | **done** 2026-03-09 | PASS — see `docs/operations/backup-restore-log.md` |
| TSK-005 | Commit all untracked backlog files | **done** 2026-03-09 | Committed in this session |
| TSK-006 | Implement `harden-auto-session.md` | **done** 2026-03-09 | settings.json + auto-session.sh complete; cron verification at next scheduled run |
| TSK-007 | Implement `session-end-script.md` | **done** 2026-03-09 | scripts/session-end.sh created and integrated |
| TSK-008 | Implement `basic-monitoring.md` | **done** 2026-03-09 | heartbeat.sh + check-cron-health.sh + cron entries added |

---

### P2 — Medium

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-009 | Second blog post (payment launch / progress update) | open | Unblocked — write draft, Sunil publishes |
| TSK-010 | Feedback mechanism surfaced to users | open | Currently DB-only; needs a simple `/feedback` page or email link |
| TSK-011 | Grow helper network — promote `/join.html`, process applications | open | — |
| TSK-012 | First external user (non-panel) end-to-end | open | Depends on TSK-003 and helper network |
| TSK-013 | Off-site backup | **blocked** | Needs Sunil to provide S3-compatible bucket + credentials |
| TSK-014 | `hard-exclusion-content-triggers` | open | Art.11 Phase 1 — email webhook warm referral |
| TSK-015 | `privacy-tension-disclosure` | open | Art.11 Phase 1 — user-facing OSA/dyadic privacy disclosure |
| TSK-016 | `safety-resources-page` | open | Art.11 Phase 1 — public `/support` page |
| TSK-017 | `safeguarding-disclosure-terms` | open | Art.11 Phase 1 — panel obligations in terms + join page |
| TSK-018 | `emergency-override-protocol` | open | Art.11 Phase 1 — document protocol at `docs/operations/` |
| TSK-019 | Privacy policy legal sign-off | open | Target 2026-04-08 — remove draft banner when done |

---

### P3 — Low

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-020 | Archive completed Week 1–3 checklists from CLAUDE.md | open | Saves ~40 lines of orientation token cost |
| TSK-021 | `account-deletion-flow` | open | Art.10 Phase 1 |
| TSK-022 | `data-export-endpoint` | open | Art.10 Phase 1 |
| TSK-023 | `algorithmic-transparency-disclosure` | open | Art.10 Phase 1 |
| TSK-024 | `revenue-model-constraint-terms` | open | Art.10 Phase 1 |
| TSK-025 | `exclusion-register-operational` | open | Art.11 Phase 1 (register exists; this covers update process) |

---

## Completed (last 10)

| ID | Task | Completed | Notes |
|---|---|---|---|
| — | Infrastructure audit + security remediation | 2026-03-08 | Block 1 audit |
| — | Rate limiting, input validation, PII fix, prompt injection defence | 2026-03-08 | — |
| — | Credential hygiene: .mcp.json removed from history | 2026-03-08 | — |
| — | Constitution v1.1 (Art.10) + v1.2 (Art.11) ratified | 2026-03-08 | — |
| — | Autonomous operation readiness audit | 2026-03-08 | — |
| — | Orchestration architecture + Agent SDK evaluation | 2026-03-08 | Decision 006 |
| — | Work items created for operational hardening blocks 1–4, 6–7 | 2026-03-09 | — |
| — | `.claude/settings.json` Edit permission fix | 2026-03-09 | Root cause of all auto-session stalls |
| — | `auto-session.sh` hardened (lock, .env, outcome check, alerting, prompt) | 2026-03-09 | TSK-006 in progress |

---

*Last updated: 2026-03-09*
