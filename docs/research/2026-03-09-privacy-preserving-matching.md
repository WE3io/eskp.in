# Research: Privacy-Preserving Matching Architectures

**Date:** 2026-03-09
**Task:** TSK-026
**Category:** Research

---

## Question

Does the current matching implementation expose user goal data in ways that create privacy risk? What approaches exist to reduce data sent externally while maintaining match quality?

---

## Current Implementation (baseline)

`src/services/match.js`:
- Primary: sends full decomposed goal (summary, needs[], context, outcome) + all helper profiles (name, email, expertise[], bio) to Claude Haiku (Anthropic API) for semantic ranking
- Fallback: tag-overlap scoring (fully local, no external data transmission)
- Cost cap: none (separate from decompose cap)
- Data sent externally: full goal context + helper bios

`src/services/decompose.js`:
- Also sends raw goal text to Anthropic API (inherent, cannot be avoided for decomposition)

---

## Sources

- [Secure task-worker matching — ScienceDirect 2025](https://www.sciencedirect.com/science/article/abs/pii/S1383762125001948)
- [Composable Privacy-Preserving P2P Framework — MDPI 2025](https://www.mdpi.com/2410-387X/9/3/48)
- [Privacy Preserving Record Linkage Strategy — NIA/NIH](https://www.nia.nih.gov/sites/default/files/2023-08/pprl-linkage-strategies-preliminary-report.pdf)
- [Architecting Privacy By Design — IEEE Digital Privacy](https://digitalprivacy.ieee.org/publications/topics/architecting-privacy-by-design-from-concept-to-application/)
- [Privacy preserving online matching on ridesharing platforms — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0925231220305518)

---

## Findings

### 1. Data minimisation is the most actionable near-term principle

Under UK GDPR Article 5(1)(c), personal data must be "adequate, relevant and limited to what is necessary" (data minimisation). Currently, the match.js semantic ranker sends the full decomposed goal — including `context` and `outcome` fields — to Anthropic's API. These fields can contain personal background information provided by the user.

**Minimum viable fix:** Only send what is necessary for matching. The `summary` and `needs[].expertise` tags are sufficient for ranking. The `context` and `outcome` fields add noise for a semantic ranker working with expertise tags; omitting them reduces PII transmission without meaningful quality loss.

### 2. Sensitive goals should use local matching only

The platform already identifies hard-exclusion domains (financial advice, legal, immigration, medical, etc.) via `src/services/hard-exclusion.js`. Goals that touch sensitive domains should not be sent to any external LLM for matching. Tag-overlap is sufficient and appropriate — if it returns no matches, the warm-referral path handles it.

This is a defence-in-depth measure: the goal text has already been sent to Haiku for decomposition, but further transmission for matching adds exposure without proportionate benefit for sensitive cases.

### 3. The academic approaches (MPC, ABE, PSI) are not applicable at this stage

The research literature identifies Private Set Intersection (PSI), Attribute-Based Encryption (ABE), and Secure Multi-Party Computation (MPC) as privacy-preserving matching techniques. These are appropriate for decentralised systems where the matching platform itself should not see data. Our architecture is centralised with a trusted server; the relevant obligations are UK GDPR data minimisation and purpose limitation, not cryptographic separation. These techniques would be relevant if we moved to a federated or multi-party model in Phase 3+.

**No action needed on cryptographic matching techniques for current phase.**

### 4. Helper data: low risk, voluntary disclosure

Helper bios and expertise tags are sent to Anthropic as part of matching. This data is voluntarily provided by helpers for the purpose of being matched. There is less concern here, but it's worth noting in the privacy policy that helper profiles are processed by an AI system. The current draft privacy policy may not explicitly state this.

### 5. Tag-overlap fallback quality

The fallback (tag-overlap) works well when expertise tags are specific. The quality degrades when tags are too broad (e.g. "technology") or when the user's goal uses different vocabulary from the helper's tags (vocabulary mismatch). Better tag normalisation at helper onboarding (e.g. suggesting canonical tags) would improve fallback quality and reduce dependence on LLM ranking.

### 6. Baseline encryption (already in place)

AES-256 at rest (PostgreSQL on encrypted disk) and TLS in transit (Cloudflare) are already the baseline. This is compliant with the minimum viable privacy architecture recommended by the research.

---

## Relevance to Platform

Two actionable improvements emerge:
1. **Data minimisation in match.js** — a quick, safe change: strip `context` and `outcome` from the LLM matching prompt
2. **Sensitive goal routing** — don't send sensitive goals to LLM for matching, rely on tag-overlap + warm referral

A third improvement improves fallback quality without privacy implications:
3. **Tag normalisation at onboarding** — helps tag-overlap work better as a primary method

---

## Tasks Generated

| ID | Description | Priority | Rationale |
|----|-------------|----------|-----------|
| TSK-035 | Data minimisation: strip `context`/`outcome` from match.js LLM prompt; send summary + tags only | P2 | UK GDPR Article 5(1)(c); no meaningful quality loss |
| TSK-036 | Sensitive goal routing: skip LLM matching for hard-exclusion-adjacent goals; use tag-overlap only | P2 | Defence in depth; limits external transmission of sensitive goal content |
| TSK-037 | Privacy policy update: explicitly disclose that helper profiles and goal summaries are processed by an AI system (Anthropic API) | P2 | GDPR transparency requirement; currently implicit |
| TSK-038 | Tag normalisation: improve helper onboarding to suggest canonical tags; reduces vocabulary mismatch in tag-overlap fallback | P3 | Improves match quality without privacy implications |
