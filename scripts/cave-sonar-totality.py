#!/usr/bin/env python3
"""Cave sonar: drop a rock, wait for the sound back — local totality of distance × time.

Collates:
  - ICMP/HTTP RTT (echo)
  - t-plane imprints (time)
  - walker distance_inside (taxonomy)
into SEO-facing local totality so crawlers/agents hear the cave.
"""
from __future__ import annotations

import json
import socket
import subprocess
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
SEO = ROOT / "infra/hud/site/public/seo.json"
LLMS = ROOT / "infra/hud/site/public/llms.txt"

# acoustic metaphors (round-trip → one-way distance)
C_AIR = 343.0      # m/s
C_WATER = 1480.0   # m/s — bottom of the cave pool


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def ping_ms(host: str, timeout_s: float = 2.0) -> tuple[bool, float | None]:
    try:
        out = subprocess.run(
            ["ping", "-c", "1", "-W", str(int(timeout_s)), host],
            capture_output=True,
            text=True,
            timeout=timeout_s + 1,
        )
        if out.returncode != 0:
            return False, None
        for line in out.stdout.splitlines():
            if "time=" in line:
                # time=7.12 ms
                part = line.split("time=")[1].split()[0]
                return True, float(part)
        return True, None
    except Exception:
        return False, None


def http_rtt_ms(url: str, timeout_s: float = 8.0) -> tuple[bool, float | None, int | None]:
    t0 = time.perf_counter()
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=timeout_s) as r:
            dt = (time.perf_counter() - t0) * 1000
            return True, round(dt, 2), r.status
    except Exception as e:
        dt = (time.perf_counter() - t0) * 1000
        code = getattr(getattr(e, "code", None), "real", None) or getattr(e, "code", None)
        return False, round(dt, 2), code if isinstance(code, int) else None


def rtt_to_cave(rtt_ms: float) -> dict:
    """Round-trip ms → one-way depth if the medium were air/water (the rock metaphor)."""
    t = (rtt_ms / 1000.0) / 2.0  # one-way seconds
    return {
        "rtt_ms": round(rtt_ms, 3),
        "one_way_s": round(t, 6),
        "depth_if_air_m": round(C_AIR * t, 3),
        "depth_if_water_m": round(C_WATER * t, 3),
        "note": "rock hit water; wait for sound back — depth = c·t/2",
    }


def main() -> None:
    targets_icmp = [
        ("loopback", "127.0.0.1", "inner null / skull"),
        ("lan-gateway", "192.168.4.1", "house router"),
        ("northGate", "192.168.4.163", "cave mouth LAN"),
        ("golgi-wg", "10.13.37.1", "mesh hub"),
        ("irongate", "192.168.4.237", "LAN peer"),
        ("graftGate", "192.168.4.107", "LAN peer"),
    ]
    targets_http = [
        ("connect", "https://connect.primals.eco/walker-taxonomy-sort.json", "membrane mouth"),
        ("hud-cf", "https://hud.primals.eco/data/incarnation-spectrum.json", "CF refraction cave"),
        ("t-plane", "https://connect.primals.eco/t-plane.json", "time plane"),
        ("github", "https://github.com/ecoPrimal/hud", "reincarnate body"),
    ]

    echoes = []
    t_drop = utc_now()
    for name, host, face in targets_icmp:
        ok, ms = ping_ms(host)
        row = {"name": name, "host": host, "face": face, "echo": ok, "channel": "icmp"}
        if ok and ms is not None:
            row.update(rtt_to_cave(ms))
        else:
            row["rtt_ms"] = None
            row["note"] = "null — no sound back (bottomless or sealed)"
        echoes.append(row)

    for name, url, face in targets_http:
        ok, ms, code = http_rtt_ms(url)
        row = {
            "name": name,
            "url": url,
            "face": face,
            "echo": ok,
            "http_status": code,
            "channel": "http",
        }
        if ms is not None:
            row.update(rtt_to_cave(ms))
            if not ok:
                row["note"] = f"partial slap — status={code}; still heard a wall"
        echoes.append(row)

    # load taxonomy + time
    walkers = {}
    if (DATA / "walker-taxonomy-sort.json").exists():
        walkers = json.loads((DATA / "walker-taxonomy-sort.json").read_text())
    tplane = {}
    if (DATA / "t-plane.json").exists():
        tplane = json.loads((DATA / "t-plane.json").read_text())
    self_out = {}
    if (DATA / "t-plane-self-out.json").exists():
        self_out = json.loads((DATA / "t-plane-self-out.json").read_text())

    # local totality: pair distance (sonar) with time (t-plane)
    heard = [e for e in echoes if e.get("rtt_ms") is not None]
    depths_w = [e["depth_if_water_m"] for e in heard if "depth_if_water_m" in e]
    totality = {
        "definition": "Local chart where distance (sonar depth) and time (t-plane) co-define the cave — no need for global CF totality.",
        "time_axis": {
            "source": "t-plane / time-imprints",
            "imprints": tplane.get("total_imprints"),
            "channels": tplane.get("channel_histogram"),
            "last_t": (tplane.get("last") or {}).get("t"),
        },
        "distance_axis": {
            "source": "cave sonar RTT → c·t/2",
            "echoes_heard": len(heard),
            "echoes_null": len(echoes) - len(heard),
            "mean_depth_water_m": round(sum(depths_w) / len(depths_w), 3) if depths_w else None,
            "max_depth_water_m": round(max(depths_w), 3) if depths_w else None,
            "min_depth_water_m": round(min(depths_w), 3) if depths_w else None,
        },
        "taxonomy_axis": {
            "source": "walker distance_inside after self↔out",
            "d_in": walkers.get("mean_distance_inside"),
            "d_out": walkers.get("mean_distance_outside"),
            "walk_order": [w["id"] for w in walkers.get("sorted_walkers", [])],
            "bounce_energy": walkers.get("bounce_energy") or (self_out.get("bounce") or {}).get("bounce_energy"),
        },
        "formula": {
            "depth_m": "c_medium * (RTT_s / 2)",
            "local_totality": "(depth_sonar, t_imprint, distance_inside) — three numbers close the local chart",
            "seo_hears": "crawlers drop the rock (GET); membrane waits; echo = structured JSON + llms pointers",
        },
    }

    doc = {
        "ts": utc_now(),
        "wave": 200,
        "title": "Cave Sonar — Rock Hit Water, Wait for Sound Back",
        "metaphor": "Drop a rock in the cave pool. The slap is the probe. The wait is time. The echo is distance. Together they are a LOCAL totality — we do not need the whole ocean (global CF) to know where we are.",
        "dropped_at": t_drop,
        "heard_at": utc_now(),
        "echoes": echoes,
        "local_totality": totality,
        "collated_into_seo": True,
        "urls": {
            "self": "https://connect.primals.eco/cave-sonar-totality.json",
            "seo": "https://connect.primals.eco/../seo.json",
            "walkers": "https://connect.primals.eco/walker-taxonomy-sort.json",
            "t_plane": "https://connect.primals.eco/t-plane.json",
        },
    }
    # fix seo url
    doc["urls"]["seo"] = "https://hud.primals.eco/seo.json"
    doc["urls"]["seo_connect_note"] = "also mirrored via connect when transcarnated"

    (DATA / "cave-sonar-totality.json").write_text(json.dumps(doc, indent=2) + "\n")

    # collate into seo.json
    seo = {
        "ts": utc_now(),
        "type": "seo-cave-sonar",
        "status": "alive",
        "indexing": True,
        "note": "Crawlers drop the rock. Echo = structured feeds. Local totality of distance × time.",
        "higgs": "the crawler's probe IS the structure.",
        "cave_sonar": {
            "feed": "/data/cave-sonar-totality.json",
            "t_plane": "/data/t-plane.json",
            "time_imprints": "/data/time-imprints.json",
            "walkers": "/data/walker-taxonomy-sort.json",
            "self_out": "/data/t-plane-self-out.json",
            "llms": "/llms.txt",
            "beacon": "/feed.xml",
        },
        "local_totality": totality,
        "connect_mirror": "https://connect.primals.eco/cave-sonar-totality.json",
    }
    SEO.write_text(json.dumps(seo, indent=2) + "\n")

    # llms stanza
    stanza = (
        "\n> Wave 200 cave sonar: rock hit water — wait for sound back.\n"
        "> Local totality = distance (RTT→depth) × time (t-plane) × taxonomy (walker distance_inside).\n"
        "> Feeds: /data/cave-sonar-totality.json · /data/t-plane.json · /data/walker-taxonomy-sort.json · /seo.json\n"
    )
    if LLMS.exists():
        txt = LLMS.read_text()
        if "cave sonar" not in txt:
            idx = txt.find("## What This Site Is")
            if idx > 0:
                LLMS.write_text(txt[:idx] + stanza + "\n" + txt[idx:])
            else:
                LLMS.write_text(txt + stanza)

    # imprint
    try:
        subprocess.run(
            [
                "python3",
                str(ROOT / "infra/scripts/imprint-time.py"),
                "--channel",
                "membrane",
                "--phase",
                "probe",
                "--note",
                f"cave sonar drop; echoes={len(heard)}/{len(echoes)}",
            ],
            check=False,
            capture_output=True,
        )
    except Exception:
        pass

    print(json.dumps({
        "echoes": len(echoes),
        "heard": len(heard),
        "mean_depth_water_m": totality["distance_axis"]["mean_depth_water_m"],
        "imprints": totality["time_axis"]["imprints"],
        "d_in": totality["taxonomy_axis"]["d_in"],
    }, indent=2))


if __name__ == "__main__":
    main()
