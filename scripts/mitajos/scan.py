"""Mitä jos -skannaus 1850–2025: missä Suomen kehitys erkani "synteettisestä Suomesta"?

Synteettinen Suomi on painotettu yhdistelmä vertailumaista (painot ≥ 0, summa 1), joka seuraa Suomen
kehitystä 15 vuotta ennen tarkasteltavaa vuotta T. Vertailu tehdään poikkeamina jakson keskiarvosta,
koska Suomi oli 1800-luvulla köyhempi kuin yksikään vertailumaa (tasoja ei voi yhdistellä).
Ero T…T+H on "mitä jos Suomi olisi kulkenut kuten verrokkinsa". Luotettavuus: sama laskenta jokaiselle
vertailumaalle (lumekäsittely); Suomen ero on merkittävä vain, jos se on suurempi kuin niillä.

Aineisto: Gapminder fasttrack (gdp_pcap, lex), joka perustuu pitkissä sarjoissa Maddisoniin ja
Human Mortality Databaseen. Lataus: python3 scan.py --fetch DIR, analyysi: python3 scan.py DIR
"""
import csv, json, os, sys, urllib.request
import numpy as np

URL = "https://raw.githubusercontent.com/open-numbers/ddf--gapminder--fasttrack/master/countries_etc_datapoints/ddf--datapoints--{}--by--country--time.csv"
INDICATORS = {"gdp_pcap": ("BKT asukasta kohti", True), "lex": ("Elinajanodote", False)}
# Vertailumaat, joilla on vuosittaiset (ei interpoloidut) sarjat 1850–1950. Irlanti, Itävalta, Kanada ja
# Uusi-Seelanti jätetään pois, koska niiden 1800-luvun sarjat ovat osin interpoloituja.
DONORS = ["swe", "nor", "dnk", "gbr", "nld", "bel", "fra", "deu", "che", "ita", "esp", "prt", "usa", "aus"]
NAMES = {"fin": "Suomi", "swe": "Ruotsi", "nor": "Norja", "dnk": "Tanska", "gbr": "Britannia", "nld": "Alankomaat",
         "bel": "Belgia", "fra": "Ranska", "deu": "Saksa", "che": "Sveitsi", "ita": "Italia", "esp": "Espanja",
         "prt": "Portugali", "usa": "Yhdysvallat", "aus": "Australia"}
FIRST, LAST = 1850, 2024  # Gapminderin sarjat jatkuvat ennusteina, käytetään vain toteutuneita vuosia
PRE, H = 15, 10


def load(d, ind):
    v = {}
    for c, t, x in list(csv.reader(open(os.path.join(d, ind + ".csv"))))[1:]:
        if c in DONORS or c == "fin":
            t = int(t)
            if t <= LAST:
                v.setdefault(c, {})[t] = float(x)
    return v


def valid_from(series, log):
    """Ensimmäinen vuosi interpoloinnin jälkeen: Gapminder täyttää puuttuvat vuodet tasaisella
    kasvulla, joten vähintään viiden samanlaisen peräkkäisen muutoksen jakso ennen 1950 on täytettä."""
    out = {}
    for c, v in series.items():
        ys = sorted(v)
        step = lambda y: round(v[y] / v[y - 1], 5) if log else round(v[y] - v[y - 1], 3)
        start, run, prev = ys[0], 0, None
        for y in ys[1:]:
            if y > 1950:
                break
            st = step(y)
            run = run + 1 if st == prev else 0
            prev = st
            if run >= 4:
                start = y + 1
        out[c] = start
    return out


def simplex_weights(X, y, iters=3000):
    """min ||Xw − y||², w ≥ 0, Σw = 1 (projisoitu gradientti)."""
    n = X.shape[1]
    w = np.full(n, 1 / n)
    L = np.linalg.norm(X, 2) ** 2 + 1e-12
    for _ in range(iters):
        w = w - (X.T @ (X @ w - y)) / L
        # projektio simpleksille
        u = np.sort(w)[::-1]; css = np.cumsum(u)
        r = np.nonzero(u * np.arange(1, n + 1) > (css - 1))[0][-1]
        w = np.maximum(w - (css[r] - 1) / (r + 1), 0)
    return w


def gap_path(series, treated, donors, T, log):
    f = (lambda x: np.log(x)) if log else (lambda x: x)
    pre = range(T - PRE, T)
    post = range(T, min(T + H, LAST) + 1)
    yr = list(pre) + list(post)
    Y = np.array([[f(series[c][t]) for t in yr] for c in [treated] + donors])
    Y = Y - Y[:, :PRE].mean(axis=1, keepdims=True)
    y, X = Y[0], Y[1:].T
    w = simplex_weights(X[:PRE], y[:PRE])
    g = y - X @ w
    pre_rmspe = np.sqrt(np.mean(g[:PRE] ** 2))
    post_rmspe = np.sqrt(np.mean(g[PRE:] ** 2))
    return g, w, pre_rmspe, post_rmspe


def synth(s, valid, T, log, pool):
    """Suomen ero synteettiseen Suomeen ja lumekäsittelyt. pool = käytettävät vertailumaat."""
    donors = [c for c in pool if valid[c] <= T - PRE]
    if valid["fin"] > T - PRE or len(donors) < 3:
        return None
    g, w, pr, po = gap_path(s, "fin", donors, T, log)
    ratio = po / max(pr, 1e-9)
    plac = []
    for c in donors:
        _, _, a, b = gap_path(s, c, [x for x in donors if x != c], T, log)
        plac.append(b / max(a, 1e-9))
    rank = 1 + sum(r >= ratio for r in plac)
    return g, w, pr, ratio, rank, donors


# Ennalta nimetyt mitä jos -tilanteet. Vertailumaat rajataan niin, ettei sama tapahtuma osu niihin.
EVENTS = [
    {"id": "nalka", "label": "Nälkävuodet 1867–68", "T": 1866, "ind": "lex", "pool": DONORS},
    {"id": "1918", "label": "Sisällissota 1918", "T": 1917, "ind": "gdp_pcap", "pool": ["swe", "nor", "dnk", "nld", "che", "esp"]},
    {"id": "1918l", "label": "Sisällissota 1918", "T": 1917, "ind": "lex", "pool": ["swe", "nor", "dnk", "nld", "che", "esp"]},
    {"id": "sota", "label": "Sodat 1939–44", "T": 1939, "ind": "gdp_pcap", "pool": ["swe", "che", "esp", "prt", "usa", "aus"]},
    {"id": "jalleen", "label": "Jälleenrakennus ja kiinnikuronta 1950–", "T": 1950, "ind": "gdp_pcap", "pool": DONORS},
    {"id": "terveys", "label": "Kansanterveystyö 1970-luvulla", "T": 1972, "ind": "lex", "pool": DONORS},
    {"id": "lama", "label": "1990-luvun lama", "T": 1990, "ind": "gdp_pcap", "pool": DONORS},
    {"id": "finanssi", "label": "Finanssikriisi ja menetetty vuosikymmen", "T": 2008, "ind": "gdp_pcap", "pool": DONORS},
]


def main(d):
    out = {"donors": DONORS, "names": NAMES, "pre": PRE, "h": H, "indicators": {}, "events": []}
    data = {}
    for ind, (label, log) in INDICATORS.items():
        s = load(d, ind)
        valid = valid_from(s, log)
        data[ind] = (s, valid, log)
        print(label, "aineisto alkaa", {c: y for c, y in valid.items() if y > 1800})
        rows = []
        for T in range(FIRST + 1, LAST - 4):
            r = synth(s, valid, T, log, DONORS)
            if not r:
                continue
            g, w, pr, ratio, rank, donors = r
            post = g[PRE:]
            rows.append({
                "T": T, "p": int(rank) / (len(donors) + 1), "rank": int(rank), "nDonors": len(donors), "ratio": round(float(ratio), 2),
                "preRmspe": round(float(pr), 4),
                "gapEnd": round(float(post[-1]), 4), "gapMin": round(float(post.min()), 4), "gapMax": round(float(post.max()), 4),
                "gap": [round(float(x), 4) for x in g],
                "weights": {c: round(float(x), 3) for c, x in zip(donors, w) if x > 0.01},
            })
        out["indicators"][ind] = {"label": label, "log": log, "rows": rows}
        print(label)
        for r in rows:
            if r["rank"] <= 2:
                unit = "%" if log else "v"
                ge = (np.exp(r["gapEnd"]) - 1) * 100 if log else r["gapEnd"]
                print(f"  T={r['T']} sija {r['rank']}/{r['nDonors'] + 1} ratio {r['ratio']:6.1f} ero T+{H}: {ge:+.1f} {unit}  painot {r['weights']}")
    for e in EVENTS:
        s, valid, log = data[e["ind"]]
        r = synth(s, valid, e["T"], log, e["pool"])
        if not r:
            print("ei aineistoa", e["label"]); continue
        g, w, pr, ratio, rank, donors = r
        conv = (lambda x: (np.exp(x) - 1) * 100) if log else (lambda x: x)
        path = [round(float(conv(x)), 2) for x in g]
        ev = {**{k: e[k] for k in ("id", "label", "T", "ind")}, "donors": donors, "rank": int(rank), "n": len(donors) + 1,
              "preRmspe": round(float(conv(pr)) if log else float(pr), 2), "path": path,
              "weights": {c: round(float(x), 3) for c, x in zip(donors, w) if x > 0.01}}
        out["events"].append(ev)
        print(f"{e['label']} ({e['ind']}, T={e['T']}): sija {rank}/{len(donors) + 1}, esijakson virhe {ev['preRmspe']}, "
              f"ero T+0..T+{H}: {path[PRE:]} painot {ev['weights']}")
    json.dump(out, open(os.path.join(d, "mitajos.json"), "w"), ensure_ascii=False)


if __name__ == "__main__":
    if sys.argv[1] == "--fetch":
        d = sys.argv[2]; os.makedirs(d, exist_ok=True)
        for ind in INDICATORS:
            urllib.request.urlretrieve(URL.format(ind), os.path.join(d, ind + ".csv"))
    else:
        main(sys.argv[1])
