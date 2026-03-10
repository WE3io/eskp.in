# harden-auto-session

**Phase:** 1 — Foundational
**Article:** 2.2 (Operational decisions — autonomous authority)
**Status:** done

## Outcome

`scripts/auto-session.sh` is hardened against six failure modes, four from the original audit (2026-03-08) and two additional items identified in the orchestration research (2026-03-08):

1. **Root cause fix — permission model:** `Edit` is added to `.claude/settings.json` `permissions.allow`, and `--permission-mode acceptEdits` is added to the `claude --print` invocation. This is the single change that makes auto-sessions functional — without it, Claude cannot edit state files in non-interactive mode and every session stalls.
2. **Concurrent session prevention:** the script acquires a lock file (`/tmp/claude-session.lock`) at startup and releases it on exit (including on crash or timeout). If a lock is already held, the script logs the conflict and exits without starting a new session.
3. **Environment reliability:** all variables from `.env` are explicitly exported via `set -a; source "${PROJECT_DIR}/.env"; set +a` before the `claude --print` invocation. The script must not rely on `.bashrc` or saved Claude Code config for `ANTHROPIC_API_KEY`.
4. **Outcome verification:** after the claude subprocess exits, the script compares `git rev-parse HEAD` before and after, checks the mtime of `docs/state/current-sprint.md`, and logs a summary line: `Commits: X. State updated: Y/N. Output lines: Z.` If zero commits AND state file not updated, the session is treated as failed.
5. **Failure alerting:** on any non-zero exit code, timeout (exit 124), or detected failure (outcome check negative), the script sends an email alert to Sunil via the existing Resend path. The alert includes: exit code, timestamp, and the last 50 lines of the session log. The current behaviour (log only, no alert) is insufficient.
6. **Structured continuation prompt:** the freeform prompt is replaced with a structured priority-order prompt that references `docs/state/task-queue.md`, enforces session constraints (no CONSTITUTION.md edits, no external emails outside platform flow, no breaking deploys without flagging), and requires explicit state-file updates and a "Next session starts with:" line before the session ends.

## Constraints & References

- Root cause: `Edit` absent from `.claude/settings.json` `permissions.allow` — confirmed as the sole cause of all auto-session stalls since deployment
- Lock must use `flock` or PID-file pattern — no additional dependencies
- `.env` export must not echo secret values to the log (redirect to `/dev/null`)
- Outcome check window: 35 minutes (5-minute tolerance above the 30-minute timeout)
- Alert email must use the existing `src/services/email.js` send path (consistent with budget alert pattern already in the script)
- Structured prompt must reference `docs/state/task-queue.md` (created in `task-queue-system` work item — that item is a prerequisite)
- Constitution Article 2.2: autonomous operational decisions; Article 8.3: routine operations do not require escalation

## Acceptance Checks

- `cat .claude/settings.json | python3 -m json.tool` shows `"Edit"` in `permissions.allow`
- `grep "permission-mode" scripts/auto-session.sh` returns `--permission-mode acceptEdits`
- `grep "set -a" scripts/auto-session.sh` returns the `.env` export block
- Start a manual run; while running, start a second instance; second logs `[TIMESTAMP] Session already running (lock held). Exiting.` and exits 0
- Lock file absent after normal completion; absent after kill mid-execution (trap cleans up)
- Run `env -i HOME=$HOME PATH=$PATH /root/project/scripts/auto-session.sh`; session starts and completes (confirms self-contained .env loading)
- Run a session that makes at least one commit; confirm summary log line shows `Commits: 1`
- Run a session that makes no commits and no state changes; confirm warning email is received at Sunil's address within 5 minutes of session end
- Session log for a working run shows Claude editing `docs/state/current-sprint.md` (not "pending approval")

## Explicit Non-Goals

- Retry logic for failed sessions (alert and log is sufficient for Phase 1)
- Off-site backup (separate blocked item, requires Sunil to provide bucket)
- Changing the 6-hour cron cadence
- Adding authentication or signing to alert emails
- Replacing the `@anthropic-ai/sdk` calls in `decompose.js` / `match.js` (those are unaffected by this item)
