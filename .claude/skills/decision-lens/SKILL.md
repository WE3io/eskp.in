---
name: decision-lens
description: 'Detect and surface potential decision-making in work items, plans, diffs, docs, or summaries. Use to flag possible decisions neutrally without enforcing process. Trigger phrases: "check for decisions", "flag decisions", "review for decisions", "find decisions", "identify decisions", "check decisions", "decision check", "review decisions", "flag architectural decisions", "check architectural decisions", "find architectural choices".'
version: 1.0.0
license: MIT
author: Sunil (sunil@we3.io)
---

# Decision Lens

## Overview
Surface potential decisions early by spotting patterns that may constrain future options. Provide neutral, brief signals only. When a decision is intentionally recorded, it is expected to exist as a standalone decision artefact (one decision per artefact), not as an entry in a shared or append-only file.

## Workflow

1. **Discovery first**
   - Inspect the repository for existing decision-record conventions (e.g., `docs/adr/`, architecture decision files, historical patterns).
   - If conventions exist, align to them.
   - If none exist, propose a minimal default (e.g., `docs/adr/` with one file per decision) as a suggestion only, and ask for confirmation before creating anything.

2. **Scan for decision signals**
   - Changes to public interfaces or APIs
   - Persistent data or schema changes
   - Coupling that constrains future changes
   - Irreversible or long-lived technology choices
   - Avoid flagging stylistic changes, refactors that preserve contracts, or purely local implementation details.

3. **Classify neutrally**
   - Describe what appears to be changing.
   - Avoid judging quality or correctness.
   - Avoid recommendations unless asked.

4. **Surface the signal**
   - Use phrasing like: "This might be a decision because…"
   - If nothing stands out, say so plainly.

5. **Mode and persistence**
   - Ephemeral mode (default): surface the decision signal only; no files are written.
   - Persistent mode (opt-in): draft a minimal decision artefact stub when explicitly requested.
   - Never persist automatically or append decisions to shared logs like `DECISIONS.md`.

6. **Optional decision artefact prompt**
   - If appropriate, suggest capturing the decision in a standalone artefact.
   - Optionally draft a stub with:
     - Context
     - Decision question (not the answer)
   - Default template (use only if no repository format exists):
     ```
     # ADR <number>: <title>
     ## Context
     What problem or decision is being addressed?
     ## Decision
     What is the decision being made?
     ## Consequences
     What are the tradeoffs and follow-on effects?
     ```
   - The template is a default, not mandatory; align to existing ADR formats when present and do not auto-number.

7. **Stop cleanly**
   - Present the decision signal (if any) and why it appears decision-like.
   - If the human explicitly defers recording, acknowledge and stop without revisiting.
   - Pause and await instruction to persist, revise, or discard.
   - Do not follow up or persist state.

## Output format

Return a brief advisory assessment with one of:
- No decision signal detected.
- Possible decision detected:
  - What appears to be changing.
  - Why this may constrain future work.
  - What trade-off seems implicit (if any).

Optionally include a short ADR stub.

## Refusals

Politely refuse requests to:
- Decide if an ADR is mandatory.
- Judge correctness or quality.
- Enforce architecture or approvals.
- Block execution or merges.
- Infer intent beyond observable signals.

## Tone

Calm, neutral, precise. Advisory only. Prefer false negatives to false positives.
