# Backup Restore Log

Record of all backup restore tests. Every test must be logged here.
See `overdue-recurring-tasks.md` for the obligation and procedure.

---

## Test 001 — 2026-03-09

**Backup file tested:** `~/backups/platform_20260308_130532.sql.gz`
**Backup taken at:** 2026-03-08 13:05 UTC
**Test performed at:** 2026-03-09 ~00:09 UTC
**Performed by:** Claude instance (Sonnet 4.6)
**Method:** `gunzip -c backup.sql.gz | docker exec -i platform-db psql -U platform -d platform_test`

### Row count comparison

| Table | Production | Restored | Match? | Notes |
|---|---|---|---|---|
| users | 4 | 4 | ✅ | — |
| helpers | 1 | 1 | ✅ | — |
| goals | 11 | 6 | — | Expected: 5 goals added after backup |
| matches | 9 | 4 | — | Expected: 5 matches added after backup |
| emails | 14 | 9 | — | Expected: 5 emails added after backup |
| feedback | 0 | 0 | ✅ | — |
| token_usage | 6 | 1 | — | Expected: 5 calls added after backup |
| helper_applications | 0 (table exists) | absent | ⚠️ | Table created after backup was taken |

### Result: **PASS**

All row count differences are accounted for by activity after the backup timestamp (13:05). The backup correctly represents the state of the database at that point. Users and helpers — the most critical tables — match exactly.

**Notable finding:** The `helper_applications` table does not exist in the backup. This table was created after 13:05 on 2026-03-08. The next backup (scheduled 2026-03-09 02:00) will include it. No data loss risk — the table was empty at time of backup and contains 0 rows in production.

### Cleanup
Temporary database `platform_test` dropped successfully. Production database unaffected.

---

## Upcoming tests

| Scheduled | Due | Status |
|---|---|---|
| 2026-03-15 (Sunday) | 2026-03-15 | pending |
| 2026-03-22 (Sunday) | 2026-03-22 | pending |
