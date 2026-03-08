# efficacy-measurement-baseline

**Phase:** 3 — Governance and measurement
**Article:** 10.4 (Empirical honesty)

## Outcome

The platform begins collecting the minimum data required to measure its core efficacy claim. A new `outcomes` table records goal completion events passively. A quarterly review process is documented. The first review (even if data is sparse) is published as a build-in-public post within 90 days of this item shipping.

## Constraints & References

- Article 10.4: actively measure claims; report honestly including weak results; do not overclaim
- Must not require users to self-report (passive signals only at this stage)
- No PII in the outcomes table beyond goal_id (which links to users indirectly)
- Schema: `outcomes (id, goal_id, measurement_type, value, recorded_at)`
- `measurement_type` values: sub_goal_completed, goal_marked_achieved, match_introduced

## Acceptance Checks

- `outcomes` table exists in DB with schema above
- Goal completion events write a row automatically (at minimum: match introduced, goal marked achieved)
- `docs/governance/efficacy-review-process.md` exists with review cadence and publication commitment
- First build-in-public post referencing outcomes data published within 90 days of shipping

## Explicit Non-Goals

- Self-efficacy psychometric instruments (surveys, validated scales)
- Statistical significance testing (insufficient data at this stage)
- Real-time dashboard
