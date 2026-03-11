# Safe email builder — migrate templates to safeHtml

**Phase:** 1 | **Status:** done (2026-03-11)

## Outcome

A `safeHtml` tagged template literal is available in `email-template.js` that auto-escapes all interpolated values by default. A `rawHtml()` wrapper opts out for pre-built HTML. This eliminates the XSS-in-email bug class (TSK-099, TSK-104, TSK-110, TSK-116) by making escaping the default.

## Constraints & References

- Must not break existing email rendering.
- `escHtml()` remains exported for callers not yet migrated.
- Addresses operational review recommendation (sessions 20 + 30).

## Acceptance Checks

- `safeHtml` auto-escapes strings, numbers, and arrays.
- `rawHtml()` passes through trusted HTML without escaping.
- `null`/`undefined` become empty string.
- helper-digest.js uses shared `escHtml` instead of inline duplicate.

## Explicit Non-Goals

- Full migration of all email templates to `safeHtml` (separate follow-up task TSK-121).
- Changes to plain-text email bodies (not affected by XSS).
