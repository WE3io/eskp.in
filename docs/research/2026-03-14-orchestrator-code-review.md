# Code Review: session-orchestrator.sh + orch-infer.js

**Date:** 2026-03-14
**Session:** 44 (code quality rotation)
**Reviewer:** Claude Sonnet 4.6

## Question
What edge cases and issues exist in the orchestration pipeline (session-orchestrator.sh, orch-infer.js, apply-code-output.js)?

## Findings

### session-orchestrator.sh

**Issue 1 — Reviewer auto-approval on API failure (medium risk)**
Lines 272–276: If the reviewer role API call fails, the script logs a warning and sets `REVIEW="APPROVED"`, then commits. A code change that couldn't be reviewed proceeds to commit. This is the most significant safety concern — silent reviewer bypass on transient failures.

**Issue 2 — Shell-interpolated strings in `alert_failure()` (low risk)**
Lines 54–57: `${reason}` and `${task_id}` are interpolated directly into a `node -e` string. In practice, `reason` is always a hardcoded literal and `task_id` is `grep -oP 'task_id:\s*\K\S+'` which matches `\S+` (no spaces/quotes). Low actual risk but structurally fragile.

**Issue 3 — `git add -A` stages everything (low risk)**
Line 230: Stages all unstaged changes. If the worker creates unexpected files or if the repo has pre-existing unstaged changes, those get included in the commit. Should be `git add -- <modified files>` where possible.

**Issue 4 — `files_to_read` YAML parsing fragility (low risk)**
Line 125: `sed -n '/^files_to_read:/,/^[a-z_]*:/p'` — the end delimiter matches any line starting with a lowercase identifier followed by colon. This works for well-formed YAML but could mis-slice the block if coordinator output isn't perfectly structured.

**Issue 5 — `ops` type exits 3 even in dry-run mode**
Line 134–137: `if [ "${TASK_TYPE}" = "ops" ]` check runs before the DRY_RUN check. In dry-run, this exits 3 (needs CLI) rather than showing the plan. Should be after dry-run guard.

### orch-infer.js

**Issue 6 — Validation logic for coder role has wrong operator (low risk)**
Line 99: `if (role === 'coder' && !text.includes('```') && text.length < 50)` — both conditions must be true for validation failure. A coder response with valid content but no code fences (e.g. XML-format `<file>` blocks) would pass even though the response is potentially malformed if < 50 chars. Should be: OR condition, or check for `<file` blocks too.

**Issue 7 — No stdin timeout in --json mode (informational)**
Lines 40–47: `for await (const chunk of process.stdin)` has no timeout. If called programmatically with stdin that never closes, the process hangs. Not currently a real issue but worth noting for future programmatic use.

**Issue 8 — File path resolution is CWD-relative**
Line 73: `path.resolve(filePath)` resolves from `process.cwd()`. Since `session-orchestrator.sh` explicitly `cd`s to `PROJECT_DIR` first, this is correct in practice. But the tool would break if called from a different directory. Not a current issue.

### apply-code-output.js

**No significant issues.** Path traversal protection is solid. Blocked patterns cover key credential files. Three output format parsers handle model variation. Exit code semantics are correct.

## Relevance

The most actionable finding is **Issue 1** (reviewer auto-approval on API failure). This creates a window where a bad code change could be committed without review if the reviewer API is temporarily unavailable. The fix is simple: on reviewer failure, exit 3 (needs CLI) rather than auto-approving.

**Issue 6** (validation logic) is also easy to fix and improves reliability.

## Tasks Generated

- TSK-175: Fix session-orchestrator.sh — on reviewer API failure, exit 3 (needs CLI) instead of auto-approving (P2)
- TSK-176: Fix orch-infer.js — coder validation should accept `<file` blocks as valid output (P3)
