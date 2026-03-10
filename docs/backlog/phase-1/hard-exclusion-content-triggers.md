# hard-exclusion-content-triggers

**Phase:** 1 — Foundational
**Article:** 11.1.2 (Hard exclusions are architectural, not optional)
**Status:** done

## Outcome

The goal submission flow (email webhook at `/webhooks/email`) detects content falling into hard exclusion domains and responds with warm referral to specialist services instead of processing the submission as a normal goal. The user receives an email that acknowledges their situation, explains that the platform cannot help in this specific domain, names the appropriate specialist service, and explicitly keeps the door open for goals the platform can help with. The detection applies to: personalised financial investment/pension recommendations, legal reserved activities (conveyancing, probate, litigation conduct), and immigration advice to specific individuals.

## Constraints & References

- Article 11.1.2: hard exclusion must prevent, not merely discourage — cannot rely solely on panel member self-regulation
- Article 11.1.3: warm referral standard — signposting must not terminate the relationship; response must be additive
- Existing: `src/api/webhooks.js` (email inbound handler), `src/services/platform.js` (processGoal)
- Exclusion register: `docs/operations/exclusion-register.md` (depends on: exclusion-register-operational)
- Detection must not false-positive on legitimate goals that mention these topics in passing (e.g. "I want to understand my finances better" is not a hard exclusion trigger)

## Acceptance Checks

- A goal submission containing explicit personalised investment recommendation requests returns a warm referral email, not a decomposition/match flow
- A goal submission containing explicit immigration application advice for the submitter returns a warm referral email
- A goal submission containing general financial information requests (not personalised recommendations) proceeds through normal flow
- Warm referral email: acknowledges the user's situation, names the relevant specialist service with contact detail, does not use language suggesting the user is being turned away
- Hard exclusion detection logic is documented in a decision record or inline comments
- Existing goals unrelated to hard exclusion domains are unaffected

## Explicit Non-Goals

- In-thread detection for panel feature (Phase 2 — requires thread UI)
- Detection of high-risk adjacency domains (sensitive handling, not hard exclusion)
- ML-based content classification (rule-based pattern matching is sufficient at this stage)
- Blocking panel members from sending hard-exclusion content (Phase 2)
