# bilateral-thread-isolation

**Phase:** 2 — Panel infrastructure
**Article:** 10.1.1, 10.1.3
**Status:** draft

## Outcome

All query paths that retrieve panel member data enforce that an advisor can only access records associated with their own `panel_members.id`. No API endpoint or service function returns data from another advisor's thread to a different advisor. This constraint is documented as an architectural decision record.

## Constraints & References

- Article 10.1.1: no cross-advisor information flows
- Article 10.1.3: AI cross-thread prohibition is architectural, not a policy default
- All queries against `panel_interactions`, `panel_members`, and any bilateral thread content must be scoped by advisor identity
- Depends on: `panel-data-model`

## Acceptance Checks

- Code review: no query against panel interaction data is unscoped by `panel_member_id` or equivalent advisor-identity filter
- A test confirms that Advisor A's session cannot retrieve Advisor B's thread content for the same user
- Decision record created at `docs/decisions/006-bilateral-thread-isolation.md`

## Explicit Non-Goals

- End-to-end encryption of thread content (Phase 3)
- Formal security audit
- User-Private (Tier 1) zero-access encryption
