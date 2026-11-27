import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DESIGNS,
  HYPOTHESES,
  NAYTTO,
  RESULTS,
  STATUSES,
  predictionState,
  statusOfHypothesis,
  type Hypothesis,
  type Prediction,
  type Result,
  type Status,
  type Test,
} from "@/lib/naytto";

export const Route = createFileRoute("/naytto")({
  head: () => ({
    meta: [
      { title: "Näyttöverkko – Murrosmatriisi" },
      { name: "description", content: "Kartan syy-yhteydet testattavina hypoteeseina: ennalta kirjatut testit, näytön kertymä ja päivätyt ennusteet, jotka ratkeavat uusien tilastojen myötä." },
      { property: "og:title", content: "Näyttöverkko – Murrosmatriisi" },
      { property: "og:description", content: "Mikä yhteys kestää testit, mikä kumoutuu? Ennalta kirjatut hypoteesit, testit ja ennusteet." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EvidencePage,
});

const ORDER: Status[] = ["kumottu", "ristiriita", "oletus", "ehdokas", "tuettu", "vahvasti-tuettu"];
const STATUS_CLS: Record<Status, string> = {
  kumottu: "border-foreground/60 bg-foreground/80 text-background",
  oletus: "border-border bg-muted text-muted-foreground",
  ristiriita: "border-foreground/40 border-dashed text-foreground",
  ehdokas: "border-primary/60 text-primary",
  tuettu: "border-primary bg-primary/15 text-primary",
  "vahvasti-tuettu": "border-primary bg-primary text-primary-foreground",
};
const RESULT_CLS: Record<Result, string> = {
  tukee: "text-primary",
  kumoaa: "text-foreground",
  "ei-ratkea": "text-muted-foreground",
  "ei-testattu": "text-muted-foreground",
};
const nf = (v: number, d = 2) => v.toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });
const REGISTER_URL = "https://github.com/tilastomuuttujat/muutoksen-kartta/blob/main/docs/naytto-rekisteri.md";

function EvidencePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-5">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Näyttöverkko</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Kartan yhteydet ovat toimituksellisia arvioita. Näyttöverkko muuttaa ne testattaviksi väitteiksi: jokaiselle kirjataan
          etukäteen, mitä datan pitäisi näyttää, jos väite pitää, ja mikä tulos sen kumoaisi. Testien jälkeen yhteys nousee
          tai putoaa portailla. Ennusteet ratkeavat, kun uudet tilastot julkaistaan.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Kaksikymmentä hypoteesia, joista kolme tuli seulasta. Tulokset {NAYTTO.built.split("-").reverse().join(".")}. <a href={REGISTER_URL} className="underline underline-offset-4">Hypoteesirekisteri</a> (kirjattu ennen testejä, muutokset uusina merkintöinä).
        </p>
      </header>

      <Ladder />

      {HYPOTHESES.map((h) => <HypothesisCard key={h.id} h={h} />)}

      <section className="mt-8 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-display text-xl">Säännöt</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {(Object.keys(DESIGNS) as (keyof typeof DESIGNS)[]).map((d) => (
            <li key={d}><strong>{DESIGNS[d].label}</strong> ({DESIGNS[d].strength === "vahva" ? "vahva asetelma" : DESIGNS[d].strength === "keski" ? "keskitason asetelma" : "heikko asetelma"}): {DESIGNS[d].question}</li>
          ))}
        </ul>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {ORDER.map((s) => <li key={s}><strong>{STATUSES[s].label}:</strong> {STATUSES[s].info}.</li>)}
        </ul>
        <p className="mt-3 text-muted-foreground">
          Tuettukaan yhteys ei ole todistettu syy. Säännöt kertovat, kuinka monta eri tavalla rakennettua testiä se on läpäissyt. Ennen testiä kirjattu kumoava ehto estää valitsemasta testiä jälkikäteen niin, että tulos näyttää hyvältä.
        </p>
      </section>
    </main>
  );
}

function Ladder() {
  const byStatus = new Map<Status, Hypothesis[]>();
  for (const h of HYPOTHESES) {
    const s = statusOfHypothesis(h);
    byStatus.set(s, [...(byStatus.get(s) ?? []), h]);
  }
  return (
    <section className="rounded-xl border bg-card p-5" aria-labelledby="ladder-h">
      <h2 id="ladder-h" className="font-display text-xl">Seitsemän väitettä kumoutui, kaksi on tuettu, viisi on ehdokkaita ja kuuden näyttö on kesken</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ORDER.map((s) => (
          <div key={s} className={`rounded-lg border p-2 ${s === "kumottu" ? "sm:mr-3" : ""}`}>
            <div className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLS[s]}`}>{STATUSES[s].label}</div>
            <ul className="mt-2 space-y-1 text-sm">
              {(byStatus.get(s) ?? []).map((h) => (
                <li key={h.id}><a href={`#${h.id}`} className="underline-offset-4 hover:underline">{h.title}</a></li>
              ))}
              {!byStatus.get(s) && <li className="text-xs text-muted-foreground">–</li>}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Portaat vasemmalta oikealle: kumottu, ristiriitainen, oletus, ehdokas, tuettu, vahvasti tuettu. Vahvasti tuetuksi pääsee vain osuneella ennusteella.</p>
    </section>
  );
}

function HypothesisCard({ h }: { h: Hypothesis }) {
  const s = statusOfHypothesis(h);
  return (
    <section id={h.id} className="mt-6 scroll-mt-4 rounded-xl border bg-card p-5" aria-labelledby={`${h.id}-h`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[s]}`}>{STATUSES[s].label}</span>
        <span className="text-xs text-muted-foreground">{h.id.toUpperCase()} · kirjattu {h.registered.split("-").reverse().join(".")}</span>
      </div>
      <h2 id={`${h.id}-h`} className="mt-2 font-display text-2xl">{h.title}</h2>
      <p className="mt-1 text-sm">{h.claim}</p>
      <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[10rem_1fr]">
        <dt className="text-muted-foreground">Kartassa</dt>
        <dd>{h.map.edge}{h.map.confidence && <> · toimituksellinen arvio: <strong>{h.map.confidence}</strong></>}</dd>
        <dt className="text-muted-foreground">Ennalta kirjattu</dt>
        <dd>{h.preregistered}</dd>
      </dl>

      <ol className="mt-4 divide-y rounded-lg border">
        {h.tests.map((t) => <TestRow key={t.id} h={h} t={t} />)}
      </ol>

      {h.predictions.length > 0 && <Predictions list={h.predictions} />}
      {h.id === "h1g" && <MoneyStory />}

      <p className="mt-4 text-sm">{h.reading}</p>
      <p className="mt-2 text-sm text-muted-foreground"><strong>Seuraavaksi:</strong> {h.next}</p>
    </section>
  );
}

function MoneyStory() {
  const d = NAYTTO.hypotheses.h1g.describe;
  const W = 640, H = 210, L = 40, R = 600, TOP = 12, BOT = 176;
  const X0 = 2000, X1 = 2025;
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const vals = Object.values(d.income2008).flat().map((p) => p[1]);
  const lo = Math.min(...vals) - 2, hi = Math.max(...vals) + 2;
  const y = (v: number) => BOT - ((v - lo) / (hi - lo)) * (BOT - TOP);
  const NAMES: Record<string, string> = { FI: "Suomi", SE: "Ruotsi", DK: "Tanska" };
  const BW = 640, BH = 150, BL = 40, BR = 600, BTOP = 14, BBOT = 120;
  const bx = (yr: number) => BL + ((yr - X0) / (2021 - X0)) * (BR - BL);
  const bmax = Math.max(...d.moneyGrowth.map((p) => p[1]), ...d.creditGrowth.map((p) => p[1]));
  const bmin = Math.min(0, ...d.creditGrowth.map((p) => p[1]));
  const by = (v: number) => BBOT - ((v - bmin) / (bmax - bmin)) * (BBOT - BTOP);
  const r = d.recovery;
  return (
    <div className="mt-4 rounded-lg border p-3">
      <h3 className="text-sm font-semibold">Mitä finanssikriisin ja määrällisen keventämisen aikana tapahtui rahalle?</h3>
      <p className="mt-1 text-xs text-muted-foreground">Kuvaileva osa, ei testi. Tämä aineisto ei erota EKP:n määrällisen keventämisen vaikutusta muista samaan aikaan tapahtuneista asioista.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${BW} ${BH}`} className="h-auto w-full min-w-[460px]" role="img" aria-label="Suomen lavean rahamäärän ja pankkiluottojen vuosikasvu 2000–2020">
          <line x1={BL} x2={BR} y1={by(0)} y2={by(0)} stroke="var(--foreground)" strokeOpacity={0.5} />
          {[2008, 2015].map((t) => <line key={t} x1={bx(t) + 6} x2={bx(t) + 6} y1={BTOP} y2={BBOT} stroke="var(--primary)" strokeDasharray="3 3" />)}
          <text x={bx(2008) + 9} y={BTOP + 8} className="fill-primary text-[10px]">finanssikriisi</text>
          <text x={bx(2015) + 9} y={BTOP + 8} className="fill-primary text-[10px]">EKP:n QE 3/2015</text>
          {d.moneyGrowth.map(([yr, v]) => <rect key={`m${yr}`} x={bx(yr) + 1} y={Math.min(by(v), by(0))} width={5} height={Math.abs(by(v) - by(0))} fill="var(--primary)" />)}
          {d.creditGrowth.map(([yr, v]) => <rect key={`c${yr}`} x={bx(yr) + 7} y={Math.min(by(v), by(0))} width={5} height={Math.abs(by(v) - by(0))} fill="var(--muted-foreground)" />)}
          {[0, 10].map((t) => <text key={t} x={BL - 6} y={by(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{t} %</text>)}
          {[2000, 2005, 2010, 2015, 2020].map((t) => <text key={t} x={bx(t) + 6} y={BH - 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
          <rect x={BL} y={BH - 8} width={8} height={6} fill="var(--primary)" /><text x={BL + 12} y={BH - 2} className="fill-foreground text-[10px]">lavea rahamäärä</text>
          <rect x={BL + 110} y={BH - 8} width={8} height={6} fill="var(--muted-foreground)" /><text x={BL + 122} y={BH - 2} className="fill-foreground text-[10px]">pankkiluotot yksityisille</text>
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">Suomi, vuosikasvu %. Lähde: Jordà–Schularick–Taylor Macrohistory (R6), aineisto päättyy 2020. Luottojen −5,9 % vuonna 2014 voi olla tilastollinen katko.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px]" role="img" aria-label="Kotitalouksien reaalitulot asukasta kohti, 2008 = 100, Suomi, Ruotsi ja Tanska">
          <line x1={L} x2={R} y1={y(100)} y2={y(100)} stroke="var(--foreground)" strokeOpacity={0.4} />
          <text x={L - 6} y={y(100) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">100</text>
          {[2008, 2015].map((t) => <line key={t} x1={x(t)} x2={x(t)} y1={TOP} y2={BOT} stroke="var(--primary)" strokeDasharray="3 3" />)}
          {Object.entries(d.income2008).map(([c, pts]) => {
            const fi = c === "FI";
            const last = pts.at(-1)!;
            return (
              <g key={c}>
                <path d={pts.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(b).toFixed(1)}`).join(" ")} fill="none"
                  stroke={fi ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={fi ? 2.4 : 1.4} />
                <text x={R + 4} y={y(last[1]) + 4} className={`text-[11px] ${fi ? "fill-primary font-semibold" : "fill-muted-foreground"}`}>{NAMES[c]}</text>
              </g>
            );
          })}
          {[2000, 2008, 2015, 2025].map((t) => <text key={t} x={x(t)} y={H - 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">
        Kotitalouksien oikaistu reaalinen käytettävissä oleva tulo asukasta kohti, 2008 = 100 (Eurostat nasa_10_ki).
        2008–2015: Suomi {r["FI"]!.g2008_2015 > 0 ? "+" : ""}{nf(r["FI"]!.g2008_2015, 1)} %, Ruotsi +{nf(r["SE"]!.g2008_2015, 1)} %, Tanska +{nf(r["DK"]!.g2008_2015, 1)} %.
        Suomessa tulot kääntyivät laskuun {r["FI"]!.dipFrom} ja palasivat vuoden {r["FI"]!.peak2008_2014[1]} tasolle vasta {r["FI"]!.regained}.
        2015–2019: Suomi +{nf(r["FI"]!.g2015_2019, 1)} %, Ruotsi +{nf(r["SE"]!.g2015_2019, 1)} %, Tanska +{nf(r["DK"]!.g2015_2019, 1)} %.
      </p>
    </div>
  );
}

function TestRow({ h, t }: { h: Hypothesis; t: Test }) {
  const d = DESIGNS[t.design];
  const r = RESULTS[t.result];
  return (
    <li className="p-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={`w-24 shrink-0 font-semibold ${RESULT_CLS[t.result]}`}><span aria-hidden="true">{r.symbol}</span> {r.label}</span>
        <span className="text-sm font-medium">{d.label}</span>
        <span className="text-xs text-muted-foreground">{d.strength === "vahva" ? "vahva asetelma" : d.strength === "keski" ? "keskitaso" : "heikko asetelma"} · {d.question}</span>
      </div>
      <p className="mt-1 text-sm sm:pl-26">{t.summary}</p>
      {h.id === "h1" && t.id === "toisto" && <CountryDots detail={t.detail as Replication} />}
      {h.id === "h1" && t.id === "annos" && (
        <p className="mt-1 text-xs text-muted-foreground">Alue- ja vuosivaikutukset poistettu: vertailu kertoo, laskeeko syntyvyys niissä maakunnissa, joissa työttömyys nousi samana vuonna muita enemmän. Permutaatiotesti sekoittaa maakuntien työttömyyssarjat 2 000 kertaa.</p>
      )}
      {h.id === "h3" && t.id === "annos" && <RegionStrip detail={t.detail as Regions} />}
      {t.id === "odotukset" && <ExpectationDots detail={t.detail as Expect} />}
      {t.id === "maaraaikaisuus" && <TemporaryDots detail={t.detail as Temporary} />}
      {t.id === "esikoiset" && <FirstbornDots detail={t.detail as Firstborn} />}
      {h.id === "h4" && t.id === "toisto-maat" && <SimpleDots rows={toDots(t.detail as Pooled, "Palvelut")} side="neg" band="H4:n ennuste: vasemmalla" note="Työttömyyden muutos ja julkisten palvelujen (D63) reaalikasvu 1–2 vuotta myöhemmin. Yhdistetty Ruotsi ja Tanska; Suomi näytetään vertailuksi." />}
      {h.id === "h4" && t.id === "palvelut-vs-rahat" && <ServicesVsCash detail={t.detail as SvC} />}
      {h.id === "h5" && t.id === "pysyvyys" && <PersistenceDots detail={t.detail as Persist} />}
      {h.id === "h11" && t.id === "annos" && <ChecksTable detail={t.detail as { b: number; p: number; checks: Record<string, { b: number; p: number }> }} />}
      {h.id === "h10" && t.id === "katkos" && <NeetChart a18={(t.detail as { series: [number, number][] }).series} a21={(h.tests[1]!.detail as { series: [number, number][] }).series} />}
      {h.id === "h14" && t.id === "katkos" && <BreakChart detail={t.detail as Break} cfg={{ trend: [1976, 1987], win: [1988, 1991], from: 1960, label: "laki voimaan 1/1988", ticks: [1960, 1976, 1988, 2000, 2025], zeroTicks: [0, 1, 2, 3], caption: "Avioerot 1 000 asukasta kohden (StatFin 121v). Katkoviiva: vuosien 1976–1987 trendi jatkettuna. Poikkeama 1988–1991 oli suurempi kuin kaikissa tavallisissa jaksoissa." }} />}
      {h.id === "h13" && t.id === "suomi" && <DecouplingChart detail={t.detail as { co2: [number, number][]; gdp: [number, number][] }} />}
      {h.id === "h12" && t.id === "toisto" && <CountryCorr h="h12" detail={t.detail as Pooled & Rc} />}
      {(h.id === "h8" || h.id === "h9") && t.id === "toisto" && <CountryCorr h={h.id} detail={t.detail as Pooled & Rc} />}
      {h.id === "h7" && t.id === "ajoitus" && <SuicideChart detail={t.detail as Suicide} />}
      {h.id === "h6" && t.id === "katkos" && <BreakChart detail={t.detail as Break} />}
      {h.id === "h6" && t.id === "hinta" && <PriceChart price={(t.detail as { realPrice: [number, number][] }).realPrice} mort={(h.tests[0]!.detail as Break).series} />}
      {h.id === "h5" && t.id === "ikaluokat" && <CohortChart detail={t.detail as Cohorts} />}
      {t.id === "esikoisika" && <CohortChart detail={t.detail as Cohorts} outcomeLabel="Esikoisia naista kohden 30 ikävuoteen mennessä (20–29-v.)" scale={100} unit="/100" zero={false}
        note={`Jos huono tulovaihe lykkäisi perheen perustamista, alemman käyrän pitäisi painua laman ikäluokkien ja finanssikriisin ikäluokkien kohdalla trendin alle. Testissä molemmista poistettiin ikäluokkien suora trendi. Esikoiset 40 ikävuoteen mennessä: r = ${nf((t.detail as { by40: { r: number } }).by40.r)}.`} />}
      {(t.id === "hinnat" || t.id === "korot" || t.id === "tulot" || t.id === "luotto") && <HousingDots h={h.id} id={t.id} detail={t.detail as Housing} />}
    </li>
  );
}

type Rc = { r: number; n: number; lag: number; p: number };
type Replication = { countries: Record<string, Rc>; pooled: Rc; others: Rc };

function CountryDots({ detail }: { detail: Replication }) {
  const rows: [string, Rc, boolean][] = [
    ["Suomi", detail.countries["FI"]!, false],
    ["Ruotsi", detail.countries["SE"]!, false],
    ["Norja", detail.countries["NO"]!, false],
    ["Tanska", detail.countries["DK"]!, false],
    ["Kaikki yhdessä", detail.pooled, true],
    ["Ilman Suomea", detail.others, true],
  ];
  const W = 520, L = 110, R = 500, ROW = 20;
  const x = (r: number) => L + ((r + 1) / 1.4) * (R - L); // −1 … 0,4
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${rows.length * ROW + 24}`} className="h-auto w-full min-w-[420px] max-w-xl" role="img"
        aria-label={rows.map(([n, c]) => `${n} r ${nf(c.r)}`).join(", ")}>
        <line x1={x(0)} x2={x(0)} y1={4} y2={rows.length * ROW + 4} stroke="var(--foreground)" strokeOpacity={0.5} />
        {rows.map(([name, c, pooled], i) => {
          const y = 14 + i * ROW;
          return (
            <g key={name}>
              <text x={L - 8} y={y + 4} textAnchor="end" className={`text-[11px] ${pooled ? "fill-foreground font-semibold" : "fill-muted-foreground"}`}>{name}</text>
              <line x1={x(0)} x2={x(c.r)} y1={y} y2={y} stroke="var(--primary)" strokeOpacity={0.35} strokeWidth={2} />
              <circle cx={x(c.r)} cy={y} r={pooled ? 5.5 : 4} fill={c.p < 0.05 ? "var(--primary)" : "var(--card)"} stroke="var(--primary)" strokeWidth={1.5} />
              <text x={x(c.r) - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{nf(c.r)}</text>
            </g>
          );
        })}
        {[-1, -0.5, 0].map((t) => <text key={t} x={x(t)} y={rows.length * ROW + 20} textAnchor="middle" className="fill-muted-foreground text-[10px]">{nf(t, 1)}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">Korrelaatio: naisten 25–34 työttömyyden muutos ja syntyvyyden muutos 1–2 vuotta myöhemmin (sarjojen oma jatkuvuus poistettu). Täytetty pallo: p &lt; 0,05.</p>
    </div>
  );
}

type Expect = { confidence: Rc; unemployment: Rc; confidenceLong: Rc; countries: Record<string, Rc> };
type Temporary = { temporary: Rc; unemployment: Rc; partial: Rc; countries: Record<string, Rc> };
type Firstborn = { first: Rc; later: Rc; countries: Record<string, { first: Rc; later: Rc }>; check: number };

function FirstbornDots({ detail }: { detail: Firstborn }) {
  const c = detail.countries;
  return (
    <CompareDots
      rows={[
        ["Esikoiset: Suomi", c["FI"]!.first, "test", false],
        ["Esikoiset: Ruotsi", c["SE"]!.first, "test", false],
        ["Esikoiset: Norja", c["NO"]!.first, "test", false],
        ["Esikoiset: Tanska", c["DK"]!.first, "test", false],
        ["Esikoiset yhdessä", detail.first, "test", true],
        ["Myöhemmät yhdessä", detail.later, "unemp", true],
      ]}
      side="neg"
      band="H1d:n ennuste esikoisille"
      note={`Selittäjä on naisten 25–34 työttömyys. Jos H1d pitää, esikoisten pallojen pitäisi olla nollan vasemmalla puolella ja kauempana kuin myöhempien lasten. Esikoisten hedelmällisyys on laskettu TFR:stä ja esikoisten osuudesta syntyneistä; Suomen tarkan sarjan kanssa vuosimuutosten korrelaatio on ${nf(detail.check, 3)}.`}
    />
  );
}

type Housing = { predictor: Rc; employment: Rc; countries: Record<string, Rc> };
const CNAME: Record<string, string> = { FI: "Suomi", SE: "Ruotsi", NO: "Norja", DK: "Tanska" };

const DOT_LABEL: Record<string, { label: string; side: "pos" | "neg"; band: string }> = {
  hinnat: { label: "Reaalihinnat", side: "neg", band: "H1f:n ennuste: hinnat vasemmalla" },
  korot: { label: "Korko", side: "neg", band: "H1f:n ennuste: korot vasemmalla" },
  tulot: { label: "Reaalitulot", side: "pos", band: "H1g:n ennuste: tulot oikealla" },
  luotto: { label: "Velka / tulot", side: "pos", band: "H1g:n ennuste: luotto oikealla" },
};

function HousingDots({ h, id, detail }: { h: string; id: string; detail: Housing }) {
  const cfg = DOT_LABEL[id]!;
  const label = cfg.label;
  return (
    <CompareDots
      rows={[
        ...Object.entries(detail.countries).map(([c, r]) => [`${label}: ${CNAME[c]}`, r, "test", false] as DotRow),
        [`${label} yhdessä`, detail.predictor, "test", true],
        ["Työllisyys 30–34 yhdessä", detail.employment, "unemp", true],
      ]}
      side={cfg.side}
      band={cfg.band}
      note={h === "h1f"
        ? "Jos H1f pitäisi, asuntomarkkinoiden pallojen pitäisi olla nollan vasemmalla puolella vähintään yhtä kaukana kuin työllisyyden pallo on oikealla."
        : "Jos H1g pitäisi, pallojen pitäisi olla nollan oikealla puolella vähintään yhtä kaukana kuin työllisyyden pallo. Maittainen tulos on kunkin maan vahvimmalla viiveellä, yhdistetty yhteisellä viiveellä."}
    />
  );
}

type Pooled = { predictor: Rc; countries: Record<string, Rc> };
const toDots = (d: Pooled, label: string): DotRow[] => [
  ...Object.entries(d.countries).map(([c, r]) => [`${label}: ${CNAME[c]}`, r, "test", false] as DotRow),
  ["Ruotsi + Tanska", d.predictor, "test", true],
];

function SimpleDots({ rows, side, band, note }: { rows: DotRow[]; side: "pos" | "neg"; band: string; note: string }) {
  return <CompareDots rows={rows} side={side} band={band} note={note} lead="Korrelaatio:" />;
}

type SvC = { d63: Rc; d62: Rc; d62Countries: Record<string, Rc> };
function ServicesVsCash({ detail }: { detail: SvC }) {
  return (
    <CompareDots
      rows={[
        ["Palvelut (D63) yhdessä", detail.d63, "test", true],
        ["Rahaetuudet (D62) yhdessä", detail.d62, "unemp", true],
        ...Object.entries(detail.d62Countries).map(([c, r]) => [`Rahaetuudet: ${CNAME[c]}`, r, "unemp", false] as DotRow),
      ]}
      side="neg"
      band="H4:n ennuste: palvelut vasemmalla, rahaetuudet oikealla"
      lead="Korrelaatio:"
      note="Työttömyyden muutos ja menojen reaalikasvu 1–2 vuotta myöhemmin, Suomi, Ruotsi ja Tanska. Jos H4 pitäisi, rahaetuuksien pallojen pitäisi olla palvelujen oikealla puolella."
    />
  );
}

type Persist = { r: number; n: number; neff: number; p: number; countries: Record<string, { r: number; n: number } | null> };
function PersistenceDots({ detail }: { detail: Persist }) {
  const rows: DotRow[] = [
    ...Object.entries(detail.countries).filter(([, v]) => v).map(([c, v]) => [CNAME[c]!, { r: v!.r, n: v!.n, lag: 3, p: 1 }, "test", false] as DotRow),
    ["Neljä maata yhdessä", { r: detail.r, n: detail.n, lag: 3, p: detail.p }, "test", true],
  ];
  return (
    <CompareDots rows={rows} side="pos" band="H5:n ennuste: oikealla" lead="Korrelaatio:"
      note={`Työttömyyden muutos vuonna t ja pitkäaikaistyöttömien osuuden muutos vuodesta t vuoteen t + 3. Maittaisille ei laskettu p-arvoa, koska havaintoja on vähän (Norja ${detail.countries["NO"]?.n ?? 0}). Yhdistetyn p-arvo efektiivisellä otoskoolla ${detail.neff}.`} />
  );
}

type Cohorts = { r: number; p: number; n: number; per5: number; rows: { born: number; exposure: number; outcome: number }[]; women: { r: number }; men: { r: number } };

function CohortChart({ detail, outcomeLabel = "Työllisyys 33–37-vuotiaana miinus 30–44-vuotiaat samoina vuosina, %-yks.", scale = 1, unit = "", zero = true, note }: {
  detail: Cohorts; outcomeLabel?: string; scale?: number; unit?: string; zero?: boolean; note?: string;
}) {
  const rows = detail.rows;
  const W = 620, L = 46, R = 600, H1 = 120, H2 = 120;
  const b0 = rows[0]!.born, b1 = rows.at(-1)!.born;
  const x = (b: number) => L + ((b - b0) / (b1 - b0)) * (R - L);
  const ex = rows.map((r) => r.exposure), ou = rows.map((r) => r.outcome * scale);
  const y1 = (v: number) => 12 + (1 - (v - 0) / (Math.max(...ex) + 1)) * (H1 - 28);
  const omin = zero ? Math.min(...ou, -1.5) : Math.min(...ou) - 1, omax = zero ? Math.max(...ou, 0.6) : Math.max(...ou) + 1;
  const y2 = (v: number) => H1 + 12 + (1 - (v - omin) / (omax - omin)) * (H2 - 34);
  const lama = rows.filter((r) => r.born >= 1969 && r.born <= 1975);
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H1 + H2}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img"
        aria-label={`Ikäluokat ${b0}–${b1}: työttömyys työmarkkinoille tullessa ja työllisyysero 33–37-vuotiaana`}>
        <rect x={x(1969) - 6} y={4} width={x(1975) - x(1969) + 12} height={H1 + H2 - 24} fill="var(--primary)" fillOpacity={0.07} />
        <text x={x(1972)} y={H1 + H2 - 26} textAnchor="middle" className="fill-primary text-[10px]">laman ikäluokat</text>
        <text x={L} y={10} className="fill-muted-foreground text-[10px]">Työttömyys (25–54 v), kun ikäluokka oli 21–24-vuotias, %</text>
        {rows.map((r) => <rect key={r.born} x={x(r.born) - 5} y={y1(r.exposure)} width={10} height={y1(0) - y1(r.exposure)} fill="var(--muted-foreground)" fillOpacity={0.55} />)}
        <text x={L} y={H1 + 8} className="fill-muted-foreground text-[10px]">{outcomeLabel}</text>
        {zero && <line x1={L} x2={R} y1={y2(0)} y2={y2(0)} stroke="var(--foreground)" strokeOpacity={0.4} />}
        {(zero ? [0] : [Math.round(Math.min(...ou)), Math.round(Math.max(...ou))]).map((t) => (
          <text key={t} x={L - 6} y={y2(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{t}{unit}</text>
        ))}
        <path d={rows.map((r, i) => `${i ? "L" : "M"}${x(r.born).toFixed(1)},${y2(r.outcome * scale).toFixed(1)}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        {lama.map((r) => <circle key={r.born} cx={x(r.born)} cy={y2(r.outcome * scale)} r={3} fill="var(--primary)" />)}
        {[...new Set([b0, 1970, 1975, 1980, 1985, 1990, b1])].filter((t) => t >= b0 && t <= b1).map((t) => <text key={t} x={x(t)} y={H1 + H2 - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">
        Syntymävuosi vaaka-akselilla. {note ?? `Jos huono tulovaihe jättäisi pysyvän jäljen, alemman käyrän pitäisi painua alas laman ikäluokkien kohdalla. Testissä molemmista poistettiin ikäluokkien suora trendi. Naiset r = ${nf(detail.women.r)}, miehet r = ${nf(detail.men.r)}.`}
      </p>
    </div>
  );
}

type Break = { dev: number; pct: number; percentile: number; placebo: number; above: number; series: [number, number][] };

type BreakCfg = { trend: [number, number]; win: [number, number]; from: number; label: string; ticks: number[]; zeroTicks: number[]; caption: string };
const ALCOHOL_BREAK: BreakCfg = { trend: [1992, 2003], win: [2004, 2007], from: 1985, label: "veronalennus 3/2004", ticks: [1985, 1995, 2004, 2015, 2025], zeroTicks: [0, 20, 40], caption: "" };

function BreakChart({ detail, cfg = ALCOHOL_BREAK }: { detail: Break; cfg?: BreakCfg }) {
  const pts = detail.series.filter(([y]) => y >= cfg.from);
  const pre = detail.series.filter(([y]) => y >= cfg.trend[0] && y <= cfg.trend[1]);
  const n = pre.length;
  const mx = pre.reduce((a, p) => a + p[0], 0) / n, my = pre.reduce((a, p) => a + Math.log(p[1]), 0) / n;
  const b = pre.reduce((a, p) => a + (p[0] - mx) * (Math.log(p[1]) - my), 0) / pre.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  const trend = (y: number) => Math.exp(my + b * (y - mx));
  const W = 620, H = 200, L = 40, R = 600, TOP = 12, BOT = 170;
  const x0 = pts[0]![0], x1 = pts.at(-1)![0];
  const x = (y: number) => L + ((y - x0) / (x1 - x0)) * (R - L);
  const hi = Math.max(...pts.map((p) => p[1])) * 1.05, lo = 0;
  const y = (v: number) => BOT - ((v - lo) / (hi - lo)) * (BOT - TOP);
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img"
        aria-label={`Alkoholiperäinen kuolleisuus ${x0}–${x1}, trendi 1992–2003 jatkettuna vuoteen 2007`}>
        <rect x={x(cfg.win[0])} y={TOP} width={x(cfg.win[1]) - x(cfg.win[0])} height={BOT - TOP} fill="var(--primary)" fillOpacity={0.08} />
        <text x={x(cfg.win[0]) + 3} y={TOP + 10} className="fill-primary text-[10px]">{cfg.label}</text>
        <path d={[cfg.trend[0], cfg.win[1]].map((yr, i) => `${i ? "L" : "M"}${x(yr)},${y(trend(yr))}`).join(" ")} fill="none" stroke="var(--muted-foreground)" strokeDasharray="5 4" strokeWidth={1.5} />
        <path d={pts.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        {cfg.zeroTicks.filter((t) => t < hi).map((t) => <text key={t} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{t}</text>)}
        {cfg.ticks.map((t) => <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
      </svg>
      {cfg.caption ? <p className="text-xs text-muted-foreground">{cfg.caption}</p> : <p className="text-xs text-muted-foreground">
        Alkoholiperäiset taudit ja alkoholimyrkytykset, ikävakioitu kuolleisuus / 100 000 (StatFin 11ay). Katkoviiva: vuosien 1992–2003 trendi jatkettuna. Poikkeama 2004–2007 oli suurempi kuin {detail.above}:ssä {detail.placebo} tavallisesta jaksosta; kirjattu raja oli 95 %.
      </p>}
    </div>
  );
}

function PriceChart({ price, mort }: { price: [number, number][]; mort: [number, number][] }) {
  const W = 620, H = 200, L = 40, R = 560, TOP = 14, BOT = 168;
  const X0 = price[0]![0], X1 = price.at(-1)![0];
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const m = mort.filter(([y]) => y >= X0 && y <= X1);
  const base = (s: [number, number][]) => { const b = s.find(([y]) => y === 2003)![1]; return s.map(([y, v]) => [y, (v / b) * 100] as [number, number]); };
  const P = base(price), M = base(m);
  const all = [...P, ...M].map((p) => p[1]);
  const lo = Math.min(...all) - 5, hi = Math.max(...all) + 5;
  const y = (v: number) => BOT - ((v - lo) / (hi - lo)) * (BOT - TOP);
  const line = (s: [number, number][]) => s.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img" aria-label={`Alkoholin reaalihinta ja alkoholikuolleisuus ${X0}–${X1}, 2003 = 100`}>
        <line x1={L} x2={R} y1={y(100)} y2={y(100)} stroke="var(--foreground)" strokeOpacity={0.3} />
        <text x={L - 6} y={y(100) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">100</text>
        <line x1={x(2004)} x2={x(2004)} y1={TOP} y2={BOT} stroke="var(--primary)" strokeDasharray="3 3" />
        <path d={line(P)} fill="none" stroke="var(--foreground)" strokeOpacity={0.7} strokeWidth={1.8} />
        <path d={line(M)} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        {(() => {
          const yp = y(P.at(-1)![1]), ym = y(M.at(-1)![1]);
          const gap = Math.abs(yp - ym) < 13 ? (13 - Math.abs(yp - ym)) / 2 : 0;
          const up = yp <= ym ? -1 : 1;
          return (
            <>
              <text x={R + 4} y={yp + 4 + up * gap} className="fill-foreground text-[11px]">reaalihinta</text>
              <text x={R + 4} y={ym + 4 - up * gap} className="fill-primary text-[11px] font-semibold">kuolleisuus</text>
            </>
          );
        })()}
        {[X0, 2004, 2008, 2012, 2018, X1].map((t) => <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">Alkoholijuomien reaalihinta (kuluttajahintaindeksi 02.1 / kokonaisindeksi, StatFin 15b5) ja alkoholikuolleisuus, molemmat 2003 = 100. Hinta laski 2004 ja nousi veronkorotusten myötä 2008–2014.</p>
    </div>
  );
}

type Suicide = { series: [number, number][]; unemployment: [number, number][]; men: Rc; women: Rc };

function SuicideChart({ detail }: { detail: Suicide }) {
  const S = detail.series.filter(([y]) => y <= 2018), U = detail.unemployment;
  const W = 620, H = 200, L = 44, R = 560, TOP = 14, BOT = 168;
  const X0 = 1975, X1 = 2018;
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const sMax = Math.max(...S.map((p) => p[1])) * 1.05, uMax = Math.max(...U.map((p) => p[1])) * 1.05;
  const ys = (v: number) => BOT - (v / sMax) * (BOT - TOP), yu = (v: number) => BOT - (v / uMax) * (BOT - TOP);
  const line = (s: [number, number][], f: (v: number) => number) => s.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${f(v).toFixed(1)}`).join(" ");
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img" aria-label="Itsemurhat 25–64-vuotiailla ja työttömyysaste 1975–2018">
        <rect x={x(1991)} y={TOP} width={x(1994) - x(1991)} height={BOT - TOP} fill="var(--primary)" fillOpacity={0.07} />
        <text x={x(1991) + 3} y={BOT - 4} className="fill-primary text-[10px]">lama</text>
        <path d={line(U, yu)} fill="none" stroke="var(--foreground)" strokeOpacity={0.6} strokeWidth={1.6} strokeDasharray="5 3" />
        <path d={line(S, ys)} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        {(() => {
          const a = ys(S.at(-1)![1]), b = yu(U.at(-1)![1]);
          const g = Math.abs(a - b) < 13 ? (13 - Math.abs(a - b)) / 2 : 0, d = a <= b ? -1 : 1;
          return (
            <>
              <text x={R + 4} y={a + 4 + d * g} className="fill-primary text-[11px] font-semibold">itsemurhat</text>
              <text x={R + 4} y={b + 4 - d * g} className="fill-foreground text-[11px]">työttömyys</text>
            </>
          );
        })()}
        {[0, 500, 1000].map((t) => <text key={t} x={L - 6} y={ys(t) + 4} textAnchor="end" className="fill-primary text-[10px]">{t}</text>)}
        {[1975, 1985, 1990, 1995, 2005, 2018].map((t) => <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">Itsemurhat 25–64-vuotiailla, lukumäärä (StatFin 11by, punainen asteikko) ja työttömyysaste (työvoimatutkimuksen historiallinen sarja, katkoviiva, oma asteikko). Miehet r = {nf(detail.men.r)}, naiset r = {nf(detail.women.r)}.</p>
    </div>
  );
}

function CountryCorr({ h, detail }: { h: string; detail: Pooled & Rc }) {
  const pooledLabel = h === "h9" ? "Neljä maata yhdessä" : "Ruotsi + Norja + Tanska";
  const rows: DotRow[] = [
    ...Object.entries(detail.countries).map(([c, r]) => [CNAME[c]!, r, h !== "h9" && c === "FI" ? "unemp" : "test", false] as DotRow),
    [pooledLabel, detail, "test", true],
  ];
  const cfg = {
    h8: { side: "pos" as const, band: "H8:n ennuste: oikealla", note: "Alkoholin myynnin muutos ja itsemurhakuolleisuuden muutos samana tai seuraavana vuonna (Eurostat 1995–2023). Suomi näytetään vertailuksi; yhdistetty luku on ilman Suomea." },
    h9: { side: "neg" as const, band: "H9:n ennuste: vasemmalla", note: "Masennuslääkkeiden käytön muutos ja itsemurhakuolleisuuden muutos samana tai seuraavana vuonna (2001–2023)." },
    h12: { side: "neg" as const, band: "H12:n ennuste: vasemmalla", note: "Työttömyyden muutos ja tieliikennekuolemien muutos samana tai seuraavana vuonna (Eurostat 2000–2024). Suomi näytetään vertailuksi; yhdistetty luku on ilman Suomea." },
  }[h as "h8" | "h9" | "h12"];
  return <CompareDots rows={rows} side={cfg.side} lead="Korrelaatio:" band={cfg.band} note={cfg.note} />;
}

function NeetChart({ a18, a21 }: { a18: [number, number][]; a21: [number, number][] }) {
  const S18 = a18.filter(([y]) => y >= 2000), S21 = a21.filter(([y]) => y >= 2000);
  const pre = S18.filter(([y]) => y >= 2011 && y <= 2022);
  const n = pre.length, mx = pre.reduce((a, p) => a + p[0], 0) / n, my = pre.reduce((a, p) => a + p[1], 0) / n;
  const b = pre.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pre.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  const tr = (y: number) => my + b * (y - mx);
  const W = 620, H = 200, L = 40, R = 560, TOP = 14, BOT = 168;
  const x = (y: number) => L + ((y - 2000) / 24) * (R - L);
  const hi = Math.max(...S21.map((p) => p[1]), ...S18.map((p) => p[1])) * 1.1;
  const y = (v: number) => BOT - (v / hi) * (BOT - TOP);
  const line = (s: [number, number][]) => s.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img" aria-label="Ei opiskele eikä ole töissä: osuus 18- ja 21-vuotiaista 2000–2024">
        <rect x={x(2022.5)} y={TOP} width={x(2024) - x(2022.5) + 6} height={BOT - TOP} fill="var(--primary)" fillOpacity={0.08} />
        <text x={x(2022.5) - 4} y={TOP + 10} textAnchor="end" className="fill-primary text-[10px]">laajennuksen ikäluokat 18-vuotiaina</text>
        <path d={line(S21)} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} />
        <path d={`M${x(2011)},${y(tr(2011))} L${x(2024)},${y(tr(2024))}`} fill="none" stroke="var(--foreground)" strokeOpacity={0.5} strokeDasharray="5 4" />
        <path d={line(S18)} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        <text x={R + 4} y={y(S18.at(-1)![1]) + 4} className="fill-primary text-[11px] font-semibold">18-v.</text>
        <text x={R + 4} y={y(S21.at(-1)![1]) + 4} className="fill-muted-foreground text-[11px]">21-v.</text>
        {[0, 10, 20].filter((t) => t < hi).map((t) => <text key={t} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{t} %</text>)}
        {[2000, 2005, 2010, 2015, 2021, 2024].map((t) => <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">Ei opiskele eikä ole töissä (työttömät ja muut työvoiman ulkopuolella olevat), osuus ikäluokasta 31.12. (StatFin 115c). Katkoviiva: 18-vuotiaiden trendi 2011–2022 jatkettuna. 21-vuotiaat eivät olleet uudistuksen piirissä.</p>
    </div>
  );
}

function ChecksTable({ detail }: { detail: { b: number; p: number; checks: Record<string, { b: number; p: number }> } }) {
  const c = detail.checks;
  const rows: [string, string, { b: number; p: number }][] = [
    ["Päätesti", "osuus vuotta aiemmin", { b: detail.b, p: detail.p }],
    ["R1 Ennakkotesti", "osuus kaksi vuotta myöhemmin (ei voi vaikuttaa)", c["lead"]!],
    ["R2 Aluekohtaiset trendit", "jokaiselle maakunnalle oma kehityssuunta", c["trends"]!],
    ["R3 Poikkeusvuodet pois", "ilman 2015–2017 ja 2022–2024", c["excluded"]!],
  ];
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full min-w-[440px] max-w-2xl text-sm">
        <thead><tr className="text-left text-xs text-muted-foreground"><th className="font-medium">Malli</th><th className="font-medium">Selittäjä</th><th className="font-medium">Kerroin</th><th className="font-medium">p</th></tr></thead>
        <tbody>
          {rows.map(([a, b, v]) => (
            <tr key={a} className="border-t"><td className="py-1">{a}</td><td className="text-xs">{b}</td><td className="tabular-nums">{v.b > 0 ? "+" : ""}{nf(v.b)}</td><td className="tabular-nums">{nf(v.p, 3)}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-muted-foreground">Kerroin: Suomen kansalaisten työllisyysasteen muutos (%-yks.), kun ulkomaan kansalaisten osuus on 1 %-yks. suurempi kuin muualla. Ennakkotestin yhtä suuri kerroin ja trendien jälkeen katoava yhteys osoittavat, että yhteys syntyy alueiden pitkistä kehityssuunnista.</p>
    </div>
  );
}

function DecouplingChart({ detail }: { detail: { co2: [number, number][]; gdp: [number, number][] } }) {
  const X0 = 1970, X1 = 2022;
  const idx = (s: [number, number][]) => { const b = s.find(([y]) => y === 2005)![1]; return s.filter(([y]) => y >= X0 && y <= X1).map(([y, v]) => [y, (v / b) * 100] as [number, number]); };
  const C = idx(detail.co2), G = idx(detail.gdp);
  const W = 620, H = 200, L = 40, R = 560, TOP = 14, BOT = 168;
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const all = [...C, ...G].map((p) => p[1]);
  const lo = Math.min(...all) - 5, hi = Math.max(...all) + 5;
  const y = (v: number) => BOT - ((v - lo) / (hi - lo)) * (BOT - TOP);
  const line = (s: [number, number][]) => s.map(([a, v], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img" aria-label="Suomen BKT ja hiilidioksidipäästöt 1970–2022, 2005 = 100">
        <line x1={x(2005)} x2={x(2005)} y1={TOP} y2={BOT} stroke="var(--primary)" strokeDasharray="3 3" />
        <line x1={L} x2={R} y1={y(100)} y2={y(100)} stroke="var(--foreground)" strokeOpacity={0.3} />
        <text x={L - 6} y={y(100) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">100</text>
        <path d={line(G)} fill="none" stroke="var(--foreground)" strokeOpacity={0.7} strokeWidth={1.8} />
        <path d={line(C)} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        <text x={R + 4} y={y(G.at(-1)![1]) + 4} className="fill-foreground text-[11px]">BKT</text>
        <text x={R + 4} y={y(C.at(-1)![1]) + 4} className="fill-primary text-[11px] font-semibold">CO₂</text>
        {[1970, 1980, 1990, 2005, 2022].map((t) => <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">Suomi: BKT (Maddison) ja alueperusteiset hiilidioksidipäästöt (OWID), 2005 = 100. Vuosivaihtelut kulkevat yhdessä, mutta pitkä suunta erkanee 2000-luvun puolivälistä.</p>
    </div>
  );
}

type DotRow = [string, Rc, "test" | "unemp", boolean];

function ExpectationDots({ detail }: { detail: Expect }) {
  return (
    <CompareDots
      rows={[
        ["Luottamus: Suomi", detail.countries["FI"]!, "test", false],
        ["Luottamus: Ruotsi", detail.countries["SE"]!, "test", false],
        ["Luottamus: Tanska", detail.countries["DK"]!, "test", false],
        ["Luottamus yhdessä", detail.confidence, "test", true],
        ["Työttömyys yhdessä", detail.unemployment, "unemp", true],
      ]}
      side="pos"
      band="H1b:n ennuste luottamukselle"
      note="Jos H1b pitäisi, luottamuksen pallojen pitäisi olla nollan oikealla puolella. Norjan luottamustietoa ei ole Eurostatissa."
    />
  );
}

function TemporaryDots({ detail }: { detail: Temporary }) {
  return (
    <CompareDots
      rows={[
        ["Määräaikaisuus: Suomi", detail.countries["FI"]!, "test", false],
        ["Määräaikaisuus: Ruotsi", detail.countries["SE"]!, "test", false],
        ["Määräaikaisuus: Norja", detail.countries["NO"]!, "test", false],
        ["Määräaikaisuus: Tanska", detail.countries["DK"]!, "test", false],
        ["Määräaikaisuus yhdessä", detail.temporary, "test", true],
        ["Työttömyys yhdessä", detail.unemployment, "unemp", true],
      ]}
      side="neg"
      band="H1c:n ennuste määräaikaisuudelle"
      note={`Jos H1c pitäisi, määräaikaisuuden pallojen pitäisi olla nollan vasemmalla puolella ja vähintään yhtä kaukana kuin työttömyyden. Kun työttömyys vakioidaan, määräaikaisuuden osittaiskorrelaatio on ${nf(detail.partial.r)}.`}
    />
  );
}

function CompareDots({ rows, side, band, note, lead = "Korrelaatio: selittäjän muutos ja syntyvyyden muutos 1–2 vuotta myöhemmin, samoissa maissa ja samoina vuosina." }: { rows: DotRow[]; side: "pos" | "neg"; band: string; note: string; lead?: string }) {
  const W = 560, L = 160, R = 540, ROW = 20;
  const x = (r: number) => L + ((r + 1) / 1.6) * (R - L); // −1 … +0,6
  const H = rows.length * ROW;
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 40}`} className="h-auto w-full min-w-[440px] max-w-xl" role="img"
        aria-label={rows.map(([n, c]) => `${n} r ${nf(c.r)}`).join(", ")}>
        <rect x={side === "pos" ? x(0) : L} y={4} width={side === "pos" ? R - x(0) : x(0) - L} height={H} fill="var(--primary)" fillOpacity={0.06} />
        <text x={side === "pos" ? R - 4 : L + 4} y={H + 16} textAnchor={side === "pos" ? "end" : "start"} className="fill-primary text-[10px]">{band}</text>
        <line x1={x(0)} x2={x(0)} y1={4} y2={H + 4} stroke="var(--foreground)" strokeOpacity={0.5} />
        {rows.map(([name, c, kind, pooled], i) => {
          const y = 14 + i * ROW;
          const col = kind === "test" ? "var(--primary)" : "var(--foreground)";
          return (
            <g key={name}>
              <text x={L - 8} y={y + 4} textAnchor="end" className={`text-[11px] ${pooled ? "fill-foreground font-semibold" : "fill-muted-foreground"}`}>{name}</text>
              <line x1={x(0)} x2={x(c.r)} y1={y} y2={y} stroke={col} strokeOpacity={0.35} strokeWidth={2} />
              <circle cx={x(c.r)} cy={y} r={pooled ? 5.5 : 4} fill={c.p < 0.05 ? col : "var(--card)"} stroke={col} strokeWidth={1.5} />
              <text x={c.r < 0 ? x(c.r) - 8 : x(c.r) + 8} y={y + 4} textAnchor={c.r < 0 ? "end" : "start"} className="fill-muted-foreground text-[10px]">{nf(c.r)}</text>
            </g>
          );
        })}
        {[-1, -0.5, 0, 0.5].map((t) => <text key={t} x={x(t)} y={H + 34} textAnchor="middle" className="fill-muted-foreground text-[10px]">{nf(t, 1)}</text>)}
      </svg>
      <p className="text-xs text-muted-foreground">
        {lead} Täytetty pallo: p &lt; 0,05. {note}
      </p>
    </div>
  );
}

type Regions = { rank: number; of: number; did: Record<string, number>; median: number };
const REGION_NAMES: Record<string, string> = { HVA14: "Pohjois-Karjala", HVA13: "Pohjois-Savo" };

function RegionStrip({ detail }: { detail: Regions }) {
  const vals = Object.entries(detail.did);
  const lo = Math.min(...vals.map((v) => v[1])), hi = Math.max(...vals.map((v) => v[1]));
  const W = 520, L = 20, R = 500;
  const x = (v: number) => L + ((v - lo) / (hi - lo || 1)) * (R - L);
  return (
    <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} 74`} className="h-auto w-full min-w-[420px] max-w-xl" role="img"
        aria-label={`Verenkiertoelinten kuolleisuuden osuuden muutos 23 alueella; Pohjois-Karjala sijalla ${detail.rank}`}>
        <line x1={L} x2={R} y1={36} y2={36} stroke="var(--border)" />
        {vals.map(([k, v]) => {
          const hl = k in REGION_NAMES;
          return (
            <g key={k}>
              <circle cx={x(v)} cy={36} r={hl ? 6 : 4} fill={k === "HVA14" ? "var(--primary)" : hl ? "var(--card)" : "var(--muted-foreground)"} fillOpacity={hl ? 1 : 0.5}
                stroke={hl ? "var(--primary)" : "none"} strokeWidth={1.5} />
              {hl && <text x={x(v) < L + 50 ? x(v) - 6 : x(v)} y={k === "HVA14" ? 20 : 60} textAnchor={x(v) < L + 50 ? "start" : "middle"} className="fill-foreground text-[11px] font-semibold">{REGION_NAMES[k]}</text>}
            </g>
          );
        })}
        <text x={L} y={72} className="fill-muted-foreground text-[10px]">← suurempi lasku</text>
        <text x={R} y={72} textAnchor="end" className="fill-muted-foreground text-[10px]">pienempi lasku →</text>
      </svg>
      <p className="text-xs text-muted-foreground">Verenkiertoelinten kuolleisuuden suhde muihin tauteihin, muutos 1969–71 → 1977–86 (logaritminen), 23 hyvinvointialuetta. Pohjois-Savo oli Pohjois-Karjala-projektin vertailualue.</p>
    </div>
  );
}

function Predictions({ list }: { list: Prediction[] }) {
  const tfr = NAYTTO.hypotheses.h1.nordic.tfr["FI"]!.filter(([y]) => y >= 2010);
  const last = NAYTTO.hypotheses.h1.fiTfrLast;
  const W = 620, H = 200, L = 46, R = 600, TOP = 12, BOT = 168;
  const yrs = [2010, list.at(-1)!.year];
  const vals = [...tfr.map((p) => p[1]), ...list.flatMap((p) => [p.lo, p.hi]), last[1]];
  const lo = Math.min(...vals) - 0.02, hi = Math.max(...vals) + 0.02;
  const x = (y: number) => L + ((y - yrs[0]!) / (yrs[1]! - yrs[0]!)) * (R - L);
  const y = (v: number) => BOT - ((v - lo) / (hi - lo)) * (BOT - TOP);
  const obs = [...tfr.filter(([yy]) => yy < last[0]), last] as [number, number][];
  return (
    <div className="mt-4 rounded-lg border p-3">
      <h3 className="text-sm font-semibold">Päivätyt ennusteet</h3>
      <p className="text-xs text-muted-foreground">{list[0]?.basis.startsWith("Työllisyys") ? "Malli: syntyvyyden muutos 30–34-vuotiaiden työllisyysasteen muutoksesta kaksi vuotta aiemmin." : "Malli: syntyvyyden muutos naisten 25–34 työttömyyden muutoksesta kaksi vuotta aiemmin."}</p>
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px]" role="img"
          aria-label={`Suomen kokonaishedelmällisyysluku 2010–${last[0]} ja ennusteet ${list.map((p) => `${p.year}: ${nf(p.point)} (${nf(p.lo)}–${nf(p.hi)})`).join(", ")}`}>
          {[lo + 0.02, (lo + hi) / 2, hi - 0.02].map((t, i) => (
            <text key={i} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{nf(t)}</text>
          ))}
          <path d={obs.map(([a, b], i) => `${i ? "L" : "M"}${x(a)},${y(b)}`).join(" ")} fill="none" stroke="var(--foreground)" strokeOpacity={0.7} strokeWidth={2} />
          <path d={[`M${x(last[0])},${y(last[1])}`, ...list.map((p) => `L${x(p.year)},${y(p.hi)}`), ...[...list].reverse().map((p) => `L${x(p.year)},${y(p.lo)}`), "Z"].join(" ")}
            fill="var(--primary)" fillOpacity={0.15} />
          <path d={[`M${x(last[0])},${y(last[1])}`, ...list.map((p) => `L${x(p.year)},${y(p.point)}`)].join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" />
          {list.map((p) => (
            <g key={p.id}>
              <circle cx={x(p.year)} cy={y(p.point)} r={4} fill="var(--primary)" />
              {p.actual != null && <circle cx={x(p.year)} cy={y(p.actual)} r={5} fill="var(--foreground)" />}
              <text x={x(p.year)} y={y(p.lo) + 14} textAnchor="middle" className="fill-primary text-[10px]">{nf(p.point)}</text>
            </g>
          ))}
          <text x={x(last[0])} y={y(last[1]) - 8} textAnchor="middle" className="fill-foreground text-[10px]">{last[0]}: {nf(last[1])}</text>
          {[2010, 2015, 2020, list.at(-1)!.year].map((t) => <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>)}
        </svg>
      </div>
      <table className="mt-2 w-full text-sm">
        <thead><tr className="text-left text-xs text-muted-foreground"><th className="font-medium">Vuosi</th><th className="font-medium">Ennuste</th><th className="font-medium">80 %:n väli</th><th className="font-medium">Peruste</th><th className="font-medium">Tila</th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className="border-t align-top">
              <td className="py-1 tabular-nums">{p.year}</td>
              <td className="tabular-nums">{nf(p.point)}</td>
              <td className="tabular-nums">{nf(p.lo)}–{nf(p.hi)}</td>
              <td className="text-xs">{p.basis}</td>
              <td className="text-xs">{predictionState(p) === "odottaa" ? `odottaa (kirjattu ${p.registered.split("-").reverse().join(".")})` : predictionState(p) === "osui" ? "osui" : "meni ohi"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Pohjoismaiden yhdistetty regressio (Suomi, Ruotsi, Norja, Tanska).
        Ennuste ratkeaa, kun Tilastokeskus julkaisee vuoden syntyvyyden (ennakkotieto keväällä). Ohi mennyt ennuste heikentää hypoteesia, osunut voi nostaa sen vahvasti tuetuksi.
      </p>
    </div>
  );
}
