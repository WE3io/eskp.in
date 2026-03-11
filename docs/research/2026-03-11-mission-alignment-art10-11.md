# Mission Alignment Review: Articles 10 & 11

**Date:** 2026-03-11 (session 29)
**Previous alignment review:** Session 23 (Arts 1 & 3)
**Reviewer:** Claude (Opus 4.6)

## Question

Are Articles 10 (Platform Architecture Principles) and 11 (Professional Boundaries, Duty of Care, Trust Directory) being implemented faithfully? Are there gaps between constitutional requirements and the current codebase?

## Method

Systematic review of each article sub-section against codebase, public pages, and operational procedures.

## Findings

### Article 10.1 — Dyadic Privacy Architecture

**Status: Compliant (Phase 1 context)**

- Email-based interaction is inherently bilateral — each thread is user↔helper.
- AI processes each goal independently; no cross-goal or cross-user inference.
- The four-tier visibility model is not yet formally implemented in the data model (no tier metadata on fields), but the current email-only architecture naturally enforces bilateral isolation.
- **Note:** When the platform moves beyond email to persistent threads (Phase 2), the four-tier model will need explicit technical enforcement. The `bilateral-thread-isolation` Phase 2 backlog item covers this.

### Article 10.2 — Anti-Enshittification Framework

**10.2.1 — No advertiser class:** Compliant. Terms section 11 explicitly commits. No advertising code exists. ✅

**10.2.2 — Data portability:** Compliant. `getExportData()` in `src/services/account.js` returns all user data as JSON (account, goals, matches, emails, feedback, helper_profile, helper_applications). Available immediately via token link. Exceeds GDPR minimum (immediate, not 30-day). ✅

**10.2.3 — Algorithmic transparency:**
- (a) Disclosed: ✅ — Landing page, privacy policy, intro emails all reference AI.
- (b) Explainable: ✅ — Match emails include "Our AI matched your goal to X" with reasoning.
- (c) **User-adjustable or fully opt-outable: GAP** — Privacy policy (s3) says "email us and we will handle it manually" but no code exists to detect AI opt-out requests or flag users/goals for manual-only processing. An opt-out email would be treated as a regular goal submission.
- (d) **Audited annually: NOT YET APPLICABLE** — Platform is <1 month old. Need to schedule for March 2027.

**10.2.4 — User Advisory Council:** Deferred to Phase 3. Backlog item exists (`docs/backlog/phase-3/user-advisory-council-bootstrap.md`). Appropriate — cannot form a council with 0 external users. ✅

**10.2.5 — Exit costs low:** Compliant. Account deletion (immediate, single-click confirmation). Data export (immediate JSON download). No lock-in. ✅

### Article 10.3 — Panel Model Principles

**Status: Phase 1 bootstrap — diverges by design, not by neglect.**

The current model is cold matching to strangers (user → platform AI → helper), not user-formed panels from existing relationships (Art 10.3.2). This is an acknowledged Phase 1 bootstrap pattern. The matching algorithm does promote capability-based matching over demographic similarity, which aligns with 10.3.3 (compositional diversity). Self-efficacy (10.3.1) is not yet measured.

### Article 10.4 — Empirical Honesty

**Status: Partial compliance**

- ✅ `pnpm stats` tracks funnel metrics (goals, matches, payments, ratings).
- ✅ TSK-094 added match quality rating (1-5) in follow-up emails.
- ✅ Landing page language is appropriately humble ("early-stage", "small network", "honest about our limits").
- **GAP:** No outcome measurement. The platform tracks whether a match was *made* and how it was *rated*, but not whether the goal was *achieved*. Art 10.4.1 requires measuring "whether the claim is true for its actual users." At 0 external users this is premature, but the infrastructure for outcome tracking should be designed.

### Article 11.1 — Exclusion Framework

**Status: Compliant** ✅

- Exclusion register at `docs/operations/exclusion-register.md` — 10 hard exclusion domains, 9 sensitive handling domains.
- `src/services/hard-exclusion.js` — content-triggered warm referral with professional signposting.
- `src/services/sensitive-flag.js` — 7 domain patterns, panel alert on match.
- Annual review scheduled for 2027-03-08.

### Article 11.2 — Duty of Care

**Status: Compliant** ✅

- Privacy tension disclosure in privacy.html and terms.html (TSK-015).
- Safety resources at /support.html — persistently accessible, not content-triggered (Art 11.2.3).
- Emergency override protocol at `docs/operations/emergency-override-protocol.md`.
- Safeguarding obligations in terms.html s7 and join.html.

### Article 11.3 — Trust Directory

**Status: Not built — Phase 2/3.** Constitutional constraints documented in backlog. ✅

### Article 11.4 — Witnessed Reflection

**Status: Not yet operationalised in onboarding.**

At 1 helper (Sunil, the founder), formal onboarding around witnessed reflection vs. active advice has not been implemented. Phase 2 backlog items exist (`witnessed-reflection-onboarding.md`, `witnessed-reflection-measurement.md`). Low risk at current scale.

## Summary of Gaps

| # | Gap | Article | Severity | Action |
|---|-----|---------|----------|--------|
| 1 | AI opt-out requests have no detection or processing path | 10.2.3(c) | P2 | TSK-118: Implement AI opt-out flag on goals; detect in inbound email handler |
| 2 | No outcome measurement infrastructure | 10.4.1 | P3 | TSK-119: Design outcome tracking (defer implementation to first external users) |
| 3 | Annual algorithm audit not scheduled | 10.2.3(d) | P3 | Add to recurring tasks table (due 2027-03-08) |

## Tasks Generated

- **TSK-118** (P2): AI opt-out detection + manual processing path — when a user emails requesting no AI processing, detect this and route the goal to panel for manual decomposition and matching.
- **TSK-119** (P3): Outcome tracking design — design a lightweight mechanism to ask users whether their goal was achieved after introduction, for empirical honesty reporting.
- Recurring task: Annual algorithm audit (due 2027-03-08).
