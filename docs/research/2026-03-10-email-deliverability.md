# Research: Email Deliverability Best Practices for Transactional Email

**Question:** What are current best practices for email deliverability and sender reputation for a low-volume transactional email platform?
**Date:** 2026-03-10
**Session:** Infrastructure rotation (TSK-029)
**Status:** Complete

---

## Context

eskp.in sends transactional emails via Resend from `hello@mail.eskp.in`. Current email types:
- Goal acknowledgement to users
- Introduction email to matched helpers
- Feedback confirmations

Volume is currently very low (< 10 emails/day). Reputation is being established now — this is the critical window.

---

## Findings

### 1. Authentication (SPF / DKIM / DMARC)

These three DNS records are the foundation of deliverability. Without them, emails will be spam-foldered or rejected by major providers (Gmail, Outlook).

**SPF (Sender Policy Framework)**
- DNS TXT record on `mail.eskp.in` that lists which servers are authorised to send email.
- Resend provides SPF records to add when verifying a domain.
- **Action:** Verify `mail.eskp.in` SPF record is set correctly in Cloudflare DNS.

**DKIM (DomainKeys Identified Mail)**
- Cryptographic signature on every outbound email. Proves the email was sent by an authorised server.
- Resend provides DKIM DNS records during domain verification.
- **Action:** Verify DKIM CNAME records are present in Cloudflare DNS.

**DMARC (Domain-based Message Authentication)**
- Policy record that tells receivers what to do when SPF/DKIM checks fail.
- Minimum starting policy: `p=none` (monitor mode) → progress to `p=quarantine` → `p=reject`
- Requires a reporting inbox (e.g. `dmarc@mail.eskp.in` or Resend's DMARC reporting)
- **Action:** Check if DMARC record exists on `mail.eskp.in`.

**Industry standard (2024–2026):** Google and Yahoo require DMARC for bulk senders (>5k/day) but recommend it for all senders. Microsoft (Outlook) increasingly requires SPF+DKIM for inbox delivery.

---

### 2. Sending domain and subdomain

Using `mail.eskp.in` as the sending domain (rather than `eskp.in` directly) is correct practice:
- Protects the root domain reputation from deliverability issues.
- Allows independent DMARC policies on the subdomain.
- Aligns with Resend's domain verification workflow.

---

### 3. From address and reply-to

- **From:** `hello@mail.eskp.in` — consistent and clearly human-sounding. ✅
- **Reply-To:** `panel@eskp.in` — routes replies to the platform operator. ✅
- **Do not use:** `noreply@` addresses — they signal low engagement to spam filters.

---

### 4. Content quality signals

Spam filters score email content. Key signals:

**Positive:**
- Personalised subject lines mentioning the recipient's context
- Plain text version alongside HTML (we send either/or — should send both)
- Clear unsubscribe mechanism (even for transactional emails, best practice is to include opt-out)
- Consistent from address and branding

**Negative:**
- Excessive links (our emails have 1–2 links — fine)
- URL shorteners
- Spam trigger words ("FREE", "ACT NOW", "GUARANTEE")
- Large image-to-text ratio (our templates are mostly text — fine)
- Missing plain text version (we do this for some templates)

**Action:** Ensure all email templates send both HTML and plain text versions (TSK-050).

---

### 5. List hygiene

At low volume this is less critical, but:
- Remove bounced addresses from the database (hard bounces must be removed; soft bounces after 3+ failures)
- Resend's webhook provides bounce and complaint notifications — subscribe to these events
- **Action:** Implement Resend webhook handler for bounce/complaint events (TSK-051)

---

### 6. Engagement signals

Gmail's spam filter increasingly uses engagement (opens, clicks) as a signal. For a new sender:
- Start with the most engaged recipients (people who have actively submitted a goal are likely to engage)
- Do not send unsolicited email to cold lists
- Current flow is entirely permission-based (users submit goals and expect emails) — this is optimal ✅

---

### 7. IP warming

Resend uses shared IPs for low-volume senders and dedicated IPs for high volume. At current volume:
- Shared IP pool is appropriate and expected.
- Resend's shared pool has good reputation — benefit of using an established provider.
- No action required until volume exceeds ~1,000 emails/day.

---

### 8. Monitoring deliverability

Tools to monitor:
- **MXToolbox:** Check SPF, DKIM, DMARC records are correctly configured — free web tool.
- **Mail Tester (mail-tester.com):** Send a test email and receive a spam score with recommendations.
- **Google Postmaster Tools:** Register `mail.eskp.in` to see domain reputation data from Gmail.
- **Resend dashboard:** Monitor delivery, open, bounce rates per sending domain.

**Action:** Register `mail.eskp.in` with Google Postmaster Tools (TSK-052).

---

### 9. Current Resend configuration — things to verify

| Check | Status | Action |
|---|---|---|
| Domain `mail.eskp.in` verified in Resend | ✅ (emails being delivered) | — |
| SPF record in Cloudflare DNS | ❓ Unverified | Verify |
| DKIM records in Cloudflare DNS | ❓ Unverified | Verify |
| DMARC record on `mail.eskp.in` | ❓ Unverified | Add if missing |
| Both HTML + plain text sent | Partial | TSK-050 |
| Bounce webhook handler | ❌ Not implemented | TSK-051 |
| Google Postmaster Tools | ❌ Not registered | TSK-052 |

---

## Relevance to eskp.in

Deliverability is critical because email is the primary user interaction channel. A user who submits a goal and receives no email (spam-foldered acknowledgement) will assume the platform is broken and not return. Getting email right is directly tied to conversion and trust.

The current stack (Resend + `mail.eskp.in` subdomain + consistent from address) is correctly architected. The gaps are operational: DMARC verification, plain text fallback, and bounce handling.

---

## Tasks generated

| ID | Task | Priority |
|---|---|---|
| TSK-050 | Ensure all email templates send both HTML + plain text versions | P2 |
| TSK-051 | Implement Resend webhook handler for bounce/complaint events | P2 |
| TSK-052 | Register mail.eskp.in with Google Postmaster Tools | P3 |
| TSK-053 | Verify SPF, DKIM, DMARC records are correctly configured in Cloudflare DNS | P2 |

---

## Sources

- Resend deliverability documentation (2025)
- Google Sender Guidelines (updated Feb 2024 — mandatory DMARC for >5k/day senders)
- Yahoo Sender Requirements (2024)
- ICO guidance on direct marketing emails (UK)
- RFC 7208 (SPF), RFC 6376 (DKIM), RFC 7489 (DMARC)
