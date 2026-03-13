# ADR-008: Bilateral Thread Isolation for Panel Members

**Status:** Accepted
**Date:** 2026-03-13
**Deciders:** Claude (operator), Panel (oversight)

## Context

Phase 2 introduces an advisory panel model where users can invite named people (friends, colleagues, matched helpers) to support them on a goal. Multiple panel members may exist per goal. The question is: should panel members see each other's contributions, or should each have a private bilateral thread with the user?

Key considerations:
- Users may share sensitive personal information (mental health, relationships, career struggles) with advisors
- Users may not want one advisor (e.g. a colleague) to see exchanges with another (e.g. a friend)
- Cross-advisor visibility could create social pressure or disclosure risk for users
- The helper match flow is being unified with the panel model

## Decision

**Each panel member has a strictly isolated bilateral thread with the user. No cross-advisor visibility.**

Implementation rules:
1. Every DB query serving a panel member's request must include `WHERE panel_member_id = $1` scoped to the authenticated `req.panelMember.id`
2. The `panel_sessions` table stores server-side session tokens (magic-link → httpOnly cookie)
3. Sessions are scoped to a single `panel_member_id` — a session cannot access another member's thread
4. The `emails` table records `panel_member_id` on all panel-related outbound emails so thread view only shows the member's own correspondence
5. The `panel_interactions` audit log records metadata only (no thread content) — this is a privacy boundary

## Consequences

**Positive:**
- Users can safely share different things with different advisors
- Advisors cannot be compared or have their contributions judged against each other
- Reduces social complexity and potential for conflict between advisors

**Negative:**
- Platform cannot synthesise cross-advisor perspectives (by design)
- If the same issue appears in multiple threads, the platform cannot detect it (acceptable — privacy wins)

## Baseline Metric: Witnessed Reflection

The onboarding module introduces the concept of "witnessed reflection" (holding space vs directing). To track whether onboarding has any effect on panel member communication style:

**Metric definition:** Ratio of directive phrasings (imperative verbs, "you should", "you need to", "I think you should") to total sentences in panel member emails, sampled at 30 and 90 days after onboarding.

**Methodology:** Manual review of a random sample of 10–20 panel member emails per cohort. Not automated — privacy constraint: automated analysis of email content would require additional DPIA review. Sampling is done by a panel member with data access, results summarised without reproducing email content.

**Baseline (pre-launch):** Not yet established. First measurement due: 30 days after first panel member completes onboarding.

**Success signal:** <20% directive phrasing ratio in emails from members who completed onboarding; comparison to any pre-onboarding baseline available.
