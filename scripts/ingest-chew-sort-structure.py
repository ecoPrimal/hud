#!/usr/bin/env python3
"""INGEST → CHEW THE FAT → SORT — json/rs/py/html/css (+js/xml/md/toml).

All those files become structure tips: what the membrane is made of, sorted
for walkers / Smell-O-Vision / taxonomy.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/eastgate/Development/ecoPrimals")
DATA = ROOT / "infra/hud/site/public/data"
OUT = DATA / "ingest-chew-sort-structure.json"
TIPS = DATA / "structure-tips.json"

SCAN_ROOTS = [
    ROOT / "infra/hud/site/public",
    ROOT / "infra/scripts",
    ROOT / "infra/hud/scripts",
]

EXTS = {".json", ".rs", ".py", ".html", ".css", ".js", ".xml", ".txt", ".md", ".toml"}
SKIP_PARTS = {"node_modules", ".git", ".wrangler", "target", "dist", "__pycache__"}

# path → structural role
ROLE_RULES = [
    (re.compile(r"/data/"), "feed_dna"),
    (re.compile(r"/js/"), "nervous_js"),
    (re.compile(r"\.html$"), "skin_html"),
    (re.compile(r"\.css$"), "skin_css"),
    (re.compile(r"/scripts/"), "enzyme_script"),
    (re.compile(r"llms\.txt|seo\.json|feed\.xml|robots"), "seo_cloaca"),
    (re.compile(r"smell|cloaca|cave|jumprope|t-plane"), "sense_stack"),
]


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def role_for(path: Path) -> str:
    s = str(path).replace("\\", "/")
    for rx, role in ROLE_RULES:
        if rx.search(s):
            return role
    return "other"


def chew_fat(path: Path, raw: bytes, text: str | None) -> dict:
    """Chew: hash, size, density, extract tips — discard empty calories where possible."""
    size = len(raw)
    digest = hashlib.blake2b(raw, digest_size=8).hexdigest()
    tip = None
    keys = []
    fat_ratio = 1.0

    if text is None:
        return {"hash8": digest, "bytes": size, "tip": None, "keys": [], "fat_ratio": 1.0, "binary": True}

    # whitespace/comment fat estimate
    stripped = re.sub(r"\s+", " ", text).strip()
    fat_ratio = round(1.0 - (len(stripped) / max(1, len(text))), 3)

    suf = path.suffix.lower()
    if suf == ".json":
        try:
            obj = json.loads(text)
            if isinstance(obj, dict):
                keys = list(obj.keys())[:12]
                tip = obj.get("title") or obj.get("type") or obj.get("tagline") or keys[0] if keys else None
            elif isinstance(obj, list):
                tip = f"list[{len(obj)}]"
                keys = ["_list"]
        except Exception:
            tip = text.strip()[:80]
    elif suf == ".py":
        m = re.search(r'"""(.+?)"""', text, re.S)
        if m:
            tip = m.group(1).strip().splitlines()[0][:120]
        else:
            m = re.search(r"^#\s*(.+)$", text, re.M)
            tip = m.group(1)[:120] if m else path.stem
        keys = re.findall(r"^def\s+(\w+)", text, re.M)[:8]
    elif suf == ".rs":
        m = re.search(r"//!?\s*(.+)", text)
        tip = m.group(1)[:120] if m else path.stem
        keys = re.findall(r"(?:pub\s+)?fn\s+(\w+)", text)[:8]
    elif suf == ".html":
        m = re.search(r"<title>([^<]+)</title>", text, re.I)
        tip = m.group(1).strip()[:120] if m else path.stem
        keys = re.findall(r"<h1[^>]*>([^<]+)</h1>", text, re.I)[:3]
    elif suf == ".css":
        n_rules = len(re.findall(r"\{", text))
        tip = f"css rules≈{n_rules}"
        keys = re.findall(r"^\.([\w-]+)", text, re.M)[:8]
    elif suf == ".js":
        m = re.search(r"^//\s*(.+)$", text, re.M)
        tip = m.group(1)[:120] if m else path.stem
        keys = re.findall(r"function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(", text)[:8]
        keys = [a or b for a, b in keys][:8]
    elif suf in (".md", ".txt"):
        tip = next((ln.strip("# ").strip() for ln in text.splitlines() if ln.strip()), path.stem)[:120]
    else:
        tip = path.stem

    return {
        "hash8": digest,
        "bytes": size,
        "tip": tip if isinstance(tip, str) else str(tip) if tip else None,
        "keys": keys,
        "fat_ratio": fat_ratio,
        "binary": False,
    }


def sort_band(role: str, ext: str, fat: float) -> str:
    if role == "sense_stack":
        return "self"
    if role in ("feed_dna", "enzyme_script"):
        return "partial"
    if role == "seo_cloaca":
        return "self"
    if role in ("skin_html", "skin_css", "nervous_js"):
        return "partial" if fat < 0.4 else "non-self"  # fatty skins sort outward
    return "null"


def main() -> None:
    ingested = []
    by_ext = Counter()
    by_role = Counter()
    by_band = Counter()
    tips_out = []

    for root in SCAN_ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if any(p in SKIP_PARTS for p in path.parts):
                continue
            ext = path.suffix.lower()
            if ext not in EXTS:
                continue
            try:
                raw = path.read_bytes()
            except Exception:
                continue
            # skip huge blobs in chew (still ingest meta)
            text = None
            if len(raw) < 2_000_000:
                try:
                    text = raw.decode("utf-8", errors="replace")
                except Exception:
                    text = None
            chewed = chew_fat(path, raw, text)
            role = role_for(path)
            try:
                rel = str(path.relative_to(ROOT))
            except ValueError:
                rel = str(path)
            band = sort_band(role, ext, chewed["fat_ratio"])
            row = {
                "path": rel,
                "ext": ext,
                "role": role,
                "band": band,
                **chewed,
            }
            ingested.append(row)
            by_ext[ext] += 1
            by_role[role] += 1
            by_band[band] += 1
            if chewed.get("tip"):
                tips_out.append({
                    "tip": chewed["tip"],
                    "path": rel,
                    "ext": ext,
                    "role": role,
                    "band": band,
                    "keys": chewed.get("keys") or [],
                })

    # sort: band order self→partial→non-self→null, then role, then path
    band_order = {"self": 0, "partial": 1, "non-self": 2, "null": 3}
    ingested.sort(key=lambda r: (band_order.get(r["band"], 9), r["role"], r["path"]))
    tips_out.sort(key=lambda t: (band_order.get(t["band"], 9), t["role"], t["path"]))

    # structure tips — top by band
    structure_tips = {
        "ts": utc(),
        "title": "Structure Tips — chewed from json/rs/py/html/css/…",
        "how": "Each tip is a structural hint extracted while chewing fat. Use for walkers, Smell-O-Vision, taxonomy, PORT.",
        "by_band": {
            b: [t for t in tips_out if t["band"] == b][:40]
            for b in ("self", "partial", "non-self", "null")
        },
        "sense_stack_tips": [t for t in tips_out if t["role"] == "sense_stack"][:30],
        "enzyme_tips": [t for t in tips_out if t["role"] == "enzyme_script"][:30],
        "urls": {
            "self": "https://connect.primals.eco/structure-tips.json",
            "full_sort": "https://connect.primals.eco/ingest-chew-sort-structure.json",
        },
    }

    doc = {
        "ts": utc(),
        "wave": 200,
        "title": "INGEST → CHEW THE FAT → SORT (all the files)",
        "thesis": "JSON, Rust, Python, HTML, CSS (+js/xml/md/toml) — ingest, chew fat, sort into taxonomy bands. Structure tips fall out for everyone.",
        "scope": [str(r.relative_to(ROOT)) if r.is_relative_to(ROOT) else str(r) for r in SCAN_ROOTS],
        "counts": {
            "files": len(ingested),
            "by_ext": dict(by_ext),
            "by_role": dict(by_role),
            "by_band": dict(by_band),
            "tips": len(tips_out),
        },
        "sorted": ingested[:500],  # cap feed size; full count in counts
        "sorted_note": "first 500 after sort; counts cover full ingest",
        "pipeline": ["ingest", "chew_fat", "sort_band", "structure_tips"],
        "urls": {
            "self": "https://connect.primals.eco/ingest-chew-sort-structure.json",
            "tips": "https://connect.primals.eco/structure-tips.json",
            "smell_o_vision": "https://connect.primals.eco/smell-o-vision.html",
        },
    }

    OUT.write_text(json.dumps(doc, indent=2) + "\n")
    TIPS.write_text(json.dumps(structure_tips, indent=2) + "\n")

    print(json.dumps({
        "files": len(ingested),
        "by_ext": dict(by_ext),
        "by_role": dict(by_role),
        "by_band": dict(by_band),
        "tips": len(tips_out),
        "sample_tips": [t["tip"] for t in tips_out[:8]],
    }, indent=2))


if __name__ == "__main__":
    main()
