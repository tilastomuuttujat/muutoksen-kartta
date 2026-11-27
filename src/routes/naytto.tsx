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
          Pilotti: seitsemän hypoteesia, joista yksi tuli seulasta. Tulokset {NAYTTO.built.split("-").reverse().join(".")}. <a href={REGISTER_URL} className="underline underline-offset-4">Hypoteesirekisteri</a> (kirjattu ennen testejä, muutokset uusina merkintöinä).
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
      <h2 id="ladder-h" className="font-display text-xl">Kaksi väitettä kumoutui, yksi on tuettu, kaksi on ehdokkaita ja kahden näyttö on kesken</h2>
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

      <p className="mt-4 text-sm">{h.reading}</p>
      <p className="mt-2 text-sm text-muted-foreground"><strong>Seuraavaksi:</strong> {h.next}</p>
    </section>
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

function CompareDots({ rows, side, band, note }: { rows: DotRow[]; side: "pos" | "neg"; band: string; note: string }) {
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
        Korrelaatio: selittäjän muutos ja syntyvyyden muutos 1–2 vuotta myöhemmin, samoissa maissa ja samoina vuosina. Täytetty pallo: p &lt; 0,05. {note}
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
