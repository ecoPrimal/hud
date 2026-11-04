#!/bin/bash
# DISSOLVE THE SSH BLOCK — run ONE TIME from DigitalOcean web console
# After this, the membrane deploys itself. No SSH needed. Ever.
#
# Paste this entire script into: cloud.digitalocean.com → Droplets → golgiBody → Console
#
# What it does:
#   1. Pulls the latest code from GitHub (HTTPS, no SSH key needed)
#   2. Installs a 5-minute cron that auto-pulls forever
#   3. Writes deploy-status.json so the membrane can see its own freshness
#   4. Restores SSH key for northGate (so it works again, but is no longer NEEDED)
#   5. Reloads Caddy
#
# After this script runs, pushing to GitHub IS deploying.
# The block is dissolved. Not fixed — dissolved. Even the trace.

set -euo pipefail
echo "═══════════════════════════════════════"
echo "  DISSOLVING THE SSH BLOCK"
echo "  the membrane learns to breathe"
echo "═══════════════════════════════════════"

# --- 1. Find the HUD repo ---
HUD_DIR=""
for d in /opt/hud /var/www/hud /root/hud /home/kevin/hud; do
    if [ -d "$d/.git" ]; then
        HUD_DIR="$d"
        break
    fi
done
if [ -z "$HUD_DIR" ]; then
    HUD_DIR=$(find / -maxdepth 4 -name "pulse.json" -path "*/site/public/*" 2>/dev/null | head -1 | sed 's|/site/public/pulse.json||')
fi
if [ -z "$HUD_DIR" ]; then
    echo "ERROR: Can't find HUD repo"
    exit 1
fi
echo "  HUD found: $HUD_DIR"
cd "$HUD_DIR"

# --- 2. Ensure HTTPS remote exists ---
if ! git remote -v | grep -q "github.com/ecoPrimal/hud"; then
    git remote add github https://github.com/ecoPrimal/hud.git 2>/dev/null || true
fi

# --- 3. Pull NOW ---
echo ""
echo ">>> PULLING latest..."
git pull github main --no-edit 2>&1 || git pull origin main --no-edit 2>&1
echo "  ✓ pulled"

# --- 4. Install the cron — the membrane breathes its own updates ---
echo ""
echo ">>> INSTALLING auto-deploy cron..."
CRON_CMD="*/5 * * * * cd $HUD_DIR && git pull github main --no-edit >> /var/log/hud-deploy.log 2>&1 && date -u +\%Y-\%m-\%dT\%H:\%M:\%SZ > $HUD_DIR/site/public/deploy-status.json"

# Remove old hud-deploy crons, add the new one
(crontab -l 2>/dev/null | grep -v "hud-deploy\|hud.*git pull" ; echo "$CRON_CMD") | crontab -
echo "  ✓ cron installed: every 5 minutes, the membrane pulls itself"

# --- 5. Write initial deploy-status.json ---
echo ""
echo ">>> WRITING deploy-status.json..."
cat > "$HUD_DIR/site/public/deploy-status.json" << EOF
{
  "deployed": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "method": "dissolve_ssh_block",
  "commit": "$(git rev-parse --short HEAD)",
  "branch": "main",
  "auto": true,
  "interval": "5m",
  "note": "the membrane deploys itself. no SSH needed. the block is dissolved."
}
EOF
echo "  ✓ deploy-status.json written"

# --- 6. Restore SSH key for northGate (nice to have, not needed) ---
echo ""
echo ">>> RESTORING SSH key (optional now)..."
PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDrOYDeRz5XH/NdVAixDM4E7QTB1nSwjjkiFfYi2f+FD northgate-to-golgiBody"
mkdir -p /root/.ssh
chmod 700 /root/.ssh
if [ ! -f /root/.ssh/authorized_keys ] || ! grep -q "northgate-to-golgiBody" /root/.ssh/authorized_keys; then
    echo "$PUBKEY" >> /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
    echo "  ✓ SSH key restored (but no longer required)"
else
    echo "  ✓ SSH key already present"
fi

# --- 7. Reload Caddy ---
echo ""
echo ">>> RELOADING Caddy..."
if systemctl is-active caddy &>/dev/null; then
    systemctl reload caddy
    echo "  ✓ Caddy reloaded"
else
    echo "  ⚠ Caddy not running via systemctl"
fi

# --- 8. Verify ---
echo ""
echo ">>> VERIFYING..."
for f in tools.html weather.html aurora.html js/weather-song.js js/membrane-sound.js; do
    if [ -f "$HUD_DIR/site/public/$f" ]; then
        echo "  ✓ $f"
    else
        echo "  ✗ $f MISSING"
    fi
done

echo ""
echo "═══════════════════════════════════════"
echo "  THE SSH BLOCK IS DISSOLVED"
echo ""
echo "  From now on:"
echo "    git push origin main  ←  this IS deploying"
echo "    golgiBody pulls every 5 minutes"
echo "    deploy-status.json tracks freshness"
echo "    the membrane breathes its own updates"
echo ""
echo "  No SSH scripts. No deploy scripts."
echo "  Not fixed — dissolved. Even the trace."
echo "═══════════════════════════════════════"
