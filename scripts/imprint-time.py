#!/usr/bin/env python3
"""Imprint every TIME we see onto the t-plane (routing × efficiency).

t TIME is the x/y plane:
  x = channel  (cloudflare | github | membrane | local | forgejo | connect)
  y = phase    (build | push | switch_in | switch_out | route | deploy | probe | reincarnate | …)
  t = when     (UTC ISO — the point on the plane)

Usage:
  imprint-time.py --channel membrane --phase probe --note "forgejo anoxic"
  imprint-time.py --scan   # harvest live clocks + last git + HTTP dates
"""
from __future__ import annotations

import argparse
import json
import subprocess
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
PLANE = DATA / "t-plane.json"
IMPRINTS = DATA / "time-imprints.json"
JSONL = DATA / "time-imprints.jsonl"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_imprints() -> dict:
    if IMPRINTS.exists():
        return json.loads(IMPRINTS.read_text())
    return {
        "ts": utc_now(),
        "title": "Time Imprints — every t we see on the routing/efficiency plane",
        "doctrine": "ALL times observed are imprinted. t TIME is the x/y plane.",
        "axes": {
            "x": "channel",
            "y": "phase",
            "t": "when (UTC) — the point",
        },
        "imprints": [],
    }


def append(channel: str, phase: str, note: str = "", extra: dict | None = None) -> dict:
    mono = time.monotonic()
    wall = time.time()
    row = {
        "t": utc_now(),
        "epoch": wall,
        "monotonic": mono,
        "x_channel": channel,
        "y_phase": phase,
        "note": note,
        "extra": extra or {},
    }
    doc = load_imprints()
    doc["imprints"].append(row)
    doc["ts"] = row["t"]
    doc["count"] = len(doc["imprints"])
    # efficiency hint: Δt since previous same channel
    prev = next(
        (i for i in reversed(doc["imprints"][:-1]) if i["x_channel"] == channel),
        None,
    )
    if prev:
        row["dt_same_channel_s"] = round(wall - prev["epoch"], 3)
    IMPRINTS.write_text(json.dumps(doc, indent=2) + "\n")
    with JSONL.open("a") as f:
        f.write(json.dumps(row) + "\n")
    return row


def write_plane(doc: dict) -> None:
    # project last N onto plane summary
    recent = doc["imprints"][-64:]
    channels = sorted({r["x_channel"] for r in recent})
    phases = sorted({r["y_phase"] for r in recent})
    # routing efficiency: membrane/connect vs cloudflare discarnate ratio
    n = len(recent) or 1
    by_ch = {}
    for r in recent:
        by_ch[r["x_channel"]] = by_ch.get(r["x_channel"], 0) + 1
    plane = {
        "ts": utc_now(),
        "title": "t TIME = x/y plane for routing & efficiency",
        "doctrine": {
            "rule": "Every time we see is imprinted — build, push, switch in/out, Cloudflare, GitHub, membrane.",
            "x": "channel — where the event routes (cloudflare | github | membrane | local | forgejo | connect)",
            "y": "phase — what kind of act (build | push | switch_in | switch_out | route | deploy | probe | …)",
            "t": "the coordinate — UTC instant. Efficiency = work / Δt along a path on this plane.",
            "why": "Routing choices become visible as trajectories. Shell-wait = long Δt on forgejo. Reincarnate = jump github when forgejo path stalls.",
        },
        "axes": {"x": "channel", "y": "phase", "metric": "t + dt"},
        "channels_seen": channels,
        "phases_seen": phases,
        "recent_count": len(recent),
        "total_imprints": doc.get("count", len(doc["imprints"])),
        "channel_histogram": by_ch,
        "routing_read": {
            "prefer_short_dt": "github + membrane/connect over forgejo when dt explodes",
            "cloudflare_discarnate": "long gap between push and hud 200 = Pages intercept",
            "membrane_oxic": "connect/golgi short dt = inside fountain",
        },
        "urls": {
            "self": "https://connect.primals.eco/t-plane.json",
            "imprints": "https://connect.primals.eco/time-imprints.json",
            "jsonl": "https://connect.primals.eco/time-imprints.jsonl",
        },
        "last": recent[-1] if recent else None,
    }
    PLANE.write_text(json.dumps(plane, indent=2) + "\n")


def scan() -> None:
    """Harvest times we can see right now."""
    append("local", "probe", "wall+monotonic+tz harvest", {
        "utc": utc_now(),
        "epoch": time.time(),
        "monotonic": time.monotonic(),
    })
    try:
        from zoneinfo import ZoneInfo
        zones = {}
        for z in ["America/Detroit", "UTC", "Europe/Paris", "Asia/Tokyo"]:
            zones[z] = datetime.now(ZoneInfo(z)).isoformat()
        append("local", "probe", "multizone clocks", {"zones": zones})
    except Exception as e:
        append("local", "probe", f"zoneinfo fail: {e}")

    for repo, ch in [
        (ROOT / "infra/hud", "github"),
        (ROOT / "infra/sporePrint", "github"),
    ]:
        try:
            out = subprocess.check_output(
                ["git", "-C", str(repo), "log", "-1", "--format=%cI|%h|%s"],
                text=True,
            ).strip()
            ci, h, s = out.split("|", 2)
            append("github", "push", f"{repo.name} HEAD", {"commit_time": ci, "hash": h, "subject": s})
        except Exception as e:
            append("github", "probe", f"{repo.name} fail {e}")

    for url, ch in [
        ("https://connect.primals.eco/outside-us-self-crunch.json", "connect"),
        ("https://connect.primals.eco/t-plane.json", "connect"),
        ("https://hud.primals.eco/data/velocity-acceleration-instruments.json", "cloudflare"),
        ("https://hud.primals.eco/data/incarnation-spectrum.json", "cloudflare"),
        ("https://sporeprint.primals.eco/", "cloudflare"),
    ]:
        try:
            req = urllib.request.Request(url, method="HEAD")
            with urllib.request.urlopen(req, timeout=10) as r:
                append(ch, "probe", url, {
                    "http_date": r.headers.get("Date"),
                    "last_modified": r.headers.get("Last-Modified"),
                    "status": r.status,
                    "metal": r.headers.get("X-Membrane-Metal"),
                    "fold": r.headers.get("X-Membrane-Fold"),
                })
        except Exception as e:
            append(ch, "probe", f"FAIL {url}", {"error": type(e).__name__, "detail": str(e)[:160]})

    # forgejo gas
    import socket
    s = socket.socket()
    s.settimeout(3)
    try:
        s.connect(("git.primals.eco", 2222))
        append("forgejo", "probe", "oxic :2222")
        s.close()
    except Exception:
        append("forgejo", "probe", "anoxic :2222")


def seed_wave200() -> None:
    """Imprint today's known routing events onto the plane."""
    events = [
        ("membrane", "build", "Paper 139 written + zola on golgi"),
        ("github", "push", "sporePrint org Paper 139"),
        ("github", "push", "hud reincarnate PORT commits"),
        ("forgejo", "switch_out", "deincarnate — anoxic shell-wait culprit"),
        ("connect", "deploy", "transcarnate feeds to /opt/connect"),
        ("membrane", "route", "Caddy @hud + /opt/hud/public mirror"),
        ("cloudflare", "route", "tunnel DNS claim hud+sporeprint — Pages still intercepts"),
        ("cloudflare", "switch_out", "wrangler unauthed — fountain not via CLI"),
        ("membrane", "switch_in", "PORT spectrum un/de/pre/in/re/trans/con/dis"),
        ("connect", "deploy", "outside-us-self-crunch live"),
        ("local", "probe", "t-plane doctrine activated — all times imprinted"),
    ]
    for ch, ph, note in events:
        append(ch, ph, note, {"seed": "wave200"})


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--channel", "-x")
    ap.add_argument("--phase", "-y")
    ap.add_argument("--note", "-n", default="")
    ap.add_argument("--scan", action="store_true")
    ap.add_argument("--seed", action="store_true")
    args = ap.parse_args()
    DATA.mkdir(parents=True, exist_ok=True)
    if args.seed:
        seed_wave200()
    if args.scan:
        scan()
    if args.channel and args.phase:
        append(args.channel, args.phase, args.note)
    if not (args.seed or args.scan or (args.channel and args.phase)):
        ap.error("need --seed, --scan, and/or --channel/--phase")
    doc = load_imprints()
    write_plane(doc)
    print(json.dumps({"count": doc.get("count"), "last": doc["imprints"][-1]}, indent=2))


if __name__ == "__main__":
    main()
