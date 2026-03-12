# Decision 007: Model Orchestration Layer

**Date:** 2026-03-12
**Status:** Implemented
**Confidence:** 85%

## Context

The platform was making direct `@anthropic-ai/sdk` calls in `decompose.js` and `match.js`, with hardcoded model names, pricing constants, and manual token logging. This tightly coupled the application to a single provider, made cost tracking fragile, and required code changes to swap models.

The auto-session infrastructure (`scripts/auto-session.sh`) runs Claude CLI every 6 hours. Many sub-tasks it performs (email classification, feedback analysis, draft generation) could be delegated to cheaper models instead of using the CLI's own expensive inference.

## Decision

Build a role-based model orchestration layer with three dispatch adapters:

1. **OpenRouter** (primary cloud) — multi-model access via OpenAI-compatible API
2. **Anthropic SDK** (fallback cloud) — direct SDK calls for resilience when OpenRouter is unavailable
3. **Ollama** (local) — zero-cost local inference for hardware that supports it

Route the Claude CLI itself through OpenRouter via environment variable overrides, unifying all AI costs under a single billing account.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Direct Anthropic SDK only | Simple, already working | Single provider lock-in, no cost optimisation |
| OpenRouter only | Multi-model access, unified billing | Single point of failure |
| Three adapters (chosen) | Resilience, cost optimisation, local inference | More code to maintain |
| LiteLLM / other abstraction library | Less code to write | New dependency, runtime overhead, less control |

## Architecture

```
infer({ role, messages, system })
  → resolveRole(role)        [config/roles.yaml → config/models.yaml]
  → checkBudget(role)         [monthly + per-role caps]
  → dispatch(model, fallback) [adapter routing + automatic fallback]
  → normalise(response)       [unified response shape]
  → logUsage(response)        [token_usage table with provider + cost_usd]
```

### Config-driven routing

- `config/models.yaml` — model registry with provider type, model identifier, cost, capabilities
- `config/roles.yaml` — maps application roles (decomposer, matcher, classifier, drafter, analyser) to models with overrides and budget caps

Adding a new model or changing a role's model is a config change, not a code change.

### Auto-session integration

- Claude CLI routed through OpenRouter via env var overrides in `auto-session.sh`
- `scripts/orch-infer.js` provides a bash-invocable interface for delegated inference
- Operational roles (classifier, drafter, analyser) for auto-session sub-tasks

## Key Technical Choices

| Choice | Rationale |
|--------|-----------|
| Native `https`/`http` for HTTP calls | Matches existing `email.js` pattern, no new deps |
| Retained `@anthropic-ai/sdk` | Serves as fallback adapter; already a dependency |
| YAML config (2 files) | Supports comments; models and roles cleanly separated |
| `token_usage` table + new columns | Preserves existing production data |
| llmfit for hardware detection | Optional; graceful degradation if not installed |
| `node:test` for testing | Built-in, no test framework dependency |

## Deferred

- Strategy-based routing (round-robin, cost-optimised, latency-optimised)
- Tool-use loop (`tool_loop()`)
- Streaming (`stream()`)
- Config hot-reload
- Full CLI (`orch` command)
- OpenRouter `max_price` per-call cost enforcement
- Active health monitoring
- OpenAI-compatible adapter (for vLLM, LM Studio)

## Files

### Created (14 files, ~820 lines)
- `config/models.yaml`, `config/roles.yaml`
- `src/orchestration/index.js`, `config.js`, `registry.js`, `dispatch.js`, `response.js`, `ledger.js`, `budget.js`, `hardware.js`
- `src/orchestration/adapters/openrouter.js`, `anthropic.js`, `ollama.js`
- `scripts/orch-infer.js`

### Modified (6 files)
- `src/services/decompose.js` — replaced SDK calls with `infer()`
- `src/services/match.js` — replaced SDK calls with `infer()`
- `src/db/migrate.js` — added `token_usage` table + columns
- `scripts/budget-check.js` — uses `cost_usd` column when available
- `scripts/auto-session.sh` — OpenRouter routing + delegation guidance
- `package.json`, `Dockerfile`, `.env.example`

### Tests (5 files, ~300 lines)
- `src/orchestration/__tests__/config.test.js`
- `src/orchestration/__tests__/dispatch.test.js`
- `src/orchestration/__tests__/budget.test.js`
- `src/orchestration/__tests__/ollama.test.js`
- `src/orchestration/__tests__/integration.test.js`

## Verification

1. All 42 tests pass: `node --test 'src/orchestration/__tests__/*.test.js'`
2. Config loads and validates without errors
3. Adapter routing tested with mocked HTTP (Ollama) and error paths (Anthropic, OpenRouter)
4. Budget gates enforce global and per-role caps
5. Response normalisation verified for all three provider formats

## Outcome

_To be updated after production deployment and first week of operation._
