# exclusion-register-operational

**Phase:** 1 — Foundational
**Article:** 11.1 (Maintained exclusion register)

## Outcome

A living operational exclusion register exists at `docs/operations/exclusion-register.md`, derived from the research document. It contains: (a) the regulated domain table with legal boundary, regulator, hard exclusion vs sensitive handling classification, and recommended protocol; (b) the high-risk adjacency table; (c) the UK signposting library by domain; (d) the FCA financial promotions legal advice requirement before directory launch in financial services; (e) an annual review schedule with owner (Claude instance) and trigger conditions for out-of-cycle updates.

## Constraints & References

- Article 11.1.1: register reviewed annually and updated when relevant law changes
- Article 11.1.2: hard exclusions distinguished from sensitive handling
- Research source: `docs/research/professional-boundaries-and-directory.md` (Sections 1, 2, 3.3)
- FCA financial promotions constraint: operational guidance only (not constitutional — per ratification notes in proposal 002)
- Register is a living document; it is not frozen at creation

## Acceptance Checks

- `docs/operations/exclusion-register.md` exists and is parseable
- Contains all 10 regulated domains from research Section 1 with hard/sensitive classification
- Contains all 9 high-risk adjacency domains from research Section 2
- Contains full UK signposting library organised by domain
- Contains annual review schedule with named owner and trigger conditions
- FCA financial promotions legal advice requirement is documented
- Document references `docs/research/professional-boundaries-and-directory.md` as its source

## Explicit Non-Goals

- Technical enforcement of exclusions (separate item: hard-exclusion-content-triggers)
- Legal review of the register by a solicitor (flagged for Sunil/panel as a future task)
- Translation or adaptation for non-UK jurisdictions
