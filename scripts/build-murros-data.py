"""Kokoaa kartan aineiston yhdeksi JSON-tiedostoksi.
Supabase: painekartta_nodes + painekartta_edges (REST, service key).
Neon: päätelmät + tilastosarjat, valmiiksi haettu JSON-tiedosto (argv[1]).
Kytkentä päätelmä -> ilmiö tehdään tekstivastaavuudella (merkitty match='teksti')."""
import json, os, re, sys, requests
from datetime import datetime, timezone

url, key = os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": key, "Authorization": f"Bearer {key}"}
def sb(table, cols):
    r = requests.get(f"{url}/rest/v1/{table}?select={cols}&limit=5000", headers=H, timeout=60); r.raise_for_status(); return r.json()

nodes = sb("painekartta_nodes", "item_id,item_title,year_start,year_end,item_type,domains,problem,mechanism,long_effect,importance,role,pressure,structural_in,structural_out")
edges = sb("painekartta_edges", "from_item_id,to_item_id,relation_type,rel_class,confidence,rationale,pressure_signal,weight")

raw = open(sys.argv[1]).read()
neon = json.loads(raw[raw.index("{"):])["rows"][0]["data"]
series = {s["key"]: s for s in neon["series"] if s.get("values")}
concl = neon["conclusions"] or []

STOP = set("ja tai sekä on oli ovat kuin myös ei se että joka jotka mutta nyt the of uusi laki lain".split())
def words(t): return {w for w in re.findall(r"[a-zåäö]{5,}", (t or "").lower()) if w not in STOP}
def stem(w): return w[:6]
cwords = {c["id"]: {stem(w) for w in words(c["title"] + " " + c["claim"])} for c in concl}

out_nodes = []
for n in nodes:
    tw = {stem(w) for w in words(n["item_title"])}
    links = []
    for c in concl:
        hit = tw & cwords[c["id"]]
        if len(hit) >= 2 or (len(tw) == 1 and hit):
            links.append(c["id"])
    out_nodes.append({
        "id": n["item_id"], "title": n["item_title"], "year": n["year_start"], "year_end": n["year_end"],
        "type": n["item_type"], "domains": n["domains"], "importance": n["importance"], "role": n["role"],
        "problem": n["problem"], "mechanism": n["mechanism"], "long_effect": n["long_effect"],
        "conclusion_ids": links[:3],
    })

used = {k for c in concl for k in (c.get("series") or [])}
data = {
    "meta": {"generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
             "sources": {"supabase": ["painekartta_nodes", "painekartta_edges"],
                         "neon": ["atlas_editing.conclusions", "atlas_reasoning.conclusion_series", "atlas_evidence.observations"]},
             "note": "Päätelmien kytkentä ilmiöihin on tekstivastaavuuteen perustuva ehdotus, ei tarkistettu. Tilastoarvot ovat vuosikeskiarvoja ryhmien yli."},
    "nodes": out_nodes,
    "edges": [{"from": e["from_item_id"], "to": e["to_item_id"], "type": e["relation_type"], "class": e["rel_class"],
               "confidence": e["confidence"], "rationale": e["rationale"], "pressure": e["pressure_signal"], "weight": float(e["weight"])} for e in edges],
    "conclusions": [{"id": c["id"], "title": c["title"], "claim": c["claim"], "kind": c["kind"], "status": c["status"],
                     "limitations": c["limitations"], "series": [k for k in (c.get("series") or []) if k in series]} for c in concl],
    "series": [{"key": k, "title": s["title"], "unit": s["unit"], "source": s["source"], "values": s["values"]} for k, s in series.items() if k in used],
}
for path in ("src/data/murros-data.json", "public/data/murros-data.json"):
    json.dump(data, open(path, "w"), ensure_ascii=False, separators=(",", ":"))
linked = sum(1 for n in out_nodes if n["conclusion_ids"])
print(len(out_nodes), "nodes", len(data["edges"]), "edges", len(data["conclusions"]), "concl", len(data["series"]), "series", linked, "nodes linked")
