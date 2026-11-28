"""Selittämätön (docs/selittamaton.md): tunnettujen selitysten jäännökset kolmessa arvoituksessa → src/data/selittamaton.json.

Aja: python3 scripts/selittamaton/build.py  (GMD_DTA osoittaa Global Macro Databasen tiedostoon; muuten se ladataan /tmp:hen)
"""
import json
import math
import os
import time
import urllib.request
from datetime import date

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "src", "data", "selittamaton.json")
EUROSTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
GMD_URL = "https://gmd-releases.s3.ap-southeast-2.amazonaws.com/data/distribute/GMD_2026_09.dta"
EU = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "EL", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
      "PL", "PT", "RO", "SK", "SI", "ES", "SE", "NO", "IS", "CH", "UK"]
NAMES = {"AT": "Itävalta", "BE": "Belgia", "BG": "Bulgaria", "HR": "Kroatia", "CY": "Kypros", "CZ": "Tšekki", "DK": "Tanska",
         "EE": "Viro", "FI": "Suomi", "FR": "Ranska", "DE": "Saksa", "EL": "Kreikka", "HU": "Unkari", "IE": "Irlanti", "IT": "Italia",
         "LV": "Latvia", "LT": "Liettua", "LU": "Luxemburg", "MT": "Malta", "NL": "Alankomaat", "PL": "Puola", "PT": "Portugali",
         "RO": "Romania", "SK": "Slovakia", "SI": "Slovenia", "ES": "Espanja", "SE": "Ruotsi", "NO": "Norja", "IS": "Islanti",
         "CH": "Sveitsi", "UK": "Iso-Britannia"}


def eurostat(dataset, params):
    """{geo: {vuosi: arvo}}; kuukausitiedot keskiarvoistetaan vuosittain."""
    geos = "&".join(f"geo={g}" for g in EU)
    url = f"{EUROSTAT}{dataset}?{params}&{geos}&format=JSON&lang=en"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=180) as r:
                d = json.load(r)
            break
        except Exception:
            if attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))
    ids, size = d["id"], d["size"]
    cats = [{v: k for k, v in d["dimension"][i]["category"]["index"].items()} for i in ids]
    acc = {}
    for pos, v in d["value"].items():
        p, idx = int(pos), []
        for s_ in reversed(size):
            idx.append(p % s_); p //= s_
        idx.reverse()
        k = {ids[j]: cats[j][idx[j]] for j in range(len(ids))}
        acc.setdefault(k["geo"], {}).setdefault(int(k["time"][:4]), []).append(float(v))
    return {g: {y: float(np.mean(vs)) for y, vs in ys.items()} for g, ys in acc.items()}


def gmd():
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    import pandas as pd
    return pd.read_stata(path, columns=["ISO3", "countryname", "year", "income_group", "unemp", "rGDP", "gen_govexp_GDP", "govexp_GDP",
                                        "inv_GDP", "REER", "exports_GDP"])


def change(s, a, b, log=False):
    if s is None or a not in s or b not in s:
        return None
    if log:
        return math.log(s[b] / s[a]) if s[a] > 0 and s[b] > 0 else None
    return s[b] - s[a]


def mean_of(s, ys):
    if s is None or not all(y in s for y in ys):
        return None
    return float(np.mean([s[y] for y in ys]))


def ols(X, y):
    A = np.column_stack([np.ones(len(y)), X])
    b, *_ = np.linalg.lstsq(A, y, rcond=None)
    return b


def ranks(v):
    o = np.argsort(v, kind="stable"); r = np.empty(len(v)); r[o] = np.arange(len(v)); return r


def bh(ps):
    n = len(ps); order = sorted(range(n), key=lambda i: ps[i]); q = [0.0] * n; prev = 1.0
    for rank, i in reversed(list(enumerate(order, 1))):
        prev = min(prev, ps[i] * n / rank); q[i] = prev
    return q


def analyze(Y, K, C, names, common_gap, rng_seed=1):
    """Y: {maa: arvo}; K: [(id, nimi, {maa: arvo})]; C: [(id, nimi, {maa: arvo}, ennustettu etumerkki)]."""
    rng = np.random.default_rng(rng_seed)
    candidates_all = sorted(Y)
    countries = [c for c in candidates_all if all(c in k[2] and k[2][c] is not None for k in K) and Y[c] is not None]
    dropped = [c for c in candidates_all if c not in countries]
    y = np.array([Y[c] for c in countries])
    X = np.array([[k[2][c] for k in K] for c in countries])
    n = len(countries)
    loo = np.empty(n)
    for i in range(n):
        m = np.arange(n) != i
        b = ols(X[m], y[m])
        loo[i] = b[0] + X[i] @ b[1:]
    res = y - loo
    loo_r2 = 1 - float(np.sum(res ** 2) / np.sum((y - y.mean()) ** 2))
    full = ols(X, y)
    fit_r2 = 1 - float(np.sum((y - (full[0] + X @ full[1:])) ** 2) / np.sum((y - y.mean()) ** 2))
    Z = (X - X.mean(0)) / X.std(0)
    beta = ols(Z, (y - y.mean()) / y.std())[1:]
    out = {"n": n, "countries": countries, "dropped": dropped, "looR2": round(loo_r2, 3), "fitR2": round(fit_r2, 3),
           "unexplained": round(1 - loo_r2, 3),
           "known": [{"id": k[0], "label": k[1], "beta": round(float(bb), 3)} for k, bb in zip(K, beta)],
           "rows": [{"geo": c, "name": names.get(c, c), "y": round(float(Y[c]), 4), "pred": round(float(p), 4), "res": round(float(r), 4)}
                    for c, p, r in zip(countries, loo, res)]}
    if common_gap:
        boots = []
        for _ in range(2000):
            idx = rng.integers(0, n, n)
            boots.append(ols(X[idx], y[idx])[0])
        out["commonGap"] = {"value": round(float(full[0]), 4), "lo": round(float(np.percentile(boots, 5)), 4),
                            "hi": round(float(np.percentile(boots, 95)), 4), "meanY": round(float(y.mean()), 4)}
    sd = float(np.std(res, ddof=1))
    if "FI" in countries:
        i = countries.index("FI")
        out["finland"] = {"y": round(float(y[i]), 4), "pred": round(float(loo[i]), 4), "res": round(float(res[i]), 4),
                          "z": round(float(res[i] / sd), 2), "rankFromLowest": int(sorted(res).index(res[i]) + 1), "of": n}
    elif "FIN" in countries:
        i = countries.index("FIN")
        out["finland"] = {"y": round(float(y[i]), 4), "pred": round(float(loo[i]), 4), "res": round(float(res[i]), 4),
                          "z": round(float(res[i] / sd), 2), "rankFromHighest": int(sorted(res, reverse=True).index(res[i]) + 1), "of": n}
    resid = dict(zip(countries, res))
    cand, ps = [], []
    for cid, label, vals, sign in C:
        cs = [c for c in countries if c in vals and vals[c] is not None]
        if len(cs) < 8:
            cand.append({"id": cid, "label": label, "n": len(cs), "rho": None, "p": None, "predicted": sign}); ps.append(1.0); continue
        rx, ry = ranks(np.array([vals[c] for c in cs])), ranks(np.array([resid[c] for c in cs]))
        rho = float(np.corrcoef(rx, ry)[0, 1])
        perm = np.array([np.corrcoef(rx, rng.permutation(ry))[0, 1] for _ in range(10000)])
        p = float(np.mean(np.abs(perm) >= abs(rho) - 1e-12))
        cand.append({"id": cid, "label": label, "n": len(cs), "rho": round(rho, 3), "p": round(p, 4), "predicted": sign,
                     "points": [{"geo": c, "x": round(float(vals[c]), 3), "res": round(float(resid[c]), 4)} for c in cs]})
        ps.append(p)
    qs = bh(ps)
    for c_, q in zip(cand, qs):
        c_["q"] = round(q, 4)
        if c_["rho"] is None:
            c_["verdict"] = "ei aineistoa"
        elif q < 0.1:
            c_["verdict"] = "jäljellä" if (c_["rho"] < 0) == (c_["predicted"] < 0) else "väärä suunta"
        else:
            c_["verdict"] = "ei yhteyttä"
    out["candidates"] = cand
    return out


def fertility():
    tfr = eurostat("demo_find", "indic_de=TOTFERRT")
    age1 = eurostat("demo_find", "indic_de=AGEMOTH1")
    gdp = eurostat("nama_10_pc", "unit=CLV10_EUR_HAB&na_item=B1GQ")
    u = eurostat("lfsa_urgan", "age=Y25-29&sex=T&citizen=TOTAL&unit=PC")
    hpi = eurostat("prc_hpi_a", "purchase=TOTAL&unit=I15_A_AVG")
    hicp = eurostat("prc_hicp_aind", "coicop=CP00&unit=INX_A_AVG")
    edf = eurostat("edat_lfse_03", "isced11=ED5-8&age=Y25-34&sex=F&unit=PC")
    edm = eurostat("edat_lfse_03", "isced11=ED5-8&age=Y25-34&sex=M&unit=PC")
    conf = eurostat("ei_bsco_m", "indic=BS-CSMCI&s_adj=SA&unit=BAL")
    par = eurostat("ilc_lvps08", "age=Y25-34&sex=T&unit=PC")
    net = eurostat("isoc_ci_ifp_fu", "indic_is=I_IDAY&ind_type=IND_TOTAL&unit=PC_IND")
    rhpi = {g: {y: hpi[g][y] / hicp[g][y] for y in hpi[g] if g in hicp and y in hicp[g]} for g in hpi}
    Y = {g: change(tfr.get(g), 2010, 2023, log=True) for g in EU}
    Y = {g: v for g, v in Y.items() if v is not None}
    K = [("K1", "Talous: BKT asukasta kohden 2010 → 2019", {g: change(gdp.get(g), 2010, 2019, True) for g in EU}),
         ("K2", "Nuorten aikuisten työttömyys 2010–19 vs. 2002–08", {g: (lambda a, b: None if a is None or b is None else a - b)(mean_of(u.get(g), range(2010, 2020)), mean_of(u.get(g), range(2002, 2009))) for g in EU}),
         ("K3", "Asuntojen reaalihinnat 2010 → 2019", {g: change(rhpi.get(g), 2010, 2019, True) for g in EU}),
         ("K4", "Esikoisäidin iän nousu 2010 → 2022", {g: change(age1.get(g), 2010, 2022) for g in EU}),
         ("K5", "Naisten korkea-asteen koulutus 2010 → 2023", {g: change(edf.get(g), 2010, 2023) for g in EU}),
         ("K6", "Kuluttajien luottamus 2010–19 vs. 2000–09", {g: (lambda a, b: None if a is None or b is None else a - b)(mean_of(conf.get(g), range(2010, 2020)), mean_of(conf.get(g), range(2000, 2010))) for g in EU})]
    gap = {g: (None if edf.get(g) is None or edm.get(g) is None or not all(y in edf[g] and y in edm[g] for y in (2010, 2023))
               else (edf[g][2023] - edm[g][2023]) - (edf[g][2010] - edm[g][2010])) for g in EU}
    C = [("C1", "Nuoret aikuiset asuvat vanhempien luona (25–34, muutos 2010 → 2023)", {g: change(par.get(g), 2010, 2023) for g in EU}, -1),
         ("C2", "Päivittäinen internetin käyttö (muutos 2010 → 2019)", {g: change(net.get(g), 2010, 2019) for g in EU}, -1),
         ("C3", "Koulutuksen sukupuoliero 25–34 (naiset − miehet, muutos 2010 → 2023)", gap, -1)]
    r = analyze(Y, K, C, NAMES, common_gap=True)
    # Jälkikäteinen herkkyystarkistus (28.11.2026, ei rekisteröity): ilman K6:ta, jonka vertailujakso karsi 12 maata.
    s6 = analyze(Y, K[:5], C, NAMES, common_gap=True)
    r["sensitivityNoK6"] = {k_: s6[k_] for k_ in ("n", "looR2", "fitR2", "unexplained", "commonGap", "finland", "known", "dropped")}
    r["sensitivityNoK6"]["candidates"] = [{k_: c_[k_] for k_ in ("id", "rho", "p", "q", "verdict", "n")} for c_ in s6["candidates"]]
    r["series"] = {g: sorted((y, round(v, 3)) for y, v in tfr[g].items() if y >= 1990) for g in ("FI", "SE", "NO", "DK", "FR", "DE") if g in tfr}
    return r


def unemployment():
    import pandas as pd
    d = gmd()
    S, names = {}, {}
    for iso, g in d.groupby("ISO3"):
        g = g.set_index("year")
        inc = g["income_group"].dropna()
        if inc.empty or inc.iloc[-1] != "High income":
            continue
        S[iso] = g; names[iso] = str(g["countryname"].iloc[0])
    FI_NAMES = {"FIN": "Suomi", "SWE": "Ruotsi", "NOR": "Norja", "DNK": "Tanska", "DEU": "Saksa", "FRA": "Ranska", "ITA": "Italia",
                "ESP": "Espanja", "GBR": "Iso-Britannia", "USA": "Yhdysvallat", "JPN": "Japani", "CAN": "Kanada", "AUS": "Australia",
                "NZL": "Uusi-Seelanti", "AUT": "Itävalta", "BEL": "Belgia", "NLD": "Alankomaat", "CHE": "Sveitsi", "IRL": "Irlanti",
                "PRT": "Portugali", "GRC": "Kreikka", "ISL": "Islanti", "LUX": "Luxemburg", "KOR": "Etelä-Korea", "ISR": "Israel",
                "CYP": "Kypros", "HUN": "Unkari", "CHL": "Chile", "BRB": "Barbados", "CRI": "Costa Rica", "HKG": "Hongkong", "PAN": "Panama",
                "SGP": "Singapore", "TTO": "Trinidad ja Tobago", "TWN": "Taiwan", "URY": "Uruguay", "PRI": "Puerto Rico", "SMR": "San Marino"}
    names.update(FI_NAMES)
    ok = lambda v: v is not None and pd.notna(v)
    def col(iso, c):
        return {int(y): float(v) for y, v in S[iso][c].items() if ok(v)}
    Y, K1, K2, K3, C1, C2, C3 = {}, {}, {}, {}, {}, {}, {}
    for iso in S:
        u = col(iso, "unemp")
        if not all(y in u for y in range(1980, 2020)):
            continue
        Y[iso] = float(np.mean([u[y] for y in range(2000, 2020)]) - np.mean([u[y] for y in range(1980, 1990)]))
        rg = col(iso, "rGDP")
        K1[iso] = (math.log(rg[2019] / rg[1999]) / 20) if 1999 in rg and 2019 in rg and rg[1999] > 0 else None
        K2[iso] = max(u[y] for y in range(1990, 2000)) - float(np.mean([u[y] for y in range(1980, 1990)]))
        ge = col(iso, "gen_govexp_GDP")
        if not all(y in ge for y in range(2000, 2020)):
            ge = col(iso, "govexp_GDP")
        K3[iso] = mean_of(ge, range(2000, 2020))
        C1[iso] = mean_of(col(iso, "inv_GDP"), range(2000, 2020))
        C2[iso] = change(col(iso, "REER"), 1990, 2019, log=True)
        C3[iso] = change(col(iso, "exports_GDP"), 1990, 2019)
    K = [("K1", "Kasvu: reaalinen BKT 2000–2019, keskim. vuosikasvu", K1),
         ("K2", "Hystereesi: 1990-luvun työttömyyshuippu vs. 1980-luku", K2),
         ("K3", "Julkiset menot / BKT 2000–2019", K3)]
    C = [("C1", "Investoinnit / BKT 2000–2019", C1, -1), ("C2", "Reaalinen valuuttakurssi 1990 → 2019", C2, 1),
         ("C3", "Viennin BKT-osuus 1990 → 2019", C3, -1)]
    r = analyze(Y, K, C, names, common_gap=False)
    r["series"] = {iso: sorted((y, round(v, 2)) for y, v in col(iso, "unemp").items() if 1970 <= y <= 2025) for iso in ("FIN", "SWE", "DEU", "USA") if iso in S}
    return r


def debt():
    dti = eurostat("nasa_10_ki", "sector=S14_S15&na_item=DIR_S14_S15&unit=PC")
    lt = eurostat("irt_lt_mcby_a", "int_rt=MCBY")
    hpi = eurostat("prc_hpi_a", "purchase=TOTAL&unit=I15_A_AVG")
    hicp = eurostat("prc_hicp_aind", "coicop=CP00&unit=INX_A_AVG")
    inc = eurostat("nasa_10_ki", "sector=S14_S15&na_item=B7G_R_HAB_2010&unit=PC")
    own = eurostat("ilc_lvho02", "rskpovth=TOTAL&hhcomp=TOTAL&tenure=OWN&unit=PC")
    hinv = eurostat("nasa_10_ki", "sector=S14_S15&na_item=P51G_RAT_GDP_S14_S15&unit=PC")
    sav = eurostat("nasa_10_ki", "sector=S14_S15&na_item=SRG_S14_S15&unit=PC")
    rhpi = {g: {y: hpi[g][y] / hicp[g][y] for y in hpi[g] if g in hicp and y in hicp[g]} for g in hpi}
    Y = {g: change(dti.get(g), 2008, 2023) for g in EU}
    Y = {g: v for g, v in Y.items() if v is not None}
    K = [("K1", "Pitkä korko 2015–21 vs. 2003–07", {g: (lambda a, b: None if a is None or b is None else a - b)(mean_of(lt.get(g), range(2015, 2022)), mean_of(lt.get(g), range(2003, 2008))) for g in EU}),
         ("K2", "Asuntojen reaalihinnat 2008 → 2023", {g: change(rhpi.get(g), 2008, 2023, True) for g in EU}),
         ("K3", "Reaaliset käytettävissä olevat tulot 2008 → 2023", {g: change(inc.get(g), 2008, 2023, True) for g in EU}),
         ("K4", "Velkaantumisaste 2008 (lähtötaso)", {g: (dti.get(g) or {}).get(2008) for g in EU})]
    C = [("C1", "Omistusasumisen osuus 2010 → 2023", {g: change(own.get(g), 2010, 2023) for g in EU}, 1),
         ("C2", "Kotitalouksien investoinnit / BKT 2008–2023", {g: mean_of(hinv.get(g), range(2008, 2024)) for g in EU}, 1),
         ("C3", "Säästämisaste 2008 → 2023", {g: change(sav.get(g), 2008, 2023) for g in EU}, -1)]
    r = analyze(Y, K, C, NAMES, common_gap=False)
    r["series"] = {g: sorted((y, round(v, 1)) for y, v in dti[g].items() if y >= 1995) for g in ("FI", "SE", "DK", "NL", "DE", "ES", "IE") if g in dti}
    return r


def main():
    out = {"built": str(date.today()), "puzzles": {"syntyvyys": fertility(), "tyottomyys": unemployment(), "velka": debt()}}
    json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    for k, r in out["puzzles"].items():
        print(f"== {k}: n={r['n']} pudotettu={len(r['dropped'])} LOO-R2={r['looR2']} sovite-R2={r['fitR2']} selittämätön={r['unexplained']}")
        print("   K:", [(x['id'], x['beta']) for x in r["known"]])
        if "commonGap" in r:
            print("   yhteinen aukko:", r["commonGap"])
        print("   Suomi:", r.get("finland"))
        for c in r["candidates"]:
            print("   ", c["id"], c["label"], "n", c["n"], "rho", c["rho"], "p", c["p"], "q", c["q"], c["verdict"])


if __name__ == "__main__":
    main()
