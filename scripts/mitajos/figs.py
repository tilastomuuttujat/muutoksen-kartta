"""Kuva: mitä jos -tilanteet. Suomen ero synteettiseen Suomeen (punainen) ja sama ero jokaiselle
vertailumaalle lumekäsittelynä (harmaat). Käyttö: python3 figs.py DATA_DIR KUVA.png"""
import os, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
sys.path.insert(0, os.path.dirname(__file__))
import scan

d, out = sys.argv[1], sys.argv[2]
data = {}
for ind, (_, log) in scan.INDICATORS.items():
    s = scan.load(d, ind)
    data[ind] = (s, scan.valid_from(s, log), log)

ev = scan.EVENTS
fig, axes = plt.subplots(2, 4, figsize=(15, 7.2), sharex=False)
for ax, e in zip(axes.flat, ev):
    s, valid, log = data[e["ind"]]
    T = e["T"]
    donors = [c for c in e["pool"] if valid[c] <= T - scan.PRE]
    conv = (lambda x: (np.exp(x) - 1) * 100) if log else (lambda x: x)
    yrs = list(range(T - scan.PRE, min(T + scan.H, scan.LAST) + 1))
    for c in donors:
        g, *_ = scan.gap_path(s, c, [x for x in donors if x != c], T, log)
        ax.plot(yrs, conv(g), color="#9a9a9a", lw=0.9, alpha=0.7)
    g, w, pr, po = scan.gap_path(s, "fin", donors, T, log)
    ax.plot(yrs, conv(g), color="#b3401f", lw=2.6)
    ax.axhline(0, color="#333", lw=0.8)
    ax.axvline(T, color="#333", lw=0.8, ls=":")
    r = scan.synth(s, valid, T, log, e["pool"])
    rank, n = int(r[4]), len(r[5]) + 1
    ax.set_title(f"{e['label']}\n{'BKT/asukas, % ero' if log else 'elinajanodote, v ero'} · Suomi {rank}./{n}", fontsize=10.5, loc="left")
    ax.spines[["top", "right"]].set_visible(False)
    ax.tick_params(labelsize=8.5)
axes.flat[-1].set_visible(False) if len(ev) < 8 else None
fig.suptitle("Mitä jos Suomi olisi kulkenut kuten verrokkinsa? Punainen: Suomi miinus synteettinen Suomi. Harmaa: sama jokaiselle vertailumaalle.",
             fontsize=12, x=0.01, ha="left")
fig.text(0.01, 0.01, "Lähde: Gapminder (Maddison, HMD). Synteettinen Suomi sovitettu 15 vuoteen ennen pistekatkoviivaa. Sija: Suomen poikkeaman suuruus (jälkijakson/esijakson virhe) kaikkien maiden joukossa.",
         fontsize=8.5, color="#555")
fig.tight_layout(rect=(0, 0.03, 1, 0.94))
fig.savefig(out, dpi=150)
print("ok", out)
