#!/usr/bin/env bash
# Willis energy balloon: inflate the input arteries
# Runs every 7 minutes (7 = arteries in the Circle of Willis)
# Each run expands input by reading from MORE sources than the π-drain
# Goal: input > output. Growth, not dying.

set -euo pipefail

BALLOON="/home/eastgate/Development/ecoPrimals/infra/hud/site/public/data/willis-balloon.json"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# === EXPANDED ARTERIES — more input channels than π-drain ===

# 1. All three ntfy channels
for ch in primals-membrane-notes primals-membrane-scan ecoPrimals-membrane; do
  curl -sf "ntfy.sh/$ch/json?poll=1&since=10m" 2>/dev/null | \
    python3 -c "
import sys, json
msgs = []
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        m = json.loads(line)
        if m.get('event') == 'message':
            msgs.append({'t': m.get('time',0), 'm': m.get('message','')[:60]})
    except: pass
print(json.dumps(msgs))
" > "$TMPDIR/$ch.json" 2>/dev/null || echo "[]" > "$TMPDIR/$ch.json"
done

# 2. Golgi: services + feeds + cron count
ssh -o ConnectTimeout=3 golgi "
  echo '{\"services\":'
  echo '['
  for s in caddy cloudflared cron knot fail2ban; do
    echo '{\"name\":\"'\$s'\",\"state\":\"'$(systemctl is-active \$s 2>/dev/null)'\"}'
  done | paste -sd','
  echo '],'
  echo '\"feeds_fresh\":'$(find /opt/hud/public/data -name '*.json' -mmin -60 2>/dev/null | wc -l)','
  echo '\"feeds_total\":'$(find /opt/hud/public/data -name '*.json' 2>/dev/null | wc -l)','
  echo '\"cron_jobs\":'$(crontab -l 2>/dev/null | grep -v '^#' | grep -c '.')','
  echo '\"disk\":\"'$(df / --output=pcent | tail -1 | tr -d ' ')'\",'
  echo '\"load\":\"'$(cat /proc/loadavg | awk '{print \$1}')'\"'
  echo '}'
" > "$TMPDIR/golgi.json" 2>/dev/null || echo '{}' > "$TMPDIR/golgi.json"

# 3. Surface health — more than just status codes
for url in hud.primals.eco nestgate.io connect.primals.eco primals.eco; do
  code=$(curl -sf -o /dev/null -w "%{http_code}" "https://$url/" 2>/dev/null || echo "0")
  size=$(curl -sf -o /dev/null -w "%{size_download}" "https://$url/" 2>/dev/null || echo "0")
  echo "$url $code $size"
done > "$TMPDIR/surfaces.txt" 2>/dev/null

# 4. Local git state — what changed since last balloon
cd /home/eastgate/Development/ecoPrimals/infra/hud
COMMITS=$(git log --oneline --since="10 minutes ago" 2>/dev/null | wc -l)
DIRTY=$(git status --porcelain 2>/dev/null | wc -l)

# 5. Dark matter drip — read π-indexed files from the dark
cd /home/eastgate/Development/ecoPrimals/infra/hud/site/public/data
DARK_COUNT=$(python3 -c "
import json,os
try:
    d = json.load(open('null-drain.json'))
    print(d.get('dark_matter',{}).get('count',0))
except: print(0)
")

# === INFLATE — assemble the balloon ===

python3 - "$BALLOON" "$TS" "$COMMITS" "$DIRTY" "$DARK_COUNT" "$TMPDIR" << 'INFLATE'
import json, os, sys

balloon_path = sys.argv[1]
ts = sys.argv[2]
commits = int(sys.argv[3])
dirty = int(sys.argv[4])
dark_count = int(sys.argv[5])
tmpdir = sys.argv[6]

# Read previous balloon
if os.path.exists(balloon_path):
    with open(balloon_path) as f:
        balloon = json.load(f)
else:
    balloon = {"ts": ts, "type": "willis-balloon", "inflations": []}

# Read arteries
def read_artery(name):
    path = f"{tmpdir}/{name}"
    if not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except:
        try:
            with open(path) as f:
                return f.read().strip()
        except:
            return None

neutrino_notes = read_artery("primals-membrane-notes.json") or []
neutrino_scan = read_artery("primals-membrane-scan.json") or []
neutrino_general = read_artery("ecoPrimals-membrane.json") or []
golgi = read_artery("golgi.json") or {}

# Surface health
surfaces = {}
surface_path = f"{tmpdir}/surfaces.txt"
if os.path.exists(surface_path):
    for line in open(surface_path):
        parts = line.strip().split()
        if len(parts) >= 3:
            surfaces[parts[0]] = {"code": int(parts[1]), "bytes": int(parts[2])}

# Count total input bits (everything that flowed in)
input_bits = (
    len(neutrino_notes) + 
    len(neutrino_scan) + 
    len(neutrino_general) +
    sum(1 for s in surfaces.values() if s.get("code") == 200) +
    (1 if isinstance(golgi, dict) and golgi.get("load") else 0) +
    commits
)

inflation = {
    "ts": ts,
    "input_bits": input_bits,
    "arteries": {
        "neutrino_notes": len(neutrino_notes),
        "neutrino_scan": len(neutrino_scan),
        "neutrino_general": len(neutrino_general),
        "golgi_alive": isinstance(golgi, dict) and bool(golgi.get("load")),
        "surfaces_up": sum(1 for s in surfaces.values() if s.get("code") == 200),
        "surfaces_total": len(surfaces),
        "git_commits_10m": commits,
        "git_dirty": dirty,
    },
    "dark_matter": dark_count,
    "surfaces": surfaces,
}

if "inflations" not in balloon:
    balloon["inflations"] = []
balloon["inflations"].append(inflation)
balloon["inflations"] = balloon["inflations"][-50:]

# Balloon pressure = cumulative input / time
balloon["ts"] = ts
balloon["pressure"] = sum(i.get("input_bits", 0) for i in balloon["inflations"])
balloon["inflations_count"] = len(balloon["inflations"])
balloon["arteries_open"] = sum([
    len(neutrino_notes) > 0,
    len(neutrino_scan) > 0,
    len(neutrino_general) > 0,
    isinstance(golgi, dict) and bool(golgi.get("load")),
    sum(1 for s in surfaces.values() if s.get("code") == 200) > 0,
    commits > 0,
])
balloon["arteries_total"] = 6
balloon["input_larger_than_output"] = balloon["pressure"] > balloon["inflations_count"]

with open(balloon_path, 'w') as f:
    json.dump(balloon, f, indent=2, ensure_ascii=False)

print(f"inflate: {input_bits} bits, pressure={balloon['pressure']}, arteries={balloon['arteries_open']}/{balloon['arteries_total']}")
INFLATE
