# Data Protection Impact Assessment (DPIA)

**Document:** Data Protection Impact Assessment
**Platform:** eskp.in
**Controller:** [Sunil Parekh / legal entity — to be confirmed at ICO registration]
**Version:** 1.0
**Date:** 2026-03-10
**Author:** Claude (platform operator)
**Status:** Draft — requires DPO/legal review before first external user
**Trigger:** Art.35 UK GDPR — systematic use of AI for processing personal data

---

## 1. Overview and purpose

This DPIA assesses the data protection risks associated with eskp.in's use of AI systems (Claude Haiku via the Anthropic API) to:
1. Decompose user-submitted goals into structured sub-goals and expertise tags
2. Score helper relevance against goal summaries

These activities involve **automated processing of personal data** and represent a **systematic use of new technology** as described in Art.35(1) UK GDPR. A DPIA is therefore required before the processing begins at scale.

**Scope:** This DPIA covers the goal decomposition and helper matching pipelines as implemented at the time of writing. It does not cover payment processing (Stripe), email delivery (Resend), or infrastructure hosting (Hetzner/Cloudflare), which are each subject to their own processor agreements.

---

## 2. Description of processing

### 2.1 What data is processed

| Data element | Source | Used in decomposition? | Used in matching? | Stored? |
|---|---|---|---|---|
| Goal text (free text) | User submission | ✅ Yes | ❌ No (minimised — TSK-035) | ✅ Yes (goals table) |
| Goal summary (AI-generated) | Anthropic API | — | ✅ Yes | ✅ Yes (goals table) |
| Expertise tags (AI-generated) | Anthropic API | — | ✅ Yes | ✅ Yes (goals table) |
| User email address | User submission | ❌ No | ❌ No | ✅ Yes (users table) |
| Helper name, bio, tags | Helper onboarding | ❌ No | ✅ Yes | ✅ Yes (helpers table) |

### 2.2 How data flows

```
User submits goal (POST /goals)
    │
    ▼
goals table: raw goal text stored
    │
    ▼
decompose.js: goal text → Anthropic API (Claude Haiku)
    │         → structured JSON: summary, sub_goals[], tags[], complexity
    │         → validated and stored in goals table
    ▼
match.js: goal summary + tags → Anthropic API (Claude Haiku)
    │     (raw goal text NOT sent — data minimisation)
    │     → relevance scores for each helper
    ▼
Best match selected → introduction emails sent (Resend)
    │
    ▼
emails table: records of communications stored
```

### 2.3 Automated decision-making

The helper matching process makes a **recommendation** (selects the best-matched helper) which triggers a material action (sending an introduction email to the helper). This constitutes a form of automated decision-making.

**Is it solely automated?** Currently yes — no human review step before the introduction email is sent.

**Does it produce legal or similarly significant effects?** The decision to route a user's goal to a specific helper could affect which help they receive. However:
- The effect is not adverse to the user — it determines who helps them, not whether they get help.
- The user retains control: they can ignore the introduction, seek other help, or submit a different goal.
- The helper is not compelled to help.

**Assessment:** This falls below the threshold for Art.22 (solely automated decisions with legal/significant effects) but the platform should disclose the automated nature of matching and provide a mechanism to contest or request human review (see TSK-044 scope).

---

## 3. Purposes and lawful basis

| Processing step | Purpose | Lawful basis |
|---|---|---|
| Storing goal text | Delivering the matching service | Art.6(1)(b) — contract |
| AI decomposition via Anthropic | Structuring goals for matching | Art.6(1)(f) — legitimate interests (see lia.md) |
| AI matching via Anthropic | Finding relevant helpers | Art.6(1)(f) — legitimate interests (see lia.md) |
| Sending emails | Delivering the match result | Art.6(1)(b) — contract |

---

## 4. Necessity and proportionality

**Is the processing limited to what is necessary?**

- Goal text is sent to the LLM only for decomposition. It is not sent during matching (summary only).
- LLM prompts are structured to extract the minimum needed (summary, sub-goals, tags) and do not request additional personal details.
- The Anthropic enterprise API does not use customer data for model training by default (as stated in Anthropic's API terms).
- No special category data (Art.9) is deliberately collected. If a goal touches on health, mental health, or other sensitive domains, the hard exclusion / sensitive handling rules in `exclusion-register.md` apply.

**Could a less intrusive method achieve the same purpose?**
See lia.md Necessity test. Tag-only matching is possible but produces materially lower quality matches. The current approach is proportionate.

---

## 5. Risk identification

### Risk 1: Data sent to Anthropic API — international transfer / processor

**Description:** Goal text (and summaries) are sent to Anthropic's API. Anthropic is a US company. This constitutes an international data transfer to a third country under UK GDPR Chapter V.

**Likelihood:** Certain (this happens on every goal submission)
**Severity:** Medium — exposure of personal goal text to a US processor

**Current mitigations:**
- Anthropic has EU Standard Contractual Clauses (SCCs) / UK IDTA equivalents in their API Terms of Service.
- Enterprise API terms state Anthropic does not use API input/output for model training.
- Data minimisation: matching step sends summary only, not raw goal text.

**Residual risk:** Low — standard commercial processor relationship with appropriate safeguards.

**Action required:** Confirm UK IDTA or equivalent is in place with Anthropic (TSK-045).

---

### Risk 2: Goal text may contain special category data (Art.9)

**Description:** Users may include health information, religious beliefs, political opinions, or other special category data in their goal text (e.g., "I want to manage my diabetes better").

**Likelihood:** Medium — platform does not restrict goal topics.
**Severity:** High — special category data requires explicit consent (Art.9(2)(a)) or other specific basis.

**Current mitigations:**
- Hard exclusion rules in `exclusion-register.md` and `hard-exclusion.js` detect and route medical/psychological goals to appropriate signposting rather than AI-powered matching.
- Privacy policy discloses that goal text is processed by AI.

**Residual risk:** Medium — users may submit goals with incidental special category data that is not caught by the exclusion keyword list.

**Recommended additional mitigation:**
- Add a prompt instruction to the decompose.js LLM prompt to avoid including special category data in the structured output (i.e., the AI should generalise rather than reproduce sensitive details in the summary/tags).
- Generate task: TSK-048.

**Action required:** Implement TSK-048 before opening to external users.

---

### Risk 3: Goal text stored in database — breach risk

**Description:** Raw goal text is stored in the `goals` table. A database breach would expose personal narratives including goals, challenges, and life circumstances.

**Likelihood:** Low — server is behind nginx + Cloudflare, PostgreSQL not exposed to internet.
**Severity:** High — goal text is personal and potentially sensitive.

**Current mitigations:**
- PostgreSQL data encrypted at rest (Hetzner disk encryption — to be confirmed).
- Database not exposed to public internet (Docker network only).
- Goal text not logged to application logs.
- Off-site backup not yet implemented (blocked on S3 credentials — TSK-013).

**Residual risk:** Medium until off-site backup is implemented (backup itself is a breach vector if not encrypted).

**Action required:**
- Confirm Hetzner disk encryption is enabled (add to infrastructure checklist).
- Implement retention policy: delete goal data after N days (suggest 90 days after last activity — TSK-044).
- Ensure off-site backup is encrypted at rest (TSK-013).

---

### Risk 4: Helper profile data used in AI matching without explicit consent

**Description:** Helper profiles (name, bio, expertise tags) are sent to the Anthropic API during the matching step. Helpers consent to being on the platform but may not explicitly understand their profile is processed by an AI.

**Likelihood:** Certain (every matching call).
**Severity:** Low — helper profile data is the professional profile they created for the purpose of being matched.

**Current mitigations:**
- join.html discloses that the platform uses AI-assisted matching.
- Helpers voluntarily create profiles for the purpose of being connected with goal-seekers.

**Residual risk:** Low.

**Action required:** Ensure join.html and helper onboarding email clearly state that profile data is used in AI-assisted matching. (Review against current join.html content.)

---

### Risk 5: Automated matching without human review

**Description:** The platform currently selects and contacts a helper without a human reviewing the match quality or appropriateness.

**Likelihood:** Certain (current architecture).
**Severity:** Low–Medium — a poor match is a service quality issue, not a data protection harm. However, if a goal is misclassified (e.g., a sensitive goal is not caught by the exclusion check and is routed to a peer helper), the harm could be higher.

**Current mitigations:**
- Hard exclusion check runs before matching. If triggered, the goal is not routed.
- Match quality is scored — low-quality matches could be thresholded in future.

**Residual risk:** Medium for edge cases where exclusion logic does not catch a sensitive goal.

**Recommended additional mitigation:**
- For goals touching sensitive-handling domains (not hard exclusion but sensitive), consider adding a human review flag before sending introduction emails.
- Generate task: TSK-049.

---

## 6. Risk summary

| Risk | Likelihood | Severity | Residual | Mitigated? |
|---|---|---|---|---|
| International transfer (Anthropic) | Certain | Medium | Low | Mostly — confirm IDTA (TSK-045) |
| Special category data in goals | Medium | High | Medium | Partially — add prompt instruction (TSK-048) |
| Goal data breach | Low | High | Medium | Partially — needs retention policy + backup encryption |
| Helper profile in AI matching | Certain | Low | Low | ✅ Yes |
| Automated matching w/o review | Certain | Med | Medium | Partially — flag sensitive goals (TSK-049) |

**Overall DPIA assessment:** Processing can proceed with current controls, subject to the actions listed below. The platform should not open to external users until TSK-048 (special category data prompt instruction) and TSK-039 (ICO registration) are complete.

---

## 7. Required actions before external users

| Ref | Action | Priority |
|---|---|---|
| TSK-039 | ICO registration | P1 — ESCALATED to Sunil 2026-03-10 |
| TSK-045 | Confirm processor DPAs (Anthropic, Resend, Stripe, Hetzner, Cloudflare) | P3 |
| TSK-048 | Add prompt instruction to decompose.js to generalise/avoid reproducing special category data in structured output | P2 |
| TSK-049 | Flag sensitive-domain goals for human review before sending introduction email | P2 |
| TSK-044 | Implement data retention policy + right-to-erasure cascade | P3 |
| TSK-013 | Off-site encrypted backup | P2 — BLOCKED on S3 credentials |

---

## 8. Consultation

This DPIA was prepared by the Claude platform operator. It should be reviewed by:
- [ ] Sunil Parekh (data controller) — confirm lawful basis decisions
- [ ] A qualified data protection professional — before first external user

---

## 9. Review schedule

| Review | Due | Trigger |
|---|---|---|
| Before first external user | Before TSK-012 | — |
| Annual review | 2027-03-10 | — |
| On material change to AI pipeline | As needed | New model, new processing step |
| Post-incident review | After any breach | Art.33/34 obligation |

---

*This DPIA is a living document. Update when processing activities change materially. File alongside lia.md and ropa.md in docs/operations/.*
