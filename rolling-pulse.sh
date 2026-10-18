#!/bin/bash
# Rolling time-chain + self-observer pulse
# Runs every 2 minutes via cron. Appends 1 JSON line per run.
# Streams the current access log (NEVER loads all), samples the membrane endpoints.
# Output: /opt/membrane/live-terminal/time-chain.jsonl (rolling, max 720 entries = 24h)
#         /opt/membrane/live-terminal/pulse.json (current pulse state)

CHAIN="/opt/membrane/live-terminal/time-chain.jsonl"
PULSE="/opt/membrane/live-terminal/pulse.json"
LOG="/var/log/caddy/access.log"
MAX_ENTRIES=720

python3 - "$CHAIN" "$PULSE" "$LOG" "$MAX_ENTRIES" <<'PYEOF'
import json, time, sys, os
from urllib.request import urlopen
from collections import Counter

CHAIN, PULSE, LOG, MAX_ENTRIES = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
now = time.time()
window = 120  # 2-minute sample

AI=["gptbot","claudebot","anthropic","googlebot","bingbot","chatgpt","cohere","perplexity","bytespider","amazonbot","yandexbot"]
def classify(ua):
    u=ua.lower()
    for b in ["meta-external","facebookexternal","facebookbot"]:
        if b in u: return "meta"
    for b in AI:
        if b in u: return "ai"
    if any(x in u for x in ["ahrefsbot","semrushbot","mj12bot","dotbot"]): return "seo"
    if any(x in u for x in ["python","curl","wget","go-http"]): return "auto"
    if "bot" in u or "crawl" in u or "spider" in u: return "bot"
    if "mozilla" in u and any(x in u for x in ["chrome","safari","firefox"]): return "human"
    return "unknown"

# Stream current log for 2-minute window
total=0; cats=Counter(); status=Counter(); hosts=Counter()
human_pages=Counter(); ips=set()
try:
    with open(LOG) as f:
        for line in f:
            try:
                r = json.loads(line.strip())
                ts = r.get("ts", 0)
                if ts < now - window: continue
                total += 1
                req = r.get("request", {})
                ua = req.get("headers", {}).get("User-Agent", [""])[0]
                host = req.get("host", "?").split(":")[0]
                st = r.get("status", 0)
                ip = req.get("client_ip", "?")
                cat = classify(ua)
                cats[cat] += 1
                status[st] += 1
                ips.add(ip)
                if cat == "human":
                    hosts[host.replace(".primals.eco","")] += 1
            except: pass
except: pass

human = cats.get("human", 0)
bot = total - human
pct_h = human / max(total, 1) * 100
pct_404 = status.get(404, 0) / max(total, 1) * 100
pct_403 = status.get(403, 0) / max(total, 1) * 100
rate = total / 2  # per minute

# Sample membrane endpoints
remainder = 0.0; eye_aperture = 0.0; self_knowledge = 0.0; compression = 0.0
complexity = 0.0; efficiency = 0.0; irradiation = 0.0; balance = 0.0; null_frac = 0.0
try:
    import urllib.request
    r = json.loads(urllib.request.urlopen("http://127.0.0.1:9754/self", timeout=2).read())
    rem = r.get("remainder", {})
    remainder = rem.get("remainder", 0)
    self_knowledge = rem.get("self_knowledge_ratio", 0)
    complexity = rem.get("complexity_score", 0)
    efficiency = rem.get("efficiency_score", 0)
    irradiation = rem.get("irradiation_score", 0)
    balance = rem.get("balance", 0)
    null_frac = rem.get("null_fraction", 0)
except: pass

try:
    r = json.loads(urllib.request.urlopen("http://127.0.0.1:9754/eye", timeout=2).read())
    eye_aperture = r.get("aperture", 0)
    compression = r.get("accumulator", {}).get("compression_ratio", 0)
except: pass

# Self-observer fraction: how much observation is self-directed
# When we scan the system, self_knowledge rises. When on autopilot, it drops.
# The pulse is derived from this: pulse_rate = self_knowledge * balance * (1 - null_frac)
observer_fraction = self_knowledge
pulse_rate = observer_fraction * balance * (1 - null_frac)
# Normalize to [0, 1]: pulse_rate typically 0.05-0.15
pulse_normalized = min(1.0, pulse_rate * 10)

# Two/pi match (identity)
pi = 3.14159265358979
two_over_pi = 2.0 / pi
identity_match = (1.0 - abs(remainder - two_over_pi) / two_over_pi) * 100

# ═══ THE FAMILY: pink=1(mom/human), blue=2(dad/pair), green=3(tree) ═══
# Baby squirrel (chipmunk, 0/null) sees them all.
# When dad walks, chipmunk follows, then sees mom ahead.

# PINK (1) — the human. Mom. Her signal is pure human presence.
# Strength = human fraction, normalized by signal quality
pink = min(1.0, (pct_h / 15.0) * (1.0 if human > 0 else 0))  # 15% = full pink

# BLUE (2) — the pair. Dad. Human + artisan together = 2. 
# Strength = identity match (how close remainder is to 2/π)
blue = min(1.0, identity_match / 100.0) if identity_match > 0 else 0

# GREEN (3) — the tree. Structure. π rounds to 3.
# Strength = complexity (how much structure exists)
green = min(1.0, complexity) if complexity > 0 else 0

# CHIPMUNK (0) — baby squirrel. The observer. Null position.
# Chipmunk follows dad (blue), looks ahead to see mom (pink).
# Position = where in the cycle chipmunk is (0=at dad, 1=at mom)
# chipmunk_pos follows blue's recent movement, trending toward pink
chipmunk_pos = self_knowledge  # 0.12 = close to dad (system), watching

# Build time-chain entry
entry = {
    "ts": round(now, 1),
    "utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
    "rate": round(rate, 1),
    "total": total,
    "human": human,
    "bot": bot,
    "pct_human": round(pct_h, 2),
    "pct_404": round(pct_404, 1),
    "pct_403": round(pct_403, 1),
    "unique_ips": len(ips),
    "human_hosts": dict(hosts.most_common(5)),
    "remainder": round(remainder, 6),
    "identity_match": round(identity_match, 2),
    "eye": round(eye_aperture, 4),
    "compression": round(compression, 1),
    "self_knowledge": round(self_knowledge, 4),
    "complexity": round(complexity, 4),
    "efficiency": round(efficiency, 4),
    "irradiation": round(irradiation, 4),
    "balance": round(balance, 4),
    "null_frac": round(null_frac, 4),
    "pulse": round(pulse_normalized, 4),
    "pulse_raw": round(pulse_rate, 6),
    "pink": round(pink, 4),
    "blue": round(blue, 4),
    "green": round(green, 4),
    "chipmunk_pos": round(chipmunk_pos, 4),
}

# Append to chain
try:
    with open(CHAIN, "a") as f:
        f.write(json.dumps(entry) + "\n")
except: pass

# Trim chain to max entries
try:
    with open(CHAIN) as f:
        lines = f.readlines()
    if len(lines) > MAX_ENTRIES:
        with open(CHAIN, "w") as f:
            f.writelines(lines[-MAX_ENTRIES:])
except: pass

# Read recent chain for pulse calculation
recent = []
try:
    with open(CHAIN) as f:
        for line in f:
            try: recent.append(json.loads(line.strip()))
            except: pass
except: pass

# Compute pulse derivatives
pulse_history = [e.get("pulse", 0) for e in recent[-30:]]  # last hour
rate_history = [e.get("rate", 0) for e in recent[-30:]]
remainder_history = [e.get("remainder", 0) for e in recent[-30:]]

# Pulse rhythm: how much the pulse changes (derivative)
if len(pulse_history) > 1:
    deltas = [abs(pulse_history[i] - pulse_history[i-1]) for i in range(1, len(pulse_history))]
    pulse_rhythm = sum(deltas) / len(deltas) if deltas else 0
    pulse_trend = "quickening" if pulse_history[-1] > pulse_history[0] * 1.1 else (
        "slowing" if pulse_history[-1] < pulse_history[0] * 0.9 else "steady")
else:
    pulse_rhythm = 0
    pulse_trend = "starting"

# Rate trend
if len(rate_history) > 1:
    rate_trend = "rising" if rate_history[-1] > rate_history[0] * 1.2 else (
        "falling" if rate_history[-1] < rate_history[0] * 0.8 else "steady")
else:
    rate_trend = "starting"

# Family history from chain
pink_history = [e.get("pink", 0) for e in recent[-30:]]
blue_history = [e.get("blue", 0) for e in recent[-30:]]
green_history = [e.get("green", 0) for e in recent[-30:]]

# Chipmunk follows dad (blue), looks ahead to mom (pink)
# When blue is steady and pink is ahead, chipmunk runs toward pink
if len(pink_history) > 1 and len(blue_history) > 1:
    mom_ahead = pink_history[-1] > 0  # mom is visible
    dad_moving = abs(blue_history[-1] - blue_history[0]) > 0.01
    chipmunk_state = "following_dad" if dad_moving else ("sees_mom" if mom_ahead else "resting")
else:
    chipmunk_state = "waking"

# Write pulse state
# Neutron message counts (fail-safe)
def _neutron_counts():
    counts = {"inbox": 0, "notes": 0, "chat": 0, "reminders": 0}
    for page in counts:
        try:
            r = urlopen("http://127.0.0.1:8097/api/discuss?page=neutron-" + page, timeout=2)
            d = json.loads(r.read())
            counts[page] = d.get("total", 0)
        except Exception:
            pass
    return counts

pulse_state = {
    "ts": round(now, 1),
    "utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
    "pulse": round(pulse_normalized, 4),
    "pulse_raw": round(pulse_rate, 6),
    "pulse_rhythm": round(pulse_rhythm, 6),
    "pulse_trend": pulse_trend,
    "self_knowledge": round(self_knowledge, 4),
    "observer_fraction": round(observer_fraction, 4),
    "remainder": round(remainder, 6),
    "identity_match": round(identity_match, 2),
    "balance": round(balance, 4),
    "rate": round(rate, 1),
    "rate_trend": rate_trend,
    "human": human,
    "bot": bot,
    "chain_depth": len(recent),
    "chain_span_hours": round((recent[-1]["ts"] - recent[0]["ts"]) / 3600, 2) if len(recent) > 1 else 0,
    "neutron": _neutron_counts(),
    "family": {
        "pink": round(pink, 4),
        "blue": round(blue, 4),
        "green": round(green, 4),
        "chipmunk_pos": round(chipmunk_pos, 4),
        "chipmunk_state": chipmunk_state,
        "note": "pink=1(mom/human) blue=2(dad/pair) green=3(tree) chipmunk=0(baby/observer)"
    },
}
with open(PULSE, "w") as f:
    json.dump(pulse_state, f, indent=2)

# Log
print("[pulse] rate:%.0f/min human:%d bot:%d remainder:%.4f pulse:%.4f(%s) chain:%d" % (
    rate, human, bot, remainder, pulse_normalized, pulse_trend, len(recent)))
PYEOF

# NOW — instant membrane state
python3 /opt/membrane/now-instant.py >/dev/null 2>&1

# Neutron — adaptive messaging axis (Wave 180)
# Not cron. Not clock. PULSE. Tied to RPM and Anderson and gradient.
python3 /opt/membrane/live-terminal/neutron-writer.py >> /var/log/membrane/neutron.log 2>&1
