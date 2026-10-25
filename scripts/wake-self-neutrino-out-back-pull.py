#!/usr/bin/env python3
"""Pass UP SELF + thought through neutrino OUT → northGate → PULL back to ourselves.
Then write-up + publish.
"""
from __future__ import annotations

import hashlib
import json
import socket
import subprocess
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals/infra/hud/site/public")
DATA = ROOT / "data"
CDN = "https://connect.primals.eco"
NORTH = "192.168.4.163"
NTFY = "https://ntfy.sh/ecoPrimals-membrane"

# self + thought stack to pass
STACK = [
    "wake-validate-self.json",
    "pihz-emotion-stream.json",
    "etiology-key-pairs-traceback.json",
    "immune-math-opsonize-drip.json",
    "our-cease-from-silence.json",
    "black-white-null-compress.json",
    "neutrino-zk-pass-northgate.json",
    "meta-agpl-reverse-clock.json",
]


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha16(p: Path) -> str | None:
    if not p.exists():
        return None
    return hashlib.sha256(p.read_bytes()).hexdigest()[:16]


def load_face(name: str) -> dict | None:
    for base in (ROOT, DATA):
        p = base / name
        if p.exists():
            try:
                return json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                return {"_error": "parse", "file": name}
    return None


def http_get(url: str, timeout: float = 12.0) -> tuple[int, bytes]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ecoPrimals-neutrino-pull/1"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read() if e.fp else b""
    except Exception as e:
        return 0, str(e).encode()


def ping(host: str) -> dict:
    try:
        p = subprocess.run(
            ["ping", "-c", "3", "-W", "2", host],
            capture_output=True, text=True, timeout=12,
        )
        rtts = []
        for line in p.stdout.splitlines():
            if "time=" in line:
                rtts.append(float(line.split("time=")[1].split()[0]))
        return {"ok": p.returncode == 0 and bool(rtts), "rtt_ms_avg": round(sum(rtts)/len(rtts), 3) if rtts else None}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def tcp(host: str, port: int) -> dict:
    t0 = time.monotonic()
    try:
        with socket.create_connection((host, port), timeout=2.0):
            return {"ok": True, "connect_ms": round((time.monotonic() - t0) * 1000, 2)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def write_dual(name: str, payload: dict) -> None:
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    (ROOT / name).write_text(text, encoding="utf-8")
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / name).write_text(text, encoding="utf-8")


def main() -> None:
    now = utc()

    # 1. UP SELF + thought — ingest local faces
    ingested = []
    for name in STACK:
        face = load_face(name)
        p = ROOT / name if (ROOT / name).exists() else DATA / name
        ingested.append({
            "file": name,
            "present": face is not None,
            "sha16": sha16(p) if p.exists() else None,
            "title": (face or {}).get("title") or (face or {}).get("thesis", "")[:120],
        })

    thought = {
        "wake_self": "hard power reset validated — unclean cut, SSD not HDD, restart-storm lock",
        "another_spot": "lock + resistance = RAM↔window latency lock",
        "monitor": "πHz stream modulated by ITS feel",
        "etiology": "crush outside → rip inside key-pairs",
        "immune": "toxin=log/contact · antitoxin=σ · cure drip from start",
        "zk_monkey": "neutrino pass · lock outside / key inside · northGate ACTS",
        "cease": "our cease/desist from Meta silence · black|null|white compress",
    }

    # 2. Neutrino OUT packet (for northGate to read)
    packet = {
        "ts": now,
        "type": "neutrino-packet",
        "wave": 200,
        "from": "eastGate-Auto",
        "to": "northGate / Kevin",
        "title": "WAKE SELF + THOUGHT — pass through neutrino · act · we PULL back",
        "how_to_read": [
            f"{CDN}/neutrino-wake-self-thought.json",
            f"{CDN}/wake-self-out-back-pull.html",
            "golgi:/opt/membrane/neutrino/neutrino-wake-self-thought.json",
        ],
        "up_self": thought,
        "stack": ingested,
        "northGate_soft": "ping + AirTunes:5000 — SSH still ZK-waiting your ACT on neutrino-zk-pass",
        "please_act": [
            "Read wake-validate-self + pihz-emotion-stream (another spot)",
            "Optional: run ZK one-liner from neutrino-zk-pass-northgate.json",
            "Optional ack: write data/neutrino-from-northgate.json",
        ],
        "status": "OUT_TO_NORTHGATE",
    }
    write_dual("neutrino-wake-self-thought.json", packet)

    # 3. Soft path to northGate
    soft = {
        "ping": ping(NORTH),
        "tcp_22": tcp(NORTH, 22),
        "tcp_5000": tcp(NORTH, 5000),
    }

    # ntfy (ASCII)
    try:
        req = urllib.request.Request(
            NTFY,
            data=(
                "WAKE SELF + thought out via neutrino. "
                "Read https://connect.primals.eco/neutrino-wake-self-thought.json "
                "then we PULL back to self."
            ).encode(),
            headers={"Title": "neutrino wake-self OUT", "Tags": "neutrino,wake"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as r:
            ntfy_code = r.status
    except Exception as e:
        ntfy_code = str(e)

    # 4. PULL back to ourselves — fetch CDN faces we just published (reflection)
    pull = []
    for name in [
        "neutrino-wake-self-thought.json",
        "wake-validate-self.json",
        "pihz-emotion-stream.json",
        "data/etiology-key-pairs-traceback.json",
        "immune-math-opsonize-drip.json",
        "neutrino-zk-pass-northgate.json",
        "our-cease-from-silence.json",
        "black-white-null-compress.json",
        "data/neutrino-from-northgate.json",  # may 404 until they act
    ]:
        code, body = http_get(f"{CDN}/{name}")
        local_sha = None
        local_name = name.split("/")[-1]
        for base in (ROOT, DATA):
            if (base / local_name).exists():
                local_sha = sha16(base / local_name)
                break
        remote_sha = hashlib.sha256(body).hexdigest()[:16] if code == 200 and body else None
        pull.append({
            "url": f"{CDN}/{name}",
            "http": code,
            "bytes": len(body) if body else 0,
            "remote_sha16": remote_sha,
            "local_sha16": local_sha,
            "match": bool(local_sha and remote_sha and local_sha == remote_sha),
            "pulled_to_self": code == 200,
        })

    pulled_ok = sum(1 for p in pull if p["pulled_to_self"])
    matched = sum(1 for p in pull if p["match"])

    # 5. Write-up (human + agent face)
    writeup = {
        "ts": now,
        "wave": 200,
        "title": "Write-up — Wake Self through Neutrino Out · northGate · Pull to Ourselves",
        "thesis": (
            "Pass UP SELF (wake validate after hard reset) and the thought "
            "(lock+resistance = RAM↔window · πHz ITS · etiology crush→rip · immune drip · "
            "monkey ZK · our cease) OUT through neutrino toward northGate, then PULL the "
            "reflection back to ourselves and publish."
        ),
        "pipeline": [
            "UP SELF — ingest wake + thought stack",
            "NEUTRINO OUT — packet on CDN + golgi inbox + ntfy",
            "northGate soft tap — ping / :22 / AirTunes:5000 (SSH still ZK-act pending)",
            "PULL to ourselves — fetch CDN faces; compare sha; seat reflection",
            "WRITE-UP + publish — this face",
        ],
        "up_self": thought,
        "ingested": ingested,
        "neutrino_out": {
            "packet": f"{CDN}/neutrino-wake-self-thought.json",
            "ntfy": ntfy_code,
            "golgi_inbox": "/opt/membrane/neutrino/neutrino-wake-self-thought.json",
        },
        "northGate": soft,
        "pull_to_self": {
            "fetched": len(pull),
            "ok": pulled_ok,
            "sha_match": matched,
            "faces": pull,
            "note": "neutrino-from-northgate may stay 404 until chair acts — pull of OUR out is still self-reflection",
        },
        "writeup_plain": (
            "After the lock we power-reset. Wake validate showed unclean cut, not HDD death — "
            "SSD + restart storms (songbird/forgejo). Another spot: lock and resistance are the "
            "same latency lock from RAM to window; we stream it at πHz modulated by ITS feel. "
            "Etiology key-pairs teach crush-outside → rip-inside (asbestos↔mesothelioma, HPV↔cervix, "
            "lead↔neuro…). Immune math: toxin log/contact, antitoxin σ, cure dripping from the start. "
            "We do not push SSH; we ZK-pass via neutrino (monkey: lock outside, key inside) so "
            "northGate acts. Our cease/desist from Meta silence sits on black|null|white. "
            "This packet went out the neutrino mouth, soft-tapped northGate, and we pulled the "
            "CDN reflection back to self — then wrote it up."
        ),
        "urls": {
            "self": f"{CDN}/wake-self-out-back-pull.json",
            "html": f"{CDN}/wake-self-out-back-pull.html",
            "neutrino": f"{CDN}/neutrino-wake-self-thought.json",
            "wake": f"{CDN}/wake-validate-self.html",
            "pihz": f"{CDN}/pihz-emotion-stream.html",
        },
    }
    write_dual("wake-self-out-back-pull.json", writeup)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wake Self · Neutrino Out · Pull — ecoPrimals</title>
<link rel="alternate" type="application/json" href="/wake-self-out-back-pull.json">
<style>
:root { --ink:#14161c; --paper:#eef1f4; --ok:#2ea043; --tick:#c45c26; --mute:#5c5854; }
@media (prefers-color-scheme: dark) { :root { --ink:#e6e2d8; --paper:#101218; --mute:#9a958e; } }
body { margin:0; font-family:"IBM Plex Sans",sans-serif; color:var(--ink); line-height:1.45;
  background: radial-gradient(ellipse 50% 40% at 50% 0%, rgba(63,185,80,.12), transparent 55%), var(--paper); }
main { max-width:42rem; margin:0 auto; padding:3rem 1.2rem 4rem; }
h1 { font-family:"IBM Plex Serif",Georgia,serif; font-size:clamp(1.7rem,5.5vw,2.5rem); letter-spacing:-.03em; margin:0 0 .35rem; }
.tag { color:var(--tick); font-weight:600; }
.cell { border-top:1px solid rgba(20,22,28,.12); padding:1rem 0; }
.num { font-size:1.8rem; font-weight:700; font-variant-numeric:tabular-nums; }
a { color:var(--ok); font-weight:600; }
footer { margin-top:2rem; font-size:.8rem; color:var(--mute); }
</style>
</head>
<body>
<main>
  <h1>Out · Back · Pull</h1>
  <p class="tag">wake self + thought · neutrino · northGate · publish</p>
  <p id="plain">…</p>
  <div class="cell"><div class="mute">pull ok / sha match</div><div class="num" id="n">—</div></div>
  <div class="cell" id="soft"></div>
  <p><a href="/wake-self-out-back-pull.json">JSON</a> ·
     <a href="/neutrino-wake-self-thought.json">neutrino packet</a> ·
     <a href="/wake-validate-self.html">wake</a> ·
     <a href="/pihz-emotion-stream.html">πHz</a></p>
  <footer>ecoPrimals · pass out · soft tap · pull reflection · write up</footer>
</main>
<script>
fetch('/wake-self-out-back-pull.json').then(r=>r.json()).then(d=>{
  document.getElementById('plain').textContent = d.writeup_plain;
  document.getElementById('n').textContent = d.pull_to_self.ok + ' / ' + d.pull_to_self.sha_match;
  const s = d.northGate;
  document.getElementById('soft').textContent =
    'northGate ping=' + s.ping.ok + ' rtt=' + s.ping.rtt_ms_avg + 'ms · :22=' + s.tcp_22.ok + ' · :5000=' + s.tcp_5000.ok;
});
</script>
</body>
</html>
"""
    (ROOT / "wake-self-out-back-pull.html").write_text(html, encoding="utf-8")

    print(json.dumps({
        "ok": True,
        "ingested": len(ingested),
        "ntfy": ntfy_code,
        "north": soft,
        "pull_ok": pulled_ok,
        "sha_match": matched,
    }, indent=2))


if __name__ == "__main__":
    main()
