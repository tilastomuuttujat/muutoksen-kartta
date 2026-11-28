"""Erkaantumiskartta: Turson 40 pohjoismaisen sarjan ote → $TURSO_EXTRACT (oletus scan-data/erkaantuminen-turso.json).

Lukutunnus annetaan ympäristömuuttujassa TURSO_TOKEN (pilviympäristössä välityspalvelin lisää sen).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "skannauskoe"))
sys.path.insert(0, HERE)
from fetch import t  # noqa: E402
from series import TURSO  # noqa: E402


def main():
    keys = ",".join(f"'{k}'" for k in TURSO)
    (c, r), = t.q(f"SELECT series_key, title, unit, theme FROM public__indicator_series WHERE series_key IN ({keys})")
    out = {k: {"title": ti, "unit": u, "theme": th, "values": []} for k, ti, u, th in r}
    (c, r), = t.q(f"SELECT series_key, year, group_key, value FROM public__indicator_values WHERE series_key IN ({keys}) AND group_key IN ('FI','SE','NO','DK') AND value IS NOT NULL")
    for k, y, g, v in r:
        out[k]["values"].append([int(str(y)[:4]), g, float(v)])
    path = os.environ.get("TURSO_EXTRACT", "scan-data/erkaantuminen-turso.json")
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    json.dump(out, open(path, "w"), ensure_ascii=False)
    print("sarjoja", len(out), "arvoja", sum(len(s["values"]) for s in out.values()))


if __name__ == "__main__":
    main()
