#!/usr/bin/env python3
"""Turn t-plane through SELF ↔ OUT; use that + distance INSIDE taxonomy sort for walkers.

INSIDE channels: local, membrane, connect
OUTSIDE channels: github, cloudflare, forgejo

distance_inside ∈ [0,1]:
  0 = deep self (short Δt on inside channels)
  1 = far from self (outside, long waits, failures)

Walkers (graph legs + named membrane walkers) are sorted by distance_inside
so the walk prefers near-self paths first.
"""
from __future__ import annotations

import json
import math
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"

INSIDE = {"local", "membrane", "connect"}
OUTSIDE = {"github", "cloudflare", "forgejo"}

# named walkers from membrane lore + graph legs
WALKERS = [
    {"id": "berry", "leg": "knn", "gait": "smell", "role": "nightbox porter"},
    {"id": "chipmunk", "leg": "a_star", "gait": "dart", "role": "curiosity / neutrino"},
    {"id": "dijkstra-packet", "leg": "dijkstra", "gait": "cautious", "role": "WG/LAN router"},
    {"id": "tide-dns", "leg": "bfs", "gait": "ripple", "role": "DNS diffusion"},
    {"id": "root-trail", "leg": "dfs", "gait": "obsessive", "role": "paper trail / git log"},
    {"id": "debt-walker", "leg": "bellman_ford", "gait": "through-failure", "role": "negative edges"},
    {"id": "herd-kmeans", "leg": "k_means", "gait": "stamp", "role": "feed taxonomy clusters"},
    {"id": "skeleton-index", "leg": "ball_tree", "gait": "instant", "role": "spatial prune"},
    {"id": "clone-pilgrim", "leg": "bfs", "gait": "tide", "role": "GH clone heat (outside)"},
    {"id": "pages-ghost", "leg": "dijkstra", "gait": "blocked", "role": "CF Pages intercept"},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_imprints() -> list[dict]:
    p = DATA / "time-imprints.json"
    if not p.exists():
        return []
    return json.loads(p.read_text()).get("imprints", [])


def side(channel: str) -> str:
    if channel in INSIDE:
        return "INSIDE"
    if channel in OUTSIDE:
        return "OUTSIDE"
    return "LIMINAL"


def imprint_distance(row: dict) -> float:
    """Map one imprint to distance_inside [0,1]."""
    ch = row.get("x_channel", "")
    phase = row.get("y_phase", "")
    dt = row.get("dt_same_channel_s")
    note = (row.get("note") or "").lower()
    extra = row.get("extra") or {}

    if ch in INSIDE:
        d = 0.15
    elif ch == "github":
        d = 0.45  # outside but reincarnate-friendly
    elif ch == "cloudflare":
        d = 0.7
    elif ch == "forgejo":
        d = 0.85
    else:
        d = 0.5

    # long waits push outward
    if isinstance(dt, (int, float)) and dt > 30:
        d = min(1.0, d + 0.15)
    if isinstance(dt, (int, float)) and dt > 60:
        d = min(1.0, d + 0.15)

    # failures / anoxic / 404
    if "anoxic" in note or "fail" in note or "404" in note:
        d = min(1.0, d + 0.12)
    if extra.get("status") == 404:
        d = min(1.0, d + 0.1)
    if extra.get("fold") == "refraction":
        d = min(1.0, d + 0.08)  # Pages intercept = farther from self artery

    # switch_in to membrane = pull inward
    if phase == "switch_in" and ch in INSIDE:
        d = max(0.0, d - 0.1)
    if phase == "switch_out":
        d = min(1.0, d + 0.1)
    if phase in ("reincarnate", "deploy") and ch in ("github", "connect"):
        d = max(0.0, d - 0.05)

    return round(d, 4)


def bounce_self_out(imprints: list[dict]) -> dict:
    inside_pts, outside_pts, liminal = [], [], []
    hops = []
    for row in imprints:
        d = imprint_distance(row)
        pt = {
            "t": row.get("t"),
            "x": row.get("x_channel"),
            "y": row.get("y_phase"),
            "distance_inside": d,
            "side": side(row.get("x_channel", "")),
            "note": row.get("note"),
            "dt": row.get("dt_same_channel_s"),
        }
        if pt["side"] == "INSIDE":
            inside_pts.append(pt)
        elif pt["side"] == "OUTSIDE":
            outside_pts.append(pt)
        else:
            liminal.append(pt)

    # bounce path: alternate energy between last inside and outside clusters
    def mean_d(pts):
        return sum(p["distance_inside"] for p in pts) / len(pts) if pts else 0.5

    d_in, d_out = mean_d(inside_pts), mean_d(outside_pts)
    # energy transfer self→out→self (notice)
    E_out = (1 - d_in) * (1 - abs(d_out - d_in))
    E_back = (1 - d_out * 0.5) * (1 - d_in)
    hops = [
        {"from": "SELF", "to": "OUT", "energy": round(E_out, 4), "d_self": d_in, "d_out": d_out},
        {"from": "OUT", "to": "SELF", "energy": round(E_back, 4), "d_self": d_in, "d_out": d_out},
    ]
    return {
        "inside": inside_pts,
        "outside": outside_pts,
        "liminal": liminal,
        "mean_distance_inside": round(d_in, 4),
        "mean_distance_outside": round(d_out, 4),
        "bounce_hops": hops,
        "bounce_energy": round(E_out + E_back, 4),
        "notice": "YES" if E_out + E_back > 0.5 else "WEAK",
    }


def taxonomy_band(distance: float) -> dict:
    """Arena self-sort bands by distance_inside."""
    if distance < 0.25:
        return {"id": "self", "band": "0°", "color": "#3fb950"}
    if distance < 0.5:
        return {"id": "partial", "band": "180°", "color": "#f0883e"}
    if distance < 0.75:
        return {"id": "non-self", "band": "90°", "color": "#e85d3a"}
    return {"id": "null", "band": "270°", "color": "#484f58"}


def score_walkers(bounce: dict, imprints: list[dict]) -> list[dict]:
    """Assign each walker a distance_inside from how their channel/leg shows up on t-plane."""
    # channel affinity per walker
    affinity = {
        "berry": ["membrane", "connect", "local"],
        "chipmunk": ["membrane", "local", "connect"],
        "dijkstra-packet": ["membrane", "connect", "local"],
        "tide-dns": ["cloudflare", "connect"],
        "root-trail": ["github", "local", "membrane"],
        "debt-walker": ["forgejo", "cloudflare"],
        "herd-kmeans": ["membrane", "local"],
        "skeleton-index": ["local", "membrane"],
        "clone-pilgrim": ["github", "cloudflare"],
        "pages-ghost": ["cloudflare"],
    }
    scored = []
    for w in WALKERS:
        chans = affinity.get(w["id"], ["membrane"])
        # gather imprint distances for those channels
        ds = [
            imprint_distance(r)
            for r in imprints
            if r.get("x_channel") in chans
        ]
        if not ds:
            # fall back: outside walkers start farther
            d = 0.7 if any(c in OUTSIDE for c in chans) else 0.25
        else:
            d = sum(ds) / len(ds)
        # pull toward bounce means slightly
        d = 0.7 * d + 0.3 * (
            bounce["mean_distance_outside"]
            if any(c in OUTSIDE for c in chans)
            else bounce["mean_distance_inside"]
        )
        band = taxonomy_band(d)
        scored.append({
            **w,
            "channels": chans,
            "distance_inside": round(d, 4),
            "taxonomy": band,
            "walk_order_key": round(d, 4),
        })
    scored.sort(key=lambda x: x["walk_order_key"])
    for i, w in enumerate(scored):
        w["walk_rank"] = i + 1
    return scored


def main() -> None:
    imprints = load_imprints()
    bounce = bounce_self_out(imprints)
    walkers = score_walkers(bounce, imprints)

    self_out = {
        "ts": utc_now(),
        "wave": 200,
        "title": "t-plane through SELF ↔ OUT",
        "thesis": "Run every time-imprint through self and out. Distance INSIDE taxonomy sorts the walkers — near-self walks first.",
        "imprints_in": len(imprints),
        "bounce": bounce,
        "axes_used": {
            "t_plane": "x=channel y=phase t=when",
            "distance_inside": "0=self … 1=far (outside/anoxic/refraction)",
            "taxonomy": "arena self-sort bands mapped from distance",
        },
        "urls": {
            "self": "https://connect.primals.eco/t-plane-self-out.json",
            "walkers": "https://connect.primals.eco/walker-taxonomy-sort.json",
            "t_plane": "https://connect.primals.eco/t-plane.json",
        },
    }
    walker_doc = {
        "ts": utc_now(),
        "wave": 200,
        "title": "Walker Taxonomy Sort — by distance INSIDE",
        "rule": "Sort walkers by distance_inside after t-plane self↔out bounce. Rank 1 = nearest self = walk first.",
        "bounce_energy": bounce["bounce_energy"],
        "notice": bounce["notice"],
        "mean_distance_inside": bounce["mean_distance_inside"],
        "mean_distance_outside": bounce["mean_distance_outside"],
        "sorted_walkers": walkers,
        "walk_plan": [
            {
                "rank": w["walk_rank"],
                "id": w["id"],
                "leg": w["leg"],
                "distance_inside": w["distance_inside"],
                "taxonomy": w["taxonomy"]["id"],
                "instruction": f"walk with {w['leg']} ({w['gait']}) on channels {w['channels']}",
            }
            for w in walkers
        ],
        "urls": {
            "self": "https://connect.primals.eco/walker-taxonomy-sort.json",
            "graph_legs": "https://connect.primals.eco/graph-walkers.json"
            if False
            else "/data/graph-walkers.json",
            "self_out": "https://connect.primals.eco/t-plane-self-out.json",
        },
    }

    (DATA / "t-plane-self-out.json").write_text(json.dumps(self_out, indent=2) + "\n")
    (DATA / "walker-taxonomy-sort.json").write_text(json.dumps(walker_doc, indent=2) + "\n")

    # imprint this bounce
    try:
        import subprocess
        subprocess.run(
            [
                "python3",
                str(ROOT / "infra/scripts/imprint-time.py"),
                "--channel",
                "membrane",
                "--phase",
                "route",
                "--note",
                f"self↔out bounce E={bounce['bounce_energy']} walkers_sorted={len(walkers)}",
            ],
            check=False,
            capture_output=True,
        )
    except Exception:
        pass

    print(json.dumps({
        "bounce_energy": bounce["bounce_energy"],
        "notice": bounce["notice"],
        "d_in": bounce["mean_distance_inside"],
        "d_out": bounce["mean_distance_outside"],
        "first_walker": walkers[0]["id"] if walkers else None,
        "last_walker": walkers[-1]["id"] if walkers else None,
        "walk_order": [w["id"] for w in walkers],
    }, indent=2))


if __name__ == "__main__":
    main()
