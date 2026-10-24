#!/usr/bin/env python3
"""Galactic bounce → HIT → flattened impulse back → jump-rope world sense.

HIIT  = unsupervised identity intervals between HITs
Salmon = supervised labels when we have them
Membrane = RL reward on the rope turn
"""
from __future__ import annotations

import json
import math
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
STATE = DATA / "galactic-hit-jumprope-state.json"
RUN = DATA / "galactic-hit-jumprope-run.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sigmoid(x: float, mid: float = 0.45, steep: float = 6.0) -> float:
    z = max(-500.0, min(500.0, steep * (x - mid)))
    return 1.0 / (1.0 + math.exp(-z))


def load_state() -> dict:
    if STATE.exists():
        return json.loads(STATE.read_text())
    return {"hits": [], "hiit_intervals": [], "salmon_counts": {}, "policy": {}}


def run_instrumented() -> dict:
    # refresh live bounce numbers
    subprocess.run(
        ["python3", str(ROOT / "infra/scripts/instrumented-bounce.py")],
        check=False,
        capture_output=True,
    )
    return json.loads((DATA / "galactic-bounce-sort-live.json").read_text())


def is_hit(sigma: float) -> bool:
    return 0.45 <= sigma <= 0.55


def membrane_reward(bounce: dict, hiit_interval: float | None) -> float:
    e = float(bounce.get("total_energy") or 0)
    eff = float(bounce.get("new_efficiency_pct") or 0) / 100.0
    # short intervals = good cadence; long = rope tangled
    dt_pen = 0.0
    if hiit_interval is not None:
        dt_pen = min(0.5, max(0.0, (hiit_interval - 30.0) / 120.0))
    return round(e * (0.5 + 0.5 * eff) * (1.0 - dt_pen), 4)


def salmon_label_mass() -> dict:
    """Supervised counts from cloaca rack + walker taxonomy bands."""
    counts: dict[str, int] = {}
    if (DATA / "cloaca-triangulation.json").exists():
        rack = json.loads((DATA / "cloaca-triangulation.json").read_text()).get("rack_diagnosis", [])
        for r in rack:
            st = (r.get("diagnosis") or {}).get("state", "UNKNOWN")
            counts[st] = counts.get(st, 0) + 1
    if (DATA / "walker-taxonomy-sort.json").exists():
        for w in json.loads((DATA / "walker-taxonomy-sort.json").read_text()).get("sorted_walkers", []):
            band = (w.get("taxonomy") or {}).get("id", "null")
            counts[f"walker_{band}"] = counts.get(f"walker_{band}", 0) + 1
    return counts


def main() -> None:
    state = load_state()
    t0 = time.time()
    bounce = run_instrumented()

    # kingdom sigmas → mean σ as rope height
    instruments = bounce.get("kingdom_instruments") or {}
    sigmas = [v.get("sigma", 0) for v in instruments.values()] if instruments else []
    # also use efficiency mapped into (0,1) as alternate height
    eff = float(bounce.get("new_efficiency_pct") or 0) / 100.0
    mean_sigma = sum(sigmas) / len(sigmas) if sigmas else eff
    # blend toward quiet turn using efficiency as health proxy
    rope_height = 0.6 * mean_sigma + 0.4 * sigmoid(eff, mid=0.2, steep=8)

    hit = is_hit(rope_height) or is_hit(mean_sigma)
    # if not in band, still record a "slap" when efficiency improved vs prior
    prior_eff = state.get("last_efficiency_pct")
    slap = hit
    if prior_eff is not None and bounce.get("new_efficiency_pct", 0) > prior_eff:
        slap = True  # impulse from floor on improvement

    hiit_interval = None
    if state.get("hits"):
        last_t = state["hits"][-1].get("epoch")
        if last_t:
            hiit_interval = round(t0 - last_t, 3)

    impulse = {
        "t": utc_now(),
        "epoch": t0,
        "rope_height_sigma": round(rope_height, 4),
        "mean_kingdom_sigma": round(mean_sigma, 4),
        "efficiency_pct": bounce.get("new_efficiency_pct"),
        "HIT": hit,
        "slap": slap,
        "flattened": hit,
        "impulse_back": slap,
        "hiit_interval_s": hiit_interval,
    }

    if slap:
        state.setdefault("hits", []).append(impulse)
        if hiit_interval is not None:
            state.setdefault("hiit_intervals", []).append(hiit_interval)
        # HIIT identity = recent interval histogram signature
        intervals = state.get("hiit_intervals", [])[-16:]
        if intervals:
            state["hiit_identity"] = {
                "n": len(intervals),
                "mean_s": round(sum(intervals) / len(intervals), 3),
                "min_s": round(min(intervals), 3),
                "max_s": round(max(intervals), 3),
                "note": "unsupervised identity = bounce cadence",
            }

    # Salmon supervised
    salmon = salmon_label_mass()
    state["salmon_counts"] = salmon

    # Membrane RL
    reward = membrane_reward(bounce, hiit_interval)
    policy = state.get("policy") or {"prefer": "connect+github", "avoid": "forgejo_when_anoxic"}
    # reinforce prefer if reward high
    if reward >= 0.5:
        policy["last_reward"] = reward
        policy["last_action"] = "keep_oxic_paths"
        policy["pheromone_connect"] = round(min(1.0, 0.1 + float(policy.get("pheromone_connect", 0.5))), 3)
    else:
        policy["last_reward"] = reward
        policy["last_action"] = "explore_or_PORT"
    state["policy"] = policy
    state["last_efficiency_pct"] = bounce.get("new_efficiency_pct")
    state["ts"] = utc_now()

    world_sense = {
        "unsupervised_HIIT": state.get("hiit_identity"),
        "supervised_Salmon": salmon,
        "reinforcement_membrane": {"reward": reward, "policy": policy},
        "rope": {
            "height": round(rope_height, 4),
            "HIT": hit,
            "slap": slap,
            "interval_s": hiit_interval,
        },
    }

    run = {
        "ts": utc_now(),
        "wave": 200,
        "title": "Jump-rope turn — world sense from HIT impulse",
        "impulse": impulse,
        "world_sense": world_sense,
        "bounce_efficiency_pct": bounce.get("new_efficiency_pct"),
        "tools": {
            "HIIT": "unsupervised identity intervals",
            "Salmon": "supervised label mass (rack + walker bands)",
            "Membrane": "RL reward + ACO-ish pheromone on connect",
        },
        "urls": {
            "doctrine": "https://connect.primals.eco/galactic-hit-jumprope.json",
            "self": "https://connect.primals.eco/galactic-hit-jumprope-run.json",
        },
    }

    STATE.write_text(json.dumps(state, indent=2) + "\n")
    RUN.write_text(json.dumps(run, indent=2) + "\n")

    # imprint
    subprocess.run(
        [
            "python3",
            str(ROOT / "infra/scripts/imprint-time.py"),
            "--channel",
            "membrane",
            "--phase",
            "route",
            "--note",
            f"jumprope slap={slap} HIT={hit} reward={reward}",
        ],
        check=False,
        capture_output=True,
    )

    print(json.dumps({
        "HIT": hit,
        "slap": slap,
        "rope_height": round(rope_height, 4),
        "hiit_interval_s": hiit_interval,
        "reward": reward,
        "salmon": salmon,
        "hiit_identity": state.get("hiit_identity"),
    }, indent=2))


if __name__ == "__main__":
    main()
