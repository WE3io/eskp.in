# Helper Community — Setup and Operations

**Status:** Email-first (Phase 1). Slack deferred until 5+ active helpers.
**Last reviewed:** 2026-03-10

---

## Current approach (0–5 helpers)

At fewer than 5 active helpers, a dedicated Slack/Discord workspace creates maintenance overhead and looks empty. Email is sufficient.

**Active touchpoints:**

| Touchpoint | Script | Cadence | What it does |
|---|---|---|---|
| Weekly helper digest | `scripts/helper-digest.js` | Monday 08:00 UTC | Goal volume, topics in helper's domain, pipeline count |
| Pre-match notification | `platform.js → sendPreMatchNotification()` | Triggered | Heads-up when a goal in helper's domain arrives (score ≥ 40) |
| Match introduction | `platform.js → sendMatchIntroduction()` | Triggered | Formal introduction with user details and payment link |
| Post-intro check-in | `scripts/followup.js` | 24h after intro | Check whether the introduction was useful |

These are the community layer at bootstrap. No additional infrastructure is needed before 5 helpers.

---

## Phase 2 trigger: Slack/Discord setup (5+ active helpers)

When active helpers reach 5, create a private Slack workspace.

### Setup steps

1. **Create workspace** at slack.com → "Create a new workspace"
   - Workspace name: `eskp-helpers` or `eskp.in helper circle`
   - Display name: visible to members only
   - Do NOT make the workspace public

2. **Channels to create:**
   - `#general` — introductions, loose chat
   - `#goals-incoming` — share anonymised summaries of interesting goal types (no PII)
   - `#outcomes` — share outcomes (with user permission)
   - `#feedback` — helpers surface product issues

3. **Initial message in #general:**
   ```
   Welcome to the helper circle. This is a space for the small group of people
   who power eskp.in. You'll see summaries of incoming goals here, share
   outcomes, and help shape how the platform works.

   One rule: no user identifying information outside #goals-incoming,
   and nothing in #goals-incoming that would identify a specific person.
   ```

4. **Invite helpers** via manage-helpers CLI:
   ```
   pnpm manage-helpers invite-to-slack <email>
   ```
   _(This subcommand does not exist yet — build it when Slack is set up.)_

5. **Add Slack webhook to helper digest** (scripts/helper-digest.js) — post a summary to #goals-incoming in addition to email.

### Privacy constraints

- Never share raw goal text in Slack — summaries only
- Never share user email addresses or names in Slack
- Helpers in Slack have the same confidentiality obligations as in the terms
- See `docs/operations/exclusion-register.md` for domains that must not be discussed in group channels

---

## Phase 3: Cohort model (20+ users)

At 20+ active users, consider monthly intake cohorts. See `docs/research/2026-03-10-community-layer.md` for the detailed phased plan.

---

## Related tasks

| ID | Task | Status |
|---|---|---|
| TSK-072 | Weekly helper digest | done |
| TSK-073 | Pre-match notification | done |
| TSK-074 | Private helper channel setup | **this document** — deferred to Phase 2 |
| TSK-091 | Monthly outcome roundup email | open |
| TSK-092 | Helper notes field | open |
