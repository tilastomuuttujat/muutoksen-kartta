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
    firstborn = h1d_firstborn(nordic, tfr)
    firstborn_cohorts = h1d_cohorts()
    return {
        "firstbornCohorts": firstborn_cohorts,
        "firstborn": firstborn,
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


def eurostat_birth_order():
    """Eurostat demo_fordagec: elävänä syntyneet järjestysluvun mukaan (kaikki iät)."""
    url = ("https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_fordagec?"
           + "&".join(f"geo={c}" for c in COUNTRIES) + "&age=TOTAL&format=JSON&lang=en")
    with urllib.request.urlopen(url, timeout=120) as r:
        d = json.load(r)
    dims = d["id"]; size = d["size"]
    cats = [{v: k for k, v in d["dimension"][i]["category"]["index"].items()} for i in dims]
    out = {}
    for pos, v in d["value"].items():
        p, idx = int(pos), []
        for s_ in reversed(size):
            idx.append(p % s_); p //= s_
        idx.reverse()
        k = {dims[j]: cats[j][idx[j]] for j in range(len(dims))}
        out.setdefault(k["geo"], {}).setdefault(int(k["time"]), {})[k["ord_brth"]] = v
    return out


def h1d_firstborn(nordic, tfr):
    """T6 (docs/naytto-rekisteri.md, kirjattu ennen laskentaa): esikoiset vs. myöhemmät lapset."""
    bo = eurostat_birth_order()
    first, later = {}, {}
    for c in COUNTRIES:
        first[c], later[c] = {}, {}
        for y, b in bo.get(c, {}).items():
            known = sum(v for k, v in b.items() if k not in ("TOTAL", "UNK"))
            if y in tfr[c] and known and "1" in b:
                f = tfr[c][y] * b["1"] / known
                first[c][y] = f; later[c][y] = tfr[c][y] - f
    # tarkistus: Suomen likiarvo vs. tarkka esikoisten hedelmällisyys (indicators.json)
    ind = json.load(open(os.path.join(ROOT, "src", "data", "indicators.json")))
    items = ind if isinstance(ind, list) else ind.get("series", ind.get("indicators", ind))
    items = items if isinstance(items, list) else list(items.values())
    exact = {int(y): v for y, v in next(i for i in items if i.get("key") == "statfin.synt.tfr_order_1")["values"]}
    ca, ce = changes(first["FI"], True), changes(exact, True)
    common = sorted(set(ca) & set(ce))
    check = float(np.corrcoef([ca[y] for y in common], [ce[y] for y in common])[0, 1])
    pu = {c: prewhiten(changes(nordic["uw"][c], False)) for c in COUNTRIES}
    if check >= 0.9:
        cs, src_first, used = COUNTRIES, first, "likiarvo, neljä maata"
    else:
        cs, src_first, used = ["FI"], {"FI": exact}, "Suomen tarkka sarja (likiarvo ei läpäissyt tarkistusta)"
    pf = {c: prewhiten(changes(src_first[c], True)) for c in cs}
    pl = {c: prewhiten(changes(later[c], True)) for c in cs}

    def pooled(target):
        best = None
        for k in (1, 2):
            ps = [(pu[c][t - k], target[c][t]) for c in cs for t in target[c] if t - k in pu[c] and t <= 2024]
            r, n = corr(ps)
            if r is not None and (best is None or abs(r) > abs(best[0])):
                best = (r, n, k)
        r, n, k = best
        return {"r": round(r, 3), "n": n, "lag": k, "p": round(1 - (1 - p_two_sided(r, n)) ** 2, 4)}

    f, l = pooled(pf), pooled(pl)
    per = {c: {"first": lead_corr(pu[c], pf[c]), "later": lead_corr(pu[c], pl[c])} for c in cs}
    if f["r"] >= 0 or (l["r"] < f["r"] and l["p"] < 0.05):
        result = "kumoaa"
    elif f["p"] < 0.05 and abs(f["r"]) > abs(l["r"]):
        result = "tukee"
    else:
        result = "ei-ratkea"
    if len(cs) == 1 and result == "tukee":
        result = "ei-ratkea"
    return {"id": "esikoiset", "design": "tasmallisyys", "result": result,
            "summary": (f"Esikoiset r = {f['r']:.2f} (viive {f['lag']} v, p = {f['p']:.3f}), myöhemmät lapset r = {l['r']:.2f} "
                        f"(viive {l['lag']} v, p = {l['p']:.3f}); {used}"),
            "detail": {"first": f, "later": l, "countries": per, "check": round(check, 3), "used": used,
                       "share": {c: sorted((y, round(first[c][y] / tfr[c][y], 3)) for y in first[c]) for c in COUNTRIES}},
            "date": str(date.today())}


def h1e(fi_tfr):
    """H1e (docs/naytto-rekisteri.md): työllisyys 30–34 → syntyvyys. Toisto seulasta, annos–vaste maakunnittain, ennuste."""
    seula = json.load(open(os.path.join(ROOT, "src", "data", "seula.json")))["designs"]["maa"]
    g = next(r for r in seula["rows"] if r["x"] == "safe_corridor.employment_rate_30_34" and r["y"] == "nordics.tfr_1950_2024")
    t1 = {"id": "toisto", "design": "toisto", "result": "tukee" if g["status"] == "jyva" else "ei-ratkea", "date": "2026-11-27",
          "summary": f"Seula: löytö Suomessa r = {g['rD']:.2f}, vahvistus Ruotsissa, Norjassa ja Tanskassa r = {g['rC']:.2f} (viive {g['lag']} v, p = {g['pC']:.4f})",
          "detail": g}

    # T2 annos–vaste: rekisterityöllisyys 30–34 maakunnittain
    ids_t, tf = px("synt/12du.px", [("alue_23_20260101", "*"), ("contentscode", ["tfr"]), ("timeperiod_y", "*")])
    ids_w, pop = px("tyokay/115w.px", [("alue_28_20250101", "*"), ("timeperiod_y", "*"), ("paaasial_toimin_3_20180101", ["SSS", "11"]),
                                      ("ikaryhma_10_20180101", ["30-34"]), ("sukupuoli_9_20180101", ["SSS"])])
    regions = sorted({k[0] for k in tf if k[0].startswith("MK") and k[0] != "MK21"})
    yi = ids_t.index("timeperiod_y")
    tfr = {r: {int(k[yi]): v for k, v in tf.items() if k[0] == r} for r in regions}
    emp = {}
    for r in regions:
        e = {}
        for k, v in pop.items():
            if k[0] != r:
                continue
            y = int(k[ids_w.index("timeperiod_y")]); e.setdefault(y, [0, 0])
            e[y][0 if k[ids_w.index("paaasial_toimin_3_20180101")] == "11" else 1] += v
        emp[r] = {y: 100 * a / b for y, (a, b) in e.items() if b}
    regions = [r for r in regions if emp.get(r)]
    years = [t for t in range(1992, 2026) if all(t in tfr[r] and t - 2 in emp[r] for r in regions)]

    def fe(E):
        rows = [(r, t, math.log(tfr[r][t]), E[r][t - 2]) for r in regions for t in years]
        a = np.array([[x[2], x[3]] for x in rows])
        ri = [regions.index(x[0]) for x in rows]; ti = [years.index(x[1]) for x in rows]
        for col in (0, 1):
            v = a[:, col].copy()
            for _ in range(20):
                for idx, n in ((ri, len(regions)), (ti, len(years))):
                    s_ = np.bincount(idx, v, n) / np.maximum(np.bincount(idx, None, n), 1)
                    v = v - s_[idx]
            a[:, col] = v
        return float((a[:, 0] @ a[:, 1]) / (a[:, 1] @ a[:, 1])), len(rows)

    b, n = fe(emp)
    rng = random.Random(2); R = 2000; ge = 0
    for _ in range(R):
        perm = regions[:]; rng.shuffle(perm)
        if fe({r: emp[p] for r, p in zip(regions, perm)})[0] >= b:
            ge += 1
    p = (ge + 1) / (R + 1)
    result = "tukee" if b > 0 and p < 0.05 else "kumoaa" if b <= 0 else "ei-ratkea"
    pct = (math.exp(b) - 1) * 100
    Ylog = {r: {t: math.log(v) for t, v in tfr[r].items()} for r in regions}
    chk, result = panel_checks(Ylog, emp, regions, years, b, 2, 1, result, 21)
    pctf = lambda v: f"{(math.exp(v) - 1) * 100:+.2f} %"
    t2 = {"id": "annos", "design": "annos", "result": result, "date": str(date.today()),
          "summary": f"1 %-yks. suurempi työllisyysnousu kuin muualla → syntyvyys {pct:+.2f} % kahden vuoden päästä (p = {p:.3f}, {len(regions)} maakuntaa, {years[0]}–{years[-1]})." + checks_text(chk, pctf),
          "detail": {"b": round(b, 5), "pctPerPoint": round(pct, 2), "p": round(p, 4), "n": n, "regions": len(regions), "years": [years[0], years[-1]], "checks": chk}}

    # E2 ennuste: Pohjoismaiden yhdistetty malli
    E = {c: {} for c in COUNTRIES}; T = {c: {} for c in COUNTRIES}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if g_ in COUNTRIES and v is not None and kind in ("observed", "estimate"):
            if k == "safe_corridor.employment_rate_30_34":
                E[g_][int(y)] = float(v)
            elif k == "nordics.tfr_1950_2024" and int(y) >= 1990:
                T[g_][int(y)] = float(v)
    T["FI"].update({y: v for y, v in fi_tfr.items() if y >= 1990})
    xs, ys = [], []
    for c in COUNTRIES:
        de, dt = changes(E[c], False), changes(T[c], True)
        for t in dt:
            if t - 2 in de:
                xs.append(de[t - 2]); ys.append(dt[t])
    X = np.column_stack([np.ones(len(xs)), xs])
    coef, *_ = np.linalg.lstsq(X, np.array(ys), rcond=None)
    sd = float(np.std(np.array(ys) - X @ coef, ddof=2))
    de_fi = changes(E["FI"], False)
    last = max(T["FI"]); level = T["FI"][last]; preds = []
    for target in (last + 1, last + 2):
        if target - 2 not in de_fi:
            continue
        steps = target - last
        level = level * math.exp(float(coef[0] + coef[1] * de_fi[target - 2]))
        half = 1.2816 * sd * math.sqrt(steps)
        preds.append({"id": f"h1e-tfr-{target}", "target": "Kokonaishedelmällisyysluku, Suomi (Tilastokeskus 12dt)", "year": target,
                      "point": round(level, 3), "lo": round(level * math.exp(-half), 3), "hi": round(level * math.exp(half), 3),
                      "registered": str(date.today()), "basis": f"Työllisyysasteen 30–34 muutos {target - 2}: {de_fi[target - 2]:+.1f} %-yks.", "actual": None})
    return {"tests": [t1, t2], "predictions": preds,
            "model": {"a": round(float(coef[0]), 4), "b": round(float(coef[1]), 4), "sd": round(sd, 4), "n": len(xs)}}


def eurostat_annual(dataset, params):
    """Eurostat-taulun vuosiarvot maittain, kun muut ulottuvuudet on rajattu yhteen arvoon."""
    url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?{params}&format=JSON&lang=en"
    with urllib.request.urlopen(url, timeout=120) as r:
        d = json.load(r)
    geo = {v: k for k, v in d["dimension"]["geo"]["category"]["index"].items()}
    tim = {v: k for k, v in d["dimension"]["time"]["category"]["index"].items()}
    nt = len(tim)
    out = {}
    for pos, v in d["value"].items():
        p = int(pos)
        out.setdefault(geo[p // nt], {})[int(tim[p % nt][:4])] = float(v)
    return out


def h1f(fi_tfr):
    """H1f (docs/naytto-rekisteri.md): asuntojen reaalihinnat ja pitkät korot vs. työllisyys 30–34."""
    E = {c: {} for c in COUNTRIES}; T = {c: {} for c in COUNTRIES}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if g_ in COUNTRIES and v is not None and kind in ("observed", "estimate"):
            if k == "safe_corridor.employment_rate_30_34":
                E[g_][int(y)] = float(v)
            elif k == "nordics.tfr_1950_2024" and int(y) >= 1990:
                T[g_][int(y)] = float(v)
    T["FI"].update({y: v for y, v in fi_tfr.items() if y >= 1990})
    pw = {c: prewhiten(changes(T[c], True)) for c in COUNTRIES}
    pe = {c: prewhiten(changes(E[c], False)) for c in COUNTRIES}
    geos = "&".join(f"geo={c}" for c in COUNTRIES)
    hpi = eurostat_annual("prc_hpi_a", f"{geos}&purchase=TOTAL&unit=I15_A_AVG")
    hicp = eurostat_annual("prc_hicp_aind", f"{geos}&coicop=CP00&unit=INX_A_AVG")
    rate = eurostat_annual("irt_lt_mcby_a", "geo=FI&geo=SE&geo=DK&int_rt=MCBY")
    real = {c: {y: hpi[c][y] / hicp[c][y] * 100 for y in hpi.get(c, {}) if y in hicp.get(c, {})} for c in COUNTRIES}

    def run(pred, log, cs, y_from, tid, label):
        pp = {c: prewhiten(changes({y: v for y, v in pred[c].items() if y >= y_from - 1}, log)) for c in cs}

        def pooled(src):
            best = None
            for k in (1, 2):
                ps = [(src[c][t - k], pw[c][t]) for c in cs for t in pw[c] if t - k in pp[c] and t - k in pe[c]]
                r, n = corr(ps)
                if r is not None and (best is None or abs(r) > abs(best[0])):
                    best = (r, n, k)
            r, n, k = best
            return {"r": round(r, 3), "n": n, "lag": k, "p": round(1 - (1 - p_two_sided(r, n)) ** 2, 4)}

        a, b = pooled(pp), pooled(pe)
        per = {c: lead_corr(pp[c], pw[c]) for c in cs}
        res = "kumoaa" if a["r"] >= 0 else "tukee" if a["p"] < 0.05 and abs(a["r"]) >= abs(b["r"]) else "ei-ratkea"
        return {"id": tid, "design": "ajoitus", "result": res, "date": str(date.today()),
                "summary": (f"{label} r = {a['r']:.2f} (viive {a['lag']} v, p = {a['p']:.3f}), työllisyys 30–34 samoina vuosina "
                            f"r = {b['r']:.2f} (p = {b['p']:.3f}); {', '.join({'FI': 'Suomi', 'SE': 'Ruotsi', 'NO': 'Norja', 'DK': 'Tanska'}[c] for c in cs)}"),
                "detail": {"predictor": a, "employment": b, "countries": per,
                           "series": {c: sorted((y, round(v, 2)) for y, v in pred[c].items() if y >= y_from) for c in cs}}}

    t1 = run(real, True, COUNTRIES, 2005, "hinnat", "Asuntojen reaalihinnat")
    t2 = run(rate, False, ["FI", "SE", "DK"], 1990, "korot", "Pitkä korko")
    return {"tests": [t1, t2], "predictions": []}


def eurostat_multi(dataset, params):
    """Eurostat-taulu purettuna: {(muut ulottuvuudet…, geo): {vuosi: arvo}}."""
    url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?{params}&format=JSON&lang=en"
    with urllib.request.urlopen(url, timeout=120) as r:
        d = json.load(r)
    ids, size = d["id"], d["size"]
    cats = [{v: k for k, v in d["dimension"][i]["category"]["index"].items()} for i in ids]
    out = {}
    for pos, v in d["value"].items():
        p, idx = int(pos), []
        for s_ in reversed(size):
            idx.append(p % s_); p //= s_
        idx.reverse()
        k = {ids[j]: cats[j][idx[j]] for j in range(len(ids))}
        key = tuple(k[i] for i in ids if i not in ("time", "freq"))
        out.setdefault(key, {})[int(k["time"][:4])] = float(v)
    return ids, out


def r2(v):
    """Kaksi desimaalia tavallisella pyöristyksellä (0,365 → 0,37), kuten sivun luvuissa."""
    return f"{math.floor(abs(v) * 100 + 0.5) / 100 * (1 if v >= 0 else -1):.2f}"


def h1g(fi_tfr):
    """H1g (docs/naytto-rekisteri.md): rahan riittävyys. Reaalitulot, luotto, annos–vaste maakunnittain + kuvaileva osa."""
    E = {c: {} for c in COUNTRIES}; T = {c: {} for c in COUNTRIES}; jst = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if v is None or kind not in ("observed", "estimate"):
            continue
        if g_ in COUNTRIES and k == "safe_corridor.employment_rate_30_34":
            E[g_][int(y)] = float(v)
        elif g_ in COUNTRIES and k == "nordics.tfr_1950_2024" and int(y) >= 1990:
            T[g_][int(y)] = float(v)
        elif k in ("fi.historical20261026.jst.money", "fi.historical20261026.jst.tloans") and int(y) >= 1995:
            jst.setdefault(k.split(".")[-1], {})[int(y)] = float(v)
    T["FI"].update({y: v for y, v in fi_tfr.items() if y >= 1990})
    cs = ["FI", "SE", "DK"]
    pw = {c: prewhiten(changes(T[c], True)) for c in cs}
    pe = {c: prewhiten(changes(E[c], False)) for c in cs}
    geos = "&".join(f"geo={c}" for c in cs)
    ids, ki = eurostat_multi("nasa_10_ki", f"{geos}&sector=S14_S15&na_item=B7G_R_HAB_GR&na_item=DIR_S14_S15&na_item=B7G_R_HAB_2010")
    gi, ni = ids.index("geo"), ids.index("na_item")
    keys = [i for i in ids if i not in ("time", "freq")]
    pick = lambda item: {k[keys.index("geo")]: v for k, v in ki.items() if k[keys.index("na_item")] == item}
    growth, dti, index = pick("B7G_R_HAB_GR"), pick("DIR_S14_S15"), pick("B7G_R_HAB_2010")

    def run(pp, cs_, tid, label, design="ajoitus"):
        def pooled(src):
            best = None
            for k in (1, 2):
                ps = [(src[c][t - k], pw[c][t]) for c in cs_ for t in pw[c] if t - k in pp[c] and t - k in pe[c]]
                r, n = corr(ps)
                if r is not None and (best is None or abs(r) > abs(best[0])):
                    best = (r, n, k)
            r, n, k = best
            return {"r": round(r, 3), "n": n, "lag": k, "p": round(1 - (1 - p_two_sided(r, n)) ** 2, 4)}
        a, b = pooled(pp), pooled(pe)
        per = {c: lead_corr(pp[c], pw[c]) for c in cs_}
        res = "kumoaa" if a["r"] <= 0 else "tukee" if a["p"] < 0.05 and abs(a["r"]) >= abs(b["r"]) else "ei-ratkea"
        return {"id": tid, "design": design, "result": res, "date": str(date.today()),
                "summary": f"{label} r = {r2(a['r'])} (viive {a['lag']} v, p = {a['p']:.3f}), työllisyys 30–34 samoina vuosina r = {r2(b['r'])} (p = {b['p']:.3f}); Suomi, Ruotsi, Tanska",
                "detail": {"predictor": a, "employment": b, "countries": per}}

    # vuosimuutos on jo muutos: suodatetaan sellaisenaan
    t1 = run({c: prewhiten({y: v for y, v in growth[c].items() if y >= 1996}) for c in cs}, cs, "tulot", "Reaalitulot")
    t2 = run({c: prewhiten(changes({y: v for y, v in dti[c].items() if y >= 1995}, False)) for c in cs}, cs, "luotto", "Velka / tulot")

    # T3 annos–vaste maakunnittain
    ids_t, tf = px("synt/12du.px", [("alue_23_20260101", "*"), ("contentscode", ["tfr"]), ("timeperiod_y", "*")])
    ids_i, inc = px("tjt/14ww.px", [("alue_23_20250101", [f"MK{n:02d}" for n in range(1, 20) if n != 3]), ("contentscode", ["tjt-ekvikturaha_med"]), ("timeperiod_y", "*")])
    regions = sorted({k[0] for k in inc if k[0] != "MK21"} & {k[0] for k in tf})
    yt, yi_ = ids_t.index("timeperiod_y"), ids_i.index("timeperiod_y")
    tfr = {r: {int(k[yt]): v for k, v in tf.items() if k[0] == r} for r in regions}
    lin = {r: {int(k[yi_]): math.log(v) for k, v in inc.items() if k[0] == r and v} for r in regions}
    years = [t for t in range(1997, 2026) if all(t in tfr[r] and t - 2 in lin[r] for r in regions)]

    def fe(X):
        rows = [(r, t, math.log(tfr[r][t]), X[r][t - 2]) for r in regions for t in years]
        a = np.array([[x[2], x[3]] for x in rows])
        ri = [regions.index(x[0]) for x in rows]; ti = [years.index(x[1]) for x in rows]
        for col in (0, 1):
            v = a[:, col].copy()
            for _ in range(20):
                for idx, n in ((ri, len(regions)), (ti, len(years))):
                    s_ = np.bincount(idx, v, n) / np.maximum(np.bincount(idx, None, n), 1)
                    v = v - s_[idx]
            a[:, col] = v
        return float((a[:, 0] @ a[:, 1]) / (a[:, 1] @ a[:, 1])), len(rows)

    b, n = fe(lin)
    rng = random.Random(3); R = 2000; ge = 0
    for _ in range(R):
        perm = regions[:]; rng.shuffle(perm)
        if fe({r: lin[p] for r, p in zip(regions, perm)})[0] >= b:
            ge += 1
    p = (ge + 1) / (R + 1)
    res3 = "tukee" if b > 0 and p < 0.05 else "kumoaa" if b <= 0 else "ei-ratkea"
    per10 = (math.exp(b * math.log(1.1)) - 1) * 100  # 10 % suurempi tulo → syntyvyyden muutos %
    Ylog = {r: {t: math.log(v) for t, v in tfr[r].items()} for r in regions}
    chk, res3 = panel_checks(Ylog, lin, regions, years, b, 2, 1, res3, 31)
    p10 = lambda v: f"{(math.exp(v * math.log(1.1)) - 1) * 100:+.1f} %"
    t3 = {"id": "annos", "design": "annos", "result": res3, "date": str(date.today()),
          "summary": f"10 % muita suurempi tulojen nousu → syntyvyys {per10:+.1f} % kahden vuoden päästä (p = {p:.3f}, {len(regions)} maakuntaa, {years[0]}–{years[-1]})." + checks_text(chk, p10),
          "detail": {"b": round(b, 4), "per10pct": round(per10, 2), "p": round(p, 4), "n": n, "regions": len(regions), "years": [years[0], years[-1]], "checks": chk}}

    # Kuvaileva osa
    base = lambda d, y0: {y: round(v / d[y0] * 100, 1) for y, v in d.items() if y >= 2000} if y0 in d else {}
    describe = {
        "income2008": {c: sorted(base(index[c], 2008).items()) for c in cs},
        "dti": {c: sorted((y, round(v, 1)) for y, v in dti[c].items() if y >= 2000) for c in cs},
        "moneyGrowth": sorted((y, round((jst["money"][y] / jst["money"][y - 1] - 1) * 100, 1)) for y in jst.get("money", {}) if y - 1 in jst["money"] and y >= 2000),
        "creditGrowth": sorted((y, round((jst["tloans"][y] / jst["tloans"][y - 1] - 1) * 100, 1)) for y in jst.get("tloans", {}) if y - 1 in jst["tloans"] and y >= 2000),
    }
    rec = {}
    for c in cs:
        ix = dict(describe["income2008"][c])
        rec[c] = {"g2008_2015": round(ix[2015] - 100, 1), "g2015_2019": round((ix[2019] / ix[2015] - 1) * 100, 1),
                  "peak2008_2014": max((v, y) for y, v in ix.items() if 2008 <= y <= 2014)}
        pk = rec[c]["peak2008_2014"]
        later = [y for y in sorted(ix) if y > pk[1] and ix[y] < pk[0]]
        back = [y for y in sorted(ix) if later and y > later[0] and ix[y] >= pk[0]]
        rec[c]["dipFrom"] = later[0] if later else None
        rec[c]["regained"] = back[0] if back else None
    describe["recovery"] = rec
    return {"tests": [t1, t2, t3], "predictions": [], "describe": describe}


def seula_grain(design, pred):
    sd = json.load(open(os.path.join(ROOT, "src", "data", "seula.json")))["designs"][design]
    return next(r for r in sd["rows"] if r["status"] == "jyva" and pred(sd["meta"][r["x"]]["t"], sd["meta"][r["y"]]["t"], r))


def pooled_lead(pred, target, cs, lags=(1, 2)):
    best = None
    for k in lags:
        ps = [(pred[c][t - k], target[c][t]) for c in cs for t in target[c] if t - k in pred[c]]
        r, n = corr(ps)
        if r is not None and (best is None or abs(r) > abs(best[0])):
            best = (r, n, k)
    r, n, k = best
    return {"r": round(r, 3), "n": n, "lag": k, "p": round(1 - (1 - p_two_sided(r, n)) ** len(lags), 4)}


def h4():
    """H4 (docs/naytto-rekisteri.md): työttömyys → julkisten palvelujen (D63) reaalikasvu; D62 vertailuna."""
    g = seula_grain("aika", lambda x, y, r: x.startswith("Työttömyysaste") and "D63R" in y)
    t1 = {"id": "toisto-aika", "design": "toisto", "result": "tukee", "date": "2026-11-27",
          "summary": f"Seula, aikajako: löytö ≤ 2000 r = {r2(g['rD'])}, vahvistus 2001–2025 r = {r2(g['rC'])} (viive {g['lag']} v, p = {g['pC']:.3f})",
          "detail": g}
    cs = ["FI", "SE", "DK"]
    geos = "&".join(f"geo={c}" for c in cs)
    une = eurostat_annual("lfsa_urgan", f"{geos}&age=Y15-74&sex=T&citizen=TOTAL&unit=PC")
    _, tr = eurostat_multi("nasa_10_nf_tr", f"{geos}&sector=S13&direct=PAID&na_item=D63&na_item=D62&unit=CP_MNAC")
    defl = eurostat_annual("nama_10_gdp", f"{geos}&na_item=B1GQ&unit=PD15_NAC")
    item = lambda it: {k[-1]: v for k, v in tr.items() if it in k}
    real = lambda d: {c: {y: v / defl[c][y] for y, v in d[c].items() if y in defl.get(c, {})} for c in cs}
    d63, d62 = real(item("D63")), real(item("D62"))
    pu = {c: prewhiten(changes(une[c], False)) for c in cs}
    p63 = {c: prewhiten(changes({y: v for y, v in d63[c].items() if y >= 1995}, True)) for c in cs}
    p62 = {c: prewhiten(changes({y: v for y, v in d62[c].items() if y >= 1995}, True)) for c in cs}
    rep = pooled_lead(pu, p63, ["SE", "DK"])
    per = {c: lead_corr(pu[c], p63[c]) for c in cs}
    t2 = {"id": "toisto-maat", "design": "toisto", "result": "tukee" if rep["r"] < 0 and rep["p"] < 0.05 else "kumoaa" if rep["r"] >= 0 else "ei-ratkea",
          "date": str(date.today()),
          "summary": f"Ruotsi ja Tanska: työttömyys → julkisten palvelujen reaalikasvu r = {r2(rep['r'])} (viive {rep['lag']} v, p = {rep['p']:.3f}, n = {rep['n']})",
          "detail": {"predictor": rep, "countries": per}}
    a63, a62 = pooled_lead(pu, p63, cs), pooled_lead(pu, p62, cs)
    res3 = "kumoaa" if a62["r"] <= a63["r"] else "tukee" if a63["r"] < 0 else "ei-ratkea"
    t3 = {"id": "palvelut-vs-rahat", "design": "tasmallisyys", "result": res3, "date": str(date.today()),
          "summary": f"Suomi, Ruotsi ja Tanska: palvelut (D63) r = {r2(a63['r'])}, rahaetuudet (D62) r = {r2(a62['r'])}",
          "detail": {"d63": a63, "d62": a62, "d62Countries": {c: lead_corr(pu[c], p62[c]) for c in cs}}}
    return {"tests": [t1, t2, t3], "predictions": []}


def h5():
    """H5: työttömyyden pitkittyminen. Pysyvyys: ΔU(t) vs. pitkäaikaistyöttömien osuuden muutos t → t+3."""
    g = seula_grain("maa", lambda x, y, r: r["x"] == "nordics.unemployment_rate_25_34_women_1990_2024" and r["y"] == "safe_corridor.long_term_unemployment_share_30_34")
    t1 = {"id": "toisto", "design": "toisto", "result": "tukee", "date": "2026-11-27",
          "summary": f"Seula, maajako: löytö Suomessa r = {r2(g['rD'])}, vahvistus Ruotsissa, Norjassa ja Tanskassa r = {r2(g['rC'])} (viive {g['lag']} v, p = {g['pC']:.4f})",
          "detail": g}
    U = {c: {} for c in COUNTRIES}; LT = {c: {} for c in COUNTRIES}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if g_ in COUNTRIES and v is not None and kind in ("observed", "estimate"):
            if k == "nordics.unemployment_rate_25_34_women_1990_2024":
                U[g_][int(y)] = float(v)
            elif k == "safe_corridor.long_term_unemployment_share_30_34":
                LT[g_][int(y)] = float(v)
    pairs_, per = [], {}
    for c in COUNTRIES:
        cp = [(U[c][t] - U[c][t - 1], LT[c][t + 3] - LT[c][t]) for t in U[c] if t - 1 in U[c] and t in LT[c] and t + 3 in LT[c]]
        pairs_ += cp
        r_, n_ = corr(cp)
        per[c] = {"r": round(r_, 3), "n": n_} if r_ is not None else None
    r, n = corr(pairs_)
    neff = max(4, n // 3)
    p = float(p_two_sided(r, neff + 3 - 3)) if r is not None else 1.0
    # yksisuuntainen (ennustettu suunta r > 0)
    p1s = p / 2 if r > 0 else 1 - p / 2
    res = "tukee" if r > 0 and p1s < 0.05 else "kumoaa" if r <= 0 else "ei-ratkea"
    t2 = {"id": "pysyvyys", "design": "tasmallisyys", "result": res, "date": str(date.today()),
          "summary": f"Työttömyyden nousu vuonna t → pitkäaikaistyöttömien osuus 30–34 kolmen vuoden päästä: r = {r2(r)} (n = {n}, efektiivinen {neff}, p = {p1s:.3f}); neljä maata",
          "detail": {"r": round(r, 3), "n": n, "neff": neff, "p": round(p1s, 4), "countries": per}}
    return {"tests": [t1, t2, h5_cohorts()], "predictions": []}


def h5_cohorts():
    """H5 / T3 (docs/naytto-rekisteri.md): ikäluokan työmarkkinoille tulon aikainen työttömyys → työllisyys 33–37-v."""
    ages = [f"{a:03d}" for a in range(21, 55)]
    ids, d = px("tyokay/115c.px", [("paaasial_toimin_3_20180101", ["SSS", "11", "12"]), ("sukupuoli_9_20180101", ["SSS", "1", "2"]),
                                  ("ikaryhma_10_20180101", ages), ("timeperiod_y", "*")])
    ia, isx, iy, it = (ids.index(x) for x in ("ikaryhma_10_20180101", "sukupuoli_9_20180101", "timeperiod_y", "paaasial_toimin_3_20180101"))
    tab = {}
    for k, v in d.items():
        tab[(k[isx], int(k[ia]), int(k[iy]), k[it])] = v
    years = sorted({k[2] for k in tab})

    def rate(sex, a0, a1, y, num, den):
        n = sum(tab.get((sex, a, y, c), 0) for a in range(a0, a1 + 1) for c in num)
        m = sum(tab.get((sex, a, y, c), 0) for a in range(a0, a1 + 1) for c in den)
        return n / m if m else None

    def run(sex):
        # altistus vuosittain: 25–54-vuotiaiden työttömyysaste
        un = {y: rate(sex, 25, 54, y, ["12"], ["11", "12"]) for y in years}
        rows = []
        for b in range(1900, 2010):
            ex_y = [b + a for a in range(21, 25)]
            out_y = [b + a for a in range(33, 38)]
            if not all(y in un for y in ex_y) or not all(y in years for y in out_y):
                continue
            ex = sum(un[y] for y in ex_y) / len(ex_y)
            emp = sum(rate(sex, y - b, y - b, y, ["11"], ["SSS"]) for y in out_y) / len(out_y)
            ref = sum(rate(sex, 30, 44, y, ["11"], ["SSS"]) for y in out_y) / len(out_y)
            rows.append((b, ex * 100, (emp - ref) * 100))
        bs = np.array([r[0] for r in rows], float)
        X = np.array([r[1] for r in rows]); Y = np.array([r[2] for r in rows])
        detr = lambda v: v - np.polyval(np.polyfit(bs, v, 1), bs)
        x, y = detr(X), detr(Y)
        r = float(np.corrcoef(x, y)[0, 1])
        m = len(x)
        null = [float(np.corrcoef(np.roll(x, s_), y)[0, 1]) for s_ in range(1, m)]
        p = (1 + sum(1 for v in null if v <= r)) / m
        slope = float(np.polyfit(x, y, 1)[0])
        return {"r": round(r, 3), "p": round(p, 4), "n": m, "cohorts": [int(bs[0]), int(bs[-1])], "slope": round(slope, 3),
                "per5": round(slope * 5, 2),
                "rows": [{"born": int(b_), "exposure": round(e, 2), "outcome": round(o, 2)} for b_, e, o in rows]}

    tot = run("SSS")
    res = "tukee" if tot["r"] < 0 and tot["p"] < 0.05 else "kumoaa" if tot["r"] >= 0 else "ei-ratkea"
    women, men = run("2"), run("1")
    return {"id": "ikaluokat", "design": "annos", "result": res, "date": str(date.today()),
            "summary": (f"Syntyneet {tot['cohorts'][0]}–{tot['cohorts'][1]}: työmarkkinoille tulon aikainen työttömyys → työllisyys 33–37-vuotiaana "
                        f"r = {r2(tot['r'])} (p = {tot['p']:.3f}, {tot['n']} ikäluokkaa); 5 %-yks. huonompi tulovaihe → {tot['per5']:+.1f} %-yks. työllisyyttä"),
            "detail": {**tot, "women": {k: women[k] for k in ("r", "p", "per5")}, "men": {k: men[k] for k in ("r", "p", "per5")}}}


def cohort_test(rows):
    """Ikäluokkatesti: lineaarinen trendi pois, Pearson r, kehämäinen permutaatio (yksisuuntainen, r < 0)."""
    bs = np.array([r[0] for r in rows], float)
    X = np.array([r[1] for r in rows]); Y = np.array([r[2] for r in rows])
    detr = lambda v: v - np.polyval(np.polyfit(bs, v, 1), bs)
    x, y = detr(X), detr(Y)
    r = float(np.corrcoef(x, y)[0, 1]); m = len(x)
    null = [float(np.corrcoef(np.roll(x, s_), y)[0, 1]) for s_ in range(1, m)]
    p = (1 + sum(1 for v in null if v <= r)) / m
    slope = float(np.polyfit(x, y, 1)[0])
    return {"r": round(r, 3), "p": round(p, 4), "n": m, "cohorts": [int(bs[0]), int(bs[-1])], "slope": round(slope, 4),
            "per5": round(slope * 5, 3), "rows": [{"born": int(b), "exposure": round(e, 2), "outcome": round(o, 4)} for b, e, o in rows]}


def h1d_cohorts():
    """H1d / T7 (docs/naytto-rekisteri.md): tulovaiheen työttömyys → esikoiset 30 ikävuoteen mennessä."""
    ages = [f"{a:03d}" for a in range(15, 55)]
    ids, d = px("tyokay/115c.px", [("paaasial_toimin_3_20180101", ["SSS", "11", "12"]), ("sukupuoli_9_20180101", ["SSS", "2"]),
                                  ("ikaryhma_10_20180101", ages), ("timeperiod_y", "*")])
    ia, isx, iy, it = (ids.index(x) for x in ("ikaryhma_10_20180101", "sukupuoli_9_20180101", "timeperiod_y", "paaasial_toimin_3_20180101"))
    tab = {(k[isx], int(k[ia]), int(k[iy]), k[it]): v for k, v in d.items()}
    years = sorted({k[2] for k in tab})
    un = {}
    for y in years:
        n = sum(tab.get(("SSS", a, y, "12"), 0) for a in range(25, 55))
        m = sum(tab.get(("SSS", a, y, c), 0) for a in range(25, 55) for c in ("11", "12"))
        un[y] = 100 * n / m
    women = lambda a, y: tab.get(("2", a, y, "SSS"))
    idb, b = px("synt/12dm.px", [("Vuosi", "*"), ("Äidin ikä", [f"{a:03d}" for a in range(20, 40)]), ("Sukupuoli", ["SSS"]), ("Lapsen järjestysluku", ["1"])])
    iv, iag = idb.index("Vuosi"), idb.index("Äidin ikä")
    first = {(int(k[iv]), int(k[iag])): v for k, v in b.items()}

    def rate(a, y):
        w0, w1 = women(a, y - 1), women(a, y)
        w = (w0 + w1) / 2 if w0 and w1 else (w0 if y == 2025 and w0 else None)
        if y == 2025 and w is None:
            w = women(a, 2024)
        return first.get((y, a), 0) / w if w else None

    def cumulative(born, a0, a1):
        vals = [rate(a, born + a) for a in range(a0, a1 + 1)]
        return sum(vals) if all(v is not None for v in vals) and all((born + a, a) in first for a in range(a0, a1 + 1)) else None

    def rows_for(a1, lo, hi):
        out = []
        for born in range(lo, hi + 1):
            ex_y = [born + a for a in range(21, 25)]
            if not all(y in un for y in ex_y):
                continue
            c = cumulative(born, 20, a1)
            if c is not None:
                out.append((born, sum(un[y] for y in ex_y) / 4, c))
        return out

    main = cohort_test(rows_for(29, 1970, 1996))
    by40 = cohort_test(rows_for(39, 1970, 1986))
    res = "tukee" if main["r"] < 0 and main["p"] < 0.05 else "kumoaa" if main["r"] >= 0 else "ei-ratkea"
    return {"id": "esikoisika", "design": "annos", "result": res, "date": str(date.today()),
            "summary": (f"Syntyneet {main['cohorts'][0]}–{main['cohorts'][1]}: tulovaiheen työttömyys → esikoiset 30 ikävuoteen mennessä "
                        f"r = {r2(main['r'])} (p = {main['p']:.3f}, {main['n']} ikäluokkaa); 5 %-yks. huonompi tulovaihe → "
                        f"{main['per5'] * 100:+.1f} esikoista 100 naista kohden"),
            "detail": {**main, "by40": by40}}


def h6():
    """H6 (docs/naytto-rekisteri.md): alkoholiveron alennus 2004. Katkos trendistä vs. lumejaksot, kontrolli, ajoitus."""
    ids, d = px("ksyyt/11ay.px", [("sukupuoli_9_20180101", ["SSS", "1", "2"]), ("kuolinsyyt_1_20210101", ["00-41", "41", "51"]),
                                 ("contentscode", ["ksyyikav"]), ("timeperiod_y", "*")])
    isx, ic, iy = ids.index("sukupuoli_9_20180101"), ids.index("kuolinsyyt_1_20210101"), ids.index("timeperiod_y")
    ser = {}
    for k, v in d.items():
        if v:
            ser.setdefault((k[isx], k[ic]), {})[int(k[iy])] = v
    for sx in ("SSS", "1", "2"):
        a, t = ser[(sx, "41")], ser[(sx, "00-41")]
        ser[(sx, "other")] = {y: t[y] - a[y] for y in t if y in a}

    def dev(series, start):
        pre = [(y, math.log(series[y])) for y in range(start - 12, start) if y in series]
        if len(pre) < 10 or not all(y in series for y in range(start, start + 4)):
            return None
        b = np.polyfit([p_[0] for p_ in pre], [p_[1] for p_ in pre], 1)
        return float(np.mean([math.log(series[y]) - np.polyval(b, y) for y in range(start, start + 4)]))

    starts = [s_ for s_ in range(1983, 2023) if s_ + 3 <= 2025 and (s_ + 3 < 2004 or s_ - 12 > 2007)]

    def katkos(series):
        obs = dev(series, 2004)
        plac = [v for v in (dev(series, s_) for s_ in starts) if v is not None]
        pct = sum(1 for v in plac if v < obs) / len(plac)
        return {"dev": round(obs, 4), "pct": round((math.exp(obs) - 1) * 100, 1), "percentile": round(pct, 3), "placebo": len(plac),
                "above": sum(1 for v in plac if v < obs),
                "placeboMax": round(max(plac), 4), "series": sorted((y, round(v, 1)) for y, v in series.items())}

    alc, oth = katkos(ser[("SSS", "41")]), katkos(ser[("SSS", "other")])
    r1 = "tukee" if alc["dev"] > 0 and alc["percentile"] >= 0.95 else "kumoaa" if alc["dev"] <= 0 else "ei-ratkea"
    t1 = {"id": "katkos", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Alkoholikuolleisuus 2004–2007 {alc['pct']:+.0f} % vuosien 1992–2003 trendistä; suurempi kuin {alc['above']}:ssä {alc['placebo']} lumejaksosta",
          "detail": alc}
    if oth["dev"] >= alc["dev"]:
        r2_ = "kumoaa"
    elif alc["percentile"] >= 0.95 and oth["percentile"] < 0.95:
        r2_ = "tukee"
    else:
        r2_ = "ei-ratkea"
    t2 = {"id": "kontrolli", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Muut taudit 2004–2007 {oth['pct']:+.1f} % trendistä (persentiili {oth['percentile'] * 100:.0f}); alkoholi {alc['pct']:+.0f} %",
          "detail": oth}
    sales = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if k == "nordics2.alcohol_sales_1960_2024" and g_ == "FI" and v is not None and kind in ("observed", "estimate"):
            sales[int(y)] = float(v)
    ps = prewhiten(changes(sales, True))
    pm = prewhiten(changes({y: v for y, v in ser[("SSS", "41")].items() if y <= 2024}, True))
    lc = lead_corr(ps, pm, lags=(0, 1))
    r3 = "tukee" if lc["r"] > 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] <= 0 else "ei-ratkea"
    t3 = {"id": "myynti", "design": "ajoitus", "result": r3, "date": str(date.today()),
          "summary": f"Alkoholin myynnin muutos → alkoholikuolleisuuden muutos r = {r2(lc['r'])} (viive {lc['lag']} v, p = {lc['p']:.3f}, n = {lc['n']})",
          "detail": {**lc, "sales": sorted(sales.items())}}
    # T4–T5: alkoholijuomien reaalihinta (StatFin 15b5)
    idk, kd = px("khi/15b5.px", [("timeperiod_m", "*"), ("coicop_46_20231201", ["SSS", "021"]), ("contentscode", ["ip_khi"])])
    im, ico = idk.index("timeperiod_m"), idk.index("coicop_46_20231201")
    months = {}
    for k, v in kd.items():
        if v is not None:
            months.setdefault((k[ico], int(k[im][:4])), []).append(v)
    full = {key: sum(v) / len(v) for key, v in months.items() if len(v) == 12}
    real = {y: full[("021", y)] / full[("SSS", y)] for (c, y) in full if c == "021" and ("SSS", y) in full}
    pr = prewhiten(changes(real, True))
    mort = {y: v for y, v in ser[("SSS", "41")].items() if y >= 1995}
    pmo = prewhiten(changes(mort, True))
    lc4 = lead_corr(pr, pmo, lags=(0, 1))
    r4 = "tukee" if lc4["r"] < 0 and lc4["p"] < 0.05 else "kumoaa" if lc4["r"] >= 0 else "ei-ratkea"
    pr_no04 = {y: v for y, v in pr.items() if y != 2004}
    lc4b = lead_corr(pr_no04, pmo, lags=(0, 1))
    psales = prewhiten(changes({y: v for y, v in sales.items() if y >= 1995}, True))
    lc4s = lead_corr(pr, psales, lags=(0, 1))
    t4 = {"id": "hinta", "design": "ajoitus", "result": r4, "date": str(date.today()),
          "summary": f"Alkoholin reaalihinnan muutos → alkoholikuolleisuuden muutos r = {r2(lc4['r'])} (viive {lc4['lag']} v, p = {lc4['p']:.3f}, n = {lc4['n']}); ilman vuotta 2004 r = {r2(lc4b['r'])}",
          "detail": {**lc4, "without2004": lc4b, "sales": lc4s,
                     "realPrice": sorted((y, round(v * 100, 1)) for y, v in real.items())}}
    dprice = changes(real, True); dmort = changes(mort, True)
    cand = [y for y in range(2005, 2025) if y in dprice and y + 1 in dmort]
    events = [y for y in cand if dprice[y] >= math.log(1.03)]
    nxt = {y: dmort[y + 1] for y in cand}
    diff = lambda ev: float(np.mean([nxt[y] for y in ev]) - np.mean([nxt[y] for y in cand if y not in ev]))
    obs5 = diff(events)
    rng = random.Random(4); R = 5000
    le = sum(1 for _ in range(R) if diff(rng.sample(cand, len(events))) <= obs5)
    p5 = (le + 1) / (R + 1)
    r5 = "tukee" if obs5 < 0 and p5 < 0.05 else "kumoaa" if obs5 >= 0 else "ei-ratkea"
    t5 = {"id": "korotukset", "design": "ajoitus", "result": r5, "date": str(date.today()),
          "summary": (f"Korotusvuodet (reaalihinta +3 % tai enemmän): {', '.join(map(str, events))}. Kuolleisuus muuttui seuraavana vuonna "
                      f"{(math.exp(np.mean([nxt[y] for y in events])) - 1) * 100:+.1f} %, muina vuosina {(math.exp(np.mean([nxt[y] for y in cand if y not in events])) - 1) * 100:+.1f} % (p = {p5:.3f})"),
          "detail": {"events": events, "diff": round(obs5, 4), "p": round(p5, 4), "years": cand,
                     "priceChange": {y: round((math.exp(dprice[y]) - 1) * 100, 1) for y in cand},
                     "nextMortChange": {y: round((math.exp(nxt[y]) - 1) * 100, 1) for y in cand}}}
    extra = {"homicide": {k: v for k, v in katkos(ser[("SSS", "51")]).items() if k != "series"},
             "men": {k: v for k, v in katkos(ser[("1", "41")]).items() if k != "series"},
             "women": {k: v for k, v in katkos(ser[("2", "41")]).items() if k != "series"}}
    return {"tests": [t1, t2, t3, t4, t5], "predictions": [], "extra": extra}


HVA_TO_MK = {"HVA01": "MK01", "HVA02": "MK01", "HVA03": "MK01", "HVA04": "MK01", "HVA90": "MK01", "HVA05": "MK02",
             "HVA06": "MK04", "HVA07": "MK05", "HVA08": "MK06", "HVA09": "MK07", "HVA10": "MK08", "HVA11": "MK09",
             "HVA12": "MK10", "HVA13": "MK11", "HVA14": "MK12", "HVA15": "MK13", "HVA16": "MK14", "HVA17": "MK15",
             "HVA18": "MK16", "HVA19": "MK17", "HVA20": "MK18", "HVA21": "MK19"}


def h7():
    """H7 (docs/naytto-rekisteri.md): työttömyys → itsemurhat. Annos–vaste maakunnittain ja koko maan ajoitus."""
    ids, d = px("ksyyt/13u5.px", [("alue_23_20260101", list(HVA_TO_MK)), ("kuolinsyyt_1_20210101", ["50"]), ("contentscode", ["ksyylkm"]), ("timeperiod_y", "*")])
    ia, iy = ids.index("alue_23_20260101"), ids.index("timeperiod_y")
    deaths = {}
    for k, v in d.items():
        mk = HVA_TO_MK[k[ia]]
        deaths.setdefault(mk, {}).setdefault(int(k[iy]), 0)
        deaths[mk][int(k[iy])] += v or 0
    ids_w, pop = px("tyokay/115w.px", [("alue_28_20250101", sorted(set(HVA_TO_MK.values()))), ("timeperiod_y", "*"),
                                      ("paaasial_toimin_3_20180101", ["SSS", "11+12", "12"]), ("ikaryhma_10_20180101", ["SSS"]), ("sukupuoli_9_20180101", ["SSS"])])
    ra, ry, rt = ids_w.index("alue_28_20250101"), ids_w.index("timeperiod_y"), ids_w.index("paaasial_toimin_3_20180101")
    P = {}
    for k, v in pop.items():
        P.setdefault(k[ra], {}).setdefault(int(k[ry]), {})[k[rt]] = v
    regions = sorted(r for r in P if r in deaths)
    une = {r: {y: 100 * x["12"] / x["11+12"] for y, x in P[r].items()} for r in regions}
    rate = {r: {y: math.log(deaths[r][y] / P[r][y]["SSS"] * 1e5) for y in P[r] if deaths[r].get(y)} for r in regions}
    years = [t for t in range(1988, 2025) if all(t in rate[r] and t - 1 in une[r] for r in regions)]

    def fe(U):
        rows = [(r, t, rate[r][t], U[r][t - 1]) for r in regions for t in years]
        a = np.array([[x[2], x[3]] for x in rows])
        ri = [regions.index(x[0]) for x in rows]; ti = [years.index(x[1]) for x in rows]
        for col in (0, 1):
            v = a[:, col].copy()
            for _ in range(20):
                for idx, n in ((ri, len(regions)), (ti, len(years))):
                    s_ = np.bincount(idx, v, n) / np.maximum(np.bincount(idx, None, n), 1)
                    v = v - s_[idx]
            a[:, col] = v
        return float((a[:, 0] @ a[:, 1]) / (a[:, 1] @ a[:, 1])), len(rows)

    b, n = fe(une)
    rng = random.Random(5); R = 2000; ge = 0
    for _ in range(R):
        perm = regions[:]; rng.shuffle(perm)
        if fe({r: une[p_] for r, p_ in zip(regions, perm)})[0] >= b:
            ge += 1
    p = (ge + 1) / (R + 1)
    pct = (math.exp(b) - 1) * 100
    r1 = "tukee" if b > 0 and p < 0.05 else "kumoaa" if b <= 0 else "ei-ratkea"
    chk, r1 = panel_checks(rate, une, regions, years, b, 1, 1, r1, 71)
    pctf = lambda v: f"{(math.exp(v) - 1) * 100:+.1f} %"
    t1 = {"id": "annos", "design": "annos", "result": r1, "date": str(date.today()),
          "summary": f"1 %-yks. suurempi työttömyys kuin muualla → itsemurhat {pct:+.1f} % seuraavana vuonna (p = {p:.3f}, {len(regions)} maakuntaa, {years[0]}–{years[-1]})." + checks_text(chk, pctf),
          "detail": {"b": round(b, 5), "pctPerPoint": round(pct, 2), "p": round(p, 4), "n": n, "regions": len(regions), "years": [years[0], years[-1]], "checks": chk}}

    # T2 koko maa
    ids2, s2 = px("ksyyt/11by.px", [("ikaryhma_10_20180101", ["25-44", "45-64"]), ("timeperiod_y", "*"), ("sukupuoli_9_20180101", ["SSS", "1", "2"])])
    a2, y2, sx2 = ids2.index("ikaryhma_10_20180101"), ids2.index("timeperiod_y"), ids2.index("sukupuoli_9_20180101")
    sui = {}
    for k, v in s2.items():
        sui.setdefault(k[sx2], {}).setdefault(int(k[y2]), 0)
        sui[k[sx2]][int(k[y2])] += v or 0
    U = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if k == "fi.histlabour.lfs2019.unemployment_rate" and v is not None and kind in ("observed", "estimate"):
            U[int(y)] = float(v)
    pu = prewhiten(changes({y: v for y, v in U.items() if 1959 <= y <= 2018}, False))
    out = {}
    for sx in ("SSS", "1", "2"):
        ps_ = prewhiten(changes({y: v for y, v in sui[sx].items() if 1959 <= y <= 2018}, True))
        out[sx] = lead_corr(pu, ps_, lags=(0, 1))
    lc = out["SSS"]
    r2_ = "tukee" if lc["r"] > 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] <= 0 else "ei-ratkea"
    t2 = {"id": "ajoitus", "design": "ajoitus", "result": r2_, "date": str(date.today()),
          "summary": f"Koko maa 1960–2018: työttömyyden muutos → itsemurhien (25–64 v) muutos r = {r2(lc['r'])} (viive {lc['lag']} v, p = {lc['p']:.3f}, n = {lc['n']})",
          "detail": {**lc, "men": out["1"], "women": out["2"],
                     "series": sorted((y, v) for y, v in sui["SSS"].items() if 1975 <= y <= 2025),
                     "unemployment": sorted((y, v) for y, v in U.items() if 1975 <= y <= 2018)}}
    return {"tests": [t1, t2], "predictions": []}


def break_2004(series):
    """Sama katkostesti kuin H6:n T1: trendi 1992–2003, poikkeama 2004–2007, lumejaksot."""
    def dev(start):
        pre = [(y, math.log(series[y])) for y in range(start - 12, start) if y in series]
        if len(pre) < 10 or not all(y in series for y in range(start, start + 4)):
            return None
        b = np.polyfit([p_[0] for p_ in pre], [p_[1] for p_ in pre], 1)
        return float(np.mean([math.log(series[y]) - np.polyval(b, y) for y in range(start, start + 4)]))
    starts = [s_ for s_ in range(1983, 2023) if s_ + 3 <= 2025 and (s_ + 3 < 2004 or s_ - 12 > 2007)]
    obs = dev(2004)
    plac = [v for v in (dev(s_) for s_ in starts) if v is not None]
    return {"dev": round(obs, 4), "pct": round((math.exp(obs) - 1) * 100, 1), "above": sum(1 for v in plac if v < obs),
            "placebo": len(plac), "percentile": round(sum(1 for v in plac if v < obs) / len(plac), 3),
            "series": sorted((y, round(v, 1)) for y, v in series.items())}


def nordic_suicides(cs):
    """Eurostat: ikävakioitu itsemurhakuolleisuus 1994–2010 ja 2011–2023. Palauttaa log-muutokset ilman saumaa."""
    geos = "&".join(f"geo={c}" for c in cs)
    old = eurostat_annual("hlth_cd_asdr", f"{geos}&icd10=X60-X84_Y870&sex=T&age=TOTAL&unit=RT")
    new = eurostat_annual("hlth_cd_asdr2", f"{geos}&icd10=X60-X84_Y870&sex=T&age=TOTAL&unit=RT")
    out, levels = {}, {}
    for c in cs:
        ch = {}
        for part in (old.get(c, {}), new.get(c, {})):
            ch.update({y: math.log(part[y]) - math.log(part[y - 1]) for y in part if y - 1 in part and part[y] > 0 and part[y - 1] > 0})
        out[c] = ch
        levels[c] = sorted({**old.get(c, {}), **new.get(c, {})}.items())
    return out, levels


def h8_h9():
    """H8 alkoholi → itsemurhat; H9 masennuslääkkeet → itsemurhat (docs/naytto-rekisteri.md)."""
    sales = {c: {} for c in COUNTRIES}; ad = {c: {} for c in COUNTRIES}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if g_ in COUNTRIES and v is not None and kind in ("observed", "estimate"):
            if k == "nordics2.alcohol_sales_1960_2024":
                sales[g_][int(y)] = float(v)
            elif k == "nordics.antidepressants_2000_2023":
                ad[g_][int(y)] = float(v)
    ids2, s2 = px("ksyyt/11by.px", [("ikaryhma_10_20180101", ["25-44", "45-64"]), ("timeperiod_y", "*"), ("sukupuoli_9_20180101", ["SSS"])])
    y2 = ids2.index("timeperiod_y")
    sui = {}
    for k, v in s2.items():
        sui[int(k[y2])] = sui.get(int(k[y2]), 0) + (v or 0)
    t1lc = lead_corr(prewhiten(changes({y: v for y, v in sales["FI"].items()}, True)),
                     prewhiten(changes({y: v for y, v in sui.items() if 1960 <= y <= 2024}, True)), lags=(0, 1))
    res = lambda lc, sign: ("tukee" if (lc["r"] > 0 if sign > 0 else lc["r"] < 0) and lc["p"] < 0.05
                            else "kumoaa" if (lc["r"] <= 0 if sign > 0 else lc["r"] >= 0) else "ei-ratkea")
    t1 = {"id": "ajoitus", "design": "ajoitus", "result": res(t1lc, 1), "date": str(date.today()),
          "summary": f"Suomi 1961–2024: alkoholin myynnin muutos → itsemurhien (25–64 v) muutos r = {r2(t1lc['r'])} (viive {t1lc['lag']} v, p = {t1lc['p']:.3f}, n = {t1lc['n']})",
          "detail": t1lc}
    sch, slev = nordic_suicides(COUNTRIES)
    ps = {c: prewhiten(sch[c]) for c in COUNTRIES}
    pa = {c: prewhiten(changes(sales[c], True)) for c in COUNTRIES}
    rep = pooled_lead(pa, ps, ["SE", "NO", "DK"], lags=(0, 1))
    t2 = {"id": "toisto", "design": "toisto", "result": res(rep, 1), "date": str(date.today()),
          "summary": f"Ruotsi, Norja ja Tanska 1995–2023: alkoholin myynnin muutos → itsemurhakuolleisuuden muutos r = {r2(rep['r'])} (viive {rep['lag']} v, p = {rep['p']:.3f}, n = {rep['n']})",
          "detail": {**rep, "countries": {c: lead_corr(pa[c], ps[c], lags=(0, 1)) for c in COUNTRIES}}}
    ids3, d3 = px("ksyyt/11ay.px", [("sukupuoli_9_20180101", ["SSS"]), ("kuolinsyyt_1_20210101", ["50"]), ("contentscode", ["ksyyikav"]), ("timeperiod_y", "*")])
    y3 = ids3.index("timeperiod_y")
    br = break_2004({int(k[y3]): v for k, v in d3.items() if v})
    t3 = {"id": "katkos", "design": "luonnollinen", "result": "tukee" if br["dev"] > 0 and br["percentile"] >= 0.95 else "kumoaa" if br["dev"] <= 0 else "ei-ratkea",
          "date": str(date.today()),
          "summary": f"Itsemurhat 2004–2007 {br['pct']:+.0f} % vuosien 1992–2003 trendistä; suurempi kuin {br['above']}:ssä {br['placebo']} lumejaksosta",
          "detail": br}
    pd_ = {c: prewhiten(changes(ad[c], True)) for c in COUNTRIES}
    rep9 = pooled_lead(pd_, ps, COUNTRIES, lags=(0, 1))
    t9 = {"id": "toisto", "design": "toisto", "result": res(rep9, -1), "date": str(date.today()),
          "summary": f"Neljä Pohjoismaata 2001–2023: masennuslääkkeiden käytön muutos → itsemurhakuolleisuuden muutos r = {r2(rep9['r'])} (viive {rep9['lag']} v, p = {rep9['p']:.3f}, n = {rep9['n']})",
          "detail": {**rep9, "countries": {c: lead_corr(pd_[c], ps[c], lags=(0, 1)) for c in COUNTRIES},
                     "levels": {"antidepressants": {c: sorted(ad[c].items()) for c in COUNTRIES}, "suicides": slev}}}
    return {"tests": [t1, t2, t3], "predictions": []}, {"tests": [t9], "predictions": []}


def h10():
    """H10 (docs/naytto-rekisteri.md): oppivelvollisuuden laajennus → NEET-osuus 18-vuotiailla."""
    ids, d = px("tyokay/115c.px", [("paaasial_toimin_3_20180101", ["SSS", "12", "99", "22"]), ("sukupuoli_9_20180101", ["SSS", "1", "2"]),
                                  ("ikaryhma_10_20180101", ["018", "019", "021"]), ("timeperiod_y", "*")])
    ia, isx, iy, it = (ids.index(x) for x in ("ikaryhma_10_20180101", "sukupuoli_9_20180101", "timeperiod_y", "paaasial_toimin_3_20180101"))
    tab = {(k[isx], int(k[ia]), int(k[iy]), k[it]): v for k, v in d.items()}
    years = sorted({k[2] for k in tab})
    neet = lambda sx, a: {y: 100 * (tab[(sx, a, y, "12")] + tab[(sx, a, y, "99")]) / tab[(sx, a, y, "SSS")] for y in years}
    stud = lambda sx, a: {y: 100 * tab[(sx, a, y, "22")] / tab[(sx, a, y, "SSS")] for y in years}

    def dev(series, start):
        pre = [(y, series[y]) for y in range(start - 12, start) if y in series]
        if len(pre) < 12 or not all(y in series for y in (start, start + 1)):
            return None
        b = np.polyfit([p_[0] for p_ in pre], [p_[1] for p_ in pre], 1)
        return float(np.mean([series[y] - np.polyval(b, y) for y in (start, start + 1)]))

    def test(series):
        obs = dev(series, 2023)
        plac = [v for v in (dev(series, s_) for s_ in range(1999, 2022)) if v is not None]
        below = sum(1 for v in plac if v > obs)  # kuinka monessa lumejaksossa poikkeama oli suurempi (vähemmän lasku)
        return {"dev": round(obs, 3), "below": below, "placebo": len(plac), "share": round(below / len(plac), 3),
                "series": sorted((y, round(v, 2)) for y, v in series.items())}

    a18, a21 = test(neet("SSS", 18)), test(neet("SSS", 21))
    r1 = "tukee" if a18["dev"] < 0 and a18["share"] >= 0.95 else "kumoaa" if a18["dev"] >= 0 else "ei-ratkea"
    t1 = {"id": "katkos", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"18-vuotiaat, jotka eivät opiskele eivätkä ole töissä: 2023–2024 {a18['dev']:+.1f} %-yks. vuosien 2011–2022 trendistä; {a18['below']}/{a18['placebo']} lumejaksossa poikkeama oli suurempi (tukeminen vaatisi laskun, joka on suurempi kuin 95 %:ssa)",
          "detail": a18}
    if a21["dev"] <= a18["dev"]:
        r2_ = "kumoaa"
    elif r1 == "tukee" and a21["share"] < 0.95:
        r2_ = "tukee"
    else:
        r2_ = "ei-ratkea"
    t2 = {"id": "vertailu", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"21-vuotiaat (eivät uudistuksen piirissä): {a21['dev']:+.1f} %-yks. trendistä; {a21['below']}/{a21['placebo']} lumejaksossa poikkeama oli suurempi",
          "detail": a21}
    extra = {"students18": test(stud("SSS", 18)), "boys18": {k: v for k, v in test(neet("1", 18)).items() if k != "series"},
             "girls18": {k: v for k, v in test(neet("2", 18)).items() if k != "series"},
             "age19_2024": {"value": round(neet("SSS", 19)[2024], 2), "prev": round(neet("SSS", 19)[2023], 2)}}
    return {"tests": [t1, t2], "predictions": [], "extra": extra}


def fe_panel(Y, X, regions, years, lag=1, trends=False):
    """Kaksisuuntainen kiinteä vaikutus: Y[r][t] ~ X[r][t − lag]. trends=True lisää alueiden omat lineaariset trendit."""
    rows = [(r, t, Y[r][t], X[r][t - lag]) for r in regions for t in years]
    a = np.array([[x[2], x[3]] for x in rows], float)
    ri = np.array([regions.index(x[0]) for x in rows]); ti = np.array([years.index(x[1]) for x in rows])
    tt = np.array([x[1] for x in rows], float)
    for col in (0, 1):
        v = a[:, col].copy()
        for _ in range(60 if trends else 20):
            for idx, n in ((ri, len(regions)), (ti, len(years))):
                s_ = np.bincount(idx, v, n) / np.maximum(np.bincount(idx, None, n), 1)
                v = v - s_[idx]
            if trends:
                for r in range(len(regions)):
                    m = ri == r
                    tc = tt[m] - tt[m].mean()
                    v[m] = v[m] - tc * (tc @ v[m]) / (tc @ tc)
        a[:, col] = v
    return float((a[:, 0] @ a[:, 1]) / (a[:, 1] @ a[:, 1])), len(rows)


def perm_p(Y, X, regions, years, b, side, seed, R=2000, lag=1, trends=False):
    rng = random.Random(seed); hits = 0
    for _ in range(R):
        perm = regions[:]; rng.shuffle(perm)
        bb, _ = fe_panel(Y, {r: X[p_] for r, p_ in zip(regions, perm)}, regions, years, lag=lag, trends=trends)
        if (bb <= b) if side < 0 else (bb >= b):
            hits += 1
    return (hits + 1) / (R + 1)


def panel_checks(Y, X, regions, years, b, lag, side, result, seed):
    """Vakiotarkistukset (docs/naytto-rekisteri.md, sääntölisäys): ennakkotesti ja aluekohtaiset trendit.
    side = ennustettu etumerkki (+1 / −1). Palauttaa tarkistukset ja mahdollisesti muutetun tuloksen."""
    lead_years = [t for t in years if all(t + 2 in X[r] for r in regions)]
    bl, _ = fe_panel(Y, X, regions, lead_years, lag=-2)
    pl = perm_p(Y, X, regions, lead_years, bl, -1 if bl < 0 else 1, seed, R=1000, lag=-2)
    bt, _ = fe_panel(Y, X, regions, years, lag=lag, trends=True)
    pt = perm_p(Y, X, regions, years, bt, side, seed + 1, R=1000, lag=lag, trends=True)
    lead_fail = bl * b > 0 and pl < 0.05 and abs(bl) >= 0.5 * abs(b)
    trend_support = bt * side > 0 and pt < 0.05
    new = result
    if result == "tukee" and (lead_fail or not trend_support):
        new = "ei-ratkea"
    elif result == "kumoaa" and trend_support:
        new = "ei-ratkea"
    checks = {"lead": {"b": round(bl, 5), "p": round(pl, 6), "fails": bool(lead_fail)},
              "trends": {"b": round(bt, 5), "p": round(pt, 6), "supports": bool(trend_support)},
              "original": result, "changed": new != result}
    return checks, new


def checks_text(c, scale=lambda v: f"{v:+.4f}"):
    return (f" Vakiotarkistukset: ennakkotesti {scale(c['lead']['b'])} (p = {c['lead']['p']:.3f}), aluekohtaiset trendit {scale(c['trends']['b'])} "
            f"(p = {c['trends']['p']:.3f})" + (f"; tulos muuttui ({c['original']} → ei ratkea)." if c["changed"] else "; tulos ei muuttunut."))


def h12():
    """H12 (docs/naytto-rekisteri.md): työttömyys → liikennekuolemat."""
    res = lambda lc: "tukee" if lc["r"] < 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] >= 0 else "ei-ratkea"
    # T1 Suomi
    ids, d = px("ksyyt/11ay.px", [("sukupuoli_9_20180101", ["SSS"]), ("kuolinsyyt_1_20210101", ["42"]), ("contentscode", ["ksyyikav"]), ("timeperiod_y", "*")])
    iy = ids.index("timeperiod_y")
    road = {int(k[iy]): v for k, v in d.items() if v}
    U = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if k == "fi.histlabour.lfs2019.unemployment_rate" and v is not None and kind in ("observed", "estimate"):
            U[int(y)] = float(v)
    lc1 = lead_corr(prewhiten(changes({y: v for y, v in U.items() if 1970 <= y <= 2018}, False)),
                    prewhiten(changes({y: v for y, v in road.items() if y <= 2018}, True)), lags=(0, 1))
    t1 = {"id": "ajoitus", "design": "ajoitus", "result": res(lc1), "date": str(date.today()),
          "summary": f"Suomi 1972–2018: työttömyyden muutos → liikennekuolleisuuden muutos r = {r2(lc1['r'])} (viive {lc1['lag']} v, p = {lc1['p']:.3f}, n = {lc1['n']})",
          "detail": {**lc1, "series": sorted((y, round(v, 2)) for y, v in road.items()), "unemployment": sorted(U.items())}}
    # T2 Pohjoismaat
    geos = "&".join(f"geo={c}" for c in COUNTRIES)
    une = eurostat_annual("lfsa_urgan", f"{geos}&age=Y15-74&sex=T&citizen=TOTAL&unit=PC")
    rd = eurostat_annual("tran_sf_roadus", f"{geos}&sex=T&age=TOTAL&unit=P_MHAB&pers_cat=TOTAL")
    pu = {c: prewhiten(changes(une[c], False)) for c in COUNTRIES}
    pr = {c: prewhiten(changes(rd[c], True)) for c in COUNTRIES}
    rep = pooled_lead(pu, pr, ["SE", "NO", "DK"], lags=(0, 1))
    t2 = {"id": "toisto", "design": "toisto", "result": res(rep), "date": str(date.today()),
          "summary": f"Ruotsi, Norja ja Tanska 2000–2024: työttömyyden muutos → tieliikennekuolemien muutos r = {r2(rep['r'])} (viive {rep['lag']} v, p = {rep['p']:.3f}, n = {rep['n']})",
          "detail": {**rep, "countries": {c: lead_corr(pu[c], pr[c], lags=(0, 1)) for c in COUNTRIES}}}
    # T3 maakunnat
    idr, dr = px("ksyyt/13u5.px", [("alue_23_20260101", list(HVA_TO_MK)), ("kuolinsyyt_1_20210101", ["42"]), ("contentscode", ["ksyylkm"]), ("timeperiod_y", "*")])
    ia, iyr = idr.index("alue_23_20260101"), idr.index("timeperiod_y")
    deaths = {}
    for k, v in dr.items():
        mk = HVA_TO_MK[k[ia]]
        deaths.setdefault(mk, {}).setdefault(int(k[iyr]), 0)
        deaths[mk][int(k[iyr])] += v or 0
    ids_w, pop = px("tyokay/115w.px", [("alue_28_20250101", sorted(set(HVA_TO_MK.values()))), ("timeperiod_y", "*"),
                                      ("paaasial_toimin_3_20180101", ["SSS", "11+12", "12"]), ("ikaryhma_10_20180101", ["SSS"]), ("sukupuoli_9_20180101", ["SSS"])])
    ra, ry, rt = ids_w.index("alue_28_20250101"), ids_w.index("timeperiod_y"), ids_w.index("paaasial_toimin_3_20180101")
    P = {}
    for k, v in pop.items():
        P.setdefault(k[ra], {}).setdefault(int(k[ry]), {})[k[rt]] = v
    regions = sorted(r for r in P if r in deaths)
    un = {r: {y: 100 * x["12"] / x["11+12"] for y, x in P[r].items()} for r in regions}
    rate = {r: {y: math.log((deaths[r].get(y, 0) + 1) / P[r][y]["SSS"] * 1e5) for y in P[r] if y in deaths[r]} for r in regions}
    years = [t for t in range(1988, 2025) if all(t in rate[r] and t in un[r] for r in regions)]
    b, n = fe_panel(rate, un, regions, years, lag=0)
    p = perm_p(rate, un, regions, years, b, -1, 121, R=2000, lag=0)
    r3 = "tukee" if b < 0 and p < 0.05 else "kumoaa" if b >= 0 else "ei-ratkea"
    chk, r3 = panel_checks(rate, un, regions, years, b, 0, -1, r3, 122)
    pctf = lambda v: f"{(math.exp(v) - 1) * 100:+.1f} %"
    t3 = {"id": "annos", "design": "annos", "result": r3, "date": str(date.today()),
          "summary": f"1 %-yks. suurempi työttömyys kuin muualla → liikennekuolemat {pctf(b)} samana vuonna (p = {p:.3f}, {len(regions)} maakuntaa, {years[0]}–{years[-1]})." + checks_text(chk, pctf),
          "detail": {"b": round(b, 5), "pctPerPoint": round((math.exp(b) - 1) * 100, 2), "p": round(p, 6), "n": n, "regions": len(regions), "years": [years[0], years[-1]], "checks": chk}}
    return {"tests": [t1, t2, t3], "predictions": []}


def h13():
    """H13 (docs/naytto-rekisteri.md): talouskasvun ja päästöjen irtikytkentä."""
    co2, gdp = {}, {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if v is None or kind not in ("observed", "estimate"):
            continue
        if k == "owid.finland.annual-co2-emissions-per-country.v20261026":
            co2[int(y)] = float(v)
        elif k == "owid.finland.gdp-maddison-project-database.v20261026":
            gdp[int(y)] = float(v)
    dl = lambda d, y: math.log(d[y]) - math.log(d[y - 1])

    def slope(rows):
        a = np.array(rows, float)
        x, y = a[:, 0] - a[:, 0].mean(), a[:, 1] - a[:, 1].mean()
        return float(x @ y / (x @ x))

    def boot(groups_before, groups_after, seed, R=5000):
        """groups_*: lista vuosittaisia ryhmiä [(x, y) …]; lohkot 3 vuotta, slope demeanattuna ryhmän sisällä."""
        rng = np.random.default_rng(seed)
        def resample(groups):
            n = len(groups); out = []
            while len(out) < n:
                st = int(rng.integers(0, n - 2))
                out.extend(groups[st:st + 3])
            return out[:n]
        diffs = []
        for _ in range(R):
            b_ = [r for g in resample(groups_before) for r in g]
            a_ = [r for g in resample(groups_after) for r in g]
            diffs.append(slope(a_) - slope(b_))
        return diffs

    yrs = [y for y in range(1961, 2023) if y in co2 and y - 1 in co2 and y in gdp and y - 1 in gdp]
    before = [[(dl(gdp, y), dl(co2, y))] for y in yrs if y <= 2004]
    after = [[(dl(gdp, y), dl(co2, y))] for y in yrs if y >= 2005]
    e_b, e_a = slope([r for g in before for r in g]), slope([r for g in after for r in g])
    diffs = boot(before, after, 131)
    p1 = float(np.mean([d_ >= 0 for d_ in diffs]))
    res = lambda eb, ea, p_: "tukee" if ea < eb and p_ < 0.05 else "kumoaa" if ea >= eb else "ei-ratkea"
    t1 = {"id": "suomi", "design": "ajoitus", "result": res(e_b, e_a, p1), "date": str(date.today()),
          "summary": f"Suomi: päästöjen jousto BKT:n suhteen 1961–2004 {e_b:.2f}, 2005–2022 {e_a:.2f} (yksisuuntainen p = {p1:.3f})",
          "detail": {"before": round(e_b, 3), "after": round(e_a, 3), "p": round(p1, 4),
                     "co2": sorted((y, round(v / 1e6, 2)) for y, v in co2.items() if y >= 1950),
                     "gdp": sorted((y, round(v / 1e9, 1)) for y, v in gdp.items() if y >= 1950)}}
    # T2 ja T3: Eurostat
    geos = "&".join(f"geo={c}" for c in COUNTRIES)
    _, gg = eurostat_multi("env_air_gge", f"{geos}&airpol=GHG&src_crf=TOTX4_MEMO&unit=THS_T")
    ghg = {k[-1]: v for k, v in gg.items()}
    gdpe = eurostat_annual("nama_10_gdp", f"{geos}&na_item=B1GQ&unit=CLV10_MNAC")
    def groups(cs, lo, hi):
        out = []
        for y in range(lo, hi + 1):
            g = []
            for c in cs:
                if all(t in ghg.get(c, {}) and t in gdpe.get(c, {}) for t in (y, y - 1)):
                    g.append((c, dl(gdpe[c], y), dl(ghg[c], y)))
            if g:
                out.append(g)
        return out
    def demean(groups_):
        # maakohtaiset vakiot: keskiarvot pois maittain koko jakson yli
        rows = [r for g in groups_ for r in g]
        mx = {c: np.mean([r[1] for r in rows if r[0] == c]) for c in {r[0] for r in rows}}
        my = {c: np.mean([r[2] for r in rows if r[0] == c]) for c in mx}
        return [[(r[1] - mx[r[0]], r[2] - my[r[0]]) for r in g] for g in groups_]
    cs = ["SE", "NO", "DK"]
    gb, ga = demean(groups(cs, 1996, 2004)), demean(groups(cs, 2005, 2024))
    e2b, e2a = slope([r for g in gb for r in g]), slope([r for g in ga for r in g])
    p2 = float(np.mean([d_ >= 0 for d_ in boot(gb, ga, 132)]))
    t2 = {"id": "toisto", "design": "toisto", "result": res(e2b, e2a, p2), "date": str(date.today()),
          "summary": f"Ruotsi, Norja ja Tanska: jousto 1996–2004 {e2b:.2f}, 2005–2024 {e2a:.2f} (yksisuuntainen p = {p2:.3f})",
          "detail": {"before": round(e2b, 3), "after": round(e2a, 3), "p": round(p2, 4)}}
    chg = {}
    for c in COUNTRIES:
        last = max(y for y in ghg[c] if y in gdpe[c])
        chg[c] = {"gdp": round((gdpe[c][last] / gdpe[c][2005] - 1) * 100, 2), "ghg": round((ghg[c][last] / ghg[c][2005] - 1) * 100, 2), "last": last}
    up = sum(1 for c in COUNTRIES if chg[c]["ghg"] > 0)
    ok = all(chg[c]["gdp"] > 0 and chg[c]["ghg"] < 0 for c in COUNTRIES)
    r3 = "tukee" if ok else "kumoaa" if up >= 2 else "ei-ratkea"
    t3 = {"id": "absoluuttinen", "design": "tasmallisyys", "result": r3, "date": str(date.today()),
          "summary": "2005 → " + str(chg["FI"]["last"]) + ": " + "; ".join(f"{ {'FI': 'Suomi', 'SE': 'Ruotsi', 'NO': 'Norja', 'DK': 'Tanska'}[c]} BKT {chg[c]['gdp']:+.0f} %, päästöt {chg[c]['ghg']:+.0f} %" for c in COUNTRIES),
          "detail": {"countries": chg}}
    return {"tests": [t1, t2, t3], "predictions": []}


def break_test(series, start, length, excl, first=1960, last=2021, pre=12):
    """Katkos lineaarisesta log-trendistä (pre vuotta ennen) ja lumejaksot, jotka eivät osu väliin excl (esijakso mukaan)."""
    def dev(st):
        pp = [(y, math.log(series[y])) for y in range(st - pre, st) if y in series and series[y] > 0]
        if len(pp) < pre - 2 or not all(y in series for y in range(st, st + length)):
            return None
        b = np.polyfit([q[0] for q in pp], [q[1] for q in pp], 1)
        return float(np.mean([math.log(series[y]) - np.polyval(b, y) for y in range(st, st + length)]))
    obs = dev(start)
    starts = [st for st in range(first, last + 1) if st + length - 1 <= max(series) and (st + length - 1 < excl[0] or st - pre > excl[1])]
    plac = [v for v in (dev(st) for st in starts) if v is not None]
    above = sum(1 for v in plac if v < obs)
    return {"dev": round(obs, 4), "pct": round((math.exp(obs) - 1) * 100, 1), "above": above, "placebo": len(plac),
            "percentile": round(above / len(plac), 3)}


def h14():
    """H14 (docs/naytto-rekisteri.md): avioerolain uudistus 1988."""
    ids, d = px("ssaaty/121v.px", [("timeperiod_y", "*"), ("contentscode", ["ssaaty-vm3136_as", "ssaaty-vm2126_as", "ssaaty-vaesto"])])
    iy, ic = ids.index("timeperiod_y"), ids.index("contentscode")
    T = {}
    for k, v in d.items():
        if v is not None:
            T.setdefault(k[ic], {})[int(k[iy])] = v
    pop = T["ssaaty-vaesto"]
    rate = lambda key: {y: T[key][y] / pop[y] * 1000 for y in T[key] if y in pop and pop[y] and y >= 1900}
    div, mar = rate("ssaaty-vm3136_as"), rate("ssaaty-vm2126_as")
    a, m = break_test(div, 1988, 4, (1988, 1991)), break_test(mar, 1988, 4, (1988, 1991))
    r1 = "tukee" if a["dev"] > 0 and a["percentile"] >= 0.95 else "kumoaa" if a["dev"] <= 0 else "ei-ratkea"
    r2_ = "kumoaa" if m["dev"] >= a["dev"] else "tukee" if r1 == "tukee" and m["percentile"] < 0.95 else "ei-ratkea"
    t1 = {"id": "katkos", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Avioerot 1988–1991 {a['pct']:+.0f} % vuosien 1976–1987 trendistä; suurempi kuin {a['above']}:ssä {a['placebo']} lumejaksosta",
          "detail": {**a, "series": sorted((y, round(v, 3)) for y, v in div.items() if y >= 1950)}}
    t2 = {"id": "kontrolli", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Solmitut avioliitot 1988–1991 {m['pct']:+.0f} % trendistä; suurempi kuin {m['above']}:ssä {m['placebo']} lumejaksosta",
          "detail": {**m, "series": sorted((y, round(v, 3)) for y, v in mar.items() if y >= 1950)}}
    # lisätieto: pysyvyys 1992–1999 saman trendin jatkeena
    pp = [(y, math.log(div[y])) for y in range(1976, 1988)]
    bb = np.polyfit([q[0] for q in pp], [q[1] for q in pp], 1)
    later = float(np.mean([math.log(div[y]) - np.polyval(bb, y) for y in range(1992, 2000)]))
    return {"tests": [t1, t2], "predictions": [], "extra": {"dev1992_1999pct": round((math.exp(later) - 1) * 100, 1)}}


def h15():
    """H15 (docs/naytto-rekisteri.md): euron käyttöönotto 2002 → hinnat (ero vertailumaihin, lumevuodet)."""
    geos = "&".join(f"geo={c}" for c in COUNTRIES)
    _, d = eurostat_multi("prc_hicp_aind", f"{geos}&coicop=CP00&coicop=CP111&unit=RCH_A_AVG")
    # avaimet: (unit, coicop, geo)
    ser = {}
    for k, v in d.items():
        ser.setdefault((k[-2], k[-1]), v)
    def test(cp):
        diff = {y: ser[(cp, "FI")][y] - np.mean([ser[(cp, c)][y] for c in ("SE", "DK", "NO")]) for y in range(1997, 2026)
                if all(y in ser[(cp, c)] for c in COUNTRIES)}
        plac = [diff[y] for y in range(1997, 2020) if y not in (2001, 2002, 2003)]
        obs = diff[2002]
        above = sum(1 for v in plac if v < obs)
        res = "tukee" if obs > 0 and above / len(plac) >= 0.95 else "kumoaa" if obs <= 0 else "ei-ratkea"
        return res, {"diff2002": round(obs, 2), "diff2001": round(diff[2001], 2), "diff2003": round(diff[2003], 2), "above": above, "placebo": len(plac),
                     "placeboMax": round(max(plac), 2), "fi2002": ser[(cp, "FI")][2002],
                     "others2002": {c: ser[(cp, c)][2002] for c in ("SE", "DK", "NO")},
                     "diff": sorted((y, round(v, 2)) for y, v in diff.items())}
    r1, d1 = test("CP00"); r2_, d2 = test("CP111")
    t1 = {"id": "kokonais", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Kuluttajahinnat 2002: Suomi {d1['fi2002']:.1f} %, vertailumaat keskimäärin {np.mean(list(d1['others2002'].values())):.1f} %; ero {d1['diff2002']:+.1f} %-yks., suurempi kuin {d1['above']}:ssä {d1['placebo']} lumevuodesta",
          "detail": d1}
    t2 = {"id": "ravintolat", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Ravintolat ja kahvilat 2002: Suomi {d2['fi2002']:.1f} %, vertailumaat keskimäärin {np.mean(list(d2['others2002'].values())):.1f} %; ero {d2['diff2002']:+.1f} %-yks., suurempi kuin {d2['above']}:ssä {d2['placebo']} lumevuodesta",
          "detail": d2}
    return {"tests": [t1, t2], "predictions": []}


def h16():
    """H16 (docs/naytto-rekisteri.md): kieltolain kumoaminen 1932 → henkirikokset ja pahoinpitelyt."""
    cnt = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if k in ("crime.hcs.fi.police_murder", "crime.hcs.fi.police_manslaughter", "crime.hcs.fi.police_assault") and v is not None and kind in ("observed", "estimate"):
            cnt.setdefault(k.split("_")[-1], {})[int(y)] = float(v)
    ids, d = px("ssaaty/121v.px", [("timeperiod_y", "*"), ("contentscode", ["ssaaty-vaesto"])])
    iy = ids.index("timeperiod_y")
    pop = {int(k[iy]): v for k, v in d.items() if v}
    hom = {y: (cnt["murder"][y] + cnt["manslaughter"][y]) / pop[y] * 1e5 for y in cnt["murder"] if y in cnt["manslaughter"] and y in pop}
    ass = {y: cnt["assault"][y] / pop[y] * 1e5 for y in cnt["assault"] if y in pop}

    def change(series, t):
        a = [series.get(y) for y in range(t - 5, t)]; b = [series.get(y) for y in range(t + 1, t + 6)] if t == 1932 else [series.get(y) for y in range(t, t + 5)]
        if None in a or None in b:
            return None
        return math.log(np.mean(b)) - math.log(np.mean(a))

    def test(series):
        obs = change(series, 1932)
        plac = [v for v in (change(series, t) for t in range(1954, 2019)) if v is not None]
        below = sum(1 for v in plac if v > obs)
        res = "tukee" if obs < 0 and below / len(plac) >= 0.95 else "kumoaa" if obs >= 0 else "ei-ratkea"
        return res, {"pct": round((math.exp(obs) - 1) * 100, 1), "below": below, "placebo": len(plac),
                     "placeboMin": round((math.exp(min(plac)) - 1) * 100, 1),
                     "series": sorted((y, round(v, 2)) for y, v in series.items())}
    r1, d1 = test(hom); r2_, d2 = test(ass)
    t1 = {"id": "kumoaminen", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Tapot ja murhat 100 000 asukasta kohden: 1927–1931 → 1933–1937 {d1['pct']:+.0f} %; jyrkempi lasku kuin {d1['below']}:ssä {d1['placebo']} tavallisesta jaksosta (jyrkin {d1['placeboMin']:+.0f} %)",
          "detail": d1}
    t2 = {"id": "pahoinpitelyt", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Pahoinpitelyt: 1927–1931 → 1933–1937 {d2['pct']:+.0f} %; {d2['below']}/{d2['placebo']} tavallisessa jaksossa muutos oli suurempi",
          "detail": d2}
    return {"tests": [t1, t2], "predictions": []}


def h17():
    """H17 (docs/naytto-rekisteri.md): neuvolalaki 1944 → imeväis- ja äitiyskuolleisuus."""
    imr, mat = {}, {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if v is None or kind not in ("observed", "estimate"):
            continue
        if k == "statfin.12aq.v20261019.imr.sexSSS":
            imr[int(y)] = float(v)
        elif k == "owid.finland.maternal-mortality.v20261026":
            mat[int(y)] = float(v)
    ids, d = px("ssaaty/121v.px", [("timeperiod_y", "*"), ("contentscode", ["ssaaty-vm01", "ssaaty-vm11", "ssaaty-vaesto"])])
    iy, ic = ids.index("timeperiod_y"), ids.index("contentscode")
    T = {}
    for k, v in d.items():
        if v:
            T.setdefault(k[ic], {})[int(k[iy])] = v
    births, deaths, pop = T["ssaaty-vm01"], T["ssaaty-vm11"], T["ssaaty-vaesto"]
    other = {y: (deaths[y] - imr[y] / 1000 * births[y]) / pop[y] * 1000 for y in imr if y in births and y in deaths and y in pop}
    WARS = [(1914, 1922), (1939, 1951)]

    def dev(series, s0):
        pre = [(y, math.log(series[y])) for y in range(s0 - 19, s0 - 7) if y in series and series[y] > 0]
        if len(pre) < 10 or not all(y in series for y in range(s0, s0 + 6)):
            return None
        b = np.polyfit([q[0] for q in pre], [q[1] for q in pre], 1)
        return float(np.mean([math.log(series[y]) - np.polyval(b, y) for y in range(s0, s0 + 6)]))

    starts = [s0 for s0 in range(1880, 2011) if all(s0 + 5 < a or s0 - 19 > b for a, b in WARS)]

    def test(series):
        obs = dev(series, 1946)
        plac = [v for v in (dev(series, s0) for s0 in starts) if v is not None]
        steeper = sum(1 for v in plac if v > obs)
        return {"dev": round(obs, 4), "pct": round((math.exp(obs) - 1) * 100, 1), "steeper": steeper, "placebo": len(plac),
                "series": sorted((y, round(v, 2)) for y, v in series.items() if 1900 <= y <= 1975)}
    a, m, c = test(imr), test(mat), test(other)
    res = lambda x: "tukee" if x["dev"] < 0 and x["steeper"] / x["placebo"] >= 0.95 else "kumoaa" if x["dev"] >= 0 else "ei-ratkea"
    r1, r2_ = res(a), res(m)
    if c["dev"] <= a["dev"]:
        r3 = "kumoaa"
    elif r1 == "tukee" and c["steeper"] / c["placebo"] < 0.95:
        r3 = "tukee"
    else:
        r3 = "ei-ratkea"
    txt = lambda name, x: f"{name} 1946–1951 {x['pct']:+.0f} % vuosien 1927–1938 trendistä; jyrkempi kuin {x['steeper']}:ssä {x['placebo']} lumejaksosta"
    t1 = {"id": "imevaiset", "design": "luonnollinen", "result": r1, "date": str(date.today()), "summary": txt("Imeväiskuolleisuus", a), "detail": a}
    t2 = {"id": "aidit", "design": "tasmallisyys", "result": r2_, "date": str(date.today()), "summary": txt("Äitiyskuolleisuus", m), "detail": m}
    t3 = {"id": "kontrolli", "design": "tasmallisyys", "result": r3, "date": str(date.today()), "summary": txt("Muun väestön kuolleisuus", c), "detail": c}
    return {"tests": [t1, t2, t3], "predictions": []}


def h18():
    """H18 (docs/naytto-rekisteri.md): Ruotsiin muutto, työntö (FI työttömyys) ja veto (SE BKT)."""
    to_se, from_se, U = {}, {}, {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if v is None:
            continue
        if k == "fi.korkiasaari1993.table3.to_sweden":
            to_se[int(y)] = float(v)
        elif k == "fi.korkiasaari1993.table3.from_sweden":
            from_se[int(y)] = float(v)
        elif k == "fi.histlabour.lfs2019.unemployment_rate" and kind in ("observed", "estimate"):
            U[int(y)] = float(v)
    url = "https://raw.githubusercontent.com/open-numbers/ddf--gapminder--fasttrack/master/countries_etc_datapoints/ddf--datapoints--gdp_pcap--by--country--time.csv"
    with urllib.request.urlopen(url, timeout=120) as r:
        rows = r.read().decode().splitlines()[1:]
    se = {int(t): float(x) for c, t, x in (row.split(",") for row in rows) if c == "swe"}
    win = lambda d: {y: v for y, v in d.items() if 1958 <= y <= 1992}
    pu = prewhiten(changes(win(U), False))
    pg = prewhiten(changes(win(se), True))
    pt = prewhiten(changes(win(to_se), True))
    pf = prewhiten(changes(win(from_se), True))
    l1, l2, l3 = lead_corr(pu, pt, lags=(0, 1)), lead_corr(pg, pt, lags=(0, 1)), lead_corr(pu, pf, lags=(0, 1))
    pos = lambda lc: "tukee" if lc["r"] > 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] <= 0 else "ei-ratkea"
    neg = lambda lc: "tukee" if lc["r"] < 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] >= 0 else "ei-ratkea"
    fmt = lambda name, lc: f"{name} r = {r2(lc['r'])} (viive {lc['lag']} v, p = {lc['p']:.3f}, n = {lc['n']})"
    t1 = {"id": "tyonto", "design": "ajoitus", "result": pos(l1), "date": str(date.today()),
          "summary": fmt("Suomen työttömyyden muutos → muutto Ruotsiin:", l1),
          "detail": {**l1, "toSweden": sorted(to_se.items()), "fromSweden": sorted(from_se.items()), "unemployment": sorted((y, v) for y, v in U.items() if y <= 1995)}}
    t2 = {"id": "veto", "design": "ajoitus", "result": pos(l2), "date": str(date.today()), "summary": fmt("Ruotsin BKT:n kasvu → muutto Ruotsiin:", l2), "detail": l2}
    t3 = {"id": "paluu", "design": "tasmallisyys", "result": neg(l3), "date": str(date.today()), "summary": fmt("Suomen työttömyyden muutos → paluumuutto Ruotsista:", l3), "detail": l3}
    return {"tests": [t1, t2, t3], "predictions": []}


def h19():
    """H19 (docs/naytto-rekisteri.md): yleinen nopeusrajoitus 1973 → liikennekuolemat ja vakavuus."""
    ids, d = px("ton/11bh.px", [("contentscode", ["ton-kuol", "ton-louk"]), ("timeperiod_y", "*")])
    ic, iy = ids.index("contentscode"), ids.index("timeperiod_y")
    T = {}
    for k, v in d.items():
        if v:
            T.setdefault(k[ic], {})[int(k[iy])] = float(v)
    kuol, louk = T["ton-kuol"], T["ton-louk"]
    leth = {y: kuol[y] / louk[y] * 100 for y in kuol if y in louk}
    a, b = break_test(kuol, 1973, 4, (1961, 1976)), break_test(leth, 1973, 4, (1961, 1976))
    res = lambda x: "tukee" if x["dev"] < 0 and x["percentile"] <= 0.05 else "kumoaa" if x["dev"] >= 0 else "ei-ratkea"
    t1 = {"id": "katkos", "design": "luonnollinen", "result": res(a), "date": str(date.today()),
          "summary": f"Kuolleet 1973–1976 {a['pct']:+.0f} % vuosien 1961–1972 trendistä; pienempi kuin {a['placebo'] - a['above']}:ssä {a['placebo']} lumejaksosta",
          "detail": {**a, "deaths": sorted(kuol.items()), "injured": sorted(louk.items())}}
    t2 = {"id": "vakavuus", "design": "tasmallisyys", "result": res(b), "date": str(date.today()),
          "summary": f"Kuolleita sataa loukkaantunutta kohden 1973–1976 {b['pct']:+.0f} % trendistä; pienempi kuin {b['placebo'] - b['above']}:ssä {b['placebo']} lumejaksosta",
          "detail": {**b, "lethality": sorted((y, round(v, 3)) for y, v in leth.items())}}
    return {"tests": [t1, t2], "predictions": []}


def h20():
    """H20 (docs/naytto-rekisteri.md): keskiolut ruokakauppoihin 1969 → myynti, pahoinpitelyt; kontrolli petokset."""
    sales, cnt = {}, {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if v is None or kind not in ("observed", "estimate"):
            continue
        if k == "nordics2.alcohol_sales_1960_2024":
            sales.setdefault(g_, {})[int(y)] = float(v)
        elif k in ("crime.hcs.fi.police_assault", "crime.hcs.fi.police_fraud"):
            cnt.setdefault(k.split("_")[-1], {})[int(y)] = float(v)
    ids, d = px("ssaaty/121v.px", [("timeperiod_y", "*"), ("contentscode", ["ssaaty-vaesto"])])
    iy = ids.index("timeperiod_y")
    pop = {int(k[iy]): v for k, v in d.items() if v}
    rate = {n: {y: c[y] / pop[y] * 1e5 for y in c if y in pop} for n, c in cnt.items()}

    def placebo(ch, y0, y1):
        obs = ch[1969]
        plac = [ch[y] for y in range(y0, y1 + 1) if y != 1969 and y in ch]
        above = sum(1 for v in plac if v < obs)
        return {"change": round(obs, 4), "pct": round((math.exp(obs) - 1) * 100, 1), "above": above, "placebo": len(plac),
                "percentile": round(above / len(plac), 3)}
    lch = lambda s_: {y: math.log(s_[y]) - math.log(s_[y - 1]) for y in s_ if y - 1 in s_ and s_[y] > 0 and s_[y - 1] > 0}
    chs = {c: lch(sales[c]) for c in ("FI", "SE", "NO", "DK")}
    diff = {y: chs["FI"][y] - np.mean([chs[c][y] for c in ("SE", "NO", "DK")]) for y in chs["FI"] if all(y in chs[c] for c in ("SE", "NO", "DK"))}
    a = placebo(diff, 1961, 2024)
    a["countries"] = {c: round((math.exp(chs[c][1969]) - 1) * 100, 1) for c in chs}
    b = placebo(lch(rate["assault"]), 1950, 2022)
    f = placebo(lch(rate["fraud"]), 1950, 2022)
    res = lambda x: "tukee" if x["change"] > 0 and x["percentile"] >= 0.95 else "kumoaa" if x["change"] <= 0 else "ei-ratkea"
    r1, r2_ = res(a), res(b)
    r3 = "kumoaa" if f["change"] >= b["change"] else "tukee" if r2_ == "tukee" and f["percentile"] < 0.95 else "ei-ratkea"
    t1 = {"id": "myynti", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Alkoholin myynti 1968→1969: Suomi {a['countries']['FI']:+.0f} %, Ruotsi {a['countries']['SE']:+.0f} %, Norja {a['countries']['NO']:+.0f} %, Tanska {a['countries']['DK']:+.0f} %; ero suurempi kuin {a['above']}:ssä {a['placebo']} lumevuodesta",
          "detail": {**a, "series": {c: sorted(sales[c].items()) for c in ("FI", "SE", "NO", "DK")}}}
    t2 = {"id": "pahoinpitelyt", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Pahoinpitelyt 1968→1969 {b['pct']:+.0f} %; suurempi kuin {b['above']}:ssä {b['placebo']} lumevuodesta",
          "detail": {**b, "assault": sorted((y, round(v, 2)) for y, v in rate["assault"].items() if y >= 1950), "fraud": sorted((y, round(v, 2)) for y, v in rate["fraud"].items() if y >= 1950)}}
    t3 = {"id": "kontrolli", "design": "tasmallisyys", "result": r3, "date": str(date.today()),
          "summary": f"Petokset 1968→1969 {f['pct']:+.0f} %; suurempi kuin {f['above']}:ssä {f['placebo']} lumevuodesta",
          "detail": f}
    return {"tests": [t1, t2, t3], "predictions": []}


def h21():
    """H21 (docs/naytto-rekisteri.md): vankiluvun muutos → ryöstöt ja pahoinpitelyt (eristysvaikutus)."""
    cnt = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g_, v, kind = json.loads(line)
        if v is not None and k in ("crime.hcs.fi.prison_all_daily_average", "crime.hcs.fi.police_robbery", "crime.hcs.fi.police_assault"):
            cnt.setdefault(k.split(".")[-1], {})[int(y)] = float(v)
    ids, d = px("ssaaty/121v.px", [("timeperiod_y", "*"), ("contentscode", ["ssaaty-vaesto"])])
    iy = ids.index("timeperiod_y")
    pop = {int(k[iy]): v for k, v in d.items() if v}
    rate = {n: {y: c[y] / pop[y] * 1e5 for y in c if y in pop and 1948 <= y <= 2019} for n, c in cnt.items()}
    pp = prewhiten(changes(rate["prison_all_daily_average"], True))
    out = []
    for tid, key, name in (("ryostot", "police_robbery", "ryöstöjen"), ("pahoinpitelyt", "police_assault", "pahoinpitelyjen")):
        lc = lead_corr(pp, prewhiten(changes(rate[key], True)), lags=(1, 2))
        res = "tukee" if lc["r"] < 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] >= 0 else "ei-ratkea"
        out.append({"id": tid, "design": "ajoitus", "result": res, "date": str(date.today()),
                    "summary": f"Vankiluvun muutos → {name} muutos: r = {r2(lc['r'])} (viive {lc['lag']} v, p = {lc['p']:.3f}, n = {lc['n']})",
                    "detail": {**lc, "prison": sorted((y, round(v, 1)) for y, v in rate["prison_all_daily_average"].items()),
                               "crime": sorted((y, round(v, 1)) for y, v in rate[key].items())}})
    return {"tests": out, "predictions": []}


def h22():
    """H22 (docs/naytto-rekisteri.md): EU-jäsenyys 1995 → ruoan suhteellinen hinta (vs. Tanska, Norja)."""
    _, d = eurostat_multi("nama_10_co3_p3", "geo=FI&geo=SE&geo=NO&geo=DK&coicop=CP011&coicop=TOTAL&unit=CP_MNAC&unit=CLV15_MNAC")
    rel = {}
    for c in ("FI", "SE", "NO", "DK"):
        g = lambda co, u: d[(u, co, c)]
        defl = lambda co: {y: g(co, "CP_MNAC")[y] / g(co, "CLV15_MNAC")[y] for y in g(co, "CP_MNAC") if y in g(co, "CLV15_MNAC")}
        f, t = defl("CP011"), defl("TOTAL")
        rel[c] = {y: math.log(f[y] / t[y]) for y in f if y in t}

    def gap(y0, y1):
        if not all(y0 in rel[c] and y1 in rel[c] for c in ("FI", "DK", "NO")):
            return None
        ch = {c: rel[c][y1] - rel[c][y0] for c in ("FI", "DK", "NO")}
        return ch["FI"] - (ch["DK"] + ch["NO"]) / 2

    def test(k):
        obs = gap(1994, 1994 + k)
        plac = [v for v in (gap(y, y + k) for y in range(1975, 2030) if not (y < 1995 <= y + k)) if v is not None]
        below = sum(1 for v in plac if v > obs)
        res = "tukee" if obs < 0 and below / len(plac) >= 0.95 else "kumoaa" if obs >= 0 else "ei-ratkea"
        return res, {"gap": round(obs, 4), "pct": round((math.exp(obs) - 1) * 100, 1), "below": below, "placebo": len(plac),
                     "percentile": round(below / len(plac), 3), "placeboMin": round(min(plac), 4)}
    r1, a = test(1)
    r2_, b = test(5)
    one = {c: round((math.exp(rel[c][1995] - rel[c][1994]) - 1) * 100, 1) for c in rel}
    idx = {c: sorted((y, round(math.exp(rel[c][y] - rel[c][1994]) * 100, 1)) for y in rel[c]) for c in rel}
    t1 = {"id": "vuosi", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Ruoan suhteellinen hinta 1994→1995: Suomi {one['FI']:+.1f} %, Tanska {one['DK']:+.1f} %, Norja {one['NO']:+.1f} % (Ruotsi {one['SE']:+.1f} %); Suomen ero {a['pct']:+.1f} %, pienempi kuin {a['below']}:ssä {a['placebo']} lumevuodesta",
          "detail": {**a, "countries": one, "index": idx}}
    t2 = {"id": "pysyvyys", "design": "luonnollinen", "result": r2_, "date": str(date.today()),
          "summary": f"Sama ero viidessä vuodessa 1994→1999: {b['pct']:+.1f} %, pienempi kuin {b['below']}:ssä {b['placebo']} viiden vuoden lumejaksosta",
          "detail": b}
    return {"tests": [t1, t2], "predictions": []}


GMD_URL = "https://gmd-releases.s3.ap-southeast-2.amazonaws.com/data/distribute/GMD_2026_09.dta"


def gmd_series(iso, var):
    """Global Macro Database 2026_09 (ladataan välimuistiin GMD_DTA tai /tmp)."""
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    import pandas as pd
    d = pd.read_stata(path, columns=["ISO3", "year", var])
    d = d[(d["ISO3"] == iso) & d[var].notna()]
    return {int(y): float(v) for y, v in zip(d["year"], d[var])}


def h24e():
    """H24e (docs/naytto-rekisteri.md): valuuttakriisit muissa maissa; reaalinen vs. pelkkä nimellinen heikkeneminen → vienti/BKT."""
    import pandas as pd
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    d = pd.read_stata(path, columns=["ISO3", "countryname", "year", "CurrencyCrisis", "REER", "exports_GDP", "infl"])
    d = d[d["year"].between(1950, 2025)]
    ev = []
    for iso, g in d.groupby("ISO3"):
        if iso == "FIN":
            continue
        g = g.set_index("year")
        cc, R, X, I = g["CurrencyCrisis"].to_dict(), g["REER"].to_dict(), g["exports_GDP"].to_dict(), g["infl"].to_dict()
        for t in range(1960, 2016):
            if cc.get(t) == 1 and cc.get(t - 1) == 0 and all(cc.get(s_) != 1 for s_ in range(t - 5, t)):
                win = range(t - 1, t + 6)
                if all(pd.notna(R.get(s_)) and pd.notna(X.get(s_)) and R.get(s_) > 0 and X.get(s_) > 0 for s_ in win) and \
                   all(pd.notna(I.get(s_)) and I.get(s_) < 25 for s_ in win):
                    ev.append({"iso": iso, "country": str(g["countryname"].iloc[0]), "t": t,
                               "x": math.log(R[t + 5] / R[t - 1]), "y": math.log(X[t + 5] / X[t]), "i": math.log(R[t + 1] / R[t - 1])})
    rng = np.random.default_rng(1)
    def rank(v):
        o = np.argsort(v, kind="stable"); r = np.empty(len(v)); r[o] = np.arange(len(v)); return r
    xs, ys = np.array([e["x"] for e in ev]), np.array([e["y"] for e in ev])
    rx, ry = rank(xs), rank(ys)
    rho = float(np.corrcoef(rx, ry)[0, 1])
    perm = np.array([np.corrcoef(rx, rng.permutation(ry))[0, 1] for _ in range(10000)])
    p1 = float(np.mean(perm <= rho))
    r1 = "tukee" if rho < 0 and p1 < 0.05 else "kumoaa" if rho >= 0 else "ei-ratkea"
    real = [e["y"] for e in ev if e["i"] <= math.log(0.90)]
    nom = [e["y"] for e in ev if e["i"] > math.log(0.95)]
    diff = float(np.median(real) - np.median(nom))
    pool = np.array(real + nom); k = len(real)
    pd_ = []
    for _ in range(10000):
        q = rng.permutation(pool)
        pd_.append(np.median(q[:k]) - np.median(q[k:]))
    p2 = float(np.mean(np.array(pd_) >= diff))
    r2x = "tukee" if diff > 0 and p2 < 0.05 else "kumoaa" if diff <= 0 else "ei-ratkea"
    pc = lambda v: round((math.exp(v) - 1) * 100, 1)
    t1 = {"id": "annos", "design": "annos", "result": r1, "date": str(date.today()),
          "summary": f"{len(ev)} valuuttakriisiä {len({e['iso'] for e in ev})} maassa (ei Suomea): jäljelle jäänyt reaalinen muutos t0−1 → t0+5 vs. viennin osuuden muutos t0 → t0+5, rho = {rho:.2f} (permutaatio-p = {p1:.4f})",
          "detail": {"rho": round(rho, 3), "p": round(p1, 4), "n": len(ev), "countries": len({e['iso'] for e in ev}),
                     "events": [{"iso": e["iso"], "country": e["country"], "t": e["t"], "x": pc(e["x"]), "y": pc(e["y"]), "i": pc(e["i"])} for e in ev]}}
    t2 = {"id": "vainjos", "design": "tasmallisyys", "result": r2x, "date": str(date.today()),
          "summary": f"Viennin osuuden muutos viidessä vuodessa: välitön reaalinen heikkeneminen t0−1 → t0+1 ≥ 10 % (n = {len(real)}) mediaani {pc(float(np.median(real))):+.1f} %, pelkkä nimellinen (alle 5 %, n = {len(nom)}) mediaani {pc(float(np.median(nom))):+.1f} %; permutaatio-p = {p2:.4f}",
          "detail": {"realN": len(real), "nomN": len(nom), "realMedian": pc(float(np.median(real))), "nomMedian": pc(float(np.median(nom))), "p": round(p2, 4)}}
    return {"tests": [t1, t2], "predictions": []}


def h24f():
    """H24f (docs/naytto-rekisteri.md): kriisin jälkeinen vientiosuuden nousu = E − G; poikkeamat maan tavallisista jaksoista."""
    import pandas as pd
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    d = pd.read_stata(path, columns=["ISO3", "year", "CurrencyCrisis", "REER", "exports_GDP", "exports", "deflator", "rGDP", "infl"])
    d = d[d["year"].between(1950, 2025)]
    ok = lambda v: v is not None and pd.notna(v) and v > 0
    rows, dropped = [], 0
    for iso, g in d.groupby("ISO3"):
        if iso == "FIN":
            continue
        g = g.set_index("year")
        cc, R, X, I = g["CurrencyCrisis"].to_dict(), g["REER"].to_dict(), g["exports_GDP"].to_dict(), g["infl"].to_dict()
        EX, DF, RG = g["exports"].to_dict(), g["deflator"].to_dict(), g["rGDP"].to_dict()
        lowinf = lambda win: all(pd.notna(I.get(s_)) and I.get(s_) < 25 for s_ in win)
        EG = lambda t: (math.log(EX[t + 5] / DF[t + 5]) - math.log(EX[t] / DF[t]), math.log(RG[t + 5] / RG[t])) \
            if all(ok(EX.get(s_)) and ok(DF.get(s_)) and ok(RG.get(s_)) for s_ in (t, t + 5)) else None
        events = [t for t in range(1960, 2016) if cc.get(t) == 1 and cc.get(t - 1) == 0 and all(cc.get(s_) != 1 for s_ in range(t - 5, t))
                  and all(ok(R.get(s_)) and ok(X.get(s_)) for s_ in range(t - 1, t + 6)) and lowinf(range(t - 1, t + 6))]
        if not events:
            continue
        normal = [eg for s0 in range(1960, 2016) if all(cc.get(s_) == 0 for s_ in range(s0 - 1, s0 + 6)) and lowinf(range(s0 - 1, s0 + 6)) and (eg := EG(s0))]
        for t in events:
            eg = EG(t)
            if eg is None or len(normal) < 5:
                dropped += 1
                continue
            e_dev = eg[0] - float(np.median([q[0] for q in normal]))
            g_dev = eg[1] - float(np.median([q[1] for q in normal]))
            rows.append({"iso": iso, "t": t, "E": eg[0], "G": eg[1], "Edev": e_dev, "Gdev": g_dev})
    def sign_test(vals):
        n = len(vals); k = sum(1 for v in vals if v > 0)
        p_ = sum(math.comb(n, j) for j in range(k, n + 1)) / 2 ** n
        return k, n, p_
    E_dev = [r_["Edev"] for r_ in rows]; S = [r_["Edev"] + r_["Gdev"] for r_ in rows]; G_dev = [r_["Gdev"] for r_ in rows]
    k1, n1, p1 = sign_test(E_dev); k2, n2, p2 = sign_test(S)
    m1, m2, mg = float(np.median(E_dev)), float(np.median(S)), float(np.median(G_dev))
    res = lambda m, p_: "tukee" if m > 0 and p_ < 0.05 else "kumoaa" if m <= 0 else "ei-ratkea"
    pc = lambda v: round((math.exp(v) - 1) * 100, 1)
    t1 = {"id": "vienti", "design": "luonnollinen", "result": res(m1, p1), "date": str(date.today()),
          "summary": f"{n1} kriisiä: viennin arvo (BKT-deflaattorilla) kasvoi viidessä vuodessa maan tavallista enemmän {k1}/{n1} tapauksessa, mediaanipoikkeama {pc(m1):+.1f} % (merkkitesti p = {p1:.4f})",
          "detail": {"k": k1, "n": n1, "p": round(p1, 6), "medianPct": pc(m1), "dropped": dropped}}
    t2 = {"id": "hajotelma", "design": "tasmallisyys", "result": res(m2, p2), "date": str(date.today()),
          "summary": f"Viennin lisäkasvu ylitti BKT:n vajeen {k2}/{n2} tapauksessa, mediaani {pc(m2):+.1f} % (p = {p2:.4f}); BKT:n mediaanipoikkeama {pc(mg):+.1f} %",
          "detail": {"k": k2, "n": n2, "p": round(p2, 6), "medianPct": pc(m2), "gdpMedianPct": pc(mg),
                     "events": [{"iso": r_["iso"], "t": r_["t"], "e": pc(r_["Edev"]), "g": pc(r_["Gdev"])} for r_ in rows]}}
    return {"tests": [t1, t2], "predictions": []}


def h25():
    """H25 korkopreemio ja H25b sopeutuminen finanssikriisiin (docs/naytto-rekisteri.md), Global Macro Database 2026_09."""
    import pandas as pd
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    d = pd.read_stata(path, columns=["ISO3", "year", "ltrate", "REER", "rGDP_pc"])
    S = {iso: g.set_index("year") for iso, g in d.groupby("ISO3")}
    NAMES_ = {"FIN": "Suomi", "SWE": "Ruotsi", "NOR": "Norja", "DNK": "Tanska", "AUS": "Australia", "CAN": "Kanada", "CHE": "Sveitsi",
              "GBR": "Iso-Britannia", "ISL": "Islanti", "JPN": "Japani", "NZL": "Uusi-Seelanti", "USA": "Yhdysvallat", "AUT": "Itävalta",
              "BEL": "Belgia", "DEU": "Saksa", "ESP": "Espanja", "FRA": "Ranska", "GRC": "Kreikka", "IRL": "Irlanti", "ITA": "Italia",
              "LUX": "Luxemburg", "NLD": "Alankomaat", "PRT": "Portugali"}
    # H25
    lt = lambda c, y: S[c]["ltrate"].get(y)
    spread = lambda c, ys: float(np.mean([lt(c, y) - lt("DEU", y) for y in ys]))
    COMP = ["AUS", "CAN", "CHE", "GBR", "JPN", "NOR", "NZL", "SWE", "USA"]
    pre, post = range(1990, 1996), range(1999, 2008)
    ch = {c: spread(c, post) - spread(c, pre) for c in COMP + ["FIN"]}
    fin = ch["FIN"]
    r1 = "tukee" if all(fin < ch[c] for c in COMP) else "kumoaa" if fin >= float(np.median([ch[c] for c in COMP])) else "ei-ratkea"
    fs, ss = spread("FIN", post), spread("SWE", post)
    r2 = "tukee" if fs - ss < 0 else "kumoaa"
    sp_series = {c: sorted((int(y), round(lt(c, y) - lt("DEU", y), 2)) for y in range(1985, 2020) if pd.notna(lt(c, y)) and pd.notna(lt("DEU", y))) for c in ("FIN", "SWE", "DNK", "ITA")}
    a1 = {"id": "korkoero", "design": "luonnollinen", "result": r1, "date": str(date.today()),
          "summary": f"Korkoero Saksaan, muutos 1990–95 → 1999–2007: Suomi {fin:+.2f} %-yks. ({spread('FIN', pre):.2f} → {spread('FIN', post):.2f}); vertailumaiden mediaani {float(np.median([ch[c] for c in COMP])):+.2f}, suurin pieneneminen {NAMES_[min(COMP, key=lambda c: ch[c])]} {min(ch[c] for c in COMP):+.2f}",
          "detail": {"changes": {NAMES_[c]: round(v, 2) for c, v in sorted(ch.items(), key=lambda kv: kv[1])}, "spreads": sp_series,
                     "finPre": round(spread("FIN", pre), 2), "finPost": round(fs, 2)}}
    a2 = {"id": "ruotsi", "design": "tasmallisyys", "result": r2, "date": str(date.today()),
          "summary": f"Korkoero Saksaan 1999–2007: Suomi {fs:.2f}, Ruotsi {ss:.2f} %-yks.; ero {fs - ss:+.2f} (1990–95: Suomi {spread('FIN', pre):.2f}, Ruotsi {spread('SWE', pre):.2f})",
          "detail": {"fin": round(fs, 2), "swe": round(ss, 2), "finPre": round(spread("FIN", pre), 2), "swePre": round(spread("SWE", pre), 2)}}
    # H25b
    EURO = ["AUT", "BEL", "DEU", "ESP", "FRA", "GRC", "IRL", "ITA", "LUX", "NLD", "PRT"]
    FLOAT = ["AUS", "CAN", "CHE", "GBR", "ISL", "JPN", "NOR", "NZL", "SWE", "USA"]
    reer = {c: math.log(S[c]["REER"][2009] / S[c]["REER"][2007]) for c in EURO + FLOAT + ["FIN", "DNK"]}
    gdp = {c: math.log(S[c]["rGDP_pc"][2015] / S[c]["rGDP_pc"][2007]) for c in EURO + FLOAT + ["FIN", "DNK"]}
    rng = np.random.default_rng(1)
    def group_test(v, lower, higher):
        diff = float(np.median([v[c] for c in higher]) - np.median([v[c] for c in lower]))
        pool = [v[c] for c in lower + higher]; k = len(lower)
        draws = []
        for _ in range(10000):
            q = rng.permutation(pool); draws.append(np.median(q[k:]) - np.median(q[:k]))
        return diff, float(np.mean(np.array(draws) >= diff))
    d1, p1 = group_test(reer, FLOAT, EURO)   # odotus: omavaluuttaisten REER laski enemmän (pienempi)
    d2, p2 = group_test(gdp, EURO, FLOAT)    # odotus: euromaiden kasvu pienempi
    rb1 = "tukee" if d1 > 0 and p1 < 0.05 else "kumoaa" if d1 <= 0 else "ei-ratkea"
    rb2 = "tukee" if d2 > 0 and p2 < 0.05 else "kumoaa" if d2 <= 0 else "ei-ratkea"
    allc = EURO + FLOAT
    def rk(v):
        o = np.argsort(v, kind="stable"); r_ = np.empty(len(v)); r_[o] = np.arange(len(v)); return r_
    rx, ry = rk(np.array([reer[c] for c in allc])), rk(np.array([gdp[c] for c in allc]))
    rho = float(np.corrcoef(rx, ry)[0, 1])
    p3 = float(np.mean(np.array([np.corrcoef(rx, rng.permutation(ry))[0, 1] for _ in range(10000)]) <= rho))
    rb3 = "tukee" if rho < 0 and p3 < 0.05 else "kumoaa" if rho >= 0 else "ei-ratkea"
    pc = lambda v: round((math.exp(v) - 1) * 100, 1)
    med = lambda v, g: pc(float(np.median([v[c] for c in g])))
    pts = [{"iso": c, "name": NAMES_[c], "group": "euro" if c in EURO else "oma" if c in FLOAT else c, "reer": pc(reer[c]), "gdp": pc(gdp[c])} for c in allc + ["FIN", "DNK"]]
    b1 = {"id": "kurssi", "design": "tasmallisyys", "result": rb1, "date": str(date.today()),
          "summary": f"Reaalikurssi 2007 → 2009: omavaluuttaiset mediaani {med(reer, FLOAT):+.1f} %, euromaat {med(reer, EURO):+.1f} % (p = {p1:.4f}); Suomi {pc(reer['FIN']):+.1f} %",
          "detail": {"p": round(p1, 4), "floatMedian": med(reer, FLOAT), "euroMedian": med(reer, EURO), "fin": pc(reer["FIN"]), "dnk": pc(reer["DNK"])}}
    b2 = {"id": "kasvu", "design": "luonnollinen", "result": rb2, "date": str(date.today()),
          "summary": f"BKT asukasta kohden 2007 → 2015: euromaat mediaani {med(gdp, EURO):+.1f} %, omavaluuttaiset {med(gdp, FLOAT):+.1f} % (p = {p2:.4f}); Suomi {pc(gdp['FIN']):+.1f} %, Tanska {pc(gdp['DNK']):+.1f} %",
          "detail": {"p": round(p2, 4), "euroMedian": med(gdp, EURO), "floatMedian": med(gdp, FLOAT), "fin": pc(gdp["FIN"]), "dnk": pc(gdp["DNK"]), "points": pts}}
    b3 = {"id": "annos", "design": "annos", "result": rb3, "date": str(date.today()),
          "summary": f"21 maata: reaalikurssin muutos 2007 → 2009 vs. BKT asukasta kohden 2007 → 2015, rho = {rho:.2f} (permutaatio-p = {p3:.4f})",
          "detail": {"rho": round(rho, 3), "p": round(p3, 4), "n": len(allc)}}
    return {"tests": [a1, a2], "predictions": []}, {"tests": [b1, b2, b3], "predictions": []}


def h25cd():
    """H25c yhteinen korko → asuntohinnat ja H25d ydineuromaat vs. omavaluuttaiset (docs/naytto-rekisteri.md)."""
    import pandas as pd
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    d = pd.read_stata(path, columns=["ISO3", "year", "strate", "infl", "rHPI", "ltrate", "rGDP_pc"])
    S = {iso: g.set_index("year") for iso, g in d.groupby("ISO3")}
    NM = {"FIN": "Suomi", "SWE": "Ruotsi", "AUT": "Itävalta", "BEL": "Belgia", "DEU": "Saksa", "ESP": "Espanja", "FRA": "Ranska",
          "GRC": "Kreikka", "IRL": "Irlanti", "ITA": "Italia", "LUX": "Luxemburg", "NLD": "Alankomaat", "PRT": "Portugali"}
    EURO12 = ["AUT", "BEL", "DEU", "ESP", "FRA", "GRC", "IRL", "ITA", "LUX", "NLD", "PRT", "FIN"]
    rng = np.random.default_rng(1)
    rr = lambda c: float(np.mean([S[c]["strate"][y] - S[c]["infl"][y] for y in range(1999, 2008)]))
    hp = lambda c: math.log(S[c]["rHPI"][2007] / S[c]["rHPI"][1998])
    pc = lambda v: round((math.exp(v) - 1) * 100, 1)
    def rk(v):
        o = np.argsort(v, kind="stable"); r_ = np.empty(len(v)); r_[o] = np.arange(len(v)); return r_
    X, Y = np.array([rr(c) for c in EURO12]), np.array([hp(c) for c in EURO12])
    rx, ry = rk(X), rk(Y)
    rho = float(np.corrcoef(rx, ry)[0, 1])
    p1 = float(np.mean(np.array([np.corrcoef(rx, rng.permutation(ry))[0, 1] for _ in range(10000)]) <= rho))
    c1r = "tukee" if rho < 0 and p1 < 0.05 else "kumoaa" if rho >= 0 else "ei-ratkea"
    fr, sr, fh, sh = rr("FIN"), rr("SWE"), hp("FIN"), hp("SWE")
    c2r = "ei-ratkea" if fr >= sr else "tukee" if fh > sh else "kumoaa"
    pts = [{"iso": c, "name": NM[c], "rr": round(rr(c), 2), "hp": pc(hp(c))} for c in EURO12]
    c1 = {"id": "annos", "design": "annos", "result": c1r, "date": str(date.today()),
          "summary": f"12 euromaata: reaalikorko 1999–2007 vs. asuntojen reaalihinnan muutos 1998 → 2007, rho = {rho:.2f} (permutaatio-p = {p1:.4f})",
          "detail": {"rho": round(rho, 3), "p": round(p1, 4), "points": pts}}
    c2 = {"id": "ruotsi", "design": "tasmallisyys", "result": c2r, "date": str(date.today()),
          "summary": f"Reaalikorko 1999–2007: Suomi {fr:.2f} %, Ruotsi {sr:.2f} %; asuntojen reaalihinnat 1998 → 2007: Suomi {pc(fh):+.0f} %, Ruotsi {pc(sh):+.0f} %",
          "detail": {"finRate": round(fr, 2), "sweRate": round(sr, 2), "finHp": pc(fh), "sweHp": pc(sh)}}
    # H25d
    EURO = ["AUT", "BEL", "DEU", "ESP", "FRA", "GRC", "IRL", "ITA", "LUX", "NLD", "PRT"]
    FLOAT = ["AUS", "CAN", "CHE", "GBR", "ISL", "JPN", "NOR", "NZL", "SWE", "USA"]
    maxspread = {c: max(S[c]["ltrate"][y] - S["DEU"]["ltrate"][y] for y in range(2010, 2013)) for c in EURO + ["FIN"]}
    core = [c for c in EURO if c == "DEU" or maxspread[c] <= 1.5]
    crisis = [c for c in EURO if c not in core]
    gdp = {c: math.log(S[c]["rGDP_pc"][2015] / S[c]["rGDP_pc"][2007]) for c in EURO + FLOAT + ["FIN"]}
    diff = float(np.median([gdp[c] for c in FLOAT]) - np.median([gdp[c] for c in core]))
    pool = [gdp[c] for c in core + FLOAT]; k = len(core)
    draws = []
    for _ in range(10000):
        q = rng.permutation(pool); draws.append(np.median(q[k:]) - np.median(q[:k]))
    p2 = float(np.mean(np.array(draws) >= diff))
    d1r = "tukee" if diff > 0 and p2 < 0.05 else "kumoaa" if diff <= 0 else "ei-ratkea"
    med = lambda g: pc(float(np.median([gdp[c] for c in g])))
    names = lambda g: ", ".join(NM.get(c, c) for c in g)
    d1 = {"id": "ydinmaat", "design": "luonnollinen", "result": d1r, "date": str(date.today()),
          "summary": f"BKT asukasta kohden 2007 → 2015: ydineuromaat ({names(core)}) mediaani {med(core):+.1f} %, omavaluuttaiset {med(FLOAT):+.1f} % (p = {p2:.4f}); velkakriisimaat {med(crisis):+.1f} %, Suomi {pc(gdp['FIN']):+.1f} %",
          "detail": {"core": core, "crisis": crisis, "p": round(p2, 4), "coreMedian": med(core), "floatMedian": med(FLOAT), "crisisMedian": med(crisis),
                     "fin": pc(gdp["FIN"]), "finMaxSpread": round(maxspread["FIN"], 2),
                     "maxSpread": {NM[c]: round(float(v), 2) for c, v in maxspread.items()}, "gdp": {NM.get(c, c): pc(v) for c, v in gdp.items()}}}
    return {"tests": [c1, c2], "predictions": []}, {"tests": [d1], "predictions": []}


def pension_age(c):
    """Alin vanhuuseläkeikä vuosina syntymävuoden mukaan (vuoden 2017 uudistus)."""
    if c <= 1954:
        return 63.0
    if c <= 1961:
        return 63.0 + 0.25 * (c - 1954)
    if c <= 1964:
        return 65.0
    return 65.0 + {1965: 2, 1966: 3, 1967: 4}.get(c, 4) / 12


def fe_ols(rows, key):
    """y ~ x + ikä + vuosi (kiinteät vaikutukset), HC1-keskivirhe. rows: (ikä, vuosi, x, y)."""
    ages, years = sorted({r[0] for r in rows}), sorted({r[1] for r in rows})
    X = np.array([[r[2]] + [1.0] + [float(r[0] == a) for a in ages[1:]] + [float(r[1] == t) for t in years[1:]] for r in rows])
    Y = np.array([r[3] for r in rows])
    XtXi = np.linalg.pinv(X.T @ X)
    beta = XtXi @ X.T @ Y
    e = Y - X @ beta
    n, k = X.shape
    V = XtXi @ (X.T * e ** 2) @ X @ XtXi * n / (n - k)
    se = math.sqrt(V[0, 0])
    p = math.erfc(abs(beta[0] / se) / math.sqrt(2))  # normaaliapproksimaatio (vapausasteita ~100)
    return {"b": round(float(beta[0]), 3), "se": round(se, 3), "p": round(p, 6), "n": n}


def h23():
    """H23 (docs/naytto-rekisteri.md): eläkeiän nosto 2017 → 63–65-vuotiaiden työllisyys (annos, kiinteät vaikutukset)."""
    ages = [f"{a:03d}" for a in range(60, 68)]
    ids, d = px("tyokay/115c.px", [("paaasial_toimin_3_20180101", ["SSS", "11", "24+29"]), ("sukupuoli_9_20180101", ["SSS"]),
                                    ("ikaryhma_10_20180101", ages), ("timeperiod_y", [str(y) for y in range(2005, 2025)])])
    ia, ii, iy = ids.index("paaasial_toimin_3_20180101"), ids.index("ikaryhma_10_20180101"), ids.index("timeperiod_y")
    T = {}
    for k, v in d.items():
        T[(k[ia], int(k[ii]), int(k[iy]))] = v
    clamp = lambda v: min(max(v, 0.0), 1.0)
    dose = lambda a, t: clamp(pension_age(t - a) - a) - clamp(63 - a)
    share = lambda code, a, t: T[(code, a, t)] / T[("SSS", a, t)] * 100
    rows = lambda code, lead, y0, y1: [(a, t, dose(a, t + lead), share(code, a, t)) for a in range(60, 68) for t in range(y0, y1 + 1)]
    emp = fe_ols(rows("11", 0, 2010, 2024), "emp")
    pen = fe_ols(rows("24+29", 0, 2010, 2024), "pen")
    pre = fe_ols(rows("11", 3, 2010, 2017), "pre")
    pre_bad = pre["b"] > 0 and pre["p"] < 0.05
    r1 = "kumoaa" if emp["b"] <= 0 else "tukee" if emp["p"] < 0.05 and not pre_bad else "ei-ratkea"
    r2_ = "kumoaa" if pen["b"] >= 0 else "tukee" if pen["p"] < 0.05 else "ei-ratkea"
    grid = {a: [(t, round(share("11", a, t), 1)) for t in range(2005, 2025)] for a in range(60, 68)}
    doses = {a: [(t, round(dose(a, t), 2)) for t in range(2010, 2025)] for a in range(60, 68)}
    t1 = {"id": "tyolliset", "design": "annos", "result": r1, "date": str(date.today()),
          "summary": f"Työllisten osuus: täysi annos (koko ikäryhmä ei vielä eläkeiässä) b = {emp['b']:+.1f} %-yks. (p {'< 0.0001' if emp['p'] < 0.0001 else '= ' + format(emp['p'], '.4f')}, {emp['n']} ikä–vuosi-solua); esitrenditarkistus b = {pre['b']:+.1f} (p = {pre['p']:.3f})",
          "detail": {**emp, "pre": pre, "employment": grid, "dose": doses}}
    t2 = {"id": "elakelaiset", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Eläkeläisten osuus: täysi annos b = {pen['b']:+.1f} %-yks. (p {'< 0.0001' if pen['p'] < 0.0001 else '= ' + format(pen['p'], '.4f')}, {pen['n']} solua)",
          "detail": pen}
    # E1 (rekisteri 27.11.2026): 64-vuotiaiden työllisyysaste 2025, lukitaan; toteutunut täytetään kun 115c sisältää 2025.
    E = {a: dict(v) for a, v in grid.items()}
    ctrl = lambda t: float(np.mean([E[a][t] - E[a][t - 1] for a in (60, 61, 62)]))
    def one_step(a, t, yrs):
        return E[a][t - 1] + emp["b"] * (dose(a, t) - dose(a, t - 1)) + float(np.mean([ctrl(s) for s in yrs]))
    errs = [E[a][t] - one_step(a, t, range(max(2006, t - 10), t)) for a in range(60, 68) for t in range(2011, 2025)]
    q10, q90 = (float(v) for v in np.quantile(errs, [0.1, 0.9]))
    pt = one_step(64, 2025, range(2015, 2025)) if 2024 in E[64] else None
    actual = None
    try:
        ids2, d2 = px("tyokay/115c.px", [("paaasial_toimin_3_20180101", ["SSS", "11"]), ("sukupuoli_9_20180101", ["SSS"]),
                                         ("ikaryhma_10_20180101", ["064"]), ("timeperiod_y", ["2025"])])
        v2 = {k[ids2.index("paaasial_toimin_3_20180101")]: v for k, v in d2.items()}
        actual = round(v2["11"] / v2["SSS"] * 100, 1)
    except Exception:
        pass
    pred = {"id": "h23-tyollisyys64-2025", "target": "64-vuotiaiden työllisyysaste, %", "year": 2025,
            "point": round(pt, 1), "lo": round(pt + q10, 1), "hi": round(pt + q90, 1), "registered": "2026-11-27",
            "basis": f"Vuoden 2024 arvo {E[64][2024]:.1f} + b {emp['b']:.1f} × annoksen nousu 0.25 + yhteinen trendi; 80 %:n väli {len(errs)} takautuvan ennusteen virheistä. Ilman vaikutusta (b = 0) ennuste olisi {pt - emp['b'] * 0.25:.1f}.",
            "actual": actual}
    return {"tests": [t1, t2], "predictions": [pred]}


def h24():
    """H24 (docs/naytto-rekisteri.md): devalvaatiot 1957–1991 → viennin osuus ja nettovienti (määrät)."""
    ids, d = px("ntp/15ai.px", [("toimiala_79_20180101", ["SSS"]), ("taloustoimi_1_20180101", ["B1GMH", "P6K", "P7R"]),
                                 ("contentscode", ["ntp-CP1860", "ntp-CP1948", "ntp-CP1960", "ntp-CP1975", "ntp-R2015P"]), ("timeperiod_y", "*")])
    it, ic, iy = ids.index("taloustoimi_1_20180101"), ids.index("contentscode"), ids.index("timeperiod_y")
    V = {}
    for k, v in d.items():
        if v:
            V.setdefault((k[it], k[ic]), {})[int(k[iy])] = float(v)
    share = {}
    for code, y0, y1 in (("ntp-CP1948", 1948, 1959), ("ntp-CP1960", 1960, 1974), ("ntp-CP1975", 1975, 2025)):
        for y in range(y0, y1 + 1):
            gcode = "ntp-CP1860" if code == "ntp-CP1948" else code  # BKT 1948–1959 on sarjassa CP1860 (sama yksikkö)
            if y in V.get(("P6K", code), {}) and y in V.get(("B1GMH", gcode), {}):
                share[y] = V[("P6K", code)][y] / V[("B1GMH", gcode)][y]
    ex, im = V[("P6K", "ntp-R2015P")], V[("P7R", "ntp-R2015P")]
    net = {y: math.log(ex[y]) - math.log(im[y]) for y in ex if y in im}
    lsh = {y: math.log(v) for y, v in share.items()}
    rng = np.random.default_rng(1)

    def test(series, events, first):
        ch = lambda t: series[t + 2] - series[t] if t in series and t + 2 in series else None
        obs = [ch(t) for t in events]
        plac = [c for t in range(first, 2024) if (c := ch(t)) is not None and all(t + 2 < e or t > e + 2 for e in events)]
        m = float(np.mean(obs))
        draws = np.array([np.mean(rng.choice(plac, len(events), replace=False)) for _ in range(20000)])
        pct = float(np.mean(draws < m))
        med = float(np.median(plac))
        return {"mean": round(m, 4), "pctChange": round((math.exp(m) - 1) * 100, 1), "percentile": round(pct, 3),
                "placebo": len(plac), "events": {str(t): round((math.exp(o) - 1) * 100, 1) for t, o in zip(events, obs)},
                "aboveMedian": sum(1 for o in obs if o > med), "placeboMedianPct": round((math.exp(med) - 1) * 100, 1)}
    E5, E3 = [1957, 1967, 1977, 1982, 1991], [1977, 1982, 1991]
    a = test(lsh, E5, 1953)
    c = test(net, E3, 1976)
    # Jälkikäteinen herkkyystarkistus (ei rekisteröity): ilman vuotta 1991; lumeikkunat samat kuin päätestissä.
    def without(series, events, all_events, first):
        ch = lambda t: series[t + 2] - series[t] if t in series and t + 2 in series else None
        plac = [cc for t in range(first, 2024) if (cc := ch(t)) is not None and all(t + 2 < e or t > e + 2 for e in all_events)]
        m = float(np.mean([ch(t) for t in events]))
        draws = np.array([np.mean(rng.choice(plac, len(events), replace=False)) for _ in range(20000)])
        return {"pctChange": round((math.exp(m) - 1) * 100, 1), "percentile": round(float(np.mean(draws < m)), 3)}
    a["no1991"] = without(lsh, E5[:-1], E5, 1953)
    c["no1991"] = without(net, E3[:-1], E3, 1976)
    res = lambda x: "tukee" if x["mean"] > 0 and x["percentile"] >= 0.95 else "kumoaa" if x["mean"] <= 0 else "ei-ratkea"
    k = a["aboveMedian"]
    r2_ = "tukee" if k == 5 else "kumoaa" if k <= 2 else "ei-ratkea"
    ev = lambda x: ", ".join(f"{t} {v:+.0f} %" for t, v in x["events"].items())
    t1 = {"id": "osuus", "design": "luonnollinen", "result": res(a), "date": str(date.today()),
          "summary": f"Viennin BKT-osuus kahdessa vuodessa devalvaatiosta: keskimäärin {a['pctChange']:+.1f} % ({ev(a)}); suurempi kuin {a['percentile'] * 100:.0f} %:ssa lumejoukoista ({a['placebo']} lumeikkunaa)",
          "detail": {**a, "share": sorted((y, round(v * 100, 2)) for y, v in share.items())}}
    t2 = {"id": "toisto", "design": "toisto", "result": r2_, "date": str(date.today()),
          "summary": f"{k}/5 devalvaatiota ylitti lumeikkunoiden mediaanin ({a['placeboMedianPct']:+.1f} %)", "detail": {"above": k, "of": 5}}
    t3 = {"id": "maarat", "design": "tasmallisyys", "result": res(c), "date": str(date.today()),
          "summary": f"Viennin määrä suhteessa tuonnin määrään kahdessa vuodessa: keskimäärin {c['pctChange']:+.1f} % ({ev(c)}); suurempi kuin {c['percentile'] * 100:.0f} %:ssa lumejoukoista ({c['placebo']} lumeikkunaa)",
          "detail": c}
    # H24b (rekisteri 27.11.2026): kesto t0 → t0+5 ja kuluminen t0+2 → t0+5.
    def window(series, events, start_off, k, first=1953, last=2020):
        ch = lambda t, a, b: series[t + b] - series[t + a] if t + a in series and t + b in series else None
        obs = [ch(t, start_off, start_off + k) for t in events]
        plac = [c for t in range(first, last + 1) if (c := ch(t, 0, k)) is not None and not any(t <= e <= t + k for e in E5)]
        m = float(np.mean(obs))
        draws = np.array([np.mean(rng.choice(plac, len(events), replace=False)) for _ in range(20000)])
        return {"mean": round(m, 4), "pctChange": round((math.exp(m) - 1) * 100, 1), "percentile": round(float(np.mean(draws < m)), 3),
                "placebo": len(plac), "placeboMedianPct": round((math.exp(float(np.median(plac))) - 1) * 100, 1),
                "events": {str(t): round((math.exp(o) - 1) * 100, 1) for t, o in zip(events, obs)}}
    kd = window(lsh, E5, 0, 5)
    kl = window(lsh, E5, 2, 3)
    kd["no1991"] = {k_: v for k_, v in window(lsh, E5[:-1], 0, 5).items() if k_ in ("pctChange", "percentile")}  # jälkikäteinen, ei rekisteröity
    rk = "tukee" if kd["mean"] > 0 and kd["percentile"] >= 0.95 else "kumoaa" if kd["mean"] <= 0 else "ei-ratkea"
    rl = "tukee" if kl["mean"] >= 0 else "kumoaa" if kl["percentile"] <= 0.05 else "ei-ratkea"
    evs = lambda x: ", ".join(f"{t} {v:+.0f} %" for t, v in x["events"].items())
    b1 = {"id": "kesto", "design": "luonnollinen", "result": rk, "date": str(date.today()),
          "summary": f"Viennin BKT-osuus viidessä vuodessa devalvaatiosta: keskimäärin {kd['pctChange']:+.1f} % ({evs(kd)}); suurempi kuin {kd['percentile'] * 100:.0f} %:ssa lumejoukoista ({kd['placebo']} lumeikkunaa, mediaani {kd['placeboMedianPct']:+.1f} %)",
          "detail": kd}
    b2 = {"id": "kuluminen", "design": "tasmallisyys", "result": rl, "date": str(date.today()),
          "summary": f"Muutos vuodesta t0+2 vuoteen t0+5: keskimäärin {kl['pctChange']:+.1f} % ({evs(kl)}); suurempi kuin {kl['percentile'] * 100:.0f} %:ssa lumejoukoista ({kl['placebo']} lumeikkunaa, mediaani {kl['placeboMedianPct']:+.1f} %)",
          "detail": kl}
    # H24c (rekisteri 27.11.2026): inflaatio ja palkat t0 → t0+3 vs. kuluminen t0+2 → t0+5 (Spearman, tarkka p).
    ids_c, d_c = px("khi/11xp.px", [("timeperiod_y", "*"), ("contentscode", ["khi-pisteluku"])])
    cpi = {int(k[ids_c.index("timeperiod_y")]): v for k, v in d_c.items() if v}
    wage = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k_, y_, g_, v_, kind_ = json.loads(line)
        if k_ == "fi.historical20261026.jst.wage" and v_ is not None:
            wage[int(y_)] = float(v_)
    wear = [lsh[t + 5] - lsh[t + 2] for t in E5]
    import itertools
    def ranks(v):
        o = sorted(range(len(v)), key=lambda i: v[i]); r = [0] * len(v)
        for pos, i in enumerate(o):
            r[i] = pos
        return r
    def spearman(xv, yv):
        rx, ry = ranks(xv), ranks(yv)
        return float(np.corrcoef(rx, ry)[0, 1])
    def rank_test(expo):
        rho = spearman(expo, wear)
        perms = [spearman(expo, [wear[i] for i in pp]) for pp in itertools.permutations(range(len(wear)))]
        p_ = sum(1 for r_ in perms if r_ <= rho + 1e-12) / len(perms)
        res = "tukee" if rho <= -0.9 + 1e-9 else "kumoaa" if rho >= 0 else "ei-ratkea"
        return res, {"rho": round(rho, 2), "p": round(p_, 3), "n": len(E5),
                     "rows": [{"event": t, "exposurePct": round((math.exp(e) - 1) * 100, 1), "wearPct": round((math.exp(w) - 1) * 100, 1)} for t, e, w in zip(E5, expo, wear)]}
    infl = [math.log(cpi[t + 3] / cpi[t]) for t in E5]
    wg = [math.log(wage[t + 3] / wage[t]) for t in E5]
    rc1, dc1 = rank_test(infl)
    rc2, dc2 = rank_test(wg)
    rowtxt = lambda dd: ", ".join(f"{r_['event']} {r_['exposurePct']:.0f} %" for r_ in dd["rows"])
    c1 = {"id": "inflaatio", "design": "annos", "result": rc1, "date": str(date.today()),
          "summary": f"Hintojen nousu kolmessa vuodessa devalvaatiosta ({rowtxt(dc1)}) vs. viennin osuuden kuluminen: rho = {dc1['rho']:.2f} (tarkka p = {dc1['p']:.3f}, n = 5)",
          "detail": dc1}
    c2 = {"id": "palkat", "design": "annos", "result": rc2, "date": str(date.today()),
          "summary": f"Palkkojen nousu kolmessa vuodessa devalvaatiosta ({rowtxt(dc2)}) vs. viennin osuuden kuluminen: rho = {dc2['rho']:.2f} (tarkka p = {dc2['p']:.3f}, n = 5)",
          "detail": dc2}
    # H24d (rekisteri 27.11.2026): reaalinen efektiivinen valuuttakurssi (Global Macro Database 2026_09).
    reer = gmd_series("FIN", "REER")
    ru = lambda xv, yv: rank_test_xy(xv, yv)
    def rank_test_xy(xv, yv):
        rho = spearman(xv, yv)
        perms = [spearman(xv, [yv[i] for i in pp]) for pp in itertools.permutations(range(len(yv)))]
        p_ = sum(1 for r_ in perms if r_ <= rho + 1e-12) / len(perms)
        return ("tukee" if rho <= -0.9 + 1e-9 else "kumoaa" if rho >= 0 else "ei-ratkea"), round(rho, 2), round(p_, 3)
    rw = [math.log(reer[t + 5] / reer[t + 2]) for t in E5]
    rc = [math.log(reer[t + 5] / reer[t - 1]) for t in E5]
    ri = [math.log(reer[t + 1] / reer[t - 1]) for t in E5]
    five = [lsh[t + 5] - lsh[t] for t in E5]
    rd1, rho1, p1 = ru(rw, wear)
    rd2, rho2, p2 = ru(rc, five)
    lc = lead_corr(prewhiten(changes({y: v for y, v in reer.items() if 1950 <= y <= 2020}, True)),
                   prewhiten(changes({y: v for y, v in share.items() if 1950 <= y <= 2020}, True)), lags=(1, 2))
    rd3 = "tukee" if lc["r"] < 0 and lc["p"] < 0.05 else "kumoaa" if lc["r"] >= 0 else "ei-ratkea"
    pc = lambda v: round((math.exp(v) - 1) * 100, 1)
    rows_d = [{"event": t, "impact": pc(a_), "after": pc(b_), "total": pc(c_), "wear": pc(w_), "five": pc(f_)} for t, a_, b_, c_, w_, f_ in zip(E5, ri, rw, rc, wear, five)]
    txt = lambda key: ", ".join(f"{r_['event']} {r_[key]:+.0f} %" for r_ in rows_d)
    d1 = {"id": "kuluminen", "design": "annos", "result": rd1, "date": str(date.today()),
          "summary": f"Reaalisen kurssin vahvistuminen t0+2 → t0+5 ({txt('after')}) vs. viennin osuuden kuluminen: rho = {rho1:.2f} (tarkka p = {p1:.3f}, n = 5)",
          "detail": {"rho": rho1, "p": p1, "rows": rows_d, "reer": sorted((y, round(v, 1)) for y, v in reer.items() if 1950 <= y <= 2020)}}
    d2 = {"id": "kokonais", "design": "annos", "result": rd2, "date": str(date.today()),
          "summary": f"Jäljelle jäänyt reaalinen heikkeneminen t0−1 → t0+5 ({txt('total')}) vs. viennin osuuden muutos t0 → t0+5: rho = {rho2:.2f} (tarkka p = {p2:.3f}, n = 5)",
          "detail": {"rho": rho2, "p": p2}}
    d3 = {"id": "vuosittain", "design": "ajoitus", "result": rd3, "date": str(date.today()),
          "summary": f"Kaikki vuodet 1951–2020: reaalisen kurssin muutos → viennin osuuden muutos r = {r2(lc['r'])} (viive {lc['lag']} v, p = {lc['p']:.3f}, n = {lc['n']})",
          "detail": lc}
    return {"tests": [t1, t2, t3], "predictions": [], "kesto": {"tests": [b1, b2], "predictions": []},
            "kierre": {"tests": [c1, c2], "predictions": []}, "reaali": {"tests": [d1, d2, d3], "predictions": [], "impact": {str(t): pc(v) for t, v in zip(E5, ri)}}}


def h11():
    """H11 (docs/naytto-rekisteri.md): ulkomaan kansalaisten osuus → Suomen kansalaisten työllisyys ja työttömyys."""
    regions = ["MK01", "MK02", "MK04", "MK05", "MK06", "MK07", "MK08", "MK09", "MK10", "MK11", "MK12", "MK13", "MK14", "MK15", "MK16", "MK17", "MK18", "MK19"]
    ids, d = px("tyokay/115f.px", [("alue_28_20250101", regions + ["SSS"]), ("paaasial_toimin_3_20180101", ["SSS", "11", "12"]),
                                  ("kansalaisuus_26_20170101", ["SSS", "246"]), ("sukupuoli_9_20180101", ["SSS"]), ("ikaryhma_10_20180101", ["18-64"]),
                                  ("timeperiod_y", "*")])
    ir, it, ik, iy = (ids.index(x) for x in ("alue_28_20250101", "paaasial_toimin_3_20180101", "kansalaisuus_26_20170101", "timeperiod_y"))
    T = {(k[ir], k[it], k[ik], int(k[iy])): v for k, v in d.items()}
    yrs = sorted({k[3] for k in T})
    share = {r: {y: 100 * (1 - T[(r, "SSS", "246", y)] / T[(r, "SSS", "SSS", y)]) for y in yrs} for r in regions + ["SSS"]}
    emp = {r: {y: 100 * T[(r, "11", "246", y)] / T[(r, "SSS", "246", y)] for y in yrs} for r in regions + ["SSS"]}
    une = {r: {y: 100 * T[(r, "12", "246", y)] / (T[(r, "11", "246", y)] + T[(r, "12", "246", y)]) for y in yrs} for r in regions + ["SSS"]}
    years = [y for y in yrs if y - 1 in yrs]
    b1, n = fe_panel(emp, share, regions, years)
    p1 = perm_p(emp, share, regions, years, b1, -1, 6)
    b2, _ = fe_panel(une, share, regions, years)
    p2 = perm_p(une, share, regions, years, b2, 1, 7)
    r1 = "tukee" if b1 < 0 and p1 < 0.05 else "kumoaa" if b1 >= 0 else "ei-ratkea"
    r2_ = "tukee" if b2 > 0 and p2 < 0.05 else "kumoaa" if b2 <= 0 else "ei-ratkea"
    # Tarkistukset (kirjattu päätestien jälkeen, ennen tarkistusten laskentaa)
    lead_years = [y for y in years if y + 2 in yrs]
    bl, _ = fe_panel(emp, share, regions, lead_years, lag=-2)
    pl = perm_p(emp, share, regions, lead_years, bl, -1 if bl < 0 else 1, 8, R=1000, lag=-2)
    r1_fail = bl * b1 > 0 and pl < 0.05 and abs(bl) >= 0.5 * abs(b1)
    bt, _ = fe_panel(emp, share, regions, years, trends=True)
    pt = perm_p(emp, share, regions, years, bt, -1, 9, R=1000, trends=True)
    r2_fail = not (bt < 0 and pt < 0.05)
    excl = [y for y in years if y not in (2015, 2016, 2017, 2022, 2023, 2024)]
    bx, _ = fe_panel(emp, share, regions, excl)
    px_ = perm_p(emp, share, regions, excl, bx, -1, 10, R=1000)
    checks = {"lead": {"b": round(bl, 4), "p": round(pl, 6), "fails": bool(r1_fail)},
              "trends": {"b": round(bt, 4), "p": round(pt, 6), "fails": bool(r2_fail)},
              "excluded": {"b": round(bx, 4), "p": round(px_, 6), "years": excl}}
    downgraded = r1_fail or r2_fail
    if downgraded:
        if r1 == "tukee":
            r1 = "ei-ratkea"
        if r2_fail is False and r1_fail and r2_ == "tukee":
            r2_ = "ei-ratkea"
        if r1_fail and r2_ == "tukee":
            r2_ = "ei-ratkea"
    t1 = {"id": "annos", "design": "annos", "result": r1, "date": str(date.today()),
          "summary": (f"1 %-yks. suurempi ulkomaan kansalaisten osuuden kasvu kuin muualla → Suomen kansalaisten työllisyysaste {b1:+.2f} %-yks. seuraavana vuonna (p = {p1:.3f}, 18 maakuntaa, {years[0]}–{years[-1]})"
                      + (f". Tarkistukset: osuus kaksi vuotta myöhemmin ennustaa yhtä vahvasti ({bl:+.2f}), ja aluekohtaisten trendien jälkeen kerroin on {bt:+.2f} (p = {pt:.2f})" if downgraded else "")),
          "detail": {"b": round(b1, 4), "p": round(p1, 6), "n": n, "years": [years[0], years[-1]], "checks": checks, "downgraded": downgraded}}
    t2 = {"id": "tyottomyys", "design": "tasmallisyys", "result": r2_, "date": str(date.today()),
          "summary": f"Sama asetelma, Suomen kansalaisten työttömyysaste: {b2:+.2f} %-yks. (p = {p2:.3f})" + (". Merkitty ei ratkea saman ennakkotestin perusteella" if downgraded and r1_fail else ""),
          "detail": {"b": round(b2, 4), "p": round(p2, 4)}}
    span = {r: (round(share[r][yrs[0]], 1), round(share[r][yrs[-1]], 1)) for r in regions + ["SSS"]}
    return {"tests": [t1, t2], "predictions": [], "describe": {"shareSpan": span,
            "national": {"share": sorted((y, round(v, 2)) for y, v in share["SSS"].items()), "emp": sorted((y, round(v, 2)) for y, v in emp["SSS"].items())}}}


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
    Ylog = {r: {t: math.log(v) for t, v in tfr[r].items()} for r in regions}
    chk, result = panel_checks(Ylog, une, regions, years, b, 2, -1, result, 11)
    pctf = lambda v: f"{(math.exp(v) - 1) * 100:+.2f} %"
    return {"result": result, "b": round(b, 5), "pctPerPoint": round(pct, 2), "p": round(p, 4), "n": n,
            "regions": len(regions), "years": [years[0], years[-1]], "checks": chk,
            "summary": f"1 %-yks. suurempi työttömyysnousu kuin muualla → syntyvyys {pct:+.2f} % kahden vuoden päästä (p = {p:.3f}, {len(regions)} maakuntaa)." + checks_text(chk, pctf)}


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
    out = {"built": str(date.today()), "hypotheses": {"h1": h1(turso_nordic(), fi_tfr), "h1e": h1e(fi_tfr), "h1f": h1f(fi_tfr), "h1g": h1g(fi_tfr), "h2": h2(), "h3": h3(), "h4": h4(), "h5": h5(), "h6": h6(), "h7": h7()}}
    out["hypotheses"]["h8"], out["hypotheses"]["h9"] = h8_h9()
    out["hypotheses"]["h10"] = h10()
    out["hypotheses"]["h11"] = h11()
    out["hypotheses"]["h12"] = h12()
    out["hypotheses"]["h13"] = h13()
    out["hypotheses"]["h14"] = h14()
    out["hypotheses"]["h15"] = h15()
    out["hypotheses"]["h16"] = h16()
    out["hypotheses"]["h17"] = h17()
    out["hypotheses"]["h18"] = h18()
    out["hypotheses"]["h19"] = h19()
    out["hypotheses"]["h20"] = h20()
    out["hypotheses"]["h21"] = h21()
    out["hypotheses"]["h22"] = h22()
    out["hypotheses"]["h23"] = h23()
    out["hypotheses"]["h24"] = h24()
    out["hypotheses"]["h24b"] = out["hypotheses"]["h24"].pop("kesto")
    out["hypotheses"]["h24c"] = out["hypotheses"]["h24"].pop("kierre")
    out["hypotheses"]["h24d"] = out["hypotheses"]["h24"].pop("reaali")
    out["hypotheses"]["h24e"] = h24e()
    out["hypotheses"]["h24f"] = h24f()
    out["hypotheses"]["h25"], out["hypotheses"]["h25b"] = h25()
    out["hypotheses"]["h25c"], out["hypotheses"]["h25d"] = h25cd()
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
                if q.get("actual") is None and q["year"] in fi_tfr and "tfr" in q["id"]:
                    q["actual"] = fi_tfr[q["year"]]
                # Lukittu väli pysyy; vain toteutunut arvo otetaan uudesta laskennasta.
                if q.get("actual") is None and p.get("actual") is not None:
                    q["actual"] = p["actual"]
                kept.append(q)
            kept += [q for pid, q in prev.items() if pid not in {p["id"] for p in h["predictions"]}]
            h["predictions"] = kept
    # Suomalainen lukuasu teksteihin: desimaalipilkku ja miinusmerkki.
    fi = lambda t: re.sub(r"(?<![\w])-(?=\d)", "−", re.sub(r"(?<=\d)\.(?=\d)", ",", t))
    for h in out["hypotheses"].values():
        for t in h["tests"] + [h[k] for k in ("expectations", "temporary", "firstborn", "firstbornCohorts") if k in h]:
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
    fb = out["hypotheses"]["h1"]["firstborn"]
    print("esikoiset", fb["result"], fb["summary"], "tarkistus", fb["detail"]["check"]); print("  maittain", fb["detail"]["countries"])
    fc = out["hypotheses"]["h1"]["firstbornCohorts"]
    print("esikoisika", fc["result"], fc["summary"]); print("  by40", {k: fc["detail"]["by40"][k] for k in ("r", "p", "n", "per5")})
    print("  rows", [(r["born"], r["exposure"], round(r["outcome"], 3)) for r in fc["detail"]["rows"]])
    print("  rows40", [(r["born"], round(r["outcome"], 3)) for r in fc["detail"]["by40"]["rows"]])
    e6 = out["hypotheses"]["h6"]
    for t in e6["tests"]: print("h6", t["id"], t["result"], "|", t["summary"])
    d4 = e6["tests"][3]["detail"]; print("  ilman 2004", d4["without2004"], "myynti", d4["sales"]); print("  reaalihinta", d4["realPrice"])
    d5 = e6["tests"][4]["detail"]; print("  hinta", d5["priceChange"]); print("  kuolleisuus t+1", d5["nextMortChange"])
    print("  extra", e6["extra"])
    for t in out["hypotheses"]["h7"]["tests"]: print("h7", t["id"], t["result"], "|", t["summary"])
    for t in out["hypotheses"]["h11"]["tests"]: print("h11", t["id"], t["result"], "|", t["summary"])
    print("  tarkistukset", out["hypotheses"]["h11"]["tests"][0]["detail"]["checks"])
    for t in out["hypotheses"]["h10"]["tests"]: print("h10", t["id"], t["result"], "|", t["summary"])
    x10 = out["hypotheses"]["h10"]["extra"]; print("  extra", {k: (v if k != "students18" else {kk: vv for kk, vv in v.items() if kk != "series"}) for k, v in x10.items()})
    print("  sarja18", [x for x in out["hypotheses"]["h10"]["tests"][0]["detail"]["series"] if x[0] >= 2008])
    print("  sarja21", [x for x in out["hypotheses"]["h10"]["tests"][1]["detail"]["series"] if x[0] >= 2008])
    for hk in ("h8", "h9"):
        for t in out["hypotheses"][hk]["tests"]:
            print(hk, t["id"], t["result"], "|", t["summary"]); print("   ", t["detail"].get("countries", ""))
    d7 = out["hypotheses"]["h7"]["tests"][1]["detail"]; print("  miehet", d7["men"], "naiset", d7["women"]); print("  sarja", [x for x in d7["series"] if x[0] <= 2005])
    for t in out["hypotheses"]["h18"]["tests"]: print("h18", t["id"], t["result"], "|", t["summary"])
    for t in out["hypotheses"]["h17"]["tests"]: print("h17", t["id"], t["result"], "|", t["summary"])
    for t in out["hypotheses"]["h16"]["tests"]: print("h16", t["id"], t["result"], "|", t["summary"]); print("   ", [x for x in t["detail"]["series"] if x[0] <= 1940])
    for t in out["hypotheses"]["h15"]["tests"]: print("h15", t["id"], t["result"], "|", t["summary"]); print("   ", {k: v for k, v in t["detail"].items() if k != "diff"})
    for t in out["hypotheses"]["h14"]["tests"]: print("h14", t["id"], t["result"], "|", t["summary"])
    print("  h14 extra", out["hypotheses"]["h14"]["extra"], [x for x in out["hypotheses"]["h14"]["tests"][0]["detail"]["series"] if 1980 <= x[0] <= 1996])
    for t in out["hypotheses"]["h13"]["tests"]: print("h13", t["id"], t["result"], "|", t["summary"])
    for t in out["hypotheses"]["h12"]["tests"]: print("h12", t["id"], t["result"], "|", t["summary"]); print("   ", t["detail"].get("countries", ""))
    for hk, tid in (("h1", "annos"), ("h1e", "annos"), ("h1g", "annos"), ("h7", "annos")):
        t = next(x for x in out["hypotheses"][hk]["tests"] if x["id"] == tid)
        print("TARKISTUS", hk, t["result"], "|", t["detail"].get("checks"))
    print("malli", out["hypotheses"]["h1"]["model"])
    print("toisto maittain", json.dumps(out["hypotheses"]["h1"]["tests"][0]["detail"]["countries"]))
    print("miehet maittain", json.dumps(out["hypotheses"]["h1"]["tests"][2]["detail"]["menCountries"]))


if __name__ == "__main__":
    main()
