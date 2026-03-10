# annual-algorithm-audit

**Phase:** 3 — Governance and measurement
**Article:** 10.2.3 (Algorithmic transparency — annual audit)
**Status:** draft

## Outcome

A documented annual audit process exists for all algorithmic features. The first audit report is published publicly. The report states: what each algorithm does, what data it uses, what the output distribution looks like, whether any systematic bias is detectable, and what changes (if any) were made as a result.

## Constraints & References

- Article 10.2.3: algorithmic features must be audited annually with results published
- Existing algorithmic features: goal decomposition (`src/services/platform.js`), semantic matching (`src/services/match.js`)
- Audit must be honest about limitations, not promotional

## Acceptance Checks

- `docs/governance/algorithm-audit-2026.md` (or equivalent) exists and is complete
- Audit covers at minimum: goal decomposition (Claude Haiku) and semantic matching
- Report published publicly (blog post or `/transparency` page)
- Process document exists so future audits can be conducted consistently without this work item

## Explicit Non-Goals

- Third-party audit (self-audit sufficient at this stage)
- Code-level security review
- Audit of Stripe or other third-party services
