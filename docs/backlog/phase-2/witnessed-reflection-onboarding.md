# witnessed-reflection-onboarding

**Phase:** 2 — Panel infrastructure
**Article:** 11.4 (Witnessed Reflection Principle operationalised in onboarding)

## Outcome

Panel member onboarding includes a dedicated section on the active advice vs witnessed reflection distinction. The section uses scenario-based examples to illustrate the difference, explains why witnessed reflection is the platform's default mode, and provides practical prompts panel members can use. This section is part of the mandatory onboarding module (panel-member-crisis-training). A baseline measurement of directive phrasing in panel member messages is established before the feature ships, to enable before/after comparison.

## Constraints & References

- Article 11.4: witnessed reflection is the constitutional default mode; platform must operationalise in onboarding and measure outcomes
- Article 10.3.1: self-efficacy not dependency — witnessed reflection is the mechanism
- Research source: `docs/research/professional-boundaries-and-directory.md` Section 2 (active advice vs witnessed reflection framework); `docs/research/advisory-panel-structures-v2.md` §1 (self-efficacy mechanism model)
- Depends on: panel-member-crisis-training (phase-2)
- Baseline measurement must be defined before the feature ships — cannot measure improvement without a baseline

## Acceptance Checks

- Onboarding module contains an active advice vs witnessed reflection section with at least two worked examples
- Section provides practical reflective prompts panel members can use (e.g. "What do you want to do?" vs "You should do X")
- Baseline metric defined: ratio of directive phrasing ("you should," "I recommend," "the right thing is") in panel member messages, measured on a sample
- Measurement methodology documented so it can be re-run at 30/90 days post-launch
- Section tone is instructive, not prescriptive — panel members understand the why, not just the rule

## Explicit Non-Goals

- Automated real-time flagging of directive phrasing in messages (privacy concerns; out of scope)
- Assessed training with pass/fail on the witnessed reflection distinction
- User-facing explanation of the witnessed reflection principle (panel members only at this stage)
