import json, os, collections, re
import numpy as np
D = os.environ.get("SKANNAUS_DIR", "scan-data/")
r = json.load(open(D + "result.json")); lanes = r["lanes"]
CRISES = [1918, 1931, 1945, 1991, 2009]
LAGS = range(-2, 6)
print("Tapahtumatutkimus: poikkeamien osuus teemoittain kriisivuodesta (t) eteenpäin, keskiarvo kriiseistä joissa ≥5 sarjaa")
res = {}
for t, d in lanes.items():
    prof = []
    for L in LAGS:
        vals = [d[str(c + L)][1] / d[str(c + L)][0] for c in CRISES if str(c + L) in d and d[str(c + L)][0] >= 5]
        prof.append((np.mean(vals) if len(vals) >= 3 else None, len(vals)))
    if all(p[0] is not None for p in prof):
        peak = list(LAGS)[int(np.argmax([p[0] for p in prof]))]
        res[t] = (prof, peak)
for t, (prof, peak) in sorted(res.items(), key=lambda z: z[1][1]):
    print(f"{t[:44]:44s} huippu t{peak:+d} | " + " ".join(f"{p[0]:.2f}" for p in prof))

# Väestöryhmät: millaisia ryhmiä monen ryhmän sarjoissa on
groups = collections.Counter(); per_series = collections.defaultdict(set)
for line in open(D + "values.ndjson"):
    k, y, g, v, kind = json.loads(line)
    per_series[k].add(g)
kinds = collections.Counter()
for k, gs in per_series.items():
    if len(gs) < 2: continue
    gl = " ".join(sorted(gs))[:400].lower()
    if re.search(r"\bmk\d|maakun|uusimaa|lappi|ku\d{3}", gl): kinds["alueet"] += 1
    elif re.search(r"(^| )(m|f|men|women|miehet|naiset|male|female)\b|sex", gl): kinds["sukupuoli"] += 1
    elif re.search(r"\d{2}[-_–]\d{2}|y\d{2}|age|ikä", gl): kinds["ikäryhmät"] += 1
    elif re.search(r"\b(se|no|dk|is|eu)\b|nordic|sweden|norway", gl): kinds["maat"] += 1
    else: kinds["muut"] += 1
print("\nMonen ryhmän sarjat ryhmätyypin mukaan:", dict(kinds))
ex = [ (k, sorted(gs)[:6]) for k, gs in per_series.items() if 2 <= len(gs) <= 12][:12]
for k, g in ex: print("  ", k[:60], g)
