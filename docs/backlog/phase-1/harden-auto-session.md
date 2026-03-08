# harden-auto-session

**Phase:** 1 — Foundational
**Article:** 2.2 (Operational decisions — autonomous authority)

## Outcome

`scripts/auto-session.sh` is hardened against three failure modes identified in the autonomous operation audit (2026-03-08):

1. **Concurrent session prevention:** the script acquires a lock file (`/tmp/claude-session.lock`) at startup and releases it on exit (including on crash or timeout). If a lock is already held, the script logs the conflict and exits without starting a new session.
2. **Environment reliability:** all variables from `.env` are explicitly exported into the shell environment before the `claude --print` invocation, so the API key and other secrets are available to the subprocess regardless of how cron initialises the shell.
3. **Outcome verification:** after the claude subprocess exits, the script checks whether (a) any `docs/state/` file was modified in the last 35 minutes and (b) a git commit was made in the last 35 minutes. If neither condition holds, the script appends a `[WARNING] session produced no observable output` line to the log and sends an alert email to `panel@eskp.in`.

## Constraints & References

- Must use a lock mechanism compatible with bash and cron (`flock` or PID-file pattern — no additional dependencies)
- `.env` export must not log secret values (export silently or redirect to /dev/null)
- Outcome check window of 35 minutes provides 5-minute tolerance above the 30-minute timeout
- Alert email must use the existing `src/services/email.js` send path (consistent with existing budget alert pattern in the same script)
- Constitution Article 2.2: Claude may make operational decisions autonomously — this item implements that without introducing new approval gates

## Acceptance Checks

- Start a manual `auto-session.sh` run; while it is running, start a second instance; second instance logs `[TIMESTAMP] Session already running (lock held). Exiting.` and exits with code 0
- Lock file is absent after a run completes normally
- Lock file is absent after a run is killed mid-execution (i.e. trap cleans up)
- Run `env -i HOME=$HOME PATH=$PATH /root/project/scripts/auto-session.sh`; budget check and claude invocation both succeed (confirms .env is loaded without relying on inherited shell environment)
- Modify a state file during a session, then confirm no warning email is sent; run a session that makes no commits and no state changes, then confirm the warning appears in the log within 5 minutes of session end

## Explicit Non-Goals

- Retry logic for failed sessions (a warning and log entry is sufficient for Phase 1)
- Off-site backup (separate blocked item)
- Changing the 6-hour cron cadence
- Adding authentication or signing to the alert email
