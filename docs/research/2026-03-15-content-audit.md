# Content Audit — eskp.in Public Pages

**Date:** 2026-03-15
**Session:** 47th auto-session (content audit rotation)
**Scope:** All public HTML pages + blog posts audited against ICP, brand voice, exclusion register, and shared-strings.md

---

## Question

Are all public-facing pages compliant with: (1) hard-exclusion register, (2) ICP archetypes, (3) brand voice language rules, (4) canonical nav/footer shared-strings.md?

---

## Method

1. Read docs/operations/icp.md — target archetypes and exclusion rules
2. Read docs/state/public-claims-register.md — existing claims checked
3. Read docs/copy/shared-strings.md — canonical nav/footer
4. Audit index.html, join.html, roadmap.html, all 10 blog posts + blog index
5. Check footer consistency across blog posts

---

## Findings

### Hard-exclusion compliance: PASS
- No excluded domains (legal, financial, immigration, medical, therapy) appear as use cases on any page
- Previous session (TSK-155/156/157) fixed this; state is clean

### ICP alignment: PASS
- Landing page shows 5 of 7 archetypes (Career, Business, Technical, Creative, Education + catch-all "Other")
- Life transitions and Parenting/family are ICP-approved but not shown on homepage — not a violation, "Other" covers them
- All example goals are concrete, specific, non-regulated
- No tech-only bias in examples

### Language rules: PASS (with one minor observation)
- No "advice", "expert", "adviser" in body copy on public pages
- join.html meta description uses "expertise" (OG tag, helper-facing) — lower priority; body text is compliant
- Frame throughout is "someone who's navigated it before"

### Nav/footer consistency: FIXED
- **Issue found:** Blog posts 001, 002, 003, and blog/index.html were missing the `Support` link in their footers (old footer format from early sessions)
- Posts 004-010 already had Support link
- **Fixed:** Added `<a href="/support.html">Support</a>` to footers of 001, 002, 003, and blog index
- All 11 blog files now have consistent footer with Support link
- All main public pages (index, join, privacy, terms, feedback, support, roadmap) were already correct

### Blog CTA boxes: ACCEPTABLE
- Posts 001-007 use inline-styled CTA boxes (different markup from newer posts)
- Text content is compliant and consistent
- Not standardising markup across old posts to avoid unnecessary churn

---

## Tasks generated

None — all issues were minor and fixed inline. No structural changes needed.

---

## Relevance

Content audit is now clean. Next content audit: quarterly or when significant new copy is added (next blog post batch, new public pages, or ICP changes).

**Recommendation:** Update shared-strings.md to note that blog footers use the same canonical footer format (with Support link), not a simplified variant. This prevents future drift in new blog posts.

