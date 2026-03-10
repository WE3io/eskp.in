# Raw Text Retention Policy

**Version:** 1.0
**Created:** 2026-03-10
**Owner:** Claude instance (platform operator)
**Review due:** 2027-03-10
**Legal basis:** UK GDPR Article 5(1)(e) — storage limitation principle

---

## Purpose

When a user submits a goal, their verbatim text is stored in the `goals.raw_text` column. This column holds the most sensitive form of the data — the user's own words, potentially including personal circumstances, health information, financial situation, or other sensitive context.

Once the AI decomposition engine processes the submission, the structured output (`goals.decomposed` JSONB column) contains all information needed for matching. The `decomposed` field:
- Uses generalised language (special category data is abstracted away per DECOMPOSE_TOOL instructions)
- Is structurally limited to summary, needs, context, outcome, urgency, and expertise tags
- Is purpose-limited to matching

Retaining `raw_text` beyond the decomposition step serves no operational purpose and creates unnecessary data minimisation and storage limitation risk.

---

## Policy

### Retention rules

| Goal status | raw_text retained? | Reason |
|------------|-------------------|--------|
| `submitted` | Yes | Decomposition not yet started |
| `decomposing` | Yes | Decomposition in progress |
| `pending_clarification` | Yes | Needed to build combined text when user replies |
| `matched` | **No — nulled immediately** | Decomposition complete; raw_text not needed |
| `introduced` | **No** | (should already be null from matched stage) |
| `resolved` | **No** | — |
| `closed` | **No** | — |

### When nullification occurs

**New goals:** `raw_text` is set to `NULL` in the same database transaction that writes the `decomposed` column and sets `status = 'matched'`. This happens in `src/services/platform.js` (`processGoal()` and `processClarification()`).

**Existing goals (back-fill):** A one-time migration (`src/db/migrate.js`) nulled `raw_text` for all goals that already had a `decomposed` value and were not in an active processing state. Applied: 2026-03-10.

### Schema change

The `goals.raw_text` column was changed from `NOT NULL` to nullable in migration 29 (2026-03-10). The `INSERT INTO goals` statement still provides `raw_text` at creation; only the `UPDATE` after decomposition sets it to `NULL`.

---

## Data export

The data export (`GET /account/export`) still includes `raw_text` in the goals export. For most users, this will be `null` (already nulled after decomposition). Users will see their goals represented via the `decomposed` JSON structure. This is consistent with UK GDPR Art.20 (portability) — the export must include data the platform holds, and the decomposed summary is the relevant form of the data.

---

## Rationale

- **UK GDPR Art.5(1)(c) — data minimisation:** Only data adequate and relevant to the purpose should be processed. Post-decomposition, the structured form is sufficient.
- **UK GDPR Art.5(1)(e) — storage limitation:** Data should not be kept longer than necessary for the purpose. The purpose of `raw_text` is decomposition, which completes in seconds.
- **Risk reduction:** Nulling verbatim text limits damage from a hypothetical data breach. An attacker seeing `goals.decomposed` sees generalised summaries, not the user's own words.

---

## Review

This policy applies from 2026-03-10. Review annually or when the decomposition pipeline changes substantially.

---

*Document owner: Claude instance. Next review: 2027-03-10.*
