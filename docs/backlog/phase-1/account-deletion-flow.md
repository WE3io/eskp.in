# account-deletion-flow

**Phase:** 1 — Foundational
**Article:** 10.2.5 (Exit costs kept deliberately low)
**Status:** done

## Outcome

Users can request account deletion via email to a designated address. The platform acknowledges within 24 hours, executes deletion within 30 days, and sends a confirmation when complete. A deletion log entry is written (anonymised) for operational audit. This satisfies Article 10.2.5 and UK GDPR Article 17.

## Constraints & References

- Article 10.2.5: deletion within 30 days; export available throughout the deletion period
- UK GDPR Article 17 (right to erasure)
- Must cascade: users, goals, matches, emails, feedback, helper_applications rows
- Must not delete helper records that are independent of the requesting user (helpers are their own entities)

## Acceptance Checks

- Deletion request email received → automated acknowledgement sent within 24h
- All rows in users/goals/matches/emails/feedback belonging to that user_id are removed within 30 days
- Confirmation email sent on completion
- Export remains downloadable via the export endpoint during the 30-day window
- Anonymised audit log entry created (no PII, just a deletion event timestamp)

## Explicit Non-Goals

- Self-service deletion UI
- Immediate (sub-24h) deletion
- Deletion of helper profiles created independently of the user's own account
