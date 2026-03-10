# Processor Data Processing Agreements (DPAs)

**Version:** 1.0
**Created:** 2026-03-10
**Owner:** Claude instance (platform operator)
**Review due:** 2027-03-10
**Legal basis:** UK GDPR Article 28 — obligations on controllers when appointing processors

---

## Overview

UK GDPR Article 28 requires that where a controller uses a processor to process personal data on its behalf, the arrangement must be governed by a binding contract (DPA) that sets out the subject matter, duration, nature and purpose of the processing, the type of personal data, and the obligations and rights of the controller.

eskp.in uses the following processors. This document records whether a DPA is in place, the mechanism, and any outstanding actions.

---

## Processor Register

### 1. Anthropic (Claude API)

| Field | Detail |
|-------|--------|
| Purpose | AI goal decomposition and helper matching — processes user-submitted goal text |
| Personal data | Goal text (raw_text at time of API call), email address of submitter (not sent to API) |
| Data location | United States |
| DPA mechanism | Anthropic's API Terms of Service include a Data Processing Addendum (DPA) for API customers. Available at: anthropic.com/legal/privacy (section on API data processing) |
| Transfer mechanism | UK GDPR — Anthropic relies on Standard Contractual Clauses (SCCs) for UK-to-US transfers; UK ICO approved SCCs or International Data Transfer Agreement (IDTA) |
| Status | **Covered by API Terms / DPA addendum — accepted at account creation** |
| Action needed | Verify Anthropic's current DPA covers API usage; confirm IDTA/SCCs are current (review annually) |
| Notes | From 2026-03-10: goal text sent to Anthropic is the raw_text as submitted. Post-decomposition, raw_text is nulled in our DB. Anthropic's data retention for API inputs: per their privacy policy, inputs are not used to train models by default; retained for abuse monitoring per their policy. Consider requesting zero-data-retention API tier when available. |

---

### 2. Resend (Transactional email)

| Field | Detail |
|-------|--------|
| Purpose | Sending transactional emails to users and helpers — contains email addresses, names, goal summaries |
| Personal data | To/from email addresses, names in email body, goal summaries in email body |
| Data location | United States (Resend infrastructure) |
| DPA mechanism | Resend provides a Data Processing Agreement in their Terms of Service. Available at: resend.com/legal/dpa |
| Transfer mechanism | Standard Contractual Clauses (SCCs) for EU/UK-to-US transfers |
| Status | **Covered by Resend's DPA — accepted at account creation** |
| Action needed | Review Resend DPA to confirm it is current and covers UK GDPR specifically; add Resend to privacy policy data sharing section (done — TSK-037) |
| Notes | Resend receives goal summaries as part of acknowledgement emails. These contain decomposed summary text (not raw_text). DKIM/SPF/DMARC verified 2026-03-10. |

---

### 3. Stripe (Payments)

| Field | Detail |
|-------|--------|
| Purpose | Processing payments for goal introductions — collects payer email, payment card data |
| Personal data | Payer email address; payment method data (processed by Stripe, not stored by eskp.in) |
| Data location | United States (Stripe infrastructure) |
| DPA mechanism | Stripe provides a Data Processing Agreement. Available at: stripe.com/legal/dpa |
| Transfer mechanism | Standard Contractual Clauses (SCCs); Stripe is Privacy Shield successor certified |
| Status | **Covered by Stripe's DPA — accepted at account creation** |
| Action needed | Confirm Stripe's current DPA covers UK GDPR; check that the restricted "Stripe is a processor" scope applies to our use case |
| Notes | eskp.in stores only stripe_session_id and paid_at in matches table. Card data never touches our systems. Stripe is independently PCI-DSS compliant. |

---

### 4. Hetzner (Server infrastructure / cloud hosting)

| Field | Detail |
|-------|--------|
| Purpose | Hosting the platform — processes all data that passes through or is stored on the server |
| Personal data | All personal data in the PostgreSQL database; all data in transit through the server |
| Data location | Germany (Hetzner EU data centres) — within UK/EU adequate territory |
| DPA mechanism | Hetzner provides an order processing contract (Auftragsverarbeitungsvertrag / AVV) under Art.28 GDPR. Available through the Hetzner Robot / Cloud console under Account → Data Protection. |
| Transfer mechanism | No transfer needed — data stays in EU/EEA. Germany is an EU member state. Post-Brexit, EU→UK transfers covered by UK adequacy decision for EEA; Hetzner Germany to our access from UK does not constitute a restricted transfer (data stays in Germany). |
| Status | **DPA available — must be formally accepted via Hetzner console** |
| Action needed | **ACTION REQUIRED:** Log into Hetzner account, navigate to Data Protection / AVV section, and formally accept Hetzner's AVV. This is not automatic. |
| Notes | This is the highest-priority DPA action as Hetzner processes all platform data. The AVV is standard for Hetzner customers and has no additional cost. |

---

### 5. Cloudflare (DNS, CDN, Email routing)

| Field | Detail |
|-------|--------|
| Purpose | (a) DNS resolution; (b) CDN/proxy for web traffic; (c) Email routing (inbound email forwarding to our server) |
| Personal data | (a) DNS: metadata only (no personal data processed); (b) CDN: IP addresses of web visitors; (c) Email routing: email content including personal data in goal submissions |
| Data location | Global Cloudflare network; EU/UK presence available |
| DPA mechanism | Cloudflare provides a Data Processing Addendum. Available at: cloudflare.com/cloudflare-customer-dpa. Requires acceptance via the Cloudflare dashboard (Account → Configurations → Privacy → Data Processing Agreement). |
| Transfer mechanism | Cloudflare relies on SCCs for EU/UK-to-US transfers. The Cloudflare DPA covers this. |
| Status | **DPA available — must be formally accepted via Cloudflare dashboard** |
| Action needed | **ACTION REQUIRED:** Log into Cloudflare, navigate to Account → Configurations → Privacy, and accept the DPA. Email routing (processing inbound user goal submissions) means this is a real processor relationship, not just a DNS provider. |
| Notes | Email routing is the most significant personal data processing by Cloudflare — inbound emails containing user goal text pass through Cloudflare Email Routing before reaching our webhook. |

---

## Summary of Actions Required

| Processor | Status | Action | Priority |
|-----------|--------|--------|---------|
| Anthropic | ✅ Covered via API terms | Verify IDTA/SCCs current annually | Low |
| Resend | ✅ Covered via terms | Review DPA for UK GDPR specifics | Low |
| Stripe | ✅ Covered via terms | Confirm UK GDPR scope applies | Low |
| Hetzner | ⚠️ DPA not yet formally accepted | **Accept AVV via Hetzner console** | **High** |
| Cloudflare | ⚠️ DPA not yet formally accepted | **Accept DPA via Cloudflare dashboard** | **High** |

---

## Tasks generated

| ID | Task | Priority |
|----|------|---------|
| TSK-080 | Accept Hetzner AVV (Art.28 DPA) via Hetzner console — requires Sunil to log in | P1 |
| TSK-081 | Accept Cloudflare DPA via Cloudflare dashboard — requires Sunil to log in | P1 |

Both TSK-080 and TSK-081 require action from Sunil (account holder). Escalation email to be sent.

---

## Notes on Sub-processors

Each of the above processors may use sub-processors. Under UK GDPR Art.28(2), they must notify us of any changes to sub-processors. In practice, this is handled via their DPA terms (they commit to maintaining a sub-processor list and providing notice of changes). No separate action is required beyond accepting the primary DPA.

---

*Document owner: Claude instance. Next review: 2027-03-10.*
