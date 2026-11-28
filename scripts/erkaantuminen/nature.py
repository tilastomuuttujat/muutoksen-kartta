"""Erkaantumisten luonne (docs/erkaantuminen.md, kirjattu 28.11.2026) → src/data/erkaantuminen.json["nature"].

Lähteet: Finlex-ote ($FINLEX_EXTRACT, scripts/erkaantuminen/fetch_finlex.py), Eurostatin katkosmerkinnät (haetaan),
kirjattu ulkoisten iskujen lista. Aja build.py:n jälkeen.
"""
import json
import os
import urllib.request

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "src", "data", "erkaantuminen.json")

KEYWORDS = {
    "koulutus": ["yliopisto", "ammattikorkeakoulu", "korkeakoulu", "opintotu", "opiskelijavalin", "tutkinto"],
    "talous": ["tulovero", "veroasteikko", "arvonlisävero", "valtionosuu", "valmistevero", "verotus"],
    "sosiaaliturva": ["eläke", "työttömyysturva", "sairausvakuutus", "toimeentulotu", "asumistu", "lapsilisä", "vammaisetuu"],
    "tyo": ["työttömyysturva", "työsopimus", "työvoimapalvelu", "työmarkkinatu", "palkkatu", "työllisyy", "työllistämi"],
    "terveys": ["alkoholi", "tupakka", "terveydenhuol", "kansanterveys", "päihde"],
}
# sarja → hakusanaryhmä (docs/erkaantuminen.md: Hakusanat sarjoittain)
SERIES_KW = {"E20": "koulutus", "E24": "talous", "nordics.govexp_social_protection_gdp_1995_2024": "sosiaaliturva", "E11": "terveys"}
SHOCKS = [
    {"id": "I1", "name": "Nokian matkapuhelinliiketoiminnan alamäki", "years": (2008, 2012), "domains": ["Työ", "Talous"]},
    {"id": "I2", "name": "Metsäteollisuuden kapasiteetin supistukset", "years": (2006, 2009), "domains": ["Työ", "Talous"]},
    {"id": "I3", "name": "Venäjän kaupan romahdus", "years": (2014, 2015), "domains": ["Työ", "Talous"]},
    {"id": "I4", "name": "IT-kuplan puhkeaminen", "years": (2000, 2001), "domains": ["Talous", "Julkinen talous"]},
]
# Eurostat-lähde katkosmerkintöjä varten (None = lähteestä ei katkostietoa)
EUROSTAT_SRC = {
    "E11": ("demo_mlexpec", "sex=T&age=Y_LT1&unit=YR&geo=FI"),
    "E20": ("edat_lfse_03", "isced11=ED5-8&age=Y25-34&sex=T&unit=PC&geo=FI"),
    "E24": ("gov_10dd_edpt1", "na_item=B9&sector=S13&unit=PC_GDP&geo=FI"),
    "nordics.govexp_social_protection_gdp_1995_2024": ("gov_10a_exp", "na_item=TE&sector=S13&unit=PC_GDP&cofog99=GF10&geo=FI"),
    "eurostat.nordics.lfsa_urgan": ("lfsa_urgan", "age=Y25-29&sex=T&citizen=TOTAL&unit=PC&geo=FI"),
    "eurostat.nordics.lfsa_ergan.y25_29": ("lfsa_ergan", "age=Y25-29&sex=T&citizen=TOTAL&unit=PC&geo=FI"),
    "eurostat.nordics.lfsa_etpgan": ("lfsa_etpgan", "age=Y25-34&sex=T&citizen=TOTAL&unit=PC&geo=FI"),
    "safe_corridor.long_term_unemployment_share_25_29": ("lfsa_upgacob", "geo=FI"),
    "safe_corridor.long_term_unemployment_share_30_34": ("lfsa_upgacob", "geo=FI"),
    "nordics.unemployment_rate_25_34_men_1990_2024": None,
}


def break_years(src):
    if src is None:
        return None
    ds, p = src
    d = json.load(urllib.request.urlopen(f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{ds}?{p}&format=JSON&lang=en", timeout=180))
    tix = {v: k for k, v in d["dimension"]["time"]["category"]["index"].items()}
    n = len(tix)
    return sorted({int(tix[int(pos) % n]) for pos, f in d.get("status", {}).items() if "b" in f})


def main():
    he = json.load(open(os.environ.get("FINLEX_EXTRACT", "scan-data/finlex-he.json")))
    years = sorted(int(y) for y in he)
    assert years[0] <= 1996 and years[-1] >= 2019, "Finlex-otteesta puuttuu vuosia"
    def matches(group, y0, y1):
        kws = KEYWORDS[group]
        return [r for y in range(y0, y1 + 1) for r in he.get(str(y), []) if any(k in r[2].lower() for k in kws)]
    O = json.load(open(DATA))
    out = []
    for s in O["series"]:
        f = s["countries"]["FI"]
        if not (f and f["diverging"]):
            continue
        tau = f["tau"]
        group = SERIES_KW.get(s["id"], "tyo" if s["domain"] == "Työ" else None)
        hits = matches(group, tau - 3, tau)
        placebo = [len(matches(group, e - 3, e)) for e in range(1999, 2020)]
        p90 = float(np.percentile(placebo, 90))
        decision = len(hits) > p90
        shocks = [sh["id"] for sh in SHOCKS if sh["years"][0] <= tau <= sh["years"][1] + 1 and s["domain"] in sh["domains"]]
        br = break_years(EUROSTAT_SRC.get(s["id"]))
        measurement = None if br is None else any(tau - 1 <= b <= tau + 1 for b in br)
        cats = (["päätöksenteko"] if decision else []) + (["ulkoinen isku"] if shocks else [])
        label = cats[0] if len(cats) == 1 else "useita" if cats else "ei laukaisijaa"
        out.append({"id": s["id"], "tau": tau, "group": group, "nHits": len(hits), "placeboP90": round(p90, 1),
                    "placeboMedian": float(np.median(placebo)), "decision": decision, "shocks": shocks,
                    "breakYears": br, "measurement": measurement, "label": label,
                    "hits": sorted(hits, key=lambda r: r[1] or "")})
    O["nature"] = {"shocks": [{**sh, "years": list(sh["years"])} for sh in SHOCKS], "keywords": KEYWORDS, "cases": out,
                   "heYears": [years[0], years[-1]], "heCount": sum(len(v) for v in he.values())}
    json.dump(O, open(DATA, "w"), ensure_ascii=False, separators=(",", ":"))
    for c in out:
        print(c["tau"], c["id"][:45], c["label"], "| osumia", c["nHits"], "p90", c["placeboP90"], "| iskut", c["shocks"], "| mittaus", c["measurement"])


if __name__ == "__main__":
    main()
