# directory-vouching-data-model

**Phase:** 3 — Trust Directory
**Article:** 11.3 (Trust Directory — relational, not transactional)

## Outcome

The database schema supports the trust directory: professional profiles, credential records, and directional vouch relationships between users. The schema enforces the constitutional constraints — no anonymous reviews, no aggregated public ratings, no ranking by vouch volume. Vouches are directed (from a specific user to a specific professional) and private by default. The schema is extensible to support the two-tier monitoring requirement.

## Constraints & References

- Article 11.3.1: provider-payment-free permanently — no payment field, no subscription tier on professional profiles
- Article 11.3.2: network vouching only — no anonymous reviews, no aggregated ratings, no vouch-volume ranking
- Article 11.3.3: regulated professionals must have verified credential records before listing
- Article 11.3.4: two-tier access must be monitorable — schema must support access equity instrumentation
- Research source: `docs/research/professional-boundaries-and-directory.md` Section 4 (directory concept specification)
- Depends on: panel-data-model (phase-2)
- Vouch relationship is directed: vouch_from (user_id) → vouch_for (professional_profile_id)
- No public aggregated vouch count exposed in any query or API response

## Acceptance Checks

- `professional_profiles` table exists with fields: id, user_id (FK), display_name, domain, credential_type, credential_number, credential_verified_at, credential_verified_by, listed_at, active
- `vouch_records` table exists with fields: id, voucher_id (FK → users), professional_profile_id (FK), relationship_context (free text, private), created_at
- No `vouch_count` column or materialised view exposed via any API endpoint
- No `rating` or `score` column on professional_profiles
- `credential_verified_at` is nullable — unverified profiles cannot be listed (enforced at application layer, tested)
- Migration script present and reversible
- Schema diagram or ERD updated in docs/

## Explicit Non-Goals

- Public-facing directory UI (separate work item)
- Vouch visibility controls (private-by-default is sufficient at this stage)
- Payment or subscription fields (permanently excluded by Article 11.3.1)
- Aggregated trust scores or rankings
