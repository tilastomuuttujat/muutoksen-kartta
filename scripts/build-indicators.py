"""Hakee poikkeamanäkymän indikaattorit Supabasesta tiedostoon src/data/indicators.json.

Käyttää projektin julkista (publishable) avainta, joten salaisia avaimia ei tarvita:
    python3 scripts/build-indicators.py

Mukaan otetaan vain koko maata koskevat, julkaistut arvot. Viitealueet lasketaan selaimessa
(src/lib/anomaly.ts), jotta menetelmä on testattavissa ja näkyy lukijalle.
"""
import json, sys, urllib.request, urllib.parse
from datetime import datetime, timezone

URL = "https://zzbubbrsgiqsvsovkkmf.supabase.co/rest/v1"
KEY = "sb_publishable_YNqxZI4Oj-DSjVBoTKhQ2Q_4DchUIBb"

# Indeksit (V-Dem, asteikko 0–1) arvioidaan tasona: niiden vuosimuutos on lähes aina nolla.
# key, elämänalue (LANES), lyhyt nimi, muunnos, viitealueen tyyppi
#  muunnos: "level" = arvo sellaisenaan, "pct" = vuosimuutos %, "diff" = vuosimuutos yksikköinä, "per100k" = väkilukuun suhteutettu taso
#  viite: "history" = sarjan oma historia (5–95 %), "corridor" = projektin pohjoismainen käytävä, "norm:<ala>:<ylä>" = sovittu raja
SERIES = [
    ("fi.statfin15ai.total.b1gmh.b60cef008d", "talous", "BKT asukasta kohti", "pct", "history"),
    ("fi.statfin15ai.total.p61k.eb971a1c0a", "talous", "Tavaroiden vienti", "pct", "history"),
    ("fi.statfin15ai.total.p51k.eb971a1c0a", "talous", "Investoinnit", "pct", "history"),
    ("fi.historical20261026.statfin11xy.cpi1914", "talous", "Inflaatio (elinkustannukset)", "pct", "history"),
    ("fi.historical20261026.jst.credit_gdp", "talous", "Yksityiset luotot / BKT", "diff", "history"),
    ("fi.atlas1960.general_government_balance_gdp", "talous", "Julkisen talouden alijäämä / BKT", "level", "norm:-3:"),
    ("indicator_import.valtionvelka_bktsta", "talous", "Julkinen velka / BKT", "level", "norm::60"),
    ("owid.finland.historical-gov-spending-gdp.v20261026", "talous", "Julkiset menot / BKT", "diff", "history"),
    ("gapminder.finland.co2_pcap_terr.v20261026", "talous", "CO₂-päästöt asukasta kohti", "pct", "history"),
    ("fi.histlabour.lfs2019.unemployment_rate", "tyo", "Työttömyysaste", "level", "history"),
    ("fi.histlabour.lfs2019.employment_rate", "tyo", "Työllisyysaste 15–64", "level", "history"),
    ("indicator_import.nuorisotyottomyys_1524", "tyo", "Nuorisotyöttömyys 15–24", "level", "history"),
    ("safe_corridor.unemployment_rate_25_29", "tyo", "Työttömyys 25–29-vuotiailla", "level", "corridor"),
    ("safe_corridor.arope_25_29", "tyo", "Köyhyys- tai syrjäytymisriski 25–29", "level", "corridor"),
    ("fi.historical20261026.jst.real_wage_index", "tyo", "Reaalipalkat", "pct", "history"),
    ("fi.turning.index1975.household_disposable_real_per_capita", "tyo", "Kotitalouksien reaalitulo / asukas", "pct", "history"),
    ("fi.distribution.gini2020.disposable", "tyo", "Tuloerot (Gini)", "diff", "history", "FI_REGISTER"),  # vain rekisteripohjainen jakso; aiemmat otokset eivät ole vertailukelpoisia
    ("safe_corridor.housing_cost_overburden_25_29", "tyo", "Asumiskustannusten ylirasite 25–29", "level", "corridor"),
    ("gapminder.finland.children_per_woman_total_fertility.v20261026", "hoiva", "Hedelmällisyysluku", "diff", "history"),
    ("gapminder.finland.child_mortality_0_5_year_olds_dying_per_1000_born.v20261026", "hoiva", "Alle 5-vuotiaiden kuolleisuus", "pct", "history"),
    ("owid.finland.electoral-democracy.v20261026", "valta", "Vaalidemokratia", "level", "history"),
    ("owid.finland.freedom-of-expression.v20261026", "valta", "Sananvapaus", "level", "history"),
    ("owid.finland.freedom-of-association.v20261026", "yhteiso", "Yhdistymisvapaus", "level", "history"),
    ("crime.hcs.fi.police_manslaughter", "yhteiso", "Poliisin tietoon tulleet tapot / 100 000", "per100k", "history"),
    ("crime.hcs.fi.prison_all_dec31", "yhteiso", "Vangit / 100 000", "per100k", "history"),
]
POPULATION = "fi.statfin15ai.total.ep.fe4e7bf6af"  # keskiväkiluku, tuhatta henkeä
CRISIS = "fi.historical20261026.jst.crisisJST"  # JST: systeemisen pankkikriisin vuodet (0/1)


def get(path, params):
    req = urllib.request.Request(f"{URL}/{path}?{urllib.parse.urlencode(params)}", headers={"apikey": KEY})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def values(key, group=None):
    rows = get("indicator_values", {"select": "year,value,group_key,value_kind,is_published", "series_key": f"eq.{key}",
                                    "is_published": "eq.true", "order": "year", "limit": "5000"})
    groups = {r["group_key"] for r in rows}
    group = group or ("FI" if "FI" in groups else (sorted(groups)[0] if len(groups) == 1 else None))
    if group is None:
        sys.exit(f"{key}: useita ryhmiä {sorted(groups)}, valitse yksi")
    by_year = {}
    for r in rows:
        if r["group_key"] == group and r["value"] is not None and r["value_kind"] in ("observed", "estimate", "observed_official", None):
            by_year[r["year"]] = r["value"]
    return sorted(by_year.items())


def meta(key):
    m = get("indicator_series", {"select": "series_key,title,unit,source,source_url,interpretation,status", "series_key": f"eq.{key}"})
    return m[0] if m else {}


corridors = {r["series_key"]: r for r in get("simulation_normalization_params", {"select": "*"})}
pop = dict(values(POPULATION))
out = []
for key, lane, name, transform, ref, *group in SERIES:
    v = values(key, group[0] if group else None)
    m = meta(key)
    if transform == "per100k":
        v = [(y, x / (pop[y] * 1000) * 100000) for y, x in v if pop.get(y)]
        transform = "level"
        m["unit"] = "/ 100 000 asukasta"
    item = {"key": key, "lane": lane, "name": name, "title": m.get("title", name), "unit": m.get("unit") or "",
            "source": m.get("source") or "", "source_url": m.get("source_url") or "", "interpretation": m.get("interpretation") or "",
            "transform": transform, "reference": {"kind": "history"}, "values": v}
    if ref == "corridor":
        c = corridors[key]
        item["reference"] = {"kind": "corridor", "low": c["lower_anchor"], "high": c["upper_anchor"],
                             "favorable": c["favorable_direction"], "method": c["normalization_method"]}
    elif ref.startswith("norm:"):
        _, lo, hi = ref.split(":")
        item["reference"] = {"kind": "norm", "low": float(lo) if lo else None, "high": float(hi) if hi else None,
                             "label": "EU:n raja-arvo (vakaus- ja kasvusopimus)"}
    print(f"{name:45s} {len(v):4d} arvoa {v[0][0] if v else '-'}–{v[-1][0] if v else '-'}")
    out.append(item)

crisis = [y for y, x in values(CRISIS) if x == 1]
data = {"meta": {"generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "source": "Supabase indicator_series / indicator_values",
                 "crisis_source": "Jordà–Schularick–Taylor Macrohistory Database (R6): systeemisen pankkikriisin vuodet"},
        "indicators": out, "crisis_years": crisis}
json.dump(data, open("src/data/indicators.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("kriisivuodet", crisis)
