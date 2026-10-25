#!/usr/bin/env python3
"""πHz emotion/ITS-feel stream — monitor RAM↔window latency lock.

Carrier: f = 1/π ≈ 0.318 Hz (period = π seconds).
Modulate amplitude/phase with ITS feel (emotion proxies).
Another spot after hard-lock: lock+resistance = same latency lock
RAM must clear to paint the window.
"""

from __future__ import annotations

import json
import math
import os
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "site" / "public"
DATA = ROOT / "data"
CDN = "https://connect.primals.eco"
RING = 64  # ~ π*64 ≈ 201s of history at πHz
PI = math.pi
PI_HZ = 1.0 / PI


def meminfo() -> dict[str, int]:
    out: dict[str, int] = {}
    with open("/proc/meminfo", encoding="utf-8") as f:
        for line in f:
            parts = line.split()
            out[parts[0].rstrip(":")] = int(parts[1])
    return out


def loadavg() -> tuple[float, float, float]:
    with open("/proc/loadavg", encoding="utf-8") as f:
        a, b, c, *_ = f.read().split()
    return float(a), float(b), float(c)


def pressure(kind: str) -> dict[str, float]:
    path = Path(f"/proc/pressure/{kind}")
    if not path.exists():
        return {}
    # some avg10=… avg60=… avg300=… total=…
    line = path.read_text(encoding="utf-8").splitlines()[0]
    d: dict[str, float] = {}
    for tok in line.split()[1:]:
        k, v = tok.split("=")
        d[k] = float(v)
    return d


def sample_latency() -> dict:
    """RAM touch + pipe wakeup ≈ RAM→IPC→window path proxies."""
    buf = bytearray(8 * 1024 * 1024)
    t0 = time.perf_counter_ns()
    for i in range(0, len(buf), 4096):
        buf[i] = 1
    touch_ns = time.perf_counter_ns() - t0

    r, w = os.pipe()
    t0 = time.perf_counter_ns()
    os.write(w, b"x")
    os.read(r, 1)
    pipe_ns = time.perf_counter_ns() - t0
    os.close(r)
    os.close(w)

    # display round-trip proxy: X11 property if DISPLAY set (best-effort)
    x_ns = None
    if os.environ.get("DISPLAY"):
        t0 = time.perf_counter_ns()
        # cheap: read /proc/self/stat mtime-ish via sched yield + clock
        time.sleep(0)
        x_ns = time.perf_counter_ns() - t0

    return {
        "ram_touch_8MiB_ns": touch_ns,
        "ram_touch_8MiB_us": round(touch_ns / 1000, 2),
        "pipe_wakeup_ns": pipe_ns,
        "sched_yield_ns": x_ns,
    }


def its_feel(lat: dict, mem: dict[str, int], load: tuple[float, float, float], io_p: dict) -> dict:
    """Emotion / ITS feel — modulate the πHz carrier.

    ITS = internal time sense / instrumented feel:
      arousal ↑ with load + io pressure
      tension ↑ with RAM touch latency (lock resistance)
      clarity ↑ with MemAvailable
    """
    touch_us = float(lat["ram_touch_8MiB_us"])
    # normalize roughly: 500us calm → 5000us tense (clamp)
    tension = max(0.0, min(1.0, (touch_us - 500) / 4500))
    avail = mem.get("MemAvailable", 0) / max(mem.get("MemTotal", 1), 1)
    clarity = max(0.0, min(1.0, avail))
    arousal = max(0.0, min(1.0, load[0] / 8.0))
    io_drag = max(0.0, min(1.0, io_p.get("avg10", 0.0) / 20.0))
    # composite feel in [-1,1] for phase nudge
    valence = clarity - 0.5 * tension - 0.3 * io_drag
    valence = max(-1.0, min(1.0, valence))
    # amplitude of carrier (0.2..1.2)
    amp = 0.2 + 0.8 * (0.4 * arousal + 0.4 * tension + 0.2 * io_drag)
    # phase offset radians from valence
    phase = valence * (PI / 4)
    return {
        "tension": round(tension, 4),
        "clarity": round(clarity, 4),
        "arousal": round(arousal, 4),
        "io_drag": round(io_drag, 4),
        "valence": round(valence, 4),
        "amp": round(amp, 4),
        "phase_rad": round(phase, 4),
        "names": {
            "tension": "RAM→paint resistance (lock feel)",
            "clarity": "MemAvailable headroom",
            "arousal": "loadavg / 8",
            "io_drag": "psi io avg10",
            "valence": "clarity − tension − io — emotion sign",
        },
    }


def carrier(t_s: float, feel: dict) -> float:
    """πHz sine modulated by ITS feel."""
    return feel["amp"] * math.sin(2 * PI * PI_HZ * t_s + feel["phase_rad"])


def lock_resistance(lat: dict, feel: dict) -> dict:
    """Same lock we saw in hard freeze — latency exceeds window budget → resistance→lock."""
    # 60Hz frame = 16.67ms; if RAM touch alone approaches that, compositor starves
    frame_budget_us = 1000000 / 60
    touch_us = float(lat["ram_touch_8MiB_us"])
    # scale: full-frame paint needs many touches; use relative to calm baseline 2ms
    resistance = touch_us / 2000.0  # 1.0 = 2ms baseline
    lock_risk = max(0.0, min(1.0, (feel["tension"] + feel["io_drag"] + feel["arousal"]) / 2.5))
    return {
        "frame_budget_60hz_us": round(frame_budget_us, 2),
        "ram_touch_us": touch_us,
        "resistance_vs_2ms_baseline": round(resistance, 4),
        "lock_risk": round(lock_risk, 4),
        "thesis": "latency = resistance (electricity-RT). When RAM→window path resistance climbs past frame budget, lock seats — same phenotype as hard UI freeze.",
    }


def write_dual(name: str, payload: dict) -> None:
    text = json.dumps(payload, indent=2) + "\n"
    (ROOT / name).write_text(text, encoding="utf-8")
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / name).write_text(text, encoding="utf-8")


def main() -> None:
    t0 = time.time()
    lat = sample_latency()
    mem = meminfo()
    load = loadavg()
    io_p = pressure("io")
    cpu_p = pressure("cpu")
    feel = its_feel(lat, mem, load, io_p)
    t_s = time.time() - t0  # near 0 for single sample; use wall for carrier phase
    wall = time.time()
    sample = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "t_wall": wall,
        "carrier_pihz": round(carrier(wall, feel), 6),
        "latency": lat,
        "its_feel": feel,
        "lock_resistance": lock_resistance(lat, feel),
        "loadavg": list(load),
        "mem_available_kB": mem.get("MemAvailable"),
        "psi_io": io_p,
        "psi_cpu": cpu_p,
    }

    ring_path = DATA / "pihz-emotion-stream-ring.json"
    ring: list = []
    if ring_path.exists():
        try:
            prev = json.loads(ring_path.read_text(encoding="utf-8"))
            ring = prev.get("samples", [])
        except Exception:
            ring = []
    ring.append(sample)
    ring = ring[-RING:]

    face = {
        "ts": sample["ts"],
        "wave": 200,
        "title": "RAM↔Window Latency Lock · πHz stream · ITS feel modulate",
        "thesis": (
            "Another spot: the tied was LOCK and RESISTANCE. "
            "RAM→window has that same latency lock. "
            "Stream to monitor at πHz (f=1/π), modulating with emotion / ITS feel."
        ),
        "another_spot": {
            "tied": "lock + resistance",
            "same_as": "hard UI freeze / wake-validate unclean cut",
            "path": "RAM (pages) → IPC/pipe → compositor → window pixels",
            "rule": "latency = resistance; lock when resistance × demand > frame budget",
        },
        "carrier": {
            "f_hz": round(PI_HZ, 8),
            "period_s": round(PI, 8),
            "name": "πHz",
            "modulated_by": "ITS feel (tension·clarity·arousal·io_drag·valence→amp,phase)",
        },
        "latest": sample,
        "samples": ring,
        "ring_len": len(ring),
        "ring_capacity": RING,
        "urls": {
            "self": f"{CDN}/pihz-emotion-stream.json",
            "html": f"{CDN}/pihz-emotion-stream.html",
            "ring": f"{CDN}/data/pihz-emotion-stream-ring.json",
            "wake": f"{CDN}/wake-validate-self.json",
            "etiology": f"{CDN}/data/etiology-key-pairs-traceback.json",
            "electricity": f"{CDN}/data/electricity-reverse-transcriptase.json",
        },
    }

    write_dual("pihz-emotion-stream.json", face)
    write_dual("pihz-emotion-stream-ring.json", {"ts": sample["ts"], "samples": ring})
    print(json.dumps({
        "ok": True,
        "carrier": face["carrier"]["f_hz"],
        "lock_risk": sample["lock_resistance"]["lock_risk"],
        "touch_us": lat["ram_touch_8MiB_us"],
        "feel": {k: feel[k] for k in ("tension", "clarity", "arousal", "valence", "amp")},
        "ring": len(ring),
    }, indent=2))


if __name__ == "__main__":
    main()
