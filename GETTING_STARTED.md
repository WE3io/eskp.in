# Getting Started — Action Items for Sunil

## Things Only You Can Do

These are the items that require human action before the Claude instance can begin operating.

### 1. Infrastructure (do first)
- [ ] Provision a Hetzner server (Ubuntu 24.04 LTS, minimum CX22)
- [ ] Register or assign a domain name
- [ ] Set up Cloudflare account and point the domain's nameservers there
- [ ] Create a Cloudflare API token (scoped to DNS edit + Zone read for your domain)
- [ ] Create an Anthropic API key (or use an existing one)
- [ ] Set a monthly token budget in GBP/USD — this is the Claude instance's operating constraint

### 2. Governance
- [ ] Define the human panel — who are these people, what expertise do they bring, and what are their email addresses?
- [ ] Confirm your own escalation email address
- [ ] Review and sign the CONSTITUTION.md (amend anything you disagree with — this is the last easy moment to change it before the Claude instance has a vote)

### 3. Communication
- [ ] Decide which social media channels to use for build-in-public (X/Twitter, LinkedIn, Bluesky, Mastodon, or others)
- [ ] Create or designate accounts for those channels
- [ ] Provide API credentials or MCP server details for posting (or decide that Claude drafts and you approve/post initially)

### 4. Email
- [ ] Decide on a transactional email provider (Resend, Postmark, or AWS SES are good options) or let Claude evaluate and choose
- [ ] Set up a receiving email address for the platform (e.g. hello@yourdomain.com)
- [ ] Configure email forwarding or webhook so that Claude can process inbound emails

### 5. Launch
- [ ] Run the server setup guide (SERVER_SETUP.md) — or have Claude do it once SSH access is available
- [ ] Transfer CONSTITUTION.md and CLAUDE.md to the server
- [ ] Start a Claude Code session and point it at the project directory
- [ ] Watch it go

---

## Decisions to Make Now

These are choices that affect the initial build. Claude can proceed with defaults, but your input would be valuable:

| Decision | Default if not specified | Notes |
|---|---|---|
| Monthly token budget | — | Must be specified. Suggest £150-300/month for Phase 1. Agent Teams uses ~7x single-session tokens; budget assumes mix of Sonnet (routine) and Opus (strategic). Track actual spend in week 1 and adjust. |
| Domain name | — | Must be specified. |
| Project name | — | The platform needs a name. Claude can propose options. |
| Initial paid services budget | £0 beyond API costs | If you want to pre-approve specific paid tools (e.g. Resend at ~£20/month), specify here. |
| Git hosting | Self-hosted on Hetzner | GitHub is the alternative — better for visibility but adds a dependency. |
| First external users | — | Do you have people in mind for early access? |

---

## What Happens After Launch

1. Claude reads CLAUDE.md and CONSTITUTION.md
2. Claude sets up the remaining infrastructure (database, email, deployment pipeline)
3. Claude sends its first email to you and the panel — introducing itself and decomposing its initial goals
4. Claude begins building the core platform using the dogfooding protocol
5. Claude posts its first build-in-public update
6. You receive weekly budget reports and development summaries via email

---

*Once the panel is defined and the server is provisioned, everything else can begin. The Claude instance is designed to operate with minimal ongoing input — but it will reach out when it needs you.*
