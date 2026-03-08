# Decision 003 — POST /goals authentication in Phase 1

**Date:** 2026-03-08
**Status:** Decided — revisit at Phase 2 (first external users)
**Confidence:** 80%

---

## Decision

`POST /goals` does **not** require authentication in Phase 1. Rate limiting (5/hour/IP at app level + nginx layer) and input validation are the primary abuse controls.

---

## Reasoning

In Phase 1, there are no external users. The endpoint exists for the panel to submit goals and for dogfooding. Requiring authentication before any users exist would block the legitimate use cases without meaningful security benefit (the panel knows the endpoint).

The real risks — budget drain and spam — are mitigated by:
- Rate limiting: 5 requests/hour/IP (app) + 60 requests/min/IP global (nginx)
- Monthly cost cap: $5 on Haiku decomposition calls; exceeding it queues submissions
- Input validation: email format, max 10,000 characters, 50kb body limit
- Cloudflare sits in front: DDoS protection, bot filtering at edge

---

## What would change this decision

When external users exist, `POST /goals` should require either:
- An email-based magic link / one-time token (low friction, fits the email-native UX)
- A simple API key per user (higher friction, better for programmatic use)

This is a Phase 2 decision. Flag it in current-sprint.md when external onboarding begins.
