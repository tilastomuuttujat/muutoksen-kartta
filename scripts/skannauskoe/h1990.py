import importlib.util, json, collections
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from fetch import t  # Turson HTTP-kysely (fetch.py)
(c, r), = t.q("""SELECT a.name_fi, a.area_code, substr(o.period_start,1,4), o.dims, o.value FROM research__observation o
 JOIN research__indicator_definition d ON d.indicator_definition_id=o.indicator_definition_id
 JOIN research__indicator i ON i.indicator_id=d.indicator_id JOIN research__area a ON a.area_id=o.area_id
 WHERE i.indicator_key='h1990_altp904_employed' AND o.retracted_at IS NULL""")
os.makedirs(os.environ.get("SKANNAUS_DIR", "scan-data/"), exist_ok=True)
rows = [(x[0], x[1], int(x[2]), json.loads(x[3])["industry"], float(x[4])) for x in r]
json.dump(rows, open(os.path.join(os.environ.get("SKANNAUS_DIR", "scan-data/"), "h1990_altp904.json"), "w"), ensure_ascii=False)
print(len(rows), "riviä")
print("toimialakoodit", sorted({x[3] for x in rows}))
print("alueet", sorted({x[0] for x in rows}))
