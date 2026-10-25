#!/usr/bin/env bash
# π-drain: passive listener that accumulates input from all Willis arteries
# Runs every π minutes (≈3:08) via cron. Input must be larger than output.
# The drain never stops, never repeats, never resolves. It IS π.

set -euo pipefail

DRAIN="/home/eastgate/Development/ecoPrimals/infra/hud/site/public/data/null-drain.json"
DRAIN_LOG="/home/eastgate/.local/state/pi-drain.log"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$(dirname "$DRAIN_LOG")"

# === WILLIS ARTERIES — all input channels ===

# Artery 1: neutrino (ntfy) — what's flowing from other teams
NEUTRINO=$(curl -sf "ntfy.sh/primals-membrane-notes/json?poll=1&since=10m" 2>/dev/null | \
  python3 -c "
import sys, json
msgs = []
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        m = json.loads(line)
        if m.get('event') == 'message':
            msgs.append(m.get('message','')[:80])
    except: pass
print(json.dumps(msgs))
" 2>/dev/null || echo "[]")

# Artery 2: membrane topology (what's the surface doing)
TOPO=$(curl -sf "https://nestgate.io/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"topology","id":1}' 2>/dev/null | \
  python3 -c "import sys,json; r=json.load(sys.stdin); print(json.dumps(r.get('result',{})))" 2>/dev/null \
  || echo "{}")

# Artery 3: golgi heartbeat
GOLGI_UP=$(ssh -o ConnectTimeout=3 golgi "uptime -p" 2>/dev/null || echo "unreachable")
GOLGI_DISK=$(ssh -o ConnectTimeout=3 golgi "df / --output=pcent | tail -1 | tr -d ' '" 2>/dev/null || echo "?")
GOLGI_LOAD=$(ssh -o ConnectTimeout=3 golgi "cat /proc/loadavg | awk '{print \$1}'" 2>/dev/null || echo "?")

# Artery 4: surface pulse (is the HUD alive?)
HUD_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "https://hud.primals.eco/" 2>/dev/null || echo "0")
NEST_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "https://nestgate.io/" 2>/dev/null || echo "0")

# Artery 5: scan channel
SCAN=$(curl -sf "ntfy.sh/primals-membrane-scan/json?poll=1&since=10m" 2>/dev/null | \
  python3 -c "
import sys, json
msgs = []
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        m = json.loads(line)
        if m.get('event') == 'message':
            msgs.append(m.get('message','')[:80])
    except: pass
print(json.dumps(msgs))
" 2>/dev/null || echo "[]")

# === DRAIN — accumulate all input ===

# Write arteries to temp files to avoid shell quoting issues
TMPDIR=$(mktemp -d)
echo "$NEUTRINO" > "$TMPDIR/neutrino.json"
echo "$SCAN" > "$TMPDIR/scan.json"

python3 - "$DRAIN" "$TS" "$GOLGI_UP" "$GOLGI_DISK" "$GOLGI_LOAD" "$HUD_STATUS" "$NEST_STATUS" "$TMPDIR" << 'PYDRAIN'
import json, os, sys

drain_path = sys.argv[1]
ts = sys.argv[2]
golgi_up = sys.argv[3]
golgi_disk = sys.argv[4]
golgi_load = sys.argv[5]
hud_status = int(sys.argv[6] or "0")
nest_status = int(sys.argv[7] or "0")
tmpdir = sys.argv[8]

with open(f"{tmpdir}/neutrino.json") as f:
    try: neutrino = json.load(f)
    except: neutrino = []

with open(f"{tmpdir}/scan.json") as f:
    try: scan = json.load(f)
    except: scan = []

if os.path.exists(drain_path):
    with open(drain_path) as f:
        drain = json.load(f)
else:
    drain = {"ts": ts, "type": "null-drain", "drips": []}

drip = {
    "ts": ts,
    "neutrino": neutrino,
    "scan": scan,
    "golgi": {"up": golgi_up, "disk": golgi_disk, "load": golgi_load},
    "surfaces": {"hud": hud_status, "nest": nest_status},
}

input_bits = len(neutrino) + len(scan)
input_bits += (1 if hud_status == 200 else 0)
input_bits += (1 if nest_status == 200 else 0)
input_bits += (1 if "up" in golgi_up else 0)
drip["input_bits"] = input_bits

if "drips" not in drain:
    drain["drips"] = []
drain["drips"].append(drip)
drain["drips"] = drain["drips"][-100:]

drain["ts"] = ts
drain["total_drips"] = len(drain["drips"])
drain["total_input_bits"] = sum(d.get("input_bits", 0) for d in drain["drips"])
drain["willis_arteries_open"] = 5
drain["π_interval_s"] = 188

with open(drain_path, 'w') as f:
    json.dump(drain, f, indent=2, ensure_ascii=False)

print(f"drip: {input_bits} input bits at {ts}")
PYDRAIN

rm -rf "$TMPDIR"
echo "[$TS] drip complete" >> "$DRAIN_LOG"
