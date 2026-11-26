"""Rakentaa skannerin aineiston: src/data/scanner.json.

Lähtö: fetch.py:n tuottama Turson koko indikaattoriaineisto (SKANNAUS_DIR/values.ndjson, series.json).
Jokaisesta kansallisesta sarjasta lasketaan kaksi tunnistinta:
  a = poikkeama: vuosimuutos sarjan oman historian 5–95 %:n vaihteluvälin ulkopuolella (shokki)
  t = käänne: viiden vuoden suunta vaihtuu ja muutos on sarjan suurimpien 10 %:n joukossa (rakennemuutos)
Lisäksi merkitään kaksoiskappaleet (vuosimuutosten korrelaatio > 0,97), lasketaan koko aineiston ja
elämänalueiden osuudet vuosittain sekä sattuman raja nollamallilla (sarjan omien vuosien sekoitus).
Selaimessa src/lib/scanner.ts tekee vertailut (mikä edeltää mitä, kahden jakson ero).
"""
import json, collections, random, os, math
import numpy as np

D = os.environ.get("SKANNAUS_DIR", "scan-data/")
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "scanner.json")
LAST = 2025

LANES = [  # (nimi, avainsanat) – ensimmäinen osuma ratkaisee
    ("Rikollisuus ja kontrolli", ["rikol", "väkival", "kontrolli"]),
    ("Julkinen talous", ["julkis", "verotus", "sosiaaliturva ja julkinen"]),
    ("Toimeentulo ja eriarvoisuus", ["toimeentulo", "tulonjako", "eriarvo", "köyhyys", "tulot", "sosiaalinen", "sosiaaliturva", "väestöryhmien erot"]),
    ("Työ ja tuotanto", ["työ", "tuotanto"]),
    ("Väestö ja perhe", ["väestö", "perhe", "syntyvyys", "muuttoliike"]),
    ("Terveys ja hoiva", ["huolenpito", "terveys", "hoiva", "hoido", "elinolot", "hyvinvointi"]),
    ("Asuminen ja alueet", ["asumi", "alue"]),
    ("Koulutus ja kulttuuri", ["koulutus", "tiede", "kulttuuri", "media", "tieto"]),
    ("Talous ja rahoitus", ["talous", "raha", "kauppa", "kulutus", "omistus"]),
    ("Ympäristö ja resurssit", ["luonnonvar", "energia", "ympäristö", "ruoka", "teknologia"]),
]
OTHER = "Muut"


def lane_of(theme):
    t = (theme or "").lower()
    for name, keys in LANES:
        if any(k in t for k in keys):
            return name
    return OTHER


def national(groups):
    for g in ("FI", "FI_HIST", "FI_REGISTER", "SSS", "KOKO MAA"):
        if g in groups:
            return groups[g]
    return next(iter(groups.values())) if len(groups) == 1 else None


def sig4(v):
    if v == 0:
        return 0
    return float(f"{v:.4g}")


def main():
    meta = {s["series_key"]: s for s in json.load(open(D + "series.json"))}
    raw = collections.defaultdict(lambda: collections.defaultdict(dict))
    for line in open(D + "values.ndjson"):
        k, y, g, v, kind = json.loads(line)
        if kind not in ("observed", "estimate") or v is None:
            continue
        try:
            y = int(y); v = float(v)
        except (TypeError, ValueError):
            continue
        if y <= LAST:
            raw[k][g][y] = v

    series = []
    for k, groups in raw.items():
        s = national(groups)
        if not s:
            continue
        ys = sorted(s)
        pos = all(s[y] > 0 for y in ys)
        ch = {b: (s[b] / s[a] - 1 if pos else s[b] - s[a]) for a, b in zip(ys, ys[1:]) if b - a == 1}
        vals = np.array(list(ch.values()))
        m = meta.get(k, {})
        # Sparse observations are available on the timeline and skipped by annual detectors.
        if m.get("frequency") == "5-year" and len(ys) >= 2:
            y0, y1 = ys[0], ys[-1]
            series.append({
                "k": k, "t": m.get("title") or k, "u": m.get("unit") or "",
                "lane": lane_of(m.get("theme")), "theme": m.get("theme") or "",
                "y0": y0, "v": [s.get(y) for y in range(y0, y1 + 1)],
                "f": "." * (y1 - y0 + 1), "sparse": True, "_ch": {},
            })
            continue
        if len(vals) < 15 or np.ptp(vals) == 0:
            continue
        lo, hi = np.quantile(vals, [0.05, 0.95])
        anom = {y: (c < lo or c > hi) for y, c in ch.items()}
        sd = np.std(list(s.values())) or 1
        score = {}
        for y in ys:
            if all((y + d) in s for d in range(-5, 6)):
                back = (s[y] - s[y - 5]) / sd; fwd = (s[y + 5] - s[y]) / sd
                score[y] = float((np.sign(back) != np.sign(fwd)) * abs(fwd - back))
        turn = {}
        if len(score) >= 10:
            thr = np.quantile(list(score.values()), 0.9)
            turn = {y: (v >= thr and v > 0) for y, v in score.items()}
        y0, y1 = ys[0], ys[-1]
        flags = []
        for y in range(y0, y1 + 1):
            if y not in ch:
                flags.append(".")  # ei vuosimuutosta
                continue
            a, t = anom.get(y, False), turn.get(y, False)
            flags.append("b" if a and t else "a" if a else "t" if t else "0")
        m = meta.get(k, {})
        series.append({
            "k": k, "t": m.get("title") or k, "u": m.get("unit") or "", "lane": lane_of(m.get("theme")),
            "theme": m.get("theme") or "", "y0": y0,
            "v": [sig4(s[y]) if y in s else None for y in range(y0, y1 + 1)],
            "f": "".join(flags), "_ch": ch,
        })
    print("sarjoja", len(series))

    # Kaksoiskappaleet: vuosimuutokset lähes samat (korrelaatio > 0,97, ≥ 15 yhteistä vuotta).
    parent = list(range(len(series)))
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]; i = parent[i]
        return i
    for i in range(len(series)):
        ci = series[i]["_ch"]
        for j in range(i + 1, len(series)):
            cj = series[j]["_ch"]
            common = ci.keys() & cj.keys()
            if len(common) < 15:
                continue
            a = np.array([ci[y] for y in common]); b = np.array([cj[y] for y in common])
            if a.std() == 0 or b.std() == 0:
                continue
            if np.corrcoef(a, b)[0, 1] > 0.97:
                parent[find(j)] = find(i)
    clusters = collections.defaultdict(list)
    for i in range(len(series)):
        clusters[find(i)].append(i)
    ndup = 0
    for members in clusters.values():
        if len(members) < 2:
            continue
        rep = max(members, key=lambda i: len(series[i]["v"]))
        for i in members:
            if i != rep:
                series[i]["dup"] = series[rep]["k"]; ndup += 1
    print("kaksoiskappaleita", ndup, "ryhmissä", sum(len(m) > 1 for m in clusters.values()))

    # Vuosittaiset osuudet ilman kaksoiskappaleita, sattuman raja sekoittamalla kunkin sarjan tapahtumavuodet.
    uniq = [s for s in series if "dup" not in s]
    def events(s, kinds):
        return {s["y0"] + i: (c in kinds) for i, c in enumerate(s["f"]) if c != "."}
    out_det = {}
    for det, kinds in (("a", "ab"), ("t", "tb")):
        ev = [events(s, kinds) for s in uniq]
        if det == "t":  # käänne on määritelty vain vuosille, joilla on ±5 vuotta
            ev = []
            for s in uniq:
                d = {}
                for i, c in enumerate(s["f"]):
                    y = s["y0"] + i
                    if c != "." and i >= 5 and i + 5 < len(s["f"]):
                        d[y] = c in kinds
                if sum(d.values()):
                    ev.append(d)
        n = collections.Counter(); f = collections.Counter()
        for d in ev:
            for y, x in d.items():
                n[y] += 1; f[y] += x
        random.seed(7); mx = []
        items = [(list(d), sum(d.values())) for d in ev]
        for _ in range(300):
            ff = collections.Counter()
            for yrs, m in items:
                for y in random.sample(yrs, m):
                    ff[y] += 1
            mx.append(max(ff[y] / n[y] for y in n if n[y] >= 30))
        fwe = float(np.quantile(mx, 0.95))
        years = [y for y in sorted(n) if n[y] >= 30]
        out_det[det] = {
            "threshold": round(fwe, 4),
            "base": round(sum(f.values()) / sum(n.values()), 4),
            "years": years,
            "share": [round(f[y] / n[y], 4) for y in years],
            "n": [n[y] for y in years],
        }
        sig = [y for y, sh in zip(years, out_det[det]["share"]) if sh > fwe]
        print(det, "raja", round(fwe, 3), "merkitsevät vuodet", sig)

    for s in series:
        del s["_ch"]
    lanes = [name for name, _ in LANES] + [OTHER]
    data = {
        "meta": {
            "source": "Turso: public__indicator_values (Murrosmatriisin tilastomuuttujat), havainnot ja arviot vuoteen 2025",
            "lanes": lanes,
            "detectors": {
                "a": "Poikkeama: vuosimuutos sarjan oman historian 5–95 %:n vaihteluvälin ulkopuolella",
                "t": "Käänne: viiden vuoden suunta vaihtuu ja muutos on sarjan suurimpien 10 %:n joukossa",
            },
        },
        "national": out_det,
        "series": series,
    }
    json.dump(data, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print("kirjoitettu", OUT, os.path.getsize(OUT) // 1024, "kt")
    print("elämänalueet", collections.Counter(s["lane"] for s in uniq).most_common())


if __name__ == "__main__":
    main()
