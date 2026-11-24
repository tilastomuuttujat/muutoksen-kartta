#!/usr/bin/env python3
"""Elämänkaarinäkymän aineisto: missä elämänvaiheessa kukin ikävuosi on kunakin vuonna.

Hakee Tilastokeskuksen avoimesta rajapinnasta (StatFin PxWeb):
  - 12c6: väestö perheaseman, iän (1-v.) ja sukupuolen mukaan 1992– (koko maa, 31.12.)
  - 115c: väestö pääasiallisen toiminnan, iän (1-v.) ja sukupuolen mukaan 1987– (työssäkäyntitilasto)
ja kirjoittaa osuudet tiedostoon src/data/lifecourse.json. Ajo: python3 scripts/build-lifecourse.py
"""
import json, time, urllib.error, urllib.request
from datetime import datetime, timezone

API = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/"
PAGE = "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__{db}/statfin_{db}_pxt_{table}.px/"
AGES = list(range(15, 46))
SEXES = {"SSS": "kaikki", "2": "naiset", "1": "miehet"}


def statfin(table, query):
    body = json.dumps({"query": query, "response": {"format": "json-stat2"}}).encode()
    req = urllib.request.Request(API + table, data=body, headers={"Content-Type": "application/json"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                js = json.load(r)
            break
        except (urllib.error.URLError, ConnectionError):
            if attempt == 4:
                raise
            time.sleep(10 * (attempt + 1))
    dims = js["id"]
    cats = [list(js["dimension"][d]["category"]["index"]) for d in dims]
    sizes = [len(c) for c in cats]
    for i, value in enumerate(js["value"]):
        idx, rest = [], i
        for s in reversed(sizes):
            idx.append(rest % s)
            rest //= s
        idx.reverse()
        yield {**{d: cats[k][idx[k]] for k, d in enumerate(dims)}, "value": value}


pick = lambda code, values: {"code": code, "selection": {"filter": "item", "values": values}}
every = lambda code: {"code": code, "selection": {"filter": "all", "values": ["*"]}}
age_codes = [f"{a:03d}" for a in AGES]

# Perheasema: kotona asuva lapsi, yksin asuva, parisuhteessa ilman lapsia, lapsiperheen vanhempi.
FAMILY = {
    "kotona": ("Asuu vanhempien luona", ["6"]),
    "yksin": ("Asuu yksin", ["7"]),
    "pari": ("Parisuhteessa, ei lapsia", ["1", "3"]),
    "vanhempi": ("Lapsiperheen vanhempana", ["2", "4", "5"]),
}
fam = statfin("perh/12c6.px", [pick("alue_23_20260101", ["SSS"]), pick("sukupuoli_9_20180101", list(SEXES)),
                               pick("ikaryhma_10_20180101", age_codes), every("timeperiod_y"),
                               pick("peasutyyp_3_20190101", ["SSS", "1", "2", "3", "4", "5", "6", "7"])])
F = {}
for r in fam:
    F[(r["sukupuoli_9_20180101"], int(r["timeperiod_y"]), int(r["ikaryhma_10_20180101"]), r["peasutyyp_3_20190101"])] = r["value"] or 0

# Pääasiallinen toiminta: työllinen, opiskelija, työtön.
WORK = {
    "tyossa": ("Työssä", ["11"]),
    "opiskelee": ("Opiskelee", ["22"]),
    "tyoton": ("Työtön", ["12"]),
}
work = statfin("tyokay/115c.px", [pick("sukupuoli_9_20180101", list(SEXES)), pick("ikaryhma_10_20180101", age_codes),
                                  every("timeperiod_y"), pick("paaasial_toimin_3_20180101", ["SSS", "11", "12", "22"])])
T = {}
for r in work:
    T[(r["sukupuoli_9_20180101"], int(r["timeperiod_y"]), int(r["ikaryhma_10_20180101"]), r["paaasial_toimin_3_20180101"])] = r["value"] or 0


def build(store, spec, total="SSS"):
    years = sorted({k[1] for k in store})
    out = {}
    for key, (label, codes) in spec.items():
        by_sex = {}
        for sex in SEXES:
            grid = []
            for y in years:
                row = []
                for a in AGES:
                    tot = store.get((sex, y, a, total), 0)
                    row.append(round(sum(store.get((sex, y, a, c), 0) for c in codes) / tot * 100, 1) if tot else None)
                grid.append(row)
            by_sex[SEXES[sex]] = grid
        out[key] = {"label": label, "years": years, "shares": by_sex}
    return out


states = {}
for key, v in build(F, FAMILY).items():
    states[key] = {**v, "group": "asuminen", "source": "Tilastokeskus, StatFin 12c6 (väestö perheaseman mukaan, 31.12.)",
                   "source_url": PAGE.format(db="perh", table="12c6")}
for key, v in build(T, WORK).items():
    states[key] = {**v, "group": "toiminta", "source": "Tilastokeskus, StatFin 115c (työssäkäyntitilasto, pääasiallinen toiminta vuoden lopussa)",
                   "source_url": PAGE.format(db="tyokay", table="115c")}

for key, s in states.items():
    g = s["shares"]["kaikki"]
    print(f"{s['label']:28s} {s['years'][0]}–{s['years'][-1]}  25-v: {g[0][10]} → {g[-1][10]} %")

json.dump({"meta": {"generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "ages": AGES,
                    "note": "Osuus ikävuoden väestöstä vuoden lopussa. Perheasema ja pääasiallinen toiminta ovat eri tilastoista; osuudet eivät summaudu 100:aan."},
           "states": states},
          open("src/data/lifecourse.json", "w"), ensure_ascii=False, separators=(",", ":"))
