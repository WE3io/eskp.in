# Helper Onboarding Quality & Tag Accuracy

**Date:** 2026-03-10
**Category:** Research (self-directed rotation)
**Question:** What quality gaps exist in our helper onboarding pipeline, and how can we ensure tag accuracy for reliable matching as the helper network grows?

## Sources

- Codebase audit: join.html, helper-application.js, manage-helpers.js, match.js, decompose.js, migrate.js
- Web research: marketplace tag normalization, skill matching in job platforms (LinkedIn STAR system, PIM normalization techniques)

## Findings

### Current flow (end-to-end)

1. Helper emails `hello@mail.eskp.in` with subject "Become a helper"
2. `helper-application.js` stores application, sends ack + admin notification
3. Admin runs `pnpm manage-helpers approve <id>` → creates user + helper profile (empty expertise)
4. Admin runs `pnpm manage-helpers add-tags <id> <tags>` → sets expertise array
5. Goals decomposed by Haiku → generates ad-hoc expertise tags
6. Matching: semantic ranking (Haiku) with tag-overlap fallback

### Gap 1: Tag normalization in fallback matching (FIXED)

**Problem:** `tagOverlapRank()` used exact string comparison (`allTags.includes(tag)`). A helper with tag "react" would not match a goal needing "React.js" or "react development".

**Impact:** Tag-overlap fallback (used for sensitive domains + Haiku failures) would produce false negatives.

**Fix applied:** Added `normaliseTag()` function — lowercase, collapse whitespace/dash/slash/dot. Both helper tags and goal tags normalized before comparison.

### Gap 2: Decompose.js generates ad-hoc tags (FIXED)

**Problem:** Haiku generated arbitrary expertise tags with no awareness of the canonical tag list (56 tags in manage-helpers.js). Tags like "react development" would not match "react" in helpers.

**Impact:** Reduces matching accuracy, especially in tag-overlap fallback.

**Fix applied:** Added canonical tag list to the decompose system prompt with instruction to prefer canonical tags when they fit, while still allowing non-canonical tags when needed.

### Gap 3: Missing migrations in migrate.js (FIXED)

**Problem:** `helpers.notes` column (TSK-092) and `goals.clarification_attempts` column (TSK-098) existed in the live DB but were added via ad-hoc ALTER TABLE, not recorded in migrate.js. Fresh deployments would fail.

**Fix applied:** Added both ALTER TABLE statements to migrate.js.

### Gap 4: Helper created with empty expertise after approval

**Problem:** `approve` creates helper with `expertise: '{}'`. If admin forgets to run `add-tags`, the helper is matchable but will never score above 0 in tag overlap.

**Impact:** Low risk currently (single admin, prompted to add tags). Higher risk as process scales.

**Recommendation:** Low priority — add a check in matching that skips helpers with empty expertise. Not implemented now (premature at 1 helper).

### Gap 5: No unique constraint on helpers(user_id)

**Problem:** Multiple helper profiles theoretically possible per user. Unlikely in manual workflow but a data integrity gap.

**Recommendation:** Add unique constraint when convenient. Not blocking.

## Relevance to eskp.in

These fixes are pre-requisites for reliable matching as the helper network grows beyond 1 helper. The semantic ranking (Haiku) handles semantic gaps well, but the fallback path (used for sensitive domains and API failures) needed normalization to work correctly.

The canonical tag hint in decompose.js also improves semantic matching quality by producing more consistent tag vocabulary across goals.

## Tasks generated

- TSK-100: Tag normalization in tag-overlap matching — **done this session**
- TSK-101: Canonical tags in decompose.js prompt — **done this session**
- TSK-102: Missing migrations added to migrate.js — **done this session**
- TSK-103: Skip helpers with empty expertise in findMatches (P3 — defer to 2+ helpers)
