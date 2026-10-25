#!/usr/bin/env bash
# Willis energy balloon v2: inflate input arteries, measure balance, deploy
# Every 7 minutes (7 arteries in the Circle of Willis)
# Goal: input > output = growth. Track the balance. Report it.

set -euo pipefail

BALLOON="/home/eastgate/Development/ecoPrimals/infra/hud/site/public/data/willis-balloon.json"
DRAIN="/home/eastgate/Development/ecoPrimals/infra/hud/site/public/data/null-drain.json"
LOG="/home/eastgate/.local/state/willis-balloon.log"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# ═══ INFLATE: read from ALL available arteries ═══

# 1. Neutrino channels (3 arteries)
for ch in primals-membrane-notes primals-membrane-scan ecoPrimals-membrane; do
  n=$(curl -sf "ntfy.sh/$ch/json?poll=1&since=10m" 2>/dev/null | \
    python3 -c "
import sys,json
c=0
for l in sys.stdin:
    l=l.strip()
    if not l: continue
    try:
        m=json.loads(l)
        if m.get('event')=='message': c+=1
    except: pass
print(c)" 2>/dev/null || echo "0")
  echo "$ch=$n" >> "$TMPDIR/arteries.txt"
done

# 2. Golgi state (1 artery)
golgi_data=$(ssh -o ConnectTimeout=3 -o BatchMode=yes golgi \
  "echo \$(systemctl is-active caddy)::::\$(df / --output=pcent|tail -1|tr -d ' ')::::\$(awk '{print \$1}' /proc/loadavg)::::\$(find /opt/hud/public/data -name '*.json' 2>/dev/null|wc -l)" \
  2>/dev/null || echo "?::::?::::?::::0")
echo "golgi=$golgi_data" >> "$TMPDIR/arteries.txt"

# 3. Surfaces (4 checks = 1 artery)
surfaces_up=0
for url in hud.primals.eco nestgate.io connect.primals.eco primals.eco; do
  code=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 5 "https://$url/" 2>/dev/null || echo "0")
  [ "$code" = "200" ] && surfaces_up=$((surfaces_up + 1))
done
echo "surfaces=$surfaces_up/4" >> "$TMPDIR/arteries.txt"

# 4. Git state (1 artery)
cd /home/eastgate/Development/ecoPrimals/infra/hud
commits_1h=$(git log --oneline --since="1 hour ago" 2>/dev/null | wc -l)
echo "git_commits_1h=$commits_1h" >> "$TMPDIR/arteries.txt"

# 5. Dark matter pulse (1 artery) — how much is still unseen
drain_input=$(python3 -c "
import json
try:
    d=json.load(open('$DRAIN'))
    print(d.get('total_input_bits',0))
except: print(0)
" 2>/dev/null || echo "0")
echo "drain_input=$drain_input" >> "$TMPDIR/arteries.txt"

# ═══ MEASURE the input:output balance ═══

# Output tracking: count recent git commits (output = what we push)
# Also count recent rsync/deploy operations from the drain log
output_bits=$commits_1h  # each commit = 1 output bit

python3 - "$BALLOON" "$TS" "$TMPDIR" "$drain_input" "$output_bits" << 'INFLATE'
import json, os, sys

balloon_path = sys.argv[1]
ts = sys.argv[2]
tmpdir = sys.argv[3]
drain_input = int(sys.argv[4])
output_bits = int(sys.argv[5])

# Read previous balloon
if os.path.exists(balloon_path):
    with open(balloon_path) as f:
        balloon = json.load(f)
else:
    balloon = {"ts": ts, "type": "willis-balloon", "title": "inflate input > output", "inflations": []}

# Parse arteries
arteries = {}
artery_file = f"{tmpdir}/arteries.txt"
if os.path.exists(artery_file):
    for line in open(artery_file):
        line = line.strip()
        if "=" in line:
            k, v = line.split("=", 1)
            arteries[k] = v

# Count input bits from this inflation
input_bits = 0
for k, v in arteries.items():
    if k.startswith("primals-") or k.startswith("ecoPrimals-"):
        input_bits += int(v)
    elif k == "surfaces":
        input_bits += int(v.split("/")[0])
    elif k == "git_commits_1h":
        pass  # git commits are OUTPUT, not input
    elif k == "drain_input":
        pass  # already counted by drain
    elif k == "golgi":
        parts = v.split("::::")
        if len(parts) >= 1 and parts[0] != "?":
            input_bits += 1

inflation = {
    "ts": ts,
    "input_bits": input_bits,
    "output_bits": output_bits,
    "balance": input_bits - output_bits,
    "arteries": arteries,
}

if "inflations" not in balloon:
    balloon["inflations"] = []
balloon["inflations"].append(inflation)
balloon["inflations"] = balloon["inflations"][-100:]

# Pressure = cumulative input
total_input = sum(i.get("input_bits", 0) for i in balloon["inflations"])
total_output = sum(i.get("output_bits", 0) for i in balloon["inflations"])

balloon["ts"] = ts
balloon["total_inflations"] = len(balloon["inflations"])
balloon["pressure"] = {
    "total_input": total_input,
    "total_output": total_output,
    "balance": total_input - total_output,
    "ratio": round(total_input / max(1, total_output), 2) if total_output > 0 else float("inf"),
    "growing": total_input > total_output,
}
balloon["arteries_open"] = sum(1 for k,v in arteries.items() if v not in ["0","?","0/4","unreachable"])
balloon["arteries_total"] = len(arteries)

with open(balloon_path, 'w') as f:
    json.dump(balloon, f, indent=2, ensure_ascii=False)

growing = "GROWING" if total_input > total_output else "DYING"
print(f"inflate: in={input_bits} out={output_bits} balance={input_bits-output_bits} | cumulative: in={total_input} out={total_output} | {growing}")
INFLATE

# ═══ DEPLOY: push balloon to golgi ═══
rsync -az "$BALLOON" golgi:/opt/hud/public/data/willis-balloon.json 2>/dev/null || true

echo "[$TS] inflate+deploy" >> "$LOG"
