# witnessed-reflection-measurement

**Phase:** 3 — Empirical outcomes
**Article:** 11.4 (Platform must measure whether interactions cultivate self-efficacy or dependency), 10.4 (Empirical Honesty)

## Outcome

The platform has a repeatable measurement instrument for determining whether panel interactions are cultivating self-efficacy or dependency in users. The instrument uses a combination of: (a) a brief periodic user survey (self-reported confidence and agency); (b) behavioural signals (re-engagement rate, goal completion rate, panel size trajectory); (c) the directive-phrasing baseline established in witnessed-reflection-onboarding. Results are reported to the panel quarterly. If dependency signals are detected above a defined threshold, it triggers a panel review — not an automated intervention.

## Constraints & References

- Article 11.4: platform must measure whether interactions cultivate self-efficacy or dependency
- Article 10.4: measure actual effects on users, report honestly, do not overclaim
- Research source: `docs/research/advisory-panel-structures-v2.md` §1 (self-efficacy mechanism model); `docs/research/professional-boundaries-and-directory.md` Section 2 (witnessed reflection framework)
- Depends on: efficacy-measurement-baseline (phase-3), witnessed-reflection-onboarding (phase-2)
- Survey must be optional and low-friction — mandatory survey creates response bias
- Behavioural signals must not require content access — aggregate event counts only
- Self-efficacy claim is domain-specific (per research), not global — measure within interaction domain

## Acceptance Checks

- Survey instrument defined: 3–5 questions measuring perceived confidence and agency in the relevant domain; questions documented in `docs/operations/efficacy-survey.md`
- Survey delivered to users at 30 and 90 days after first panel interaction (email, optional, one reminder)
- Behavioural signals instrumented: goal_marked_complete events, panel_invitation_sent events (user-initiated), re-engagement gap (days between platform logins)
- Dependency signal threshold defined: e.g. >40% of users with 3+ month panel engagement show no goal completions — triggers panel review
- Directive-phrasing baseline from witnessed-reflection-onboarding is linked as the panel-member-side counterpart
- Quarterly report template created: survey response rates, aggregate confidence scores, behavioural signal trends, comparison to baseline
- First report delivered to panel within 90 days of directory launch

## Explicit Non-Goals

- Individual-level tracking of dependency patterns (privacy concern; aggregate only)
- Automated interventions based on dependency signals (panel-level review only)
- Global self-esteem measurement (domain-specific efficacy only, per research finding)
- Real-time efficacy scoring visible to panel members or users
