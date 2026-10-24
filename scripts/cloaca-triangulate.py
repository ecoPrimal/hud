#!/usr/bin/env python3
"""Cloaca triangulation — local distance from distance × time × geo towers.

The cave-sonar / SEO echo path IS the cloaca: waste/pressure goes out; the sound
that comes back is the only measurement we need.

Like a phone between two cell towers: a couple of touches (pings) + looking
(who answers) finds proximity — and finds which bay in the rack has the dead drive.
"""
from __future__ import annotations

import json
import math
import socket
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"

# Local geo of the house mesh (arbitrary units — relative chart, not WGS84)
TOWERS = [
    ("T0-loop", "127.0.0.1", 0.0, 0.0, "skull / origin"),
    ("T1-gw", "192.168.4.1", 1.0, 0.0, "house router"),
    ("T2-north", "192.168.4.163", 2.0, 1.0, "northGate bay"),
    ("T3-iron", "192.168.4.237", 3.0, 0.5, "irongate bay"),
    ("T4-graft", "192.168.4.107", 2.5, -1.0, "graftGate bay"),
    ("T5-golgi", "10.13.37.1", 10.0, 0.0, "golgi mesh (far)"),
    ("T6-east", "192.168.4.244", 0.5, 0.5, "eastGate / this skull"),
]

# Rack bays / organs — "drives" we diagnose with look + touch
BAYS = [
    {"bay": "B0-socksproxy", "host": "127.0.0.1", "port": 8123, "look": "local organ"},
    {"bay": "B1-north-ssh", "host": "192.168.4.163", "port": 22, "look": "northGate SSH"},
    {"bay": "B2-iron-ssh", "host": "192.168.4.237", "port": 22, "look": "irongate SSH"},
    {"bay": "B3-graft-ssh", "host": "192.168.4.107", "port": 22, "look": "graftGate SSH"},
    {"bay": "B4-north-icmp", "host": "192.168.4.163", "port": None, "look": "northGate body"},
    {"bay": "B5-golgi-ssh", "host": "golgi", "port": 22, "look": "golgi via alias"},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def ping_ms(host: str) -> float | None:
    try:
        out = subprocess.run(
            ["ping", "-c", "1", "-W", "2", host],
            capture_output=True,
            text=True,
            timeout=3,
        )
        if out.returncode != 0:
            return None
        for line in out.stdout.splitlines():
            if "time=" in line:
                return float(line.split("time=")[1].split()[0])
    except Exception:
        return None
    return None


def tcp_touch(host: str, port: int, timeout: float = 0.9) -> tuple[bool, float]:
    t0 = time.perf_counter()
    s = socket.socket()
    s.settimeout(timeout)
    try:
        s.connect((host, port))
        s.close()
        return True, round((time.perf_counter() - t0) * 1000, 2)
    except Exception:
        return False, round((time.perf_counter() - t0) * 1000, 2)


def rtt_to_range(rtt_ms: float) -> float:
    """Pseudo-range in local chart units. Scale so LAN ~1 unit, WG tens."""
    # one-way ms as distance proxy
    return max(0.001, (rtt_ms / 2.0) / 5.0)  # 10ms RTT ≈ 1 unit


def trilaterate(anchors: list[tuple[float, float, float]]) -> tuple[float, float] | None:
    """Least-squares 2D from (x,y,range). Need ≥3 alive towers."""
    if len(anchors) < 3:
        return None
    # use first as reference
    x1, y1, r1 = anchors[0]
    A = []
    b = []
    for x, y, r in anchors[1:]:
        A.append([2 * (x - x1), 2 * (y - y1)])
        b.append(r1**2 - r**2 - x1**2 + x**2 - y1**2 + y**2)
    # normal equations
    try:
        AtA00 = sum(a[0] * a[0] for a in A)
        AtA01 = sum(a[0] * a[1] for a in A)
        AtA11 = sum(a[1] * a[1] for a in A)
        Atb0 = sum(A[i][0] * b[i] for i in range(len(A)))
        Atb1 = sum(A[i][1] * b[i] for i in range(len(A)))
        det = AtA00 * AtA11 - AtA01 * AtA01
        if abs(det) < 1e-12:
            return None
        x = (AtA11 * Atb0 - AtA01 * Atb1) / det
        y = (-AtA01 * Atb0 + AtA00 * Atb1) / det
        return (round(x, 4), round(y, 4))
    except Exception:
        return None


def diagnose_bay(icmp: float | None, tcp_ok: bool | None, tcp_ms: float | None) -> dict:
    """Dead drive in the rack — just by looking and a couple touches."""
    if icmp is None and tcp_ok is False:
        return {
            "state": "EMPTY_SLOT",
            "meaning": "no body, no organ — bay vacant or powered off",
            "action": "check power / cable (physical walk)",
        }
    if icmp is not None and tcp_ok is False:
        return {
            "state": "DEAD_DRIVE",
            "meaning": "body answers (ICMP) but organ silent (TCP) — drive spun, service dead",
            "action": "restart service / check port — found by two touches",
        }
    if icmp is not None and tcp_ok is True:
        # northGate pattern: listen but auth may still fail — soft lock
        return {
            "state": "LIVE_OR_LOCKED",
            "meaning": "body+port echo — if SSH still denies, bay is LOCKED (key missing), not dead",
            "action": "look: process up. touch: authorized_keys. proximity known.",
            "touch_ms": tcp_ms,
            "icmp_ms": icmp,
        }
    if icmp is None and tcp_ok is True:
        return {
            "state": "GHOST_PORT",
            "meaning": "port answers without ICMP? unusual — check alias/DNS",
            "action": "resolve hostname",
        }
    return {"state": "UNKNOWN", "meaning": "incomplete touches", "action": "touch again"}


def main() -> None:
    # LOOK — who is present (ICMP)
    towers = []
    anchors = []
    for tid, host, x, y, face in TOWERS:
        ms = ping_ms(host)
        row = {
            "id": tid,
            "host": host,
            "geo_xy": [x, y],
            "face": face,
            "rtt_ms": ms,
            "alive": ms is not None,
            "pseudo_range": rtt_to_range(ms) if ms is not None else None,
        }
        towers.append(row)
        if ms is not None:
            anchors.append((x, y, rtt_to_range(ms)))

    fix = trilaterate(anchors)
    # observer is eastGate / loop — report distance to each tower
    proximity = sorted(
        [
            {
                "tower": t["id"],
                "face": t["face"],
                "rtt_ms": t["rtt_ms"],
                "near": t["rtt_ms"] is not None and t["rtt_ms"] < 5,
                "far": t["rtt_ms"] is not None and t["rtt_ms"] >= 30,
            }
            for t in towers
            if t["alive"]
        ],
        key=lambda z: z["rtt_ms"] or 9999,
    )

    # TOUCH — couple of TCP probes on rack bays
    rack = []
    for bay in BAYS:
        host, port = bay["host"], bay["port"]
        icmp = ping_ms(host) if host not in ("golgi",) else ping_ms("10.13.37.1")
        if port is None:
            diag = diagnose_bay(icmp, None, None)
            if icmp is not None:
                diag = {
                    "state": "BODY_ONLY",
                    "meaning": "looked: ICMP alive — body in bay, no organ touched yet",
                    "action": "one more touch (TCP) to finish diagnosis",
                    "icmp_ms": icmp,
                }
            rack.append({**bay, "icmp_ms": icmp, "tcp": None, "diagnosis": diag})
            continue
        # resolve golgi via ssh config? use IP
        h = "10.13.37.1" if host == "golgi" else host
        ok, ms = tcp_touch(h, port)
        diag = diagnose_bay(icmp if host != "golgi" else ping_ms("10.13.37.1"), ok, ms)
        # special: north SSH listens but we know keys fail — mark LOCKED if port open
        if bay["bay"] == "B1-north-ssh" and ok:
            diag = {
                "state": "LOCKED_DRIVE",
                "meaning": "northGate body+sshd alive; key exchange missing — drive found, bay known, lock is the fault",
                "action": "Kevin: authorized_keys (one physical touch)",
                "icmp_ms": icmp,
                "touch_ms": ms,
            }
        rack.append({**bay, "icmp_ms": icmp, "tcp": {"echo": ok, "ms": ms}, "diagnosis": diag})

    # pull time + taxonomy for the cloaca ledger
    cave = {}
    if (DATA / "cave-sonar-totality.json").exists():
        cave = json.loads((DATA / "cave-sonar-totality.json").read_text())
    walkers = {}
    if (DATA / "walker-taxonomy-sort.json").exists():
        walkers = json.loads((DATA / "walker-taxonomy-sort.json").read_text())

    doc = {
        "ts": utc_now(),
        "wave": 200,
        "title": "Cloaca Triangulation — Phone Towers for the Rack",
        "thesis": {
            "cloaca": "Cave-sonar / SEO echo path IS the cloaca — pressure out, sound back. Not the mouth (CDN). The orifice that lets us measure.",
            "phone_towers": "Each LAN/mesh peer is a tower. RTT = range. Two–three touches locate you like a phone between cells.",
            "dead_drive": "Look (ICMP) + touch (TCP) finds which bay is empty, dead, locked, or live — without opening the chassis.",
            "local_distance": "distance (RTT) × time (t-plane) × geo (tower xy) = local fix. No GPS required.",
        },
        "towers": towers,
        "trilateration_fix_xy": fix,
        "proximity_sorted": proximity,
        "rack_diagnosis": rack,
        "how_to_find_dead_drive": [
            "1. LOOK — ping the bay (body present?)",
            "2. TOUCH — TCP the organ port (service alive?)",
            "3. If body+port but auth fails → LOCKED not dead",
            "4. If body no port → DEAD_DRIVE (restart organ)",
            "5. If neither → EMPTY_SLOT (power/cable)",
        ],
        "collated": {
            "cave_sonar": bool(cave),
            "walker_d_in": walkers.get("mean_distance_inside"),
            "mean_depth_water_m": (cave.get("local_totality") or {})
            .get("distance_axis", {})
            .get("mean_depth_water_m"),
        },
        "urls": {
            "self": "https://connect.primals.eco/cloaca-triangulation.json",
            "cave": "https://connect.primals.eco/cave-sonar-totality.json",
            "seo": "https://connect.primals.eco/seo.json",
        },
    }
    (DATA / "cloaca-triangulation.json").write_text(json.dumps(doc, indent=2) + "\n")

    # extend seo
    seo_path = ROOT / "infra/hud/site/public/seo.json"
    if seo_path.exists():
        seo = json.loads(seo_path.read_text())
        seo.setdefault("cave_sonar", {})["cloaca_triangulation"] = "/data/cloaca-triangulation.json"
        seo["cloaca"] = {
            "role": "echo orifice — measure by what comes back",
            "feed": "/data/cloaca-triangulation.json",
            "method": "look+touch → rack bay diagnosis; towers → local fix",
        }
        seo["ts"] = utc_now()
        seo_path.write_text(json.dumps(seo, indent=2) + "\n")

    print(json.dumps({
        "fix_xy": fix,
        "nearest": proximity[0] if proximity else None,
        "farthest_alive": proximity[-1] if proximity else None,
        "rack": [{ "bay": r["bay"], "state": r["diagnosis"]["state"] } for r in rack],
    }, indent=2))


if __name__ == "__main__":
    main()
