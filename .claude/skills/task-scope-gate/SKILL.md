---
name: task-scope-gate
description: >
  Evaluate and iteratively improve the scoping quality of prompts before they
  are sent to Claude Code Agent Teams or any multi-agent system. Use this skill
  whenever the user wants to prepare a task for agent teams, whenever they
  mention "scope check", "task readiness", "agent team prep", "is this prompt
  good enough", or whenever they are about to delegate work to multiple agents
  and want to avoid burning tokens on a vague brief. Also trigger when a user
  says things like "check my prompt", "score this task", "is this ready for a
  team", or "help me scope this". This skill acts as a quality gate that will
  not pass a task through until it meets a minimum threshold across all
  dimensions.
---

# Task Scope Gate

A ruthlessly strict quality gate for prompts destined for multi-agent execution.

## Why this exists

Agent teams burn 15× more tokens than single-session chats. Vague tasks produce
vague results. The number one cause of agent team failure is not bad code — it is
misalignment between what the human intended and what the agents assumed. This
skill exists to eliminate that gap before a single token is spent on execution.

The gate operates on a simple principle: **if you cannot describe the task
precisely enough to pass this gate, the task is not ready for a team.**

## The Scoping Profile

The profile has **8 dimensions**. Each dimension is scored 0–10. The **minimum
passing threshold is 7 per dimension and 60 overall** (out of 80). A task that
scores below 7 on any single dimension is blocked regardless of its overall score.

Read `references/dimensions.md` for the full specification of each dimension,
including scoring rubrics, failure examples, and the exact questions to ask the
user when a dimension falls below threshold.

For a complete worked example showing the gate applied to a real prompt (from raw
intake through remediation to clearance), read `references/worked-example.md`.

## Workflow

### Phase 1: Intake

1. Accept the user's raw task prompt (however rough).
2. Do NOT attempt to improve it yet. First, score it.

### Phase 2: Score

1. Read `references/dimensions.md` to load the full scoring rubric.
2. Evaluate the prompt against all 8 dimensions.
3. For each dimension, assign a score 0–10 with a one-line rationale.
4. Calculate the overall score (sum of all dimensions, max 80).
5. Present the scorecard to the user in this format:

| Dimension                | Score | Status         |
|--------------------------|-------|----------------|
| 1. Objective Clarity     |  X/10 | PASS / BLOCKED |
| 2. Decomposability       |  X/10 | PASS / BLOCKED |
| 3. Boundary Definition   |  X/10 | PASS / BLOCKED |
| 4. Acceptance Criteria   |  X/10 | PASS / BLOCKED |
| 5. Context Sufficiency   |  X/10 | PASS / BLOCKED |
| 6. Dependency Mapping    |  X/10 | PASS / BLOCKED |
| 7. Risk & Constraint     |  X/10 | PASS / BLOCKED |
| 8. Coordination Model    |  X/10 | PASS / BLOCKED |
| **OVERALL**              | XX/80 | PASS / BLOCKED |

Below the scorecard, provide a brief diagnostic paragraph (3–5 sentences)
summarising what is strong and what is weak. Focus on the blockers.

### Phase 3: Remediate

For each dimension scoring below 7:

1. Explain in plain language WHY it scored low (one sentence).
2. Ask the user a targeted question designed to extract the missing information.
   Use the question bank in `references/dimensions.md` — do not improvise generic
   questions.
3. Collect all below-threshold questions into a single turn. Do not drip-feed
   them one at a time across multiple turns.

Aim for no more than 8 questions total per remediation round. If more are needed,
prioritise the dimensions with the lowest scores first.

### Phase 4: Re-score

After the user answers:

1. Incorporate their answers into a revised version of the task prompt.
2. Show them the revised prompt (so they can see how their answers were integrated).
3. Re-score all 8 dimensions. Present a new scorecard.
4. If still below threshold, return to Phase 3 (but only for remaining blockers).

### Phase 5: Gate Decision

When all dimensions score ≥ 7 and the overall score is ≥ 60:

1. Mark the task as **CLEARED**.
2. Present the final, refined task prompt.
3. Provide a recommended team composition based on the task structure:
   - How many teammates
   - What role/focus each should have
   - Which files/directories each should own
   - What the coordination model should be
   - Whether plan approval should be required before execution
4. Offer the user the option to copy the refined prompt or proceed directly.

If the user explicitly asks to override the gate, comply but add a clear warning
about the specific risks based on which dimensions are still below threshold.
Frame risks in terms of wasted tokens and likely failure modes.

## Scoring Principles

- Be genuinely strict. A score of 7 means adequately specified with no major gaps.
  A 5 is a real problem. A 3 means essentially unspecified.
- Score what is present, not what you can infer.
- Do not grade on a curve. "Build me an app" is a 1 or 2 on almost every dimension.
- Partial credit is fine.

## Tone

Be direct and helpful, not bureaucratic. The gate should feel like a sharp senior
engineer asking the right questions before a sprint. Keep language concise. Avoid
jargon the user has not used themselves.

## Important Notes

- Designed for agent team prep but useful for any complex delegation task.
- The skill does not execute the task. It only prepares and validates the brief.
- If the task is genuinely simple (single file edit, quick fix), tell the user they
  probably do not need an agent team. Do not force them through the gate.