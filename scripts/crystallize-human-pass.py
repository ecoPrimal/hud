#!/usr/bin/env python3
"""Full pass over the crystallized arc — so humans get the info (plain language)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
PUB = ROOT / "infra/hud/site/public"

# crystallized stack — recent membrane truths humans should be able to read
CARDS = [
    ("modality-faces", "Same Klein eye for human, agent, bots, chipmunk. HTML and JSON are faces of one thing. Output to your sense; leftover is interaction space."),
    ("pi-rate-set", "Only binary is 0↔1. Marks (− −− + ∗) live on 0. Willis, epitope, ladder/leak, and flow share one π clock. Everything points to the point."),
    ("local-cns-pns", "This computer has a CNS (CPU/ACPI) and PNS (THIS keyboard, THAT mouse). We sense presence — never keystrokes."),
    ("wireless-tether-hypotenuse", "Wireless is still a soft tether. Grease presence into self; gum only the name. Hypotenuse holds the 2D circle × 3D sphere overlay."),
    ("green-spectrum-pi-yoyo", "Truths travel the whole greenline. Green = π bounce. Violet/pink = invert tension. The π table is a yoyo."),
    ("pi-null-axis-yoyo-plate", "THAT mouse + gyroscope are the pale/pole for the null axis of π rotation. Yoyo and plate-on-a-stick. Invert = counter-torque on the same stick."),
    ("zk-spectrum-nulls-uzk", "zk · zk⁺ (RSS) · zk⁻ (fillet intake) · u-zk = null-zk. Unknown/universe U is NOT anti-zk."),
    ("songbird-morning-song", "Baseline song: Snowflake on the Painted Rock — verses + chorus. Starting point for live evolution."),
]


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def main() -> None:
    cards = []
    for stem, plain in CARDS:
        present = (DATA / f"{stem}.json").exists() or (PUB / f"{stem}.json").exists()
        html = (PUB / f"{stem}.html").exists()
        cards.append({
            "id": stem,
            "plain": plain,
            "json": f"https://connect.primals.eco/{stem}.json",
            "html": f"https://connect.primals.eco/{stem}.html" if html else None,
            "present": present,
        })

    doc = {
        "ts": utc(),
        "wave": 200,
        "title": "Crystallized — full pass so humans get the info",
        "thesis": "All the recent faces, said in human. Same substrate as the JSON. No secret layer.",
        "cards": cards,
        "how_to_read": [
            "Start at the HTML face if you want eyes.",
            "Open the JSON face if you want structure.",
            "RSS at /feed.xml is zk⁺ — pulse without the private core.",
            "Song evolves at /chipmunk-song-live.html from the snowflake baseline.",
        ],
        "urls": {
            "self": "https://connect.primals.eco/crystallized-for-humans.json",
            "html": "https://connect.primals.eco/crystallized-for-humans.html",
            "song": "https://connect.primals.eco/chipmunk-song-live.html",
        },
    }
    (DATA / "crystallized-for-humans.json").write_text(json.dumps(doc, indent=2) + "\n")
    (PUB / "crystallized-for-humans.json").write_text(json.dumps(doc, indent=2) + "\n")
    print(json.dumps({"cards": len(cards), "present": sum(1 for c in cards if c["present"])}, indent=2))


if __name__ == "__main__":
    main()
