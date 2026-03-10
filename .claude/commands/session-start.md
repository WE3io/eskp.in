Session orientation. Read state files, load skills, and output a brief plan before starting work.

1. **Read `docs/state/current-sprint.md`** — find the most recent session summary and the "Next session should start with:" line.

   **Load key skills now** — read these SKILL.md files so their processes are in context for this session:
   - `.claude/skills/implementation-executor/SKILL.md` — use when executing any backlog work item
   - `.claude/skills/work-item-designer/SKILL.md` — use when creating a new work item
   - `.claude/skills/safety-lens/SKILL.md` — use before risky or public-facing changes

2. **Read `docs/state/task-queue.md`** — identify:
   - Any P0 tasks (handle immediately).
   - Any overdue recurring tasks (check `Next due` column).
   - The highest-priority incomplete P1 task.

3. **Scan `docs/backlog/`** — list files in `phase-1/`, `phase-2/`, `phase-3/`. For any backlog item that is not yet tracked in `task-queue.md` and whose phase is current (Phase 1 now), check if it is actionable. If so, promote it: assign a TSK-NNN ID, set a priority, and add it to `task-queue.md`.

4. **Check for unprocessed inbound emails** — if the platform receives email, check whether any arrived since the last session.

5. **Read `docs/state/recent-decisions.md`** — note any decisions from the last 2–3 sessions that affect current work.

6. **Output a brief orientation:**
   - "Last session did: [summary]"
   - "Next priority: [task ID and description]"
   - "Backlog items promoted: [if any]"
   - "Recent decisions to be aware of: [if any]"
   - "Blockers: [if any]"

Then begin work on the highest-priority item.
