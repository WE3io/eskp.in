# Decision 005 — Payment model

**Date:** 2026-03-08
**Status:** Decided — v1
**Confidence:** 70%

---

## Decision

**£10 per introduction, paid by the person seeking help, via Stripe Checkout.**

The introduction is withheld until payment is confirmed. Stripe fires a `checkout.session.completed` webhook; the platform then sends the helper intro email.

---

## Options considered

| Option | Model | Rejected because |
|---|---|---|
| Free forever | No revenue | Doesn't meet Phase 1 goal |
| Tip after introduction | Voluntary | Low conversion, no revenue guarantee |
| Subscription | Monthly fee | Too early — no recurring value established yet |
| **Pay-per-introduction** | £10 one-time | **Chosen** — simple, directly tied to value delivered |
| Helper subscription | Helpers pay | Wrong incentive — helpers are doing us a favour |

---

## Reasoning

The platform's value is delivered at the moment of introduction. Charging at that point is honest and proportionate. £10 is low enough not to deter genuine users, high enough to filter casual requests and cover marginal costs (API tokens, email, hosting).

Stripe Checkout is used rather than building a custom payment form — PCI compliance, card validation, and fraud detection are handled by Stripe. The `stripe` npm package verifies webhook signatures before acting on events.

---

## Implementation

- Stripe Checkout session created when a match is found
- `stripe_session_id` stored on the matches record
- Introduction email to helper fires only on `checkout.session.completed` webhook
- Acknowledgement email to user includes payment button
- `STRIPE_INTRO_PRICE_PENCE` env var (default: 1000 = £10) allows price adjustment without code changes

---

## What would change this decision

- If conversion rate on the payment step is too low, consider a free tier with paid priority matching
- If the helper network grows substantially, a subscription model may make more sense
- User feedback indicating £10 feels wrong for the value delivered
