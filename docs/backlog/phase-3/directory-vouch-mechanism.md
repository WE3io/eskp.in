# directory-vouch-mechanism

**Phase:** 3 — Trust Directory
**Article:** 11.3.2 (Trust signal is relational — network vouching only)
**Status:** draft

## Outcome

A platform user can vouch for a listed professional from within the directory. The vouch is directed (from the vouching user to the specific professional), private (not publicly displayed as a count or list), and tied to a relationship context the voucher provides. The vouch is visible only to the vouched professional and platform operators — not to other users or to anonymous visitors. The mechanism does not expose vouch volume in any user-facing way.

## Constraints & References

- Article 11.3.2: network vouching only — no anonymous reviews, no aggregated public ratings, no ranking by vouch volume
- Research source: `docs/research/professional-boundaries-and-directory.md` Section 4.2 (vouching mechanism specification)
- Depends on: directory-vouching-data-model (phase-3), directory-credential-verification (phase-3)
- Only authenticated platform users can vouch (not anonymous visitors)
- A user may not vouch for the same professional more than once
- Vouch relationship context (e.g. "worked together", "received advice from") is stored but not published
- No public vouch count on any profile — constitutional constraint, not a UI preference

## Acceptance Checks

- Authenticated user can submit a vouch for a listed professional via the directory UI
- Vouch requires a relationship context field (non-empty string, max 200 chars)
- Duplicate vouch (same user, same professional) is rejected with a clear user-facing message
- Vouch is stored in `vouch_records` table with voucher_id, professional_profile_id, relationship_context, created_at
- No vouch count or vouch list is rendered on any public-facing profile page
- Professional profile page displays the registration number and link but no aggregated social proof metrics
- Vouched professional receives an email notification (warm, factual: "someone has vouched for your listing")
- Admin can view vouches for operational awareness; this view is not user-facing

## Explicit Non-Goals

- Public vouch lists or testimonials
- Anonymous vouching
- Vouch weighting or trust scoring algorithms
- User-to-user vouching (professional profiles only at this stage)
- Vouch revocation (out of scope at launch)
