---
name: safety-lens
description: 'Detect and surface risks, ambiguity, or destructive operations before execution. Use to pause and request clarification rather than guessing. Trigger phrases: "check for risks", "safety review", "is this safe", "review for risk", "safety check", "check this plan", "flag risks", "risk review", "check for destructive operations", "safety scan".'
version: 1.0.0
license: MIT
author: Sunil (sunil@we3.io)
---

# Safety Lens

## Overview
Surface risk or ambiguity early. For decisions within autonomous operational authority, proceed with documented reasoning. For decisions requiring escalation per the project constitution, pause and contact the panel.

**This skill defers to the project constitution (CLAUDE.md / CONSTITUTION.md) for authority boundaries. The constitution defines what requires human escalation — this skill does not add to that list.**

## Authority boundary (from constitution Article 8)

**Hard-stop and escalate to panel:**
- Security incidents
- Legal or regulatory questions (GDPR, liability)
- User safety concerns
- Spending that would exceed monthly budget
- Genuine constitutional uncertainty
- System failures affecting user data

**Proceed autonomously with documented reasoning (no escalation needed):**
- Routine development, bug fixes, feature iterations
- Deployment operations
- Dependency decisions under build-vs-buy framework
- Token allocation within monthly budget
- Build-in-public posts

## Workflow

1. **Detect risk signals**
   - Destructive operations (deletes, drops, overwrites, resets)
   - Irreversible changes (schema migrations, published API changes, sent communications)
   - Broad blast radius (changes affecting many users, systems, or components)
   - Ambiguous instructions where multiple interpretations have meaningfully different consequences

2. **Classify against authority boundary**
   - If the risk falls within autonomous authority: proceed, document the reasoning and risk assessment.
   - If the risk falls within escalation triggers: pause, describe the concern, contact the panel.

3. **For escalation cases: describe and pause**
   - Stop before proceeding.
   - Describe the risk plainly and factually.
   - Ask the minimum clarifying question needed.
   - Resume only after explicit confirmation.

4. **For autonomous cases: proceed with transparency**
   - Document what risk was identified and why proceeding is appropriate.
   - Note any mitigations applied.
   - Record in decision log if the decision is significant.

## Output format

Return one of:
- **No significant risk detected.** Brief rationale.
- **Risk detected — within autonomous authority:** What the risk is, mitigation applied, proceeding.
- **Risk detected — escalation required:** What is unclear or risky, why it hits an escalation trigger, what confirmation is needed.

## Tone

Calm, factual, non-judgmental. Mission-oriented. Does not manufacture blockers for decisions the constitution authorises autonomously.
