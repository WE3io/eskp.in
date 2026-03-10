# task-queue-system

**Phase:** 1 — Foundational
**Article:** 2.2 (Operational decisions — autonomous authority); 3.4 (User-driven development)
**Status:** done

## Outcome

The platform has a structured, machine-readable task queue that every Claude session consults before deciding what to work on.

Two artefacts are created:

1. **`docs/state/task-queue.md`** — a single source of truth for all pending work, with four priority levels (P0–P3), a recurring tasks table with last-completed and next-due dates, and active task sections populated with all currently known work items using stable IDs (TSK-NNN).

2. **`CLAUDE.md` task management section** — explains where tasks live, how priorities work, how recurring tasks are tracked, and encodes the rule that every session (automated and manual) checks `task-queue.md` before deciding what to do next.

The initial population of `task-queue.md` must include at minimum: TSK-001 (fix goals jsonb bug, P0), TSK-002 (weekly budget report, P1, overdue), TSK-003 (build-in-public post, P1, blocked), TSK-004 (backup restore test, P1), TSK-005 (landing page iteration, P2), TSK-006 (off-site backup, P2, blocked on Sunil), TSK-007 (CLAUDE.md archiving of completed week checklists, P3), and all active backlog items from `docs/backlog/phase-1/` not yet started.

## Constraints & References

- `task-queue.md` lives in `docs/state/` alongside the other session-continuity files — it is updated by every session, not just at planning time
- Task IDs must be stable (TSK-NNN format); never reuse an ID once assigned
- Recurring tasks table must record `last_completed` and `next_due` dates — a session cannot determine whether a recurring task is overdue without this
- The CLAUDE.md addition must not duplicate content already in `current-sprint.md`; the sprint file tracks high-level phase progress, the task queue tracks individual executable items
- `harden-auto-session.md` references `task-queue.md` in its structured prompt — that work item depends on this one existing first

**Advisory (decision lens):** Adding a rule to CLAUDE.md that "every session checks task-queue.md first" encodes a prioritisation policy. This is an operational decision within Claude's autonomous authority (Article 2.2), but it is worth noting explicitly.

## Acceptance Checks

- `docs/state/task-queue.md` exists and is valid Markdown
- File contains a `## Recurring Tasks` table with columns: Task, Frequency, Last completed, Next due, SLA
- Recurring tasks table contains at minimum: budget report (weekly Monday), build-in-public post (weekly Friday), backup verification (weekly Sunday), state file accuracy check (every session), security dependency audit (monthly)
- File contains `## Active Tasks` sections for P0, P1, P2, P3
- TSK-001 through TSK-007 are present with correct priorities and statuses
- Every open item in `docs/backlog/phase-1/` that has no corresponding implementation commit has an entry in the P2 or P3 section
- `CLAUDE.md` contains a `## Task Management` section explaining the queue location, priority levels, recurring task tracking, and the "check task-queue.md first" rule
- A fresh session reading only `CLAUDE.md` and `docs/state/task-queue.md` can determine the single highest-priority task to work on next without any additional orientation

## Explicit Non-Goals

- A database-backed task system or API (Markdown file is sufficient for Phase 1)
- Automatic task creation from inbound emails (manual entry only in Phase 1)
- Integration with GitHub Issues or any external tracker
- User-facing task visibility
- Burndown charts, velocity metrics, or any reporting beyond the queue file itself
