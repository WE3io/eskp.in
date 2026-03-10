# directory-two-tier-monitoring

**Phase:** 3 — Trust Directory
**Article:** 11.3.4 (Two-tier access monitored and structurally addressed if detected)
**Status:** draft

## Outcome

The platform has a defined metric and instrumentation for detecting two-tier access in the directory — where well-connected users receive more or faster professional referrals than users with smaller networks. A baseline measurement is taken at launch. Results are reviewed quarterly and reported to the panel. If structural two-tier access is detected above a defined threshold, it is treated as a constitutional issue requiring panel discussion, not an operational tuning problem.

## Constraints & References

- Article 11.3.4: two-tier access monitored and structurally addressed if detected
- Research source: `docs/research/professional-boundaries-and-directory.md` Section 6 (failure mode F-10: two-tier directory access)
- Depends on: directory-vouching-data-model (phase-3), directory-vouch-mechanism (phase-3)
- Monitoring is passive — no content access, no user tracking beyond aggregate access patterns
- Threshold for "detected" must be defined before launch (not post-hoc)
- Structural response is panel-level, not unilateral operator action

## Acceptance Checks

- Two-tier access metric defined and documented: ratio of directory referrals received by users in top vouch-network quartile vs bottom quartile
- Metric threshold defined: e.g. top-quartile users receiving >2x referrals triggers panel review
- Instrumentation in place: referral events logged with anonymised user cohort tag (high/low network connectivity) — no personal data stored in this log
- Baseline measurement taken and recorded in `docs/operations/two-tier-monitoring-baseline.md` at directory launch
- Quarterly review process documented: who runs it, where results go, what constitutes a constitutional trigger
- Panel notified of first baseline result within 30 days of directory launch

## Explicit Non-Goals

- Automated redistribution or ranking adjustment (structural response is human/panel-level)
- Per-user network score visible to users
- Real-time alerting (quarterly review is sufficient at launch scale)
- Monitoring of content quality differences between user cohorts (privacy concern, out of scope)
