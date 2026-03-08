# emergency-override-protocol

**Phase:** 1 — Foundational
**Article:** 11.2.4 (Emergency override — vital interests basis)

## Outcome

A documented emergency override protocol exists at `docs/operations/emergency-override-protocol.md`. It specifies: the legal basis (DPA 2018 s.15 vital interests), the four conditions that must be met before any override action is taken, the escalation path (immediate panel notification), and the retrospective review requirement. The protocol makes explicit that it is a last resort and that the platform does not design itself as a crisis intervention service. The document is referenced in the privacy policy.

## Constraints & References

- Article 11.2.4: legal basis DPA 2018 s.15; documented assessment; immediate panel notification; retrospective review
- Article 11.2.2: platform must not imply emergency response capabilities it cannot deliver
- This is a documentation task — no technical feature is built here
- The protocol must exist before the platform has any bilateral thread interactions

## Acceptance Checks

- `docs/operations/emergency-override-protocol.md` exists
- Document states the DPA 2018 s.15 vital interests legal basis explicitly
- Document lists the four conditions: (a) imminent threat to life, (b) no other protective mechanism available, (c) legal basis assessed, (d) panel notification plan
- Document includes retrospective review requirement
- Document explicitly states this is a last resort and the platform is not a crisis service
- `public/privacy.html` references the existence of this protocol (does not need to link to the internal document — can describe it in plain language)

## Explicit Non-Goals

- Technical implementation of any override mechanism (the protocol is procedural, not automated)
- Legal review of the vital interests basis (flagged for Sunil/panel)
- Crisis monitoring infrastructure
