#!/usr/bin/env python3
"""Pohjoismaiden kokonaishedelmällisyysluvut selitysnäkymää varten (Eurostat demo_find).

Kirjoittaa src/data/nordic-tfr.json. Ajo: python3 scripts/build-nordic-tfr.py
"""
import json, urllib.request
from datetime import datetime, timezone

GEOS = {"FI": "Suomi", "SE": "Ruotsi", "NO": "Norja", "DK": "Tanska", "IS": "Islanti"}
URL = ("https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_find?"
       + "&".join(f"geo={g}" for g in GEOS) + "&indic_de=TOTFERRT&format=JSON&lang=en")

with urllib.request.urlopen(URL, timeout=120) as r:
    d = json.load(r)
ids, size = d["id"], d["size"]
dims = [sorted(d["dimension"][i]["category"]["index"], key=lambda k: d["dimension"][i]["category"]["index"][k]) for i in ids]
series = {g: {} for g in GEOS}
for pos, value in d["value"].items():
    p, idx = int(pos), []
    for s in reversed(size):
        idx.append(p % s)
        p //= s
    idx.reverse()
    k = {ids[j]: dims[j][idx[j]] for j in range(len(ids))}
    year = int(k["time"])
    if year >= 2000:
        series[k["geo"]][year] = value
out = {"meta": {"generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "source": "Eurostat, demo_find (kokonaishedelmällisyysluku)",
                "source_url": "https://ec.europa.eu/eurostat/databrowser/view/demo_find/default/table"},
       "countries": [{"geo": g, "name": n, "values": sorted(series[g].items())} for g, n in GEOS.items()]}
json.dump(out, open("src/data/nordic-tfr.json", "w"), ensure_ascii=False, separators=(",", ":"))
for c in out["countries"]:
    v = dict(c["values"])
    print(f"{c['name']:8s} 2010 {v.get(2010)} → {max(v)} {v[max(v)]}")
