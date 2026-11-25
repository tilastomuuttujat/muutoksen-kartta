import json, os, numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
o = json.load(open(os.path.join(os.environ.get("SKANNAUS_DIR", "scan-data/"), "h1990_result.json"))); R = o["regions"]
x = np.array(o["teollisuus+rakentaminen"]["x"]); y = np.array(o["chg"])
GREY, ACC, INK = "#9AA3AA", "#A23B2A", "#1B2A35"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})
fig, ax = plt.subplots(figsize=(9, 5.6))
ax.axhline(o["nat"], color=INK, lw=1, ls="--"); ax.text(0.15, o["nat"] + 0.004, f"Koko maa {o['nat']:.0%}".replace("-", "−"), ha="left", fontsize=9, color=INK)
ax.scatter(x, y, color=GREY, s=36, zorder=3)
for n, a, b in zip(R, x, y):
    if n in ("Ahvenanmaa", "Pohjanmaa", "Lappi", "Päijät-Häme", "Uusimaa", "Kymenlaakso", "Pirkanmaa", "Satakunta", "Kainuu", "Keski-Pohjanmaa"):
        ax.annotate(n, (a, b), xytext=(5, 3), textcoords="offset points", fontsize=8.5, color="#4A5A66")
ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0%}".replace("-", "−")))
ax.set_xlabel("Teollisuuden ja rakentamisen osuus maakunnan työllisistä 1989"); ax.set_ylabel("Työllisten muutos 1989–1993")
for s in ("top", "right"): ax.spines[s].set_visible(False)
fig.text(0.01, 0.965, "Teollisuusvaltaiset maakunnat eivät menettäneet lamassa enempää työpaikkoja", fontsize=13, fontweight="bold", color=INK)
fig.text(0.01, 0.93, f"Järjestyskorrelaatio {o['teollisuus+rakentaminen']['rho']:+.2f} (p = {o['teollisuus+rakentaminen']['p']:.2f}); lama osui kaikkiin maakuntiin".replace(".", ",").replace("-0,", "−0,") + " −13…−22 % (pl. Ahvenanmaa)", fontsize=9.5, color="#4A5A66")
fig.text(0.01, 0.01, "Lähde: Tilastokeskus, aluetilinpito (EKT95/TOL2002, arkisto 904) Turson tapaustutkimuksessa H1990-01. 20 maakuntaa.", fontsize=8, color="#7A8790")
fig.tight_layout(rect=(0, 0.03, 1, 0.91)); fig.savefig(os.path.join(os.environ.get("SKANNAUS_DIR", "scan-data/"), "kuva3-lama-alueet.png"), dpi=180); print("ok")
