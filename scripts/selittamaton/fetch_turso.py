"""Selittämätön, kolmas erä (docs/selittamaton.md): Turson sarjojen ote → $TURSO_EXTRACT (oletus scan-data/selittamaton-turso.json).

Lukutunnus annetaan ympäristömuuttujassa TURSO_TOKEN (pilviympäristössä välityspalvelin lisää sen).
Vain sarjojen nimet ja arvot tallennetaan; tunnusta ei kirjoiteta mihinkään.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skannauskoe"))
from fetch import t  # noqa: E402

INDICATORS = ["fi.eusilc.unmet08.wlist", "fi.eusilc.unmet09.wlist", "nordics.antidepressants_2000_2023",
              "youth.mh_rehab_total_0_24", "youth.psychotherapy_18_24", "youth.psychiatric_wait_u23",
              "fi.histlabour.lfs2019.unemployment_rate"]
FINANCE = ["foodaid_hist_tvy_history_food_kg_13", "foodaid_hist_church_share", "foodaid_hist_church_parishes",
           "foodaid_hist_tvy_history_distributors"]


def main():
    out = {"indicators": {}, "finance": {}}
    keys = ",".join(f"'{k}'" for k in INDICATORS)
    (c, r), = t.q(f"SELECT series_key, title, unit, source FROM public__indicator_series WHERE series_key IN ({keys})")
    meta = {x[0]: {"title": x[1], "unit": x[2], "source": x[3]} for x in r}
    (c, r), = t.q(f"SELECT series_key, year, group_key, value, value_kind FROM public__indicator_values WHERE series_key IN ({keys}) AND value IS NOT NULL")
    for k, y, g, v, kind in r:
        out["indicators"].setdefault(k, {"meta": meta.get(k, {}), "values": []})["values"].append([int(y), g, float(v), kind])
    keys = ",".join(f"'{k}'" for k in FINANCE)
    (c, r), = t.q(f"SELECT series_key, title, unit FROM public__public_finance_series WHERE series_key IN ({keys})")
    meta = {x[0]: {"title": x[1], "unit": x[2]} for x in r}
    (c, r), = t.q(f"SELECT series_key, year, value, value_kind FROM public__public_finance_observations WHERE series_key IN ({keys}) AND value IS NOT NULL")
    for k, y, v, kind in r:
        out["finance"].setdefault(k, {"meta": meta.get(k, {}), "values": []})["values"].append([int(str(y)[:4]), float(v), kind])
    path = os.environ.get("TURSO_EXTRACT", "scan-data/selittamaton-turso.json")
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    json.dump(out, open(path, "w"), ensure_ascii=False)
    for part in ("indicators", "finance"):
        for k, s in out[part].items():
            print(part, k, len(s["values"]))


if __name__ == "__main__":
    main()
