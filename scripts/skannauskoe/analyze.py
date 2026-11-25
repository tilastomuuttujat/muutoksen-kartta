"""Koe: toimiiko koko aineiston poikkeamaskannaus vai jääkö se kohinaksi?"""
import json, collections, random, math, os
import numpy as np
D = os.environ.get("SKANNAUS_DIR", "scan-data/")
S = {s["series_key"]: s for s in json.load(open(D + "series.json"))}
raw = collections.defaultdict(lambda: collections.defaultdict(dict))
for line in open(D + "values.ndjson"):
    k, y, g, v, kind = json.loads(line)
    if kind not in ("observed", "estimate") or v is None: continue
    try: y = int(y); v = float(v)
    except: continue
    if y > 2025: continue
    raw[k][g][y] = v

def national(groups):
    for g in ("FI", "FI_HIST", "FI_REGISTER", "SSS", "KOKO MAA"):
        if g in groups: return groups[g]
    if len(groups) == 1: return next(iter(groups.values()))
    return None

stats = collections.Counter()
flags = {}   # key -> {year: 0/1}
for k, groups in raw.items():
    stats["sarjoja"] += 1
    ser = national(groups)
    if ser is None: stats["vain alueellisia tai monta ryhmää"] += 1; continue
    ys = sorted(ser)
    pos = all(ser[y] > 0 for y in ys)
    ch = {}
    for a, b in zip(ys, ys[1:]):
        if b - a != 1: continue
        if pos: ch[b] = ser[b] / ser[a] - 1
        else: ch[b] = ser[b] - ser[a]
    vals = np.array(list(ch.values()))
    if len(vals) < 15 or np.ptp(vals) == 0: stats["liian lyhyt tai vakio (<15 vuosimuutosta)"] += 1; continue
    lo, hi = np.quantile(vals, [0.05, 0.95])
    flags[k] = {y: int(c < lo or c > hi) for y, c in ch.items()}
    stats["analysoitu"] += 1
print(dict(stats))

years = range(1850, 2026)
def per_year(fl):
    n = collections.Counter(); f = collections.Counter()
    for d in fl.values():
        for y, x in d.items(): n[y] += 1; f[y] += x
    return n, f
n, f = per_year(flags)
base = sum(f.values()) / sum(n.values())
print("poikkeavien osuus kaikkiaan %.3f" % base)

# Nollamalli: sekoitetaan kunkin sarjan poikkeamavuodet sen omien vuosien kesken (määrä säilyy).
random.seed(1); R = 300
null_share = collections.defaultdict(list); null_max = []
items = [(list(d.keys()), sum(d.values())) for d in flags.values()]
for _ in range(R):
    ff = collections.Counter()
    for yrs, m in items:
        for y in random.sample(yrs, m): ff[y] += 1
    sh = {y: ff[y] / n[y] for y in n if n[y] >= 30}
    for y, v in sh.items(): null_share[y].append(v)
    null_max.append(max(sh.values()))
fwe = np.quantile(null_max, 0.95)
rows = []
for y in years:
    if n[y] < 30: continue
    share = f[y] / n[y]
    p99 = np.quantile(null_share[y], 0.99)
    rows.append((y, n[y], f[y], share, p99, share > fwe))
print("perhekohtainen raja (minkä tahansa vuoden sattumamaksimi, 95 %%): %.3f" % fwe)
sig = [r for r in rows if r[5]]
print("vuodet yli rajan:", [(r[0], round(r[3], 2), r[1]) for r in sig])

# Elämänalueittain (teema)
theme = {k: (S.get(k, {}).get("theme") or "?") for k in flags}
lane = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0]))
for k, d in flags.items():
    for y, x in d.items(): lane[theme[k]][y][0] += 1; lane[theme[k]][y][1] += x

# Syntyvyyskysymys: teema "Perhe ja syntyvyys" vs muut, 2010–2024
fam = [k for k in flags if theme[k] == "Perhe ja syntyvyys"]
def window(keys, a, b):
    N = F = 0
    for k in keys:
        for y, x in flags[k].items():
            if a <= y <= b: N += 1; F += x
    return N, F
print("Perhe ja syntyvyys -sarjoja analysoitavissa:", len(fam))
for a, b in ((2010, 2024), (1990, 1999), (1940, 1949)):
    Nf, Ff = window(fam, a, b); No, Fo = window([k for k in flags if k not in fam], a, b)
    print(f"{a}-{b}: perhe {Ff}/{Nf} = {Ff/max(Nf,1):.2f} | muut {Fo}/{No} = {Fo/max(No,1):.2f}")
json.dump({"rows": rows, "fwe": float(fwe), "base": base, "stats": dict(stats),
           "lanes": {t: {y: v for y, v in d.items()} for t, d in lane.items()},
           "fam": fam, "theme": theme}, open(D + "result.json", "w"), default=float)
