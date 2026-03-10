# Research: Payment UX and Match Quality Metrics

**Date:** 2026-03-10
**Session:** fifteenth auto-session
**Category:** Research rotation

---

## Question

1. What are the best-practice payment UX patterns for a peer matching / advisory marketplace at bootstrap stage?
2. What signals and metrics should we collect to understand and improve match quality over time?

---

## Sources

- FinTech Magazine: Payment UX in 2025 — balancing security and simplicity
- Sloboda Studio / YoCoach: How to build a consulting marketplace like Clarity.fm
- Clarity.fm help docs and how-it-works page
- Meta Engineering: Adapting Facebook Reels RecSys with user feedback (2026)
- EvidentlyAI: 10 metrics to evaluate recommender and ranking systems
- SIGIR 2025: Agentic Feedback Loop Modeling paper
- YouTube algorithm analysis (2025)

---

## Findings

### Payment UX

#### Current state
The platform charges £10 upfront via a Stripe Checkout link embedded in the acknowledgement email. The user submits a goal, sees an AI-generated match, and must pay before the introduction fires.

#### Key finding: payment is pre-value
The user pays before receiving any demonstrable value. They know the helper's name and bio (from the match email) but have had no contact. This is a relatively high-friction model.

**Comparison: Clarity.fm**
Clarity pre-charges users for their estimated call length, but the key difference is that users *choose* their expert before paying. The user sees the expert's full profile, ratings, and reviews, then actively selects them and initiates a booking. The value signal (expert reputation + user choice) comes before payment.

Our model is different: we're *telling* the user who the match is and asking them to pay. The user has less agency. This increases friction.

#### Payment UX principles from research
1. **Friction at payment = drop-off.** Any obstacle between intent and completion loses conversions. Our 7-day unpaid match follow-up is the right mitigation today.
2. **Pre-charge with escrow is acceptable** if the user trusts the platform. At bootstrap with zero reviews, trust is low.
3. **Per-minute vs flat fee**: Clarity's per-minute model reduces psychological friction vs upfront fees. Our £10 flat fee is simpler operationally but may feel more risky to new users.
4. **Embedded payments reduce dropout.** The ideal UX would have payment happen in the acknowledgement email itself (Stripe payment link embedded inline), which we currently do. This is correct.

#### Recommendations
- **Short-term (now)**: current model is acceptable. The match email includes helper bio and the option to reject ("Not the right fit? Reply and we'll take another look"), which reduces the risk of paying for a bad match.
- **Medium-term (when 5+ users)**: consider a "free first message" model — user's goal is forwarded to helper with no payment, helper can send one free response, payment required to continue. This demonstrates value before payment. High implementation cost; log as P2 task.
- **Long-term**: post-introduction ratings (TSK-094, now implemented) build the trust infrastructure needed to show social proof (average match rating) to new users before they pay.

---

### Match Quality Metrics

#### The feedback loop problem
Without measuring match quality, we cannot improve the algorithm. We currently have:
- **Implicit signals**: did the user pay? (payment = user believed match was worth £10)
- **Qualitative**: follow-up email asks for free-text feedback (replies routed to inbox)
- **Explicit**: nothing structured until now (TSK-094)

#### What good metric design looks like (from research)
- No single metric tells the full story. Combine implicit + explicit signals.
- Explicit feedback (ratings) is reliable but rare. Implicit (payment, engagement) is plentiful but noisy.
- YouTube/Netflix treat engagement signals as proxies for satisfaction — but these can be gamed or misleading.
- Meta's UTIS approach: direct user surveys dramatically outperformed engagement-proxy metrics (+12pp accuracy, +5.4% engagement after model change).

#### Signals we now collect or could collect

| Signal | Type | Availability | Quality |
|--------|------|-------------|---------|
| User paid for intro | Implicit | On payment | Strong positive intent |
| User rated match (1–5) | Explicit | 24h follow-up | High quality, low volume |
| User replied to check-in | Implicit | 24h follow-up | Engagement proxy |
| Goal reached 'resolved' | Implicit | User action | Strong completion signal |
| Helper response time | Implicit | Could track | Availability signal |
| User resubmitted different goal | Implicit | DB | Possible dissatisfaction |

#### What TSK-094 implements
1-click 3-option rating (Very helpful / Somewhat helpful / Not helpful, mapped to 5/3/1) in the 24h follow-up email. No account required. Stored in `matches.user_rating` + `matches.user_rated_at`. Idempotent (second click shows "already recorded").

#### Future metric work (tasks generated)
- **TSK-095**: Add average match rating to weekly helper digest ("Your average match rating: X.X/5")
- **TSK-096**: Add match quality dashboard query to `pnpm budget` or a new `pnpm stats` command — summary of ratings, payment rates, goal completion rates

---

## Relevance

- **TSK-094**: Implemented this session — 1-click match rating in 24h follow-up email
- **Revenue**: understanding which matches lead to payment (implicit quality signal) helps tune the algorithm toward revenue-generating matches
- **Helper retention**: helpers with high ratings can be surfaced more prominently; helpers with low ratings need coaching or offboarding
- **Trust building**: once we have enough ratings (n=10+), we can show "avg match rating: 4.3/5" on the landing page as social proof before payment

---

## Tasks generated

| ID | Task | Priority |
|----|------|---------|
| TSK-094 | 1-click match quality rating in follow-up email | **done this session** |
| TSK-095 | Add average match rating to weekly helper digest | P3 |
| TSK-096 | `pnpm stats` command — match quality + payment rate summary | P3 |
| TSK-097 | Consider free-first-message model as payment friction reducer (research spike) | P2 (defer to 5+ users) |
