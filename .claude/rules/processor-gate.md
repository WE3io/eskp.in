# Processor Onboarding Gate

## Rule

Before using any new external service that processes user data (API providers, email services, analytics, logging, hosting), the service **must** have an entry in `docs/operations/processor-dpas.md`.

## Trigger conditions

This rule applies when a feature:
- Makes API calls to a new external service not already in processor-dpas.md
- Sends user data (names, emails, goal text, any PII) to a new processor
- Adds a new dependency that phones home or processes data externally

## Required steps

1. **Check** `docs/operations/processor-dpas.md` for the service
2. If absent, **add an entry** before writing integration code:
   - Service name, purpose, data categories processed
   - DPA/terms URL, data residency, retention controls
   - Whether Sunil needs to accept a DPA (if yes, create a task and escalate)
3. **Update** `docs/operations/ropa.md` if the service creates a new processing activity
4. **Escalate to panel** if the service processes special category data or has no EU/UK adequacy

## Escalation

If a DPA cannot be confirmed or the service lacks adequate data protection controls, escalate to panel@eskp.in before proceeding. Do not integrate first and document later.
