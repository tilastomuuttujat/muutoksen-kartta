import json, collections, random, os
import numpy as np
D = os.environ.get("SKANNAUS_DIR", "scan-data/")
r = json.load(open(D + "result.json"))
rows = {int(x[0]): x for x in r["rows"]}
for y in (2008, 2009, 2010, 2015, 2019, 2020, 2021, 2022, 2023, 2024):
    x = rows.get(y); print(y, "osuus %.2f n=%d" % (x[3], x[1]) if x else "-")
lanes = r["lanes"]
for y in ("1918", "1945", "1991", "2009"):
    top = sorted(((t, d[y][1] / d[y][0], d[y][0]) for t, d in lanes.items() if y in d and d[y][0] >= 8), key=lambda z: -z[1])[:4]
    print(y, [(t[:28], round(s, 2), n) for t, s, n in top])

# Käännetunnistin: 5 vuoden suunta ennen ja jälkeen vuoden y. Käänne = suunta vaihtuu ja muutos on sarjan suurimpien 10 %:ssa.
S = {s["series_key"]: s for s in json.load(open(D + "series.json"))}
raw = collections.defaultdict(lambda: collections.defaultdict(dict))
for line in open(D + "values.ndjson"):
    k, y, g, v, kind = json.loads(line)
    if kind not in ("observed", "estimate") or v is None: continue
    try: y = int(y); v = float(v)
    except: continue
    if y <= 2025: raw[k][g][y] = v
def national(groups):
    for g in ("FI", "FI_HIST", "FI_REGISTER", "SSS", "KOKO MAA"):
        if g in groups: return groups[g]
    return next(iter(groups.values())) if len(groups) == 1 else None
turns = {}
for k, groups in raw.items():
    s = national(groups)
    if not s: continue
    ys = [y for y in sorted(s) if all((y + d) in s for d in range(-5, 6))]
    if len(ys) < 10: continue
    sc = np.std([s[y] for y in s]) or 1
    score = {}
    for y in ys:
        back = (s[y] - s[y - 5]) / sc; fwd = (s[y + 5] - s[y]) / sc
        score[y] = (np.sign(back) != np.sign(fwd)) * abs(fwd - back)
    vals = np.array(list(score.values()))
    thr = np.quantile(vals, 0.9)
    turns[k] = {y: int(v >= thr and v > 0) for y, v in score.items()}
n = collections.Counter(); f = collections.Counter()
for d in turns.values():
    for y, x in d.items(): n[y] += 1; f[y] += x
random.seed(2); mx = []
items = [(list(d), sum(d.values())) for d in turns.values()]
for _ in range(200):
    ff = collections.Counter()
    for yrs, m in items:
        for y in random.sample(yrs, m): ff[y] += 1
    mx.append(max(ff[y] / n[y] for y in n if n[y] >= 30))
fwe = np.quantile(mx, 0.95)
print("käänne: sarjoja", len(turns), "raja %.2f" % fwe)
print("käännevuodet yli rajan:", [(y, round(f[y] / n[y], 2), n[y]) for y in sorted(n) if n[y] >= 30 and f[y] / n[y] > fwe])
fam = [k for k in turns if (S.get(k, {}).get("theme") == "Perhe ja syntyvyys")]
print("perhe-sarjoja käännetarkastelussa", len(fam))
for k in fam:
    ty = [y for y, x in turns[k].items() if x]
    print("  ", S[k]["title"][:60], "| käänteet:", ty[:12])
