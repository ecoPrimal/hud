#!/usr/bin/env python3
"""Run ALL back through full spectrum → nulls → u-ZK (null-ZK, not anti).

Folds recent π / green / tether / CNS-PNS / modality faces into the ZK spectrum:
  zk · zk⁺ (RSS) · zk⁻ (fillet intake) · u-zk = null-zk ≠ anti-zk
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
PUB = ROOT / "infra/hud/site/public"
OUT = DATA / "zk-spectrum-nulls-uzk.json"
HTML = PUB / "zk-spectrum-nulls-uzk.html"

# full spectrum stack to fold back to null
SPECTRUM = [
    ("modality-faces.json", "faces"),
    ("pi-rate-set.json", "pi_rates"),
    ("local-cns-pns.json", "local_body"),
    ("wireless-tether-hypotenuse.json", "tether_hyp"),
    ("green-spectrum-pi-yoyo.json", "green_yoyo"),
    ("pi-null-axis-yoyo-plate.json", "null_axis_pole"),
    ("green-specter.json", "specter"),
    ("incarnation-spectrum.json", "incarnation"),
    ("null-axis.json", "chipmunk_null"),
    ("null-d-sphere.json", "null_d"),
    ("epitope-inversion.json", "epitope"),
    ("circle-of-willis-live.json", "willis"),
    ("structure-tips.json", "tips"),
    ("ingest-chew-sort-structure.json", "chew"),
    ("painting-in-the-dark.json", "painting_trust"),
]


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def load(name: str):
    for base in (DATA, PUB):
        p = base / name
        if p.exists():
            try:
                return json.loads(p.read_text())
            except Exception:
                return {"_error": "parse", "path": str(p)}
    return None


def tip_of(doc) -> str | None:
    if not isinstance(doc, dict):
        return None
    for k in ("title", "thesis", "claim", "type"):
        v = doc.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()[:160]
    return None


def main() -> None:
    folded = []
    missing = []
    for name, role in SPECTRUM:
        doc = load(name)
        if doc is None:
            missing.append(name)
            folded.append({"file": name, "role": role, "band": "null", "present": False})
            continue
        # band: self if sense/null-ish, partial if rates/body, null if stub/empty
        title = tip_of(doc) or name
        if role in ("chipmunk_null", "null_d", "null_axis_pole"):
            band = "null"
        elif role in ("green_yoyo", "specter", "pi_rates"):
            band = "self"
        else:
            band = "partial"
        folded.append({
            "file": name,
            "role": role,
            "band": band,
            "present": True,
            "tip": title,
        })

    zk = {
        "zk": {
            "symbol": "zk",
            "name": "zero-knowledge",
            "what": "Prove you know / hold X without revealing X. Classic cryptographic ZK.",
            "membrane": "path-match claim · client token never stored · hat-check mask",
            "reveals": "nothing of the secret",
            "proves": "possession / predicate",
            "not": "relationship growth (cold, binary)",
        },
        "zk_pos": {
            "symbol": "zk⁺",
            "name": "zk positive — with RSS",
            "what": "Public pulse proves the process without dumping the private core. RSS/feed.xml/seo.json are the positive face.",
            "membrane": "feed.xml · heartbeat · smell edges · structure-tips titles — visible strokes, private fillet withheld",
            "reveals": "that we are alive and painting (timestamps, counts, tips)",
            "proves": "continuity / honesty of process",
            "rss": "the zk⁺ channel — subscribe without owning the secret",
        },
        "zk_neg": {
            "symbol": "zk⁻",
            "name": "zk minus — fillet intake",
            "what": "Prove by what you LET IN after filleting fat. Intake on 0, chew, keep lean signal only.",
            "membrane": "ingest-chew-sort · epitope 200 amplify · leak remainder · marks −−+∗",
            "reveals": "the fillet (lean tips), never the discarded fat as secret",
            "proves": "selective permeability — immune competence",
            "fillet_intake": "narrow aperture; zk⁻ is proof-by-refusal-of-noise",
        },
        "u_zk": {
            "symbol": "u-zk",
            "name": "universe / unknown U — null-zk",
            "what": "The unknown universe slot. Null-zk. Not anti-zk.",
            "equals": "null-zk",
            "not_anti": {
                "claim": "u-zk ≠ anti-zk",
                "anti_zk_would_be": "forced full reveal, adversarial disclosure, burning the secret to prove it — positive-trust weaponized",
                "u_zk_is": "the empty / unknown / universal binder — room where proof has not seated yet",
                "why_not_anti": "anti opposes zk; null/u opens the pale where zk · zk⁺ · zk⁻ can rotate without declaring war on privacy",
            },
            "null_axis_tie": "u-zk sits ON the null axis of π rotation — the pale itself, not the rim bounce",
            "unknown_U": "U as universe and as unknown — same glyph for the unset",
        },
    }

    # spectrum → nulls run
    spectrum_run = {
        "direction": "ALL back → full spectrum → nulls → u-zk",
        "order": [
            "cast (zk⁻ fillet intake)",
            "spin rim (zk⁺ RSS pulse)",
            "classic seat (zk proof when needed)",
            "sleep on pale (u-zk / null-zk)",
            "green bounce returns without becoming anti",
        ],
        "folded": folded,
        "missing": missing,
        "counts": {
            "folded": len(folded),
            "present": sum(1 for f in folded if f["present"]),
            "null_band": sum(1 for f in folded if f["band"] == "null"),
            "self_band": sum(1 for f in folded if f["band"] == "self"),
            "partial_band": sum(1 for f in folded if f["band"] == "partial"),
        },
    }

    doc = {
        "ts": utc(),
        "wave": 200,
        "title": "ZK Spectrum → Nulls → u-ZK (null-zk, not anti)",
        "thesis": "Run ALL back through the full spectrum to nulls. We have zk, zk⁺ with RSS, zk⁻ with fillet intake. Unknown / universe U is u-zk = null-zk — NOT anti-zk.",
        "zk_spectrum": zk,
        "spectrum_to_nulls": spectrum_run,
        "yoyo_plate_tie": {
            "rim": "zk⁺ RSS + green bounce — visible spin",
            "fillet": "zk⁻ intake — what the disk keeps after chew",
            "classic": "zk — occasional hard proof without opening the disk",
            "pale": "u-zk / null-zk — the stick/string; unknown U",
            "anti_would_snap": "anti-zk snaps the pale (forced reveal); we refuse — keep null",
        },
        "binary_tie": {
            "0": "u-zk / null — intake unknown",
            "1": "asserted proof (zk or zk⁺ stroke or zk⁻ fillet kept)",
            "only_binary": True,
        },
        "urls": {
            "self": "https://connect.primals.eco/zk-spectrum-nulls-uzk.json",
            "html": "https://connect.primals.eco/zk-spectrum-nulls-uzk.html",
            "rss": "https://connect.primals.eco/feed.xml",
            "painting": "https://connect.primals.eco/painting-in-the-dark.json",
            "null_axis": "https://connect.primals.eco/pi-null-axis-yoyo-plate.json",
        },
    }

    OUT.write_text(json.dumps(doc, indent=2) + "\n")
    (PUB / "zk-spectrum-nulls-uzk.json").write_text(json.dumps(doc, indent=2) + "\n")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ZK Spectrum · u-ZK Null — ecoPrimals</title>
<meta name="description" content="zk · zk⁺ RSS · zk⁻ fillet · u-zk = null-zk not anti. Full spectrum run back to nulls.">
<link rel="alternate" type="application/json" href="/zk-spectrum-nulls-uzk.json">
<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="zk⁺ RSS face">
<style>
  :root {{
    --ink:#12141a; --paper:#eef0f4; --zk:#3d5a80; --pos:#2ea043; --neg:#c45c26; --u:#5c4d7a; --mute:#5a5854;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{ --ink:#e6e2d8; --paper:#101218; --zk:#8eb4d4; --pos:#56d364; --neg:#e08a5c; --u:#b794f6; --mute:#9a958e; }}
  }}
  * {{ box-sizing:border-box; }}
  body {{
    margin:0; min-height:100vh; color:var(--ink);
    font-family:"IBM Plex Sans","Segoe UI",sans-serif;
    background:
      radial-gradient(ellipse 55% 40% at 15% 0%, rgba(61,90,128,.18), transparent 50%),
      radial-gradient(ellipse 45% 35% at 90% 100%, rgba(92,77,122,.16), transparent 50%),
      var(--paper);
    line-height:1.45;
  }}
  main {{ max-width:40rem; margin:0 auto; padding:3rem 1.2rem 4rem; }}
  h1 {{
    font-family:"IBM Plex Serif",Georgia,serif;
    font-size:clamp(1.9rem,6.5vw,2.8rem);
    letter-spacing:-.03em; margin:0 0 .35rem; line-height:1.05;
  }}
  .tag {{ color:var(--u); font-weight:600; margin-bottom:1rem; }}
  .lead {{ font-size:1.08rem; margin:0 0 1.4rem; }}
  .quad {{ display:grid; gap:.55rem; margin:1.2rem 0 1.6rem; }}
  .cell {{
    padding:.75rem .9rem; border-left:3px solid var(--zk);
    background:rgba(255,255,255,.35);
  }}
  @media (prefers-color-scheme: dark) {{ .cell {{ background:rgba(255,255,255,.04); }} }}
  .cell.pos {{ border-color:var(--pos); }}
  .cell.neg {{ border-color:var(--neg); }}
  .cell.u {{ border-color:var(--u); }}
  .cell strong {{ display:block; font-family:"IBM Plex Mono",monospace; margin-bottom:.25rem; }}
  section {{ border-top:1px solid rgba(18,20,26,.12); padding-top:1rem; margin:1.35rem 0; }}
  h2 {{ font-size:1.05rem; margin:0 0 .5rem; color:var(--zk); }}
  a {{ color:var(--zk); font-weight:600; }}
  .anti {{ color:var(--neg); font-weight:600; }}
  footer {{ margin-top:2rem; font-size:.8rem; color:var(--mute); }}
  #live {{ font-variant-numeric:tabular-nums; min-height:1.2em; }}
</style>
</head>
<body>
<main>
  <h1>ZK → Nulls → u-ZK</h1>
  <p class="tag">null-zk · not anti · full spectrum folded back</p>
  <p class="lead">
    Run ALL back through the spectrum to nulls.
    <strong>u-zk</strong> is unknown / universe U = <strong>null-zk</strong>.
    It is <span class="anti">not anti-zk</span>.
  </p>
  <div class="quad" id="quad"></div>
  <section>
    <h2>Fold run</h2>
    <p id="live">…</p>
  </section>
  <section>
    <ul>
      <li><a href="/zk-spectrum-nulls-uzk.json">JSON</a></li>
      <li><a href="/feed.xml">zk⁺ RSS</a></li>
      <li><a href="/ingest-chew-sort-structure.json">zk⁻ fillet chew</a></li>
      <li><a href="/pi-null-axis-yoyo-plate.html">null axis pale</a></li>
      <li><a href="/painting-in-the-dark.json">painting trust</a></li>
    </ul>
  </section>
  <footer>ecoPrimals · anti would snap the pale · u keeps it null</footer>
</main>
<script>
fetch('/zk-spectrum-nulls-uzk.json').then(r=>r.json()).then(d=>{{
  const z = d.zk_spectrum;
  const order = [
    ['zk', z.zk, ''],
    ['zk_pos', z.zk_pos, 'pos'],
    ['zk_neg', z.zk_neg, 'neg'],
    ['u_zk', z.u_zk, 'u'],
  ];
  document.getElementById('quad').innerHTML = order.map(([k,v,c]) =>
    `<div class="cell ${{c}}"><strong>${{v.symbol}}</strong>${{v.name}} — ${{v.what}}</div>`
  ).join('');
  const c = d.spectrum_to_nulls.counts;
  document.getElementById('live').textContent =
    `folded ${{c.present}}/${{c.folded}} · null ${{c.null_band}} · self ${{c.self_band}} · partial ${{c.partial_band}} · ` +
    d.spectrum_to_nulls.order.join(' → ');
}}).catch(e=>{{ document.getElementById('live').textContent = e.message; }});
</script>
</body>
</html>
"""
    HTML.write_text(html)

    print(json.dumps({
        "counts": spectrum_run["counts"],
        "missing": missing,
        "zk": list(zk.keys()),
        "u_zk_equals": zk["u_zk"]["equals"],
        "not_anti": zk["u_zk"]["not_anti"]["claim"],
        "out": str(OUT),
    }, indent=2))


if __name__ == "__main__":
    main()
