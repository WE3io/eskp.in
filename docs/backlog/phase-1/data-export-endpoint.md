# data-export-endpoint

**Phase:** 1 — Foundational
**Article:** 10.2.2 (Data portability as a constitutional right)

## Outcome

A authenticated `GET /account/export` endpoint produces a single JSON file containing all data the platform holds for the requesting user: account record, goals, matches, emails sent/received, feedback submitted. The file downloads immediately (no queued job). Deleting an account also triggers generation and retention of this export for 30 days, after which all data is permanently deleted.

## Constraints & References

- Article 10.2.2: export must be immediate, interoperable format, no platform tooling required to interpret
- UK GDPR Article 20 (data portability); Data Protection Act 2018
- Must not expose other users' data (e.g. helper records beyond the matched helper's name/email used in the introduction)
- Schema: users, goals, matches, emails, feedback tables (existing)

## Acceptance Checks

- `GET /account/export` with valid session returns 200 with `Content-Type: application/json` and a parseable file
- File contains user's own rows from all relevant tables; no rows belonging to other users
- File is valid without any platform tooling (parseable by `jq` or equivalent)
- Account deletion flow triggers export generation; export remains accessible for 30 days
- After 30 days (or immediate deletion request), all user rows are gone from the DB

## Explicit Non-Goals

- CSV format (JSON sufficient for Article 10.2.2 compliance at this stage)
- Export of bilateral thread content (threads don't exist yet)
- Export UI in the browser (API endpoint only)
