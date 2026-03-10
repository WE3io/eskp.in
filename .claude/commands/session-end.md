End-of-session handoff. Complete all steps before ending the session.

1. **Update `docs/state/current-sprint.md`:**
   - Add a session summary section with today's date and session number.
   - List what was completed, what changed, any decisions made, any blockers.
   - Write a "Next session should start with:" line at the bottom.

2. **Update `docs/state/task-queue.md`:**
   - Mark completed tasks as done.
   - Add any new tasks discovered during this session (assign next available TSK-NNN ID).
   - Update recurring task dates if any were completed.
   - Re-prioritise if needed.

3. **Run `pnpm budget` and update `docs/state/budget-tracker.md`** with the output.

4. **Check `docs/state/recent-decisions.md`:**
   - If any architectural or operational decisions were made this session, add them with date, decision, reasoning, and confidence level.

5. **Stage, commit, and push:**
   ```
   git add docs/state/ && git commit -m "state: end of session $(date -u +%Y-%m-%d)" && git push
   ```

Do not skip any step. These files are the handoff to the next session.
