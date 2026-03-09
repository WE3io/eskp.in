# Research: Goal Decomposition Approaches

**Date:** 2026-03-09
**Task:** TSK-027
**Category:** Research

---

## Question

Are there better approaches to goal decomposition than the current implementation? What does the 2025 state of the art look like for LLM-based structured output and task breakdown?

---

## Current Implementation (baseline)

`src/services/decompose.js`:
- Claude Haiku with a system prompt that defines a JSON schema (summary, needs[], context, outcome)
- Prompt injection defence: untrusted input wrapped in `<user_submission>` tags, instructions to ignore embedded commands
- Input sanitisation: strips null bytes and control characters
- Monthly cost cap check before each call
- Strips code fences from response before JSON.parse
- No schema validation after parsing — trusts model output shape
- No retry logic for parse failures
- If too vague: returns a single "clarification needed" need — no loop-back mechanism

---

## Sources

- [LLM Agent Task Decomposition Strategies — apxml.com](https://apxml.com/courses/agentic-llm-memory-architectures/chapter-4-complex-planning-tool-integration/task-decomposition-strategies)
- [Mastering Agent Goal Decomposition — sparkco.ai](https://sparkco.ai/blog/mastering-agent-goal-decomposition-in-ai-systems)
- [The guide to structured outputs and function calling — agenta.ai](https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms)
- [LLM Structured Outputs: The Silent Hero of Production AI — decodingai.com](https://www.decodingai.com/p/llm-structured-outputs-the-only-way)
- [Real-Time Error Detection for LLM Structured Outputs — cleanlab.ai](https://cleanlab.ai/blog/tlm-structured-outputs-benchmark/)
- [Structured Decomposition for LLM Reasoning — arxiv.org](https://arxiv.org/abs/2601.01609)

---

## Findings

### 1. Structured output fragility is a well-known production problem

The research confirms that "return ONLY valid JSON" instructions are fragile in production. A prompt that works in testing starts failing after a model update. The recommended 2025 approach is to enforce structure at generation time rather than catching malformed output after the fact.

Anthropic's Claude API supports tool_use (function calling) which constrains output to a given schema. This is more reliable than prompt-based JSON instructions. The current implementation is one model update away from a JSON parse failure.

**Relevance:** The current `try { JSON.parse(text) }` in decompose.js will throw uncaught exceptions if the model deviates from schema. There is no fallback — the goal submission fails silently from the user's perspective.

### 2. Schema validation after parsing is missing

Even with well-formed JSON, the model can return a structurally valid object that doesn't match the expected schema (e.g., `needs` is missing, `urgency` has an unexpected value). Currently there is no validation of the parsed result before it's stored or acted on. Production systems should validate against a schema (e.g. Zod, JSON Schema) before trusting the output.

### 3. Retry logic for parse failures

Best practice is 1–2 retries with a modified prompt on parse failure before giving up. This handles transient model deviations. Currently: one attempt, hard throw.

### 4. DAG vs flat needs array

Research distinguishes between linear sequences and Directed Acyclic Graphs for decomposed sub-tasks. Our current flat `needs[]` array is a linear sequence. For complex goals (e.g. "I want to start a business") this is fine at our current scale — a single helper per goal is the current design. A DAG structure would only be valuable when we support multiple concurrent helpers per goal (a future capability). **No action needed now.**

### 5. Clarification loop

When a goal is too vague, the engine returns a "clarification" need. But there is no mechanism to route this back to the user and await a revised submission. The user gets an email intro to a helper whose job is apparently "provide clarification" — an odd experience. A clarification loop would improve quality but requires a stateful conversation mechanism (e.g. reply-to email parsing into a goal update). This is a medium-priority product improvement.

### 6. Hybrid LLM + symbolic approach

Research points to hybrid LLM + symbolic reasoning (LLM populates ontology, symbolic rules verify). At our scale this is over-engineering. The current pure-LLM approach is appropriate for Phase 1.

---

## Relevance to Platform

The decomposition quality directly affects matching quality and user experience. The two most impactful near-term improvements are:

1. **Output validation** (schema check after parse) — prevents bad data entering the DB
2. **Retry logic** — reduces silent failures from transient model deviations
3. **Structured output via tool_use** — the most robust fix, worth evaluating

The clarification loop is a genuine product gap but requires more infrastructure.

---

## Tasks Generated

| ID | Description | Priority | Rationale |
|----|-------------|----------|-----------|
| TSK-031 | Add Zod schema validation to decompose.js output before DB write | P2 | Prevents malformed decompositions entering DB; silent failures are worse than loud ones |
| TSK-032 | Add 1-retry logic to decompose.js on JSON parse failure | P2 | Cheap resilience against transient model deviations |
| TSK-033 | Investigate Anthropic tool_use for decompose.js structured output enforcement | P3 | More robust than prompt-based JSON; evaluate if it reduces failure rate |
| TSK-034 | Design clarification loop: route "vague goal" back to user via email for refinement | P3 | Improves match quality; requires email reply parsing |
