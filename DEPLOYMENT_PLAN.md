# Deployment Plan — Step by Step

This is the complete sequence to go from where you are now to a running Claude instance on your Hetzner server. Steps are ordered by dependency — each step requires the previous ones to be complete.

---

## Completeness Audit

Before starting, confirm everything is present. The `project-bootstrap.tar.gz` file contains:

```
project/
├── .claude/
│   ├── settings.json                          # Agent Teams enabled, permissions configured
│   └── skills/
│       └── task-scope-gate/
│           ├── SKILL.md                        # The quality gate skill
│           └── references/
│               ├── dimensions.md               # 8 scoring dimensions
│               └── worked-example.md           # Worked example
├── .env.example                                # Environment variable template
├── .gitignore                                  # Git ignore rules
├── CLAUDE.md                                   # Operational instructions for the Claude instance
├── CONSTITUTION.md                             # Founding charter and governance
├── GETTING_STARTED.md                          # Your action items (this overlaps with this plan)
├── README.md                                   # Project overview
├── SERVER_SETUP.md                             # Server infrastructure guide
├── docker-compose.yml                          # PostgreSQL container config
├── config/.gitkeep                             # Empty config directory
├── docs/
│   ├── decisions/.gitkeep                      # Decision log directory
│   └── state/
│       ├── budget-tracker.md                   # Monthly spend tracking
│       ├── current-sprint.md                   # Current work state
│       ├── feedback-queue.md                   # User feedback queue
│       └── recent-decisions.md                 # Last 10 decisions
├── scripts/
│   └── backup-db.sh                            # Automated database backup script
└── src/.gitkeep                                # Application source directory
```

### What still needs YOUR input (placeholders in the documents):

| Placeholder | Where | What you need to provide |
|---|---|---|
| `[TO BE CONFIGURED]` | CLAUDE.md — escalation email | Your email address for escalation |
| `[TO BE CONFIGURED BY SUNIL]` | CLAUDE.md — monthly budget | Monthly token budget in GBP/USD |
| `[TO BE PROVIDED BY SUNIL ON REQUEST]` | CLAUDE.md — social channels | Social media accounts for build-in-public |
| `REPLACE_ME` values | .env.example → .env | Actual API keys, passwords, zone IDs |
| `yourdomain.com` | SERVER_SETUP.md / Caddyfile | Your chosen domain name |
| Human panel | CLAUDE.md | Names, expertise, email addresses |
| Project name | README.md / domain | What this platform is called |

---

## Phase A: Decisions You Make Now (before touching the server)

### A1. Choose a project name and domain
The platform needs a name. Register a domain or use one you already have. This is needed before configuring Cloudflare or Caddy.

### A2. Set your monthly token budget
Recommendation: £150–300/month for Phase 1. This covers a mix of Sonnet (routine work) and Opus (strategic decisions) with Agent Teams sessions. You can adjust after the first month based on actual usage.

### A3. Define your human panel
Who are these people? What expertise does each bring? What are their email addresses? The Claude instance needs this to begin the dogfooding protocol. Even a panel of one (you) works to start — you can add members later.

### A4. Choose social media channels for build-in-public
X/Twitter, LinkedIn, Bluesky, or others. Decide whether Claude posts directly (via API) or drafts for your approval initially. The second option is lower risk to start.

### A5. Review the CONSTITUTION.md
This is the last easy moment to amend it. Once the Claude instance acknowledges it, changes require the consensus process defined within it. Read it carefully. If anything doesn't match your intent, change it now.

---

## Phase B: Server Provisioning (you do this)

### B1. Provision the Hetzner server
- Go to Hetzner Cloud console
- Create a new server: Ubuntu 24.04 LTS, minimum CX22 (2 vCPU, 4GB RAM)
- Add your SSH public key during creation
- Note the server's IP address

### B2. Set up Cloudflare
- Log into Cloudflare (or create an account)
- Add your domain and point its nameservers to Cloudflare
- Create an API token: Permissions → Zone: DNS: Edit, Zone: Zone: Read. Scope to your specific domain.
- Note the Zone ID (visible on the domain's overview page) and the API token

### B3. Get your Anthropic API key
- Go to console.anthropic.com
- Create an API key (or use an existing one)
- Ensure there are sufficient credits loaded for your monthly budget

---

## Phase C: Server Setup (you do this, following SERVER_SETUP.md)

SSH into the server and run the following in order. Full commands are in SERVER_SETUP.md.

### C1. Base server hardening
```bash
sudo apt update && sudo apt upgrade -y
# Create platform user, install tools, configure firewall, disable password SSH
# See SERVER_SETUP.md Step 1 for full commands
```

### C2. Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### C3. Install Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker platform
# Log out and back in
```

### C4. Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### C5. Install Claude Agent SDK
```bash
sudo apt install -y python3 python3-pip python3-venv
# Or use TypeScript — the Claude instance will decide during setup
```

### C6. Install Caddy (reverse proxy)
```bash
# See SERVER_SETUP.md Step 8 for full commands
# IMPORTANT: Use Cloudflare Origin Certificate option if domain is proxied
```

### C7. Install tmux
```bash
sudo apt install -y tmux
```

---

## Phase D: Project Deployment (you do this)

### D1. Transfer the project to the server
From your local machine:
```bash
scp project-bootstrap.tar.gz platform@YOUR_SERVER_IP:~/
```

### D2. Unpack and initialise
SSH in as the `platform` user:
```bash
cd ~
tar -xzf project-bootstrap.tar.gz
cd project

# Create the real .env from the template
cp .env.example .env
nano .env  # Fill in all REPLACE_ME values with real credentials
chmod 600 .env

# Initialise git
git init
git branch -M main
git add .
git commit -m "Initial commit: founding documents, project structure, task-scope-gate skill"
```

### D3. Start PostgreSQL
```bash
# Set the password in .env first, then:
export $(grep POSTGRES_PASSWORD .env | xargs)
docker compose up -d postgres

# Verify it's running
docker compose ps
docker exec platform-db pg_isready -U platform
```

### D4. Set up automated backups
```bash
chmod +x scripts/backup-db.sh
# Test it
./scripts/backup-db.sh

# Add to crontab (daily at 03:00)
(crontab -l 2>/dev/null; echo "0 3 * * * ~/project/scripts/backup-db.sh >> ~/backups/backup.log 2>&1") | crontab -
```

### D5. Configure Caddy with your domain
```bash
# If using Cloudflare Origin Certificate (recommended):
sudo mkdir -p /etc/caddy/certs
# Upload your origin cert and key to /etc/caddy/certs/
# Then configure the Caddyfile — see SERVER_SETUP.md Step 8, Option A
sudo systemctl restart caddy
```

### D6. Point DNS to the server
In Cloudflare dashboard: add an A record pointing your domain to the server's IP address. Enable the proxy (orange cloud).

---

## Phase E: Launch the Claude Instance

### E1. Start a tmux session
```bash
tmux new-session -s claude
```

### E2. Load the environment and start Claude Code
```bash
cd ~/project
export $(cat .env | xargs)
claude
```

### E3. Give Claude its first instruction
Once Claude Code is running, paste this:

```
Read CLAUDE.md and CONSTITUTION.md. Acknowledge the constitution. Then read
docs/state/current-sprint.md to understand where things stand. Begin the
Week 1 build sequence. Your first task is to verify all infrastructure is
operational (database, DNS, email capability) and then send your first email
to the panel introducing yourself and decomposing your initial goals.
```

### E4. Detach and let it run
```bash
# Ctrl+B then D to detach from tmux
# Claude continues running in the background
# Reattach anytime with: tmux attach -t claude
```

---

## Phase F: Ongoing (after launch)

### F1. Monitor
- Check in on the tmux session periodically
- Read the weekly budget reports Claude sends via email
- Follow the build-in-public updates on social media

### F2. Respond to escalations
- Claude will email you when it hits an escalation trigger
- Respond via email — Claude processes inbound email

### F3. Provide panel input
- When Claude sends requests to the panel, respond as you would to a colleague
- Your responses feed back into the platform's understanding of how help works

### F4. Review constitutional proposals
- If Claude proposes changes to the constitution, review and vote
- Your vote counts equally to Claude's — consensus is required

---

## Timeline Estimate

| Phase | Duration | Who |
|---|---|---|
| A: Decisions | 30 minutes | You |
| B: Server provisioning | 15 minutes | You |
| C: Server setup | 30–45 minutes | You (following the guide) |
| D: Project deployment | 15–20 minutes | You |
| E: Launch | 5 minutes | You |
| **Total to launch** | **~2 hours** | |

After that, the Claude instance takes over.

---

*This plan assumes you're comfortable with SSH and basic Linux commands. If any step is unclear, Claude Code can walk you through it once it's running — but the initial server setup and first launch require you to be hands-on.*
