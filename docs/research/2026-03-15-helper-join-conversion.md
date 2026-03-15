# Research: Helper Join Page Conversion

**Date:** 2026-03-15
**Session:** 45
**Question:** What would increase the proportion of `/join.html` visitors who submit a helper application?
**Context:** Platform has 1 active helper. Binding constraint on growth is helper supply. `/join.html` uses a mailto: CTA (email to hello@mail.eskp.in with pre-filled subject/body).

---

## Sources Reviewed

- Peer platform helper/mentor recruitment literature (2024–2025)
- Volunteer expert recruitment landing page best practices
- Form friction reduction and CRO research

---

## Key Findings

### 1. Trust signals drive conversion more than anything else

Experts / skilled helpers are risk-averse about committing their time. They need to trust:
- The platform is real and active
- Their contribution will have impact
- Expectations are clear and bounded

**Current state:** join.html has a "what you'll do" section and "what we ask" section. Missing: social proof (testimonials from Sunil about what it's like to help), concrete volume signal ("X people helped this month"), or any indication of past successful matches.

### 2. Friction in the application step

The current CTA opens the user's email client with a pre-filled template. This creates multiple friction points:
- User must have an email client configured (not universal on desktop; common on mobile)
- The template body is generic — users face a blank-ish form and often defer
- No confirmation or acknowledgement that the application was received

However: a mailto: link is low-infrastructure. At 0–5 applicants/month, a web form is premature overhead. The right fix is removing template anxiety, not replacing the channel.

### 3. The "what you can help with" framing

Research shows expert volunteers convert better when they see a specific, concrete need they can match. Generic "share what you know" is lower-converting than "we're getting goals about X — are you the right person?"

**Current state:** join.html lists broad categories (Career, Business, Technical, Creative, Education, etc.). No live signal of what actual goal types are coming in.

### 4. Reciprocity and recognition

Helpers are more likely to apply when they understand what they get:
- A platform that filters goals so they only see relevant ones
- Low time commitment made explicit and credible
- The match email framing ("one email introduction, reply or ignore")

**Current state:** join.html already has "One email introduction, no platform to manage, no obligation beyond a first conversation." This is good. Could be made more prominent.

### 5. Speed to first feedback

The 72% onboarding abandonment stat applies to both users and helpers: if the process feels uncertain or long, people drop out. The current flow is: email sent → human reviews → approval email → manually added to DB. No automated acknowledgement exists.

---

## Relevance to Platform

At current scale (1 helper, 0 applications in queue), the primary levers are:
1. **Sunil posting the recruitment drafts** (docs/updates/002-twitter-recruitment.md, 003-linkedin-helper-recruitment.md) — highest-ROI action, blocked on Sunil
2. **Improving join.html to reduce template anxiety** — small, autonomous action
3. **Automated "application received" email** — removes uncertainty for applicants

---

## Tasks Generated

| ID | Task | Priority | Notes |
|----|------|----------|-------|
| TSK-177 | Add application-received auto-reply to helper-application.js — immediately reply to applicants so they know their email arrived | P2 | Removes uncertainty gap; small change to existing handler |
| TSK-178 | Improve join.html CTA copy — replace generic template with a more specific prompt that reduces blank-form anxiety; add "we'll confirm receipt" note | P2 | Low friction; ICP-aligned; copy review required |

---

*Format: Question → Sources → Findings → Relevance → Tasks generated*
