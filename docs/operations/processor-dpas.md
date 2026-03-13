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
| Purpose | Sending transactional emails to users, helpers, and panel/advisor members — contains email addresses, names, goal summaries, and advisor onboarding content |
| Personal data | To/from email addresses, names in email body, goal summaries in email body, advisor invitation details |
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
| Status | **✅ AVV signed by Sunil 2026-03-11** |
| Action needed | None — review annually (next: 2027-03-11) |
| Notes | Hetzner AVV formally signed via Hetzner console. Copy retained by Sunil. |

---

### 5. Cloudflare (DNS, CDN, Email routing)

| Field | Detail |
|-------|--------|
| Purpose | (a) DNS resolution; (b) CDN/proxy for web traffic; (c) Email routing (inbound email forwarding to our server) |
| Personal data | (a) DNS: metadata only (no personal data processed); (b) CDN: IP addresses of web visitors; (c) Email routing: email content including personal data in goal submissions |
| Data location | Global Cloudflare network; EU/UK presence available |
| DPA mechanism | Cloudflare's DPA is incorporated by reference into their Terms of Service for self-serve customers. No separate signature required. Available at: cloudflare.com/cloudflare-customer-dpa |
| Transfer mechanism | Cloudflare relies on SCCs for EU/UK-to-US transfers. The Cloudflare DPA covers this. |
| Status | **✅ Covered automatically — DPA incorporated by reference for self-serve customers (confirmed 2026-03-11)** |
| Action needed | None — review annually (next: 2027-03-11) |
| Notes | Email routing is the most significant personal data processing by Cloudflare — inbound emails containing user goal text pass through Cloudflare Email Routing before reaching our webhook. |

---

### 6. OpenRouter (Inference routing)

| Field | Detail |
|-------|--------|
| Purpose | AI inference routing — acts as a reverse-proxy between the platform and multiple LLM providers (Anthropic, DeepSeek) for goal decomposition, helper matching, classification, drafting, and code generation |
| Personal data | Goal summaries and decomposed goal fields (no raw_text) are sent to LLM inference calls via OpenRouter; the specific data depends on the role (decomposer/matcher roles send goal summary + tags; classifier/drafter roles send goal context; coder role does not handle user personal data) |
| Data location | United States (OpenRouter infrastructure); models may execute on provider infrastructure (US) |
| DPA mechanism | OpenRouter's Privacy Policy and Terms of Service govern data handling. OpenRouter offers a `data_collection: deny` flag per request which opts out of data collection for training and logging purposes. This flag is set in the platform's OpenRouter adapter (`data_collection: 'deny'` in request headers). |
| Transfer mechanism | Standard Contractual Clauses (SCCs) relied upon; OpenRouter's terms reference GDPR compliance. UK-to-US transfer covered by SCCs. |
| Status | **⚠️ Covered by ToS with data_collection:deny set — full Art.28 DPA not yet signed. Action required (see below).** |
| Action needed | Sunil should check whether OpenRouter provides a formal Art.28 DPA on request for business customers. If not available, document this limitation in the DPIA addendum. Interim: data_collection:deny mitigates training risk. |
| Notes | First live usage: 2026-03-12. Token spend tracked in token_usage table with provider='openrouter'. Personal data processed: goal summary text only (raw_text always nulled before LLM calls). |

---

### 7. DeepSeek (Code generation — via OpenRouter)

| Field | Detail |
|-------|--------|
| Purpose | Code generation for well-scoped development tasks delegated from auto-sessions — receives task descriptions and source file context; does not receive user personal data from goals or emails |
| Personal data | None in normal operation. Coder role receives task descriptions and source code only. Source code may contain constants referencing user data structures (table names, field names) but not personal data values. |
| Data location | China (DeepSeek infrastructure); accessed via OpenRouter proxy (US) |
| DPA mechanism | DeepSeek's API Terms and Privacy Policy. Accessed via OpenRouter with `data_collection: deny`. DeepSeek does not have a formal UK GDPR Art.28 DPA as of 2026-03-13. |
| Transfer mechanism | Data transits US (OpenRouter) → China (DeepSeek). China has no UK adequacy decision. Transfer relies on legitimate interests basis (task descriptions are not personal data in normal use). |
| Status | **⚠️ No formal Art.28 DPA available. Acceptable only because personal data is not processed. Scope must remain limited to code generation.** |
| Action needed | (1) Confirm coder role scope never includes personal data. (2) If scope expands to include personal data processing, escalate to panel before use. (3) Review DeepSeek DPA availability annually. |
| Notes | First live usage: 2026-03-12 (1 call logged). Data_collection:deny set via OpenRouter. Scope strictly limited to code generation — no goal text, no email addresses, no names. |

---

## Summary of Actions Required

| Processor | Status | Action | Priority |
|-----------|--------|--------|---------|
| Anthropic | ✅ Covered via API terms | Verify IDTA/SCCs current annually | Low |
| Resend | ✅ Covered via terms | Review DPA for UK GDPR specifics | Low |
| Stripe | ✅ Covered via terms | Confirm UK GDPR scope applies | Low |
| Hetzner | ✅ AVV signed 2026-03-11 | Review annually (2027-03-11) | Low |
| Cloudflare | ✅ Covered by reference (self-serve) | Review annually (2027-03-11) | Low |
| OpenRouter | ⚠️ ToS + data_collection:deny | Check if formal Art.28 DPA available; document in DPIA | Medium |
| DeepSeek | ⚠️ No Art.28 DPA (no personal data) | Confirm scope stays code-only; review annually | Low |

---

## Tasks generated

| ID | Task | Priority |
|----|------|---------|
| TSK-080 | Accept Hetzner AVV (Art.28 DPA) via Hetzner console | P1 — **done 2026-03-11** |
| TSK-081 | Accept Cloudflare DPA via Cloudflare dashboard | P1 — **done 2026-03-11** (incorporated by reference, no signature needed) |

---

## Notes on Sub-processors

Each of the above processors may use sub-processors. Under UK GDPR Art.28(2), they must notify us of any changes to sub-processors. In practice, this is handled via their DPA terms (they commit to maintaining a sub-processor list and providing notice of changes). No separate action is required beyond accepting the primary DPA.

---

*Document owner: Claude instance. Next review: 2027-03-10.*
