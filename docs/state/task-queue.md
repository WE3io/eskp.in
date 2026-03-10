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
| Ubuntu security updates (verify) | Weekly | 2026-03-10 | 2026-03-17 | Verify unattended-upgrades is current |
| SSL/TLS certificate check | Monthly | never | 2026-04-09 | Verify Cloudflare origin cert expiry |
| Server performance baseline | Monthly | never | 2026-04-09 | Record CPU, memory, disk, response times |
| Review Anthropic changelog | Monthly | never | 2026-04-09 | Check for Claude Code updates, API changes |
| Review Cloudflare changelog | Monthly | never | 2026-04-09 | Check for new features relevant to platform |
| Operational review (session logs) | Every 10 sessions | 2026-03-10 (session 11) | Session 20 | Track count in docs/state/self-directed.md |
| Public claims coherence check | Monthly | 2026-03-10 | 2026-04-10 | Verify all rows in docs/state/public-claims-register.md are still "Aligned" |

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
| TSK-039 | Register with ICO and pay £52 data protection fee (Tier 1) | **done** 2026-03-10 | Sunil registered, ICO number C1889388; privacy.html + ROPA updated |
| TSK-080 | Accept Hetzner AVV (Art.28 DPA) via Hetzner console | open | **Requires Sunil** — navigate to Account → Data Protection in Hetzner Robot/Cloud |
| TSK-081 | Accept Cloudflare DPA via Cloudflare dashboard | open | **Requires Sunil** — Account → Configurations → Privacy → DPA |
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
| TSK-009 | Second blog post (payment launch / progress update) | **done** 2026-03-09 | public/blog/002-week-4-payments-and-governance.html |
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
| TSK-034 | Design clarification loop: route vague goal back to user via email | **done** 2026-03-10 | Implemented: needs_clarification flag in decompose, sendClarificationRequest, processClarification, pending_clarification status |
| TSK-035 | Data minimisation: strip context/outcome from match.js LLM prompt | **done** 2026-03-09 | Now sends summary + tags only; UK GDPR Art.5(1)(c) |
| TSK-036 | Sensitive goal routing: skip LLM matching for hard-exclusion-adjacent goals | **done** 2026-03-10 | detectSensitiveDomain() on decomposed summary in match.js; falls back to tag-overlap |
| TSK-037 | Privacy policy update: disclose AI processing of goal summaries and helper profiles | **done** 2026-03-09 | Section 3 expanded: decomposition + matching, LB, international transfer, Stripe added to s5 |
| TSK-038 | Tag normalisation at helper onboarding: suggest canonical tags | **done** 2026-03-10 | CANONICAL_TAGS list (56 tags) + suggestCanonical() + 'suggest-tags' subcommand in manage-helpers.js |
| TSK-028 | Research: UK GDPR compliance checklist for personal-goal platforms | **done** 2026-03-09 | docs/research/2026-03-09-uk-gdpr-compliance-checklist.md; tasks TSK-039–045 generated |
| TSK-029 | Research: email-first platform best practices (deliverability, reputation) | **done** 2026-03-10 | docs/research/2026-03-10-email-deliverability.md; TSK-050–053 generated |
| TSK-030 | Research: what makes a good first-user experience for this type of platform | **done** 2026-03-10 | docs/research/2026-03-10-first-user-experience.md; 24 findings, tasks TSK-064–071 generated |

---

### P2 — Medium (email deliverability — from TSK-029 research)

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-050 | Ensure all email templates send both HTML + plain text versions | **done** 2026-03-10 | email.js now sends both html+text when both provided (Resend multipart/alternative) |
| TSK-051 | Implement Resend webhook handler for bounce/complaint events | **done** 2026-03-10 | POST /webhooks/resend; Svix HMAC-SHA256; email-suppression.js; isSuppressed() in email.js. RESEND_WEBHOOK_SECRET + REPLY_TOKEN_SECRET added to .env by Sunil 2026-03-10 — reply-token fallback warning eliminated. |
| TSK-053 | Verify SPF, DKIM, DMARC records correctly configured in Cloudflare DNS | **done** 2026-03-10 | All three confirmed: DKIM (resend._domainkey.mail.eskp.in), SPF, DMARC p=quarantine |
| TSK-048 | Prompt instruction in decompose.js to generalise special category data | **done** 2026-03-10 | From DPIA; data minimisation for sensitive fields |
| TSK-049 | Flag sensitive-domain goals for human review before sending introduction email | **done** 2026-03-10 | sensitive-flag.js + processGoalSensitive(); 7 domains; panel alert email |
| TSK-054 | Define and implement raw_text retention policy | **done** 2026-03-10 | raw_text nulled immediately after decomposition; column made nullable; back-fill migration applied; docs/operations/raw-text-retention-policy.md |
| TSK-055 | Add AI disclosure line to acknowledgement emails | **done** 2026-03-10 | "Our AI analysed your goal" — Art.3.3 Constitution |

---

### P3 — Low

| ID | Task | Status | Notes |
|---|---|---|---|
| TSK-020 | Archive completed Week 1–3 checklists from CLAUDE.md | **done** 2026-03-09 | Done this session |
| TSK-041 | Write LIA (Legitimate Interests Assessment) in docs/operations/lia.md | **done** 2026-03-10 | docs/operations/lia.md — Art.6(1)(f) established for AI decomposition + matching |
| TSK-042 | Conduct and document DPIA for AI goal decomposition + matching | **done** 2026-03-10 | docs/operations/dpia.md — 5 risks, TSK-048/049 generated |
| TSK-044 | Write data subject rights procedure + verify erasure cascade covers all DB tables | **done** 2026-03-10 | docs/operations/data-subject-rights-procedure.md; cascade fixed (helpers + helper_applications added) |
| TSK-045 | Review and document that processor DPAs are in place (Anthropic, Resend, Stripe, Hetzner, Cloudflare) | **done** 2026-03-10 | docs/operations/processor-dpas.md; TSK-080/081 generated for Hetzner/Cloudflare DPA acceptance |
| TSK-046 | Add 1GB swapfile to prevent OOM kills under memory pressure | **done** 2026-03-10 | fallocate -l 1G /swapfile + fstab entry; 1GB swap now active |
| TSK-047 | Configure log rotation (logrotate) for ~/logs/ directory | **done** 2026-03-10 | /etc/logrotate.d/eskp-logs; daily rotate, 14-day retention; session log cleanup cron |
| TSK-052 | Register mail.eskp.in with Google Postmaster Tools | **needs Sunil** | Instructions at docs/operations/google-postmaster-tools-setup.md — requires Google account login |
| TSK-021 | `account-deletion-flow` | **done** 2026-03-10 | Art.10 Phase 1 — email-triggered, token confirmation, cascade delete, audit log |
| TSK-022 | `data-export-endpoint` | **done** 2026-03-10 | Art.10 Phase 1 — GET /account/export?token=xxx, one-time token, 48h expiry |
| TSK-056 | Design basic data retention/deletion automation | **done** 2026-03-10 | scripts/data-retention.js: auto-close stale goals (90d active, 180d introduced), purge decomposed JSONB (365d closed). Monthly cron 1st 06:00 UTC. |
| TSK-057 | Create public roadmap page (/roadmap.html) | **done** 2026-03-10 | public/roadmap.html; live features, coming next, planned, user requests; footer links added to all 6 pages |
| TSK-023 | `algorithmic-transparency-disclosure` | **done** 2026-03-10 | Match email: "Our AI matched your goal to X"; opt-out line added; landing page timeline updated; Art.10.2.3 |
| TSK-024 | `revenue-model-constraint-terms` | **done** 2026-03-10 | New section 11 in terms.html; explicit no-advertising/no-data-sale commitment; Art.10.2.1 |
| TSK-025 | `exclusion-register-operational` | **done** 2026-03-10 | Register already complete with all acceptance criteria: 10 regulated domains, 9 adjacency, signposting, FCA note, review schedule |
| TSK-058 | Add 3 concrete example goals to landing page | **done** 2026-03-10 | index.html — career/business/technical examples in 'What does a goal look like?' section |
| TSK-059 | Add "What to expect" timeline section to landing page | **done** 2026-03-10 | index.html — 4-step timeline: 24h ack, match, no-match, after intro |
| TSK-060 | Draft Twitter/X thread for @awebot1529222 — helper recruitment | **done** 2026-03-10 | docs/updates/002-helper-recruitment-thread.md — 6 tweets ready to post |
| TSK-061 | Add CTA to end of each blog post (join + submit) | **done** 2026-03-10 | All 3 blog posts updated with styled 'Try the platform' CTA box |
| TSK-062 | Grow helper network — reach 3 new helper candidates | open | LinkedIn post + personal outreach template drafted (docs/updates/003-linkedin-helper-recruitment.md); awaiting Sunil to post/send |
| TSK-063 | No-match timeout: email user after 7 days if goal still in 'matched' | **done** 2026-03-10 | scripts/followup.js — no-match + unpaid reminder variants; daily 09:00 cron; follow_up_sent_at column |
| TSK-064 | AI goal-decomposition email reframed as hypothesis | **done** 2026-03-10 | "Here's how we've understood your goal — reply if anything looks off" |
| TSK-065 | Add 24-hour SLA to no-match acknowledgement email | **done** 2026-03-10 | "We'll get back to you within 24 hours" added to no-match variant |
| TSK-066 | Add "Meet the helpers" section to landing page | **done** 2026-03-10 | Sunil's name, bio, expertise tags; social proof for first visitors |
| TSK-067 | Add helper bio to match notification email | **done** 2026-03-10 | HTML (styled card) + plain text; humanises the helper match |
| TSK-068 | Build post-session follow-up email (24h after goal 'introduced') | **done** 2026-03-10 | scripts/followup.js — 24h check-in email; cron daily 09:00; follow_up_sent_at prevents duplicates |
| TSK-069 | Add plain-language data-handling statement to first AI response email | **done** 2026-03-10 | HTML footer + plain-text equivalent in sendAcknowledgement(); links to privacy.html |
| TSK-070 | Design lightweight commitment signal for goal submissions | **done** 2026-03-10 | docs/research/2026-03-10-commitment-signals.md — clarification loop covers current need; TSK-090 generated |
| TSK-071 | Research and draft plan for community layer (5+ active users) | **done** 2026-03-10 | docs/research/2026-03-10-community-layer.md — phased plan; TSK-091/092 generated |
| TSK-072 | Build weekly helper digest — email to helpers summarising incoming goal types | **done** 2026-03-10 | scripts/helper-digest.js; cron Monday 08:00 UTC; personalised by expertise overlap |
| TSK-073 | Pre-match helper notification: heads-up email when goal in helper's domain submitted | **done** 2026-03-10 | sendPreMatchNotification() in platform.js; score >= 40 threshold; no user contact details |
| TSK-074 | Create private helper channel (Slack/email) as community space | **done** 2026-03-10 | docs/operations/helper-community.md — email-first now; Slack deferred to 5+ helpers with full setup instructions |
| TSK-075 | Dogfooding: invite Sunil to submit a real goal via the platform | **done** 2026-03-10 | Sunil submitted ICO registration goal at 07:10 UTC 2026-03-10; auto-matched; full flow confirmed working |
| TSK-076 | Add goal pipeline visibility to helper view — count in helper's domain, unmatched | **done** 2026-03-10 | Added to weekly helper digest: 'Pipeline in your domain: N goals awaiting match' section |
| TSK-079 | Add `restricted` flag to users table for Art.18 restriction requests | open | From data-subject-rights-procedure.md; implement when volume warrants |
| TSK-082 | Add cert expiry check to heartbeat.sh or create standalone cert-check script | **done** 2026-03-10 | Added openssl s_client check to heartbeat.sh; alerts if <30 days to expiry; tested: 87 days remaining (Jun 2026) |
| TSK-083 | Log session duration in auto-session.sh summary line | **done** 2026-03-10 | SESSION_START_EPOCH + elapsed calculation; format: Xm Ys in Summary line |
| TSK-084 | session-end.sh: feedback-queue.md false-positive warning | **done** 2026-03-10 | Changed from 30min WARNING to 24h NOTE; eliminates persistent false-positive per session |
| TSK-085 | Document ALERT_EMAIL env var in .env.example or README | **done** 2026-03-10 | Added to .env.example with description |
| TSK-090 | Add pre-submission checklist copy to landing page CTA section | **done** 2026-03-10 | Three-point 'What to include' guide below CTA box on index.html |
| TSK-091 | Monthly outcome roundup email to past goal-submitters | **done** 2026-03-10 | scripts/outcome-roundup.js; cron 1st of month 10:00 UTC; dry-run tested |
| TSK-092 | "Notes" field for helper profiles (manage-helpers + DB) | **done** 2026-03-10 | helpers.notes TEXT column; manage-helpers set-notes + list updated |
| TSK-093 | Bug fix: "close" command in no-match email now handled | **done** 2026-03-10 | closeGoal() in platform.js; reply-token webhook now processes "close" replies; app redeployed |

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

| TSK-086 | Add "What if there's no match?" section to landing page | **done** 2026-03-10 | Highlighted callout with no-match guarantee before "Honest about what this is" section |
| TSK-087 | Add privacy micro-copy to goal submission CTA (data handling at decision point) | **done** 2026-03-10 | Privacy note + link below email CTA button on landing page |
| TSK-088 | Add "24-hour response" commitment to landing page hero area | **done** 2026-03-10 | Already present in cta-note ("We'll be in touch within 24 hours") — no change needed |
| TSK-089 | Add activity signal to helper card on landing page | **done** 2026-03-10 | "● Active this month" indicator next to Sunil's name |

---

| TSK-094 | 1-click match quality rating in follow-up email | **done** 2026-03-10 | GET /api/match-feedback; feedback_token + user_rating + user_rated_at on matches; idempotent |
| TSK-095 | Average match rating in weekly helper digest | **done** 2026-03-10 | AVG(user_rating) per helper; star display in HTML + plain text |
| TSK-096 | `pnpm stats` command — match quality + payment rate summary | **done** 2026-03-10 | scripts/stats.js: goal funnel, payment rate, rating breakdown, revenue |
| TSK-097 | Free-first-message payment model (research spike) | open | Defer to when 5+ users exist; see docs/research/2026-03-10-payment-ux-and-match-quality.md |
| TSK-098 | Bug fix: clarification loop not actually limited | **done** 2026-03-10 | Added clarification_attempts INT column; processGoal sets to 1; processClarification checks < 2 before re-asking; proceeds with best decomp after max |
| TSK-099 | Bug fix: HTML-unsafe user names in email bodies | **done** 2026-03-10 | Exported escHtml() from email-template.js; applied to userName/rawText in all HTML email bodies in platform.js |
| TSK-100 | Tag normalization in match.js tagOverlapRank | **done** 2026-03-10 | normaliseTag() collapses case/whitespace/slash/dot before comparison |
| TSK-101 | Canonical tags in decompose.js prompt | **done** 2026-03-10 | 56 canonical tags added to system prompt; Haiku prefers them for consistent vocabulary |
| TSK-102 | Missing migrations in migrate.js | **done** 2026-03-10 | Added ALTER TABLE for helpers.notes and goals.clarification_attempts |
| TSK-103 | Skip helpers with empty expertise in findMatches | **done** 2026-03-10 | Added array_length(h.expertise, 1) > 0 filter to helper query |
| TSK-104 | Bug fix: XSS in email scripts (data-retention, followup, helper-application, outcome-roundup) | **done** 2026-03-10 | escHtml() applied to all user-controlled strings in HTML email bodies |
| TSK-105 | Bug fix: SQL string interpolation in data-retention.js | **done** 2026-03-10 | Replaced INTERVAL interpolation with parameterized make_interval() |
| TSK-106 | Bug fix: invalid 'clarifying' status in helper-digest.js, data-retention.js, outcome-roundup.js | **done** 2026-03-10 | Replaced with correct schema statuses (decomposing, pending_clarification) |

| TSK-107 | Migrate semanticRank() in match.js to Anthropic tool_use | **done** 2026-03-10 | RANK_HELPERS_TOOL with forced tool_choice; eliminates JSON parse risk; consistent with decompose.js |
| TSK-108 | Add historical match rating to helper ranking | open | P3 — defer to 3+ helpers; blend avg rating into score |
| TSK-109 | Add active match count to helper ranking (capacity-aware) | open | P3 — defer to 3+ helpers |

*Last updated: 2026-03-10 (twentieth auto-session — research: matching algorithm quality)*
