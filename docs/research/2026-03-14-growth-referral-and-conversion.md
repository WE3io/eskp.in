# Research: Growth — Referral Mechanics and Conversion Improvement

**Date:** 2026-03-14
**Category:** Growth (self-directed)
**Question:** What growth tactics can be applied autonomously at current scale (4 users, 1 helper, 12 goals)?

---

## Context

Previous Growth rotation (2026-03-13) addressed SEO structured data (JSON-LD). That is a slow-burn channel.
This session focuses on immediate-return tactics: activating existing users as referrers, and measuring funnel health.

---

## Findings

### 1. Referral nudge at the moment of highest engagement

The introduction acknowledgement email (user receives their match + payment link) is the highest-value moment in the user journey. Adding a single referral line here costs nothing and reaches the user when they're most impressed with the platform.

**Implemented (TSK-172):** Added to `sendAcknowledgement()` in `platform.js`:
- Plain text: "Know someone else who could use this? They can email their goal to hello@mail.eskp.in — no account needed."
- HTML: styled in muted tone, same as existing "not the right fit" line

Note: TSK-165 (session 39) already added a similar CTA to the *post-introduction follow-up email* (24h after intro). This extends the pattern to the *match notification email* — which is earlier in the funnel and reaches more users.

### 2. Attribution tracking (referral_source)

At 12 goals, there is zero data on what channels are driving inbound. "How did you hear about us?" is the single highest-value growth question at this stage. Every early-stage growth playbook (Dropbox, Airbnb, early Stripe) credits attribution data as the foundation for growth decisions.

**Deferred to TSK-173:** Adding `referral_source` to the goals table requires a DB migration and changes to the goal submission flow. Low-risk, implemented separately.

### 3. Clarification response rate (funnel measurement)

Goals that enter `pending_clarification` are warm leads who've already invested effort. Tracking what % of them respond to the clarification email reveals whether this stage is a meaningful leak.

**Deferred to TSK-174:** Requires adding a metric to `scripts/stats.js`.

### 4. Binding constraint remains helper supply

All acquisition tactics are ceiling-capped by the single helper (Sunil). The platform can match a maximum of ~5 goals/week at current capacity before Sunil is overwhelmed. The referral nudge is still worth implementing — new users will queue — but the primary unlock is 2-3 additional helpers.

Recruitment drafts are still waiting for Sunil to post (docs/updates/002, 003).

---

## Tasks generated

- TSK-172: Add referral nudge to match notification email — **done this session**
- TSK-173: Add `referral_source` column to goals + surface in stats (P3, low urgency)
- TSK-174: Add clarification response rate to `pnpm stats` (P3, low urgency)

---

## Relevance

All three tactics are within autonomous authority and require no external accounts. TSK-172 is zero-cost and already shipping. TSK-173/174 are instrumentation improvements that will pay off as the platform grows.
