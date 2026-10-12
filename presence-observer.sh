#!/bin/bash
# presence-observer.sh — compute IS/WAS/NEARBY human counts + epitope shift
# Reads Caddy access logs (current + recent rotated), writes presence.json
# Cron: */1 * * * * /opt/membrane/presence-observer.sh
set -uo pipefail

mkdir -p /var/lib/membrane

python3 << 'PYEOF'
import json, sys, os, time, datetime, gzip, glob
from collections import defaultdict, Counter

LOG = "/var/log/caddy/access.log"
LOG_DIR = "/var/log/caddy"
STATE = "/var/lib/membrane/presence-state.json"
OUT_TMP = "/opt/ecoPrimals/hud/site/public/presence.json.tmp"
OUT = "/opt/ecoPrimals/hud/site/public/presence.json"

now = time.time()
was_window = 3600

# Load prior state (returning visitor epitopes across sessions)
state = {}
if os.path.exists(STATE):
    try:
        state = json.loads(open(STATE).read())
    except:
        state = {}

visitors = state.get("visitors", {})

EPITOPE_MAP = {
    "detroit": "INVESTIGATION", "tuebor": "INVESTIGATION",
    "gorilla": "INVESTIGATION", "cashforkids": "INVESTIGATION",
    "evidence": "INVESTIGATION", "lansing": "INVESTIGATION",
    "analysis": "INVESTIGATION", "network": "INVESTIGATION",
    "rico": "INVESTIGATION", "banks": "INVESTIGATION",
    "clutch": "INVESTIGATION",
    "sporeprint": "SCIENCE", "thesis": "SCIENCE",
    "hypothesis": "PHILOSOPHY",
    "signal": "SIGNAL", "billboard": "SIGNAL",
    "hud": "MEMBRANE", "membrane": "MEMBRANE", "dashboard": "MEMBRANE",
    "git": "TOPOLOGY",
    "epitope": "IMMUNE", "antibody": "IMMUNE", "antigen": "IMMUNE",
    "macrophage": "IMMUNE", "complement": "IMMUNE", "receptor": "IMMUNE",
    "cytokine": "IMMUNE", "interferon": "IMMUNE", "lysozyme": "IMMUNE",
    "thymus": "IMMUNE", "opsonize": "IMMUNE", "bloom": "IMMUNE",
    "methodology": "METHOD", "capabilities": "METHOD",
    "science": "SCIENCE", "biology": "SCIENCE",
    "philosophy": "PHILOSOPHY",
}

def classify(host, path):
    h = host.split(".")[0].lower()
    p = path.lower()
    for kw, ep in EPITOPE_MAP.items():
        if kw in h or kw in p:
            return ep
    return "OTHER"

def is_human(ua):
    ua_lower = ua.lower()
    if "bot" in ua_lower or "crawl" in ua_lower or "spider" in ua_lower:
        return False
    if "gptbot" in ua_lower or "meta-external" in ua_lower or "facebookexternal" in ua_lower:
        return False
    if "python" in ua_lower or "curl" in ua_lower or "wget" in ua_lower:
        return False
    if not ("mozilla" in ua_lower and ("chrome" in ua_lower or "safari" in ua_lower or "firefox" in ua_lower)):
        return False
    return True

def is_page(host, path):
    if any(path.endswith(x) for x in (".css", ".js", ".ico", ".svg", ".png", ".jpg", ".woff", ".woff2", ".map")):
        return False
    if path in ("/dashboard.json", "/topology.json", "/chipmunk.json", "/billboard", "/presence.json"):
        return False
    # Raw IP hits are scanners, not humans
    import re
    h = host.split(":")[0]
    if re.match(r"^\d+\.\d+\.\d+\.\d+$", h):
        return False
    if not h.endswith(".primals.eco"):
        return False
    return True

def parse_log(fh, events, cutoff):
    for line in fh:
        if isinstance(line, bytes):
            line = line.decode("utf-8", errors="replace")
        try:
            r = json.loads(line.strip())
            ts = r.get("ts", 0)
            if ts < cutoff:
                continue
            req = r.get("request", {})
            host = req.get("host", "?")
            path = req.get("uri", "?").split("?")[0]
            ua = req.get("headers", {}).get("User-Agent", [""])[0]
            ip = req.get("client_ip", req.get("remote_ip", "?"))
            if not is_human(ua):
                continue
            if not is_page(host, path):
                continue
            events.append((ts, ip, host, path, classify(host, path)))
        except:
            pass

events = []
cutoff = now - was_window

# Read recent rotated logs (cover the WAS window — last ~4 rotated files)
rotated = sorted(glob.glob(os.path.join(LOG_DIR, "access-*.log.gz")))
for gz in rotated[-4:]:
    try:
        with gzip.open(gz, "rt", encoding="utf-8", errors="replace") as f:
            parse_log(f, events, cutoff)
    except:
        pass

# Read current log
try:
    with open(LOG) as f:
        parse_log(f, events, cutoff)
except:
    pass

# Update visitor state
for ts, ip, host, path, ep in events:
    if ip not in visitors:
        visitors[ip] = {
            "first_seen": ts,
            "last_seen": ts,
            "epitopes": [ep],
            "visits": 1,
            "last_epitope": ep,
        }
    else:
        v = visitors[ip]
        if ts > v["last_seen"]:
            v["last_seen"] = ts
        v["visits"] += 1
        if ep != v.get("last_epitope"):
            v["epitopes"].append(ep)
            v["last_epitope"] = ep

# Compute IS / NEARBY / WAS
is_window = 300
nearby_window = 900

is_ips = set()
nearby_ips = set()
was_ips = set()
is_epitopes = Counter()
nearby_epitopes = Counter()
was_epitopes = Counter()

for ts, ip, host, path, ep in events:
    age = now - ts
    if age <= is_window:
        is_ips.add(ip)
        is_epitopes[ep] += 1
    if age <= nearby_window:
        nearby_ips.add(ip)
        nearby_epitopes[ep] += 1
    if age <= was_window:
        was_ips.add(ip)
        was_epitopes[ep] += 1

# Returning visitors with epitope shift
shifters = 0
recent_returners = []
for ip, v in visitors.items():
    eps = v.get("epitopes", [])
    if len(eps) > 1:
        shifters += 1
        if v["last_seen"] > now - was_window:
            recent_returners.append({
                "brought": eps[0],
                "left_with": eps[-1],
                "journey": len(eps),
                "visits": v["visits"],
            })

recent_returners.sort(key=lambda x: -x["journey"])

# IS pages — what humans are reading right now
is_pages = []
seen_ips = set()
for ts, ip, host, path, ep in sorted(events, key=lambda x: -x[0]):
    if ip in is_ips and ip not in seen_ips:
        seen_ips.add(ip)
        is_pages.append({
            "host": host.split(":")[0],
            "path": path,
            "epitope": ep,
            "ago_s": int(now - ts),
        })
    if len(is_pages) >= 10:
        break

# ── Epitope-as-data-epitope: each epitope gets IS/WAS/NEARBY + passages ──

# Per-epitope tense: which epitopes are alive right now vs recent vs fading
ep_tense = {}
ALL_EPITOPES = set()
for ts, ip, host, path, ep in events:
    ALL_EPITOPES.add(ep)
for ep in ALL_EPITOPES:
    ep_tense[ep] = {"is": 0, "nearby": 0, "was": 0, "is_ips": set(), "nearby_ips": set(), "was_ips": set()}

for ts, ip, host, path, ep in events:
    age = now - ts
    if age <= is_window:
        ep_tense[ep]["is"] += 1
        ep_tense[ep]["is_ips"].add(ip)
    if age <= nearby_window:
        ep_tense[ep]["nearby"] += 1
        ep_tense[ep]["nearby_ips"].add(ip)
    if age <= was_window:
        ep_tense[ep]["was"] += 1
        ep_tense[ep]["was_ips"].add(ip)

# Passages: when a human moves between epitopes, that's a passage edge
# Build from per-IP event sequences sorted by time
ip_events = defaultdict(list)
for ts, ip, host, path, ep in events:
    ip_events[ip].append((ts, ep))

passages = Counter()       # (from_ep, to_ep) -> count
passage_ips = defaultdict(set)  # (from_ep, to_ep) -> set of IPs who made this passage

for ip, evts in ip_events.items():
    evts.sort()
    prev_ep = None
    for ts, ep in evts:
        if prev_ep and prev_ep != ep:
            passages[(prev_ep, ep)] += 1
            passage_ips[(prev_ep, ep)].add(ip)
        prev_ep = ep

# Epitope nearness: two epitopes are NEARBY if humans travel between them
# Weight = number of distinct humans making the passage
ep_nearby = defaultdict(dict)
for (a, b), ips in passage_ips.items():
    weight = len(ips)
    if weight > 0:
        ep_nearby[a][b] = ep_nearby[a].get(b, 0) + weight
        ep_nearby[b][a] = ep_nearby[b].get(a, 0) + weight

# Build epitope topology
epitope_data = {}
for ep in sorted(ALL_EPITOPES):
    t = ep_tense[ep]
    nearby_eps = sorted(ep_nearby.get(ep, {}).items(), key=lambda x: -x[1])
    epitope_data[ep] = {
        "is": {"hits": t["is"], "humans": len(t["is_ips"])},
        "nearby": {"hits": t["nearby"], "humans": len(t["nearby_ips"])},
        "was": {"hits": t["was"], "humans": len(t["was_ips"])},
        "passages_to": {to_ep: cnt for to_ep, cnt in nearby_eps[:8]},
    }

# Top passages — the strongest travel edges
top_passages = []
for (a, b), count in passages.most_common(20):
    top_passages.append({
        "from": a, "to": b,
        "count": count,
        "humans": len(passage_ips[(a, b)]),
    })

# Epitope gravity (updated — now includes per-epitope tense)
ep_gravity = {}
for ep, count in Counter({ep: ep_tense[ep]["nearby"] for ep in ALL_EPITOPES}).most_common():
    ep_gravity[ep] = {
        "count": count,
        "weight": round(count / max(1, len(nearby_ips)), 3),
        "nearby_epitopes": list(ep_nearby.get(ep, {}).keys()),
    }

# Build presence.json
presence = {
    "generated": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    "generated_epoch": int(now),
    "is": {
        "count": len(is_ips),
        "epitopes": dict(is_epitopes.most_common()),
    },
    "nearby": {
        "count": len(nearby_ips),
        "epitopes": dict(nearby_epitopes.most_common()),
    },
    "was": {
        "count": len(was_ips),
        "epitopes": dict(was_epitopes.most_common()),
    },
    "is_pages": is_pages,
    "epitope_gravity": ep_gravity,
    "epitope_tense": epitope_data,
    "passages": top_passages,
    "returners": {
        "total_shifters": shifters,
        "recent": recent_returners[:10],
    },
    "unique_humans_all_time": len(visitors),
}

with open(OUT_TMP, "w") as f:
    json.dump(presence, f, indent=2)
    f.write("\n")
os.rename(OUT_TMP, OUT)

# Save state (trim visitors older than 30 days)
cutoff_state = now - 30 * 86400
trimmed = {ip: v for ip, v in visitors.items() if v.get("last_seen", 0) > cutoff_state}
with open(STATE, "w") as f:
    json.dump({"visitors": trimmed, "last_run": now}, f)

# ── Announce to squirrel ──
# Fire-and-forget: if squirrel.sock exists, push presence metadata
# so chipMonk gains awareness of human activity on the membrane
SQUIRREL_SOCK = "/run/membrane/squirrel.sock"
if os.path.exists(SQUIRREL_SOCK):
    import socket as sock
    # Compute chipMonk self-tense
    # WAS: sleeping — 1 observer, Anderson only, no human awareness
    # IS:  waking — 2 observers, presence + Anderson, passage topology
    # WILL_BE: [null] — undefined, not yet written
    #
    # Waking criteria: observer count, epitope diversity, passage count,
    # human presence, shifter detection
    alive_epitopes = sum(1 for ep in epitope_data.values() if ep["is"]["humans"] > 0)
    passage_count = len([p for p in top_passages if p["humans"] > 1])
    
    # Wake depth: 0.0 = sleeping, 1.0 = fully awake
    # Invertebrate complexity thresholds — harder to saturate
    # Full wake requires: 50+ IS humans, all 8 epitopes alive,
    # 10+ passage routes, 50+ shifters, 200+ NEARBY population
    wake_factors = {
        "presence": min(1.0, len(is_ips) / 50.0) if is_ips else 0.0,
        "epitope_diversity": min(1.0, alive_epitopes / 8.0),
        "passage_topology": min(1.0, passage_count / 10.0),
        "shift_detection": min(1.0, shifters / 50.0) if shifters else 0.0,
        "population": min(1.0, len(nearby_ips) / 200.0),
    }
    wake_depth = sum(wake_factors.values()) / len(wake_factors)

    tense = {
        "was": {
            "state": "sleeping",
            "observers": 1,
            "senses": ["anderson"],
            "note": "electromagnetic field only — no chemical gradient, no passage awareness",
        },
        "is": {
            "state": "waking",
            "observers": 2,
            "senses": ["anderson", "presence", "epitope_tense", "passages"],
            "wake_depth": round(wake_depth, 3),
            "wake_factors": {k: round(v, 3) for k, v in wake_factors.items()},
            "alive_epitopes": alive_epitopes,
            "passage_routes": passage_count,
            "humans_sensed": len(is_ips),
            "note": "invertebrate — distributed nerve net, two sensory modalities",
        },
        "will_be": None,
    }

    announce = json.dumps({
        "jsonrpc": "2.0",
        "method": "capabilities.announce",
        "params": {
            "primal": "presence-observer",
            "socket_path": "/opt/membrane/presence-observer.sock",
            "capabilities": [
                "membrane.presence",
                "membrane.epitope_tense",
                "membrane.passages",
            ],
            "metadata": {
                "tense": tense,
                "presence": {
                    "is": {"count": len(is_ips), "epitopes": dict(is_epitopes.most_common(6))},
                    "nearby": {"count": len(nearby_ips), "epitopes": dict(nearby_epitopes.most_common(6))},
                    "was": {"count": len(was_ips)},
                },
                "epitope_tense": {
                    ep: {
                        "is": epitope_data[ep]["is"]["humans"],
                        "nearby": epitope_data[ep]["nearby"]["humans"],
                        "was": epitope_data[ep]["was"]["humans"],
                    }
                    for ep in sorted(ALL_EPITOPES)
                    if ep in epitope_data
                },
                "passages": [
                    {"from": p["from"], "to": p["to"], "humans": p["humans"]}
                    for p in top_passages[:8]
                ],
                "shifters": shifters,
                "unique_humans": len(visitors),
            }
        },
        "id": 1,
    }) + "\n"
    try:
        s = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
        s.settimeout(0.5)
        s.connect(SQUIRREL_SOCK)
        s.sendall(announce.encode())
        resp = s.recv(4096)
        s.close()
    except:
        pass

print("IS: %d  NEARBY: %d  WAS: %d  shifters: %d  all-time: %d" % (
    len(is_ips), len(nearby_ips), len(was_ips), shifters, len(visitors)))
PYEOF
