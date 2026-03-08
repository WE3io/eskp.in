# overdue-recurring-tasks

**Phase:** 1 — Foundational
**Article:** 5.1 (Budget management — weekly reporting obligation); 7.4 (Security boundaries — backup integrity)

## Outcome

Two overdue recurring obligations are discharged, and their completion is recorded in `docs/state/task-queue.md` so the recurring tasks table reflects accurate `last_completed` dates going forward.

**1. Weekly budget report (first instance)**
Sunil receives an email at sunil@eskp.in with the first weekly budget report. The email includes: total spend to date in March 2026, spend by model/operation category (from the `token_usage` table), remaining budget, daily burn rate, projected month-end spend, and current phase status. This fulfils the Article 5.1 obligation to "report spend weekly to the panel."

**2. Backup restore test (first instance)**
The most recent backup file (`~/backups/platform_*.sql.gz`) is restored to a temporary PostgreSQL database (`platform_test`). Row counts for each table in the restored database are compared against production. The result — matching counts, any discrepancies, and the backup file tested — is recorded in a new file `docs/operations/backup-restore-log.md`. The temporary database is dropped after verification. This is the first-ever restore test of the backup system.

## Constraints & References

- Budget report email must use `src/services/email.js` (Resend, from `hello@mail.eskp.in`) — do not use a different email path
- Budget report data must come from the `token_usage` table via `scripts/budget-check.js` or equivalent DB query — not estimated or approximated
- Backup restore must use a temp database, not touch production (`platform_test` or similar name, confirmed absent before restore)
- Restore test must use `docker exec platform-db` to run psql commands — do not expose the DB port or install a local psql client
- `docs/operations/` directory must exist or be created; `backup-restore-log.md` follows the existing ops docs pattern
- Article 5.1: weekly report is a constitutional obligation, not optional
- Article 7.4: backup integrity is an operational security requirement

## Acceptance Checks

- Sunil's inbox contains a budget report email from `hello@mail.eskp.in` with subject containing `[eskp.in] Budget report`
- Email body contains: spend figure in USD, at least one model/operation breakdown row, remaining budget, and projected month-end
- `docs/operations/backup-restore-log.md` exists and contains: date of test, backup file tested, table names and row counts from restored DB, comparison result (match/mismatch), and outcome (pass/fail)
- `docker exec platform-db psql -U platform -l` does NOT show `platform_test` after completion (temp DB dropped)
- `docs/state/task-queue.md` recurring tasks table shows today's date in `last_completed` for both "Budget report to panel" and "Backup verification (restore test)"

## Explicit Non-Goals

- Automating future budget report delivery (this item sends the first one; automation is a separate task)
- Off-site backup copies (separate item, blocked on Sunil providing a bucket)
- A UI or dashboard for budget data
- Restoring production from backup (this is a verification test only)
- Changing the backup retention policy or schedule
