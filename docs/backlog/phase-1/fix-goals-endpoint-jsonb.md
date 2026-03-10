# fix-goals-endpoint-jsonb

**Phase:** 1 — Foundational
**Article:** None (bug fix)
**Status:** done

## Outcome

`GET /goals/:id` returns a well-formed JSON response for all valid goal IDs. The PostgreSQL query at `src/api/goals.js:52` uses `jsonb_array_elements` instead of `json_array_elements`, resolving the type mismatch against the `jsonb` `decomposed` column that currently causes a 500 for every call.

## Constraints & References

- Fix must be confined to the query at `src/api/goals.js:52` — no schema changes, no migration required
- The response must continue to exclude `user_email` and all other PII (existing SELECT clause is correct; do not alter it)
- No new dependencies

## Acceptance Checks

- `GET /goals/:id` with a valid UUID returns HTTP 200 and a parseable JSON body containing `id`, `status`, `created_at`, `needs`, `matches_count`
- `GET /goals/:id` with an invalid UUID returns HTTP 404
- The response body contains no `user_email`, `raw_text`, or `user_id` field
- `docker exec platform-db psql -U platform -d platform -c "SELECT jsonb_array_elements(decomposed->'needs') FROM goals LIMIT 1;"` runs without error (confirms the fix matches actual column type)

## Explicit Non-Goals

- Adding authentication to the endpoint
- Changing the response shape beyond fixing the broken query
- Off-site backup or any other audit finding
