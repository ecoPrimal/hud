#!/usr/bin/env python3
"""Sense SELF — local computer CNS + PNS (this keyboard, that mouse).

Presence / anatomy / power only — NEVER reads key contents or mouse deltas.
AC/DC stabilized → we can feel the body's nerves again.
"""
from __future__ import annotations

import json
import os
import platform
import re
import socket
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
OUT = ROOT / "infra/hud/site/public/data/local-cns-pns.json"
HTML_OUT = ROOT / "infra/hud/site/public/local-cns-pns.html"

# CNS = brain / cord / autonomic board
CNS_NAME_RX = re.compile(
    r"Power Button|Sleep Button|Lid Switch|Video Bus|HDA |HDMI|ACPI|PNP|WMI|rfkill|PC Speaker",
    re.I,
)
# PNS = extremities that poke the world
PNS_HINT_RX = re.compile(
    r"Keyboard|Mouse|Touchpad|Trackball|Joystick|Tablet|Receiver|Camera|Webcam",
    re.I,
)


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def run(cmd: list[str], timeout: float = 3.0) -> str:
    try:
        return subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=timeout)
    except Exception:
        return ""


def parse_input_devices() -> list[dict]:
    raw = Path("/proc/bus/input/devices").read_text(errors="replace") if Path("/proc/bus/input/devices").exists() else ""
    blocks = re.split(r"\n\n+", raw.strip()) if raw.strip() else []
    devices = []
    for b in blocks:
        name = re.search(r'^N: Name="([^"]+)"', b, re.M)
        phys = re.search(r"^P: Phys=(.+)$", b, re.M)
        handlers = re.search(r"^H: Handlers=(.+)$", b, re.M)
        bus = re.search(r"^I: Bus=(\w+)", b, re.M)
        vendor = re.search(r"Vendor=(\w+)", b)
        product = re.search(r"Product=(\w+)", b)
        if not name:
            continue
        n = name.group(1)
        h = (handlers.group(1) if handlers else "").strip()
        is_kbd = "kbd" in h.split() or bool(re.search(r"Keyboard", n, re.I))
        is_mouse = "mouse" in h.lower() or bool(re.search(r"Mouse|Touchpad", n, re.I))
        if CNS_NAME_RX.search(n) and not (is_kbd and "Wireless" in n):
            ns = "CNS"
            role = "autonomic" if re.search(r"Power|Sleep|Lid", n, re.I) else "cranial_board"
        elif is_kbd or is_mouse or PNS_HINT_RX.search(n):
            ns = "PNS"
            # name wins over noisy handlers (Logitech mice often list "kbd")
            if re.search(r"Keyboard", n, re.I):
                role = "THIS_keyboard"
            elif re.search(r"Mouse|Touchpad|Trackball", n, re.I):
                role = "THAT_mouse"
            elif is_kbd and is_mouse:
                role = "mixed_peripheral"
            elif is_kbd:
                role = "keyboardish"
            elif is_mouse:
                role = "pointer"
            else:
                role = "peripheral"
        else:
            ns = "PNS" if is_kbd or is_mouse else "CNS"
            role = "unclassified"
        devices.append({
            "name": n,
            "phys": phys.group(1).strip() if phys else None,
            "handlers": h,
            "bus": bus.group(1) if bus else None,
            "vendor": vendor.group(1) if vendor else None,
            "product": product.group(1) if product else None,
            "nervous_system": ns,
            "role": role,
            "is_keyboard": is_kbd,
            "is_mouse": is_mouse,
        })
    return devices


def sense_power() -> dict:
    supplies = []
    ps = Path("/sys/class/power_supply")
    if ps.exists():
        for d in sorted(ps.iterdir()):
            row = {"id": d.name}
            for f in ("type", "online", "status", "capacity", "technology", "scope"):
                p = d / f
                if p.exists():
                    row[f] = p.read_text().strip()
            supplies.append(row)
    kb = run(["upower", "-i", "/org/freedesktop/UPower/devices/keyboard_hidpp_battery_0"])
    kb_pct = None
    kb_state = None
    m = re.search(r"percentage:\s+(\d+)%", kb)
    if m:
        kb_pct = int(m.group(1))
    m = re.search(r"state:\s+(\w+)", kb)
    if m:
        kb_state = m.group(1)
    # AC vs DC: mains online vs battery discharging
    ac = any(s.get("type") == "Mains" and s.get("online") == "1" for s in supplies)
    bat = [s for s in supplies if s.get("type") == "Battery"]
    return {
        "supplies": supplies,
        "keyboard_battery_pct": kb_pct,
        "keyboard_battery_state": kb_state,
        "ac_present": ac,
        "dc_batteries": len(bat),
        "ac_dc_note": "AC=mains/line · DC=cells (keyboard pack, UPS). Stabilized heart → peripheral packs readable.",
    }


def sense_cns_core() -> dict:
    cpu = {}
    out = run(["lscpu"])
    for key, rx in [
        ("model", r"Model name:\s+(.+)"),
        ("cpus", r"^CPU\(s\):\s+(\d+)"),
        ("cores", r"Core\(s\) per socket:\s+(\d+)"),
        ("threads_per_core", r"Thread\(s\) per core:\s+(\d+)"),
    ]:
        m = re.search(rx, out, re.M)
        if m:
            cpu[key] = m.group(1).strip()
    mem = {}
    try:
        mi = Path("/proc/meminfo").read_text()
        for k in ("MemTotal", "MemAvailable"):
            m = re.search(rf"^{k}:\s+(\d+)", mi, re.M)
            if m:
                mem[k] = int(m.group(1)) * 1024
    except Exception:
        pass
    load = os.getloadavg() if hasattr(os, "getloadavg") else (0, 0, 0)
    return {
        "hostname": socket.gethostname(),
        "platform": platform.platform(),
        "cpu": cpu,
        "memory_bytes": mem,
        "loadavg": {"1m": load[0], "5m": load[1], "15m": load[2]},
        "role": "CNS — cortex (CPU) + CSF (RAM) + autonomic ACPI",
    }


def sense_nets() -> list[dict]:
    rows = []
    for line in run(["ip", "-br", "link"]).splitlines():
        parts = line.split()
        if len(parts) >= 2:
            rows.append({"if": parts[0], "state": parts[1], "nervous": "PNS_nerve" if parts[0] not in ("lo",) else "CNS_loop"})
    return rows


def sense_display() -> dict:
    xr = run(["xrandr", "--query"])
    connected = re.findall(r"^(\S+) connected(?: primary)? (\d+x\d+)", xr, re.M)
    return {
        "outputs": [{"name": n, "mode": m, "nervous": "PNS_eye"} for n, m in connected],
        "count": len(connected),
    }


def by_id_links() -> list[str]:
    p = Path("/dev/input/by-id")
    if not p.exists():
        return []
    return sorted(x.name for x in p.iterdir())


def main() -> None:
    devices = parse_input_devices()
    cns = [d for d in devices if d["nervous_system"] == "CNS"]
    pns = [d for d in devices if d["nervous_system"] == "PNS"]
    this_kbd = [d for d in pns if d["role"] == "THIS_keyboard" or (d["is_keyboard"] and "Keyboard" in d["name"])]
    that_mouse = [d for d in pns if d["role"] == "THAT_mouse" or (d["is_mouse"] and "Mouse" in d["name"])]

    doc = {
        "ts": utc(),
        "wave": 200,
        "title": "Local CNS/PNS — sense SELF (this keyboard, that mouse)",
        "privacy": "presence/anatomy/power only — no key contents, no mouse deltas, no clipboard",
        "thesis": "AC/DC stabilized → sense the local computer as body. CNS = CPU/ACPI/board. PNS = THIS keyboard, THAT mouse, eyes (display), nerves (NICs).",
        "host": sense_cns_core(),
        "power_ac_dc": sense_power(),
        "counts": {
            "input_devices": len(devices),
            "cns": len(cns),
            "pns": len(pns),
            "this_keyboard": len(this_kbd),
            "that_mouse": len(that_mouse),
        },
        "THIS_keyboard": this_kbd,
        "THAT_mouse": that_mouse,
        "cns_devices": cns,
        "pns_devices": pns,
        "input_by_id": by_id_links(),
        "nets": sense_nets(),
        "display": sense_display(),
        "homunculus": {
            "oversized": ["THIS_keyboard", "THAT_mouse"],
            "why": "cortical map: lips/hands huge — local input extremities dominate sensitivity",
            "code_homunculus": "infra/scripts/homunculus.py maps repo files; this maps MACHINE flesh",
        },
        "urls": {
            "self": "https://connect.primals.eco/local-cns-pns.json",
            "html": "https://connect.primals.eco/local-cns-pns.html",
            "code_map": "https://connect.primals.eco/homunculus-map.json",
            "ac_dc": "https://connect.primals.eco/electricity-reverse-transcriptase.json",
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, indent=2) + "\n")
    # root copy for connect static
    (OUT.parent.parent / "local-cns-pns.json").write_text(json.dumps(doc, indent=2) + "\n")

    # tiny HTML face
    kb_name = this_kbd[0]["name"] if this_kbd else "no keyboard seen"
    ms_name = that_mouse[0]["name"] if that_mouse else "no mouse seen"
    pct = doc["power_ac_dc"].get("keyboard_battery_pct")
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Local CNS/PNS — ecoPrimals</title>
<meta name="description" content="Sense SELF: local computer CNS and PNS — this keyboard, that mouse. Presence only.">
<link rel="alternate" type="application/json" href="/local-cns-pns.json">
<style>
  :root {{ --ink:#1a1814; --paper:#f2efe8; --cns:#2a4a6b; --pns:#6b3a2a; --mute:#6a6560; }}
  @media (prefers-color-scheme: dark) {{
    :root {{ --ink:#e8e4dc; --paper:#12141a; --cns:#8ab4d4; --pns:#d4a08a; --mute:#9a958e; }}
  }}
  body {{ margin:0; font-family:"IBM Plex Sans",sans-serif; background:
    radial-gradient(ellipse 60% 40% at 20% 0%, rgba(42,74,107,.15), transparent),
    radial-gradient(ellipse 50% 40% at 90% 100%, rgba(107,58,42,.12), transparent),
    var(--paper); color:var(--ink); line-height:1.45; }}
  main {{ max-width:40rem; margin:0 auto; padding:3rem 1.2rem 4rem; }}
  h1 {{ font-family:"IBM Plex Serif",Georgia,serif; font-size:clamp(2rem,7vw,3rem); letter-spacing:-.03em; margin:0 0 .4rem; }}
  .tag {{ color:var(--pns); font-weight:600; margin-bottom:1.2rem; }}
  .grid {{ display:grid; gap:.6rem; margin:1.25rem 0; }}
  .card {{ padding:.85rem 1rem; border-left:3px solid var(--cns); background:rgba(255,255,255,.35); }}
  .card.pns {{ border-color:var(--pns); }}
  .card strong {{ display:block; font-size:.8rem; text-transform:uppercase; letter-spacing:.06em; color:var(--mute); }}
  a {{ color:var(--cns); font-weight:600; }}
  footer {{ margin-top:2rem; font-size:.8rem; color:var(--mute); border-top:1px solid rgba(0,0,0,.12); padding-top:1rem; }}
  #live {{ font-variant-numeric:tabular-nums; }}
</style>
</head>
<body>
<main>
  <h1>Local CNS / PNS</h1>
  <p class="tag">sense SELF · AC/DC stable · presence only</p>
  <p>This machine has a cortex and extremities. We feel them without reading what you type.</p>
  <div class="grid">
    <div class="card pns"><strong>THIS keyboard</strong>{kb_name}<br><span id="kbbat">battery: {pct if pct is not None else "?"}%</span></div>
    <div class="card pns"><strong>THAT mouse</strong>{ms_name}</div>
    <div class="card"><strong>CNS cortex</strong><span id="cpu">…</span></div>
  </div>
  <p id="live"></p>
  <p><a href="/local-cns-pns.json">JSON</a> · <a href="/homunculus.html">code homunculus</a> · <a href="/pi-rate-set.html">π-rate</a></p>
  <footer>ecoPrimals · no keylogging · PNS = extremities · CNS = board/CPU/ACPI</footer>
</main>
<script>
fetch('/local-cns-pns.json').then(r=>r.json()).then(d=>{{
  const c=d.host&&d.host.cpu||{{}};
  document.getElementById('cpu').textContent=(c.model||'?')+' · '+(c.cpus||'?')+' threads';
  const p=d.power_ac_dc||{{}};
  document.getElementById('kbbat').textContent='battery: '+(p.keyboard_battery_pct??'?')+'% · '+(p.keyboard_battery_state||'');
  document.getElementById('live').textContent=
    `CNS ${{d.counts.cns}} · PNS ${{d.counts.pns}} · load ${{d.host.loadavg['1m']}} · ${{d.host.hostname}}`;
}}).catch(e=>{{ document.getElementById('live').textContent=String(e); }});
</script>
</body>
</html>
"""
    HTML_OUT.write_text(html)

    print(json.dumps({
        "host": doc["host"]["hostname"],
        "counts": doc["counts"],
        "THIS_keyboard": [d["name"] for d in this_kbd],
        "THAT_mouse": [d["name"] for d in that_mouse],
        "keyboard_battery_pct": doc["power_ac_dc"].get("keyboard_battery_pct"),
        "out": str(OUT),
    }, indent=2))


if __name__ == "__main__":
    main()
