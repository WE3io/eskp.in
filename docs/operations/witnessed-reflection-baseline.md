# Witnessed Reflection Baseline Metric — Methodology

**Version:** 1.0
**Created:** 2026-03-14
**Constitutional basis:** Art 10.4 (Empirical Honesty), Art 10.3.1 (Self-efficacy not dependency), Art 11.2 (Witnessed reflection as platform default)
**ADR reference:** docs/decisions/008-bilateral-thread-isolation.md §Metric Definition

---

## Purpose

The witnessed reflection principle holds that helpers should *witness and reflect* a user's thinking back to them, rather than direct or advise. This is the platform's intended interaction mode.

This document defines how to measure whether the platform's onboarding and design successfully cultivate that mode in practice.

---

## Metric Definition

**Directive phrasing ratio (DPR):**
The proportion of sentences in a panel member's messages that contain directive phrasing patterns, sampled from a representative set of messages.

```
DPR = directive_sentences / total_sentences
```

**Directive phrasing patterns (case-insensitive):**
- Modal directive phrases: "you should", "you need to", "you must", "you have to", "you ought to"
- Imperative openers: sentences beginning with imperative verbs where the subject is implied ("Go do X", "Try X", "Call X", "Stop doing X")
- Strong recommendations: "I think you should", "I recommend", "my advice is", "the right thing is", "you're wrong to"
- Certainty projections onto the user's situation: "the problem is you", "what you need is"

**Reflective phrasing patterns (reference; not in denominator, but tracked for context):**
- Exploratory questions: "what do you think about...", "how does that feel...", "what would it look like if..."
- Paraphrasing openers: "it sounds like...", "what I'm hearing is...", "it seems like you're saying..."
- Validating responses: "that makes sense", "I can understand why", "that sounds difficult"

---

## Measurement Protocol

### Sampling

1. Draw a random sample of ≥ 20 messages from each panel member, after they have sent at least 20 messages total.
2. If fewer than 20 messages exist, defer measurement.
3. For the baseline (pre-onboarding context or early onboarding), sample the first 10 messages after onboarding completion.
4. For 30-day measurement, sample messages sent in days 20–40 after first panel session.
5. For 90-day measurement, sample messages sent in days 75–105 after first panel session.

### Calculation

1. Split each message into sentences (split on `.`, `!`, `?`, newlines).
2. Apply directive phrasing pattern matching (regex, case-insensitive) to each sentence.
3. Count `directive_sentences` and `total_sentences`.
4. Compute DPR per member, per time period.

### Data source

- Table: `panel_interactions`
- Column: `content` (message body)
- Filter: `type = 'message'`, `author_type = 'advisor'`
- Join to `panel_members` to get advisor and onboarding date

### Privacy note

Message content is not transmitted to any external service for this measurement. All processing runs locally against the `panel_interactions` table. No PII is extracted; only aggregate DPR scores are recorded in this document.

---

## Baseline Status

**Current baseline: Not established.**

Condition for first measurement: first panel member completes onboarding (completes all 7 sections in `panel_members` onboarding flow) AND has sent ≥ 20 messages.

**Trigger:** When the above condition is met, run the measurement script (see below) and record the result in the History table.

---

## Targets

| Timepoint | Target DPR | Notes |
|-----------|-----------|-------|
| Pre-onboarding or week 1 | No target; record as baseline | Some directive phrasing expected initially |
| 30 days post-onboarding | < 30% | Improvement expected after onboarding |
| 90 days post-onboarding | < 20% | Success signal per ADR-008 |

If DPR remains > 30% at 90 days, trigger a review of the onboarding module (see `docs/backlog/phase-2/witnessed-reflection-onboarding.md`).

---

## Measurement Query

```sql
-- Get advisor messages for a given panel member (by user_id)
SELECT
  pi.id,
  pi.content,
  pi.created_at,
  pm.onboarding_completed_at
FROM panel_interactions pi
JOIN panel_members pm ON pm.panel_id = pi.panel_id
  AND pm.user_id = pi.actor_id
WHERE pi.type = 'message'
  AND pi.actor_role = 'advisor'
  AND pm.user_id = $1  -- advisor user_id
  AND pi.created_at >= pm.onboarding_completed_at
ORDER BY pi.created_at;
```

Run this query and apply the DPR calculation to the result set.

---

## Measurement Script Location

When implemented: `scripts/witnessed-reflection-measure.js`
(Not yet created — implement when first measurement is triggered.)

---

## History

| Date | Panel member | Timepoint | Messages sampled | DPR | Notes |
|------|-------------|-----------|-----------------|-----|-------|
| — | — | Baseline not yet established | — | — | Awaiting first panel member with ≥ 20 messages |

---

## Review Schedule

- First measurement: 30 days after first panel member sends ≥ 20 messages
- Ongoing: per-member at 30 and 90 days post-onboarding
- Annual review of targets and patterns: alongside Art 10.2.3(d) algorithm audit (2027-03-08)
