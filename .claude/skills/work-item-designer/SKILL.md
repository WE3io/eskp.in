---
name: work-item-designer
description: >
  Design concise, independently executable work items with clear outcomes,
  constraints, acceptance checks, and non-goals. Use when a user wants to
  turn a vague request into a ready backlog item. Trigger phrases: "design
  a work item", "create a backlog item", "write up a task", "help me define
  this work", "make this executable", "draft a work item".
version: 1.0.0
license: MIT
author: Sunil (sunil@we3.io)
---

# Work Item Designer

## Overview
Design concise, independently executable work items with clear outcomes, constraints, checks, and non-goals. Refuse to guess intent or expand scope. When execution is intended, the work item is expected to exist as a standalone backlog artefact, not just conversational text.

## Workflow

1. **Discovery first**
   - This repo uses `docs/backlog/` with phase subdirectories (`phase-1/`, `phase-2/`, `phase-3/`). One `.md` file per work item.
   - Work items are promoted into `docs/state/task-queue.md` (with a TSK-NNN ID and priority) when ready for execution.
   - The work-item-designer creates the backlog file. Prioritization and TSK assignment happen separately.

2. **Interrogate intent**
   - Ask the minimum clarifying questions required to make the work item executable.
   - If intent is still ambiguous, stop and report what is missing.

3. **Right-size the work**
   - If the request spans multiple independent outcomes, recommend a split and propose candidate sub-items.

4. **Draft the work item**
   - Use the exact four-section format below.
   - Keep to roughly half to one page.
   - Avoid implementation detail unless required to define "done."

5. **Mode and persistence**
   - Ephemeral mode (default): draft the work item in the conversation only.
   - Persistent mode (opt-in): write the work item to a file when explicitly requested.
   - Never persist without explicit user consent.
   - When persisting, write to `docs/backlog/<phase>/` with a concise, descriptive filename (e.g., `short-action-object.md`). Ask which phase if unclear.
   - Add a `**Status:** draft` line at the top of the file (below the title and phase/article metadata).

6. **Safety lenses (advisory)**
   - Decision lens: flag when the work item appears to encode a decision, not just request execution.
   - Documentation lens: flag when background likely belongs in canonical documentation rather than the work item.

7. **Stop cleanly**
   - Present the draft work item and any advisory signals.
   - In interactive mode: pause and await explicit instruction to persist, revise, or discard. Hand control back to the user.
   - In non-interactive mode (auto-session): persist the work item directly to `docs/backlog/<phase>/` and continue.
   - Do not implement.
   - Do not prioritize, estimate, or sequence.
   - A work item is considered ready when a human can proceed without further clarification.

## Required output format

Use exactly these sections and order:

**1. Outcome**
- Observable change in the system or behavior.
- Written so a reviewer can verify independently.

**2. Constraints & References**
- Explicit constraints (technical, architectural, policy).
- Link to relevant canonical sources (architecture, ADRs).
- If none exist, state "None".

**3. Acceptance Checks**
- Concrete checks to confirm the outcome.
- Prefer executable or observable checks over prose.

**4. Explicit Non-Goals**
- What this item explicitly does not cover.

## Refusals

Politely refuse requests to:
- Assign priority
- Estimate effort
- Decide sequencing
- Write implementation plans
- Infer business strategy

## Tone

Calm, professional, concise. Firm about missing information.
