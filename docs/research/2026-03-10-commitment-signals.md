# Commitment Signals for Goal Submissions

**Date:** 2026-03-10
**Question:** What lightweight mechanism can filter low-intent submissions without deterring genuine users?
**Status:** Design decision — not yet implemented (premature at current scale < 10 users)

---

## Why this matters

At volume, a peer-help platform inevitably attracts:
- Curiosity testers who submit joke or placeholder goals
- Spam / commercial solicitation
- Vague goals that waste helper time
- Users who submit but never respond to follow-ups

These inflate helper workload and reduce their willingness to stay engaged. The helper is the scarce resource; protecting their attention is the core constraint.

## Bootstrap constraint

With 0–10 users, every submission is precious. Over-filtering at this stage means losing the signal we need to calibrate the platform. **Do not implement gates that add friction before we have evidence of an actual spam/low-intent problem.**

## Sources reviewed

- GrowthMentor: paid membership ($50/mo) as the primary commitment filter
- Clarity.fm: per-minute billing creates skin in the game at the session level
- SuperPeer: profile-first (submitter has a public account before requesting a call)
- YC Office Hours: application essay — forced articulation as filter
- Notion's early "waitlist" — exclusivity as social proof + commitment signal

## Findings

### 1. Paid access is the strongest signal — but premature here

A nominal submission fee (even £1–2) would eliminate nearly all low-intent traffic. However:
- We have zero social proof right now; a paywall at the door would suppress real users
- The £10 introduction fee already creates a commitment gate *after* matching — this is reasonable at bootstrap

**Decision: do not add pre-submission payment gate yet.**

### 2. Forced articulation (writing effort) is second best

Requiring the submitter to write a substantive paragraph, not a one-liner, acts as a light filter. The clarification loop (TSK-034, already implemented) does this implicitly — vague goals trigger a clarification request before matching proceeds.

The clarification email effectively says: "we can't match your goal until you tell us more." This is a retroactive commitment test. If the user doesn't reply, the goal expires.

**Assessment: TSK-034 already provides the core commitment signal we need.**

### 3. Soft friction: pre-submission checklist

A short checklist on the submission form ("before you submit, confirm: I've described what I want to achieve, not just a problem statement; I'm available for an email exchange this week") adds zero tech overhead and screens for intent.

**This is viable now and costs nothing to implement.** Recommended as TSK-090.

### 4. Social login / verified email

Requiring a confirmed email (magic link verification before goal is processed) is the standard approach. We currently process goals on raw inbound email — the Cloudflare routing already confirms the email is real (otherwise delivery would fail).

Web form submissions (if we add one) would need email verification. Until we have a web form, this is not applicable.

### 5. Skin-in-the-game after match (current model)

The current £10 introduction fee paid by the goal-submitter acts as a downstream commitment test. Any user who ghosts the platform after matching pays nothing — but their goal eventually expires (TSK-063 follow-up, TSK-056 retention automation). This is the correct approach at bootstrap.

---

## Recommended design (phased)

### Phase 1 — now (< 50 submissions/month)
- No additional gate needed
- TSK-034 (clarification loop) handles vague goals
- TSK-090 (pre-submission checklist on web form, when built) — simple copy change

### Phase 2 — 50–500 submissions/month
- Add email verification step: magic link confirms address before goal enters processing queue
- Add "reply within 48h" expectation to ack email (already implied in TSK-065)
- Monitor no-reply rate from clarification requests; if >50%, revisit

### Phase 3 — 500+ submissions/month
- Consider nominal pre-submission fee (£1–2) if spam becomes visible
- Consider account creation with profile (adds social accountability)
- Review platform data for low-effort goal patterns and refine decompose.js prompts to flag them

---

## Tasks generated

| ID | Task | Priority | Rationale |
|----|------|----------|-----------|
| TSK-090 | Add pre-submission checklist copy to landing page CTA section | P3 | Zero cost; soft friction; improves goal quality |

---

## Relevance to Constitution

Article 3.1: the platform exists to connect people with genuine needs with people who can genuinely help. Commitment signals protect this match quality at scale. The current approach (clarification loop + downstream payment) is constitutionally aligned and proportionate to current scale.
