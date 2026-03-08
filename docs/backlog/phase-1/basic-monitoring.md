# basic-monitoring

**Phase:** 1 — Foundational
**Article:** None (operational infrastructure)

## Outcome

Two monitoring scripts exist, run via cron, and send email alerts to Sunil on failure. All monitoring scripts and their cron schedules are documented in `CLAUDE.md`.

**`scripts/heartbeat.sh`** — runs every 15 minutes. Checks:
- App health: `GET /health` via the Docker internal network (not via the public internet) returns 200
- PostgreSQL: `docker exec platform-db pg_isready -U platform` exits 0
- nginx: HTTPS on port 443 responds (curl with `-k` for self-signed cert, or via Cloudflare) returns 200
- Disk usage: `df /` usage percentage is below 85%

On any check failure: sends an email alert to Sunil's address via the existing `src/services/email.js` Resend path. Alert includes: which check failed, timestamp, output of the failed check.

**`scripts/check-cron-health.sh`** — runs every 8 hours (at 04:00, 12:00, 20:00 — offset from auto-session at 00:00, 06:00, 12:00, 18:00). Checks:
- At least one `~/logs/session-*.log` file has an mtime within the last 7 hours.

On failure (no recent session log): sends an email alert to Sunil. This is the backstop for a silently stopped cron job.

Both scripts are added to crontab. `CLAUDE.md` is updated with a monitoring section listing all scripts, what they check, cron schedules, and alert destinations.

## Constraints & References

- App health check must use the Docker internal network (not a public URL), consistent with the fact that port 3000 is not host-bound
- Email alerts must use `src/services/email.js` — no new email dependencies
- Scripts must be self-contained: load `.env` themselves (consistent with `auto-session.sh` pattern after `harden-auto-session` is implemented)
- Alert emails must not contain secrets (no API keys, passwords, or tokens in email body)
- Disk threshold of 85% is a warning, not a hard failure — alert only, do not stop the script or take remedial action
- `check-cron-health.sh` cron schedule must not overlap with `auto-session.sh` schedule: auto-session runs at `0 */6`, health check at `0 4,12,20`

## Acceptance Checks

- `scripts/heartbeat.sh` and `scripts/check-cron-health.sh` exist and are executable
- `crontab -l` shows entries for both scripts at the correct schedules
- Run `bash scripts/heartbeat.sh` when all services are up: exits 0, no email sent
- Stop the platform-app container; run `bash scripts/heartbeat.sh`; confirm alert email received at Sunil's address within 2 minutes; restart container
- Set disk check threshold to 1% (to force a trigger in test); run heartbeat; confirm disk alert email received; restore threshold
- Delete all `~/logs/session-*.log` files; run `bash scripts/check-cron-health.sh`; confirm alert email received
- With a fresh `session-*.log` file timestamped within the last hour: run `check-cron-health.sh`; confirm no email sent, exits 0
- `CLAUDE.md` contains a `## Monitoring` section with table of: script name, what it checks, cron schedule, alert destination

## Explicit Non-Goals

- External uptime monitoring services (e.g. UptimeRobot, Pingdom)
- Metrics dashboards or time-series data
- Auto-remediation (restart containers, clear disk space) — alert only in Phase 1
- SSL certificate expiry monitoring
- Monitoring of Cloudflare Worker health (handled by Cloudflare's own dashboard)
- Per-endpoint latency monitoring
