#!/usr/bin/env python3
"""FULL SCAN → INGEST → through the NET to northGate → BACK TO SELF.

SSH still key-dark on northGate — Willis soft path:
  ICMP/WG echo · TCP:5000 poke · ntfy neutrino · CDN face northGate can read · fetch-back = self
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

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
PUB = ROOT / "infra/hud/site/public"
OUT = DATA / "scan-ingest-northgate-back-self.json"
HTML = PUB / "scan-ingest-northgate-back-self.html"

NORTHGATE_LAN = "192.168.4.163"
NORTHGATE_WG = "10.13.37.8"
NTFY_TOPIC = "NnzHoO3YqHze"
CDN = "https://connect.primals.eco/scan-ingest-northgate-back-self.json"

# crystal stack to scan+ingest
STACK = [
    "modality-faces.json",
    "pi-rate-set.json",
    "local-cns-pns.json",
    "wireless-tether-hypotenuse.json",
    "green-spectrum-pi-yoyo.json",
    "pi-null-axis-yoyo-plate.json",
    "zk-spectrum-nulls-uzk.json",
    "crystallized-for-humans.json",
    "chipmunk-song-live.json",
    "structure-tips.json",
    "ingest-chew-sort-structure.json",
]


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def run(cmd: list[str], timeout: float = 8.0) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except Exception as e:
        return 1, str(e)


def ping_rtt(host: str) -> dict:
    code, out = run(["ping", "-c", "3", "-W", "2", host], timeout=12)
    rtts = []
    for line in out.splitlines():
        if "time=" in line:
            try:
                rtts.append(float(line.split("time=")[1].split()[0]))
            except Exception:
                pass
    return {
        "host": host,
        "ok": code == 0 and bool(rtts),
        "rtt_ms_avg": round(sum(rtts) / len(rtts), 3) if rtts else None,
        "samples": rtts,
    }


def tcp_open(host: str, port: int, timeout: float = 1.5) -> dict:
    t0 = time.monotonic()
    try:
        with socket.create_connection((host, port), timeout=timeout):
            ms = (time.monotonic() - t0) * 1000
            return {"host": host, "port": port, "ok": True, "connect_ms": round(ms, 2)}
    except Exception as e:
        return {"host": host, "port": port, "ok": False, "error": str(e)[:80]}


def http_get(url: str, timeout: float = 8.0) -> dict:
    t0 = time.monotonic()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ecoPrimals-scan-ingest/1"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            ms = (time.monotonic() - t0) * 1000
            return {
                "url": url,
                "ok": True,
                "status": r.status,
                "bytes": len(body),
                "ms": round(ms, 2),
                "hash8": hashlib.blake2b(body, digest_size=8).hexdigest(),
            }
    except Exception as e:
        return {"url": url, "ok": False, "error": str(e)[:120]}


def ntfy_push(title: str, body: str) -> dict:
    url = f"https://ntfy.sh/{NTFY_TOPIC}"
    # ntfy Title header is latin-1 only — ASCII-safe
    safe_title = title.encode("ascii", "replace").decode("ascii")[:120]
    try:
        req = urllib.request.Request(
            url,
            data=body.encode("utf-8"),
            headers={
                "Title": safe_title,
                "Priority": "high",
                "Tags": "chipmunk,northgate,scan",
                "Content-Type": "text/plain; charset=utf-8",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            return {"ok": True, "status": r.status, "topic": NTFY_TOPIC}
    except Exception as e:
        return {"ok": False, "error": str(e)[:120], "topic": NTFY_TOPIC}


def scan_ingest_stack() -> dict:
    rows = []
    total = 0
    for name in STACK:
        p = DATA / name
        if not p.exists():
            p = PUB / name
        if not p.exists():
            rows.append({"file": name, "present": False})
            continue
        raw = p.read_bytes()
        total += len(raw)
        tip = None
        try:
            obj = json.loads(raw.decode("utf-8", errors="replace"))
            if isinstance(obj, dict):
                tip = obj.get("title") or obj.get("thesis") or obj.get("type")
                if isinstance(tip, str):
                    tip = tip[:120]
        except Exception:
            tip = None
        rows.append({
            "file": name,
            "present": True,
            "bytes": len(raw),
            "hash8": hashlib.blake2b(raw, digest_size=8).hexdigest(),
            "tip": tip,
        })
    return {
        "files": len(rows),
        "present": sum(1 for r in rows if r.get("present")),
        "bytes_total": total,
        "rows": rows,
    }


def sense_self_light() -> dict:
    # quick re-sense without full script
    host = socket.gethostname()
    code, out = run(["uptime", "-p"])
    lan = ping_rtt(NORTHGATE_LAN)
    wg = ping_rtt(NORTHGATE_WG)
    return {
        "hostname": host,
        "uptime": out.strip() if code == 0 else None,
        "northgate_lan_rtt": lan,
        "northgate_wg_rtt": wg,
    }


def main() -> None:
    t_start = time.monotonic()
    ingested = scan_ingest_stack()

    # through the net — multi-face Willis
    net = {
        "icmp_lan": ping_rtt(NORTHGATE_LAN),
        "icmp_wg": ping_rtt(NORTHGATE_WG),
        "tcp_ssh_lan": tcp_open(NORTHGATE_LAN, 22),
        "tcp_5000_lan": tcp_open(NORTHGATE_LAN, 5000),
        "tcp_ssh_wg": tcp_open(NORTHGATE_WG, 22),
        "ssh_note": "LAN:22 answers but key-dark (Permission denied). Soft path only.",
    }

    packet_preview = {
        "from": "eastGate",
        "to": "northGate",
        "wave": 200,
        "ingested_present": ingested["present"],
        "ingested_bytes": ingested["bytes_total"],
        "tips": [r.get("tip") for r in ingested["rows"] if r.get("tip")][:8],
        "read_when_you_arrive": CDN,
        "human_face": "https://connect.primals.eco/scan-ingest-northgate-back-self.html",
        "crystallized": "https://connect.primals.eco/crystallized-for-humans.html",
        "song": "https://connect.primals.eco/chipmunk-song-live.html",
    }

    # write first so CDN can be updated after scp — local file ready
    doc_stub_hash = hashlib.blake2b(
        json.dumps(packet_preview, sort_keys=True).encode(), digest_size=8
    ).hexdigest()

    ntfy_body = (
        f"FULL SCAN->INGEST->northGate->SELF\n"
        f"files={ingested['present']}/{ingested['files']} bytes={ingested['bytes_total']}\n"
        f"lan_rtt={net['icmp_lan'].get('rtt_ms_avg')} wg_rtt={net['icmp_wg'].get('rtt_ms_avg')}\n"
        f"ssh_lan_open={net['tcp_ssh_lan'].get('ok')} key=DARK\n"
        f"READ: {CDN}\n"
        f"hash8={doc_stub_hash}"
    )
    ntfy = ntfy_push("eastGate -> northGate scan ingest back", ntfy_body)

    self_before = sense_self_light()

    doc = {
        "ts": utc(),
        "wave": 200,
        "title": "FULL SCAN → INGEST → NET → northGate → BACK TO SELF",
        "thesis": "Scan the crystallized stack, chew it into a packet, push through the net to northGate (Willis soft path — SSH key-dark), fetch back so SELF smells the round trip.",
        "pipeline": [
            "full_scan (crystal stack)",
            "ingest (hash + tips)",
            "net_to_northgate (ICMP + TCP + ntfy + CDN face)",
            "back_to_self (fetch own packet / RTT fold)",
        ],
        "scan_ingest": ingested,
        "net_to_northgate": net,
        "neutrino_ntfy": ntfy,
        "packet_for_northgate": packet_preview,
        "self_before": self_before,
        "back_to_self": None,  # filled after publish + fetch
        "elapsed_ms_build": round((time.monotonic() - t_start) * 1000, 2),
        "urls": {
            "self": CDN,
            "html": "https://connect.primals.eco/scan-ingest-northgate-back-self.html",
            "ntfy": f"https://ntfy.sh/{NTFY_TOPIC}",
        },
    }

    OUT.write_text(json.dumps(doc, indent=2) + "\n")
    (PUB / "scan-ingest-northgate-back-self.json").write_text(json.dumps(doc, indent=2) + "\n")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scan · Ingest · northGate · Self — ecoPrimals</title>
<meta name="description" content="Full scan ingest through the net to northGate and back to self.">
<link rel="alternate" type="application/json" href="/scan-ingest-northgate-back-self.json">
<style>
  :root {{ --ink:#14161c; --paper:#eef1f4; --go:#2f5d4a; --wire:#3d5a80; --mute:#5c5854; }}
  @media (prefers-color-scheme: dark) {{
    :root {{ --ink:#e6e2d8; --paper:#101218; --go:#7eb89a; --wire:#8eb4d4; --mute:#9a958e; }}
  }}
  body {{ margin:0; font-family:"IBM Plex Sans",sans-serif; background:
    radial-gradient(ellipse 55% 40% at 10% 0%, rgba(61,90,128,.18), transparent 50%),
    var(--paper); color:var(--ink); line-height:1.45; }}
  main {{ max-width:40rem; margin:0 auto; padding:3rem 1.2rem 4rem; }}
  h1 {{ font-family:"IBM Plex Serif",Georgia,serif; font-size:clamp(1.8rem,6vw,2.6rem);
    letter-spacing:-.03em; margin:0 0 .4rem; }}
  .tag {{ color:var(--wire); font-weight:600; margin-bottom:1rem; }}
  .pipe {{ font-family:"IBM Plex Mono",monospace; font-size:.9rem; margin:1rem 0 1.5rem; color:var(--go); }}
  section {{ border-top:1px solid rgba(20,22,28,.12); padding-top:1rem; margin:1.2rem 0; }}
  h2 {{ font-size:1rem; color:var(--wire); margin:0 0 .5rem; }}
  a {{ color:var(--go); font-weight:600; }}
  #live {{ min-height:1.2em; font-variant-numeric:tabular-nums; }}
  footer {{ margin-top:2rem; font-size:.8rem; color:var(--mute); }}
</style>
</head>
<body>
<main>
  <h1>Scan → northGate → Self</h1>
  <p class="tag">full ingest · Willis soft net · round trip</p>
  <p class="pipe">scan → ingest → ICMP/TCP/ntfy/CDN → northGate → fetch-back → SELF</p>
  <section>
    <h2>Live fold</h2>
    <p id="live">loading…</p>
  </section>
  <section>
    <ul>
      <li><a href="/scan-ingest-northgate-back-self.json">JSON packet</a></li>
      <li><a href="/crystallized-for-humans.html">crystallized (humans)</a></li>
      <li><a href="/local-cns-pns.html">local CNS/PNS</a></li>
      <li><a href="https://ntfy.sh/{NTFY_TOPIC}">ntfy topic</a></li>
    </ul>
  </section>
  <footer>ecoPrimals · SSH key-dark · soft tether still binds</footer>
</main>
<script>
fetch('/scan-ingest-northgate-back-self.json').then(r=>r.json()).then(d=>{{
  const n = d.net_to_northgate || {{}};
  const b = d.back_to_self || {{}};
  const s = d.scan_ingest || {{}};
  document.getElementById('live').textContent =
    `ingested ${{s.present}}/${{s.files}} · lan ${{n.icmp_lan?.rtt_ms_avg}}ms · wg ${{n.icmp_wg?.rtt_ms_avg}}ms · ` +
    `ntfy ${{d.neutrino_ntfy?.ok}} · back ${{b.ok}} hash ${{b.hash8 || '…'}}`;
}}).catch(e=>{{ document.getElementById('live').textContent = e.message; }});
</script>
</body>
</html>
"""
    HTML.write_text(html)

    print(json.dumps({
        "ingested": {"present": ingested["present"], "bytes": ingested["bytes_total"]},
        "lan_rtt": net["icmp_lan"].get("rtt_ms_avg"),
        "wg_rtt": net["icmp_wg"].get("rtt_ms_avg"),
        "ssh_lan": net["tcp_ssh_lan"].get("ok"),
        "ntfy": ntfy.get("ok"),
        "out": str(OUT),
    }, indent=2))


if __name__ == "__main__":
    main()
