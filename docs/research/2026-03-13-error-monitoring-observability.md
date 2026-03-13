# Research: Error Monitoring and Observability for Node.js

**Date:** 2026-03-13
**Question:** What is the minimum viable, cost-appropriate observability setup for eskp.in — a low-volume, single-process Node.js/Express app?

---

## Sources / Approaches

- pino vs winston Node.js 2025 comparison
- Sentry free tier limits 2025
- GlitchTip self-hosted vs Sentry 2025
- Minimum viable observability Node.js Express small app
- Docker log rotation best practices
- Node.js uncaughtException/unhandledRejection handling

---

## Findings

### 1. Structured Logging: Pino is the right choice

- **Pino** outputs JSON by default, is 5x faster than Winston (benchmarked), has minimal memory overhead, and `pino-http` provides a single Express middleware that logs every request/response with status code-aware severity.
- **Winston** has richer transports but unnecessary complexity for a single-process app.
- Current platform uses bare `console.error()` / `console.warn()` / `console.log()` — unstructured, no request correlation, no machine-parseable timestamps.
- **GDPR relevance:** Pino custom serializers can redact PII fields (email, goal content) before log output.

### 2. Crash and Error Reporting Options

**Option A: stderr + Docker log rotation (enhanced current approach)**
- Add `logging:` stanza to `docker-compose.yml` with `max-size: 10m`, `max-file: 5`
- Add `process.on('uncaughtExceptionMonitor')` + `unhandledRejection` handlers to log structured crash records
- `uncaughtExceptionMonitor` fires before the crash without altering crash behaviour (Node 12.17+)
- Zero external dependency. Limitation: no grouping, no alerting — you find out via heartbeat.sh (15-min lag).

**Option B: Sentry free tier (cloud-managed)**
- 5,000 errors/month free, 1 user — sufficient for current volume
- Automatically groups exceptions, shows breadcrumbs, sends email alerts
- SDK: `@sentry/node` (few lines of setup)
- GDPR note: `beforeSend` hook must scrub email/goal data before transmission to Sentry servers

**Option C: GlitchTip self-hosted**
- Open-source Sentry API-compatible alternative; uses same `@sentry/node` SDK
- Requires Redis + Celery + additional Compose services — too much operational overhead at current scale

**Option D: Webhook-to-email from crash handler**
- Fire-and-forget Resend call from `uncaughtExceptionMonitor` to alert `sunil@eskp.in`
- Architecturally possible; requires careful design to avoid alert loops

### 3. Minimum Viable Observability at This Scale

| Concern | Minimum viable approach |
|---|---|
| Request logs | Pino + pino-http (structured JSON to stdout) |
| Error/warning logs | Replace console.* with logger.error/warn/info |
| Crash capture | uncaughtExceptionMonitor + unhandledRejection handlers |
| Docker log rotation | json-file driver with max-size/max-file in docker-compose.yml |
| Alerting on crash | Sentry free tier OR webhook-to-email from crash handler |
| Metrics/tracing | Not needed yet — add at 20+ external users |

Prometheus + Grafana is not justified at $0.016/month API spend.

### 4. Free/Cheap Options Ranked by Value-to-Effort

1. **Docker log rotation** — 5 minutes, prevents silent disk exhaustion
2. **Pino + pino-http** — ~2 hours, structured JSON logs with request IDs, response times, status codes
3. **process.on('uncaughtExceptionMonitor')** — 30 minutes, passive crash capture
4. **Sentry free tier** — ~2 hours to instrument + configure PII scrubbing, adds grouping + alerting

---

## Relevance to Platform

The platform currently has no structured logging. All observability is via:
- Cron-redirect logs in `~/logs/` (unstructured, rotated by logrotate)
- heartbeat.sh health pings (15-min interval; detects container-down, not in-process errors)
- Console output captured by Docker's json-file driver (no size limits confirmed)

A crash or silent error in goal processing (e.g., a match that throws and is swallowed) would be invisible until a user complained or heartbeat detected downtime. Structured logging and crash capture close this gap before external users arrive.

Docker log rotation is the only silent risk that could hit without notice — unbounded container log growth.

---

## Tasks Generated

| ID | Task | Priority | Phase |
|---|---|---|---|
| TSK-122 | Add Docker log rotation to docker-compose.yml (max-size: 10m, max-file: 5) | P2 | 1 |
| TSK-123 | Integrate Pino + pino-http as structured logger; replace console.* in src/; configure PII redaction serializer | P2 | 1 |
| TSK-124 | Add uncaughtExceptionMonitor + unhandledRejection handlers (depends on TSK-123) | P2 | 1 |
| TSK-125 | Evaluate Sentry free tier: instrument, test beforeSend PII scrubbing, confirm GDPR suitability (decision gate before external users) | P3 | 1 |
