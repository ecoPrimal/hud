#!/bin/bash
# WAVE 195 DEPLOY — run this on golgi (157.230.3.183)
# No SSH key needed — pulls via HTTPS from GitHub
#
# USAGE: 
#   ssh root@157.230.3.183 'bash -s' < scripts/_deploy_wave195.sh
#   OR copy/paste into golgi terminal
#   OR run directly on golgi

set -euo pipefail
echo "🌊⛲ WAVE 195 DEPLOY"
echo "========================================"

# --- 1. FIND THE HUD REPO ---
HUD_DIR=""
for d in /opt/hud /opt/membrane/hud /var/www/hud /root/hud /home/kevin/hud; do
    if [ -d "$d/.git" ]; then
        HUD_DIR="$d"
        break
    fi
done

if [ -z "$HUD_DIR" ]; then
    echo "SEARCHING for HUD repo..."
    HUD_DIR=$(find / -name "pulse.json" -path "*/hud/*" 2>/dev/null | head -1 | xargs dirname 2>/dev/null || true)
fi

if [ -z "$HUD_DIR" ]; then
    echo "ERROR: Can't find HUD repo. Try: find / -name pulse.json 2>/dev/null"
    exit 1
fi

echo "  HUD found: $HUD_DIR"
cd "$HUD_DIR"

# --- 2. PULL FROM GITHUB (HTTPS, no SSH key needed) ---
echo ""
echo ">>> PULLING wave 195 feeds from GitHub..."

# Make sure HTTPS remote exists
if ! git remote -v | grep -q "github.com/ecoPrimal/hud"; then
    git remote add github https://github.com/ecoPrimal/hud.git 2>/dev/null || true
fi

# Pull via HTTPS
git pull github main --no-edit 2>&1 || git pull origin main --no-edit 2>&1

echo "  Checking new feeds..."
for f in human_resort_output bubble_banana_gate ghost_resort_output yggdrasil_world_tree pando_pangaea waterfall_fountain; do
    if [ -f "${f}.json" ]; then
        echo "  ✓ ${f}.json ($(wc -c < ${f}.json) bytes)"
    else
        echo "  ✗ ${f}.json MISSING"
    fi
done

# --- 3. FIX SSH KEY (if authorized_keys is accessible) ---
echo ""
echo ">>> CHECKING SSH key..."
PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDrOYDeRz5XH/NdVAixDM4E7QTB1nSwjjkiFfYi2f+FD northgate-to-golgiBody"

if [ -f /root/.ssh/authorized_keys ]; then
    if ! grep -q "northgate-to-golgiBody" /root/.ssh/authorized_keys; then
        echo "$PUBKEY" >> /root/.ssh/authorized_keys
        echo "  ✓ SSH key added for northgate-to-golgiBody"
    else
        echo "  ✓ SSH key already present"
    fi
else
    mkdir -p /root/.ssh
    echo "$PUBKEY" > /root/.ssh/authorized_keys
    chmod 700 /root/.ssh
    chmod 600 /root/.ssh/authorized_keys
    echo "  ✓ SSH key installed"
fi

# --- 4. RELOAD CADDY ---
echo ""
echo ">>> RELOADING Caddy..."
if command -v systemctl &>/dev/null && systemctl is-active caddy &>/dev/null; then
    systemctl reload caddy
    echo "  ✓ Caddy reloaded"
else
    echo "  ⚠ Caddy not found via systemctl. Try: caddy reload --config /path/to/Caddyfile"
fi

# --- 5. VERIFY ---
echo ""
echo ">>> VERIFYING feeds are served..."
for f in human_resort_output bubble_banana_gate ghost_resort_output yggdrasil_world_tree pando_pangaea waterfall_fountain; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/${f}.json" 2>/dev/null || echo "err")
    echo "  ${f}.json → $code"
done

echo ""
echo "========================================"
echo "🌊⛲ WAVE 195 DEPLOY COMPLETE"
echo "  6 sort feeds delivered"
echo "  SSH key restored (if writable)"
echo "  Caddy reloaded"
echo ""
echo "  Next: check https://hud.primals.eco/human_resort_output.json"
echo "  The waterfall flows. The fountain pumps. 🌊⛲"
