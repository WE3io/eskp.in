# Research: Anthropic Prompt Caching & Batch API for Cost Reduction

**Date:** 2026-03-11
**Category:** Research (self-directed rotation)
**Question:** Can Anthropic's prompt caching or batch API reduce our API costs?

## Sources

- [Anthropic Prompt Caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Anthropic Batch API announcement](https://www.anthropic.com/news/message-batches-api)
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)

## Current API Usage Profile

We make two types of API calls, both using `claude-haiku-4-5-20251001`:

1. **decompose.js** — Goal decomposition. System prompt (~500 tokens) + tool schema (~300 tokens) + user submission (variable). Called once per goal submission.
2. **match.js** — Helper ranking. Dynamic prompt with goal summary + helper list. Called once per goal (only when >1 helper exists). Currently skipped (1 active helper).

**Total March 2026 spend: $0.014** across 8 API calls.

## Findings

### Prompt Caching

**How it works:** Mark prompt segments with `cache_control: { type: "ephemeral" }`. Cached content costs 1.25x on first write, then 0.1x on subsequent reads within the 5-minute TTL (or 1-hour TTL at 2x write cost).

**Minimum token threshold for Haiku 4.5: 4,096 tokens.** This is critical.

Our decompose.js system prompt + tool definition totals ~800 tokens — well below the 4,096 minimum. Caching directives would be silently ignored. We would need to pad the prompt to ~4,096 tokens to benefit, which is counterproductive.

Our match.js prompt is mostly dynamic (goal-specific content + helper list), so only a small static portion could be cached, also below the threshold.

**Verdict: Not applicable at current prompt sizes.** Prompt caching would only help if:
- We switched to a model with a lower threshold (Sonnet: 1,024 tokens), but Sonnet costs 3.75x more per token
- Our prompts grew significantly larger (e.g., few-shot examples, longer system instructions)
- We processed many goals in rapid succession (within 5-minute TTL)

### Batch API

**How it works:** Submit up to 10,000 requests asynchronously. Results returned within 24 hours. 50% discount on both input and output tokens.

**Implementation:** `client.beta.messages.batches.create({ requests })` with custom_id per request. Poll for completion, then iterate results.

**Verdict: Poor fit for our real-time flow.** Our architecture is email-in → decompose → match → email-out, all synchronous. Users expect a response within minutes, not hours. Batch API is designed for bulk offline processing (content moderation, data enrichment, etc.).

Batch API could be useful for:
- Monthly data retention jobs that need AI classification
- Bulk re-decomposition if we change the prompt significantly
- Analytics/research tasks (e.g., re-scoring all historical matches)

None of these exist yet.

### Combined (Caching + Batch)

Theoretically up to 85% savings (50% batch + 90% cache read). But both prerequisites fail: our prompts are too small for caching and our flow is too real-time for batching.

## Relevance to eskp.in

At $0.014/month total API spend, optimisation is premature. The entire platform could process ~2,000 goals/month before hitting the $30 budget on Haiku alone. Cost reduction features become relevant at:

| Trigger | Feature | Estimated savings |
|---|---|---|
| Prompts grow past 4,096 tokens (e.g., few-shot examples) | Prompt caching | Up to 90% on cached portion |
| Batch analytics/re-processing needed | Batch API | 50% on batch jobs |
| 100+ goals/month with Sonnet upgrade | Prompt caching (Sonnet threshold: 1,024) | Up to 90% on system prompt |

## Tasks Generated

None. Current spend is negligible and architecture doesn't benefit from either feature. Revisit when:
- API spend exceeds $5/month, OR
- We add few-shot examples to prompts (pushing past 4,096 token threshold), OR
- We need bulk offline processing
