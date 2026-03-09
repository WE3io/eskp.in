# Emergency Override Protocol

**Document:** `docs/operations/emergency-override-protocol.md`
**Version:** 1.0
**Created:** 2026-03-09
**Owner:** Claude instance (operational review); panel notification required on any exercise
**Constitutional basis:** Article 11.2.4

---

## Purpose

This document defines the only circumstance in which the platform would consider acting on the content of a private user-to-user thread in breach of the platform's dyadic privacy architecture.

This is a last resort. It is not a routine procedure. The platform is a peer advisory service and is **not designed as a crisis intervention service**. Users who are in immediate danger should call **999**. The platform must not imply emergency response capabilities it cannot deliver.

---

## Legal Basis

**Data Protection Act 2018, section 15 (vital interests)**

Processing of personal data is lawful where it is necessary to protect the vital interests of the data subject or another natural person, where the data subject is physically or legally incapable of giving consent.

This basis must be assessed and documented in writing **before** any override action is taken (see Condition 3 below).

---

## Four Conditions

All four conditions must be satisfied before any override action is taken. If any condition cannot be satisfied, no override action may be taken.

### Condition 1: Imminent threat to life

The threat must be:
- **Immediate** — not historical, not speculative, not a disclosed past risk
- **Credible** — evidenced by specific, unambiguous content in the thread
- **To life** — the threshold is death or serious bodily harm, not general distress or vulnerability

General indicators of mental health difficulty, expressions of unhappiness, or disclosures about past self-harm do not satisfy this condition. The condition requires a credible, immediate, specific threat.

### Condition 2: No other protective mechanism available

Before considering an override, the following must have been considered and found unavailable or insufficient:
- Contacting the user directly (e.g. by reply email) to signpost to emergency services
- The user having already been signposted to emergency services and declined
- Emergency services being unable to act without the specific thread content

If contacting the user directly is possible and not evidently futile, that is the required first step, not an override.

### Condition 3: Legal basis assessed in writing

Before any override action:
1. The DPA 2018 s.15 vital interests basis must be assessed in writing
2. The assessment must state: (a) what specific data would be processed; (b) why vital interests apply; (c) why no less intrusive alternative exists
3. This written assessment must be retained

No action may be taken before this assessment is documented.

### Condition 4: Panel notified immediately

**panel@eskp.in** must be notified before or simultaneous with any override action. The notification must include:
- What action is being taken
- Which of conditions 1–3 have been satisfied and how
- What outcome is sought

---

## Retrospective Review

After any exercise of this protocol:
1. A full retrospective review must be completed within 7 days
2. The review must assess: whether the four conditions were in fact met; whether the outcome justified the action; what the platform should do differently
3. The review must be committed to `docs/operations/` with a descriptive filename
4. The ICO must be notified if required under Article 33/34 GDPR (data breach reporting obligations may apply depending on the nature of the action)

---

## Important Constraints

- **The platform cannot monitor thread content proactively.** This protocol applies only where thread content has been seen incidentally (e.g. in a manually reviewed email).
- **This protocol does not create any capability** — it only defines the conditions under which action could be lawfully justified if the capability existed.
- **This is not a substitute for calling 999.** Any user or helper who believes someone is in immediate danger should call emergency services directly.
- **The platform must not imply** in its user communications that it operates any monitoring, crisis detection, or emergency escalation system.

---

## Relationship to Platform Architecture

The platform's dyadic privacy principle (Article 11.2.2) holds that private peer conversations cannot be monitored by the platform without destroying the trust relationship that makes the platform valuable. This protocol acknowledges that tension and resolves it by:

1. Erring overwhelmingly toward privacy (the four conditions set a very high bar)
2. Requiring written justification before any action
3. Requiring immediate panel oversight
4. Requiring retrospective accountability

The existence of this protocol should not be read as evidence that the platform monitors content. It does not. It should be read as evidence that the platform has thought carefully about the edge case and has a documented, legally grounded approach if it ever arises.

---

## Reference in Privacy Policy

The privacy policy references the existence of this protocol. The reference should describe it in plain language without linking to this internal document. Example wording (see `public/privacy.html`):

> In rare circumstances — where there is an immediate, credible, and specific threat to life and no other protective mechanism is available — we may act on information in a private conversation to protect a vital interest. The legal basis would be DPA 2018 s.15 (vital interests). We would notify our oversight panel immediately and conduct a retrospective review. This is a last resort: if you or someone you know is in immediate danger, please call 999.

---

*Last updated: 2026-03-09*
*Next review: triggered by any exercise of this protocol, or annual review of exclusion register (2027-03-08)*
