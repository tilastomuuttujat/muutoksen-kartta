"""Kirjoittaa /mitajos-näkymän aineiston: src/data/mitajos.json.

Jokaisesta nimetystä tilanteesta: vuodet, Suomen havaitut arvot, synteettinen Suomi samassa
yksikössä, Suomen ja jokaisen vertailumaan (lumekäsittely) ero sekä painot ja sija. Lisäksi koko
skannauksen sijat vuosittain (missä Suomi poikkesi eniten). Käyttö: python3 build-site-data.py DATA_DIR
(DATA_DIR sisältää gdp_pcap.csv ja lex.csv, ks. scan.py --fetch).
"""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import scan

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "mitajos.json")


def r(x, d):
    return round(float(x), d)


def main(d):
    data = {}
    for ind, (_, log) in scan.INDICATORS.items():
        s = scan.load(d, ind)
        data[ind] = (s, scan.valid_from(s, log), log)

    events = []
    for e in scan.EVENTS:
        s, valid, log = data[e["ind"]]
        T = e["T"]
        res = scan.synth(s, valid, T, log, e["pool"])
        g, w, pr, ratio, rank, donors = res
        years = list(range(T - scan.PRE, min(T + scan.H, scan.LAST) + 1))
        conv = (lambda x: (np.exp(x) - 1) * 100) if log else (lambda x: x)
        f = np.log if log else (lambda x: x)
        actual = [s["fin"][y] for y in years]
        # Synteettinen Suomi samassa yksikössä: Suomen havaittu arvo miinus ero (muunnetussa asteikossa).
        synth_lvl = [float(np.exp(f(a) - gi)) if log else a - gi for a, gi in zip(actual, g)]
        placebo = {}
        for c in donors:
            pg, *_ = scan.gap_path(s, c, [x for x in donors if x != c], T, log)
            placebo[c] = [r(conv(x), 2) for x in pg]
        events.append({
            "id": e["id"], "ind": e["ind"], "T": T, "years": years,
            "actual": [r(a, 2) for a in actual], "synthetic": [r(a, 2) for a in synth_lvl],
            "gap": [r(conv(x), 2) for x in g], "placebo": placebo,
            "weights": {c: r(x, 3) for c, x in zip(donors, w) if x > 0.01},
            "rank": int(rank), "n": len(donors) + 1, "preRmspe": r(conv(pr), 2),
        })

    scanrows = {}
    for ind, (s, valid, log) in data.items():
        rows = []
        for T in range(scan.FIRST + 1, scan.LAST - 4):
            res = scan.synth(s, valid, T, log, scan.DONORS)
            if res:
                rows.append([T, int(res[4]), len(res[5]) + 1])
        scanrows[ind] = rows
        print(ind, len(rows), "vuotta")

    out = {
        "source": "Gapminder fasttrack (gdp_pcap, lex; pitkät sarjat Maddison ja Human Mortality Database)",
        "pre": scan.PRE, "h": scan.H, "names": scan.NAMES,
        "indicators": {k: {"label": v[0], "log": v[1]} for k, v in scan.INDICATORS.items()},
        "events": events, "scan": scanrows,
    }
    json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print("kirjoitettu", OUT, os.path.getsize(OUT) // 1024, "kt")


if __name__ == "__main__":
    main(sys.argv[1])
