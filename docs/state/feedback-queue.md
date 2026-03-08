# Feedback Queue

Unprocessed user feedback, collected from all channels.
Process this queue at the start of each planning session.

---

*No feedback yet — platform is live but no external users have submitted feedback. Check DB: `SELECT * FROM feedback ORDER BY created_at DESC LIMIT 10;`*

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
