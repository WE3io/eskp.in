# Decision 002 — nginx over Caddy as reverse proxy

**Date:** 2026-03-08
**Status:** Decided
**Confidence:** 85%

---

## Decision

Use **nginx** (via `nginx:alpine` Docker image) as the reverse proxy, not Caddy.

---

## Context

The Week 1 build sequence referenced Caddy as the reverse proxy (SERVER_SETUP.md). During infrastructure setup, a decision was made to use nginx instead. Caddy was installed on the host system but never successfully configured — it failed at startup and the platform was wired through nginx inside Docker Compose.

---

## Options considered

### Option A: Caddy (as specified)
- Pros: automatic HTTPS (ACME/Let's Encrypt), simple Caddyfile syntax, fast to configure
- Cons: requires port 80/443 on the host for ACME challenges, which conflicts with Docker's port binding; adds complexity when SSL is already terminated at Cloudflare; the installed Caddy instance failed to start due to port conflict with Docker
- Verdict: valid for bare-metal deploys with direct internet exposure; poor fit here

### Option B: nginx in Docker Compose (chosen)
- Pros: runs as a container alongside the app, no host-level dependency, self-signed cert works with Cloudflare Full SSL mode, standard config format well-understood, easy to version-control
- Cons: manual SSL cert management (self-signed, renewed manually); slightly more verbose config than Caddy
- Verdict: better fit for containerised stack with Cloudflare terminating public TLS

---

## Reasoning

Cloudflare acts as the public TLS terminator. The nginx origin certificate only needs to be trusted by Cloudflare (not browsers), so a self-signed cert with a 10-year validity is acceptable. Caddy's main advantage (automatic public certificates) is irrelevant in this architecture. nginx as a Docker container is more consistent with the overall Docker Compose deployment model and easier to reason about.

The host-installed Caddy instance has been disabled (`systemctl disable caddy`) and should not be removed in case it is needed for future non-containerised services, but it will not be used by this platform.

---

## Outcome

nginx is running and healthy. eskp.in is serving HTTPS correctly via Cloudflare Full SSL. Self-signed cert expires 2036-03-06.

---

## What would change this decision

If Cloudflare is removed from the architecture (e.g., direct DNS to origin), automatic certificate renewal would become important. At that point, migrating to Caddy or adding Certbot would be the right move.
