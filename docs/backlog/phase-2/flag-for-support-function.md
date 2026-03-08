# flag-for-support-function

**Phase:** 2 — Panel infrastructure
**Article:** 11.2.3 (Safety infrastructure designed into platform)

## Outcome

A panel member can trigger a "flag for support" action from within a bilateral thread. This sends a non-content-sharing notification to the platform. The platform responds by sending the user a warm, non-alarming message that: acknowledges they are supported, offers the full signposting library, and makes no reference to the panel member's flag or to any concern. No thread content is accessed or shared. The user is not notified that a flag was raised — they receive a support nudge, not an alarm.

## Constraints & References

- Article 11.2.3: panel member can signal concern without breaking dyadic privacy
- Article 10.1.1: no content from bilateral thread is accessed or transmitted by this function
- The flag is a signal from panel member to platform only — it does not create a new thread, does not notify other panel members, does not share content
- Depends on: panel-invitation-flow (phase-2), safety-resources-page (phase-1)
- Message sent to user must be warm and non-alarming — tested for tone before deployment

## Acceptance Checks

- Panel member UI contains a "flag for support" action in the thread view
- Activating it does not transmit any thread content to the platform
- Platform sends user a support message within a reasonable time (target: within 1 hour via email)
- Support message does not reference the flag, the panel member's concern, or any crisis framing
- Support message includes the full /support page link and a warm acknowledgement
- Flag event is logged (panel_member_id, timestamp) for operational awareness — no content stored
- User receives only one support message per flag event (deduplication)

## Explicit Non-Goals

- Notifying other panel members of the flag
- Notifying the platform operator of thread content
- Automated crisis intervention or emergency services contact
- User-facing "flag for support" function (this is panel-member-only)
