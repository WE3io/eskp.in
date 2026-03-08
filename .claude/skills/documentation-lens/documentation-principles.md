# Documentation Principles

Guidelines for writing documentation that provides durable value without excessive maintenance cost.

## Core Philosophy

Documentation serves three purposes:

1. **Position readers** — Help them understand where a component sits in the broader system, what its boundaries are, and where to find related information.
2. **State durable contracts** — Capture stable interfaces and public APIs that consumers depend on. Implementation details change; contracts change less often.
3. **Justify its own cost** — Before writing documentation, ask: will maintaining this cost more than the value it provides? If yes, don't write it or write less.

## What to Document

- Architectural decisions and their rationale (use ADRs)
- System and component boundaries
- Public interfaces and APIs
- Non-obvious constraints or invariants
- Operational procedures that are not self-evident from the code

## What Not to Document

- Self-explanatory code (clean code documents itself)
- Implementation details that change frequently
- Information already documented elsewhere — link instead
- Rapidly staling details (e.g., specific version numbers in prose)
- Anything whose maintenance cost exceeds its reader value

## Single Source of Truth

Every piece of knowledge should have exactly one canonical home. When the same information is needed in multiple places, link to the canonical source rather than restating it. Duplication creates drift — two sources will eventually disagree.

## Prefer Executable Examples

Where possible, prefer runnable examples over prose description. Code that runs is self-validating; prose is not.

## The Maintenance Test

Before adding documentation, ask: "Six months from now, will someone maintain this?" If the answer is no, either make it someone's responsibility or don't write it. Orphaned documentation is worse than no documentation — it misleads readers.
