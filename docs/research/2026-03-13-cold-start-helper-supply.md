# Research: Cold-start helper supply strategies for eskp.in

**Date:** 2026-03-13
**Category:** Research (self-directed)
**Question:** What works for bootstrapping supply on a two-sided advice/expert marketplace when you have 1 helper?

---

## Sources

- Web search: two-sided marketplace cold start strategies (2025-2026)
- Web search: expert marketplace helper recruitment strategies
- Web search: expert network supply-side activation strategies
- Andrew Chen's *The Cold Start Problem* (frameworks)
- Airbnb/Uber/Bumble bootstrap case studies (public)

---

## Findings

### 1. The binding constraint is supply

eskp.in has 1 active helper (Sunil) and 12 goals. The platform is supply-constrained. Every cold-start playbook says: **solve the hard side first**. For us, the hard side is helpers.

### 2. What works at single-digit supply

| Strategy | Effort | Effectiveness | Applies to us |
|----------|--------|---------------|---------------|
| **Manual high-touch outreach** | High | Very high | Yes — direct email/LinkedIn to specific people |
| **Founder-as-first-helper** | Low | High | Already doing this (Sunil) |
| **Convert demand to supply** | Medium | Medium | Possible — goal submitters who could help others |
| **Professional association partnerships** | Medium | Medium | Not yet — too early |
| **Cold email to domain experts** | Medium | High | Yes — recruitment drafts already exist |
| **Referral from existing helpers** | Low | High | Not yet viable (need 3+ helpers first) |
| **Incentive loops** | Medium | Medium | Not appropriate at this stage (no revenue) |
| **Geo-targeted density** | N/A | N/A | We're email-first, not geo-dependent |

### 3. The "Aha" moment for helpers

For marketplace supply activation, the critical metric is time-to-first-engagement. Airbnb's was "first booking within 30 days." For eskp.in helpers, the Aha moment is: **receiving a well-matched goal that they can genuinely help with**.

Current state: Sunil received 1 real goal (ICO registration) that matched his expertise. This worked. But without volume, additional helpers would join and see nothing — a cold start death spiral.

### 4. Practical next steps for eskp.in

**A. Activate existing recruitment materials (blocked on Sunil)**
- LinkedIn post + personal outreach templates already drafted (docs/updates/003-linkedin-helper-recruitment.md)
- X/Twitter thread ready (docs/updates/002-helper-recruitment-thread.md)
- Sunil needs to post these — no platform action needed

**B. Target 3 helpers in overlapping but distinct domains**
- 1 career/professional transition person
- 1 business/startup person
- 1 education/learning person
- These align with our ICP goal archetypes and create enough variety to match different goals

**C. Seed demand before recruiting**
- Having 2-3 real goals in the pipeline before inviting a helper gives them an immediate match opportunity
- Consider asking Sunil to submit goals in areas where we want to recruit helpers (creates the match pipeline)

**D. Build helper activation tooling (low priority)**
- Weekly digest already exists (scripts/helper-digest.js)
- Pre-match notification already exists
- Pipeline visibility already in digest
- These are ready for when helpers arrive

**E. "Convert demand to supply" signal**
- Could add a soft CTA in follow-up emails: "Know someone who could help others with similar goals? They could join as a helper."
- This is the marketplace flywheel: users who got value become suppliers

### 5. What NOT to do yet

- Paid acquisition (no budget)
- Broad social media marketing (need helpers first)
- Referral incentives (need critical mass)
- Platform features for helper discovery (1 helper doesn't need a directory)

---

## Relevance

The binding constraint is clear: helper supply. All platform improvements have diminishing returns until there are 3+ active helpers. The most impactful action is **Sunil posting the existing recruitment materials**.

---

## Tasks generated

- TSK-165 (P3): Add "Know someone who could help?" soft CTA to post-introduction follow-up email (demand→supply flywheel)
- No other platform changes needed — the constraint is human action (Sunil posting recruitment content)
