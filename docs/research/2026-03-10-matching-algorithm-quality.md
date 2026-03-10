# Research: Matching Algorithm Quality & Multi-Helper Ranking

**Date:** 2026-03-10
**Category:** Research (self-directed rotation)
**Triggered by:** Self-directed.md suggested "matching algorithm quality / multi-helper ranking"

## Question

How should eskp.in's matching algorithm evolve as the helper network grows from 1 to 5 to 50+ helpers? What improvements are viable now vs. deferred?

## Sources

- [Optimal Matchmaking Strategy in Two-Sided Marketplaces](https://pubsonline.informs.org/doi/10.1287/mnsc.2022.4444) — Peng Shi, Management Science
- [Bootstrapping an Online Marketplace](https://rangle.io/blog/bootstrapping-an-online-marketplace) — cold start strategies
- [Sharetribe: Marketplace Funding — Bootstrapping](https://www.sharetribe.com/academy/marketplace-funding/bootstrapping/) — manual matching as bootstrap method
- [Mentorly Smart Matching](https://mentorly.com/en/smart-matching) — weighted multi-dimensional scoring
- [Growthspace Expert Matching](https://www.growthspace.com/glossary/expert-matching-algorithm) — taxonomy-based matching
- [AI Talent Matching](https://www.workgenius.com/glossary/ai-talent-matching/) — context-aware skill inference
- [SkillRank](https://onlinelibrary.wiley.com/doi/abs/10.1155/2015/451476) — hybrid expert confidence scoring

## Current State

`src/services/match.js` has two ranking paths:

1. **Semantic ranking** (Claude Haiku): sends goal summary + needs + helper profiles to LLM, returns scored rankings. Used when >1 helper and no sensitive-domain flag.
2. **Tag-overlap fallback**: counts matching canonical tags between goal needs and helper expertise. Used when LLM fails or sensitive content detected.

With 1 active helper, the algorithm short-circuits and returns the single helper without scoring. This is correct for bootstrap.

Match quality feedback exists (TSK-094: 1-click rating in follow-up emails, stored in `matches.user_rating`).

## Findings

### 1. Manual matching is the right bootstrap strategy

Literature consistently says: at <5 providers, algorithmic sophistication adds no value. Solved (sustainability expert marketplace) operated as a consultancy with manual matching before building marketplace features. eskp.in's current approach — single helper, LLM-scored matching — is appropriate. The human-in-the-loop element (panel review for sensitive domains) adds trust.

**Implication:** No algorithmic changes needed until 3+ active helpers.

### 2. Multi-dimensional weighted scoring beats single-signal ranking

Best practice for expert matching uses multiple signals with learned or configured weights:
- **Skill/tag overlap** (current: yes)
- **Expertise depth** (current: no — all tags treated equally)
- **Bio/description semantic similarity** (current: yes, via LLM)
- **Past match quality** (current: data exists but not used in ranking)
- **Availability/capacity** (current: no)
- **Response time history** (current: no)

Mentorly's approach: generate compatibility scores across dimensions, then combine with weights. This is more interpretable than a single LLM score.

**Implication:** When helpers reach 3+, add a composite scoring function that blends LLM semantic score with tag overlap count and historical match rating. This makes ranking more robust and less dependent on a single LLM call.

### 3. Feedback loop is the highest-value improvement

The match quality rating system (TSK-094) provides the signal. Currently it's stored but not used in matching decisions. Using historical ratings to adjust helper ranking is the single highest-ROI improvement:
- Helpers with consistently high ratings should rank higher (all else equal)
- Helpers with low ratings or no-response patterns should rank lower
- This creates a self-improving system without additional LLM cost

**Implication:** Add average match rating as a scoring signal in `findMatches()` when ranking multiple helpers.

### 4. Capacity awareness prevents over-matching

At scale, matching a helper who is already overloaded leads to poor outcomes. Even at 2-3 helpers, tracking active match count and factoring it into ranking prevents bottlenecks.

**Implication:** Add `active_match_count` to the helper query in `findMatches()` and penalize helpers near capacity.

### 5. Cold start for new helpers

New helpers have no rating history, creating a cold-start problem within the provider side. Best practices:
- Give new helpers a small ranking boost for their first N matches ("exploration bonus")
- Use their bio quality / expertise breadth as a proxy until ratings accumulate
- Don't disadvantage new helpers by sorting purely on historical performance

**Implication:** When implementing rating-weighted ranking, include a "new helper" exploration bonus.

### 6. Tool-use for match scoring (like decompose.js)

`decompose.js` already uses `tool_use` with forced `tool_choice` for structured output (TSK-033). `match.js` still uses freeform JSON parsing with markdown stripping. Migrating to tool_use would:
- Eliminate JSON parse failures
- Enforce schema (helper_id must be valid UUID, score 0-100)
- Be consistent with decompose.js pattern

**Implication:** Migrate `semanticRank()` to use Anthropic tool_use for structured output.

## Relevance to eskp.in

| Finding | Priority | When |
|---------|----------|------|
| No changes needed at 1 helper | — | Now |
| Feedback-weighted ranking | P3 | At 3+ helpers |
| Composite scoring (multi-signal) | P3 | At 3+ helpers |
| Capacity-aware matching | P3 | At 3+ helpers |
| New helper exploration bonus | P3 | At 5+ helpers |
| tool_use for match scoring | P3 | Now (reliability improvement) |

## Tasks Generated

- **TSK-107**: Migrate `semanticRank()` in match.js to use Anthropic tool_use (consistent with decompose.js pattern; eliminates JSON parse risk)
- **TSK-108**: Add historical match rating to helper ranking query (when 3+ helpers: blend avg rating into score)
- **TSK-109**: Add active match count to helper ranking (capacity-aware matching; when 3+ helpers)
