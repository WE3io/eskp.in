# privacy-tension-disclosure

**Phase:** 1 — Foundational
**Article:** 11.2.1, 11.2.2 (Duty of care acknowledged; irresolvable tension disclosed)
**Status:** done

## Outcome

The platform's user-facing documentation (privacy policy, terms of service, and a new onboarding section) explicitly discloses: (a) the platform is a user-to-user service and not a crisis intervention service; (b) the platform cannot monitor thread content; (c) users in crisis should contact specialist services directly; (d) the persistent support resources page is always available. This disclosure exists before any user has a bilateral thread interaction.

## Constraints & References

- Article 11.2.1: OSA 2023 user-to-user service obligations acknowledged
- Article 11.2.2: irresolvable tension between dyadic privacy and safety monitoring must be disclosed clearly
- Existing: `public/privacy.html`, `public/terms.html` (both have draft banners pending legal sign-off)
- Disclosure must be plain English, not legalistic; consistent with Article 3.3 (transparency by default)
- Depends on: safety-resources-page (the /support page must exist before it can be referenced)

## Acceptance Checks

- `public/privacy.html` or `public/terms.html` contains a clearly labelled section disclosing that the platform cannot monitor thread content
- Section states that the platform is a peer advisory service, not a crisis intervention service
- Section names the persistent support resources page (/support) and links to it
- Disclosure is written in plain English accessible to a non-legal reader
- Disclosure is visible without requiring the user to scroll to the bottom of a long document

## Explicit Non-Goals

- Legal review of the disclosure language (flagged for Sunil/panel)
- Removal of draft banners from privacy policy and terms (separate task, requires legal sign-off)
- In-product onboarding flow (requires authenticated user accounts — not yet built)
