import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CNAME, COUNTRIES, ERK, divergences, domainMedians, gapShown, type Series } from "@/lib/erkaantuminen";

export const Route = createFileRoute("/erkaantuminen")({
  head: () => ({
    meta: [
      { title: "Erkaantumiskartta – Murrosmatriisi" },
      { name: "description", content: "Missä vaiheessa Suomen kehitys erkani Ruotsin, Norjan ja Tanskan kehityksestä – ja missä järjestyksessä eri elämänalueet erkanivat." },
      { property: "og:title", content: "Erkaantumiskartta – Murrosmatriisi" },
      { property: "og:description", content: "Ei ranking vaan reitti: missä Suomen polku erkani muista Pohjoismaista." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DivergencePage,
});

const DOCS = "https://github.com/tilastomuuttujat/muutoksen-kartta/blob/main/docs/erkaantuminen.md";
const nf = (v: number, d = 1) => { const t = Math.abs(v).toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d }); return v < 0 ? `−${t}` : t; };
const sg = (v: number, d = 1) => (v > 0 ? `+${nf(v, d)}` : nf(v, d));

function DivergencePage() {
  const fi = divergences("FI");
  const [sel, setSel] = useState<string>(fi[0]?.id ?? "");
  const cur = ERK.series.find((s) => s.id === sel) ?? fi[0];
  const cl = ERK.clusters.FI;
  const worse = fi.filter((s) => s.countries.FI!.direction === "huonompaan").length;
  const moved = fi.filter((s) => s.countries.FI!.moved?.mover === "Suomi").length;
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-5">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Erkaantumiskartta</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Ranking kertoo, missä Suomi on nyt. Tämä kartta kysyy, missä vaiheessa Suomen polku erkani Ruotsin, Norjan ja Tanskan polusta,
          kasautuivatko erkaantumiset samoille vuosille ja missä järjestyksessä eri elämänalueet erkanivat. Jokaiselle {ERK.series.length} sarjalle etsitään
          vuosi, jolloin Suomen ero muiden keskiarvoon alkoi kehittyä uuteen suuntaan, ja katkos hyväksytään vain, jos se on suurempi kuin sarjan
          tavallinen vaihtelu tuottaisi. Sama menettely ajetaan vertailuksi Ruotsille, Norjalle ja Tanskalle.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sarjat, suunnat ja säännöt kirjattiin ennen laskentaa: <a href={DOCS} className="underline underline-offset-4">docs/erkaantuminen.md</a>. Samanaikaisuus ei ole syy; kartta tuottaa ehdokkaita <Link to="/naytto" className="underline underline-offset-4">Näyttöverkkoon</Link>.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-5" aria-labelledby="sum-h">
        <h2 id="sum-h" className="font-display text-xl">Suomi erkani muista useammin kuin yksikään naapuri – ja lähes aina huonompaan suuntaan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {COUNTRIES.map((c) => {
            const n = divergences(c).length;
            return (
              <div key={c} className={`rounded-lg border p-3 ${c === "FI" ? "border-primary" : ""}`}>
                <div className="text-sm font-semibold">{CNAME[c]}</div>
                <div className="mt-1 font-display text-3xl tabular-nums">{n}</div>
                <div className="text-xs text-muted-foreground">erkaantumista {ERK.analysed[c]} sarjasta</div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 max-w-3xl text-sm">
          Suomen {fi.length} erkaantumisesta {worse} oli huonompaan suuntaan, ja {moved} tapauksessa muutos lähti Suomesta eikä muista maista.
          Erkaantumiset eivät kuitenkaan kasaudu yhdelle jaksolle: ruuhkaisimmassa viiden vuoden ikkunassa ({cl.window?.[0]}–{cl.window?.[1]}) niitä oli {cl.K},
          kun satunnainen ajoitus tuottaisi keskimäärin {nf(cl.nullMean ?? 0)} (p = {nf(cl.p ?? 1, 2)}). Yhtä yhteistä juurta ei siis näy; sen sijaan näkyy kaksi kerrosta. Osa erkaantumisista on jyrkkiä (korkea-asteen tutkinnot, julkinen talous, pitkäaikaistyöttömyys), osa on aiemman lähentymisen pysähtymistä ja loivaa erkanemista (esimerkiksi 25–29-vuotiaiden työttömyys): kaavio näyttää kummasta on kyse.
        </p>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="tl-h">
        <h2 id="tl-h" className="font-display text-xl">Suomen erkaantumiset aikajärjestyksessä</h2>
        <p className="mt-1 text-sm text-muted-foreground">Valitse rivi nähdäksesi Suomen eron muiden keskiarvoon ja sovitetun katkoksen.</p>
        <Timeline rows={fi} sel={cur?.id} onSel={setSel} />
        {cur && <GapChart s={cur} />}
        <h3 className="mt-5 text-sm font-semibold">Elämänalueet erkaantumisvuoden mediaanin mukaan</h3>
        <ul className="mt-1 flex flex-wrap gap-2 text-sm">
          {domainMedians().map((d) => <li key={d.domain} className="rounded-full border px-2.5 py-0.5">{d.domain} <span className="text-muted-foreground">· {Number.isInteger(d.median) ? d.median : `${Math.floor(d.median)}–${Math.ceil(d.median)}`} · {d.n} sarjaa</span></li>)}
        </ul>
        <div className="mt-4 rounded-lg border border-dashed p-3 text-sm">
          <div className="font-semibold">Kaksi kerrosta ja uusi hypoteesi</div>
          <p className="mt-1 text-muted-foreground">
            Ensin, vuosina 1999–2002, erkanivat nuorten aikuisten koulutustaso (Suomi oli korkea-asteen tutkinnoissa muita edellä, nyt selvästi jäljessä) ja julkinen talous.
            Toinen kerros, 2008–2015, on nuorten aikuisten työmarkkinat ketjuna: työttömyys, sitten työllisyys, sitten pitkäaikaistyöttömyys. Tästä aineistosta muotoiltu hypoteesi,
            jota ei ole testattu: koulutustason jääminen jälkeen edelsi nuorten aikuisten työmarkkina-aseman erkaantumista. Se pitää testata muulla aineistolla, esimerkiksi ikäluokittain tai alueittain.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="muut-h">
        <h2 id="muut-h" className="font-display text-xl">Vertailu: naapurimaiden erkaantumiset</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(["SE", "NO", "DK"] as const).map((c) => (
            <li key={c}><span className="font-semibold">{CNAME[c]}:</span> {divergences(c).map((s) => `${s.name} (${s.countries[c]!.tau})`).join("; ") || "ei erkaantumisia"}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {ERK.dropped.length} sarjaa jätettiin pois kaksoiskappaleina (vuosimuutosten korrelaatio yli 0,97). PISA-sarjoja ei voitu analysoida: niissä on vain neljä mittauskertaa.
          Lyhyissä sarjoissa katkoksen ajoitus on epätarkka, ja katkos erossa voi johtua myös muiden maiden muutoksesta; siksi jokaiselle erkaantumiselle näytetään, kumpi muuttui.
        </p>
      </section>
    </main>
  );
}

function Timeline({ rows, sel, onSel }: { rows: Series[]; sel?: string | undefined; onSel: (id: string) => void }) {
  const X0 = 1995, X1 = 2025, L = 300, R = 600, W = 620, ROW = 24, H = rows.length * ROW + 24;
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const cl = ERK.clusters.FI.window;
  return (
    <div className="mt-3 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px] max-w-3xl" role="img" aria-label={`Suomen erkaantumiset: ${rows.map((s) => `${s.name} ${s.countries.FI!.tau}`).join(", ")}`}>
        {cl && <rect x={x(cl[0])} y={0} width={x(cl[1] + 1) - x(cl[0])} height={H - 20} fill="var(--muted-foreground)" fillOpacity={0.08} />}
        {[1995, 2000, 2005, 2010, 2015, 2020, 2025].map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={0} y2={H - 20} stroke="var(--foreground)" strokeOpacity={0.08} /><text x={x(t)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text></g>)}
        {rows.map((s, i) => {
          const r = s.countries.FI!, y = 14 + i * ROW, on = s.id === sel;
          const col = r.direction === "huonompaan" ? "var(--primary)" : "var(--muted-foreground)";
          return (
            <g key={s.id} onClick={() => onSel(s.id)} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSel(s.id); }}>
              <rect x={0} y={y - 11} width={W} height={ROW - 2} fill={on ? "var(--primary)" : "transparent"} fillOpacity={on ? 0.07 : 0} />
              <text x={4} y={y + 4} className={`text-[11px] ${on ? "fill-primary font-semibold" : "fill-foreground"}`}>{s.name.length > 46 ? `${s.name.slice(0, 45)}…` : s.name}</text>
              <line x1={x(r.first)} x2={x(r.last)} y1={y} y2={y} stroke="var(--foreground)" strokeOpacity={0.2} />
              <circle cx={x(r.tau)} cy={y} r={5.5} fill={col} />
              <text x={x(r.tau) + 9} y={y + 4} className="fill-muted-foreground text-[10px]">{r.tau}{r.moved?.mover === "muut" ? " · muut muuttuivat" : ""}</text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-muted-foreground">Piste: erkaantumisvuosi (punainen = huonompaan suuntaan, harmaa = neutraali). Viiva: sarjan kattama aika. Varjostus: ruuhkaisin viiden vuoden ikkuna ({ERK.clusters.FI.K} erkaantumista, ei poikkeuksellinen).</p>
    </div>
  );
}

function GapChart({ s }: { s: Series }) {
  const r = s.countries.FI!;
  const pts = r.gap.map(([y, v]) => [y, gapShown(s, v)] as [number, number]);
  const fit = r.fit.map(([y, v]) => [y, gapShown(s, v)] as [number, number]);
  const vals = [...pts, ...fit].map((p) => p[1]);
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const pad = (hi - lo) * 0.1 || 1;
  const W = 620, H = 210, L = 46, R = 600, TOP = 14, BOT = 180;
  const x = (y: number) => L + ((y - r.first) / (r.last - r.first)) * (R - L);
  const y = (v: number) => BOT - ((v - lo + pad) / (hi - lo + 2 * pad)) * (BOT - TOP);
  const unit = s.log ? "%" : "";
  const step = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50].find((st) => (hi - lo + 2 * pad) / st <= 6) ?? 100;
  const ticks: number[] = [];
  for (let t = Math.ceil((lo - pad) / step) * step; t <= hi + pad; t += step) ticks.push(Math.round(t * 100) / 100);
  return (
    <div className="mt-4 rounded-lg border p-3">
      <div className="text-sm font-semibold">{s.name}</div>
      <div className="text-xs text-muted-foreground">
        {s.domain} · erkaantuminen {r.tau}, {r.direction} · katkoksen p = {nf(r.p, 3)} · {r.moved ? (r.moved.mover === "Suomi" ? "muutos lähti Suomesta" : "muutos lähti muista maista") : ""} · {s.source}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img" aria-label={`Suomen ero muiden Pohjoismaiden keskiarvoon: ${s.name}`}>
          <line x1={L} x2={R} y1={y(0)} y2={y(0)} stroke="var(--foreground)" strokeOpacity={0.35} />
          <text x={L + 4} y={y(0) + 12} className="fill-muted-foreground text-[10px]">0 = muiden keskiarvo</text>
          {ticks.map((t) => <text key={t} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{sg(t, step < 1 ? 1 : 0)}</text>)}
          <line x1={x(r.tau)} x2={x(r.tau)} y1={TOP} y2={BOT} stroke="var(--primary)" strokeDasharray="3 3" strokeOpacity={0.6} />
          <text x={x(r.tau) + 4} y={TOP + 8} className="fill-primary text-[10px]">{r.tau}</text>
          <path d={fit.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 3" />
          <path d={pts.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
          {[r.first, r.tau, r.last].map((t) => <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">Punainen: Suomi miinus Ruotsin, Norjan ja Tanskan keskiarvo{unit ? " (prosenttiero)" : ""}. Katkoviiva: sovitettu suora, jonka suunta muuttuu erkaantumisvuonna.</p>
    </div>
  );
}
