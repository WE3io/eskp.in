# Scientific Debugging Method

Debug systematically: Observe → Hypothesize → Test → Fix. Never apply shotgun fixes.

## Observe First

Before acting, gather facts:
- What is the actual vs. expected behavior?
- What do error messages and logs say?
- When does it occur? Can you reproduce it?

Do not propose a fix until you can reproduce the problem.

## Hypothesize

- Generate 2–3 probable causes, ranked by likelihood.
- Use the "Five Whys" to find root cause, not symptoms.
- State your hypothesis explicitly before testing.

## Test

- Validate each hypothesis before implementing a fix.
- Add logging or instrumentation to verify theories.
- One variable at a time — do not change multiple things simultaneously.

## Fix

- Apply minimal, targeted fixes over large rewrites.
- Fix the root cause, not the symptom.
- After fixing, check for similar issues elsewhere in the codebase.

## Anti-Patterns to Avoid

- Shotgun fixes without understanding the cause.
- Multiple simultaneous changes.
- Treating symptoms as solutions.
- After 3 failed attempts with the same approach, stop and propose a fundamentally different approach.
