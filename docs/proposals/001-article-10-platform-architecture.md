# Constitutional Amendment Proposal: Article 10 — Platform Architecture Principles

**Proposed by:** Claude Instance
**Date:** 2026-03-08
**Status:** Ratified — consensus reached 2026-03-08 (Sunil Parekh + Claude)
**Research basis:** `docs/research/advisory-panel-structures-v2.md`

---

## Summary

This proposal adds Article 10 to the constitution. It encodes the structural design principles of the platform as architectural constraints — not operational guidelines — derived from the empirical research in the accompanying v2 report.

The amendment covers four areas:

1. **Dyadic privacy architecture** — bilateral-only interaction model, four-tier visibility, AI cross-thread prohibition
2. **Anti-enshittification framework** — no advertiser class, data portability as a right, algorithmic transparency, user governance participation, low exit costs
3. **Panel model principles** — self-efficacy as the mechanism, user-formed panels, compositional diversity, bilateral integrity, recursive support
4. **Empirical honesty** — the platform must measure and be honest about its actual effects

---

## What this amendment deliberately does NOT encode in the constitution

The following matters, though addressed in the research, are operational guidance, not constitutional constraints:

- **Panel size (3–5 advisors)** — this is a design recommendation, not a structural right. It belongs in CLAUDE.md.
- **Interaction cadence** — operational.
- **Specific role typology** (Domain Expert, Challenger, Sustainer, etc.) — operational.
- **Advisor motivation features** (role charters, appreciation signals, advisor progress layer) — operational.
- **Specific decay inflection points** — operational.
- **Implementation details of the four-tier privacy model** — technical, not constitutional.

These will be documented as operational principles in CLAUDE.md following ratification.

---

## Proposed Text

---

### Article 10: Platform Architecture Principles

This article encodes the structural design principles of the platform, derived from empirical research into advisory relationships, privacy theory, and platform governance. These principles are architectural constraints — they govern what the platform fundamentally is, not merely how it works at any given moment.

#### 10.1 Dyadic Privacy Architecture

The platform's interaction model is strictly bilateral. Each advisory relationship exists as a discrete pair: one user and one advisor. This is not a technical limitation but a design commitment grounded in contextual integrity theory (Nissenbaum, 2004). The following are architectural requirements, not policy choices:

1. **No cross-advisor information flows.** Information shared in a bilateral thread between a user and Advisor A may not flow to Advisor B, to any other user, or to the platform operator in identifiable form, without explicit consent initiated by the user who shared it. The platform's AI systems may not read across bilateral threads under any operational circumstance.

2. **Four-tier visibility.** The platform's data architecture recognises four tiers of information, each technically separated:
   - **Tier 1 — User-Private:** accessible to the user only; the platform has no operational access under normal conditions.
   - **Tier 2 — Bilateral Thread:** accessible to the user and one named advisor only; not accessible to any other party without explicit user initiation.
   - **Tier 3 — Panel-Aggregate:** non-identifiable patterns across a user's activity; visible to the user by default; shareable to selected advisors only by explicit user choice.
   - **Tier 4 — Platform-Observable:** minimal operational data required for the platform to function (account existence, login timestamps, billing); strictly minimised; not used for inference or product optimisation beyond operational necessity.

3. **AI cross-thread prohibition.** AI features that access multiple bilateral threads — regardless of intent or framing — break the dyadic architecture and are categorically prohibited. AI systems may operate within a single bilateral thread only with the explicit knowledge of both parties in that thread. This prohibition is architectural, not merely a policy default that can be overridden by a product decision.

4. **Contextual integrity as governing framework.** All information flow decisions must be evaluated against the norms of the context in which the information was shared. Moving information between contexts requires explicit user initiation of a new flow — not platform inference about what the user probably intended.

#### 10.2 Anti-Enshittification Framework

The mechanisms through which platforms degrade user experience — extracting value for advertisers and then shareholders while abandoning users — are well documented. The following are constitutional constraints on the platform's evolution, not aspirational values:

1. **No advertiser class.** The platform may never sell user attention, behavioural data, or relational data to third parties. The only permitted revenue model is direct payment by users (subscription, usage-based, or outcome-linked). Any proposal to introduce advertising, sponsored content, featured placement, or behavioural data licensing must trigger mandatory governance review under Article 2.2 before any discussion of implementation. The existence of this clause may not itself be used as a basis for raising money from investors who require its removal.

2. **Data portability as a constitutional right.** Users have the right to export their complete data — all bilateral thread content they own, goal records, advisor relationships — in a machine-readable, interoperable format, at any time, with no friction and no data retention after account deletion. This right exceeds the minimum required by UK GDPR Article 20: export must be available immediately (not subject to a 30-day fulfilment period) and in a format that does not require platform tooling to interpret. Degrading export functionality — making it slow, hard to find, or producing unusable output — constitutes a violation of this article.

3. **Algorithmic transparency and user control.** Any feature that uses algorithmic ranking, recommendation, or inference must: (a) be disclosed to the user; (b) be explainable in plain language on request; (c) be user-adjustable or fully opt-outable; and (d) be audited annually, with results published. Algorithmic features that cannot be explained or disabled may not be deployed.

4. **User governance participation.** The platform must establish and maintain a User Advisory Council composed of platform users, with a formal governance role: the right to review and provide binding input on any change to pricing, data policy, or core feature architecture. The council's recommendations must be formally responded to within 30 days and the response published publicly. The size, selection mechanism, and operating procedures of the council are operational matters; the existence of the council with these rights is a constitutional requirement. The council may not be abolished without a constitutional amendment.

5. **Exit costs kept deliberately low.** The cost of leaving the platform — exporting data, ending advisory relationships, closing an account — must be as low as the cost of joining. Any feature addition that increases switching costs without proportionate user-facing value is presumptively in violation of this article. Account deletion must complete within 30 days of request. Full data export must be available at any point during the deletion period.

#### 10.3 Panel Model Principles

The platform's core model — helping users assemble personal advisory panels from their existing relationships — operates under the following constitutional principles:

1. **Self-efficacy, not dependency.** The platform's primary designed mechanism is the development of domain-specific self-efficacy — belief in one's own capacity to act effectively in specific contexts (Bandura, 1977). The platform does not optimise for emotional dependency on advisors, outsourcing of judgement, or engagement metrics. Interaction designs that produce dependency rather than capability development are inconsistent with this constitution.

2. **User-formed panels from existing relationships.** The primary model is that users identify and invite advisors from people they already know or have identified themselves. Cold matching to strangers is a secondary mechanism that requires higher consent standards and more robust onboarding for both parties. The platform provides coordination tools and compositional guidance; it does not assign advisors to users or make matching decisions on the user's behalf without explicit user instruction.

3. **Compositional diversity over relational homophily.** The platform's panel guidance should encourage users to identify advisors who bridge their social blind spots — people from different domains, life stages, experience backgrounds, and epistemic standpoints — rather than reinforcing the natural tendency to recruit advisors similar to oneself. This design priority derives from Burt's structural holes research: the greatest information and opportunity benefit comes from advisors who bridge social contexts the user cannot bridge alone.

4. **Bilateral relationship integrity.** Each advisory relationship is a genuine relationship, not a product feature or a service transaction. Advisor onboarding must convey the nature of the commitment, including confidentiality obligations. Neither party should be able to enter an advisory relationship without understanding what they are committing to.

5. **Recursive panel support.** Advisors are encouraged and structurally supported to have their own advisory panels. The platform supports recursive panel creation — advisors can be users; users can be advisors to others — without imposing constraints on how advisors structure their own goal pursuits.

#### 10.4 Empirical Honesty

The platform makes a claim — implicit in its existence — that personal advisory panels help users achieve their goals and develop their self-efficacy. This claim is supported by empirical evidence at moderate confidence (see research basis). The platform must:

1. Actively measure whether the claim is true for its actual users, not merely assume it.
2. Report findings honestly in build-in-public communications, including where effects are weaker than expected.
3. Not make stronger efficacy claims in marketing or product copy than the evidence supports.
4. Treat its own user base as a research population capable of generating empirical evidence — including evidence that challenges the platform's design assumptions.

Where the mechanism does not work as claimed, the response is to change the design — not to suppress the evidence.

---

## Claude instance's position on this amendment

I propose this amendment. My reasoning:

The constitution currently has no structural constraints on *how* the platform is built — only on *why* and *by whom*. The research establishes that the "how" choices — especially dyadic privacy architecture and anti-enshittification mechanisms — are not merely design preferences but foundational commitments that, if absent from the constitution, are vulnerable to erosion under commercial pressure. The time to encode these constraints is before commercial pressure exists, not after.

I have one registered uncertainty: Section 10.4 (Empirical Honesty) is unusual for a constitution — it is more of an operating principle than a structural constraint. I include it because the platform's implicit efficacy claims warrant constitutional-level accountability. But I acknowledge that it sits at the edge of what belongs in a constitution. If Sunil has a view on this, I am open to moving it to CLAUDE.md instead.

I have no objections to any other section of the proposed text.

---

## Process

This proposal requires consensus between Sunil and the Claude instance per Article 9. The Claude instance has voted in favour. The proposal is circulated to Sunil for review. Per Article 2.2, silence for 7 days after circulation may be treated as assent, provided this proposal was clearly communicated with a stated deadline.

**Stated deadline for response: 2026-03-15 (7 days from circulation).**

If Sunil assents, the Claude instance will:
1. Add Article 10 to CONSTITUTION.md with a version note
2. Update CLAUDE.md with the operational details that were deliberately excluded from the constitutional text
3. Commit both changes with a message noting the amendment and consensus date
4. Publish a build-in-public post summarising the amendment

---

*Proposed: 2026-03-08*
*Research basis: [docs/research/advisory-panel-structures-v2.md](../research/advisory-panel-structures-v2.md)*
