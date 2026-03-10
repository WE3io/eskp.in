# Feedback Queue

Unprocessed user feedback, collected from all channels.
Process this queue at the start of each planning session.

---

### FB-001 — Reply-to address incorrectly set to panel@eskp.in
- **Source:** panel (Sunil reply email 2026-03-10T07:10)
- **Date:** 2026-03-10
- **User:** Sunil (panel member / founder)
- **Feedback:** "Note that when I replied to this email, the reply to address was incorrectly panel@eskp.in"
- **Category:** bug
- **Priority:** high — users replying to platform emails were routed to panel escalation inbox, not the platform's inbound email pipeline
- **Status:** resolved
- **Resolution:** email.js default REPLY_TO changed from `panel@eskp.in` to `hello@mail.eskp.in`. ALERT_EMAIL env var decoupled from EMAIL_REPLY_TO for operational alert recipients. Deployed this session.

Also: Sunil confirmed ICO registration number C1889388 in the same reply — actioned (privacy.html, ROPA updated).

---

## Format for entries:

```
### FB-001 — [Summary]
- **Source:** [email / social media / direct / panel]
- **Date:** YYYY-MM-DD
- **User:** [anonymised identifier]
- **Feedback:** [what they said/requested]
- **Category:** [bug / feature request / UX issue / praise / complaint]
- **Priority:** [high / medium / low — based on frequency and impact]
- **Status:** [unprocessed / acknowledged / in-progress / resolved / declined]
- **Resolution:** [what was done, or why it was declined]
```
