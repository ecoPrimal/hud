#!/usr/bin/env python3
"""Neutron writer — Wave 179: the messaging axis.
How information travels between surfaces. Without this, info is stuck.
Builds: mirror flows, external touches, channel summaries.
Runs every 2min via cron. Output: /opt/membrane/live-terminal/neutron.json"""

import json, os, glob, urllib.request
from collections import defaultdict
from datetime import datetime, timezone

LIVE = "/opt/membrane/live-terminal"
LOG_DIR = "/var/log/caddy"

def utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def classify_surface(host):
    if not host: return None
    h = host.lower().replace(".primals.eco", "").split(":")[0]
    if h in ("primals", "www", ""): return "hud"
    return h if h else None

def classify_referrer(ref):
    if not ref: return "direct"
    r = ref.lower()
    if "primals.eco" in r: return "internal"
    for name, pattern in [("google","google."),("bing","bing."),("duckduckgo","duckduckgo."),
                          ("chatgpt","chatgpt."),("chatgpt","openai."),("claude","claude."),
                          ("claude","anthropic."),("twitter","t.co"),("twitter","twitter."),
                          ("twitter","x.com"),("reddit","reddit."),("github","github.")]:
        if pattern in r: return name
    return "external"

def parse_log_line(line):
    try:
        entry = json.loads(line)
        req = entry.get("request", {})
        host = req.get("host", "")
        uri = req.get("uri", "")
        headers = req.get("headers", {})
        referer = ""
        for key in ("Referer", "referer"):
            if key in headers:
                vals = headers[key]
                referer = vals[0] if isinstance(vals, list) and vals else (vals if isinstance(vals, str) else "")
                break
        return host, uri, referer
    except:
        return None, None, None

STATIC_EXT = frozenset((".js",".css",".png",".jpg",".svg",".woff",".woff2",".ico",".json",".xml",".txt",".map"))

def fetch_channels():
    chs = {}
    for name, page in [("inbox","neutron-inbox"),("notes","neutron-notes"),
                       ("reminders","neutron-reminders"),("chat","neutron-chat")]:
        try:
            req = urllib.request.Request(
                "http://127.0.0.1:8097/api/discuss?page=" + page,
                headers={"User-Agent":"neutron-writer/1.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode())
                comments = data.get("comments", [])
                chs[name] = {
                    "total": data.get("total", 0),
                    "latest_body": comments[-1].get("body", "")[:120] if comments else None,
                    "latest_ts": comments[-1].get("ts", "")[:19] if comments else None,
                }
        except:
            chs[name] = {"total": 0, "error": "offline"}
    return chs

def build_neutron():
    flows = defaultdict(lambda: defaultdict(int))
    external_touches = defaultdict(lambda: defaultdict(int))
    page_touches = defaultdict(lambda: defaultdict(int))
    total_crossings = 0

    log_files = sorted(glob.glob(os.path.join(LOG_DIR, "access*.log")))
    for lf in log_files[-2:]:
        try:
            with open(lf) as f:
                for line in f:
                    host, uri, referer = parse_log_line(line)
                    if not host: continue
                    to_surface = classify_surface(host)
                    if not to_surface: continue
                    page = uri.split("?")[0].rstrip("/") or "/"
                    if not any(page.endswith(ext) for ext in STATIC_EXT):
                        page_touches[to_surface][page] += 1
                    if not referer:
                        external_touches[to_surface]["direct"] += 1
                        continue
                    ref_class = classify_referrer(referer)
                    if ref_class == "internal":
                        from_surface = classify_surface(referer.split("//")[-1].split("/")[0])
                        if from_surface and from_surface != to_surface:
                            flows[from_surface][to_surface] += 1
                            total_crossings += 1
                    else:
                        external_touches[to_surface][ref_class] += 1
        except:
            pass

    mirrors = []
    for from_s, targets in flows.items():
        for to_s, count in targets.items():
            if count >= 2:
                mirrors.append({"from_surface":from_s,"to_surface":to_s,"crossings":count,"last_seen":utc_now()})
    mirrors.sort(key=lambda m:-m["crossings"])

    touches = []
    for surface, refs in external_touches.items():
        for ref, count in sorted(refs.items(), key=lambda x:-x[1])[:5]:
            if count >= 2:
                tp = max(page_touches.get(surface, {"/":1}).items(), key=lambda x:x[1], default=("/",0))
                touches.append({"surface":surface,"page":tp[0],"touches":count,"referrer":ref})
    touches.sort(key=lambda t:-t["touches"])

    flow_matrix = {}
    for from_s, targets in flows.items():
        flow_matrix[from_s] = dict(sorted(targets.items(), key=lambda x:-x[1]))

    all_surfaces = set()
    for s in flows: all_surfaces.add(s)
    for s in external_touches: all_surfaces.add(s)
    for targets in flows.values():
        for s in targets: all_surfaces.add(s)
    outgoing = {s: sum(flows.get(s, {}).values()) for s in all_surfaces}
    stuck = [s for s in all_surfaces if outgoing.get(s, 0) == 0]
    radiating = [s for s, c in sorted(outgoing.items(), key=lambda x:-x[1]) if c > 5][:10]

    channels = fetch_channels()
    total_msgs = sum(ch.get("total", 0) for ch in channels.values())

    neutron = {
        "generated": utc_now(),
        "wave": 179,
        "axis": "neutron — the messaging axis — how information travels",
        "mirrors": mirrors[:50],
        "touches": touches[:100],
        "flows": flow_matrix,
        "total_crossings": total_crossings,
        "stuck": sorted(stuck),
        "radiating": radiating,
        "surfaces_observed": len(all_surfaces),
        "channels": channels,
        "total_messages": total_msgs,
    }

    with open(os.path.join(LIVE, "neutron.json"), "w") as f:
        json.dump(neutron, f, indent=2)

    print(f"neutron.json: {len(mirrors)} mirrors, {len(touches)} touches, {total_crossings} crossings, {len(stuck)} stuck, {total_msgs} messages")

if __name__ == "__main__":
    build_neutron()
