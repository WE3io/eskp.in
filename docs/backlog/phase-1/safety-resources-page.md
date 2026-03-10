# safety-resources-page

**Phase:** 1 — Foundational
**Article:** 11.2.3 (Safety infrastructure designed, not monitored)
**Status:** done

## Outcome

A public page at `/support` contains the full UK signposting library organised by domain, persistently accessible to all users and panel members at all times without authentication. The page is linked from the site footer on every page, from acknowledgement emails, and from the platform's disclosure text. It loads without JavaScript and works on all devices.

## Constraints & References

- Article 11.2.3: crisis and professional support resources must be persistently accessible, not triggered by content detection
- Signposting library source: `docs/operations/exclusion-register.md` §Signposting Library (depends on: exclusion-register-operational)
- Research source: `docs/research/professional-boundaries-and-directory.md` Section 3.3
- Warm referral standard (Article 11.1.3): page framing must not be clinical or alarming; it should feel like a natural extension of the platform's support, not an emergency exit
- Must not require login

## Acceptance Checks

- `/support` returns 200 without authentication
- Page contains all domains from the signposting library with service name, phone number, and URL for each
- Page is organised by domain (mental health crisis, domestic abuse, legal, financial, immigration, etc.)
- Footer on `index.html`, `join.html`, `privacy.html`, `terms.html` links to `/support`
- Acknowledgement email template includes a footer link to `/support`
- Page renders correctly without JavaScript
- Page framing is warm and non-alarming in tone

## Explicit Non-Goals

- In-thread persistent resources panel (Phase 2 — requires thread UI)
- Crisis keyword detection triggering dynamic resource surfacing
- Translations or international resources
