# Autonomous Script Activation Gate

## Rule

When creating a new scheduled script (cron entry, systemd timer):

1. **Write the script** and commit it
2. **Run `--dry-run` or `DRY_RUN=1`** and verify output is correct
3. **Log the dry-run result** in the session notes (current-sprint.md)
4. **Only then** add the cron entry

Never write, commit, and activate a new scheduled script in a single step.

## Rationale

Autonomous sessions can write and activate cron jobs without human review. A dry-run requirement creates a review checkpoint between writing and activating.

## session-end.sh check

If you add a cron entry during a session, write the entry to `/tmp/eskp-new-cron-entries.txt` so session-end.sh can flag it for review.
