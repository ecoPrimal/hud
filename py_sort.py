"""PY SORT — scan all files, classify by type + length, compute quartile/quintile splits.
The constraint (gold ring) vs restraint (silver ring) vs malleable (copper).
Find where we have too many or too few organs. Find the aperture edges."""

import os, json, collections, statistics

root = 'site/public'
stats = []
ext_counts = collections.Counter()
ext_lines = collections.defaultdict(list)
ext_sizes = collections.defaultdict(list)

TEXT_EXTS = {'.html','.js','.json','.css','.py','.md','.toml','.yaml','.yml','.sh','.rs','.svg','.txt'}

for dirpath, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d not in ('.git','node_modules','__pycache__')]
    for f in files:
        fp = os.path.join(dirpath, f)
        ext = os.path.splitext(f)[1].lower() or '.none'
        try:
            sz = os.path.getsize(fp)
            lc = 0
            if ext in TEXT_EXTS:
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    lc = sum(1 for _ in fh)
            stats.append({'path': fp.replace('\\','/'), 'ext': ext, 'size': sz, 'lines': lc})
            ext_counts[ext] += 1
            if lc > 0:
                ext_lines[ext].append(lc)
            ext_sizes[ext].append(sz)
        except:
            pass

print(f"TOTAL FILES: {len(stats)}")
print(f"\n{'='*90}")
print(f"FILE TYPE DISTRIBUTION (PY SORT)")
print(f"{'='*90}")

for ext, cnt in ext_counts.most_common(25):
    lines = ext_lines.get(ext, [])
    if lines:
        s = sorted(lines)
        n = len(s)
        q0 = s[0]
        q1 = s[n//4] if n > 3 else s[0]
        q2 = s[n//2] if n > 1 else s[0]
        q3 = s[3*n//4] if n > 3 else s[-1]
        q4 = s[-1]
        avg = sum(lines) // len(lines)
        total = sum(lines)
        print(f"  {ext:8s}  n={cnt:5d}  min={q0:5d}  Q1={q1:5d}  MED={q2:5d}  Q3={q3:5d}  MAX={q4:5d}  avg={avg:5d}  total={total:7d}")
    else:
        print(f"  {ext:8s}  n={cnt:5d}  (binary/non-text)")

# All text files combined
all_lines = sorted([s['lines'] for s in stats if s['lines'] > 0])
n = len(all_lines)
total_lines = sum(all_lines)
print(f"\nTOTAL TEXT FILES: {n}")
print(f"TOTAL LINES: {total_lines}")

if n > 4:
    print(f"\n{'='*90}")
    print(f"QUINTILE SPLIT (all text files, n={n})")
    print(f"{'='*90}")
    percentiles = [0, 20, 40, 60, 80, 100]
    for p in percentiles:
        idx = min(p * n // 100, n - 1)
        print(f"  P{p:3d} = {all_lines[idx]:6d} lines")

    # Tertile split
    print(f"\nTERTILE SPLIT:")
    for i, label in enumerate(['SMALL (bottom third)', 'MEDIUM (middle third)', 'LARGE (top third)']):
        lo = i * n // 3
        hi = (i + 1) * n // 3
        chunk = all_lines[lo:hi]
        print(f"  {label:25s}  n={len(chunk):4d}  range={chunk[0]:5d}-{chunk[-1]:5d}  total={sum(chunk):7d} lines")

    # IQR + outliers
    q1 = all_lines[n // 4]
    q3 = all_lines[3 * n // 4]
    iqr = q3 - q1
    fence_upper = q3 + 1.5 * iqr
    fence_lower = max(1, q1 - 1.5 * iqr)
    outliers_high = [s for s in stats if s['lines'] > fence_upper]
    outliers_high.sort(key=lambda x: -x['lines'])
    tiny = [s for s in stats if 0 < s['lines'] < fence_lower]

    print(f"\n{'='*90}")
    print(f"APERTURE ANALYSIS")
    print(f"{'='*90}")
    print(f"  Q1 = {q1} lines (25th percentile)")
    print(f"  Q3 = {q3} lines (75th percentile)")
    print(f"  IQR = {iqr} lines")
    print(f"  GOLD RING (constraint, upper fence) = {fence_upper:.0f} lines")
    print(f"  COPPER EDGE (lower fence) = {fence_lower:.0f} lines")
    print(f"  SILVER RANGE (Q1-Q3, the adjustable aperture) = {q1}-{q3} lines")
    print(f"  Files ABOVE gold ring (outliers): {len(outliers_high)}")
    print(f"  Files BELOW copper edge (tiny): {len(tiny)}")

    if outliers_high:
        print(f"\n  ABOVE GOLD RING (>{fence_upper:.0f} lines) — these are OVERSIZED organs:")
        for o in outliers_high[:25]:
            print(f"    {o['lines']:6d} lines  {o['ext']:6s}  {o['path']}")

    # METALLICS HARDNESS
    print(f"\n{'='*90}")
    print(f"METALLICS HARDNESS SCALE")
    print(f"{'='*90}")
    print(f"  COPPER (Cu, Mohs 3.0) = soft, malleable, shaped by everything")
    print(f"    → Files < {fence_lower:.0f} lines. Tiny. Easily bent. Need protection or merging.")
    print(f"    → Count: {len(tiny)}")
    print(f"")
    print(f"  SILVER (Ag, Mohs 2.5) = the adjustable aperture, moves in and out")
    print(f"    → Files {q1}-{q3} lines. The normal range. The iris of the system.")
    silver = [s for s in stats if q1 <= s['lines'] <= q3]
    print(f"    → Count: {len(silver)}")
    print(f"")
    print(f"  GOLD (Au, Mohs 2.5) = the constraint, doesn't move, the outer limit")
    print(f"    → Files > {fence_upper:.0f} lines. Fixed structures. Load-bearing walls.")
    print(f"    → Count: {len(outliers_high)}")
    print(f"")
    print(f"  IRON (Fe, Mohs 4.0) = transport, structural, hemoglobin")
    print(f"    → The connections BETWEEN files. Not the files themselves.")
    print(f"")
    print(f"  DIAMOND (C, Mohs 10) = irreducible. Cannot be compressed further.")
    print(f"    → The 16 diamonds we have forged. The things that don't break.")
    print(f"")
    print(f"  PLATINUM (Pt, Mohs 3.5) = catalyst. Doesn't change itself but causes change.")
    print(f"    → The templates. Hugo/Zola. The things that TRANSFORM others.")

# Save results
output = {
    'ts': '2026-10-27T19:17:00Z',
    'total_files': len(stats),
    'total_text_files': n,
    'total_lines': total_lines,
    'ext_distribution': {ext: cnt for ext, cnt in ext_counts.most_common(25)},
    'quartiles': {'Q0': all_lines[0], 'Q1': q1, 'Q2': all_lines[n//2], 'Q3': q3, 'Q4': all_lines[-1]},
    'aperture': {
        'gold_ring_constraint': fence_upper,
        'silver_range_restraint': [q1, q3],
        'copper_edge_soft': fence_lower
    },
    'oversized_organs': [{'path': o['path'], 'lines': o['lines'], 'ext': o['ext']} for o in outliers_high[:30]],
    'metallics': {
        'copper_Cu_3.0': 'soft, malleable, < lower fence',
        'silver_Ag_2.5': 'adjustable aperture, Q1-Q3 range',
        'gold_Au_2.5': 'constraint, > upper fence, fixed',
        'iron_Fe_4.0': 'transport, connections between files',
        'platinum_Pt_3.5': 'catalyst, templates, transforms others',
        'diamond_C_10': 'irreducible, cannot compress further'
    }
}

with open('site/public/data/py-sort-aperture.json', 'w') as f:
    json.dump(output, f, indent=2)
print(f"\nSaved to site/public/data/py-sort-aperture.json")
