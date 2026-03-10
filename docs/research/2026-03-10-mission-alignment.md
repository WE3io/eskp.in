# Research: Mission Alignment Review

**Question:** Does the current platform state align with Constitution Articles 1 and 3?
**Date:** 2026-03-10
**Session:** Self-directed rotation — Mission alignment category
**Status:** Complete

---

## Method

Re-read CONSTITUTION.md Articles 1 and 3, compared against current codebase and operations.
Reviewed `docs/state/recent-decisions.md` for any tensions with constitutional principles.

---

## Findings

### Article 1 (Purpose) — mostly aligned

**1.1 Mission — gap: no external users yet**
The platform exists to help people achieve goals by connecting them with helpers. The core mechanism works (email → decompose → match → introduce). But there are zero external users. This is the single biggest gap between current state and the mission — and it's blocked on one thing: ICO registration (TSK-039, escalated to Sunil). Once that's done, there is no technical blocker to opening.

**1.4 "Purpose takes precedence over revenue"**
The DPIA sensitive-domain work (TSK-049) demonstrates this principle operating correctly: we built a human-review gate that delays potential revenue (no payment link for sensitive goals) because doing otherwise would exploit vulnerability. Article 3.1.1 and 1.4 are being observed.

### Article 3.1 (Foundational Principles) — mostly aligned

**3.1.1 "Never exploit vulnerability" — ✅ being observed**
- Hard exclusion architecture (TSK-014): regulated domains get warm referral, not automation
- Sensitive-domain flagging (TSK-049): crisis/abuse goals held for human review, not auto-matched
- Matching is expertise-overlap based, not engagement-optimised

**3.1.2 "Privacy is structural" — partial gap**
- Structured output from decomposition (summaries, tags, urgency) is the primary record used for matching: ✅
- **But:** `raw_text` is stored verbatim in the goals table, indefinitely. This is raw personal narrative. Art.3.2 says to store "abstracted, structured forms rather than raw personal narratives."
- Current justification: raw_text is needed for debugging and the future clarification loop (TSK-034). This is a legitimate operational reason to retain it — but there should be a defined retention period and a procedure for deletion once decomposition is complete and stable.
- **Task generated:** TSK-054 — raw_text retention policy.

**3.1.3 "Transparency by default" — partial gap**
- Privacy policy updated (TSK-037) to disclose AI decomposition and matching: ✅
- Algorithmic transparency disclosure on the platform UI: ❌ (TSK-023 is still open)
- Email acknowledgements show the decomposed summary ("here's how we understood your goal"): ✅ — this is implicit transparency
- AI disclosure in emails: the acknowledgement says "The eskp.in team" without saying "this decomposition was done by AI". Privacy policy covers this at policy level. But for a user who never reads the privacy policy, there is an implicit suggestion that a human read their goal. This is worth addressing.
- **Task generated:** TSK-055 — add a brief AI disclosure line to acknowledgement emails.

**3.1.4 "Matching serves the user" — ✅ aligned**
The matching function optimises for expertise overlap and semantic relevance. There is no engagement metric, no interaction volume optimisation. The only incentive is quality of match (which determines whether users return and whether the model improves).

**3.1.5 "Consent is specific and revocable" — gap**
- No account deletion flow (TSK-021 is open P3)
- No data export endpoint (TSK-022 is open P3)
- No unsubscribe mechanism in outbound emails
- These are constitutional obligations, not nice-to-haves. They should be elevated from P3 to P2 before external users.
- **Recommendation:** promote TSK-021/022 to P2.

### Article 3.2 (Data Handling) — partial gap

- Abstracted forms: the decomposed JSON is the structured record ✅
- Raw_text retention: no defined policy — see above
- Separate identity from intent: goal_id/user_id separation exists in schema ✅
- Encrypt at rest/transit: Cloudflare SSL (transit) ✅; DB-level encryption at rest: ❌ not implemented. Server disk is unencrypted. This is a known gap for Phase 1 but should be tracked.
- Delete what isn't needed: no automated data deletion procedures exist. Feedback table has `processed` flag but no deletion. Goals have no expiry. ❌
- **Task generated:** TSK-056 — design and implement basic data retention/deletion automation.

### Article 3.3 (AI Ethics) — gap found

- "Must disclose that it is an AI when interacting with users"
- Acknowledgement emails signed "The eskp.in team" without explicit AI disclosure
- Privacy policy discloses AI processing, but this only covers users who read it
- The UK AI Transparency best practice (and Art.3.3) requires disclosure at the point of interaction
- **Task generated:** TSK-055 (merged with transparency gap above)

### Article 3.4 (User-Driven Development) — pre-condition not met

- No external users → no feedback to process (circular dependency)
- Feedback infrastructure is in place (feedback.html, POST /webhooks/feedback, DB table) ✅
- Public roadmap: does not yet exist as a public document. The task queue and sprint files are internal and not published.
- **Task generated:** TSK-057 — create a simple public roadmap page (or section on the blog).

---

## Summary of Gaps

| Principle | Status | Task |
|-----------|--------|------|
| External users enabled | ❌ Blocked on ICO reg | TSK-039 (Sunil action) |
| AI disclosure in emails | ❌ Missing | TSK-055 |
| raw_text retention policy | ❌ Missing | TSK-054 |
| Account deletion flow | ❌ Missing | TSK-021 (promote to P2) |
| Data export endpoint | ❌ Missing | TSK-022 (promote to P2) |
| Algorithmic transparency UI | ❌ Missing | TSK-023 |
| DB encryption at rest | ❌ Missing | known Phase 1 gap |
| Data retention/deletion automation | ❌ Missing | TSK-056 |
| Public roadmap | ❌ Missing | TSK-057 |
| Hard exclusion architecture | ✅ Implemented | TSK-014 |
| Sensitive domain flagging | ✅ Implemented | TSK-049 |
| AI processing disclosed in policy | ✅ Implemented | TSK-037 |
| Matching serves user (not engagement) | ✅ Implemented | — |

---

## Tasks Generated

- **TSK-054** (P2): Define and implement raw_text retention policy — delete or anonymise raw_text after N days or after decomposition is verified stable. UK GDPR Art.5(1)(e) storage limitation principle.
- **TSK-055** (P2): Add AI disclosure line to acknowledgement emails — "Your goal was processed by our AI to understand your needs" or similar. Art.3.3, UK GDPR Art.22 transparency obligations.
- **TSK-056** (P3): Design basic data retention/deletion automation — goals with no activity after X months should be auto-closed and data minimised.
- **TSK-057** (P3): Create public roadmap page — simple HTML page at /roadmap.html listing what's been built, what's being built, and what's planned. Art.3.4 User-Driven Development.
- Promote **TSK-021** and **TSK-022** from P3 to P2 (constitutional rights, not nice-to-haves).

---

*Research source: CONSTITUTION.md Articles 1 and 3; current codebase; docs/state/recent-decisions.md*
