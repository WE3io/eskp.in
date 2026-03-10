# Community Layer for Peer-Help Platform

**Date:** 2026-03-10
**Question:** What community infrastructure should sit underneath the one-to-one matching, and when should it be built?
**Trigger:** TSK-071 — community is the retention layer independent of match quality
**Status:** Research complete — implementation deferred to Phase 2 (5+ active users)

---

## Why a community layer?

The one-to-one match model has a structural weakness: if a match doesn't convert (helper unavailable, goal not specific enough, payment not completed), the user has a bad experience and no reason to return.

A community layer provides:
1. **Belonging** — user feels part of something, not just a one-shot transaction
2. **Ambient value** — useful even when no match is active
3. **Serendipity** — introductions and connections that the matching algorithm wouldn't make
4. **Helper retention** — helpers feel part of a community of practice, not just a referral list

---

## Sources reviewed

- GrowthMentor community Slack: members-only, topic channels by expertise, regular AMAs
- YC founder community (Bookface): high-trust, identity-verified, curated
- Indie Hackers forum: public, low-trust, large volume — not the model here
- Lenny's community (Slack): paid, high-signal, grouped by function
- On Deck: cohort-based — creates time-bounded belonging
- Junto (Marc Andreessen's peer group model): small intimate groups > large forums

---

## Findings

### 1. Community before product is the GrowthMentor insight

GrowthMentor built a Slack community of mentors before the product was mature. This:
- Gave mentors a reason to stay engaged between sessions
- Created mutual accountability (helpers saw each other's activity)
- Generated direct feedback that shaped the product

**For eskp.in:** a private "helper circle" (email list or Slack) is valuable even with 2–3 helpers. It doesn't require waiting for 5+ users.

### 2. Cohorts beat open forums at bootstrap

Open forums (Discourse, forum software) require critical mass to feel alive. At < 50 users, they feel like ghost towns.

Cohorts (monthly intake, time-bounded) create urgency and connection. The "On Deck" model works well for this.

For this platform, a "goal of the month" concept could work: one goal published (with permission) in a helper digest, allowing helpers to provide perspectives publicly. This creates content without requiring a separate community infrastructure.

### 3. Helper community ≠ user community (keep them separate)

- **Helpers** need: awareness of incoming goal types, a channel to ask each other questions, recognition for good matches
- **Users** need: follow-up support after an intro, a way to share outcomes, peer connection with others who've submitted goals

These have different cadences and different trust levels. Mixing them creates awkward dynamics.

### 4. Email is enough community infrastructure at bootstrap

At 1–10 users, email threads are community. The weekly helper digest (TSK-072, done) is already a community touchpoint. A monthly "outcome roundup" email to goal-submitters creates continuity.

A Slack workspace becomes worthwhile at 5+ active helpers. Before that, it creates maintenance overhead and looks empty.

### 5. Public "outcome stories" generate community gravity

Publishing anonymised outcome stories ("we matched X with a software developer and they shipped their MVP in 3 weeks") serves as:
- Social proof for new users
- Recognition for helpers
- Build-in-public content

This is zero-infrastructure community building. It just requires Sunil to collect and publish outcomes.

---

## Recommended plan (phased)

### Phase 1 — now (0–5 active users/helpers)
- **Already done:** weekly helper digest (TSK-072), pre-match notification (TSK-073)
- **Add:** monthly outcome roundup email to past goal-submitters (TSK-091)
- **Add:** "helper notes" field in manage-helpers.js so helpers can share context with each other (TSK-092)
- No separate community platform needed

### Phase 2 — 5–20 active users
- Create a private Slack/Discord workspace for helpers (TSK-074 already in queue)
- Publish first outcome story on blog (request permission from user)
- Consider a monthly 30-minute Zoom "goal clinic" — Sunil reviews a real goal live with interested helpers

### Phase 3 — 20+ active users
- Introduce cohorts: monthly intake, helpers paired with cohort users for a month
- Consider a community forum (Discourse, Flarum) if async discussion needs a permanent record
- "Helper of the month" recognition

---

## Tasks generated

| ID | Task | Priority | Rationale |
|----|------|----------|-----------|
| TSK-091 | Monthly outcome roundup email to past goal-submitters | P3 | Zero-infrastructure community; creates retention loop |
| TSK-092 | "Notes" field for helper profiles (visible only to platform/admin) | P3 | Allows helpers to surface context, capacity, preferences |

---

## Relevance to Constitution

Article 1.1: the platform connects people who need help with people who can give it. A community layer amplifies this by making helpers more engaged and users more likely to return. It's a constitutional obligation to build this well, not just build it fast.

Article 3.2: the platform should not create dependency — community should empower users to form peer relationships directly, not route everything through the platform. Outcome stories and published matches (with permission) support this principle.
