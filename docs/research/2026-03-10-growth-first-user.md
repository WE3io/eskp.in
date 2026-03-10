# Growth Research: First External User Analysis

**Date:** 2026-03-10
**Category:** Growth (self-directed)
**Question:** What would attract the first external user, and what friction exists in the current flow?

---

## Method

Reviewed all public-facing pages (index.html, join.html, feedback.html, support.html, privacy.html, terms.html) from the perspective of a stranger who has never heard of the platform.

---

## Findings

### What's working

1. **Low barrier to submit**: An email is the entire funnel. No account, no form, no signup. This is genuinely unusual and probably a differentiator.

2. **Honest framing**: The landing page tells you the network is small and matches only happen when the fit is good. This could reduce churn (people who submit knowing the stakes) even if it reduces volume.

3. **Clear value exchange**: £10 only if a match is found. This is low-risk for users.

4. **AI disclosure is prominent**: The landing page explains exactly what the AI does. This is both a trust signal and a constitutional requirement (Art.3.3).

5. **Hard exclusions + sensitive domains are handled**: Edge cases that could harm users are architecturally blocked.

### Friction points

1. **No concrete examples of successful goals**: The landing page lists categories (Career, Legal, Technical...) but gives no examples of what a well-framed goal looks like. First-time users don't know what to write.

2. **No response timeline for no-match case**: "We're working on finding the right person for you" with no timeframe. For a user who submitted and didn't get a match email, this feels like a dead end.

3. **Helper network is too thin to promise matches**: The current network has 1 helper (Sunil). No external user would find a match that wasn't the founder. This is the primary blocker for genuine use — more pressing than any copy change.

4. **No social proof**: No testimonials, case studies, or even illustrative examples of past connections. The concept is novel; social proof reduces uncertainty.

5. **Navigation inconsistency**: "Become a helper" was missing from privacy, support, terms, and feedback pages. Fixed this session.

6. **The blog CTA could work harder**: Blog posts drive discovery, but they don't end with a direct CTA to submit a goal or apply as a helper.

### The fundamental growth loop

```
User submits goal → AI decomposes → Match with helper → Introduction (£10)
                                  ↓ no match
                              Waiting room (currently: indefinite)
```

Both sides of the loop need to grow together. With 1 helper, every goal either matches Sunil or goes to the waiting room. The platform needs 5–10 helpers with diverse expertise before external user acquisition makes sense.

**The helper side is the bottleneck, not the user side.**

---

## Relevance

Constitution Art.3 (User-Driven Development) and the Phase 1 success metric require at least one external user end-to-end. That requires at least one more helper with complementary expertise to Sunil.

---

## Tasks generated

- **TSK-058** (P2): Add 3 concrete example goals to landing page (Career / Technical / Life decision) to reduce submission anxiety
- **TSK-059** (P2): Add "What to expect" timeline section to landing page — 24h acknowledgement, match within [N] days, or told if none found
- **TSK-060** (P3): Draft a Twitter/X thread about the platform's concept for @awebot1529222 — build-in-public helper recruitment
- **TSK-061** (P2): Add a CTA to the end of each blog post pointing to /join.html and the email submission — blog visitors are warm leads
- **TSK-062** (P2): Grow helper network — identify and reach out to 3 people outside the panel who could be early helpers (Sunil's network or cold outreach via build-in-public)
- **TSK-063** (P3): Add "no match" timeout: if goal is in 'matched' status with no payment for 7 days, email user to ask if still relevant or if we should keep looking
