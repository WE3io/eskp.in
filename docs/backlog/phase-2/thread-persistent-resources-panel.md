# thread-persistent-resources-panel

**Phase:** 2 — Panel infrastructure
**Article:** 11.2.3 (Safety infrastructure designed, not monitored)

## Outcome

Every bilateral thread view — for both user and panel member — displays a persistent, always-visible link to the /support page. The link is visible without scrolling, present at all times, and does not require user action to surface. It does not require content detection to appear. The visual treatment is warm and unobtrusive — it signals "support is always available" without implying the user is in crisis.

## Constraints & References

- Article 11.2.3: crisis resources persistently accessible, not triggered by content detection
- Depends on: safety-resources-page (phase-1), panel-data-model (phase-2)
- Must be visible on both user-facing and panel-member-facing thread views
- Must not disrupt the conversation UI or feel clinical/alarming in normal use

## Acceptance Checks

- Thread view for user contains persistent /support link without scrolling
- Thread view for panel member contains persistent /support link without scrolling
- Link is present on page load — not injected by JavaScript after load
- Link is visible in both desktop and mobile viewports
- Visual treatment reviewed: does not feel alarming or clinical in normal conversation context

## Explicit Non-Goals

- Crisis keyword detection triggering dynamic resource surfacing (raises privacy concerns, out of scope)
- Domain-specific resource surfacing based on conversation content
- In-thread crisis card (separate from persistent link)
