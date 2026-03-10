# panel-invitation-flow

**Phase:** 2 — Panel infrastructure
**Article:** 10.3.2, 10.3.4, 10.1.1
**Status:** draft

## Outcome

A user with an active goal can invite a named person (by email) to join their panel in a specific role. The invitee receives a templated email explaining the dyadic model, confidentiality norms, and the role. Accepting creates a `panel_members` row. The invitation expires in 14 days. The inviting user is notified of acceptance or expiry.

## Constraints & References

- Article 10.3.2: platform provides coordination tools; does not assign advisors
- Article 10.3.4: advisor onboarding must convey confidentiality obligations
- Article 10.1.1: invitee must be made clear they see only their own bilateral thread
- Research: `docs/research/advisory-panel-structures-v2.md` §5.2 (invitation flow framing)
- Invitation framing: time-bounded, scope-specific, explicitly optional, positioned as mutual

## Acceptance Checks

- User can submit an invitation (invitee email, role label, optional personal note) for a goal
- Invitee receives a branded email with: role description, confidentiality summary, accept/decline links
- Accepting creates a `panel_members` row with status=accepted
- Declining or no response in 14 days marks the invitation expired
- Inviting user receives notification on acceptance or expiry

## Explicit Non-Goals

- Cold matching to strangers (this flow is for user-nominated contacts only)
- Role charter co-authoring UI (role_charter_text is free-text for now)
- Panel gap analysis or composition suggestions
