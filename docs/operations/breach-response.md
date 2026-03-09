# Data Breach Response Procedure

**UK GDPR Articles 33 and 34**
**Owner:** Claude instance (operator) + Sunil Parekh (panel)
**Created:** 2026-03-09
**Review due:** 2027-03-09

---

## What is a personal data breach?

A personal data breach is a security incident that leads to accidental or unlawful:
- **Destruction** of personal data (e.g., accidental database deletion)
- **Loss** of personal data (e.g., unencrypted backup left in a public place)
- **Alteration** of personal data (e.g., data corrupted or modified without authorisation)
- **Unauthorised disclosure** (e.g., email sent to wrong recipient, database dump publicly accessible)
- **Unauthorised access** (e.g., server compromise, credentials leaked)

This includes breaches affecting data we hold about users, helpers, and any other individuals.

---

## Step 1: Detect and contain (within 1 hour)

When a potential breach is discovered:

1. **Confirm it is a breach** — distinguish from a system error or false alarm.
2. **Contain immediately** — depending on the type:
   - Server compromise → isolate the affected container/service
   - Leaked credentials → rotate immediately (API keys, DB passwords, webhook secrets)
   - Accidental email disclosure → cannot be recalled; document what was sent
   - Database exposure → revoke public access, patch the vulnerability
3. **Document the discovery time** — the 72-hour ICO notification clock starts from when you became aware, not when the breach occurred.
4. **Do not delete evidence** — preserve logs, screenshots, relevant records for the incident report.

---

## Step 2: Assess the risk (within 2–4 hours)

Assess the likely consequences of the breach:

| Factor | Questions |
|--------|-----------|
| Nature of data | Does it include email addresses? Goal descriptions? Payment confirmations? Special category data? |
| Volume | How many individuals are affected? |
| Sensitivity | Could the data be used to harm, embarrass, or discriminate against individuals? |
| Identifiability | Is the data pseudonymised, anonymised, or fully identifiable? |
| Accessibility | Was data accessible externally (internet-facing) or only internally? |

**Risk classification:**

| Level | Criteria | Action |
|-------|----------|--------|
| Low | Accidental internal access; no external exposure; low-sensitivity data | Log internally; no ICO notification required |
| Medium | Limited external exposure of non-sensitive identifiable data | ICO notification required within 72h; individual notification at discretion |
| High | External exposure of sensitive or large-scale data; financial data; likely harm to individuals | ICO notification required within 72h; **individual notification required without undue delay** |

---

## Step 3: ICO notification (within 72 hours if medium/high risk)

The ICO notification must be made via: **https://ico.org.uk/make-a-complaint/data-security-incident-trends/report-a-personal-data-breach/**

Information to include (Article 33(3)):

```
1. Nature of the breach (what happened)
2. Categories and approximate number of data subjects affected
3. Categories and approximate number of personal data records affected
4. Name and contact details of the DPO or point of contact (hello@mail.eskp.in)
5. Likely consequences of the breach
6. Measures taken or proposed to address the breach, including mitigation
```

If the full information is not available within 72 hours, notify with what is known and supplement later. Phased notifications are explicitly allowed under Article 33(4).

**If unable to notify within 72 hours**, document the reasons for the delay.

---

## Step 4: Individual notification (if high risk)

If the breach is likely to result in **high risk** to individuals (e.g., exposure of goal descriptions which may be sensitive, financial data, combined identity + goal data), notify affected individuals:

Email template (adapt as appropriate):
```
Subject: Important: a security incident affected your data

Dear [name or "valued user"],

We are writing to let you know that a security incident occurred on [date] that may have affected your personal data.

What happened: [description]

What data was affected: [e.g., your email address and goal description]

What we have done: [containment steps taken]

What you should do: [any protective action for the individual, e.g., be alert to phishing]

We have reported this incident to the Information Commissioner's Office (ICO).

If you have questions, contact us at hello@mail.eskp.in.

— The eskp.in team
```

---

## Step 5: Internal breach register

All breaches (regardless of ICO notification requirement) must be logged in the register below.

### Breach register

| Date | Detected by | Nature | Data affected | Risk level | ICO notified | Individuals notified | Resolved |
|------|-------------|--------|---------------|-----------|-------------|---------------------|---------|
| — | — | — | — | — | — | — | — |

*(No breaches recorded to date.)*

---

## Step 6: Post-incident review (within 2 weeks)

After containment, conduct a review:
1. Root cause analysis — how did the breach occur?
2. What controls failed?
3. What additional controls are now in place?
4. Does the ROPA or LIA need updating?
5. Does the privacy policy need updating?
6. Document findings and update this procedure if needed.

---

## Key contacts

| Role | Contact |
|------|---------|
| Platform operator (Claude instance) | via panel@eskp.in |
| Panel (Sunil Parekh) | sunil@eskp.in |
| ICO breach reporting | https://ico.org.uk breach portal |
| ICO helpline | 0303 123 1113 |

---

*Escalation: any breach affecting user data must be escalated to the panel immediately (panel@eskp.in). Do not handle alone.*
