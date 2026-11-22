"""Hakee poikkeamanäkymän indikaattorit Supabasesta ja Tilastokeskuksen StatFin-rajapinnasta tiedostoon src/data/indicators.json.

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

# ---- Tilastokeskus (StatFin PxWeb): yksin asuminen ----
# Näitä sarjoja ei ole Supabasessa, joten ne haetaan suoraan Tilastokeskuksen avoimesta rajapinnasta.
STATFIN = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/"
STATFIN_PAGE = "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__{db}/statfin_{db}_pxt_{table}.px/"


def statfin(table, query):
    body = json.dumps({"query": query, "response": {"format": "json-stat2"}}).encode()
    req = urllib.request.Request(STATFIN + table, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        js = json.load(r)
    dims = js["id"]
    cats = [list(js["dimension"][d]["category"]["index"]) for d in dims]
    rows, sizes = [], [len(c) for c in cats]
    for i, value in enumerate(js["value"]):
        idx, rest = [], i
        for s in reversed(sizes):
            idx.append(rest % s)
            rest //= s
        idx.reverse()
        rows.append({**{d: cats[k][idx[k]] for k, d in enumerate(dims)}, "value": value})
    return rows


def pick(code, values):
    return {"code": code, "selection": {"filter": "item", "values": values}}


def every(code):
    return {"code": code, "selection": {"filter": "all", "values": ["*"]}}


def statfin_item(key, name, title, table, db, values, interpretation, lane="hoiva"):
    v = [(y, round(x, 3)) for y, x in sorted(values.items())]
    print(f"{name:45s} {len(v):4d} arvoa {v[0][0]}–{v[-1][0]} (Tilastokeskus)")
    return {"key": key, "lane": lane, "name": name, "title": title, "unit": "prosenttiyksikköä",
            "source": f"Tilastokeskus, StatFin {table}", "source_url": STATFIN_PAGE.format(db=db, table=table),
            "interpretation": interpretation, "transform": "diff", "reference": {"kind": "history"}, "values": v}


# Yhden hengen asuntokuntien osuus kaikista asuntokunnista (15fi).
hh = statfin("asku/15fi.px", [pick("alue_23_20260101", ["SSS"]), pick("talotyyppi_4_20210101", ["SSS"]),
                              pick("sukupuoli_15_20190101", ["SSS"]), pick("ikaryhma_27_20220101", ["SSS"]),
                              every("timeperiod_y"), every("asuntokuntakoko_3_20190101")])
H = {(r["timeperiod_y"], r["asuntokuntakoko_3_20190101"]): r["value"] for r in hh}
share = {int(y): H[(y, "1")] / H[(y, "SSS")] * 100 for (y, s) in H if s == "SSS" and H[(y, "SSS")]}
out.append(statfin_item("statfin.asku.15fi.one_person_share", "Yhden hengen asuntokuntien osuus",
                        "Yhden hengen asuntokuntien osuus kaikista asuntokunnista, %", "15fi", "asku", share,
                        "Osuus asuntokunnista, ei ihmisistä: noin puolet asuntokunnista on yhden hengen, mutta yksin asuu noin neljännes väestöstä. Suuri osa yksin asuvista on ikääntyneitä."))

# Yksin asuvien ja lapsiperheissä elävien osuus ikäryhmästä (12c6).
fam = statfin("perh/12c6.px", [pick("alue_23_20260101", ["SSS"]), pick("sukupuoli_9_20180101", ["SSS"]),
                               every("timeperiod_y"), every("peasutyyp_3_20190101"), every("ikaryhma_10_20180101")])
F = {}
for r in fam:
    if r["ikaryhma_10_20180101"] != "SSS" and r["value"] is not None:
        k = (int(r["timeperiod_y"]), r["peasutyyp_3_20190101"], int(r["ikaryhma_10_20180101"]))
        F[k] = F.get(k, 0) + r["value"]
years = sorted({k[0] for k in F})


def age_share(status, a0, a1):
    return {y: sum(F.get((y, s, a), 0) for s in status for a in range(a0, a1 + 1)) /
               sum(F.get((y, "SSS", a), 0) for a in range(a0, a1 + 1)) * 100 for y in years}


ALONE = "Perheväestöön kuulumaton, asuu yksin (Tilastokeskuksen perheasema). Ei sama kuin yksinäisyys tai parisuhteettomuus: osa yksin asuvista on etäsuhteessa."
for a0, a1 in [(20, 24), (25, 29), (30, 34)]:
    out.append(statfin_item(f"statfin.perh.12c6.alone_{a0}_{a1}", f"Yksin asuvat {a0}–{a1}-vuotiaat",
                            f"Yksin asuvien osuus {a0}–{a1}-vuotiaista, %", "12c6", "perh", age_share(["7"], a0, a1), ALONE))
out.append(statfin_item("statfin.perh.12c6.couple_children_30_34", "Lapsiperheen vanhempana 30–34-vuotiaat",
                        "Puolisona perheessä, jossa on lapsia: osuus 30–34-vuotiaista, %", "12c6", "perh", age_share(["2", "4"], 30, 34),
                        "Avio- tai avopuoliso perheessä, jossa asuu lapsia. Ei sisällä yksinhuoltajia eikä vanhempia, joiden lapset asuvat muualla."))

# ---- Tilastokeskus: syntyvyys järjestysluvun mukaan, esikoisen saaneiden ikä, avioliiton ulkopuolella syntyneet ----
def statfin_birth_item(key, name, title, table, unit, values, interpretation):
    item = statfin_item(key, name, title, table, "synt", values, interpretation)
    item["unit"] = unit
    return item


# Naiset ikävuosittain 31.12. (12c6); keskiväkiluku ≈ edellisen ja kuluvan vuoden lopun keskiarvo.
women = statfin("perh/12c6.px", [pick("alue_23_20260101", ["SSS"]), pick("sukupuoli_9_20180101", ["2"]),
                                 pick("peasutyyp_3_20190101", ["SSS"]), every("timeperiod_y"), every("ikaryhma_10_20180101")])
WOMEN = {(int(r["timeperiod_y"]), int(r["ikaryhma_10_20180101"])): r["value"] for r in women
         if r["ikaryhma_10_20180101"] != "SSS" and r["value"] is not None}
AGES = range(15, 50)
births = statfin("synt/12dm.px", [every("Vuosi"), pick("Äidin ikä", [f"{a:03d}" for a in AGES]), pick("Sukupuoli", ["SSS"]),
                                  every("Lapsen järjestysluku")])
BIRTHS = {(int(r["Vuosi"]), int(r["Äidin ikä"]), r["Lapsen järjestysluku"]): r["value"] or 0 for r in births}
ORDERS = {"1": ["1"], "2": ["2"], "3+": ["3", "4", "5", "6", "7", "8", "9-"], "SSS": ["SSS"]}


def order_tfr(y, order):
    total = 0.0
    for a in AGES:
        w = (WOMEN.get((y - 1, a), 0) + WOMEN.get((y, a), 0)) / 2
        total += sum(BIRTHS.get((y, a, o), 0) for o in ORDERS[order]) / w if w else 0
    return total


tfr_years = [y for y in sorted({k[0] for k in BIRTHS}) if (y - 1, 20) in WOMEN and (y, 20) in WOMEN]
official = {int(r["timeperiod_y"]): r["value"] for r in statfin("synt/12dt.px", [pick("timeperiod_y", [str(y) for y in tfr_years]), every("contentscode")])}
for y in tfr_years:  # laskentatapa toistaa virallisen luvun; muuten jokin syöte on muuttunut
    if abs(order_tfr(y, "SSS") - official[y]) > 0.03:
        sys.exit(f"Järjestyslukujen kokonaishedelmällisyys {y}: {order_tfr(y, 'SSS'):.3f} ≠ virallinen {official[y]}")
ORDER_NOTE = ("Laskettu: tämän järjestysluvun elävänä syntyneet äidin iän mukaan (12dm) jaettuna saman ikäisten naisten keskiväkiluvulla (12c6), "
              "summattuna ikiin 15–49. Kolmen järjestysluvun summa vastaa virallista kokonaishedelmällisyyslukua (12dt). ")
for order, label in (("1", "esikoiset"), ("2", "toiset lapset"), ("3+", "kolmannet ja myöhemmät")):
    out.append(statfin_birth_item(f"statfin.synt.tfr_order_{order.replace('+', 'plus')}", f"Hedelmällisyys: {label}",
                                  f"Kokonaishedelmällisyys järjestysluvun mukaan: {label}", "12dm", "lasta / nainen",
                                  {y: order_tfr(y, order) for y in tfr_years},
                                  ORDER_NOTE + "Vuosiluku, ei ikäluokan lopullinen lapsiluku."))

age = statfin("synt/14lg.px", [every("timeperiod_y"), pick("contentscode", ["aidin_ika_1_kerta_ka"])])
out.append(statfin_birth_item("statfin.synt.mother_age_first", "Esikoisen saaneiden äitien keski-ikä",
                              "Ensimmäistä kertaa biologiseksi äidiksi tulleiden keski-ikä", "14lg", "vuotta",
                              {int(r["timeperiod_y"]): r["value"] for r in age if r["value"] is not None},
                              "Koskee vain lapsen saaneita: lapsettomiksi jäävät eivät näy luvussa."))

outside = statfin("synt/12dk.px", [every("timeperiod_y"), pick("contentscode", ["aitieiavio_p"])])
out.append(statfin_birth_item("statfin.synt.outside_marriage_share", "Avioliiton ulkopuolella syntyneet",
                              "Avioliiton ulkopuolella syntyneiden osuus elävänä syntyneistä, %", "12dk", "prosenttiyksikköä",
                              {int(r["timeperiod_y"]): r["value"] for r in outside if r["value"] is not None and int(r["timeperiod_y"]) >= 1970},
                              "Valtaosa avioliiton ulkopuolella syntyneistä syntyy avoliittoon, ei yksinhuoltajalle."))

# ---- Tilastokeskus: työn epävarmuus, nuorten opiskelu ja koulutusrakenne ----
# Määräaikaisten osuus palkansaajista (12bt). Taulukossa ei ole ikäjakoa: luvut koskevat 15–74-vuotiaita.
temp = statfin("tyti/12bt.px", [every("timeperiod_y"), pick("sukupuoli_9_20180101", ["SSS", "2"]),
                                 pick("tyonantajasekt_4_20250101", ["*"]), pick("contentscode", ["Ma_tyo_pros"])])
for sex, label in (("SSS", "palkansaajat"), ("2", "naispalkansaajat")):
    out.append(statfin_item(f"statfin.tyti.temporary_share_{'all' if sex == 'SSS' else 'women'}", f"Määräaikaiset: {label}",
                            f"Määräaikaisessa työsuhteessa olevien osuus, {label} 15–74-v., %", "12bt", "tyti",
                            {int(r["timeperiod_y"]): r["value"] for r in temp if r["sukupuoli_9_20180101"] == sex and r["value"] is not None},
                            "Työvoimatutkimus (otos). Ei ikäjakoa: nuorten aikuisten määräaikaisuus on yleistä selvästi korkeampi.", lane="tyo"))

# 25–29-vuotiaiden opiskelu ja NEET (13am).
young = statfin("tyti/13am.px", [every("timeperiod_y"), pick("sukupuoli_9_20180101", ["SSS"]), pick("ikaryhma_19_20190101", ["25-29"]),
                                  pick("contentscode", ["tyti-Vaesto", "Tyolliset_opisk_laaja", "Eityolliset_opisk_laaja", "neet_aste"])])
Y = {(int(r["timeperiod_y"]), r["contentscode"]): r["value"] for r in young if r["value"] is not None}
yy = sorted({k[0] for k in Y})
out.append(statfin_item("statfin.tyti.studying_25_29", "Opiskelevat 25–29-vuotiaat",
                        "Tutkintoon johtavassa tai kurssikoulutuksessa olevien osuus 25–29-vuotiaista, %", "13am", "tyti",
                        {y: (Y[(y, "Tyolliset_opisk_laaja")] + Y[(y, "Eityolliset_opisk_laaja")]) / Y[(y, "tyti-Vaesto")] * 100
                         for y in yy if (y, "tyti-Vaesto") in Y and (y, "Tyolliset_opisk_laaja") in Y and (y, "Eityolliset_opisk_laaja") in Y},
                        "Työvoimatutkimus (otos). Sisältää työn ohessa opiskelevat ja kurssikoulutuksen.", lane="tyo"))
out.append(statfin_item("statfin.tyti.neet_25_29", "NEET 25–29-vuotiaat",
                        "Ei työssä, koulutuksessa eikä varusmiespalveluksessa: osuus 25–29-vuotiaista, %", "13am", "tyti",
                        {y: Y[(y, "neet_aste")] for y in yy if (y, "neet_aste") in Y},
                        "Työvoimatutkimus (otos). Sisältää myös perhevapaalla kotona olevat, jotka eivät ole työsuhteessa.", lane="tyo"))

# Korkea-asteen tutkinto 30–34-vuotiailla sukupuolen mukaan (12bq).
edu = statfin("vkour/12bq.px", [every("timeperiod_y"), pick("alue_23_20260101", ["SSS"]), pick("ikaryhma_10_20180101", ["30-34"]),
                                 pick("sukupuoli_9_20180101", ["1", "2"]), pick("koulutusaste_17_20180101", ["SSS", "5", "6", "7", "8"])])
E = {}
for r in edu:
    if r["value"] is not None:
        k = (int(r["timeperiod_y"]), r["sukupuoli_9_20180101"])
        E.setdefault(k, {})[r["koulutusaste_17_20180101"]] = r["value"]
tertiary = {k: sum(v.get(c, 0) for c in ("5", "6", "7", "8")) / v["SSS"] * 100 for k, v in E.items() if v.get("SSS")}
eyears = sorted({k[0] for k in tertiary})
EDU_NOTE = "Korkea-aste = alin korkea-aste, alempi ja ylempi korkeakouluaste sekä tutkijakoulutus. Koko väestö 31.12. (rekisteri)."
for sex, label in (("2", "naiset"), ("1", "miehet")):
    out.append(statfin_item(f"statfin.vkour.tertiary_30_34_{'women' if sex == '2' else 'men'}", f"Korkea-asteen tutkinto: {label} 30–34",
                            f"Korkea-asteen tutkinnon suorittaneiden osuus 30–34-vuotiaista, {label}, %", "12bq", "vkour",
                            {y: tertiary[(y, sex)] for y in eyears if (y, sex) in tertiary}, EDU_NOTE))
out.append(statfin_item("statfin.vkour.tertiary_gap_30_34", "Koulutusero: naiset – miehet 30–34",
                        "Korkea-asteen tutkinnon suorittaneiden osuus 30–34-vuotiaista: naisten ja miesten ero, prosenttiyksikköä", "12bq", "vkour",
                        {y: tertiary[(y, "2")] - tertiary[(y, "1")] for y in eyears if (y, "2") in tertiary and (y, "1") in tertiary},
                        EDU_NOTE + " Positiivinen = naisilla useammin korkea-asteen tutkinto."))

crisis = [y for y, x in values(CRISIS) if x == 1]
data = {"meta": {"generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "source": "Supabase indicator_series / indicator_values; Tilastokeskus StatFin",
                 "crisis_source": "Jordà–Schularick–Taylor Macrohistory Database (R6): systeemisen pankkikriisin vuodet"},
        "indicators": out, "crisis_years": crisis}
json.dump(data, open("src/data/indicators.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("kriisivuodet", crisis)
