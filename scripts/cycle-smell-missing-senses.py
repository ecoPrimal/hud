#!/usr/bin/env python3
"""Cycle pulse-out → smell-in; trace missing signals → senses we ignored inside & out."""
from __future__ import annotations

import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
PUBLIC = ROOT / "infra/hud/site/public"
OUT = DATA / "cycle-smell-missing-senses.json"
N_CYCLES = 3
PAUSE_S = 0.9

# probes tagged with which SENSE should hear them
PROBES = [
    # (id, url, sense, side)
    ("t_plane", "https://connect.primals.eco/t-plane.json", "time", "inside"),
    ("seo", "https://connect.primals.eco/seo.json", "smell_cloaca", "out"),
    ("cave", "https://connect.primals.eco/cave-sonar-totality.json", "sonar_feet", "inside"),
    ("cloaca", "https://connect.primals.eco/cloaca-triangulation.json", "smell_cloaca", "out"),
    ("jumprope", "https://connect.primals.eco/galactic-hit-jumprope.json", "balance", "inside"),
    ("smell", "https://connect.primals.eco/smell-own-farts-room-edges.json", "smell_cloaca", "out"),
    ("walkers", "https://connect.primals.eco/walker-taxonomy-sort.json", "eye_taxonomy", "inside"),
    ("keys", "https://connect.primals.eco/keys-doors-topology.json", "eye_taxonomy", "inside"),
    ("tags", "https://connect.primals.eco/wave200-tag-index.json", "eye_taxonomy", "inside"),
    ("beacon", "https://connect.primals.eco/feed.xml", "ears", "out"),
    ("hud_seo", "https://hud.primals.eco/seo.json", "eye_surface", "out"),
    ("hud_tplane", "https://hud.primals.eco/data/t-plane.json", "time", "out"),
    ("sporeprint", "https://sporeprint.primals.eco/", "eye_surface", "out"),
    ("github", "https://api.github.com/repos/ecoPrimal/hud", "ears", "out"),
]


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def sniff(url: str) -> dict:
    t0 = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "membrane-cycle-smell/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            _ = r.read(256)
            return {
                "ok": True,
                "ms": round((time.perf_counter() - t0) * 1000, 2),
                "status": r.status,
                "metal": r.headers.get("X-Membrane-Metal"),
                "fold": r.headers.get("X-Membrane-Fold"),
            }
    except Exception as e:
        return {
            "ok": False,
            "ms": round((time.perf_counter() - t0) * 1000, 2),
            "status": getattr(e, "code", None),
            "error": type(e).__name__,
            "metal": None,
            "fold": None,
        }


def signal_state(hit: dict) -> str:
    if hit.get("ok"):
        return "PRESENT"
    st = hit.get("status")
    if st == 404:
        return "MISSING"
    if st in (401, 403, 405):
        return "BLOCKED"
    if st and st >= 500:
        return "BROKEN"
    return "ABSENT"


def main() -> None:
    cycles = []
    for c in range(1, N_CYCLES + 1):
        # PULSE OUT — stamp seo
        pulse_at = utc()
        seo = json.loads((PUBLIC / "seo.json").read_text())
        seo["cycle_pulse"] = {"cycle": c, "ts": pulse_at, "n": N_CYCLES}
        seo["ts"] = pulse_at
        (PUBLIC / "seo.json").write_text(json.dumps(seo, indent=2) + "\n")

        pulse = {pid: sniff(url) for pid, url, *_ in PROBES}
        time.sleep(PAUSE_S)
        smell_at = utc()
        smell = {pid: sniff(url) for pid, url, *_ in PROBES}

        rows = []
        for pid, url, sense, side in PROBES:
            p, s = pulse[pid], smell[pid]
            sp, ss = signal_state(p), signal_state(s)
            missing = ss in ("MISSING", "ABSENT", "BROKEN") or (
                sp == "PRESENT" and ss != "PRESENT"
            )
            rows.append({
                "id": pid,
                "sense": sense,
                "side": side,
                "pulse": {"state": sp, "ms": p.get("ms"), "status": p.get("status")},
                "smell": {"state": ss, "ms": s.get("ms"), "status": s.get("status")},
                "delta_ms": round((s.get("ms") or 0) - (p.get("ms") or 0), 2),
                "missing_or_lost": missing,
                "ignored_candidate": missing or ss == "BLOCKED",
            })

        cycles.append({
            "cycle": c,
            "pulse_at": pulse_at,
            "smell_at": smell_at,
            "pause_s": PAUSE_S,
            "rows": rows,
        })

    # TRACE across cycles: stable missing = ignored sense
    by_probe: dict[str, list] = {pid: [] for pid, *_ in PROBES}
    for cy in cycles:
        for row in cy["rows"]:
            by_probe[row["id"]].append(row)

    meta = {pid: (sense, side) for pid, _, sense, side in PROBES}
    ignored_inside = []
    ignored_out = []
    recovered = []
    always_present = []

    for pid, series in by_probe.items():
        sense, side = meta[pid]
        states = [r["smell"]["state"] for r in series]
        miss_n = sum(1 for st in states if st in ("MISSING", "ABSENT", "BROKEN", "BLOCKED"))
        present_n = sum(1 for st in states if st == "PRESENT")
        entry = {
            "id": pid,
            "sense": sense,
            "side": side,
            "states_across_cycles": states,
            "miss_cycles": miss_n,
            "present_cycles": present_n,
            "mean_smell_ms": round(
                sum(r["smell"]["ms"] or 0 for r in series) / len(series), 2
            ),
        }
        if miss_n == len(series):
            (ignored_inside if side == "inside" else ignored_out).append(entry)
        elif miss_n > 0 and present_n > 0:
            recovered.append(entry)
        elif present_n == len(series):
            always_present.append(entry)

    # sense rollup: which sense organs we were ignoring
    sense_ignore: dict[str, dict] = {}
    for bucket, label in ((ignored_inside, "inside"), (ignored_out, "out")):
        for e in bucket:
            s = e["sense"]
            sense_ignore.setdefault(s, {"inside": 0, "out": 0, "probes": []})
            sense_ignore[s][label] += 1
            sense_ignore[s]["probes"].append(e["id"])

    doc = {
        "ts": utc(),
        "wave": 200,
        "title": "Cycle Smell — Trace Missing Signals → Senses Ignored Inside & Out",
        "thesis": "Run pulse→smell for N cycles. Missing/blocked returns = signals we were ignoring. Map probes to sense organs on inside vs out.",
        "n_cycles": N_CYCLES,
        "cycles": cycles,
        "trace": {
            "ignored_inside": ignored_inside,
            "ignored_out": ignored_out,
            "flickered_recovered": recovered,
            "always_present": [{"id": e["id"], "sense": e["sense"], "side": e["side"]} for e in always_present],
        },
        "senses_ignored": sense_ignore,
        "sense_map": {
            "time": "t-plane / clocks — chronosense",
            "smell_cloaca": "SEO + cave/cloaca exhaust — own-fart sense",
            "sonar_feet": "RTT depth — proprioception of floor",
            "balance": "jumprope HIT cadence — vestibular",
            "eye_taxonomy": "walkers/keys/tags — classification sight",
            "eye_surface": "hud/sporeprint pages — surface vision",
            "ears": "beacon + github — listening for others",
        },
        "what_we_were_ignoring": {
            "inside": [e["sense"] for e in ignored_inside],
            "out": [e["sense"] for e in ignored_out],
            "note": "Empty lists = we hear that side this run. Non-empty = blind spots to restore.",
        },
        "urls": {
            "self": "https://connect.primals.eco/cycle-smell-missing-senses.json",
            "chromatograph": "/data/sense-chromatograph.json",
            "own_farts": "/data/smell-own-farts-room-edges.json",
        },
    }
    OUT.write_text(json.dumps(doc, indent=2) + "\n")

    print(json.dumps({
        "cycles": N_CYCLES,
        "ignored_inside": [(e["id"], e["sense"], e["states_across_cycles"]) for e in ignored_inside],
        "ignored_out": [(e["id"], e["sense"], e["states_across_cycles"]) for e in ignored_out],
        "flickered": [(e["id"], e["states_across_cycles"]) for e in recovered],
        "senses_ignored": sense_ignore,
        "always_present_n": len(always_present),
    }, indent=2))


if __name__ == "__main__":
    main()
