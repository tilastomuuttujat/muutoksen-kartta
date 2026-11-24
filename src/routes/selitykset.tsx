import { createFileRoute, Link } from "@tanstack/react-router";
import { ExplanationTimeline } from "@/components/ExplanationTimeline";
import {
  DECISIONS,
  NORDIC,
  PHENOMENA,
  VERDICTS,
  between,
  byVerdict,
  decompose,
  series,
  valueAt,
  type Evidence,
  type Explanation,
  type Verdict,
} from "@/lib/selitykset";

type Search = { ilmio?: string };

export const Route = createFileRoute("/selitykset")({
  validateSearch: (s: Record<string, unknown>): Search => (typeof s["ilmio"] === "string" ? { ilmio: s["ilmio"] } : {}),
  head: () => ({
    meta: [
      { title: "Selitysten punnitus – Murrosmatriisi" },
      { name: "description", content: "Yhden ilmiön kilpailevat selitykset rinnakkain: mitä kukin ennustaa, mitä havaittiin ja mikä selitys kestää." },
      { property: "og:title", content: "Miksi syntyvyys laski? Selitysten punnitus" },
      { property: "og:description", content: "Viisi selitystä syntyvyyden laskulle 2010–2024 ja mitä aineisto sanoo kustakin." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ExplanationsPage,
});

const num = (v: number, d = 2) => v.toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });
const TONE: Record<Verdict, string> = {
  sopii: "border-emerald-700/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  osittain: "border-amber-700/40 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  "ei-yksin": "border-red-700/40 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  "ei-testattu": "border-slate-400/50 bg-muted text-muted-foreground",
};

function ExplanationsPage() {
  const { ilmio } = Route.useSearch();
  const ph = PHENOMENA.find((p) => p.id === ilmio) ?? PHENOMENA[0]!;
  const rows = byVerdict(ph.explanations);
  const counts = rows.reduce<Record<string, number>>((acc, e) => ((acc[e.verdict] = (acc[e.verdict] ?? 0) + 1), acc), {});
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <header>
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">Selitysten punnitus</p>
        <h1 className="mt-1 font-display text-3xl">{ph.question}</h1>
        <p className="mt-2 text-muted-foreground">{ph.lead}</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm" aria-label="Yhteenveto">
          {(Object.keys(VERDICTS) as Verdict[]).filter((v) => counts[v]).map((v) => (
            <li key={v} className={`rounded-full border px-3 py-0.5 ${TONE[v]}`}>
              <span aria-hidden="true">{VERDICTS[v].symbol}</span> {VERDICTS[v].label}: {counts[v]}
            </li>
          ))}
        </ul>
      </header>

      <ExplanationTimeline ph={ph} />

      <Decomposition />

      <section className="mt-6" aria-labelledby="ledger">
        <h2 id="ledger" className="font-display text-2xl">Selitykset ja mitä aineisto niistä sanoo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Järjestys näytön mukaan. Avaa rivi nähdäksesi havainnon kaaviona ja lähteet.</p>
        <ol className="mt-3 space-y-3">
          {rows.map((e) => <Row key={e.id} e={e} open={false} />)}
        </ol>
      </section>

      <section className="mt-6 rounded-lg border bg-card p-4">
        <h2 className="font-display text-xl">Mitä tämä ei kerro</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {ph.notTold.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          "Ei selitä yksin" tarkoittaa, että selitys ei sovi kaikkiin havaintoihin, ei sitä, ettei tekijällä olisi lainkaan merkitystä.
          Selitykset voivat vaikuttaa yhtä aikaa.
        </p>
      </section>
    </main>
  );
}

function Row({ e, open }: { e: Explanation; open: boolean }) {
  const v = VERDICTS[e.verdict];
  return (
    <li className="rounded-lg border bg-card">
      <details open={open} className="group">
        <summary className="cursor-pointer list-none p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONE[e.verdict]}`}>
              <span aria-hidden="true">{v.symbol}</span> {v.label}
            </span>
            <h3 className="font-display text-lg">{e.title}</h3>
            <span className="ml-auto text-xs text-muted-foreground group-open:hidden">Avaa ▾</span>
          </div>
          <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jos selitys pitäisi, näkisimme</div>
              <p className="mt-0.5">{e.predicts}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Havaittiin</div>
              <p className="mt-0.5">{e.observed}</p>
            </div>
          </div>
        </summary>
        <div className="border-t px-4 pb-4 pt-3">
          <EvidenceChart kind={e.evidence} />
          <p className="mt-2 text-sm"><span className="font-semibold">Mitä tulos ei kerro:</span> {e.caveat}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Lähteet:{" "}
            {e.sources.map((s, i) => (
              <span key={s.url}>{i > 0 && " · "}<a href={s.url} className="underline underline-offset-4">{s.label}</a></span>
            ))}
          </p>
        </div>
      </details>
    </li>
  );
}

function Decomposition() {
  const [a, b] = [2010, 2024];
  const parts = [
    { key: "statfin.synt.tfr_order_1", label: "Esikoiset" },
    { key: "statfin.synt.tfr_order_2", label: "Toiset lapset" },
    { key: "statfin.synt.tfr_order_3plus", label: "Kolmannet ja myöhemmät" },
  ].map((p) => ({ label: p.label, from: valueAt(series(p.key), a) ?? 0, to: valueAt(series(p.key), b) ?? 0 }));
  const d = decompose(parts);
  return (
    <section className="mt-6 rounded-lg border bg-card p-4" aria-labelledby="decomp">
      <h2 id="decomp" className="font-display text-xl">Mistä lasku koostuu: {num(d.total)} lasta naista kohden</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Kokonaishedelmällisyysluvun muutos {a}–{b} jaettuna lapsen järjestysluvun mukaan. Tämä on kirjanpitoa, ei syy: se kertoo, missä lasku näkyy.
      </p>
      <div className="mt-3 flex h-9 w-full overflow-hidden rounded" role="img" aria-label={d.parts.map((p) => `${p.label} ${Math.round(p.share * 100)} %`).join(", ")}>
        {d.parts.map((p, i) => (
          <div key={p.label} className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${p.share * 100}%`, background: "var(--primary)", opacity: 1 - i * 0.28 }} title={`${p.label}: ${num(p.change)} (${Math.round(p.share * 100)} %)`}>
            {Math.round(p.share * 100)} %
          </div>
        ))}
      </div>
      <div className="mt-1 flex w-full text-xs text-muted-foreground">
        {d.parts.map((p) => <div key={p.label} style={{ width: `${p.share * 100}%` }}>{p.label} {num(p.change)}</div>)}
      </div>
      <p className="mt-3 text-sm">
        Kaikista naisista laskettuna lasku jakautuu tasaisesti. Kun verrataan samanikäisiä naisia sen mukaan, montako lasta heillä jo on,
        noin 82 % laskusta liittyy esikoisiin: toisia lapsia syntyy vähemmän pääosin siksi, että harvempi saa ensimmäisen.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Lähde: Tilastokeskus 12dm ja 12c6 (järjestysluvun mukainen hedelmällisyys laskettu); FLUX 2026.</p>
    </section>
  );
}

// ---------- pienet kaaviot ----------
type Line = { label: string; points: [number, number][]; strong?: boolean };
const W = 640, H = 200, L = 40, R = 520, T = 10, B = 172;

function LineChart({ lines, x0, x1, y0, y1, band, ticks, fmt = (v: number) => num(v, 1), unit = "", decisions = false }: {
  lines: Line[]; x0: number; x1: number; y0: number; y1: number; band?: [number, number]; ticks: number[]; fmt?: (v: number) => string; unit?: string; decisions?: boolean;
}) {
  const x = (yr: number) => L + ((yr - x0) / (x1 - x0)) * (R - L);
  const y = (v: number) => B - ((v - y0) / (y1 - y0)) * (B - T);
  const ends = lines
    .map((l) => ({ l, last: l.points.at(-1)! }))
    .sort((a, b) => y(a.last[1]) - y(b.last[1]));
  let prev = -99;
  const labelY = ends.map((e) => { const v = Math.max(y(e.last[1]) + 4, prev + 14); prev = v; return { ...e, v }; });
  const years = [x0, ...[2005, 2010, 2015, 2020].filter((v) => v > x0 && v < x1), x1];
  return (
    <svg viewBox={`0 0 ${W} ${H + (decisions ? 18 : 0)}`} className="h-auto w-full" role="img" aria-label={lines.map((l) => l.label).join(", ")}>
      {band && <rect x={x(band[0])} y={T} width={x(band[1]) - x(band[0])} height={B - T} fill="var(--primary)" fillOpacity={0.07} />}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={R} y1={y(t)} y2={y(t)} stroke="var(--border)" />
          <text x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{fmt(t)}{unit}</text>
        </g>
      ))}
      {years.map((yr) => <text key={yr} x={x(yr)} y={B + 15} textAnchor="middle" className="fill-muted-foreground text-[11px]">{yr}</text>)}
      {lines.map((l) => (
        <g key={l.label}>
          <path d={l.points.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(b).toFixed(1)}`).join(" ")} fill="none"
            stroke={l.strong ? "var(--primary)" : "var(--muted-foreground)"} strokeOpacity={l.strong ? 1 : 0.55} strokeWidth={l.strong ? 2.6 : 1.6} strokeLinejoin="round" />
          {l.points.map(([a, b]) => (
            <circle key={a} cx={x(a)} cy={y(b)} r={5} fill="transparent"><title>{`${l.label}, ${a}: ${fmt(b)}${unit}`}</title></circle>
          ))}
        </g>
      ))}
      {labelY.map(({ l, last, v }) => (
        <text key={l.label} x={R + 8} y={v} className={`text-[11px] ${l.strong ? "fill-primary font-semibold" : "fill-muted-foreground"}`}>{`${l.label} ${fmt(last[1])}${unit}`}</text>
      ))}
      {decisions && DECISIONS.map((d, i) => {
        const same = DECISIONS.filter((o, j) => j < i && o.year === d.year).length;
        return (
          <text key={i} x={x(d.year)} y={B + 30 + same * 0} dx={same * 9} textAnchor="middle" className={`text-[12px] ${d.dir === "up" ? "fill-emerald-700" : "fill-red-700"}`}>
            {d.dir === "up" ? "▲" : "▼"}<title>{`${d.year}: ${d.label}`}</title>
          </text>
        );
      })}
    </svg>
  );
}

function EvidenceChart({ kind }: { kind: Evidence }) {
  const tfr = series("Hedelmällisyysluku");
  const f2 = (v: number) => num(v, 2);
  switch (kind) {
    case "order":
      return (
        <figure>
          <figcaption className="text-sm font-semibold">Hedelmällisyys lapsen järjestysluvun mukaan, lasta naista kohden</figcaption>
          <LineChart x0={2008} x1={2025} y0={0.2} y1={0.85} ticks={[0.2, 0.4, 0.6, 0.8]} fmt={f2} lines={[
            { label: "Esikoiset", points: between(series("statfin.synt.tfr_order_1"), 2008, 2025), strong: true },
            { label: "Toiset", points: between(series("statfin.synt.tfr_order_2"), 2008, 2025) },
            { label: "Kolmannet+", points: between(series("statfin.synt.tfr_order_3plus"), 2008, 2025) },
          ]} />
        </figure>
      );
    case "economy":
      return (
        <figure className="grid gap-3">
          <div>
            <figcaption className="text-sm font-semibold">Syntyvyys laski…</figcaption>
            <LineChart x0={2008} x1={2025} y0={1.2} y1={1.9} band={[2015, 2019]} ticks={[1.2, 1.4, 1.6, 1.8]} fmt={f2} lines={[{ label: "Syntyvyys", points: between(tfr, 2008, 2025), strong: true }]} />
          </div>
          <div>
            <figcaption className="text-sm font-semibold">…vaikka työllisyys parani (korostettu 2015–2019)</figcaption>
            <LineChart x0={2008} x1={2025} y0={66} y1={74} band={[2015, 2019]} ticks={[66, 68, 70, 72, 74]} fmt={(v) => num(v, 0)} unit=" %" lines={[{ label: "Työllisyysaste", points: between(series("Työllisyysaste 15–64"), 2008, 2025) }]} />
          </div>
        </figure>
      );
    case "nordic":
      return (
        <figure>
          <figcaption className="text-sm font-semibold">Kokonaishedelmällisyysluku Pohjoismaissa</figcaption>
          <LineChart x0={2000} x1={2024} y0={1.2} y1={2.3} ticks={[1.2, 1.6, 2.0]} fmt={f2} lines={NORDIC.countries.map((c) => ({ label: c.name, points: c.values, strong: c.geo === "FI" }))} />
          <p className="text-xs text-muted-foreground">Lähde: {NORDIC.meta.source}.</p>
        </figure>
      );
    case "unions":
      return (
        <figure>
          <figcaption className="text-sm font-semibold">Ensisyntyvyyden laskun jakautuminen 2010-luvulla</figcaption>
          <div className="mt-2 flex h-9 w-full overflow-hidden rounded text-xs font-semibold text-white" role="img" aria-label="Noin 75 % pareilla, noin 25 % parisuhteiden muutoksesta">
            <div className="flex items-center justify-center" style={{ width: "75%", background: "var(--primary)" }}>noin 3/4: pareilla syntyy vähemmän esikoisia</div>
            <div className="flex items-center justify-center" style={{ width: "25%", background: "var(--primary)", opacity: 0.55 }}>noin 1/4: parisuhteet</div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Osuudet tutkimuksen pyöristettyinä lukuina; tutkimuksessa osuudet vaihtelevat iän ja ajanjakson mukaan.</p>
        </figure>
      );
    case "decisions":
      return (
        <figure>
          <figcaption className="text-sm font-semibold">Syntyvyys ja päätökset samalla aika-akselilla (▼ heikensi turvaa, ▲ vahvisti)</figcaption>
          <LineChart x0={2010} x1={2025} y0={1.2} y1={1.9} ticks={[1.2, 1.4, 1.6, 1.8]} fmt={f2} decisions lines={[{ label: "Syntyvyys", points: between(tfr, 2010, 2025), strong: true }]} />
          <ul className="mt-1 grid gap-0.5 text-xs text-muted-foreground sm:grid-cols-2">
            {DECISIONS.map((d, i) => <li key={i}><span className={d.dir === "up" ? "text-emerald-700" : "text-red-700"}>{d.dir === "up" ? "▲" : "▼"}</span> {d.year} {d.label}</li>)}
          </ul>
        </figure>
      );
  }
}
