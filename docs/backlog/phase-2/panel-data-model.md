# panel-data-model

**Phase:** 2 — Panel infrastructure
**Article:** 10.1, 10.3
**Status:** draft

## Outcome

The database schema supports multi-advisor panels: a `panels` table (user_id, created_at), a `panel_members` table (panel_id, helper_id, role_label, status, role_charter_text, invited_at, accepted_at), and a `panel_interactions` table (panel_member_id, goal_id, interaction_type, created_at). Existing single-match flow remains intact.

## Constraints & References

- Article 10.1.1: no cross-advisor information flows — schema must enforce that advisors cannot see each other's thread content
- Article 10.3.2: user-formed panels; cold matching secondary
- `src/db/migrate.js` (existing migration pattern)
- Must not break existing matches table or payment flow

## Acceptance Checks

- Migration runs cleanly on existing DB without data loss
- `panel_members` rows are not queryable by other advisors (query-layer scoping documented)
- Existing goal→match→payment flow continues to work post-migration
- Schema reviewed: no field in `panel_members` exposes Tier 2 (bilateral thread) data to other advisors

## Explicit Non-Goals

- Panel UI
- Panel invitation flow (separate item)
- Role charter enforcement logic
