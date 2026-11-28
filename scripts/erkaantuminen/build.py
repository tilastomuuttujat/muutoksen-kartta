"""Erkaantumiskartta (docs/erkaantuminen.md) → src/data/erkaantuminen.json.

Aja: TURSO_EXTRACT=... GMD_DTA=... python3 scripts/erkaantuminen/build.py
(Turso-ote: scripts/erkaantuminen/fetch_turso.py; GMD ladataan tarvittaessa /tmp:hen.)
"""
import json
import math
import os
import sys
import time
import urllib.request
from datetime import date

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from series import EUROSTAT, GMD, TURSO  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "src", "data", "erkaantuminen.json")
C4 = ["FI", "SE", "NO", "DK"]
ISO3 = {"FIN": "FI", "SWE": "SE", "NOR": "NO", "DNK": "DK"}
Y0, Y1 = 1980, 2025
GMD_URL = "https://gmd-releases.s3.ap-southeast-2.amazonaws.com/data/distribute/GMD_2026_09.dta"
# Turson teema → elämänalue (sama jako kuin G- ja E-sarjoissa; vain nimien yhtenäistys)
THEME = {"Työ, tuotanto ja työnjako": "Työ", "Koulutus": "Koulutus", "Asuminen": "Asuminen ja velka",
         "Huolenpito ja terveydenhuolto": "Terveys", "Raha, rahoitus, verotus ja julkinen talous": "Julkinen talous",
         "Väestörakenne, ikääntyminen ja sukupolvien välinen vastuu": "Väestö ja perhe", "sosiaalinen_riski": "Toimeentulo",
         "sosiaalinen": "Toimeentulo"}


def eurostat(dataset, params):
    geos = "&".join(f"geo={g}" for g in C4)
    url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?{params}&{geos}&format=JSON&lang=en"
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


def load():
    S = []
    import pandas as pd
    path = os.environ.get("GMD_DTA", os.path.join("/tmp", "GMD_2026_09.dta"))
    if not os.path.exists(path):
        urllib.request.urlretrieve(GMD_URL, path)
    d = pd.read_stata(path, columns=["ISO3", "year"] + [g[1] for g in GMD])
    d = d[d["ISO3"].isin(ISO3) & d["year"].between(Y0, 2024)]
    for sid, var, lg, pol, dom, name in GMD:
        vals = {ISO3[iso]: {int(y): float(v) for y, v in zip(g["year"], g[var]) if pd.notna(v)} for iso, g in d.groupby("ISO3")}
        S.append({"id": sid, "name": name, "domain": dom, "log": lg, "polarity": pol, "source": f"Global Macro Database: {var}", "values": vals})
    for sid, ds, params, lg, pol, dom, name in EUROSTAT:
        S.append({"id": sid, "name": name, "domain": dom, "log": lg, "polarity": pol, "source": f"Eurostat {ds}: {params}", "values": eurostat(ds, params)})
    T = json.load(open(os.environ.get("TURSO_EXTRACT", "scan-data/erkaantuminen-turso.json")))
    for k in TURSO:
        s = T[k]
        vals = {}
        for y, g, v in s["values"]:
            vals.setdefault(g, {})[y] = v
        S.append({"id": k, "name": s["title"], "domain": THEME.get(s["theme"], s["theme"] or "Muu"), "log": False, "polarity": TURSO[k],
                  "source": f"Turso: {k}", "values": vals})
    return S


def dedupe(S):
    kept, dropped = [], []
    def ch(s):
        fi = s["values"].get("FI", {})
        return {y: fi[y] - fi[y - 1] for y in fi if y - 1 in fi}
    for s in S:
        a = ch(s)
        dup = None
        for k in kept:
            b = ch(k)
            ys = sorted(set(a) & set(b))
            if len(ys) >= 8:
                x, y = np.array([a[q] for q in ys]), np.array([b[q] for q in ys])
                if x.std() > 0 and y.std() > 0 and abs(float(np.corrcoef(x, y)[0, 1])) > 0.97:
                    dup = k["id"]; break
        if dup:
            dropped.append({"id": s["id"], "name": s["name"], "duplicateOf": dup})
        else:
            kept.append(s)
    return kept, dropped


def gap(s, c):
    tr = (lambda v: math.log(v)) if s["log"] else (lambda v: v)
    V = s["values"]
    if c not in V:
        return None
    out = {}
    for y, v in V[c].items():
        if not (Y0 <= y <= Y1):
            continue
        others = [V[o][y] for o in C4 if o != c and o in V and y in V[o]]
        if len(others) < 2 or (s["log"] and (v <= 0 or min(others) <= 0)):
            continue
        out[y] = tr(v) - float(np.mean([tr(o) for o in others]))
    if len(out) < 15:
        return None
    return out


def hinge_scan(t, Y, taus):
    """Y: (n,) tai (n, m). Palauttaa (SSE_lin, SSE_hinge per tau)."""
    n = len(t)
    X0 = np.column_stack([np.ones(n), t])
    P0 = X0 @ np.linalg.pinv(X0)
    R0 = Y - P0 @ Y
    sse0 = (R0 ** 2).sum(axis=0)
    sses = []
    for tau in taus:
        X = np.column_stack([np.ones(n), t, np.maximum(0, t - tau)])
        P = X @ np.linalg.pinv(X)
        R = Y - P @ Y
        sses.append((R ** 2).sum(axis=0))
    return sse0, np.array(sses)


def analyse(g, rng):
    ys = sorted(g)
    t = np.array(ys, dtype=float)
    y = np.array([g[q] for q in ys])
    n = len(t)
    taus = [q for q in ys if ys[0] + 4 <= q <= ys[-1] - 3]
    if not taus:
        return None
    sse0, sses = hinge_scan(t, y, taus)
    i = int(np.argmin(sses)); tau = taus[i]
    F = float((sse0 - sses[i]) / (sses[i] / (n - 3))) if sses[i] > 0 else float("inf")
    # nollamalli: suora + AR(1)-jäännös
    X0 = np.column_stack([np.ones(n), t])
    b0 = np.linalg.lstsq(X0, y, rcond=None)[0]
    e = y - X0 @ b0
    rho = float(np.clip(np.corrcoef(e[:-1], e[1:])[0, 1] if e.std() > 0 else 0.0, 0, 0.95))
    sig = float(np.std(e[1:] - rho * e[:-1], ddof=1)) if n > 3 else float(e.std())
    eps = rng.normal(0, sig, size=(n, 999))
    sim = np.empty((n, 999)); sim[0] = eps[0] / math.sqrt(max(1e-9, 1 - rho ** 2))
    for k in range(1, n):
        sim[k] = rho * sim[k - 1] + eps[k]
    sim += (X0 @ b0)[:, None]
    s0, ss = hinge_scan(t, sim, taus)
    Fs = ((s0[None, :] - ss) / (ss / (n - 3))).max(axis=0)
    p = float((1 + np.sum(Fs >= F)) / 1000)
    X = np.column_stack([np.ones(n), t, np.maximum(0, t - tau)])
    b = np.linalg.lstsq(X, y, rcond=None)[0]
    fit = X @ b
    post = float(b[1] + b[2])
    ft, fe = float(b[0] + b[1] * tau), float(fit[-1])
    diverging = (np.sign(post) == np.sign(fe)) and abs(fe) > abs(ft)
    return {"tau": int(tau), "F": round(F, 2), "p": round(p, 3), "break": p < 0.05, "diverging": bool(p < 0.05 and diverging),
            "pre": round(float(b[1]), 5), "post": round(post, 5), "gapAtTau": round(ft, 4), "gapEnd": round(fe, 4),
            "first": ys[0], "last": ys[-1], "tauRange": [taus[0], taus[-1]],
            "gap": [[q, round(v, 4)] for q, v in zip(ys, y)], "fit": [[q, round(float(v), 4)] for q, v in zip(ys, fit)]}


def who_moved(s, c, tau):
    """Kuvaileva: kulmakertoimen muutos vuonna tau maan c omassa sarjassa ja muiden keskiarvossa."""
    tr = (lambda v: math.log(v)) if s["log"] else (lambda v: v)
    V = s["values"]
    def d_of(series):
        ys = sorted(q for q in series if Y0 <= q <= Y1)
        if len(ys) < 8:
            return None
        t = np.array(ys, float); y = np.array([series[q] for q in ys])
        X = np.column_stack([np.ones(len(t)), t, np.maximum(0, t - tau)])
        return float(np.linalg.lstsq(X, y, rcond=None)[0][2])
    own = {y: tr(v) for y, v in V[c].items() if (not s["log"] or v > 0)}
    oth = {}
    for y in own:
        o = [tr(V[x][y]) for x in C4 if x != c and x in V and y in V[x] and (not s["log"] or V[x][y] > 0)]
        if len(o) >= 2:
            oth[y] = float(np.mean(o))
    a, b = d_of(own), d_of(oth)
    if a is None or b is None:
        return None
    return {"own": round(a, 5), "others": round(b, 5), "mover": "Suomi" if c == "FI" and abs(a) > abs(b) else ("muut" if c == "FI" else None)}


def cluster(results, rng, sims=10000):
    """K = suurin erkaantumisten määrä 5 vuoden ikkunassa; nollamalli arpoo tau:n kunkin sarjan sallitulta väliltä."""
    taus = [r["tau"] for r in results]
    ranges = [r["tauRange"] for r in results]
    def K(ts):
        return max((sum(1 for q in ts if y <= q <= y + 4), y) for y in range(Y0, 2022))
    k, y = K(taus) if taus else (0, None)
    if not taus:
        return {"n": 0, "K": 0, "window": None, "p": None}
    lo = np.array([a for a, b in ranges]); hi = np.array([b for a, b in ranges])
    draws = lo[None, :] + np.floor(rng.random((sims, len(taus))) * (hi - lo + 1)[None, :]).astype(int)
    Ks = np.zeros(sims, int)
    for y0 in range(Y0, 2022):
        Ks = np.maximum(Ks, ((draws >= y0) & (draws <= y0 + 4)).sum(axis=1))
    p = float(np.mean(Ks >= k))
    return {"n": len(taus), "K": int(k), "window": [int(y), int(y) + 4], "p": round(p, 4), "nullMean": round(float(Ks.mean()), 2),
            "null95": int(np.percentile(Ks, 95))}


def main():
    S = load()
    S, dropped = dedupe(S)
    rng = np.random.default_rng(1)
    series = []
    for s in S:
        row = {k: s[k] for k in ("id", "name", "domain", "log", "polarity", "source")}
        row["countries"] = {}
        for c in C4:
            g = gap(s, c)
            row["countries"][c] = None if g is None else analyse(g, rng)
        fi = row["countries"]["FI"]
        if fi and fi["diverging"]:
            sgn = np.sign(fi["post"]) * s["polarity"]
            fi["direction"] = "huonompaan" if sgn < 0 else "parempaan" if sgn > 0 else "neutraali"
            fi["moved"] = who_moved(s, "FI", fi["tau"])
        row["levels"] = {c: sorted((y, round(v, 4)) for y, v in s["values"].get(c, {}).items() if Y0 <= y <= Y1) for c in C4}
        series.append(row)
    crng = np.random.default_rng(1)
    clusters = {}
    for c in C4:
        div = [r["countries"][c] for r in series if r["countries"][c] and r["countries"][c]["diverging"]]
        clusters[c] = cluster(div, crng)
    worse = [r["countries"]["FI"] for r in series if r["countries"]["FI"] and r["countries"]["FI"]["diverging"] and r["countries"]["FI"].get("direction") == "huonompaan"]
    clusters["FI_worse"] = cluster(worse, crng)
    analysed = {c: sum(1 for r in series if r["countries"][c]) for c in C4}
    out = {"built": str(date.today()), "analysed": analysed, "dropped": dropped, "series": series, "clusters": clusters}
    json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print("sarjoja", len(series), "pudotettu kaksoiskappaleina", len(dropped), "analysoitu", analysed)
    for c, v in clusters.items():
        print(c, v)
    fi = sorted([(r["countries"]["FI"]["tau"], r["domain"], r["name"], r["countries"]["FI"].get("direction"), r["countries"]["FI"]["p"])
                 for r in series if r["countries"]["FI"] and r["countries"]["FI"]["diverging"]])
    for x in fi:
        print("  ", x)


if __name__ == "__main__":
    main()
