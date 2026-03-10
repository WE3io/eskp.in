# session-end-script

**Phase:** 1 — Foundational
**Article:** 2.2 (Operational decisions — autonomous authority)
**Status:** done

## Outcome

A `scripts/session-end.sh` script exists and is called automatically at the end of every automated session. It performs a deterministic handoff check and auto-commits any uncommitted state-file changes that Claude left behind.

Specifically, the script:
1. Checks whether each of the four state files (`current-sprint.md`, `recent-decisions.md`, `feedback-queue.md`, `budget-tracker.md`) was modified in the last 30 minutes. Logs a warning for each that was not.
2. Checks for uncommitted changes to `docs/state/` or `docs/backlog/`. If found, stages and commits them automatically with message `state: auto-commit session cleanup [timestamp]`.
3. Checks that `docs/state/current-sprint.md` contains the string `"Next session starts with:"`. Logs a warning if absent.
4. Prints a structured summary to stdout: files checked, warnings issued, auto-commit made (Y/N).

`auto-session.sh` calls `session-end.sh` unconditionally after the `claude --print` process exits — whether the session succeeded, timed out, or failed.

`CLAUDE.md` is updated to instruct: at the end of every manual session, run `scripts/session-end.sh` before closing the terminal.

## Constraints & References

- Script must be idempotent — safe to run multiple times without side effects
- Auto-commit message must be distinguishable from intentional session commits (prefix `state: auto-commit`)
- The 30-minute window matches the session timeout; adjust if the timeout changes
- Must not push to remote — push remains the Claude instance's deliberate act
- Must not modify state file content — only commits what is already staged or unstaged
- Depends on `git` being available in `$PATH` (already true on this server)
- `harden-auto-session.md` is a prerequisite (the integration point is in `auto-session.sh`)

## Acceptance Checks

- `scripts/session-end.sh` exists and is executable (`chmod +x`)
- Running the script when all state files are current and no uncommitted changes exits 0 with summary `Warnings: 0. Auto-commit: N`
- Running the script when `current-sprint.md` was last modified 45 minutes ago logs `[WARNING] current-sprint.md not updated this session`
- Running the script with unstaged changes to `docs/state/recent-decisions.md` creates a git commit with message matching `state: auto-commit session cleanup`
- Running the script when `"Next session starts with:"` is absent from `current-sprint.md` logs `[WARNING] Missing 'Next session starts with:' pointer`
- `auto-session.sh` contains a call to `session-end.sh` that executes after the `claude --print` block (verify with `grep session-end scripts/auto-session.sh`)
- `CLAUDE.md` contains the instruction to run `scripts/session-end.sh` at the end of manual sessions

## Explicit Non-Goals

- Pushing to remote (deliberate act only)
- Modifying or rewriting state file content
- Sending email alerts (that is `harden-auto-session.sh`'s responsibility)
- Checking code files outside `docs/state/` and `docs/backlog/`
- Replacing the "BEFORE ENDING ANY SESSION" checklist in `CLAUDE.md` — this script is a safety net, not a replacement for intentional session hygiene
