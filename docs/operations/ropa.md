# Records of Processing Activities (ROPA)

**Article 30, UK General Data Protection Regulation**
**Organisation:** eskp.in (legal entity: TBC — see privacy.html)
**Data controller contact:** hello@mail.eskp.in
**ICO registration number:** C1889388
**Last updated:** 2026-03-10
**Review due:** 2027-03-09 (annual)

---

> This document must be kept up to date. Update it whenever a new category of processing is introduced, a processor changes, or a retention period is revised.

---

## Processing Activity 1: Goal submission and email handling

| Field | Detail |
|-------|--------|
| **Purpose** | Receive and log inbound emails from prospective users describing their goals or needs |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) — user has contacted us specifically to receive the service |
| **Categories of data subjects** | Members of the public who email the platform |
| **Categories of personal data** | Email address, name (if provided), free-text goal description |
| **Recipients** | Resend (email infrastructure processor); Hetzner (server/DB processor) |
| **International transfers** | None at this stage (email stored on Hetzner EU/EEA servers) |
| **Retention** | Active goals: retained while service is live. Inactive (12 months no activity): deleted or anonymised |
| **Security measures** | Data encrypted in transit (TLS); at-rest encryption on Hetzner; access-controlled PostgreSQL |

---

## Processing Activity 2: AI-assisted goal decomposition

| Field | Detail |
|-------|--------|
| **Purpose** | Analyse free-text goal submission to produce a structured breakdown (summary, needs, urgency, context, outcome) for matching |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) — AI decomposition is necessary for the matching service the user has requested |
| **Categories of data subjects** | Users who have submitted goals |
| **Categories of personal data** | Goal text (processed); structured decomposition output stored in DB |
| **Recipients** | Anthropic, Inc. (AI processor, US) — receives goal text via API |
| **International transfers** | Transfer to USA (Anthropic). Safeguard: Anthropic standard contractual clauses + DPA. Anthropic API terms prohibit training on inputs by default |
| **Retention** | Decomposed output retained with goal record (same as Activity 1) |
| **Security measures** | Data minimisation: email address and name are not included in API requests. Goal text sanitised before submission |

---

## Processing Activity 3: Helper matching

| Field | Detail |
|-------|--------|
| **Purpose** | Rank helpers in the network by relevance to a user's goal, using AI semantic scoring with tag-overlap fallback |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) |
| **Categories of data subjects** | Users (goal submitters); helpers (network members) |
| **Categories of personal data** | Goal summary and anonymised need tags (user side); helper expertise tags, bio, name (helper side) — sent to AI for ranking |
| **Recipients** | Anthropic, Inc. (AI processor, US) |
| **International transfers** | Transfer to USA (Anthropic) — same safeguards as Activity 2 |
| **Retention** | Match records retained while service is live |
| **Security measures** | Data minimisation: email addresses and full context/outcome fields are not sent to the AI; only summary and anonymised need tags |

---

## Processing Activity 4: Helper profile management

| Field | Detail |
|-------|--------|
| **Purpose** | Maintain a network of helpers with expertise profiles for matching |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) — helpers have joined specifically to be matched |
| **Categories of data subjects** | Helper network members |
| **Categories of personal data** | Email address, name, bio, expertise tags, onboarding date |
| **Recipients** | Resend (email processor); Hetzner (server/DB processor) |
| **International transfers** | None (Hetzner EU/EEA) |
| **Retention** | Retained while helper is active. Deleted or anonymised on request or after 12 months inactivity |
| **Security measures** | As above; helper profiles are internal only — not exposed publicly via the API |

---

## Processing Activity 5: Payment processing

| Field | Detail |
|-------|--------|
| **Purpose** | Charge a one-time introduction fee (£10) when a helper match is proposed |
| **Lawful basis** | Performance of a contract (Art.6(1)(b)) — the user is entering into a paid introduction service |
| **Categories of data subjects** | Users who elect to pay for an introduction |
| **Categories of personal data** | Email address, goal ID, match ID (passed to Stripe for session creation). Card details never seen or stored by eskp.in |
| **Recipients** | Stripe, Inc. (payment processor, US + Ireland) |
| **International transfers** | Transfer to USA (Stripe). Safeguard: Stripe standard contractual clauses + DPA |
| **Retention** | Stripe session ID and payment confirmation retained in matches table. Card data never stored |
| **Security measures** | eskp.in never receives or stores card data. Stripe Checkout handles all payment card processing |

---

## Processing Activity 6: Transactional email communication

| Field | Detail |
|-------|--------|
| **Purpose** | Send acknowledgement, introduction, and referral emails to users and helpers |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) for service emails; contract performance for payment confirmations |
| **Categories of data subjects** | Users; helpers |
| **Categories of personal data** | Email address, name, goal summary, helper name |
| **Recipients** | Resend (email delivery processor, US) |
| **International transfers** | Resend is a US company. Standard processor DPA in place |
| **Retention** | Email log records retained in the emails table per Activity 1 retention policy |
| **Security measures** | TLS for email delivery; no personal data in email subject lines beyond user's own name |

---

## Processing Activity 7: Feedback collection

| Field | Detail |
|-------|--------|
| **Purpose** | Collect optional user feedback to improve the platform |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) — platform improvement |
| **Categories of data subjects** | Users who voluntarily submit feedback |
| **Categories of personal data** | Email address (optional), feedback content, associated goal ID (optional) |
| **Recipients** | Hetzner (server/DB processor) |
| **International transfers** | None |
| **Retention** | Retained indefinitely for product improvement unless deletion is requested |
| **Security measures** | Rate-limited (10 requests/hour per IP); content length-capped at 5,000 characters |

---

## Processing Activity 8: System monitoring and logs

| Field | Detail |
|-------|--------|
| **Purpose** | Monitor platform health, detect failures, and support security incident response |
| **Lawful basis** | Legitimate interests (Art.6(1)(f)) — security and operational reliability |
| **Categories of data subjects** | All users (incidentally; logs may contain email addresses in request context) |
| **Categories of personal data** | Application logs (may contain email addresses, IP addresses, timestamps); database backups |
| **Recipients** | Hetzner (server processor); email alert to sunil@eskp.in via Resend |
| **International transfers** | None for logs; email alerts via Resend (US — see Activity 6) |
| **Retention** | Application logs: 30-day rolling retention. DB backups: 30-day rolling cycle |
| **Security measures** | Server-side access controls; no log shipping to third-party analytics services |

---

## Processors summary

| Processor | Role | Location | Safeguard |
|-----------|------|----------|-----------|
| Anthropic, Inc. | AI model (goal decomposition + matching) | USA | SCC + DPA (API terms) |
| Resend | Transactional email delivery | USA | SCC + DPA |
| Stripe, Inc. | Payment processing | USA + Ireland | SCC + DPA |
| Hetzner Online GmbH | Server infrastructure and database hosting | Germany (EU) | GDPR Article 46 — adequacy within EEA |
| Cloudflare, Inc. | DNS, edge network, DDoS protection | USA | SCC + DPA |

---

## Review history

| Date | Change | Author |
|------|--------|--------|
| 2026-03-09 | Initial ROPA created | Claude instance (auto-session, TSK-040) |

---

*Next review: 2027-03-09. Update whenever processing changes. Maintain as a living document.*
