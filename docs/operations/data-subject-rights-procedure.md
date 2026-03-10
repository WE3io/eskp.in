# Data Subject Rights Procedure

**Version:** 1.0
**Created:** 2026-03-10
**Owner:** Claude instance (platform operator)
**Review due:** 2027-03-10
**Legal basis:** UK GDPR Articles 15–22; Data Protection Act 2018

---

## Overview

This document defines how eskp.in handles requests from individuals exercising their data subject rights under UK GDPR. It covers the rights available, how requests are received, the platform's handling procedure, and response timelines.

All requests are handled by emailing **panel@eskp.in**. The platform provides automated flows for the most common rights (access and erasure).

---

## Rights Summary

| Right | Article | How to exercise | Automated? | Response SLA |
|-------|---------|----------------|-----------|-------------|
| Right of access (SAR) | Art.15 | Email "export my data" to panel@eskp.in | Yes — download link | 30 days |
| Right to rectification | Art.16 | Email panel@eskp.in with correction | No | 30 days |
| Right to erasure | Art.17 | Email "delete my account" to panel@eskp.in | Yes — confirmation link | 30 days (typically immediate) |
| Right to restriction | Art.18 | Email panel@eskp.in | No — manual | 30 days |
| Right to data portability | Art.20 | Email "export my data" to panel@eskp.in | Yes — JSON download | 30 days |
| Right to object | Art.21 | Email panel@eskp.in | No — manual | 30 days |
| Rights re automated decisions | Art.22 | Email panel@eskp.in | No — manual | 30 days |

---

## Article 15 — Right of Access (Subject Access Request)

### Automated flow

1. User emails panel@eskp.in (or hello@mail.eskp.in) with subject containing "export my data".
2. The inbound email webhook (`src/webhooks/email.js`) detects the phrase and calls `processExportRequest()`.
3. A one-time download token (48-hour expiry) is generated and emailed to the requesting address.
4. User visits `GET /account/export?token=xxx` to receive a JSON file containing:
   - Account profile (id, email, name, created_at)
   - All goals (id, raw_text, decomposed, status, sensitive_domain, timestamps)
   - All matches (id, goal_id, status, reasoning, timestamps)
   - Emails sent/received by the account
   - Feedback submitted

### What the export includes

All personal data held for the account at the time of the request. The export is a point-in-time snapshot; if the user makes another request after further processing, a new export will reflect the updated state.

### What the export does not include

- Token_usage records (operational billing data; no PII; cannot identify the data subject)
- Deletion_log entries (anonymised; cannot identify the data subject)
- Helper profile data (if the user was onboarded as a helper, their helper record is included in the export)

The data export includes the `helper_profile` field (if the user is a registered helper) and any `helper_applications` they submitted.

### Manual SAR procedure (if automated flow fails)

1. Acknowledge within 24 hours.
2. Verify identity: the request must come from the email address on the account, or the data subject must provide evidence of identity.
3. Export data manually via SQL query.
4. Respond within 30 calendar days of receipt.
5. Log response in `docs/operations/sar-log.md` (create if needed).

---

## Article 17 — Right to Erasure ("Right to be Forgotten")

### Automated flow

1. User emails with subject containing "delete my account".
2. The inbound email webhook calls `requestDeletion()`.
3. A confirmation email with a 48-hour link is sent to the requesting address.
4. User visits `GET /account/delete/confirm?token=xxx` to confirm.
5. `executeDeletion()` runs a CASCADE DELETE in a single transaction:
   - `feedback` (user_id)
   - `emails` (goal_id in user's goals; from_address/to_address match)
   - `account_tokens` (user_id)
   - `matches` (goal_id in user's goals)
   - `goals` (user_id)
   - `helper_applications` (email match — covers helper applicant data)
   - `users` soft-delete: email → `deleted-<uuid>@deleted.invalid`, name → NULL, deleted_at → NOW()
6. An anonymised deletion_log entry is written (no PII; records row counts only).
7. Confirmation email sent to the original address.

### Cascade coverage audit (as of 2026-03-10)

| Table | Covered? | Method |
|-------|---------|--------|
| users | ✅ | Soft-delete with email/name cleared |
| goals | ✅ | DELETE WHERE user_id |
| matches | ✅ | DELETE WHERE goal_id IN user's goals |
| emails | ✅ | DELETE by goal_id + from/to address |
| feedback | ✅ | DELETE WHERE user_id |
| account_tokens | ✅ | DELETE WHERE user_id |
| helper_applications | ✅ | DELETE WHERE email (added 2026-03-10) |
| token_usage | ✅ (partial) | No PII; goal_id becomes orphaned — acceptable |
| deletion_log | N/A | Anonymised; no PII present; retained for audit |
| helpers | ✅ | DELETE WHERE user_id (added 2026-03-10) |

### Helper record deletion

If a user is also a registered helper (record in `helpers` table via user_id), their helper record is automatically deleted as part of the cascade. Helper applications (in `helper_applications` table, linked by email) are also automatically deleted.

### Exemptions from erasure

UK GDPR Art.17(3) allows retention when data is necessary for:
- Legal obligation compliance
- Legal claims (the anonymised deletion_log is retained for this purpose)
- Public interest tasks

The deletion_log entry retained after erasure contains: tables affected, row count, timestamp. It contains no personal data and cannot be used to reconstruct the individual's record.

### Timescales

The automated flow completes in seconds. The platform's stated SLA is 30 days; automated deletion is typically immediate upon confirmation link click.

---

## Article 16 — Right to Rectification

### Procedure

1. User emails panel@eskp.in with the correction required.
2. Acknowledge within 24 hours.
3. Verify identity (email must match account, or identity evidence provided).
4. Apply correction directly to the database.
5. Confirm correction to the user within 30 days.
6. Log in `docs/operations/rectification-log.md` (create if needed).

**Note:** The platform does not currently have a self-service correction interface. This is a manual process.

---

## Article 18 — Right to Restriction

### Grounds for restriction (Art.18(1))

- Accuracy of data contested (during verification period)
- Processing unlawful but subject opposes erasure
- Controller no longer needs data but subject requires it for legal claims
- Subject has objected (Art.21) pending verification

### Procedure

1. Acknowledge within 24 hours.
2. Apply restriction by setting a `restricted = true` flag on the user record (or via note in the record — implement as TSK-079 if volume warrants).
3. During restriction: no AI processing of the user's data; data may only be stored or used for legal claims.
4. Notify the subject when restriction is lifted.

---

## Article 20 — Right to Data Portability

The automated data export (Art.15 flow above) satisfies Art.20. The JSON output is machine-readable and structured. The user receives their data in a format that can be imported into another service.

---

## Article 21 — Right to Object

Subjects may object to:
- Processing based on legitimate interests (Art.6(1)(f)) — the platform's legal basis for AI goal decomposition and matching
- Processing for direct marketing

### Procedure

1. Acknowledge within 24 hours.
2. Assess whether compelling legitimate grounds override the subject's interests.
3. If the objection relates to AI processing: suspend processing for that user's goals until the assessment is complete.
4. Document assessment in `docs/operations/objection-log.md` (create if needed).
5. Respond within 30 days.

---

## Article 22 — Rights Related to Automated Decision-Making

### What automated processing the platform performs

1. **AI goal decomposition** (Claude Haiku): classifies and structures the user's submitted text into a goal summary, tags, and urgency level.
2. **AI matching** (Claude Haiku): scores helper–goal compatibility using decomposed summary and helper expertise.

### Classification

Neither process constitutes a "decision based solely on automated processing which produces legal or similarly significant effects" as defined by Art.22(1). The automated output is used to facilitate a human introduction; no legal or similarly significant decision is made automatically.

However, the platform provides Art.22(4) safeguards voluntarily:
- Users are informed that AI processing occurs (acknowledgement email, privacy policy).
- Users can request human review of their decomposed goal (email panel@eskp.in).
- The decomposition is surfaced to the user in the AI analysis email as a "hypothesis" to be corrected.

### Procedure for human review requests

1. User emails panel@eskp.in requesting human review of their decomposed goal.
2. Acknowledge within 24 hours.
3. Retrieve decomposition from DB; review manually.
4. Correct decomposed JSON if inaccurate.
5. Re-run matching with corrected decomposition.
6. Notify user of outcome.

---

## Response Timelines

All rights requests must be responded to within **30 calendar days** of receipt. This can be extended to three months for complex or high-volume requests, but the subject must be informed of the extension within one month.

If the platform cannot verify identity within the initial month, it may request additional information from the subject (this pauses the clock).

---

## Logging

Maintain the following logs in `docs/operations/`:

| Log file | Purpose |
|----------|---------|
| `sar-log.md` | Subject access requests and responses |
| `rectification-log.md` | Rectification requests and outcomes |
| `objection-log.md` | Art.21 objection requests and assessments |

Erasure requests are logged automatically by the platform in the `deletion_log` DB table.

---

## ICO Notification

If the platform receives a complaint or the ICO requires information about data subject rights handling, this document and the associated logs are the primary evidence of compliance.

See also: `docs/operations/breach-response.md` for data breach obligations.

---

## Tasks generated from this audit

| ID | Task | Priority | Status |
|----|------|---------|--------|
| TSK-077 | Add helpers table + helper_applications to data export | P3 | **done 2026-03-10** — getExportData updated |
| TSK-078 | Automate helpers + helper_applications deletion in erasure cascade | P2 | **done 2026-03-10** — executeDeletion updated |
| TSK-079 | Add `restricted` flag to users table and enforcement in processing pipeline | P3 | open |

---

*Document owner: Claude instance. Next review: 2027-03-10.*
