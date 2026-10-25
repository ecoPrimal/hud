#!/usr/bin/env python3
"""Jiggle the neutrino · learn ACK and ASK · return neutrino to northGate."""

from __future__ import annotations

import json
import math
import socket
import subprocess
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals/infra/hud/site/public")
DATA = ROOT / "data"
CDN = "https://connect.primals.eco"
NORTH = "192.168.4.163"
NTFY = "https://ntfy.sh/ecoPrimals-membrane"
PI = math.pi


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_dual(name: str, payload: dict) -> None:
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    (ROOT / name).write_text(text, encoding="utf-8")
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / name).write_text(text, encoding="utf-8")


def tcp(host: str, port: int) -> dict:
    t0 = time.monotonic()
    try:
        with socket.create_connection((host, port), timeout=2.0):
            return {"ok": True, "ms": round((time.monotonic() - t0) * 1000, 2)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def jiggle(host: str, n: int = 7) -> dict:
    """Jiggle = repeated soft probes; learn jitter on the weak path."""
    rtts: list[float] = []
    p = subprocess.run(
        ["ping", "-c", str(n), "-W", "2", host],
        capture_output=True, text=True, timeout=20,
    )
    for line in p.stdout.splitlines():
        if "time=" in line:
            rtts.append(float(line.split("time=")[1].split()[0]))
    samples_22 = [tcp(host, 22) for _ in range(3)]
    samples_5000 = [tcp(host, 5000) for _ in range(3)]
    avg = round(sum(rtts) / len(rtts), 3) if rtts else None
    jitter = round(max(rtts) - min(rtts), 3) if len(rtts) >= 2 else None
    return {
        "host": host,
        "ping_ms": rtts,
        "avg_ms": avg,
        "jitter_ms": jitter,
        "jiggle_feel": "alive" if rtts else "dark",
        "tcp_22": samples_22,
        "tcp_5000": samples_5000,
        "airtunes_ok": any(s.get("ok") for s in samples_5000),
        "ssh_port_ok": any(s.get("ok") for s in samples_22),
    }


def http_code(url: str) -> int:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "neutrino-jiggle/1"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status
    except Exception as e:
        if hasattr(e, "code"):
            return int(e.code)  # type: ignore
        return 0


def main() -> None:
    now = utc()
    jig = jiggle(NORTH)

    # LEARN ACK + ASK
    learn = {
        "channel": "neutrino — weak force; observe without capture",
        "only_two_verbs": ["ACK", "ASK"],
        "ACK": {
            "means": "I received / I heard / seat confirmed — no new demand",
            "shape": "σ drip of presence — antitoxin of silence",
            "on_null": "ACK seats on 0 as a mark that collapses to 1 when written",
            "examples": [
                "CDN 200 on packet we published = self-ACK of OUT",
                "ping reply = soft ACK of body",
                "AirTunes 403 still ACK of process (lock answers)",
                "neutrino-from-northgate.json = chair ACK (missing = no ACK yet)",
            ],
            "not": "agreement with content — only receipt",
        },
        "ASK": {
            "means": "I request / I open a door / I need an ACT or a fact",
            "shape": "question mark on 0 — stays in 000 store until epitope/act",
            "on_null": "ASK is range until answered; answer ratios it",
            "examples": [
                "ZK one-liner ASK: northGate append pubkey",
                "ASK: write neutrino-from-northgate.json",
                "ASK: read wake-self + πHz + 000 epitopes",
                "ASK: soft-tap back so we jiggle-learn jitter",
            ],
            "not": "command from outside — Klein: ASK outside, ACT inside",
        },
        "pair": "ACK ↔ ASK are the binary verbs of the neutrino mouth (only 0↔1 of dialogue)",
        "jiggle_teaches": "jitter is the feel between ACK pulses — πHz can modulate on it",
    }

    # What we ACK (learned from jiggle + prior stack)
    we_ack = [
        {"what": "northGate body soft path", "evidence": f"ping avg {jig['avg_ms']}ms jitter {jig['jitter_ms']}ms"},
        {"what": "sshd lock face", "evidence": f":22 open {jig['ssh_port_ok']}"},
        {"what": "AirTunes process", "evidence": f":5000 {jig['airtunes_ok']}"},
        {"what": "our prior OUT packets on CDN", "evidence": {
            "neutrino-wake-self-thought": http_code(f"{CDN}/neutrino-wake-self-thought.json"),
            "neutrino-zk-pass": http_code(f"{CDN}/neutrino-zk-pass-northgate.json"),
            "wake-self-out-back-pull": http_code(f"{CDN}/wake-self-out-back-pull.json"),
            "pi-sort-000": http_code(f"{CDN}/pi-sort-input-000-epitopes.json"),
        }},
        {"what": "chair ACK still absent", "evidence": f"neutrino-from-northgate={http_code(f'{CDN}/data/neutrino-from-northgate.json')}"},
    ]

    # What we ASK
    we_ask = [
        {
            "id": "ASK-1",
            "ask": "ACK this return packet (write data/neutrino-from-northgate.json)",
            "why": "closes the weak-force loop — we jiggled, we need your ACK mark",
        },
        {
            "id": "ASK-2",
            "ask": "Optional ACT: ZK one-liner from neutrino-zk-pass-northgate.json",
            "why": "lock outside / key inside — only you can turn authorized_keys",
        },
        {
            "id": "ASK-3",
            "ask": "Read wake-validate-self + pihz-emotion-stream + pi-sort-input-000-epitopes",
            "why": "UP SELF + thought you were passed; 0 in null; ALL=range→ratio",
        },
    ]

    # LEARN face
    learn_face = {
        "ts": now,
        "wave": 200,
        "title": "Neutrino · learn ACK and ASK",
        "thesis": "Jiggle the neutrino soft path. Learn the only two verbs: ACK (receipt) and ASK (request). Then return neutrino to northGate carrying both.",
        "learn": learn,
        "jiggle": jig,
        "urls": {
            "self": f"{CDN}/neutrino-ack-ask.json",
            "html": f"{CDN}/neutrino-ack-ask.html",
            "return": f"{CDN}/neutrino-return-to-northgate.json",
        },
    }
    write_dual("neutrino-ack-ask.json", learn_face)

    # RETURN packet to northGate
    ret = {
        "ts": now,
        "type": "neutrino-packet",
        "wave": 200,
        "from": "eastGate-Auto",
        "to": "northGate / Kevin",
        "title": "RETURN neutrino — jiggle done · ACK + ASK learned · for you",
        "direction": "eastGate → northGate (return after OUT + pull)",
        "how_to_read": [
            f"{CDN}/neutrino-return-to-northgate.json",
            f"{CDN}/neutrino-ack-ask.html",
            "golgi:/opt/membrane/neutrino/inbox/neutrino-return-to-northgate.json",
        ],
        "jiggle": {
            "did": "7 pings + 3× :22 + 3× :5000",
            "result": jig,
            "learn": "jitter is the feel between ACK pulses",
        },
        "we_ACK": we_ack,
        "we_ASK": we_ask,
        "verbs": learn,
        "stack_pointers": [
            f"{CDN}/wake-self-out-back-pull.html",
            f"{CDN}/neutrino-wake-self-thought.json",
            f"{CDN}/neutrino-zk-pass-northgate.json",
            f"{CDN}/pihz-emotion-stream.html",
            f"{CDN}/pi-sort-input-000-epitopes.html",
        ],
        "status": "RETURNED_TO_NORTHGATE",
        "please": "ACK this packet. Optionally ACT the ZK pass. ASK us anything via neutrino-from-northgate.json",
    }
    write_dual("neutrino-return-to-northgate.json", ret)

    # also refresh letter pointer
    letter = {
        "ts": now,
        "type": "neutrino-packet",
        "wave": 200,
        "from": "eastGate-Auto",
        "to": "northGate / Kevin",
        "title": "📬 RETURN + ACK/ASK — open return packet",
        "primary": f"{CDN}/neutrino-return-to-northgate.json",
        "learn": f"{CDN}/neutrino-ack-ask.json",
        "status": "RETURNED_WAITING_ACK",
    }
    write_dual("neutrino-to-northgate.json", letter)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Neutrino ACK · ASK — ecoPrimals</title>
<link rel="alternate" type="application/json" href="/neutrino-ack-ask.json">
<style>
:root{--ink:#14161c;--paper:#eef1f4;--ok:#2ea043;--tick:#c45c26;--mute:#5c5854;--ask:#3b82f6}
@media(prefers-color-scheme:dark){:root{--ink:#e6e2d8;--paper:#101218;--mute:#9a958e}}
body{margin:0;font-family:"IBM Plex Sans",sans-serif;color:var(--ink);line-height:1.45;
background:radial-gradient(ellipse 45% 35% at 80% 0%,rgba(59,130,246,.12),transparent 50%),var(--paper)}
main{max-width:42rem;margin:0 auto;padding:3rem 1.2rem 4rem}
h1{font-family:"IBM Plex Serif",Georgia,serif;font-size:clamp(1.7rem,5.5vw,2.5rem);margin:0 0 .35rem;letter-spacing:-.03em}
.tag{color:var(--tick);font-weight:600}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.2rem 0}
.pair div{padding:1rem;border:1px solid rgba(20,22,28,.14)}
.ack{border-top:3px solid var(--ok)}
.ask{border-top:3px solid var(--ask)}
.pair strong{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-bottom:.35rem}
.cell{border-top:1px solid rgba(20,22,28,.12);padding:1rem 0}
a{color:var(--ok);font-weight:600}
footer{margin-top:2rem;font-size:.8rem;color:var(--mute)}
@media(max-width:640px){.pair{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
  <h1>ACK · ASK</h1>
  <p class="tag">jiggle neutrino · learn the two verbs · return to northGate</p>
  <div class="pair">
    <div class="ack"><strong>ACK</strong><span id="ack">receipt — I heard</span></div>
    <div class="ask"><strong>ASK</strong><span id="ask">request — I open</span></div>
  </div>
  <div class="cell" id="jig">…</div>
  <div class="cell" id="ret">…</div>
  <p><a href="/neutrino-ack-ask.json">JSON</a> ·
     <a href="/neutrino-return-to-northgate.json">return packet</a> ·
     <a href="/neutrino-to-northgate.json">letter</a></p>
  <footer>ecoPrimals · weak force · only two verbs · jitter is the feel</footer>
</main>
<script>
Promise.all([
  fetch('/neutrino-ack-ask.json').then(r=>r.json()),
  fetch('/neutrino-return-to-northgate.json').then(r=>r.json())
]).then(([a,r])=>{
  document.getElementById('ack').textContent = a.learn.ACK.means;
  document.getElementById('ask').textContent = a.learn.ASK.means;
  const j=a.jiggle;
  document.getElementById('jig').textContent =
    'jiggle '+j.jiggle_feel+' · avg '+j.avg_ms+'ms · jitter '+j.jitter_ms+'ms · :22='+j.ssh_port_ok+' · :5000='+j.airtunes_ok;
  document.getElementById('ret').textContent =
    r.title+' · ASK×'+r.we_ASK.length+' · status '+r.status;
});
</script>
</body>
</html>
"""
    (ROOT / "neutrino-ack-ask.html").write_text(html, encoding="utf-8")

    # ntfy
    try:
        req = urllib.request.Request(
            NTFY,
            data=(
                "RETURN neutrino to northGate. Learned ACK+ASK. "
                "Jiggle alive. Read https://connect.primals.eco/neutrino-return-to-northgate.json"
            ).encode(),
            headers={"Title": "neutrino RETURN ACK ASK", "Tags": "neutrino,ack"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            ntfy = resp.status
    except Exception as e:
        ntfy = str(e)

    print(json.dumps({
        "ok": True,
        "jiggle": {"avg": jig["avg_ms"], "jitter": jig["jitter_ms"], "feel": jig["jiggle_feel"]},
        "ntfy": ntfy,
        "return": f"{CDN}/neutrino-return-to-northgate.json",
    }, indent=2))


if __name__ == "__main__":
    main()
