# Embedding-Based Matching: Semantic Similarity Without Per-Match LLM Calls

**Date:** 2026-03-11
**Category:** Research
**Question:** Can we replace or supplement the per-match Claude Haiku LLM call with embedding-based semantic similarity to reduce cost, latency, and external API dependency?

## Current State

`src/services/match.js` calls Claude Haiku (`claude-haiku-4-5-20251001`) via `tool_use` for every goal-to-helper ranking. This works well at bootstrap scale (1 helper, ~12 goals) but has structural limitations:

- **Cost per match**: ~$0.001–0.002 per call (input ~500 tokens, output ~200 tokens). Negligible now; grows linearly with volume.
- **Latency**: 1–3 seconds per match API call.
- **External dependency**: every match requires a network call to Anthropic.
- **Already has fallback**: tag-overlap ranking works when LLM fails or sensitive domains are flagged.

## Approaches Investigated

### 1. Voyage AI Embeddings (Anthropic's recommended partner)

Anthropic does not offer its own embedding model; they recommend Voyage AI.

- **Models**: voyage-3.5 ($0.06/MTok), voyage-3.5-lite ($0.02/MTok), voyage-4-large (MoE, 40% cheaper than comparable dense models)
- **Free tier**: 200M tokens for general models
- **Quality**: state-of-the-art on MTEB benchmarks; domain-specific models available
- **How it works**: embed helper profiles and goal summaries → cosine similarity → rank
- **Pros**: very cheap at scale ($0.02–0.06 per million tokens vs $0.80/$4.00 for Haiku), fast batch processing, precomputable helper embeddings
- **Cons**: new API dependency (Voyage AI / MongoDB), new API key to manage, still an external call (though much cheaper/faster)

### 2. Local Embeddings via @huggingface/transformers (transformers.js)

Run embedding models directly in Node.js using ONNX Runtime — no external API calls.

- **Models**: `all-MiniLM-L6-v2` (384-dim, fast, good general purpose), `snowflake-arctic-embed-m-v2.0`, others
- **Cost**: $0 per call — models run locally
- **Latency**: 10–100ms depending on model size and hardware
- **How it works**: same embed → cosine similarity → rank approach, but entirely local
- **Pros**: zero cost, zero latency, zero external dependency, privacy-preserving (no data leaves server), works offline
- **Cons**: model download (~80–350MB), memory footprint (~200–500MB in RAM), lower quality than Voyage/OpenAI on some benchmarks, CPU-only on our Hetzner VPS (no GPU)

### 3. Hybrid: Embeddings for pre-filtering, LLM for final ranking

Use embeddings (local or API) to pre-filter and rank the top candidates, then use Haiku only for the final top-K helpers. This reduces LLM calls from N to K (where K << N at scale).

- At current scale (1 helper): no benefit — Haiku call is already fast
- At 10+ helpers: embed all, cosine-rank, send top 3 to Haiku for nuanced reasoning
- **Pros**: best of both worlds — embedding speed + LLM judgement quality
- **Cons**: added complexity for a problem that doesn't exist yet

## Relevance to eskp.in

### When This Matters

The current system handles matching well at bootstrap scale. The LLM-based approach becomes costly/slow at:
- **10+ helpers**: ranking all of them via Haiku adds up
- **50+ goals/day**: each triggers a Haiku call
- **Real-time matching**: if we want instant results rather than async email

### When It Doesn't Matter (Yet)

- With 1 active helper, findMatches() returns immediately (no ranking needed — line 63)
- Monthly Haiku spend is $0.014 total across all operations
- Current tag-overlap fallback already works without LLM

### Privacy Consideration

Local embeddings (option 2) align strongly with Article 10 (data minimisation) and DPIA recommendations — no goal data leaves the server for matching. This is architecturally superior for sensitive domains.

## Recommendation

**Do not implement now.** The current LLM-based matching works, costs are negligible, and we have 1 helper. But prepare for the transition:

### Phase triggers

| Trigger | Action |
|---------|--------|
| 3+ active helpers | Evaluate transformers.js local embeddings for pre-filtering |
| 10+ helpers OR 20+ goals/day | Implement hybrid: local embeddings for pre-filter → Haiku for top 3 |
| Budget pressure (Haiku matching >$5/month) | Switch primary ranking to embeddings; Haiku for edge cases only |
| Sensitive domain volume increase | Prioritise local embeddings to replace tag-overlap (better quality, still local) |

### Implementation sketch (when triggered)

1. Add `@huggingface/transformers` dependency (~80MB model download for all-MiniLM-L6-v2)
2. Create `src/services/embeddings.js`:
   - `embedText(text)` → Float32Array (384-dim)
   - `cosineSimilarity(a, b)` → number
   - Lazy model loading (first call downloads/caches the model)
3. On helper create/update: compute and store embedding in `helpers.embedding` (JSONB or bytea)
4. On goal decompose: compute embedding of summary + needs text
5. In `findMatches()`: cosine-rank all helpers by embedding similarity before/instead of Haiku call
6. Memory budget: ~300MB for model + runtime on our 3.7GB VPS — acceptable with current 1.1GB usage

### Estimated effort

- 2–3 hours for basic local embedding matching
- 1 hour for hybrid (embeddings + Haiku for top-K)
- Ongoing: re-embed helpers when profiles change

## Tasks Generated

- **TSK-114** (P3): When 3+ helpers exist, add @huggingface/transformers and implement local embedding-based pre-filtering in match.js
- **TSK-115** (P3): Add `embedding` column to helpers table; compute on helper create/update

## Sources

- [Anthropic Embeddings Docs](https://docs.claude.com/en/docs/build-with-claude/embeddings)
- [Voyage AI Pricing](https://docs.voyageai.com/docs/pricing)
- [Voyage 4 announcement](https://blog.voyageai.com/2026/01/15/voyage-4/)
- [@huggingface/transformers npm](https://www.npmjs.com/package/@huggingface/transformers)
- [How to Create Vector Embeddings in Node.js](https://philna.sh/blog/2024/09/25/how-to-create-vector-embeddings-in-node-js/)
- [Transformers.js docs](https://huggingface.co/docs/transformers.js/index)
- [Best Embedding Models 2026](https://www.openxcell.com/blog/best-embedding-models/)
- [LLMs vs Semantic Search](https://aicompetence.org/llms-vs-semantic-search-do-embeddings-matter/)
