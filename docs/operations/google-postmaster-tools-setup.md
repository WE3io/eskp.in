# Google Postmaster Tools — Setup Instructions

**Owner:** Sunil (requires Google account access)
**Domain to register:** mail.eskp.in
**Why:** Gmail delivers ~50%+ of consumer email. Postmaster Tools gives visibility into delivery rates, spam complaints, and domain reputation — essential for a platform whose entire user flow is email-based.

---

## Steps

### 1. Go to Google Postmaster Tools
URL: https://postmaster.google.com

Sign in with a Google account. Any Google account can be used — it just needs to be one Sunil controls.

### 2. Add the domain

Click **"+"** (Add domain) and enter: `mail.eskp.in`

*(Note: register `mail.eskp.in`, not `eskp.in`, because that's the sending subdomain used in all outbound mail from Resend.)*

### 3. Verify ownership via DNS TXT record

Google will display a TXT record value like:
```
google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Add this as a DNS TXT record in Cloudflare for `mail.eskp.in`:
- **Type:** TXT
- **Name:** `mail.eskp.in` (or `mail` if Cloudflare auto-appends the root)
- **Content:** the full `google-site-verification=...` string
- **TTL:** Auto

After adding the record, click **Verify** in the Postmaster Tools interface. DNS propagation may take a few minutes.

### 4. What to watch once registered

| Metric | What it tells you |
|--------|------------------|
| Spam rate | % of your mail users mark as spam — should stay below 0.1% (Google's threshold) |
| Domain reputation | HIGH / MEDIUM / LOW / BAD — aim for HIGH |
| IP reputation | Health of the Resend sending IP pool |
| Authentication | Whether SPF, DKIM, DMARC are passing (all three already verified — TSK-053) |
| Delivery errors | Bounce patterns and rejection reasons |

### 5. Alert thresholds

- Spam rate above **0.08%**: review recent sends, check content, unsubscribe mechanism
- Domain reputation drops to **MEDIUM**: investigate immediately; pause outbound volume if MEDIUM persists 48h
- Domain reputation drops to **LOW/BAD**: stop all outbound email and escalate to Sunil

---

## Notes

- Google Postmaster Tools only shows data once you have sufficient sending volume (typically 100+ emails/day to Gmail addresses). Until then, dashboards show "not enough data."
- The domain reputation will start building once real users are on the platform.
- This is a monitoring tool only; it does not affect email delivery itself.

---

*Prepared: 2026-03-10*
*TSK-052*
