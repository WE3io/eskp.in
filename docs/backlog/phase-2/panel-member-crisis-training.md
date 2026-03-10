# panel-member-crisis-training

**Phase:** 2 — Panel infrastructure
**Article:** 11.2.3 (Panel members trained before accessing platform), 11.2.5 (Safeguarding)
**Status:** draft

## Outcome

Before a panel member can accept a panel invitation, they must complete a mandatory onboarding module covering: (a) crisis recognition and the limits of peer support; (b) the warm referral protocol — how to introduce specialist services without abandoning the user; (c) the witnessed reflection principle (active advice vs witnessed reflection); (d) their individual safeguarding obligations; (e) how to use the "flag for support" function. Completion is gated — panel invitations cannot be accepted without it.

## Constraints & References

- Article 11.2.3: panel members trained in crisis recognition and warm referral before permitted to participate
- Article 11.4: witnessed reflection principle operationalised in onboarding
- Article 11.2.5: safeguarding obligations disclosed
- Depends on: panel-invitation-flow (phase-2), flag-for-support-function (phase-2)
- Module must be completable via email or a minimal web flow — panel members do not need a full account to complete it
- Training content derived from: `docs/research/professional-boundaries-and-directory.md` Section 3.4 (crisis protocol), Section 2 (witnessed reflection framework)

## Acceptance Checks

- A panel member who has not completed the module cannot accept a panel invitation
- Module covers all five topics listed in the outcome
- Module completion is recorded in `panel_members` table (e.g. `onboarding_completed_at` timestamp)
- Module is completable without a full platform account
- A panel member who completes the module can then accept an invitation
- Module references /support page for ongoing resource access

## Explicit Non-Goals

- Assessed/scored training (completion is the gate, not a pass mark)
- Annual re-certification (out of scope at this stage)
- Training for end users (separate onboarding flow)
