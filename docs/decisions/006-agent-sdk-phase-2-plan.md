# Decision 006: Agent SDK Phase 2 Plan

**Date:** 2026-03-08
**Status:** Deferred — documented for future implementation
**Decision:** Do not implement the Agent SDK orchestrator in Phase 1. Revisit at Phase 2.
**Confidence:** 95%

---

## Context

The autonomous operation audit (2026-03-08) evaluated whether the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) should replace or augment the current `cron + claude --print` session architecture. The full evaluation is in the session transcript and summarised in `docs/state/recent-decisions.md`.

The recommendation — harden cron now, defer the Agent SDK to Phase 2 — was approved by Sunil on 2026-03-08.

This document preserves the implementation plan so the research is not lost between sessions.

---

## When to Build It

Build the Agent SDK orchestrator when **any one** of the following trigger conditions is met:

1. **Email volume:** inbound goals or helper applications exceed 5 per day on average over a 7-day period. At this volume, 6-hour Claude awareness latency becomes a user-facing problem.
2. **Helper network:** the platform has 5 or more active helpers and match quality requires multi-helper coordination or comparison across simultaneous candidates.
3. **Budget allows:** the monthly token budget has grown to at least $100/month (Phase 2 self-funding), so the cost of an idle persistent orchestrator process is negligible.
4. **Explicit recurring complexity:** there are 3 or more recurring task types with different cadences (daily, weekly, monthly) and the markdown task-queue is generating missed-task incidents.

Do not build it before at least one trigger condition is met.

---

## What to Build

**Pattern:** Hybrid/resumable (ephemeral sessions with state hydrated from DB and `docs/state/` between runs).

**Why not long-running/persistent:** The platform's workload is naturally bursty — most 6-hour windows have zero new goals. A persistent container would idle expensively. State already lives in files and the DB; session resumption via state hydration is straightforward.

### Components

| Component | Description |
|---|---|
| `scripts/orchestrator.ts` | TypeScript orchestration service (~300 lines). Event loop polling PostgreSQL every 60 seconds. Spawns Agent SDK sessions on demand. |
| `systemd/claude-orchestrator.service` | systemd unit for the orchestrator process. Starts on boot, restarts on failure. |
| `src/db/schema/sessions.sql` | New `sessions` table: session_id, task_id, started_at, ended_at, outcome (success/failure/timeout), commits_made, state_updated |
| Removal of auto-session cron entry | The orchestrator replaces `0 */6 * * *` cron job |

### Orchestrator Logic (sketch)

```typescript
// Poll for work
const pending = await db.query(`
  SELECT * FROM (
    SELECT 'goal' AS type, id, created_at FROM goals WHERE status = 'submitted'
    UNION ALL
    SELECT 'email', id, created_at FROM emails WHERE processed = false
  ) work ORDER BY created_at ASC LIMIT 1
`);

if (pending.rows.length > 0 || scheduledTaskDue()) {
  await spawnSession(buildContext(pending.rows[0]));
}
```

### Session spawning (Agent SDK pattern)

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: buildPrompt(task, stateFiles),
  options: {
    allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],
    permissionMode: 'acceptEdits',
    maxTurns: 50,
    hooks: {
      PostToolUse: [{ matcher: 'Edit|Write', hooks: [logFileChange] }],
      Stop: [{ hooks: [recordSessionOutcome] }],
    }
  }
})) {
  // stream output to session log
}
```

---

## Estimated Effort

2–3 Claude sessions (Sonnet). Breakdown:
- Session 1: Install SDK, write orchestrator.ts, write systemd unit, write sessions schema migration
- Session 2: Test event-driven triggering, verify session lifecycle (start/timeout/cleanup), integrate with existing email webhook
- Session 3: Monitoring, failure handling, cron removal, documentation

---

## Dependencies

- `npm install @anthropic-ai/claude-agent-sdk` (project-local)
- Node.js 18+ (already satisfied — system is Node.js 20 LTS)
- PostgreSQL `sessions` table migration
- systemd available on Hetzner (confirmed)
- 1 GiB RAM per session — verify headroom at implementation time

---

## What It Replaces

- `scripts/auto-session.sh` and its cron entry (`0 */6 * * *`)
- `scripts/check-cron-health.sh` (replaced by orchestrator's own health reporting)

## What It Does NOT Replace

- `@anthropic-ai/sdk` calls in `src/services/decompose.js` and `src/services/match.js` — these are single-turn inference calls with no tool execution. They do not benefit from the Agent SDK and should remain as direct API calls.
- `scripts/backup-db.sh` and its cron entry — backup remains a separate cron job
- `scripts/heartbeat.sh` — infrastructure health monitoring remains cron-based

---

## Risks

| Risk | Mitigation |
|---|---|
| Orchestrator process crashes silently | systemd `Restart=on-failure`; `check-cron-health.sh` equivalent for orchestrator health |
| Agent SDK breaking changes between versions | Pin to specific version; test before upgrading |
| Session cost higher than cron (more context per session) | Cap with `max_turns` and `--max-budget-usd` per session |
| Concurrent sessions from multiple triggers | Orchestrator serialises session spawning; only one session at a time |

---

*This decision will be revisited when trigger conditions are met. Owner: Claude instance. Next review: when platform reaches Phase 2 (self-funding for 2 consecutive months).*
