# Legitimate Interests Assessment (LIA)

**Document:** Legitimate Interests Assessment
**Platform:** eskp.in
**Controller:** [Sunil Parekh / legal entity — to be confirmed at ICO registration]
**Version:** 1.0
**Date:** 2026-03-10
**Author:** Claude (platform operator)
**Status:** Draft — requires review before first external user

> This LIA documents the basis for processing personal data under UK GDPR Article 6(1)(f) — Legitimate Interests.
> It is required where we rely on legitimate interests as the lawful basis for processing.

---

## Purpose of this document

UK GDPR Art.6(1)(f) permits processing where it is "necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject."

ICO guidance requires a three-part test:
1. **Purpose test** — is there a legitimate interest?
2. **Necessity test** — is processing necessary for that purpose?
3. **Balancing test** — do the controller's interests override the data subject's rights?

---

## Processing activity 1: AI-assisted goal decomposition

### Purpose test

**What is the processing?**
When a user submits a goal, the platform sends the goal text to the Anthropic API (Claude Haiku) for decomposition into structured sub-goals and expertise tags. The response is stored in the database.

**What is the legitimate interest?**
The platform's core purpose is to connect people with helpers who can address their goals. Goal decomposition is necessary to identify what kind of help is needed, which in turn determines which helpers are a good match. Without decomposition, meaningful matching is not possible.

**Is this a "recognised" legitimate interest?**
- Providing a service the user has actively requested (soft opt-in by submitting a goal): yes.
- Improving the quality of service delivery: yes.
- Enabling accurate helper matching: yes — directly serves the user's own interest.

**Conclusion:** Legitimate interest exists ✅

### Necessity test

**Is processing necessary?**
Yes. The platform cannot match a goal to an appropriate helper without understanding what the goal involves. Manual review by a human operator at this stage would not be proportionate. The decomposition prompt is designed to extract only what is needed for matching (sub-goals, tags, complexity level) — it does not attempt to extract additional personal information.

**Could a less privacy-intrusive alternative achieve the same result?**
- Keyword matching alone: insufficient — goals are expressed in natural language; simple keyword matching produces poor results.
- User-provided tags: possible in future as a supplement (TSK-038), but not a complete replacement for decomposition at this stage.
- Human operator review: would require processing the full goal text by a person, which is more intrusive, not less.

**Conclusion:** Processing is necessary ✅

**Data minimisation note:**
- The decompose.js prompt sends the raw goal text to the LLM.
- The match.js step sends only the structured summary and tags (not the raw goal text) — this is a deliberate data minimisation measure (TSK-035, completed 2026-03-09).
- Goal text is stored in the `goals` table. It is not logged, broadcast, or sent to third parties other than the Anthropic API.

### Balancing test

**Whose interests / rights / freedoms might be affected?**
- The user who submitted the goal.

**What is the nature of the data?**
- Goals may contain personal information about the user's life circumstances, aspirations, or challenges.
- Some goals may touch on sensitive domains (health, relationships, finance), though these are subject to additional handling rules (see exclusion-register.md).

**What are the reasonable expectations of the user?**
- A user who voluntarily submits a goal to a goal-matching platform would reasonably expect their goal to be processed in order to find a match. This is the core service they have requested.
- The platform's privacy policy discloses that goals are processed using AI (see Section 3 of privacy.html).

**What is the impact on the data subject?**
- Low–medium. The goal text is processed by a third-party AI system (Anthropic) under a data processing agreement. Anthropic's enterprise API does not use customer data for model training by default.
- The user receives a direct benefit: a matched helper.
- The risk of harm from this processing is low: the data is not used for advertising, profiling, or sold to third parties.

**Potential for objection:**
Users have the right to object under UK GDPR Art.21. The platform must honour objection requests. Currently, the only alternative to AI processing is not receiving the matching service. This should be disclosed.

**Could this processing cause harm if compromised?**
A breach of the goals table would expose personal aspirations and challenges. Mitigation: data is encrypted at rest, limited retention policy (goals should be deleted when no longer serving the user's purpose — see TSK-044 for erasure cascade verification), and access is restricted to the application.

**Conclusion:** Legitimate interests not overridden ✅

**Overall conclusion for Activity 1:** Lawful basis under Art.6(1)(f) is established. Processing is necessary for the core service and user expectations are met. Privacy policy disclosure is in place.

---

## Processing activity 2: AI-assisted helper matching

### Purpose test

**What is the processing?**
The platform sends a structured goal summary and expertise tags (not the raw goal text) to the Anthropic API (Claude Haiku) to score relevance against registered helper profiles.

**Legitimate interest:** Same as Activity 1 — providing the core service (finding a relevant helper). Directly serves the user's interest.

**Conclusion:** Legitimate interest exists ✅

### Necessity test

**Is processing necessary?**
Yes. Tag-overlap scoring alone produces false positives (a helper with "finance" may not be appropriate for all finance goals). Semantic relevance scoring significantly improves match quality, which directly benefits users. The alternative (tag-overlap only) is functional but lower quality — not proportionate to the data risk.

**Data minimisation:**
- Only goal summary and tags are sent — raw goal text is excluded.
- Helper profiles sent contain: name, bio, expertise tags, experience — no financial, health, or sensitive personal data about helpers.

**Conclusion:** Processing is necessary ✅

### Balancing test

**Impact assessment:**
- Low impact. The matching step processes a structured summary (not raw personal narrative) against helper profiles that helpers have voluntarily created and consented to.
- The user's reasonable expectation is that their goal summary will be compared against helpers — this is the service.

**Conclusion:** Legitimate interests not overridden ✅

**Overall conclusion for Activity 2:** Lawful basis under Art.6(1)(f) established.

---

## Processing activities relying on consent or contract

The following processing activities rely on **consent (Art.6(1)(a))** or **contract (Art.6(1)(b))** rather than legitimate interests, and are therefore outside the scope of this LIA:

| Activity | Lawful basis |
|---|---|
| Storing user email address and goal | Contract (performance of service the user has requested) |
| Sending introduction email to helper | Contract |
| Sending acknowledgement email to user | Contract |
| Processing payment via Stripe | Contract |
| Storing feedback | Consent (explicit submission) |
| Helper profile storage | Contract (helper agreement to be on platform) |

---

## Summary

| Processing activity | LI established? | Necessary? | Balanced? | Lawful? |
|---|---|---|---|---|
| AI goal decomposition (Anthropic API) | ✅ | ✅ | ✅ | ✅ Art.6(1)(f) |
| AI helper matching (Anthropic API) | ✅ | ✅ | ✅ | ✅ Art.6(1)(f) |

---

## Required actions

- [x] Disclose AI processing in privacy policy (done — TSK-037, 2026-03-09)
- [ ] Add right-to-object mechanism for users who do not want AI processing (TSK-044 scope)
- [ ] Confirm Anthropic DPA covers UK GDPR requirements (TSK-045)
- [ ] Review this LIA annually or when processing activities change

---

## Review schedule

| Review | Due | Owner |
|---|---|---|
| Annual review | 2027-03-10 | Claude instance |
| Post-first-external-user review | After first user onboarded | Claude instance |
| On material change to processing | As needed | Claude instance |

---

*This LIA was prepared by the Claude platform operator and should be reviewed by a qualified data protection professional before the platform opens to external users. It is stored as part of the platform's Article 30 ROPA documentation obligations.*
