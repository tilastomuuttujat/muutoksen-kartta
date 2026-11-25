import json, collections, os
import numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
D = os.environ.get("SKANNAUS_DIR", "scan-data/")
r = json.load(open(D + "result.json"))
rows = [x for x in r["rows"] if x[0] >= 1860]
yrs = np.array([x[0] for x in rows]); sh = np.array([x[3] for x in rows]); p99 = np.array([x[4] for x in rows]); n = np.array([x[1] for x in rows])
fwe = r["fwe"]
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})
GREY, ACC, INK = "#9AA3AA", "#A23B2A", "#1B2A35"
fig, (ax, axn) = plt.subplots(2, 1, figsize=(10, 5.6), height_ratios=[4, 1], sharex=True)
ax.fill_between(yrs, 0, p99, color=GREY, alpha=0.25, lw=0, label="Sattuman vaihteluväli (99 %, vuosittain)")
ax.axhline(fwe, color=INK, lw=1, ls="--")
ax.text(1953, fwe - 0.03, f"Raja, jonka sattuma ylittää vain 5 %:ssa kokeista: {fwe:.0%}", fontsize=9, color=INK)
ax.plot(yrs, sh, color=GREY, lw=1.3)
sig = sh > fwe
ax.scatter(yrs[sig], sh[sig], color=ACC, s=22, zorder=3)
labels = {1868: "Nälkävuodet", 1918: "Sisällissota", 1931: "1930-luvun lama", 1945: "Sota", 1991: "1990-luvun lama", 2009: "Finanssikriisi"}
for y, t in labels.items():
    v = sh[list(yrs).index(y)]
    ax.annotate(f"{t} {y}", (y, v), xytext=(0, 8), textcoords="offset points", ha="center", fontsize=9, color=ACC)
ax.set_ylim(0, 0.7); ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
fig.text(0.01, 0.965, "Kriisivuodet erottuvat koko aineistosta selvästi sattuman yläpuolelle", fontsize=13, color=INK, fontweight="bold")
fig.text(0.01, 0.935, "Osuus sarjoista, joiden vuosimuutos oli oman historian 5–95 %:n vaihteluvälin ulkopuolella", fontsize=9.5, color="#4A5A66")
for s in ("top", "right"): ax.spines[s].set_visible(False); axn.spines[s].set_visible(False)
axn.bar(yrs, n, color=GREY, width=0.9); axn.set_ylabel("sarjoja", fontsize=8.5, color="#4A5A66")
axn.set_xlim(1858, 2027)
fig.text(0.01, 0.005, "Aineisto: Turso, 511 kansallista sarjaa (608 791 arvosta). Nollamalli: kunkin sarjan poikkeamavuodet sekoitettu satunnaisesti 300 kertaa.", fontsize=8, color="#7A8790")
fig.tight_layout(rect=(0, 0.02, 1, 0.92)); fig.savefig(D + "kuva1-kriisit.png", dpi=180)

# Kuva 2: elämänalueiden "seismografi"
lanes = r["lanes"]; cnt = {t: sum(v[0] for v in d.values()) for t, d in lanes.items()}
top = [t for t, _ in sorted(cnt.items(), key=lambda z: -z[1]) if t != "?" and sum(1 for v in lanes[t].values() if v[0] >= 5) >= 40][:9]
Y = list(range(1860, 2026))
M = np.full((len(top), len(Y)), np.nan)
for i, t in enumerate(top):
    for j, y in enumerate(Y):
        v = lanes[t].get(str(y))
        if v and v[0] >= 5: M[i, j] = v[1] / v[0]
fig, ax = plt.subplots(figsize=(10, 4.2))
cmap = matplotlib.colormaps["Reds"].copy(); cmap.set_bad("#F1EEE8")
im = ax.imshow(M, aspect="auto", cmap=cmap, vmin=0, vmax=0.6, extent=(1859.5, 2025.5, len(top) - 0.5, -0.5), interpolation="nearest")
ax.set_yticks(range(len(top))); ax.set_yticklabels([t[:42] for t in top], fontsize=8.5)
ax.set_title("Elämänalueiden seismografi: kuinka suuri osa alueen sarjoista poikkesi", loc="left", fontsize=12, color=INK, fontweight="bold")
cb = fig.colorbar(im, ax=ax, fraction=0.025, pad=0.01); cb.ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0%}"))
fig.text(0.01, 0.01, "Harmaa = alle 5 sarjaa. Odotusarvo sattumalta noin 11 %.", fontsize=8, color="#7A8790")
fig.tight_layout(rect=(0, 0.03, 1, 1)); fig.savefig(D + "kuva2-seismografi.png", dpi=180)
print("ok")
