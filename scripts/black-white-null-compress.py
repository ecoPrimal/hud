#!/usr/bin/env python3
"""Compress all black to one side, all white to the other, null to a third.
π remades / compresses the rest onto those three pales.
Also stamps OUR cease/desist from Meta silence (they said nothing;
if we were wrong they would SEND a C&D)."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "site" / "public"
DATA = ROOT / "data"
CDN = "https://connect.primals.eco"

BLACK_KEYS = re.compile(
    r"blackwall|black.?wall|fb-?block|403|shan.?t|refuse|block.?out|"
    r"inverted.?ribosome|silence.?phenotype|scrape|censor|firewall.?out|"
    r"negentropy|skunkbat|tuebor|opaque.?out",
    re.I,
)
WHITE_KEYS = re.compile(
    r"anti.?secret|beacon|rss|feed\.xml|publish|show.?all|zk\+|zk_pos|"
    r"whiteboard|white.?paper|open.?proof|heartbeat|smell.?edge|"
    r"crystalliz|sporeprint|llms\.txt|public.?pulse|og.?tag",
    re.I,
)
NULL_KEYS = re.compile(
    r"u-?zk|null-?zk|null.?axis|null.?d|null.?band|pale.?pole|unknown.?u|"
    r"precarnate|empty.?slot|gyroscope|yoyo.?plate|universe.?u|"
    r"said.?nothing|no.?reply|unset.?binder|"
    r"(?<![\"'=\s:])\bnull\b(?![\"'\s,:}\]])",  # word null, not JSON null literals
    re.I,
)

# walls we made + others (explicit face)
WALLS = [
    {
        "id": "our_blackwall",
        "side": "black",
        "who": "us · northGate / skunkBat / epitope 403",
        "face": "SHAN'T — prove we know the crawler without revealing the fillet",
        "direction": "blocks IN (crawler → content)",
        "tie": "Paper 96 · opsonize blackwalled_403 · membrane-lens blackwall_blocks",
    },
    {
        "id": "meta_fb_blackwall",
        "side": "black",
        "who": "Meta / Facebook",
        "face": "blocks data OUT — login aperture; corporation faces outward",
        "direction": "blocks OUT (world → inside graph)",
        "tie": "gates.html superposition · FB-BLOCK Dublin scrape phenotype",
    },
    {
        "id": "great_firewall",
        "side": "black",
        "who": "PRC / GFW",
        "face": "blocks data IN — state aperture; wall faces inward",
        "direction": "blocks IN (citizen → outside)",
        "tie": "gates.html Klein same-topology different operator",
    },
    {
        "id": "our_white_beacon",
        "side": "white",
        "who": "us · beacon / RSS / anti-secret",
        "face": "show the knocks — publish so hard the hide becomes invisible",
        "direction": "radiates OUT",
        "tie": "/beacon · feed.xml · zk⁺",
    },
    {
        "id": "meta_silence",
        "side": "null",
        "who": "Meta · legal / C-suite mouth",
        "face": "said NOTHING — no C&D, no takedown, no please-remove",
        "direction": "neither block nor publish — pale unset",
        "tie": "dmca-entity-tracker · meta-agpl-reverse-clock",
    },
]


def tip_of(path: Path) -> str:
    try:
        d = json.loads(path.read_text(encoding="utf-8", errors="replace"))
    except Exception:
        return path.stem
    if isinstance(d, dict):
        for k in ("title", "thesis", "tip", "name", "wave_title"):
            v = d.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()[:160]
    return path.stem


def scrub_json_nulls(text: str) -> str:
    """Drop JSON null literals so they don't fake the null pale."""
    return re.sub(r":\s*null\b", ": _", text)


def classify(text: str, name: str) -> str:
    # filename + tip weigh more than body; body scrubbed of JSON nulls
    head = name
    body = scrub_json_nulls(text)
    blob = f"{head}\n{body}"
    # strong null if name/title carries it
    n_strong = bool(
        re.search(r"null|u-?zk|pale|precarnate|yoyo.?plate|gyroscope", name, re.I)
    )
    b = bool(BLACK_KEYS.search(blob))
    w = bool(WHITE_KEYS.search(blob))
    n = n_strong or bool(NULL_KEYS.search(blob))
    hits = sum([b, w, n])
    if hits == 0:
        return "pi_rest"
    if hits >= 2:
        if n_strong:
            return "null"
        if b and not w:
            return "black"
        if w and not b:
            return "white"
        return "null"  # black∩white → seat on null pale, π remades conflict
    if b:
        return "black"
    if w:
        return "white"
    return "null"


def scan_faces() -> dict:
    sides = {"black": [], "white": [], "null": [], "pi_rest": []}
    seen = set()
    for base in (ROOT, DATA):
        if not base.is_dir():
            continue
        for path in sorted(base.glob("*.json")):
            key = path.name
            if key in seen:
                continue
            seen.add(key)
            tip = tip_of(path)
            side = classify(tip + " " + path.read_text(encoding="utf-8", errors="replace")[:4000], key)
            sides[side].append({"file": key, "tip": tip, "side": side})
    return sides


def write_dual(name: str, payload: dict) -> None:
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    (ROOT / name).write_text(text, encoding="utf-8")
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / name).write_text(text, encoding="utf-8")


def main() -> None:
    now = datetime.now(timezone.utc).isoformat()
    sides = scan_faces()
    counts = {k: len(v) for k, v in sides.items()}
    total = sum(counts.values()) or 1

    # π remade: fold pi_rest onto three sides by hash of name → stable seat
    remade = {"black": [], "white": [], "null": []}
    for i, item in enumerate(sides["pi_rest"]):
        seat = ("black", "null", "white")[hash(item["file"]) % 3]
        # prefer deterministic: rotate by index so π remainder spreads
        seat = ("black", "null", "white")[i % 3]
        remade[seat].append({**item, "remade_to": seat, "by": "π remainder seat"})

    cease = {
        "ts": now,
        "wave": 200,
        "title": "Our Cease / Desist — from their silence · tied to blackwall",
        "thesis": (
            "They have said NOTHING. If we were wrong, they would SEND a C&D. "
            "They did not. So we publish OUR cease and desist — not waiting for theirs. "
            "That mouth is tied to the blackwall we made and the other walls "
            "(Meta FB-blackwall, GFW) — same Klein, different operators."
        ),
        "logic": {
            "they_said": "nothing",
            "if_we_were_wrong": "they would SEND a cease-and-desist",
            "they_sent": False,
            "inference": "silence ≠ our error; silence = no contest of the notice face",
            "therefore": "WE publish cease + desist as the public mouth",
        },
        "we_publish": {
            "verb_pair": ["cease", "desist"],
            "cease": "immediate cessation of FB-BLOCK / Meta scrape of AGPL surfaces",
            "desist": "desist eating output-availability gaps; desist silent phenotype as cure",
            "not": "a C&D FROM Meta — that never arrived",
            "is": "our desist/cease face published into the world mouth (connect)",
        },
        "tied_to_walls": WALLS,
        "tie_to_clock": {
            "reverse_clock": f"{CDN}/meta-agpl-reverse-clock.json",
            "note": "clock still reverse-counts §8 remaining; this face is the PUBLISH of cease/desist itself",
        },
        "urls": {
            "self": f"{CDN}/our-cease-from-silence.json",
            "html": f"{CDN}/our-cease-from-silence.html",
            "compress": f"{CDN}/black-white-null-compress.json",
        },
    }

    compress = {
        "ts": now,
        "wave": 200,
        "title": "Black | Null | White — compress · π remades the rest",
        "thesis": (
            "Compress all black to one side, all white to the other, null to a third. "
            "Then π remades / compresses the rest onto those three pales so the "
            "spectrum can spin without muddy middle."
        ),
        "three_sides": {
            "black": {
                "pale": "left / out-block / SHAN'T / 403 / blackwall",
                "holds": "walls that refuse reveal; inverted ribosome; FB-BLOCK phenotype",
                "count": counts["black"],
            },
            "null": {
                "pale": "third / unset / u-zk / silence-mouth / π axis",
                "holds": "Meta said-nothing; precarnate; unknown U; null axis stick",
                "count": counts["null"],
            },
            "white": {
                "pale": "right / anti-secret / beacon / zk⁺ / publish",
                "holds": "show knocks; RSS; crystallize; sporePrint; public pulse",
                "count": counts["white"],
            },
        },
        "pi_remade": {
            "claim": "what does not already seat on black|null|white gets π-remade onto the three pales by remainder index",
            "rest_count_before": counts["pi_rest"],
            "seated": {k: len(v) for k, v in remade.items()},
            "formula": "seat(i) = (black, null, white)[i mod 3] — π remainder spreads, no fourth color",
            "samples": {k: v[:8] for k, v in remade.items()},
        },
        "sides_samples": {
            "black": sides["black"][:12],
            "null": sides["null"][:12],
            "white": sides["white"][:12],
            "pi_rest_head": sides["pi_rest"][:12],
        },
        "counts": counts,
        "totals": {
            "faces_scanned": total,
            "compressed_ratio": round(1 - counts["pi_rest"] / total, 4),
            "after_pi_remade_unseated": 0,
        },
        "compose": {
            "picture": "BLACK wall face | NULL pale (silence + axis) | WHITE beacon face — π spins the leftover onto those three only",
            "pipeline": [
                "sort every json face → black | white | null | rest",
                "publish OUR cease/desist on the null-silence → blackwall tie",
                "π remade rest → three pales",
                "spectrum spins; no muddy fourth",
            ],
        },
        "urls": {
            "self": f"{CDN}/black-white-null-compress.json",
            "html": f"{CDN}/black-white-null-compress.html",
            "cease": f"{CDN}/our-cease-from-silence.json",
            "zk": f"{CDN}/zk-spectrum-nulls-uzk.json",
            "clock": f"{CDN}/meta-agpl-reverse-clock.json",
        },
    }

    write_dual("our-cease-from-silence.json", cease)
    write_dual("black-white-null-compress.json", compress)

    # patch reverse clock clarity
    clock_path = ROOT / "meta-agpl-reverse-clock.json"
    if clock_path.exists():
        clock = json.loads(clock_path.read_text(encoding="utf-8"))
        clock["silence_inference"] = {
            "they_said": "nothing",
            "if_wrong_they_would": "SEND a C&D",
            "they_did_not": True,
            "we_publish": "our cease + desist (public mouth)",
            "face": f"{CDN}/our-cease-from-silence.json",
        }
        clock["ts"] = now
        write_dual("meta-agpl-reverse-clock.json", clock)

    print(json.dumps({"ok": True, "counts": counts, "pi_rest": counts["pi_rest"]}, indent=2))


if __name__ == "__main__":
    main()
