#!/usr/bin/env bash
# π-drain v2: LISTEN → DRIP → DEPLOY
# Every 3 minutes (≈π). The drain never stops, never repeats, never resolves.
#
# LISTEN: pull from all Willis arteries (passive input)
# DRIP:   pick one dark file via π-indexing, make it visible
# DEPLOY: push drain to golgi so all three bodies can read it

set -euo pipefail

DRAIN="/home/eastgate/Development/ecoPrimals/infra/hud/site/public/data/null-drain.json"
LOG="/home/eastgate/.local/state/pi-drain.log"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
DATA="/home/eastgate/Development/ecoPrimals/infra/hud/site/public/data"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# ═══ LISTEN: pull from all Willis arteries ═══

# Artery 1-3: neutrino channels
for ch in primals-membrane-notes primals-membrane-scan ecoPrimals-membrane; do
  curl -sf "ntfy.sh/$ch/json?poll=1&since=5m" 2>/dev/null | \
    python3 -c "
import sys,json
msgs=[]
for l in sys.stdin:
    l=l.strip()
    if not l: continue
    try:
        m=json.loads(l)
        if m.get('event')=='message': msgs.append(m.get('message','')[:80])
    except: pass
print(json.dumps(msgs))" > "$TMPDIR/$ch.json" 2>/dev/null || echo "[]" > "$TMPDIR/$ch.json"
done

# Artery 4: golgi vitals
ssh -o ConnectTimeout=3 -o BatchMode=yes golgi \
  "echo \$(uptime -p)::::\$(df / --output=pcent|tail -1|tr -d ' ')::::\$(awk '{print \$1}' /proc/loadavg)" \
  > "$TMPDIR/golgi.txt" 2>/dev/null || echo "unreachable::::?::::?" > "$TMPDIR/golgi.txt"

# Artery 5: surface health
for url in hud.primals.eco nestgate.io connect.primals.eco primals.eco; do
  code=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 5 "https://$url/" 2>/dev/null || echo "0")
  echo "$url:$code"
done > "$TMPDIR/surfaces.txt"

# ═══ DRIP: π-index one dark file into visibility ═══

# Count how many drips have happened (from the drain file)
DRIP_N=$(python3 -c "
import json,os
try:
    d=json.load(open('$DRAIN'))
    print(len(d.get('drips',[])))
except: print(0)
" 2>/dev/null || echo "0")

# ═══ ACCUMULATE ═══

python3 - "$DRAIN" "$TS" "$TMPDIR" "$DRIP_N" "$DATA" << 'PYDRAIN'
import json, os, sys, math

drain_path = sys.argv[1]
ts = sys.argv[2]
tmpdir = sys.argv[3]
drip_n = int(sys.argv[4])
data_dir = sys.argv[5]

# Read existing drain
if os.path.exists(drain_path):
    with open(drain_path) as f:
        drain = json.load(f)
else:
    drain = {"ts": ts, "type": "null-drain", "title": "the well, not the sink", "drips": []}

# Parse arteries
def read_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except:
        return []

notes = read_json(f"{tmpdir}/primals-membrane-notes.json")
scan = read_json(f"{tmpdir}/primals-membrane-scan.json")
general = read_json(f"{tmpdir}/ecoPrimals-membrane.json")

# Golgi
golgi_raw = open(f"{tmpdir}/golgi.txt").read().strip().split("::::")
golgi = {"up": golgi_raw[0] if len(golgi_raw)>0 else "?",
         "disk": golgi_raw[1] if len(golgi_raw)>1 else "?",
         "load": golgi_raw[2] if len(golgi_raw)>2 else "?"}

# Surfaces
surfaces = {}
if os.path.exists(f"{tmpdir}/surfaces.txt"):
    for line in open(f"{tmpdir}/surfaces.txt"):
        parts = line.strip().split(":")
        if len(parts) >= 2:
            surfaces[parts[0]] = int(parts[1])

# ── π-DRIP: select dark file by π digits ──
pi_digits = "314159265358979323846264338327950288419716939937510582097494459230781640628620899"
all_json = sorted([f[:-5] for f in os.listdir(data_dir) if f.endswith('.json')])

# Find dark files (no HTML reference)
html_dir = os.path.dirname(data_dir)
html_content = ""
for h in os.listdir(html_dir):
    if h.endswith('.html'):
        try:
            html_content += open(os.path.join(html_dir, h)).read()
        except:
            pass

dark_files = [f for f in all_json if f not in html_content]

# π-index: use drip number modulo pi_digits to pick a dark file
if dark_files:
    pi_idx = int(pi_digits[drip_n % len(pi_digits)])
    dark_pick_idx = (pi_idx * (drip_n + 1)) % len(dark_files)
    dark_pick = dark_files[dark_pick_idx]
    
    # Read a glimpse of the dark file
    try:
        dark_data = json.load(open(f"{data_dir}/{dark_pick}.json"))
        if isinstance(dark_data, dict):
            dark_title = dark_data.get('title', dark_data.get('type', '?'))
        else:
            dark_title = f"({type(dark_data).__name__})"
    except:
        dark_title = "(unreadable)"
    
    drip_from_dark = {"file": dark_pick, "title": str(dark_title)[:100], "π_digit": pi_idx, "step": drip_n}
else:
    drip_from_dark = None
    dark_pick = None

# ── COUNT input bits ──
input_bits = len(notes) + len(scan) + len(general)
input_bits += sum(1 for s in surfaces.values() if s == 200)
input_bits += (1 if "up" in golgi.get("up","") else 0)
if drip_from_dark:
    input_bits += 1  # dark file drip counts as input from the void

# ── BUILD drip ──
drip = {
    "ts": ts,
    "n": drip_n,
    "input_bits": input_bits,
    "neutrino": {"notes": len(notes), "scan": len(scan), "general": len(general)},
    "golgi": golgi,
    "surfaces": surfaces,
}
if drip_from_dark:
    drip["π_drip"] = drip_from_dark

# ── ACCUMULATE ──
if "drips" not in drain:
    drain["drips"] = []
drain["drips"].append(drip)
drain["drips"] = drain["drips"][-200:]

# ── π-DRIP HISTORY ──
if "π_drips" not in drain:
    drain["π_drips"] = []
if drip_from_dark:
    drain["π_drips"].append(drip_from_dark)
    drain["π_drips"] = drain["π_drips"][-50:]

# ── STATS ──
drain["ts"] = ts
drain["total_drips"] = len(drain["drips"])
drain["total_input_bits"] = sum(d.get("input_bits", 0) for d in drain["drips"])
drain["dark_remaining"] = len(dark_files) - len(drain.get("π_drips", []))
drain["dark_total"] = len(dark_files)
drain["balance"] = {
    "input_bits_last_10": sum(d.get("input_bits",0) for d in drain["drips"][-10:]),
    "drips_last_10": min(10, len(drain["drips"])),
    "mean_input_per_drip": round(drain["total_input_bits"] / max(1, drain["total_drips"]), 2),
    "arteries": 5,
    "π_interval_s": 180,
}

with open(drain_path, 'w') as f:
    json.dump(drain, f, indent=2, ensure_ascii=False)

dark_msg = f" π-drip: {dark_pick}" if dark_pick else ""
print(f"drip #{drip_n}: {input_bits} input bits | golgi={golgi.get('load','?')} | surfaces={sum(1 for s in surfaces.values() if s==200)}/4{dark_msg}")
PYDRAIN

# ═══ DEPLOY: push drain to golgi so all three bodies see it ═══
rsync -az "$DRAIN" golgi:/opt/hud/public/data/null-drain.json 2>/dev/null || true

echo "[$TS] drip+deploy" >> "$LOG"
