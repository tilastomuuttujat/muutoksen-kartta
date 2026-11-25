"""Ennalta kiinnitetty testi (kirjattu ennen laskentaa):
H: Maakunnat, joissa suhdanneherkkien toimialojen (teollisuus D + rakentaminen F) osuus työllisistä oli
   1989 suurin, menettivät 1989–1993 suhteellisesti eniten työllisiä.
Mittari: Spearmanin järjestyskorrelaatio altistuksen ja työllisten muutoksen % välillä, 20 maakuntaa
   (pois Ulkoalue). Merkitsevyys permutaatiotestillä (10 000 sekoitusta). Tuki: korrelaatio negatiivinen
   ja p < 0,05. Lisäksi shift-share: kuinka suuri osa alueiden erosta selittyy toimialarakenteella.
"""
import json, os, random, collections
import numpy as np
rows = json.load(open(os.path.join(os.environ.get("SKANNAUS_DIR", "scan-data/"), "h1990_altp904.json")))
V = collections.defaultdict(dict)
for name, code, y, ind, v in rows: V[(name, y)][ind] = v
D_CODES = ["DA", "DB_DC", "DD", "DE", "DF_DG_DH", "DI", "DJ", "DK", "DL", "DM", "DN"]
MAIN = ["01_A", "02_A", "B", "C", *D_CODES, "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "X"]
regions = sorted({n for n, _ in V if n not in ("KOKO MAA", "Ulkoalue")})
for n in ["KOKO MAA"] + regions[:3]:
    s = sum(V[(n, 1989)].get(c, 0) for c in MAIN); print(f"tarkistus {n}: osien summa {s:.0f} vs yhteensä {V[(n,1989)].get('Yhteensä',0):.0f}")
def tot(n, y): return V[(n, y)]["Yhteensä"]
def share(n, codes): return sum(V[(n, 1989)].get(c, 0) for c in codes) / tot(n, 1989)
def spearman(a, b):
    ra = np.argsort(np.argsort(a)); rb = np.argsort(np.argsort(b)); return np.corrcoef(ra, rb)[0, 1]
def perm_p(a, b, rho, R=10000):
    random.seed(7); b = list(b); k = 0
    for _ in range(R):
        random.shuffle(b)
        if spearman(a, b) <= rho: k += 1
    return k / R
chg = np.array([tot(n, 1993) / tot(n, 1989) - 1 for n in regions])
rec = np.array([tot(n, 2000) / tot(n, 1993) - 1 for n in regions])
out = {"regions": regions, "chg": chg.tolist(), "rec": rec.tolist()}
for label, codes in (("teollisuus+rakentaminen", D_CODES + ["F"]), ("teollisuus", D_CODES), ("rakentaminen", ["F"]), ("maa- ja metsätalous", ["01_A", "02_A"])):
    x = np.array([share(n, codes) for n in regions])
    rho = spearman(x, chg); p = perm_p(x, chg, rho)
    print(f"{label:26s} altistus {x.min():.0%}–{x.max():.0%} | rho = {rho:+.2f}, p(yksisuuntainen, negatiivinen) = {p:.3f}")
    out[label] = {"x": x.tolist(), "rho": rho, "p": p}
# Shift-share: odotettu muutos, jos jokainen toimiala olisi muuttunut alueella kuten koko maassa
g = {c: (V[("KOKO MAA", 1993)].get(c, 0) / V[("KOKO MAA", 1989)][c] - 1) for c in MAIN if V[("KOKO MAA", 1989)].get(c)}
exp = np.array([sum(V[(n, 1989)].get(c, 0) * g.get(c, 0) for c in MAIN) / tot(n, 1989) for n in regions])
r = np.corrcoef(exp, chg)[0, 1]
nat = tot("KOKO MAA", 1993) / tot("KOKO MAA", 1989) - 1
print(f"koko maa {nat:.1%}; alueiden muutos {chg.min():.1%}…{chg.max():.1%}")
print(f"shift-share: korrelaatio odotettu vs toteutunut r = {r:.2f}, R² = {r*r:.2f}")
print("toimialojen muutos koko maassa 1989–93:", {c: f"{v:+.0%}" for c, v in sorted(g.items(), key=lambda z: z[1])[:6]})
for n, e, a in sorted(zip(regions, exp, chg), key=lambda z: z[2]):
    print(f"  {n:18s} odotettu {e:+.1%}  toteutunut {a:+.1%}  ero {a-e:+.1%}")
rho_rec = spearman(chg, rec); print(f"toipuminen 1993–2000 vs pudotus 1989–93: rho = {rho_rec:+.2f}")
out.update({"exp": exp.tolist(), "r_shift": r, "nat": nat, "rho_rec": rho_rec})
json.dump(out, open(os.path.join(os.environ.get("SKANNAUS_DIR", "scan-data/"), "h1990_result.json"), "w"), ensure_ascii=False)
