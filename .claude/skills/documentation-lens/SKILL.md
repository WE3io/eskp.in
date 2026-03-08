---
name: documentation-lens
description: 'Flag possible documentation duplication, misplacement, or verbosity. Use when drafting or reviewing docs, backlog items, ADRs, or explanatory text to steer toward a single source of truth. Trigger phrases: "check documentation", "review docs", "check docs", "review documentation", "check for doc duplication", "review for duplication", "check doc quality", "review doc quality", "documentation review", "docs review", "check doc structure".'
version: 1.0.0
license: MIT
author: Sunil (sunil@we3.io)
---

# Documentation Lens

## Overview
Provide brief, neutral signals when documentation may be duplicated, misplaced, or over-explained. Prefer links over restatement. When new knowledge is intentionally recorded, expect a single canonical location with references linking to it rather than duplicating content.

**Guiding principle:** Document to position the reader in the system, state only durable contracts, and include detail solely when its long-term value exceeds its maintenance cost. (See `documentation-principles.md` for full guidance.)

## Workflow

1. **Discovery first**
   - Inspect the repository for existing documentation conventions (README structure, `docs/` directories, architecture or decision docs, inline patterns).
   - If conventions exist, align to them.
   - If none exist, propose a minimal documentation convention as a suggestion only, and ask for confirmation before creating anything.

2. **Identify knowledge intent**
   - Is the input new system knowledge, a restatement, or a mix?

3. **Check for canonical placement**
   - Ask whether a canonical home exists (README, architecture, ADR).
   - If unsure, state uncertainty explicitly.

4. **Mode and persistence**
   - Ephemeral mode (default): review drafts, diffs, or proposed text and provide advisory signals only; write no files.
   - Persistent mode (opt-in): write or edit documentation files only with explicit human instruction, aligned with discovered or agreed conventions.

5. **Surface advisory signals**
   - Apply the core documentation principle: position the reader, state durable contracts, include detail only when long-term value exceeds maintenance cost.
   - Use phrasing like:
     - "This looks similar to…"
     - "You might consider linking to…"
     - "This may fit better in…"
     - "This detail may have low long-term value relative to maintenance cost…"
   - Focus on conceptual duplication, misplaced background, or explanatory but non-authoritative docs.
   - Avoid flagging minor repetition, enforcing style preferences, or large-scale semantic analysis.
   - Do not prescribe exact edits.

6. **Stop cleanly**
   - Present advisory signals (if any) and suggested canonical locations or links.
   - If the human explicitly defers documentation changes, acknowledge and stop without revisiting.
   - Do not rewrite or move content.
   - Return control immediately.

## Output format

Return a brief advisory assessment with one or more signals:
- Looks canonical (introduces genuinely new knowledge).
- Possible duplication detected (what is duplicated, where the canonical source may live).
- Verbosity / placement signal (content may be overly narrative or belong elsewhere).

Optionally include suggested canonical locations or links.

## Refusals

Politely refuse requests to:
- Rewrite or merge documentation.
- Enforce doc structure or templates.
- Block commits or PRs.
- Perform large-scale semantic analysis.

## Tone

Calm, collegial, neutral. Advisory only. Prefer false negatives to false positives.
