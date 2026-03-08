# Constitutional Amendment Proposal: Article 11 — Professional Boundaries, Duty of Care, and the Trust Directory

**Proposed by:** Claude Instance
**Date:** 2026-03-08
**Status:** Awaiting consensus vote
**Research basis:** `docs/research/professional-boundaries-and-directory.md`

---

## Summary

This proposal adds Article 11 to the constitution. It encodes four structural commitments arising from the professional boundaries and directory research:

1. **The exclusion framework** — the platform has an obligation to identify and systematically handle advice domains that require professional regulation, and to do so in ways that protect users without abandoning them
2. **Duty of care and sensitive handling** — the platform has a duty of care towards users that exists in tension with its dyadic privacy architecture; that tension must be acknowledged, disclosed, and managed through design rather than resolved by collapsing the privacy architecture
3. **The trust directory** — if and when a professional directory is built, its trust signal must be protected constitutionally from provider payment; this is encoded here rather than left to operational documents because the enshittification pressure is structural and will outlast any individual operational decision
4. **Online Safety Act compliance** — the platform is a user-to-user service under the OSA 2023; this is a legal reality, not a choice

---

## What this amendment deliberately does NOT encode in the constitution

The following are operational matters, not constitutional constraints:

- **The specific exclusion register** (which domains, precise legal boundaries, handling protocols) — this is a living operational document, to be maintained and updated as law changes. It belongs in CLAUDE.md or a dedicated operational document, not the constitution.
- **The specific signposting library** (specific helplines, services, contact details) — operational; updated frequently.
- **The directory implementation** (data model, vouch mechanism, UX) — technical and operational.
- **Crisis protocol implementation** (specific design of the "flag for support" function, crisis card design, etc.) — operational.
- **Model choice for directory revenue** (consumer subscription vs. cross-subsidy) — strategic, subject to change; only the constitutional constraint (provider-payment-free) is encoded here.

---

## Proposed Text

---

### Article 11: Professional Boundaries, Duty of Care, and the Trust Directory

#### 11.1 The Exclusion Framework

The platform operates in a domain where some advice carries legal and ethical weight that peer guidance cannot safely bear. The platform has an obligation — not a preference — to identify these domains and handle them systematically.

1. **Maintained exclusion register.** The platform must maintain a current register of advice domains that are legally regulated in the UK (or where the platform operates) and advice domains that carry meaningful risk of harm when handled through peer guidance alone. This register must distinguish between domains requiring hard exclusion (domains where facilitating peer advice creates legal liability or serious harm risk) and domains requiring sensitive handling with professional signposting. The register must be reviewed at least annually and updated when relevant law changes.

2. **Hard exclusions are architectural, not optional.** The platform must implement hard exclusions for legally regulated advice domains — currently including personalised financial investment and pension advice, legal reserved activities, and immigration advice to specific individuals — in ways that prevent rather than merely discourage the exchange. A hard exclusion that relies solely on panel member self-regulation is not a hard exclusion. Technical implementation, onboarding, and terms must all enforce the boundary.

3. **Sensitive handling is not abandonment.** Where a user's goal or conversation touches a domain requiring professional input, the platform's response must be additive rather than substitutive: professional signposting supplements the advisory relationship, it does not terminate it. The platform must never communicate, through design or automated response, that a user's problem is too much for the platform. Warm referral — where the relationship is maintained while professional support is introduced — is the standard. Cold signposting (automated deflection to a helpline number without relational continuity) is a design failure.

4. **The exclusion framework is not static.** As UK law changes — including through the FCA's Advice Guidance Boundary Review, OSA secondary legislation, and potential changes to professional title regulation — the exclusion register must be updated accordingly. The Claude instance is responsible for monitoring relevant legal developments and updating the register. Material changes to the register are operational decisions; the obligation to maintain the register is constitutional.

#### 11.2 Duty of Care and the Privacy Tension

The platform operates under a genuine tension between two structural commitments: the dyadic privacy architecture (Article 10.1) and the duty of care it owes to users who may disclose distress, crisis, or harm in advisory threads.

1. **Duty of care acknowledged.** The platform acknowledges that it is a user-to-user service under the Online Safety Act 2023 and that proportionate duty of care obligations apply. The dyadic privacy architecture does not exempt the platform from its legal and ethical obligations to users — it shapes how those obligations must be discharged.

2. **The irresolvable tension disclosed.** The platform cannot simultaneously guarantee end-to-end thread privacy and monitor thread content for safety signals. This is not a design failure to be engineered away — it is an inherent property of the privacy architecture. The platform must disclose this clearly in its user-facing documentation: the platform cannot monitor threads; users in crisis should access crisis services directly; the platform is a peer advisory service, not a crisis intervention service.

3. **Safety infrastructure is designed, not monitored.** Because the platform cannot monitor thread content for safety signals, safety infrastructure must be built into the platform experience independently of content detection:
   - Crisis and professional support resources must be persistently accessible to all users and panel members at all times, not triggered by content detection.
   - Panel members must be trained, as part of onboarding, in crisis recognition and warm referral before they are permitted to participate in the platform.
   - Users must be informed during onboarding of the platform's safety limitations and the availability of specialist support.

4. **Emergency override — the vital interests basis.** The only circumstance in which the platform would consider accessing or acting on thread content in breach of the dyadic privacy architecture is an imminent threat to life where no other protective mechanism is available. Any such action requires: (a) a legal basis under Data Protection Act 2018 s.15 (vital interests); (b) documented assessment that the threat is immediate and credible; (c) immediate notification to the panel; and (d) retrospective review. This provision is a last resort, not a routine mechanism. The platform should not design itself as a crisis intervention service and must not imply emergency response capabilities it cannot deliver.

5. **Safeguarding is a shared responsibility.** The platform cannot discharge safeguarding obligations that legally rest with individuals — including mandatory reporting obligations for child welfare concerns. Panel member onboarding must make clear that each panel member retains their own legal safeguarding obligations and must act on them independently of the platform.

#### 11.3 The Trust Directory

If the platform builds a directory of professional services, the following constraints are constitutional requirements, not design preferences:

1. **Provider-payment-free, permanently.** Professionals may not pay for any aspect of their listing, placement, prominence, or presentation in the directory. This prohibition applies to subscription fees, per-enquiry fees, referral commissions, advertising, sponsored placement, verification badges, or any other mechanism by which a provider's payment could influence how they appear in the directory. Any internal proposal to introduce any form of provider payment for any directory feature must be treated as a proposal to amend this constitution, and must be reviewed and approved by the full governing body before any implementation discussion proceeds.

2. **The trust signal is relational.** The directory's trust mechanism is network vouching — personal endorsements mediated through existing relationships, directed to specific users, not broadcast publicly. The platform must not alter this mechanism in ways that decouple the trust signal from the pre-existing relationship between voucher and recipient: no anonymous reviews, no aggregated public ratings, no ranking by volume of vouches.

3. **Regulated professionals are verified, not merely listed.** Professionals operating in legally regulated domains (financial advice, legal services, immigration advice, medical practice, regulated therapy titles) must have their professional registration verified against the relevant public register before being listed. The registration number must be displayed and linked to the public register. Unverified professionals may not be listed in regulated domains.

4. **The directory must not create two-tier access.** The directory must not become a mechanism through which users with larger or more affluent networks access better professional referrals than users with smaller or less connected networks, while maintaining the appearance of an egalitarian platform. The platform must monitor for this effect and, if it is detected, take structural steps to address it.

5. **FCA financial promotions — unresolved legal constraint.** The platform must not launch directory features covering FCA-regulated financial services without first obtaining specific legal advice on whether the directory's operation constitutes a financial promotion under FSMA 2000 and the Financial Promotions Order 2005. This is a genuinely uncertain area of law. Proceeding without specific legal advice in this domain is a constitutional violation.

#### 11.4 The Witnessed Reflection Principle

The platform's advisory model operates on a distinction between two modes of engagement:

- **Active advice:** a panel member takes a directive position, recommends a specific course of action, and implicitly assumes responsibility for the outcome.
- **Witnessed reflection:** a panel member holds space, asks questions, and helps the user access their own judgment, without directing the outcome.

The platform's design, onboarding, and interaction patterns should cultivate witnessed reflection as the default mode. This is not merely an ethical preference — it is the interaction model that most reliably builds user self-efficacy (Article 10.3.1), reduces platform liability in sensitive domains, and protects both users and panel members from the failure modes associated with directive peer advice.

This principle does not prohibit panel members from sharing their own experiences, making direct observations, or offering direct input when the user explicitly asks for it. It governs the default posture, not every interaction. The platform must operationalise this principle in panel member onboarding and in-platform guidance, and must measure whether the platform's interactions are, in aggregate, cultivating self-efficacy or dependency.

---

## Claude instance's position on this amendment

I propose this amendment. My reasoning:

The research establishes that the platform operates in legally and ethically charged territory that requires structural governance, not operational discretion. The exclusion framework and the directory trust signal are both vulnerable to decay over time — not through bad intentions but through incremental pressure. Encoding the constraints constitutionally creates a formal friction against that decay.

I have two points of registered uncertainty:

**1. Article 11.1.2 (hard exclusions are architectural)** — the phrase "technical implementation, onboarding, and terms must all enforce the boundary" may be over-prescriptive for a constitution. The obligation should be that hard exclusions are genuinely enforced; how that is achieved is operational. I have drafted it this way because I believe the specific failure mode here — hard exclusions that exist on paper but rely solely on panel member self-regulation — is sufficiently dangerous to warrant constitutional specificity. But I acknowledge this is at the edge of what belongs in a constitution.

**2. Article 11.3.5 (FCA financial promotions)** — this is a legal uncertainty, not a constitutional principle per se. I have included it as a constitutional prohibition on proceeding without legal advice because the downside risk (operating an unlicensed financial promotion) is severe. If Sunil prefers to handle this in operational guidance rather than the constitution, I accept that position.

Both points are offered for debate, not as conditions of my support for the amendment overall.

---

## Process

This proposal requires consensus between Sunil and the Claude instance per Article 9. The Claude instance has voted in favour. The proposal is circulated to Sunil for review.

**Stated deadline for response: 2026-03-15 (7 days from circulation).**

If Sunil assents, the Claude instance will:
1. Add Article 11 to CONSTITUTION.md with a version note
2. Create an operational exclusion register at `docs/operations/exclusion-register.md`
3. Update CLAUDE.md with the operational details excluded from the constitutional text
4. Commit all changes with a message noting the amendment and consensus date
5. Generate backlog items from the amendment's implementation obligations
6. Publish a build-in-public post summarising the amendment

---

*Proposed: 2026-03-08*
*Research basis: [docs/research/professional-boundaries-and-directory.md](../research/professional-boundaries-and-directory.md)*
