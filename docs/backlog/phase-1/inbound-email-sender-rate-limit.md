# inbound-email-sender-rate-limit

**Phase:** 1 — Foundational
**Status:** done (2026-03-14)

## Outcome

Repeated emails from the same sender address are rate-limited at the `/webhooks/email` endpoint. After 5 emails within 1 hour from the same address, subsequent emails are silently dropped (200 OK returned, no DB writes, no AI processing). This prevents spam floods from wasting token budget and polluting the emails/goals tables.

## Constraints & References

- Rate limit is in-memory (resets on process restart) — sufficient for spam defence; DB-backed tracking is out of scope for Phase 1
- Key is the full sender email address (lowercase), not domain — prevents false-positives for shared-domain users
- Silent drop (200 OK) is correct — returning an error would cause Cloudflare Worker retries
- Does not affect reply-token routing (reply-token check remains above rate-limit in processing order for reply addresses, but sender rate limit applies to the extracted `userEmail`)
- Limit: 5 emails/hour per sender address

## Acceptance Checks

- The 6th email from the same sender within 1 hour returns `{ ok: true, type: 'rate-limited' }` with 200 status
- No DB write (emails table, goals table, users table) occurs for rate-limited messages
- Legitimate users sending 1-5 emails per hour are unaffected
- `checkSenderRateLimit()` function exists in `src/api/webhooks.js`

## Explicit Non-Goals

- Persistent rate limit tracking (survives process restart)
- Domain-level blocking
- IP-based blocking
- Allowlist for known senders
- Admin UI for managing blocked senders
