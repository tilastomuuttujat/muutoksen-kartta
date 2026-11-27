"""Seula (docs/seula.md): kaikki sarjaparit X → Y, löytö ja erillinen vahvistus, sattuman kalibrointi.

Aikajako: src/data/scanner.json (löytö ≤ 2000, vahvistus 2001–2025).
Maajako: Turson vienti SKANNAUS_DIR/values.ndjson ja series.json (löytö Suomi, vahvistus SE+NO+DK).
Tulos: src/data/seula.json. Ajo: SKANNAUS_DIR=scan-data/ python3 scripts/seula/build.py
"""
import importlib.util, json, math, os
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
OUT = os.path.join(ROOT, "src", "data", "seula.json")
D = os.environ.get("SKANNAUS_DIR", "scan-data/")
CUT = 2000
MECH, Q, ALPHA, MIN_DISC, MIN_CONF, REPS = 0.8, 0.1, 0.05, 15, 12, 50
NORDIC = ["FI", "SE", "NO", "DK"]

_spec = importlib.util.spec_from_file_location("bs", os.path.join(ROOT, "scripts", "skannauskoe", "build-scanner.py"))
_bs = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_bs)
lane_of = _bs.lane_of


# ——— esikäsittely ———

def change_matrix(series_list, years):
    """series_list: [(dict vuosi → arvo)]. Palauttaa (T × N) vuosimuutokset, NaN puuttuville."""
    idx = {y: i for i, y in enumerate(years)}
    M = np.full((len(years), len(series_list)), np.nan)
    for j, s in enumerate(series_list):
        pos = all(v > 0 for v in s.values())
        for y, v in s.items():
            if y - 1 in s and y in idx:
                M[idx[y], j] = (math.log(v) - math.log(s[y - 1])) if pos else v - s[y - 1]
    return M


def prewhiten_cols(M):
    """Rajaus 5–95 % ja AR(1)-suodatus sarakkeittain (vain tämän osan vuosilta)."""
    out = np.full_like(M, np.nan)
    for j in range(M.shape[1]):
        c = M[:, j]
        ok = ~np.isnan(c)
        if ok.sum() < 10:
            continue
        lo, hi = np.quantile(c[ok], [0.05, 0.95])
        w = np.clip(c, lo, hi)
        m = np.nanmean(w)
        prev = np.roll(w, 1); prev[0] = np.nan
        both = ~np.isnan(w) & ~np.isnan(prev)
        den = np.nansum((w - m) ** 2)
        phi = np.sum((w[both] - m) * (prev[both] - m)) / den if den else 0
        r = w - m - phi * (prev - m)
        out[:, j] = r
    return out


def lagcorr(P, k):
    """r[i, j] = korrelaatio P[t−k, i] ja P[t, j] (parittain täydet havainnot), sekä n."""
    if k == 0:
        A, B = P, P
    else:
        A, B = P[:-k], P[k:]
    Ma, Mb = (~np.isnan(A)).astype(float), (~np.isnan(B)).astype(float)
    A0, B0 = np.nan_to_num(A), np.nan_to_num(B)
    n = Ma.T @ Mb
    Sx, Sy = A0.T @ Mb, Ma.T @ B0
    Sxx, Syy = (A0 ** 2).T @ Mb, Ma.T @ (B0 ** 2)
    Sxy = A0.T @ B0
    with np.errstate(invalid="ignore", divide="ignore"):
        vx, vy = Sxx - Sx ** 2 / n, Syy - Sy ** 2 / n
        r = (Sxy - Sx * Sy / n) / np.sqrt(vx * vy)
    r[(n < 3) | ~np.isfinite(r)] = np.nan
    return r, n


def p2(r, n):
    z = np.arctanh(np.clip(np.abs(r), 0, 0.999999)) * np.sqrt(np.maximum(n - 3, 1))
    from math import erfc
    return np.vectorize(lambda x: erfc(x / math.sqrt(2)))(z)


def p1(r, n):  # yksisuuntainen, oikeaan suuntaan (r > 0 testataan erikseen etumerkillä)
    return p2(r, n) / 2


def bh(p):
    flat = p[~np.isnan(p)]
    order = np.argsort(flat); m = len(flat)
    q = np.empty(m); prev = 1.0
    for rank in range(m - 1, -1, -1):
        i = order[rank]
        prev = min(prev, flat[i] * m / (rank + 1)); q[i] = prev
    out = np.full(p.shape, np.nan); out[~np.isnan(p)] = q
    return out


# ——— seula ———

def sieve(Pd, Pc, detail=False):
    """Pd: löytöosan suodatetut muutokset (T × N), Pc: vahvistusosan. Palauttaa portaiden luvut ja jyvät."""
    N = Pd.shape[1]
    r0, _ = lagcorr(Pd, 0)
    rd = {}; nd = {}
    for k in (1, 2):
        rd[k], nd[k] = lagcorr(Pd, k)
    pick = np.where(np.nan_to_num(np.abs(rd[2]), nan=-1) > np.nan_to_num(np.abs(rd[1]), nan=-1), 2, 1)
    r_best = np.where(pick == 2, rd[2], rd[1]); n_best = np.where(pick == 2, nd[2], nd[1])
    valid = ~np.eye(N, dtype=bool) & ~np.isnan(r_best) & (n_best >= MIN_DISC)
    mech = valid & (np.abs(np.nan_to_num(r0)) > MECH)
    tested = valid & ~mech
    p = np.where(tested, 1 - (1 - p2(np.nan_to_num(r_best), n_best)) ** 2, np.nan)
    q = bh(p)
    disc = tested & (np.nan_to_num(q, nan=1) < Q)
    rc = {}; nc = {}
    for k in (1, 2):
        rc[k], nc[k] = lagcorr(Pc, k)
    r_conf = np.where(pick == 2, rc[2], rc[1]); n_conf = np.where(pick == 2, nc[2], nc[1])
    r_rev = np.where(pick == 2, rc[2].T, rc[1].T)
    same = disc & ~np.isnan(r_conf) & (n_conf >= MIN_CONF) & (np.sign(r_conf) == np.sign(r_best))
    pc = np.where(same, p1(np.nan_to_num(r_conf), n_conf), np.nan)
    conf = same & (np.nan_to_num(pc, nan=1) < ALPHA)
    grain = conf & (np.abs(np.nan_to_num(r_rev)) < np.abs(np.nan_to_num(r_conf)))
    counts = {"pairs": int(valid.sum()), "mechanical": int(mech.sum()), "tested": int(tested.sum()),
              "discovered": int(disc.sum()), "sameSign": int(same.sum()), "confirmed": int(conf.sum()), "grains": int(grain.sum())}
    if not detail:
        return counts
    return counts, dict(r_best=r_best, n_best=n_best, pick=pick, q=q, disc=disc, r_conf=r_conf, n_conf=n_conf,
                        pc=pc, conf=conf, r_rev=r_rev, grain=grain, same=same)


def circular_shuffle(P, rng):
    out = np.full_like(P, np.nan)
    for j in range(P.shape[1]):
        c = P[:, j]; ok = np.where(~np.isnan(c))[0]
        if len(ok) < 2:
            continue
        a, b = ok[0], ok[-1] + 1
        seg = c[a:b]
        out[a:b, j] = np.roll(seg, rng.integers(1, len(seg)))
    return out


def calibrate(Pd, Pc, seed):
    rng = np.random.default_rng(seed)
    g = [sieve(circular_shuffle(Pd, rng), circular_shuffle(Pc, rng))["grains"] for _ in range(REPS)]
    d = [0]  # löydöt lasketaan erikseen samalla sekoituksella
    rng = np.random.default_rng(seed)
    disc = [sieve(circular_shuffle(Pd, rng), circular_shuffle(Pc, rng))["discovered"] for _ in range(REPS)]
    return {"grainsMean": round(float(np.mean(g)), 2), "grains95": float(np.quantile(g, 0.95)), "grainsMax": int(max(g)),
            "discoveredMean": round(float(np.mean(disc)), 1), "discovered95": float(np.quantile(disc, 0.95))}


NOMINAL = ("käyvin hinnoin", "milj. €", "€", "nimellis", "palkkasumma", "palkansaajakorvaukset", "rahamäärä", "menot", "tulot", "sosiaalietuudet", "rahoitus")
ACCOUNTS = ("B1G", "P3", "P5", "P6", "P7", "D1", "D2", "D4", "D5", "D6", "D7", "E1 ", "E2 ", "S1 ", "S13", "S14", "S11", "B9", "B8")


def flags(mx, my):
    """Varoitusmerkinnät (docs/seula.md, lisäys 27.11.2026)."""
    tx, ty = (mx["t"] + " " + mx["u"]).lower(), (my["t"] + " " + my["u"]).lower()
    real = lambda t: any(w in t for w in ("volyymi", "kiintein", "reaali", "viitevuoden"))
    nominal = lambda t: any(w in t for w in NOMINAL) and not real(t)
    gdp = lambda t: "bkt:hen" in t or "/ bkt" in t or "% bkt" in t or "suhteessa bkt" in t or "osuus bruttoarvonlis" in t
    acct = lambda raw: any(raw.startswith(c) or f" {c}" in raw for c in ACCOUNTS) or "bruttoarvonlis" in raw.lower() or "tehdyt työtunnit" in raw.lower()
    out = []
    if nominal(tx) and nominal(ty):
        out.append("nimellinen")
    if gdp(tx) or gdp(ty):
        out.append("bkt-suhde")
    if acct(mx["t"]) and acct(my["t"]):
        out.append("tilinpito")
    if any(w in ty for w in ("kuolleet", "henkeä", "lukumäärä")) and any(w in tx for w in ("hedelmällisyys", "syntyn", "väki", "väestö")):
        out.append("lukumaara")
    return out


def rows_out(meta, det, kind):
    out = []
    N = len(meta)
    for i in range(N):
        for j in range(N):
            if not det["disc"][i, j]:
                continue
            status = "jyva" if det["grain"][i, j] else "vahvistui-suunta" if det["conf"][i, j] else (
                "eri-merkki" if not det["same"][i, j] and not np.isnan(det["r_conf"][i, j]) else
                "ei-vahvistusta" if det["same"][i, j] else "ei-vahvistusaineistoa")
            out.append({"x": meta[i]["k"], "y": meta[j]["k"], "lag": int(det["pick"][i, j]),
                        "rD": round(float(det["r_best"][i, j]), 3), "nD": int(det["n_best"][i, j]), "q": round(float(det["q"][i, j]), 4),
                        "rC": None if np.isnan(det["r_conf"][i, j]) else round(float(det["r_conf"][i, j]), 3),
                        "nC": int(det["n_conf"][i, j]), "pC": None if np.isnan(det["pc"][i, j]) else round(float(det["pc"][i, j]), 4),
                        "rRev": None if np.isnan(det["r_rev"][i, j]) else round(float(det["r_rev"][i, j]), 3),
                        "status": status, "kind": kind, "flags": flags(meta[i], meta[j])})
    return out


# ——— asetelmat ———

def time_split():
    d = json.load(open(os.path.join(ROOT, "src", "data", "scanner.json")))
    meta, data = [], []
    for s in d["series"]:
        if s.get("dup"):
            continue
        vals = {s["y0"] + i: v for i, v in enumerate(s["v"]) if v is not None}
        nb = sum(1 for y in vals if y - 1 in vals and y <= CUT)
        na = sum(1 for y in vals if y - 1 in vals and y > CUT)
        if nb >= 20 and na >= 20:
            meta.append({"k": s["k"], "t": s["t"], "u": s["u"], "lane": s["lane"]}); data.append(vals)
    y0 = min(min(v) for v in data)
    years = list(range(y0, 2026))
    M = change_matrix(data, years)
    yrs = np.array(years)
    Md, Mc = M.copy(), M.copy()
    Md[yrs > CUT] = np.nan; Mc[yrs <= CUT] = np.nan
    Pd = prewhiten_cols(Md)[yrs <= CUT]
    Pc = prewhiten_cols(Mc)[yrs > CUT]
    series = {m["k"]: sorted(v.items()) for m, v in zip(meta, data)}
    return meta, Pd, Pc, series


def country_split():
    smeta = {s["series_key"]: s for s in json.load(open(os.path.join(D, "series.json")))}
    vals = {}
    for line in open(os.path.join(D, "values.ndjson")):
        k, y, g, v, kind = json.loads(line)
        if g in NORDIC and v is not None and kind in ("observed", "estimate"):
            try:
                vals.setdefault(k, {}).setdefault(g, {})[int(y)] = float(v)
            except ValueError:
                pass
    keys = sorted(k for k, gs in vals.items() if all(len(gs.get(c, {})) >= 15 for c in NORDIC))
    meta = [{"k": k, "t": smeta.get(k, {}).get("title", k), "u": smeta.get(k, {}).get("unit", ""),
             "lane": lane_of(smeta.get(k, {}).get("theme"))} for k in keys]
    years = list(range(1950, 2026))
    P = {}
    for c in NORDIC:
        # vain vuosittaiset jaksot: muutos lasketaan vain peräkkäisistä vuosista (change_matrix huolehtii)
        P[c] = prewhiten_cols(change_matrix([vals[k][c] for k in keys], years))
    gap = np.full((3, len(keys)), np.nan)  # erotin, ettei viive ylitä maiden rajaa
    Pc = np.vstack([P["SE"], gap, P["NO"], gap, P["DK"]])
    series = {k: {c: sorted(vals[k][c].items()) for c in NORDIC} for k in keys}
    return meta, P["FI"], Pc, series


def main():
    out = {"rules": {"cut": CUT, "mechanical": MECH, "q": Q, "alpha": ALPHA, "minDiscovery": MIN_DISC,
                     "minConfirmation": MIN_CONF, "reps": REPS}, "designs": {}}
    for name, fn, seed in (("aika", time_split, 11), ("maa", country_split, 12)):
        meta, Pd, Pc, series = fn()
        counts, det = sieve(Pd, Pc, detail=True)
        cal = calibrate(Pd, Pc, seed)
        rows = rows_out(meta, det, name)
        keep = {r["x"] for r in rows if r["status"] == "jyva"} | {r["y"] for r in rows if r["status"] == "jyva"}
        out["designs"][name] = {
            "series": len(meta), "counts": counts, "chance": cal,
            "meta": {m["k"]: {"t": m["t"], "u": m["u"], "lane": m["lane"]} for m in meta},
            "rows": rows,
            "values": {k: v for k, v in series.items() if k in keep},
        }
        print(name, len(meta), "sarjaa", counts, "sattuma", cal)
        for r in sorted(rows, key=lambda r: r["q"]):
            if r["status"] == "jyva":
                m = {x["k"]: x for x in meta}
                print(f"   JYVÄ {','.join(r['flags']) or '-':24s} {m[r['x']]['t'][:50]} → {m[r['y']]['t'][:55]} | viive {r['lag']} rD {r['rD']} q {r['q']} rC {r['rC']} pC {r['pC']} rev {r['rRev']}")
    json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print("kirjoitettu", OUT, os.path.getsize(OUT) // 1024, "kt")


if __name__ == "__main__":
    main()
