# Task Queue

Every session (automated and manual) reads this file before deciding what to work on.
Update it before ending any session: mark completed tasks, add new ones, refresh recurring task dates.

## Priority Levels

| Level | Meaning | Response |
|---|---|---|
| P0 | CRITICAL — broken production, security, data loss | Fix immediately, before any other work |
| P1 | HIGH — user-facing bugs, overdue commitments, blockers | Do this session |
| P2 | MEDIUM — feature work, improvements, obligations with future deadlines | Do this week |
| P3 | LOW — nice-to-haves, refactoring, housekeeping | Do when P0–P2 queue is clear |

---

## Recurring Tasks

| Task | Frequency | Last completed | Next due | SLA |
|---|---|---|---|---|
| Budget report to panel | Weekly (Monday) | 2026-03-09 | 2026-03-16 | Send by EOD Monday |
| Build-in-public post | Weekly (Friday) | 2026-03-09 | 2026-03-13 | — |
| Backup verification (restore test) | Monthly | 2026-03-09 | 2026-04-09 | See backup-restore-log.md |
| State file accuracy check | Every session | 2026-03-09 | Next session | Before session ends |
| npm audit / dependency CVE check | Weekly | 2026-03-10 | 2026-03-17 | Fix critical immediately; log others |
| Disk usage check and cleanup | Weekly | 2026-03-10 | 2026-03-17 | Alert if >80%; clean Docker images + old logs |
| Docker image updates (postgres, nginx) | Monthly | never | 2026-04-09 | Check for security patches |
| Ubuntu security updates (verify) | Weekly | never | 2026-03-13 | Verify unattended-upgrades is current |
| SSL/TLS certificate check | Monthly | never | 2026-04-09 | Verify Cloudflare origin cert expiry |
| Server performance baseline | Monthly | never | 2026-04-09 | Record CPU, memory, disk, response times |
| Review Anthropic changelog | Monthly | never | 2026-04-09 | Check for Claude Code updates, API changes |
| Review Cloudflare changelog | Monthly | never | 2026-04-09 | Check for new features relevant to platform |
| Operational review (session logs) | Every 10 sessions | never | After session 10 | See Operational Improvement in CLAUDE.md |

---

## Active Tasks

### P0 — Critical

| ID | Task | Status | Backlog item |
|---|---|---|---|
| TSK-001 | Fix `GET /goals/:id` — `json_array_elements` on jsonb column returns 500 | **done** 2026-03-09 | `fix-goals-endpoint-jsonb.md` |

---

### P1 — High

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-039 | Register with ICO and pay £52 data protection fee (Tier 1) | open | **Must do before opening to external users** — criminal offence to process without paying |
| TSK-040 | Article 30 ROPA created | **done** 2026-03-09 | docs/operations/ropa.md — 8 processing activities documented |
| TSK-043 | Breach response procedure | **done** 2026-03-09 | docs/operations/breach-response.md — Art.33/34 procedure + register |
| TSK-002 | Send first weekly budget report to Sunil | **done** 2026-03-09 | Sent via Resend |
| TSK-003 | Second build-in-public post | **done** 2026-03-09 | public/blog/002-week-4-payments-and-governance.html |
| TSK-004 | Backup restore test (first ever) | **done** 2026-03-09 | PASS — see `docs/operations/backup-restore-log.md` |
| TSK-005 | Commit all untracked backlog files | **done** 2026-03-09 | Committed in this session |
| TSK-006 | Implement `harden-auto-session.md` | **done** 2026-03-09 | settings.json + auto-session.sh complete; cron verification at next scheduled run |
| TSK-007 | Implement `session-end-script.md` | **done** 2026-03-09 | scripts/session-end.sh created and integrated |
| TSK-008 | Implement `basic-monitoring.md` | **done** 2026-03-09 | heartbeat.sh + check-cron-health.sh + cron entries added |

---

### P2 — Medium

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-009 | Second blog post (payment launch / progress update) | open | Unblocked — write draft, Sunil publishes |
| TSK-010 | Feedback mechanism surfaced to users | **done** 2026-03-09 | /feedback.html created; linked from index.html |
| TSK-011 | Grow helper network — promote `/join.html`, process applications | open | — |
| TSK-012 | First external user (non-panel) end-to-end | open | Depends on TSK-003 and helper network |
| TSK-013 | Off-site backup | **blocked** | Needs Sunil to provide S3-compatible bucket + credentials |
| TSK-014 | `hard-exclusion-content-triggers` | **done** 2026-03-09 | Art.11 Phase 1 — email webhook warm referral |
| TSK-015 | `privacy-tension-disclosure` | **done** 2026-03-09 | Art.11 Phase 1 — OSA/dyadic disclosure in privacy.html and terms.html |
| TSK-016 | `safety-resources-page` | **done** 2026-03-09 | Art.11 Phase 1 — /support.html created, footers updated |
| TSK-017 | `safeguarding-disclosure-terms` | **done** 2026-03-09 | Art.11 Phase 1 — section 7 in terms.html, section in join.html |
| TSK-018 | `emergency-override-protocol` | **done** 2026-03-09 | Art.11 Phase 1 — docs/operations/emergency-override-protocol.md + privacy.html ref |
| TSK-019 | Privacy policy legal sign-off | open | Target 2026-04-08 — remove draft banner when done |

---

### P2 — Medium (research priorities)

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-026 | Research: privacy-preserving matching architectures | **done** 2026-03-09 | docs/research/2026-03-09-privacy-preserving-matching.md; tasks TSK-035–038 generated |
| TSK-027 | Research: goal decomposition approaches (academic + industry) | **done** 2026-03-09 | docs/research/2026-03-09-goal-decomposition.md; tasks TSK-031–034 generated |
| TSK-031 | Add Zod schema validation to decompose.js output before DB write | **done** 2026-03-09 | Inline validateDecomposition() added |
| TSK-032 | Add 1-retry logic to decompose.js on JSON parse failure | **done** 2026-03-09 | callHaiku() + try/retry wrapper |
| TSK-033 | Investigate Anthropic tool_use for decompose.js structured output enforcement | **done** 2026-03-10 | Implemented: DECOMPOSE_TOOL with JSON Schema, tool_choice: force. Eliminates JSON parse errors. |
| TSK-034 | Design clarification loop: route vague goal back to user via email | open | From research TSK-027; requires email reply parsing |
| TSK-035 | Data minimisation: strip context/outcome from match.js LLM prompt | **done** 2026-03-09 | Now sends summary + tags only; UK GDPR Art.5(1)(c) |
| TSK-036 | Sensitive goal routing: skip LLM matching for hard-exclusion-adjacent goals | open | From research TSK-026; defence in depth |
| TSK-037 | Privacy policy update: disclose AI processing of goal summaries and helper profiles | **done** 2026-03-09 | Section 3 expanded: decomposition + matching, LB, international transfer, Stripe added to s5 |
| TSK-038 | Tag normalisation at helper onboarding: suggest canonical tags | open | From research TSK-026; improves tag-overlap quality |
| TSK-028 | Research: UK GDPR compliance checklist for personal-goal platforms | **done** 2026-03-09 | docs/research/2026-03-09-uk-gdpr-compliance-checklist.md; tasks TSK-039–045 generated |
| TSK-029 | Research: email-first platform best practices (deliverability, reputation) | **done** 2026-03-10 | docs/research/2026-03-10-email-deliverability.md; TSK-050–053 generated |
| TSK-030 | Research: what makes a good first-user experience for this type of platform | open | Growth — feeds into TSK-012 prep |

---

### P2 — Medium (email deliverability — from TSK-029 research)

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-050 | Ensure all email templates send both HTML + plain text versions | **done** 2026-03-10 | email.js now sends both html+text when both provided (Resend multipart/alternative) |
| TSK-051 | Implement Resend webhook handler for bounce/complaint events | open | From TSK-029; list hygiene |
| TSK-053 | Verify SPF, DKIM, DMARC records correctly configured in Cloudflare DNS | **done** 2026-03-10 | All three confirmed: DKIM (resend._domainkey.mail.eskp.in), SPF, DMARC p=quarantine |
| TSK-048 | Prompt instruction in decompose.js to generalise special category data | **done** 2026-03-10 | From DPIA; data minimisation for sensitive fields |
| TSK-049 | Flag sensitive-domain goals for human review before sending introduction email | **done** 2026-03-10 | sensitive-flag.js + processGoalSensitive(); 7 domains; panel alert email |
| TSK-054 | Define and implement raw_text retention policy | open | From mission alignment 2026-03-10; Art.5(1)(e) GDPR storage limitation |
| TSK-055 | Add AI disclosure line to acknowledgement emails | **done** 2026-03-10 | "Our AI analysed your goal" — Art.3.3 Constitution |

---

### P3 — Low

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-020 | Archive completed Week 1–3 checklists from CLAUDE.md | **done** 2026-03-09 | Done this session |
| TSK-041 | Write LIA (Legitimate Interests Assessment) in docs/operations/lia.md | **done** 2026-03-10 | docs/operations/lia.md — Art.6(1)(f) established for AI decomposition + matching |
| TSK-042 | Conduct and document DPIA for AI goal decomposition + matching | **done** 2026-03-10 | docs/operations/dpia.md — 5 risks, TSK-048/049 generated |
| TSK-044 | Write data subject rights procedure + verify erasure cascade covers all DB tables | open | From TSK-028; Art.15–22 obligations |
| TSK-045 | Review and document that processor DPAs are in place (Anthropic, Resend, Stripe, Hetzner, Cloudflare) | open | From TSK-028; Art.28 |
| TSK-046 | Add 1GB swapfile to prevent OOM kills under memory pressure | open | From infrastructure check 2026-03-10; low urgency |
| TSK-047 | Configure log rotation (logrotate) for ~/logs/ directory | open | From infrastructure check; prevent unbounded growth |
| TSK-052 | Register mail.eskp.in with Google Postmaster Tools | open | From TSK-029; monitor Gmail deliverability |
| TSK-021 | `account-deletion-flow` | **done** 2026-03-10 | Art.10 Phase 1 — email-triggered, token confirmation, cascade delete, audit log |
| TSK-022 | `data-export-endpoint` | **done** 2026-03-10 | Art.10 Phase 1 — GET /account/export?token=xxx, one-time token, 48h expiry |
| TSK-056 | Design basic data retention/deletion automation | open | From mission alignment; goals with no activity after N months auto-closed |
| TSK-057 | Create public roadmap page (/roadmap.html) | open | Art.3.4 User-Driven Development; transparency commitment |
| TSK-023 | `algorithmic-transparency-disclosure` | open | Art.10 Phase 1 |
| TSK-024 | `revenue-model-constraint-terms` | open | Art.10 Phase 1 |
| TSK-025 | `exclusion-register-operational` | open | Art.11 Phase 1 (register exists; this covers update process) |
| TSK-058 | Add 3 concrete example goals to landing page | open | Growth — reduces submission anxiety for first-time users |
| TSK-059 | Add "What to expect" timeline section to landing page | open | Growth — clarifies 24h ack + match timeline or no-match outcome |
| TSK-060 | Draft Twitter/X thread for @awebot1529222 — helper recruitment | open | Growth — build-in-public; helper network is primary bottleneck |
| TSK-061 | Add CTA to end of each blog post (join + submit) | open | Growth — blog visitors are warm leads |
| TSK-062 | Grow helper network — reach 3 new helper candidates | open | Growth — TSK-012 (first external user) is blocked without more helpers |
| TSK-063 | No-match timeout: email user after 7 days if goal still in 'matched' | open | UX — prevents silent dead ends for unmatched goals |

---

## Completed (last 10)

| ID | Task | Completed | Notes |
|---|---|---|---|
| — | Infrastructure audit + security remediation | 2026-03-08 | Block 1 audit |
| — | Rate limiting, input validation, PII fix, prompt injection defence | 2026-03-08 | — |
| — | Credential hygiene: .mcp.json removed from history | 2026-03-08 | — |
| — | Constitution v1.1 (Art.10) + v1.2 (Art.11) ratified | 2026-03-08 | — |
| — | Autonomous operation readiness audit | 2026-03-08 | — |
| — | Orchestration architecture + Agent SDK evaluation | 2026-03-08 | Decision 006 |
| — | Work items created for operational hardening blocks 1–4, 6–7 | 2026-03-09 | — |
| — | `.claude/settings.json` Edit permission fix | 2026-03-09 | Root cause of all auto-session stalls |
| — | `auto-session.sh` hardened (lock, .env, outcome check, alerting, prompt) | 2026-03-09 | TSK-006 in progress |
| — | `auto-session.sh` improvements: multi-task, 45min timeout, skills ref, git push, log rotation, shell injection fix, success notification, session-end scope fix | 2026-03-09 | 8-item improvement batch from Sunil |

---

*Last updated: 2026-03-10 (sixth auto-session — TSK-021/022/050 done; growth research + nav fix; TSK-058–063 generated)*
