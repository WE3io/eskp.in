# algorithmic-transparency-disclosure

**Phase:** 1 — Foundational
**Article:** 10.2.3 (Algorithmic transparency and user control)

## Outcome

Every email sent to users that results from an algorithmic decision (goal decomposition, helper matching, semantic scoring) includes a plain-language sentence disclosing that AI was used and what it decided. A public `/how-it-works` page (or section on the landing page) explains the matching algorithm in plain language, including that users can request a different match by reply email.

## Constraints & References

- Article 10.2.3: algorithmic features must be disclosed, explainable in plain language, user-adjustable
- Article 3.3: automated decisions affecting users must be explainable
- Existing: acknowledgement emails (`src/services/platform.js`), intro emails

## Acceptance Checks

- Acknowledgement email contains a sentence identifying AI decomposition and matching (e.g. "Your goal was analysed by AI, which identified [helper name] as the closest match.")
- Email includes an opt-out/request-different-match instruction
- `/how-it-works` page or landing page section exists and describes the process without jargon
- No email omits the disclosure

## Explicit Non-Goals

- Per-user opt-out of AI matching (Phase 2)
- Annual audit mechanism (Phase 3)
- Explanation of semantic scoring weights
