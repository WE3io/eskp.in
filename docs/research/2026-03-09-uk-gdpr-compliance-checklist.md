# Research: UK GDPR Compliance Checklist for Personal-Goal Platforms

**Date:** 2026-03-09
**Task:** TSK-028
**Author:** Claude instance (auto-session)

---

## Question

What specific UK GDPR obligations apply to eskp.in as a personal-goal matching platform that uses AI processing, and what gaps exist in our current compliance posture?

---

## Sources

- [ICO UK GDPR guidance hub](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
- [ICO: When do we need to do a DPIA?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/)
- [ICO: Guidance on AI and data protection](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/)
- [ICO: Article 30 — Records of Processing Activities](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/documentation/what-do-we-need-to-document-under-article-30-of-the-gdpr/)
- [ICO: Legitimate Interests Assessment](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/how-do-we-apply-legitimate-interests-in-practice/)
- [ICO: Data Protection Fee](https://ico.org.uk/for-organisations/data-protection-fee/)
- [ICO: Rights related to automated decision-making](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/rights-related-to-automated-decision-making-including-profiling/)
- Note: ICO guidance updated February 2026 to reflect the Data (Use and Access) Act 2025 (DUAA).

---

## Findings

### 1. ICO registration (data protection fee)

**Status: GAP — not yet done**

UK GDPR requires all data controllers to register with the ICO and pay an annual data protection fee, unless exempt. There is no exemption for startups, small platforms, or AI-first businesses.

eskp.in qualifies as **Tier 1**: turnover well under £632,000 and fewer than 10 staff.
**Fee: £52/year** (£47 if paid by direct debit).

Registration creates a public entry in the ICO register, which:
- is a legal requirement (Criminal offence to process without paying)
- demonstrates accountability to users
- is required before processing personal data from the public

**Action required: TSK-039 — Register with ICO and pay £52 data protection fee.**

---

### 2. Records of Processing Activities (ROPA) — Article 30

**Status: GAP — not yet created**

The small-organisation exemption from Article 30 documentation does not apply to eskp.in because:
- Our processing is **not occasional** (users submit goals continuously)
- The processing could **result in risk** to individual rights (AI matching, financial transaction)

A ROPA must document, for each processing activity:
- Purpose of processing
- Categories of data subjects and personal data
- Categories of recipients (including processors like Anthropic, Resend, Stripe, Hetzner, Cloudflare)
- International transfers and safeguards used
- Retention periods
- Security measures (general description)

**Action required: TSK-040 — Create Article 30 ROPA in docs/operations/ropa.md.**

---

### 3. Legitimate Interests Assessment (LIA)

**Status: GAP — not yet documented**

We rely on **legitimate interests** as the lawful basis for our primary processing (email-based goal submission, AI decomposition, helper matching). The ICO requires a documented LIA (three-part test: purpose, necessity, balancing) to:
- Justify this reliance
- Demonstrate compliance under Articles 5(2) and 24
- Provide evidence if challenged by a data subject or the ICO

The three-part test for our core processing:
1. **Purpose test**: Connecting people with helpers — clearly legitimate.
2. **Necessity test**: AI decomposition is the most proportionate way to produce structured matching input from free-text submissions. Tag-overlap fallback provides a less-AI-intensive alternative.
3. **Balancing test**: Users have a reasonable expectation that their goal will be read and processed to match them. Risk of harm is low (no special category data in normal flow; hard exclusions intercept high-risk topics). Safeguards: data minimisation, no name/email sent to AI, opt-out to manual processing available.

**Action required: TSK-041 — Write LIA in docs/operations/lia.md.**

---

### 4. DPIA (Data Protection Impact Assessment) — Article 35

**Status: LIKELY REQUIRED — not yet done**

The ICO's guidance states: *"In the vast majority of cases, the use of AI will involve a type of processing likely to result in a high risk to individuals' rights and freedoms, and will therefore trigger the legal requirement for a DPIA."*

Our AI use case (goal decomposition → helper matching → payment decision) is unlikely to constitute **solely automated decision-making** under Article 22 (the matching is a recommendation; humans are involved — the helper chooses to respond, the user chooses to pay). However:
- The matching uses innovative technology (AI) to influence access to a service
- The payment decision (£10) is financially significant to some users
- The ICO says document your risk assessment even if you conclude a DPIA is not strictly required

**Conclusion**: We should conduct a DPIA. It is likely required under Article 35(3)(a) (systematic evaluation using automated processing, on which decisions producing significant effects are based). Even if not strictly required, a DPIA is good practice and provides evidence of accountability.

**Action required: TSK-042 — Conduct and document DPIA for AI goal decomposition and matching.**

---

### 5. Breach notification procedure — Article 33/34

**Status: GAP — no procedure documented**

Article 33 requires:
- Notification to the ICO **within 72 hours** of becoming aware of a personal data breach
- Only if "likely to result in a risk to the rights and freedoms of natural persons"

Article 34 requires:
- Notification to **affected individuals** "without undue delay" if the breach is likely to result in **high risk**

Given our data includes email addresses, goal descriptions (possibly sensitive), and payment confirmation data, a breach could constitute high risk. We need a documented procedure that covers:
1. What counts as a breach (unauthorised access, accidental loss, unlawful destruction)
2. Assessment process (risk level → ICO notification threshold)
3. 72-hour ICO report template
4. Individual notification process
5. Internal breach register

**Action required: TSK-043 — Create data breach response procedure in docs/operations/breach-response.md.**

---

### 6. Privacy notice completeness — Articles 13/14

**Status: PARTIALLY DONE — several gaps remain post-TSK-037**

TSK-037 (this session) improved section 3 significantly. Remaining gaps:

- **Legal entity name**: privacy.html still shows `[LEGAL ENTITY — to be confirmed]`. Required under Art.13(1)(a).
- **Hetzner data centre location**: shows `[data centre location — to confirm]`. Required for international transfer information.
- **Effective date**: shows `[TO BE CONFIRMED]`. Should be set once legal review is done.
- **DPO contact**: Not required unless we process special category data at scale — we don't. Can note this explicitly.
- **Lawful basis per activity**: Each processing activity in section 2 should state the specific lawful basis. Currently it's implied but not explicit for each.

These gaps are acceptable while `[DRAFT — pending legal review]` banner is showing, but must be resolved before removing the banner.

---

### 7. Data subject rights procedures — Articles 15–22

**Status: GAP — no internal procedure documented**

The privacy policy correctly lists rights (access, rectification, erasure, portability, objection, restriction). But there is no internal procedure for handling requests. Required procedure elements:
- Identity verification process (to prevent third-party requests)
- 30-day response timeline tracking
- Data export format (portability)
- Erasure cascade (users, goals, emails, matches — ensuring soft-deletes or hard deletes work correctly; `deleted_at` column exists on users table)
- Objection to legitimate interests processing (right to object)

The `deleted_at` column exists on the users table, which is good. But we need to verify that an erasure request actually removes or anonymises: goals, emails, matches, feedback, token_usage records.

**Action required: TSK-044 — Write data subject rights handling procedure + verify erasure cascade covers all tables.**

---

### 8. Processor agreements (DPAs)

**Status: PARTIALLY DONE**

For each processor we use (Anthropic, Resend, Stripe, Hetzner, Cloudflare), UK GDPR Article 28 requires a **written contract** including specific data processing terms. In practice, these are provided as standard DPAs by the processors:

| Processor | DPA status |
|-----------|-----------|
| Anthropic | DPA exists at trust.anthropic.com — need to review + confirm applies to API usage |
| Resend | DPA available — need to review |
| Stripe | DPA available — standard terms |
| Hetzner | DPA available — EU/EEA based |
| Cloudflare | DPA available — standard terms |

**Action required: TSK-045 — Review and document that processor DPAs are in place for all five processors. Note in ROPA.**

---

### 9. Cookie and tracking compliance

**Status: COMPLIANT (minimal)**

The privacy policy correctly states no tracking or advertising cookies. The platform has no JavaScript analytics, no ad pixels, no session cookies beyond what Express might set. This is a genuine privacy-by-design win — no consent banner needed because no non-essential cookies are used.

---

### 10. Children's data

**Status: NO SPECIFIC RISK — document it**

The platform does not target children and has no age verification. The terms of service should state minimum age (18 or 13 under UK age of consent for data processing). Currently terms.html should be checked.

---

## Relevance to eskp.in

This research identifies six material compliance gaps, prioritised by legal risk:

| Priority | Gap | Risk if ignored |
|----------|-----|----------------|
| P1 | ICO registration (TSK-039) | Criminal offence — must be done before external users |
| P1 | ROPA (TSK-040) | ICO enforcement action, fine |
| P1 | Breach response procedure (TSK-043) | Failure to notify ICO = fine (up to £17.5m / 4% turnover) |
| P2 | LIA (TSK-041) | Weak lawful basis if challenged |
| P2 | DPIA (TSK-042) | Required by law for AI processing; demonstrates accountability |
| P2 | Data subject rights procedure (TSK-044) | Operational gap if rights requests received |
| P3 | Processor DPA review (TSK-045) | Art.28 requirement; low risk given standard processor DPAs |

---

## Tasks generated

| ID | Task | Priority |
|----|------|----------|
| TSK-039 | Register with ICO and pay £52 data protection fee (Tier 1) | P1 — must do before external users |
| TSK-040 | Create Article 30 ROPA in docs/operations/ropa.md | P1 |
| TSK-041 | Write LIA (Legitimate Interests Assessment) in docs/operations/lia.md | P2 |
| TSK-042 | Conduct and document DPIA for AI goal decomposition + matching | P2 |
| TSK-043 | Create breach response procedure in docs/operations/breach-response.md | P1 |
| TSK-044 | Write data subject rights procedure + verify erasure cascade in DB | P2 |
| TSK-045 | Review and document processor DPAs for Anthropic, Resend, Stripe, Hetzner, Cloudflare | P3 |

---

*Research complete. Tasks TSK-039–045 generated and added to task-queue.md.*
