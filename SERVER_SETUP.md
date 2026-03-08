# Server Setup Guide — Hetzner Ubuntu

## Prerequisites

Before starting, you need:

- [ ] A Hetzner Cloud server (Ubuntu 22.04 or 24.04 LTS) — minimum CX22 (2 vCPU, 4GB RAM, 40GB disk) for initial build; consider CX32 or higher if running PostgreSQL on the same box
- [ ] A domain name pointed to Cloudflare (or ready to be transferred)
- [ ] A Cloudflare account with API token (for the MCP server)
- [ ] An Anthropic API key with sufficient credits
- [ ] SSH access to the server

---

## Step 1: Base Server Setup

SSH into your Hetzner server and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create a dedicated service user (don't run everything as root)
sudo adduser --disabled-password --gecos "" platform
sudo usermod -aG sudo platform
sudo usermod -aG docker platform  # after Docker is installed

# Install essential tools
sudo apt install -y \
  curl \
  git \
  tmux \
  build-essential \
  ufw \
  fail2ban \
  unattended-upgrades

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Enable automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Disable password authentication for SSH
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

**From this point forward, switch to the `platform` user for all project work:**

```bash
sudo su - platform
```

---

## Step 2: Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x
npm --version

# Set up global npm directory (avoid sudo for global installs)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 3: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Log out and back in for group changes to take effect
# Then verify:
docker --version
docker compose version
```

---

## Step 4: Install PostgreSQL

Option A — Dockerised (recommended for isolation):

```bash
mkdir -p ~/postgres-data

docker run -d \
  --name postgres \
  --restart unless-stopped \
  -e POSTGRES_USER=platform \
  -e POSTGRES_PASSWORD=CHANGE_THIS_TO_A_STRONG_PASSWORD \
  -e POSTGRES_DB=platform \
  -v ~/postgres-data:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 \
  postgres:16-alpine
```

Option B — System install (if you prefer direct access):

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
```

---

## Step 5: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

---

## Step 6: Install Claude Agent SDK

For Python-based orchestration:

```bash
sudo apt install -y python3 python3-pip python3-venv

# Create a virtual environment for the project
mkdir -p ~/project
cd ~/project
python3 -m venv .venv
source .venv/bin/activate

pip install claude-agent-sdk
```

For TypeScript-based orchestration:

```bash
cd ~/project
npm init -y
npm install @anthropic-ai/claude-agent-sdk
```

---

## Step 7: Configure Environment

Create a `.env` file (never commit this to git):

```bash
cat > ~/project/.env << 'EOF'
# Anthropic
ANTHROPIC_API_KEY=your-api-key-here

# Claude Code Agent Teams (experimental)
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Database
DATABASE_URL=postgresql://platform:CHANGE_THIS@127.0.0.1:5432/platform

# Cloudflare
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_ZONE_ID=your-zone-id

# Email (configure once provider is chosen)
# EMAIL_API_KEY=
# EMAIL_FROM_ADDRESS=

# Budget
MONTHLY_TOKEN_BUDGET=0  # Set this to your actual budget in USD
EOF

chmod 600 ~/project/.env
```

---

## Step 8: Set Up Reverse Proxy (Caddy)

Caddy is simpler than nginx for automatic HTTPS.

**Important:** If your domain is proxied through Cloudflare (orange cloud), Cloudflare terminates TLS at the edge. This means Caddy's automatic Let's Encrypt certificates may fail because Cloudflare intercepts the ACME HTTP challenge. You have two options:

**Option A — Cloudflare Origin Certificate (recommended):**
Generate an origin certificate in the Cloudflare dashboard (SSL/TLS → Origin Server → Create Certificate). Download the cert and key, then configure Caddy to use them:

```bash
sudo mkdir -p /etc/caddy/certs
# Copy your origin cert and key to /etc/caddy/certs/

sudo cat > /etc/caddy/Caddyfile << 'EOF'
yourdomain.com {
    tls /etc/caddy/certs/origin.pem /etc/caddy/certs/origin-key.pem
    reverse_proxy localhost:3000
}
EOF

sudo systemctl restart caddy
```

Set Cloudflare SSL/TLS mode to "Full (Strict)" in the dashboard.

**Option B — DNS ACME challenge:**
Install the Caddy Cloudflare DNS plugin and use DNS-based certificate validation, which bypasses the proxy. This is more complex but fully automated. The Claude instance can set this up if preferred.

**Option C — Cloudflare proxy off (grey cloud):**
If you disable Cloudflare's proxy (DNS only), Caddy's default automatic HTTPS works out of the box. You lose Cloudflare's CDN and WAF, but gain simplicity. Not recommended long-term.

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

---

## Step 9: Set Up tmux Session for Claude

Create a persistent tmux session so Claude Code survives SSH disconnections:

```bash
# Create a named session
tmux new-session -d -s claude

# Attach to it
tmux attach -t claude

# Inside tmux, navigate to project and start Claude Code
cd ~/project
source .venv/bin/activate  # if using Python
export $(cat .env | xargs)
claude
```

tmux basics:
- `Ctrl+B D` — detach (Claude keeps running)
- `tmux attach -t claude` — reattach
- `Ctrl+B %` — split pane vertically (useful for Agent Teams)

---

## Step 10: Initialise the Project Repository

```bash
cd ~/project

git init
git branch -M main

# Copy in the founding documents
# (CONSTITUTION.md and CLAUDE.md should be placed here)

# Create initial structure
mkdir -p docs/decisions
mkdir -p src
mkdir -p scripts

# Initial commit
git add .
git commit -m "Initial commit: founding documents and project structure"
```

---

## Step 11: Configure Cloudflare MCP Server

The Cloudflare MCP server allows Claude to manage DNS records programmatically.

```bash
# Install the Cloudflare MCP server
# (Check for the latest installation method — this may be an npm package or a standalone binary)
# As of March 2026, the community Cloudflare MCP server can be added via:

claude mcp add cloudflare -- npx @anthropic-ai/cloudflare-mcp-server
```

Alternatively, Claude can interact with the Cloudflare API directly via curl or an SDK. The MCP approach is preferred for tighter integration with Claude Code.

---

## What Happens Next

Once this setup is complete:

1. Sunil transfers the CONSTITUTION.md and CLAUDE.md to the server
2. Sunil starts a Claude Code session inside the tmux session
3. Claude reads the CLAUDE.md and CONSTITUTION.md
4. Claude begins the Week 1 build sequence
5. Claude sends its first email to the panel — a self-introduction and initial goal decomposition

---

## Security Checklist

- [ ] SSH key-only authentication (disable password auth) — handled in Step 1
- [ ] UFW firewall enabled with minimal open ports
- [ ] fail2ban configured and running
- [ ] Automatic security updates enabled
- [ ] `.env` file has restrictive permissions (600)
- [ ] PostgreSQL only listening on localhost
- [ ] Docker containers use non-root users where possible
- [ ] Cloudflare API token scoped to minimum required permissions
- [ ] Dedicated `platform` service user created (not running as root)
- [ ] Regular backups configured for PostgreSQL data (see below)

---

## Backup Strategy

PostgreSQL backups are critical — this is where user data lives.

### Automated daily backups:

```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
cat > ~/scripts/backup-db.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR=~/backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/platform_$TIMESTAMP.sql.gz"

# Dump and compress
docker exec postgres pg_dump -U platform platform | gzip > "$BACKUP_FILE"

# Keep only last 14 days
find "$BACKUP_DIR" -name "platform_*.sql.gz" -mtime +14 -delete

echo "Backup completed: $BACKUP_FILE"
SCRIPT

chmod +x ~/scripts/backup-db.sh

# Add to crontab (daily at 03:00)
(crontab -l 2>/dev/null; echo "0 3 * * * ~/scripts/backup-db.sh >> ~/backups/backup.log 2>&1") | crontab -
```

### Optional: off-server backup
For additional safety, the Claude instance should evaluate sending encrypted backups to an off-server location (Hetzner Storage Box, Backblaze B2, or similar). This is a build-vs-buy decision to document in `/docs/decisions/`.

---

*This guide will be updated by the Claude instance as the infrastructure evolves.*
