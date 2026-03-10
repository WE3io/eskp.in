# Mission Alignment Review — Session 23

**Date:** 2026-03-10
**Articles reviewed:** 1 (Purpose), 3 (Ethics and Privacy)
**Method:** Code review of match.js, platform.js, public-claims-register.md, join.html against constitutional requirements

## Findings

### 1. Helper names in matching LLM prompt (Art 3.2/3.3) — FIXED

**Issue:** `semanticRank()` in match.js sent helper names to the Claude Haiku matching API. Names are irrelevant to expertise-based ranking and could introduce gender/ethnicity bias in automated matching decisions.

**Constitutional basis:** Art 3.2 ("Store user data in abstracted, structured forms"), Art 3.3 ("Automated decisions affecting users must be explainable" — a name-biased match is not explainable on expertise grounds).

**Fix:** Removed `Name:` line from the LLM matching prompt. Helper IDs, expertise tags, and bios remain (all necessary for ranking).

**Impact:** Low (only 1 helper currently), but sets correct pattern for when helper pool grows.

### 2. At-rest encryption not implemented (Art 3.2)

**Issue:** Art 3.2 states "Encrypt at rest and in transit as baseline." PostgreSQL in Docker has no transparent data encryption. Data on disk is unencrypted.

**Mitigation:** The same article emphasises "design the data model so that compromise is structurally boring" — raw_text is nulled after decomposition, decomposed data is structured/impersonal, and identity is separated from intent. This substantially reduces breach impact.

**Assessment:** At-rest encryption via LUKS disk encryption or PostgreSQL TDE would fully satisfy this requirement. Requires Sunil's infrastructure access. Not actionable in auto-session.

**Status:** Existing mitigation (structural boringness) is strong. Full compliance requires infrastructure work. Not generating a task — this is noted for when Sunil is available and the blocked-items conversation resumes.

### 3. Public claims register "Monitor" items

Two items in public-claims-register.md are marked "Monitor":
- "We will respond within 30 days" (data requests) — no SLA enforcement in code. At current volume (1 user), manual handling is adequate.
- "AI opt-out: handle it manually" — no automation for manual path. Adequate at current scale.

**Assessment:** Both are acceptable at Phase 1 bootstrap. Will need automation at scale.

### 4. Identity/intent separation in matching — CONFIRMED GOOD

- `findMatches()` sends only goal summary + tags to LLM (TSK-035)
- User email/name never reaches the matching API
- User identity shared with helper only after payment (consent act) in `sendHelperIntro()`
- Art 3.2 "Separate identity from intent" is structurally implemented

### 5. Art 3.4 User-driven development — adequate for Phase 1

- /feedback.html exists, feedback table in DB
- /roadmap.html published with user request section
- feedback-queue.md exists for systematic processing
- At 1 real user, systematic collation is necessarily manual

### 6. Art 10.4 Empirical honesty — not yet measurable

- Match quality ratings implemented (TSK-094)
- Goal funnel metrics via `pnpm stats` (TSK-096)
- Actual goal achievement measurement not yet possible at current volume
- This becomes a real obligation once external users exist

## Tasks Generated

- TSK-113: Remove helper names from matching LLM prompt (Art 3.2/3.3 data minimisation) — **done this session**

## Summary

The platform is well-aligned with Articles 1 and 3. The structural privacy architecture (raw_text nulling, identity/intent separation, data minimisation in LLM prompts) is strong. One bias-risk gap fixed (helper names in matching prompt). At-rest encryption is a noted gap but mitigated by structural data design. All other findings are adequate for Phase 1 scale.
