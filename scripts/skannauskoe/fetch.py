import json, os, sys
import urllib.request
# Turson HTTP-rajapinta. Lukutunnus annetaan ympäristömuuttujassa TURSO_TOKEN (pilviympäristössä välityspalvelin lisää sen).
URL = "https://murrosmatriisi-tilastomuuttujat.aws-eu-north-1.turso.io/v2/pipeline"
class t:
    @staticmethod
    def q(*sqls):
        body = {"requests": [{"type": "execute", "stmt": {"sql": s}} for s in sqls] + [{"type": "close"}]}
        req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "Authorization": "Bearer " + os.environ.get("TURSO_TOKEN", "proxy-injected")})
        d = json.load(urllib.request.urlopen(req, timeout=120))
        out = []
        for r in d["results"][:-1]:
            res = r["response"]["result"]
            out.append(([c["name"] for c in res["cols"]], [[c.get("value") for c in row] for row in res["rows"]]))
        return out
def main():
    OUT = os.environ.get("SKANNAUS_DIR", "scan-data/"); os.makedirs(OUT, exist_ok=True)
    (c, r), = t.q("SELECT series_key,title,unit,geography,frequency,theme,pressure_domain,data_class,status,published FROM public__indicator_series")
    json.dump([dict(zip(c, x)) for x in r], open(OUT + "series.json", "w"), ensure_ascii=False)
    (c, r), = t.q("SELECT v.variable_id, v.series_key, v.relation_type, a.code, a.name FROM public__atlas_variable_indicators v LEFT JOIN public__atlas_variables a ON a.id=v.variable_id")
    json.dump([dict(zip(c, x)) for x in r], open(OUT + "varmap.json", "w"), ensure_ascii=False)
    print("sarjat", len(json.load(open(OUT + "series.json"))))
    rows, last = 0, 0
    with open(OUT + "values.ndjson", "w") as f:
        while True:
            (c, r), = t.q(f"SELECT rowid, series_key, year, group_key, value, value_kind FROM public__indicator_values WHERE rowid > {last} AND value IS NOT NULL ORDER BY rowid LIMIT 40000")
            if not r: break
            for x in r:
                f.write(json.dumps(x[1:], ensure_ascii=False) + "\n")
            last = int(r[-1][0]); rows += len(r)
            print(rows, file=sys.stderr)
    print("arvot", rows)


if __name__ == "__main__":
    main()
