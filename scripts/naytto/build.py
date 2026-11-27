"""Näyttöverkon testit (docs/naytto-rekisteri.md) → src/data/naytto.json.

Lähteet: Turson indikaattorivienti (SKANNAUS_DIR/values.ndjson, ks. scripts/skannauskoe/fetch.py),
Tilastokeskuksen PxWeb (12dt, 12du, 115w, 13u5, 11ay) sekä aiemmin tehdyt testit
(scripts/skannauskoe/h1990_test.py, src/data/mitajos.json). Ajo:
SKANNAUS_DIR=scan-data/ H1990_RESULT=scan-data/h1990_result.json python3 scripts/naytto/build.py
"""
import json, math, os, random, re, time, urllib.request
from datetime import date
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
OUT = os.path.join(ROOT, "src", "data", "naytto.json")
D = os.environ.get("SKANNAUS_DIR", "scan-data/")
PX = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/"
COUNTRIES = ["FI", "SE", "NO", "DK"]


def px(table, query):
    sel = lambda v: {"filter": "all", "values": ["*"]} if v == "*" else {"filter": "item", "values": v}
    body = json.dumps({"query": [{"code": c, "selection": sel(v)} for c, v in query],
                       "response": {"format": "json-stat2"}}).encode()
    for attempt in range(5):
        try:
            req = urllib.request.Request(PX + table, data=body, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.load(r)
            break
        except Exception:
            if attempt == 4:
                raise
            time.sleep(3 * (attempt + 1))
    ids, size = d["id"], d["size"]
    cats = [sorted(d["dimension"][i]["category"]["index"], key=d["dimension"][i]["category"]["index"].get) for i in ids]
    out = {}
    for pos, v in enumerate(d["value"]):
        if v is None:
            continue
        idx, p = [], pos
        for s in reversed(size):
            idx.append(p % s); p //= s
        idx.reverse()
        out[tuple(cats[j][idx[j]] for j in range(len(ids)))] = v
    return ids, out


# ——— yhteiset menetelmät (samat kuin src/lib/scanner.ts: rajaus 5–95 %, AR(1)-suodatus) ———

def changes(series, log):
    return {y: (math.log(series[y]) - math.log(series[y - 1]) if log else series[y] - series[y - 1])
            for y in series if y - 1 in series}


def prewhiten(ch):
    if len(ch) < 10:
        return {}
    vals = sorted(ch.values())
    q = lambda p: float(np.quantile(vals, p))
    lo, hi = q(0.05), q(0.95)
    w = {y: min(hi, max(lo, v)) for y, v in ch.items()}
    m = sum(w.values()) / len(w)
    num = sum((v - m) * (w[y - 1] - m) for y, v in w.items() if y - 1 in w)
    den = sum((v - m) ** 2 for v in w.values())
    phi = num / den if den else 0
    return {y: v - m - phi * (w[y - 1] - m) for y, v in w.items() if y - 1 in w}


def pairs(x, y, lag):
    """(x[t−lag], y[t]) -parit."""
    return [(x[t - lag], y[t]) for t in y if t - lag in x]


def corr(ps):
    if len(ps) < 8:
        return None, len(ps)
    a = np.array(ps)
    return float(np.corrcoef(a[:, 0], a[:, 1])[0, 1]), len(ps)


def p_two_sided(r, n):
    z = math.atanh(min(0.999999, abs(r))) * math.sqrt(max(1, n - 3))
    return math.erfc(z / math.sqrt(2))


def lead_corr(cause, effect, lags=(1, 2)):
    """Vahvin viivekorrelaatio (syy edellä), Šidákin korjaus viiveiden määrälle."""
    best = None
    for k in lags:
        r, n = corr(pairs(cause, effect, k))
        if r is not None and (best is None or abs(r) > abs(best[0])):
            best = (r, n, k)
    if best is None:
        return None
    r, n, k = best
    p = 1 - (1 - p_two_sided(r, n)) ** len(lags)
    return {"r": round(r, 3), "n": n, "lag": k, "p": round(p, 4)}


# ——— H1: nuorten naisten työttömyys → syntyvyys ———

def turso_nordic():
    keys = {"nordics.unemployment_rate_25_34_women_1990_2024": "uw", "nordics.unemployment_rate_25_34_men_1990_2024": "um",
            "nordics.tfr_1950_2024": "tfr"}
    out = {v: {c: {} for c in COUNTRIES} for v in keys.values()}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g, v, kind = json.loads(line)
        if k in keys and g in COUNTRIES and v is not None and kind in ("observed", "estimate"):
            out[keys[k]][g][int(y)] = float(v)
    # TFR vain vuosittaiselta jaksolta (Turson sarjassa ennen 1990 viiden vuoden välein)
    for c in COUNTRIES:
        out["tfr"][c] = {y: v for y, v in out["tfr"][c].items() if y >= 1990}
    return out


def h1(nordic, fi_tfr):
    tfr = {c: dict(nordic["tfr"][c]) for c in COUNTRIES}
    tfr["FI"].update({y: v for y, v in fi_tfr.items() if y >= 1990})  # Tilastokeskuksen virallinen, myös 2025
    pw = {c: prewhiten(changes(tfr[c], True)) for c in COUNTRIES}
    res = {}
    for key in ("uw", "um"):
        per = {}
        pooled = {1: [], 2: []}
        for c in COUNTRIES:
            u = prewhiten(changes(nordic[key][c], False))
            per[c] = lead_corr(u, pw[c])
            for k in (1, 2):
                pooled[k] += pairs(u, pw[c], k)
        best = None
        for k in (1, 2):
            r, n = corr(pooled[k])
            if best is None or abs(r) > abs(best[0]):
                best = (r, n, k)
        r, n, k = best
        res[key] = {"countries": per, "pooled": {"r": round(r, 3), "n": n, "lag": k,
                                                    "p": round(1 - (1 - p_two_sided(r, n)) ** 2, 4)}}
        # Toisto ilman Suomea, josta yhteys löydettiin (tiukempi tarkistus)
        oth = {1: [], 2: []}
        for c in ("SE", "NO", "DK"):
            u = prewhiten(changes(nordic[key][c], False))
            for k in (1, 2):
                oth[k] += pairs(u, pw[c], k)
        best = max(((corr(oth[k])[0], corr(oth[k])[1], k) for k in (1, 2)), key=lambda x: abs(x[0]))
        res[key]["others"] = {"r": round(best[0], 3), "n": best[1], "lag": best[2],
                              "p": round(1 - (1 - p_two_sided(best[0], best[1])) ** 2, 4)}
    t1 = res["uw"]
    others = {c: t1["countries"][c] for c in ("SE", "NO", "DK")}
    t1_result = "tukee" if t1["pooled"]["r"] < 0 and t1["pooled"]["p"] < 0.05 else "kumoaa" if t1["pooled"]["r"] >= 0 else "ei-ratkea"
    t3_result = "tukee" if res["uw"]["pooled"]["r"] < res["um"]["pooled"]["r"] else "ei-ratkea"

    # Ennuste: yhdistetty malli Δlog TFR(t) = a + b ΔU(t−2), raa'oilla muutoksilla (ei suodatusta)
    xs, ys = [], []
    for c in COUNTRIES:
        du = changes(nordic["uw"][c], False)
        dt = changes(tfr[c], True)
        for t in dt:
            if t - 2 in du:
                xs.append(du[t - 2]); ys.append(dt[t])
    X = np.column_stack([np.ones(len(xs)), xs])
    coef, *_ = np.linalg.lstsq(X, np.array(ys), rcond=None)
    resid = np.array(ys) - X @ coef
    sd = float(np.std(resid, ddof=2))
    du_fi = changes(nordic["uw"]["FI"], False)
    last_tfr_year = max(tfr["FI"])
    preds = []
    level = tfr["FI"][last_tfr_year]
    for target in (last_tfr_year + 1, last_tfr_year + 2):
        if target - 2 not in du_fi:
            continue
        steps = target - last_tfr_year
        mu = float(coef[0] + coef[1] * du_fi[target - 2])
        # edellisen ennusteen keskiarvo pohjana; epävarmuus kasvaa askelten mukana
        level = level * math.exp(mu)
        half = 1.2816 * sd * math.sqrt(steps)
        preds.append({"id": f"h1-tfr-{target}", "target": "Kokonaishedelmällisyysluku, Suomi (Tilastokeskus 12dt)",
                      "year": target, "point": round(level, 3), "lo": round(level * math.exp(-half), 3),
                      "hi": round(level * math.exp(half), 3), "registered": str(date.today()),
                      "basis": f"Naisten 25–34 työttömyyden muutos {target - 2}: {du_fi[target - 2]:+.1f} %-yks.",
                      "actual": None})
    regional = h1_regional()
    expect = h1b_expectations(nordic, tfr, pw)
    temporary = h1c_temporary(nordic, pw)
    return {
        "temporary": temporary,
        "expectations": expect,
        "tests": [
            {"id": "toisto", "design": "toisto", "result": t1_result,
             "summary": f"Yhdistetty r = {t1['pooled']['r']:.2f} (viive {t1['pooled']['lag']} v, n = {t1['pooled']['n']}, p = {t1['pooled']['p']:.3f})",
             "detail": {"countries": t1["countries"], "pooled": t1["pooled"], "others": t1["others"]}},
            {"id": "annos", "design": "annos", "result": regional["result"], "summary": regional["summary"], "detail": regional},
            {"id": "tasmallisyys", "design": "tasmallisyys", "result": t3_result,
             "summary": f"Naiset r = {res['uw']['pooled']['r']:.2f}, miehet r = {res['um']['pooled']['r']:.2f} (yhdistetty)",
             "detail": {"women": res["uw"]["pooled"], "men": res["um"]["pooled"], "menCountries": res["um"]["countries"]}},
        ],
        "model": {"a": round(float(coef[0]), 4), "b": round(float(coef[1]), 4), "sd": round(sd, 4), "n": len(xs)},
        "predictions": preds,
        "nordic": {"tfr": {c: sorted(tfr[c].items()) for c in COUNTRIES}, "uw": {c: sorted(nordic["uw"][c].items()) for c in COUNTRIES}},
    }


def confidence_annual():
    """Eurostat ei_bsco_m: kuluttajien luottamus (BS-CSMCI, SA, saldoluku), vuoden kuukausien keskiarvo."""
    url = ("https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/ei_bsco_m?"
           "geo=FI&geo=SE&geo=DK&indic=BS-CSMCI&s_adj=SA&unit=BAL&format=JSON&lang=en")
    with urllib.request.urlopen(url, timeout=120) as r:
        d = json.load(r)
    geo = {v: k for k, v in d["dimension"]["geo"]["category"]["index"].items()}
    tim = {v: k for k, v in d["dimension"]["time"]["category"]["index"].items()}
    nt = len(tim)
    months = {}
    for pos, v in d["value"].items():
        p = int(pos)
        g, t = geo[p // nt], tim[p % nt]
        months.setdefault(g, {}).setdefault(int(t[:4]), []).append(v)
    # vain täydet vuodet
    return {g: {y: sum(v) / len(v) for y, v in ys.items() if len(v) == 12} for g, ys in months.items()}


def h1b_expectations(nordic, tfr, pw):
    """T4 (docs/naytto-rekisteri.md, kirjattu ennen laskentaa): luottamus vs. naisten 25–34 työttömyys
    samoissa maissa (FI, SE, DK) ja samoina vuosina."""
    conf = confidence_annual()
    cs = ["FI", "SE", "DK"]
    pc = {c: prewhiten(changes(conf[c], False)) for c in cs}
    pu = {c: prewhiten(changes(nordic["uw"][c], False)) for c in cs}

    def pooled(src, years_ok):
        best = None
        for k in (1, 2):
            ps = []
            for c in cs:
                ps += [(src[c][t - k], pw[c][t]) for t in pw[c] if t - k in src[c] and years_ok(c, t, k)]
            r, n = corr(ps)
            if r is not None and (best is None or abs(r) > abs(best[0])):
                best = (r, n, k)
        r, n, k = best
        return {"r": round(r, 3), "n": n, "lag": k, "p": round(1 - (1 - p_two_sided(r, n)) ** 2, 4)}

    # yhteiset vuodet: molemmilla selittäjillä on suodatettu muutos samalla viiveellä
    common = lambda c, t, k: t - k in pc[c] and t - k in pu[c]
    conf_c, unemp_c = pooled(pc, common), pooled(pu, common)
    conf_long = pooled(pc, lambda c, t, k: True)
    per = {c: lead_corr(pc[c], pw[c]) for c in cs}
    if conf_c["r"] <= 0:
        result = "kumoaa"
    elif conf_c["p"] < 0.05 and abs(conf_c["r"]) >= abs(unemp_c["r"]):
        result = "tukee"
    else:
        result = "ei-ratkea"
    yrs = sorted({y for c in cs for y in conf[c]})
    return {"id": "odotukset", "design": "ajoitus", "result": result,
            "summary": (f"Luottamus r = {conf_c['r']:.2f} (viive {conf_c['lag']} v, p = {conf_c['p']:.3f}), "
                        f"työttömyys samoina vuosina r = {unemp_c['r']:.2f} (p = {unemp_c['p']:.3f}); Suomi, Ruotsi, Tanska"),
            "detail": {"confidence": conf_c, "unemployment": unemp_c, "confidenceLong": conf_long, "countries": per,
                       "confidenceYears": [yrs[0], yrs[-1]],
                       "series": {c: sorted((y, round(v, 2)) for y, v in conf[c].items()) for c in cs}},
            "date": str(date.today())}


def eurostat_temporary():
    """Eurostat lfsa_etpgan: määräaikaisten osuus palkansaajista (%), naiset 25–34, kaikki kansalaisuudet."""
    url = ("https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfsa_etpgan?"
           + "&".join(f"geo={c}" for c in COUNTRIES) + "&sex=F&age=Y25-34&citizen=TOTAL&unit=PC&format=JSON&lang=en")
    with urllib.request.urlopen(url, timeout=120) as r:
        d = json.load(r)
    geo = {v: k for k, v in d["dimension"]["geo"]["category"]["index"].items()}
    tim = {v: k for k, v in d["dimension"]["time"]["category"]["index"].items()}
    nt = len(tim)
    out = {}
    for pos, v in d["value"].items():
        p = int(pos)
        out.setdefault(geo[p // nt], {})[int(tim[p % nt])] = float(v)
    return out


def h1c_temporary(nordic, pw):
    """T5 (docs/naytto-rekisteri.md, kirjattu ennen laskentaa): määräaikaisuus vs. työttömyys,
    naiset 25–34, FI SE NO DK, samat maat ja vuodet."""
    temp = eurostat_temporary()
    pt = {c: prewhiten(changes(temp[c], False)) for c in COUNTRIES}
    pu = {c: prewhiten(changes(nordic["uw"][c], False)) for c in COUNTRIES}

    def triples(k):
        return [(pt[c][t - k], pu[c][t - k], pw[c][t]) for c in COUNTRIES for t in pw[c] if t - k in pt[c] and t - k in pu[c]]

    def pooled(col):
        best = None
        for k in (1, 2):
            ps = [(x[col], x[2]) for x in triples(k)]
            r, n = corr(ps)
            if r is not None and (best is None or abs(r) > abs(best[0])):
                best = (r, n, k)
        r, n, k = best
        return {"r": round(r, 3), "n": n, "lag": k, "p": round(1 - (1 - p_two_sided(r, n)) ** 2, 4)}

    tmp_c, une_c = pooled(0), pooled(1)
    # osittaiskorrelaatio: määräaikaisuus ja syntyvyys, kun työttömyys on vakioitu (määräaikaisuuden viiveellä)
    a = np.array(triples(tmp_c["lag"]))
    res = lambda y: y - np.polyval(np.polyfit(a[:, 1], y, 1), a[:, 1])
    pr = float(np.corrcoef(res(a[:, 0]), res(a[:, 2]))[0, 1])
    partial = {"r": round(pr, 3), "n": len(a), "lag": tmp_c["lag"], "p": round(p_two_sided(pr, len(a) - 1), 4)}
    per = {c: lead_corr(pt[c], pw[c]) for c in COUNTRIES}
    if tmp_c["r"] >= 0:
        result = "kumoaa"
    elif tmp_c["p"] < 0.05 and abs(tmp_c["r"]) >= abs(une_c["r"]):
        result = "tukee"
    else:
        result = "ei-ratkea"
    return {"id": "maaraaikaisuus", "design": "tasmallisyys", "result": result,
            "summary": (f"Määräaikaisuus r = {tmp_c['r']:.2f} (viive {tmp_c['lag']} v, p = {tmp_c['p']:.3f}), "
                        f"työttömyys samoina vuosina r = {une_c['r']:.2f} (p = {une_c['p']:.3f}); Suomi, Ruotsi, Norja, Tanska"),
            "detail": {"temporary": tmp_c, "unemployment": une_c, "partial": partial, "countries": per,
                       "series": {c: sorted(temp[c].items()) for c in COUNTRIES}},
            "date": str(date.today())}


def h1_regional():
    ids_t, tf = px("synt/12du.px", [("alue_23_20260101", "*"), ("contentscode", ["tfr"]), ("timeperiod_y", "*")])
    ids_w, pop = px("tyokay/115w.px", [("alue_28_20250101", "*"), ("timeperiod_y", "*"), ("paaasial_toimin_3_20180101", ["11+12", "12"]), ("ikaryhma_10_20180101", ["25-29", "30-34"]),
                                  ("sukupuoli_9_20180101", ["2"])])
    regions = sorted({k[0] for k in tf if k[0].startswith("MK") and k[0] != "MK21"})
    yi = ids_t.index("timeperiod_y")
    tfr = {r: {int(k[yi]): v for k, v in tf.items() if k[0] == r} for r in regions}
    une = {}
    for r in regions:
        u = {}
        for k, v in pop.items():
            if k[0] != r:
                continue
            y = int(k[ids_w.index("timeperiod_y")]); u.setdefault(y, [0, 0])
            u[y][0 if k[ids_w.index("paaasial_toimin_3_20180101")] == "12" else 1] += v
        une[r] = {y: 100 * a / b for y, (a, b) in u.items() if b}
    regions = [r for r in regions if une.get(r)]

    def fe_coef(U, years):
        # kaksisuuntainen kiinteä vaikutus: alue- ja vuosikeskiarvot pois, sitten kulmakerroin
        rows = [(r, t, math.log(tfr[r][t]), U[r][t - 2]) for r in regions for t in years if t in tfr[r] and t - 2 in U[r]]
        a = np.array([[x[2], x[3]] for x in rows])
        ri = [regions.index(x[0]) for x in rows]; ti = [years.index(x[1]) for x in rows]
        for col in (0, 1):
            v = a[:, col].copy()
            for _ in range(20):  # vuorottelevat keskiarvopoistot (tasapainoinen paneeli konvergoi heti)
                for idx, n in ((ri, len(regions)), (ti, len(years))):
                    s = np.bincount(idx, v, n) / np.maximum(np.bincount(idx, None, n), 1)
                    v = v - s[idx]
            a[:, col] = v
        return float((a[:, 0] @ a[:, 1]) / (a[:, 1] @ a[:, 1])), len(rows)

    years = [t for t in range(1992, 2025) if all(t in tfr[r] and t - 2 in une[r] for r in regions)]
    b, n = fe_coef(une, years)
    rng = random.Random(1)
    ge = 0; R = 2000
    for _ in range(R):
        perm = regions[:]; rng.shuffle(perm)
        bb, _ = fe_coef({r: une[p] for r, p in zip(regions, perm)}, years)
        if bb <= b:
            ge += 1
    p = (ge + 1) / (R + 1)
    result = "tukee" if b < 0 and p < 0.05 else "kumoaa" if b >= 0 else "ei-ratkea"
    pct = (math.exp(b) - 1) * 100
    return {"result": result, "b": round(b, 5), "pctPerPoint": round(pct, 2), "p": round(p, 4), "n": n,
            "regions": len(regions), "years": [years[0], years[-1]],
            "summary": f"1 %-yks. suurempi työttömyysnousu kuin muualla → syntyvyys {pct:+.2f} % kahden vuoden päästä (p = {p:.3f}, {len(regions)} maakuntaa)"}


# ——— H3: kansanterveystyö 1972 ———

def h3():
    ids, d = px("ksyyt/13u5.px", [("alue_23_20260101", "*"), ("kuolinsyyt_1_20210101", ["00-41", "27-30"]), ("contentscode", ["ksyylkm"]),
                                 ("timeperiod_y", [str(y) for y in range(1969, 1987)])])
    regions = sorted({k[0] for k in d if k[0].startswith("HVA")})
    def ratio(r, years):
        cvd = sum(d.get((r, "27-30", str(y), "ksyylkm"), 0) for y in years)
        allc = sum(d.get((r, "00-41", str(y), "ksyylkm"), 0) for y in years)
        return math.log(cvd / (allc - cvd))
    pre, post = range(1969, 1972), range(1977, 1987)
    did = {r: ratio(r, post) - ratio(r, pre) for r in regions}
    order = sorted(regions, key=lambda r: did[r])
    rank = order.index("HVA14") + 1
    result = "tukee" if rank <= 2 else "kumoaa" if rank > len(regions) / 2 else "ei-ratkea"
    names = {"HVA14": "Pohjois-Karjala", "HVA13": "Pohjois-Savo"}
    t2 = {"id": "annos", "design": "annos", "result": result,
          "summary": f"Pohjois-Karjala sijalla {rank}/{len(regions)} (verenkiertoelinten osuuden lasku); Pohjois-Savo sijalla {order.index('HVA13') + 1}",
          "detail": {"rank": rank, "of": len(regions), "did": {r: round(v, 3) for r, v in did.items()},
                     "pk": round(did["HVA14"], 3), "ps": round(did["HVA13"], 3), "median": round(float(np.median(list(did.values()))), 3)}}
    _, s = px("ksyyt/11ay.px", [("sukupuoli_9_20180101", ["SSS"]), ("kuolinsyyt_1_20210101", ["00-41", "27-30"]),
                               ("contentscode", ["ksyyikat"]), ("timeperiod_y", ["1972", "1982"])])
    g = lambda c, y: s[("SSS", c, str(y), "ksyyikat")]
    cvd = g("27-30", 1982) / g("27-30", 1972) - 1
    other = (g("00-41", 1982) - g("27-30", 1982)) / (g("00-41", 1972) - g("27-30", 1972)) - 1
    ratio_ = cvd / other if other < 0 else float("inf")
    t3res = "tukee" if cvd < 0 and ratio_ >= 1.5 else "kumoaa" if cvd > other else "ei-ratkea"
    t3 = {"id": "tasmallisyys", "design": "tasmallisyys", "result": t3res,
          "summary": f"15–64-v. ikävakioitu kuolleisuus 1972–1982: verenkiertoelinten sairaudet {cvd * 100:+.0f} %, muut taudit {other * 100:+.0f} %",
          "detail": {"cvd": round(cvd, 3), "other": round(other, 3)}}
    mj = json.load(open(os.path.join(ROOT, "src", "data", "mitajos.json")))
    e = next(x for x in mj["events"] if x["id"] == "terveys")
    gap82 = e["gap"][e["years"].index(1982)]
    t1 = {"id": "luonnollinen", "design": "luonnollinen", "result": "tukee" if e["rank"] <= 3 and gap82 > 0 else "ei-ratkea",
          "summary": f"Synteettinen Suomi: ero +{gap82:.1f} v vuonna 1982, Suomi {e['rank']}./{e['n']}",
          "detail": {"rank": e["rank"], "n": e["n"], "gap1982": gap82}, "date": "2026-11-26"}
    return {"tests": [t1, t2, t3], "predictions": []}


def h2():
    p = os.environ.get("H1990_RESULT")
    r = json.load(open(p)) if p and os.path.exists(p) else None
    tests = [
        {"id": "annos", "design": "annos", "result": "kumoaa", "date": "2026-11-25",
         "summary": "Teollisuuden ja rakentamisen osuus 1989 vs. työpaikkojen muutos 1989–93: rho −0,07, p 0,39 (20 maakuntaa)"},
        {"id": "rakenne", "design": "tasmallisyys", "result": "kumoaa", "date": "2026-11-25",
         "summary": "Toimialarakenteen mukainen odotus selitti 28 % alue-eroista, ilman Ahvenanmaata 8 %"},
    ]
    if r:
        tests[0]["detail"] = r
    return {"tests": tests, "predictions": []}


def main():
    _, t = px("synt/12dt.px", [("contentscode", ["tfr"]), ("timeperiod_y", "*")])
    fi_tfr = {int(k[0]): v for k, v in t.items()}
    out = {"built": str(date.today()), "hypotheses": {"h1": h1(turso_nordic(), fi_tfr), "h2": h2(), "h3": h3()}}
    out["hypotheses"]["h1"]["fiTfrLast"] = [max(fi_tfr), fi_tfr[max(fi_tfr)]]
    # Kerran kirjattua ennustetta ei lasketa uudelleen: piste, väli ja kirjauspäivä säilyvät.
    # Toteutunut arvo täytetään vasta, kun virallinen luku on julkaistu.
    if os.path.exists(OUT):
        old = json.load(open(OUT))
        for hk, h in out["hypotheses"].items():
            prev = {p["id"]: p for p in old.get("hypotheses", {}).get(hk, {}).get("predictions", [])}
            kept = []
            for p in h["predictions"]:
                q = dict(prev.get(p["id"], p))
                if q.get("actual") is None and q["year"] in fi_tfr and hk == "h1":
                    q["actual"] = fi_tfr[q["year"]]
                kept.append(q)
            kept += [q for pid, q in prev.items() if pid not in {p["id"] for p in h["predictions"]}]
            h["predictions"] = kept
    # Suomalainen lukuasu teksteihin: desimaalipilkku ja miinusmerkki.
    fi = lambda t: re.sub(r"(?<![\w])-(?=\d)", "−", re.sub(r"(?<=\d)\.(?=\d)", ",", t))
    for h in out["hypotheses"].values():
        for t in h["tests"] + [h[k] for k in ("expectations", "temporary") if k in h]:
            t["summary"] = fi(t["summary"])
        for p in h["predictions"]:
            p["basis"] = fi(p["basis"])
    json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    for k, h in out["hypotheses"].items():
        print(k)
        for x in h["tests"]:
            print("  ", x["id"], x["result"], "|", x["summary"])
        for p in h["predictions"]:
            print("   ennuste", p["year"], p["point"], [p["lo"], p["hi"]], p["basis"])
    print("ilman Suomea", out["hypotheses"]["h1"]["tests"][0]["detail"]["others"], "TFR viimeisin", out["hypotheses"]["h1"]["fiTfrLast"])
    print("odotukset", json.dumps({k: v for k, v in out["hypotheses"]["h1"]["expectations"].items() if k != "detail"}, ensure_ascii=False))
    e = out["hypotheses"]["h1"]["expectations"]["detail"]
    print("  maittain", e["countries"], "pitkä", e["confidenceLong"], e["confidenceYears"])
    tm = out["hypotheses"]["h1"]["temporary"]
    print("maaraaikaisuus", tm["result"], tm["summary"]); print("  osittais", tm["detail"]["partial"], "maittain", tm["detail"]["countries"])
    print("malli", out["hypotheses"]["h1"]["model"])
    print("toisto maittain", json.dumps(out["hypotheses"]["h1"]["tests"][0]["detail"]["countries"]))
    print("miehet maittain", json.dumps(out["hypotheses"]["h1"]["tests"][2]["detail"]["menCountries"]))


if __name__ == "__main__":
    main()
