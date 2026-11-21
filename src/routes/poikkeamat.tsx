import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useId, useMemo, useState } from "react";
import { monotonePath, runs } from "@/lib/curve";
import { indicatorsQuery, type IndicatorRow } from "@/lib/indicators-data";
import { murrosDataQuery } from "@/lib/murros-data";
import {
  crisisNear,
  explain,
  measureLabel,
  type Episode,
  type Explanation,
  type Range,
} from "@/lib/anomaly";
import { LANES } from "@/lib/system-map";

type Search = { mittari?: string; jakso?: number };

export const Route = createFileRoute("/poikkeamat")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof s["mittari"] === "string") out.mittari = s["mittari"];
    const j = Number(s["jakso"]);
    if (Number.isFinite(j) && j > 0) out.jakso = j;
    return out;
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(indicatorsQuery()),
      context.queryClient.ensureQueryData(murrosDataQuery()),
    ]),
  head: () => ({
    meta: [
      { title: "Poikkeamat – Murrosmatriisi" },
      {
        name: "description",
        content:
          "Milloin Suomen mittarit poikkesivat normaalista, ja mitkä kriisit ja päätökset sen selittävät.",
      },
      { property: "og:title", content: "Poikkeamat – Murrosmatriisi" },
      {
        property: "og:description",
        content:
          "Mittarit viitealueineen kuin laboratoriotuloksissa: mikä poikkesi normaalista ja miksi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnomalyPage,
});

const fmt = (v: number | null | undefined, d = 1) => {
  if (v == null || !Number.isFinite(v)) return "–";
  const a = Math.abs(v),
    digits = a >= 100 ? 0 : a >= 1 || a === 0 ? d : 2;
  const r = Number(v.toFixed(digits));
  return (r === 0 ? 0 : r).toLocaleString("fi-FI", { maximumFractionDigits: digits });
};
const signed = (v: number, pct: boolean) => `${v > 0 ? "+" : ""}${fmt(v)}${pct ? " %" : ""}`;
const span = (e: Pick<Episode, "start" | "end">) =>
  e.start === e.end ? String(e.start) : `${e.start}–${e.end}`;
const rangeText = (r: Range, pct: boolean) =>
  r.low != null && r.high != null
    ? `${signed(r.low, pct)} … ${signed(r.high, pct)}`
    : r.low != null
      ? `vähintään ${signed(r.low, pct)}`
      : `enintään ${signed(r.high!, pct)}`;

function AnomalyPage() {
  const { rows, crisisYears, meta } = useSuspenseQuery(indicatorsQuery()).data;
  const { data: map } = useSuspenseQuery(murrosDataQuery());
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [lane, setLane] = useState<string | null>(null);
  const sel = rows.find((r) => r.ind.key === search.mittari) ?? null;
  const ep = sel ? (sel.episodes.find((e) => e.start === search.jakso) ?? null) : null;
  const choose = (key: string | null, jakso?: number) =>
    void navigate({
      search: key ? (jakso ? { mittari: key, jakso } : { mittari: key }) : {},
      replace: true,
      resetScroll: false,
    });
  const shown = lane ? rows.filter((r) => r.ind.lane === lane) : rows;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Mikä poikkesi normaalista?</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {rows.length} Suomen mittaria viitealueineen kuten laboratoriotuloksissa. Valitse
            poikkeama, niin näet, mikä sen selittää.
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            ← Kartta
          </Link>
          <Link to="/polku" className="underline-offset-4 hover:underline">
            Aikajana →
          </Link>
        </nav>
      </header>

      <details className="mb-4 max-w-3xl rounded-md border-l-4 border-primary bg-card px-3 py-2 text-sm">
        <summary className="cursor-pointer font-semibold">Näin luet taulukkoa</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>Viitealue</b> kertoo, mikä on mittarille tavallista. Sen lähde näkyy aina:{" "}
            <i>sovittu raja-arvo</i> (esim. EU:n alijäämäraja −3 %),{" "}
            <i>pohjoismainen vertailualue</i> tai <i>Suomen oma historia</i> (vuosista 90 % osuu
            alueelle).
          </li>
          <li>
            Kasvavia sarjoja, kuten BKT:tä, arvioidaan <b>vuosimuutoksena</b>. Muuten varhaiset
            vuodet näyttäisivät poikkeavilta vain siksi, että sarja kasvaa.
          </li>
          <li>
            <b>↑ / ↓</b> merkitsee arvoa viitealueen ylä- tai alapuolella. Poikkeama ei sinänsä ole
            hyvä tai huono.
          </li>
          <li>
            Selitykset ovat kolmea tasoa: <b>vahvistettu</b> (historiallisesti kiistaton),{" "}
            <b>ehdokas</b> (samalta elämänalueelta, ei tarkistettu) ja <b>samaan aikaan</b> (ei
            selitys, vain ajallinen sattuma).
          </li>
        </ul>
      </details>

      <div role="group" aria-label="Elämänalue" className="mb-3 flex flex-wrap gap-1.5 text-sm">
        {[
          { key: null, label: "Kaikki" },
          ...LANES.map((l) => ({ key: l.key as string | null, label: l.label })),
        ].map((l) => (
          <button
            key={l.label}
            onClick={() => setLane(l.key)}
            aria-pressed={lane === l.key}
            className={`rounded-full border px-3 py-1 ${lane === l.key ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,3fr)] gap-3 border-b px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground md:grid">
          <span>Mittari</span>
          <span>Viimeisin</span>
          <span>Viitealue</span>
          <span>Poikkeamat</span>
        </div>
        {LANES.filter((l) => shown.some((r) => r.ind.lane === l.key)).map((l) => (
          <section key={l.key} aria-label={l.label}>
            <h2 className="border-b bg-muted/50 px-3 py-1.5 text-sm font-semibold">{l.label}</h2>
            {shown
              .filter((r) => r.ind.lane === l.key)
              .map((r) => (
                <Row
                  key={r.ind.key}
                  r={r}
                  active={sel?.ind.key === r.ind.key}
                  activeStart={ep?.start}
                  onPick={choose}
                />
              ))}
          </section>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Aineisto: Murrosmatriisin indikaattoritietokanta, haettu{" "}
        {new Date(meta.generated_at).toLocaleDateString("fi-FI")}. Pankkikriisien vuodet:{" "}
        {meta.crisis_source}.
      </p>

      {sel && (
        <Detail r={sel} ep={ep} nodes={map.nodes} crisisYears={crisisYears} onPick={choose} />
      )}
    </main>
  );
}

function Row({
  r,
  active,
  activeStart,
  onPick,
}: {
  r: IndicatorRow;
  active: boolean;
  activeStart: number | undefined;
  onPick: (k: string | null, j?: number) => void;
}) {
  const pct = r.ind.transform === "pct";
  const max = 40;
  return (
    <div
      className={`grid gap-x-3 gap-y-1 border-b px-3 py-2.5 text-sm last:border-b-0 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,3fr)] ${active ? "bg-primary/5" : ""}`}
    >
      <div>
        <button
          onClick={() => onPick(active ? null : r.ind.key)}
          className="text-left font-semibold underline-offset-4 hover:underline"
          aria-expanded={active}
        >
          {r.ind.name}
        </button>
        <div className="text-xs text-muted-foreground">
          {measureLabel(r.ind.transform, r.ind.unit)} · {r.pts[0]?.year}–{r.last?.year}
        </div>
      </div>
      <div className="tabular-nums">
        <span className="text-xs text-muted-foreground md:hidden">Viimeisin: </span>
        {r.last ? (
          <>
            {signed(r.last.value, pct)}{" "}
            <span className="text-xs text-muted-foreground">({r.last.year})</span>
          </>
        ) : (
          "–"
        )}
        {r.lastFlag && (
          <b
            className="ml-1 text-tension"
            title={r.lastFlag === "high" ? "viitealueen yläpuolella" : "viitealueen alapuolella"}
          >
            {r.lastFlag === "high" ? "↑" : "↓"}
          </b>
        )}
      </div>
      <div>
        <span className="tabular-nums">{rangeText(r.range, pct)}</span>
        <div className="text-xs text-muted-foreground">{r.range.label}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {r.episodes.length === 0 && (
          <span className="text-xs text-muted-foreground">Ei poikkeamia</span>
        )}
        {[...r.episodes]
          .sort((a, b) => Math.abs(b.peak.value) - Math.abs(a.peak.value))
          .slice(0, max)
          .sort((a, b) => a.start - b.start)
          .map((e) => (
            <button
              key={e.start}
              onClick={() => onPick(r.ind.key, e.start)}
              aria-pressed={active && activeStart === e.start}
              title={`${span(e)}: ${signed(e.peak.value, pct)}`}
              className={`rounded border px-1.5 py-0.5 text-xs tabular-nums ${active && activeStart === e.start ? "border-tension bg-tension text-white" : "border-tension/40 hover:border-tension"}`}
            >
              {e.dir === "high" ? "↑" : "↓"} {span(e)}
            </button>
          ))}
        {r.episodes.length > max && (
          <button
            onClick={() => onPick(r.ind.key)}
            className="px-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            +{r.episodes.length - max} muuta
          </button>
        )}
      </div>
    </div>
  );
}

function Detail({
  r,
  ep,
  nodes,
  crisisYears,
  onPick,
}: {
  r: IndicatorRow;
  ep: Episode | null;
  nodes: Parameters<typeof explain>[2];
  crisisYears: number[];
  onPick: (k: string | null, j?: number) => void;
}) {
  const pct = r.ind.transform === "pct";
  const ex = useMemo(() => (ep ? explain(ep, r.ind, nodes) : []), [ep, r.ind, nodes]);
  const jst =
    ep && (r.ind.lane === "talous" || r.ind.lane === "tyo") ? crisisNear(ep, crisisYears) : [];
  return (
    <section
      className="mt-6 rounded-xl border-2 border-primary bg-card p-4"
      aria-labelledby="mittari"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="mittari" className="font-display text-2xl">
          {r.ind.name}
        </h2>
        <button
          onClick={() => onPick(null)}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Sulje
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        {measureLabel(r.ind.transform, r.ind.unit)} · Viitealue {rangeText(r.range, pct)}:{" "}
        {r.range.basis}.
      </p>
      <Chart r={r} ep={ep} onPick={(j) => onPick(r.ind.key, j)} />
      <p className="mt-1 text-xs text-muted-foreground">
        Harmaa vyöhyke = viitealue. Punainen = viitealueen ulkopuolella. Napauta punaista kohtaa
        nähdäksesi selitykset.
      </p>

      {ep ? (
        <div className="mt-4">
          <h3 className="font-display text-xl">
            {span(ep)}: {ep.dir === "high" ? "poikkeuksellisen korkea" : "poikkeuksellisen matala"}{" "}
            <span className="text-base text-muted-foreground">
              (jyrkimmillään {ep.peak.year}: {signed(ep.peak.value, pct)})
            </span>
          </h3>
          {jst.length > 0 && (
            <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">
              <b>Ulkoinen lähde:</b> Jordà–Schularick–Taylor-tietokanta luokittelee vuoden{" "}
              {jst.join(", ")} Suomessa systeemiseksi pankkikriisiksi.
            </p>
          )}
          <Explanations items={ex} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {r.episodes.length
            ? "Valitse poikkeamajakso yllä olevasta kuvasta tai taulukosta."
            : "Mittari on pysynyt koko ajan viitealueellaan."}
        </p>
      )}

      <div className="mt-5 border-t pt-3 text-xs text-muted-foreground">
        {r.ind.interpretation && (
          <p>
            <b>Tulkinnan rajoitukset:</b> {r.ind.interpretation}
          </p>
        )}
        <p className="mt-1">
          Lähde: {r.ind.source}
          {r.ind.source_url && (
            <>
              {" "}
              ·{" "}
              <a
                href={r.ind.source_url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                avaa lähde
              </a>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

const STATUS = {
  confirmed: {
    title: "Vahvistettu selitys",
    hint: "Historiallisesti kiistaton syy tämän mittarin poikkeamalle.",
  },
  candidate: {
    title: "Selitysehdokkaat",
    hint: "Samalta elämänalueelta ja samaan aikaan alkaneita. Yhteyttä ei ole tarkistettu.",
  },
  coincident: {
    title: "Samaan aikaan tapahtui myös",
    hint: "Ei selitys: muilta elämänalueilta, vain ajallisesti lähellä.",
  },
} as const;

function Explanations({ items }: { items: Explanation[] }) {
  if (!items.length)
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Aineistossa ei ole tälle jaksolle sopivaa kriisiä, tapahtumaa tai uudistusta. Selitys voi
        löytyä aineiston ulkopuolelta.
      </p>
    );
  return (
    <div className="mt-3 grid gap-4 md:grid-cols-3">
      {(["confirmed", "candidate", "coincident"] as const).map((s) => {
        const list = items.filter((i) => i.status === s);
        if (!list.length) return null;
        return (
          <div key={s} className={s === "coincident" ? "opacity-80" : ""}>
            <h4
              className={`text-sm font-semibold uppercase tracking-wider ${s === "confirmed" ? "text-primary" : "text-muted-foreground"}`}
            >
              {STATUS[s].title}
            </h4>
            <p className="mb-2 text-xs text-muted-foreground">{STATUS[s].hint}</p>
            <ul className="space-y-2 text-sm">
              {list.map(({ node }) => (
                <li key={node.id}>
                  <Link
                    to="/tutka"
                    search={{ ilmiö: node.id }}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    <span className="tabular-nums text-muted-foreground">
                      {node.year}
                      {node.yearEnd && node.yearEnd !== node.year ? `–${node.yearEnd}` : ""}
                    </span>{" "}
                    {node.title}
                  </Link>
                  {s !== "coincident" && node.problem && (
                    <p className="text-xs text-muted-foreground">
                      {node.problem.length > 180 ? node.problem.slice(0, 178) + "…" : node.problem}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Chart({
  r,
  ep,
  onPick,
}: {
  r: IndicatorRow;
  ep: Episode | null;
  onPick: (start: number) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const w = 720,
    h = 200,
    l = 48,
    rr = 10,
    t = 10,
    b = 22;
  const pts = r.pts;
  const change = r.ind.transform !== "level";
  const x0 = pts[0]!.year,
    x1 = pts.at(-1)!.year;
  const vals = pts.map((p) => p.value);
  const lo = Math.min(change ? 0 : Infinity, ...vals, r.range.low ?? Infinity),
    hi = Math.max(change ? 0 : -Infinity, ...vals, r.range.high ?? -Infinity);
  const x = (y: number) => l + ((y - x0) / Math.max(1, x1 - x0)) * (w - l - rr);
  const y = (v: number) => t + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (h - t - b);
  const step = (w - l - rr) / Math.max(1, x1 - x0);
  // Band edges in screen space; an open-ended range (e.g. "at most 60 %") extends to the chart edge.
  const bandTop = r.range.high != null ? y(r.range.high) : t,
    bandBot = r.range.low != null ? y(r.range.low) : h - b;
  const epOf = new Map(r.episodes.flatMap((e) => e.years.map((yy) => [yy, e] as const)));
  const segs = runs(pts).map((run) => run.map((p) => ({ x: x(p.year), y: y(p.value) })));
  const curve = segs.map(monotonePath).join(" ");
  // Area between the curve and a band edge: clipped to the outside of the band it shows how far the value went.
  const areaTo = (edge: number) =>
    segs
      .filter((s) => s.length > 1)
      .map((s) => `${monotonePath(s)} L${s.at(-1)!.x},${edge} L${s[0]!.x},${edge} Z`)
      .join(" ");
  const decade = Math.ceil(x0 / 20) * 20;
  const ticks = Array.from(
    { length: Math.floor((x1 - decade) / 20) + 1 },
    (_, i) => decade + i * 20,
  );
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 w-full"
      role="img"
      aria-label={`${r.ind.name} ${x0}–${x1}, ${r.episodes.length} poikkeamajaksoa`}
    >
      <defs>
        <clipPath id={`in-${id}`}>
          <rect x={0} width={w} y={bandTop} height={Math.max(0, bandBot - bandTop)} />
        </clipPath>
        <clipPath id={`above-${id}`}>
          <rect x={0} width={w} y={0} height={Math.max(0, bandTop)} />
        </clipPath>
        <clipPath id={`below-${id}`}>
          <rect x={0} width={w} y={bandBot} height={Math.max(0, h - bandBot)} />
        </clipPath>
      </defs>
      <rect
        x={l}
        width={w - l - rr}
        y={bandTop}
        height={Math.max(0, bandBot - bandTop)}
        style={{ fill: "var(--muted-foreground)", opacity: 0.15 }}
      />
      {ep && (
        <rect
          x={Math.max(l, x(ep.start) - step / 2)}
          width={Math.min(w - rr, x(ep.end) + step / 2) - Math.max(l, x(ep.start) - step / 2)}
          y={t}
          height={h - t - b}
          style={{ fill: "var(--tension)", opacity: 0.08 }}
        />
      )}
      {change && (
        <line
          x1={l}
          x2={w - rr}
          y1={y(0)}
          y2={y(0)}
          className="stroke-border"
          strokeDasharray="3 3"
        />
      )}
      <text x={l - 4} y={y(hi) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
        {fmt(hi)}
      </text>
      <text x={l - 4} y={y(lo) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
        {fmt(lo)}
      </text>
      {[r.range.high, r.range.low].map((v) =>
        v != null && Math.abs(y(v) - y(hi)) > 12 && Math.abs(y(v) - y(lo)) > 12 ? (
          <text
            key={v}
            x={l - 4}
            y={y(v) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[11px] font-semibold"
          >
            {fmt(v)}
          </text>
        ) : null,
      )}
      {ticks.map((tk) => (
        <text
          key={tk}
          x={x(tk)}
          y={h - 6}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          {tk}
        </text>
      ))}
      {r.range.high != null && (
        <path
          d={areaTo(bandTop)}
          clipPath={`url(#above-${id})`}
          style={{ fill: "var(--tension)", opacity: 0.25 }}
        />
      )}
      {r.range.low != null && (
        <path
          d={areaTo(bandBot)}
          clipPath={`url(#below-${id})`}
          style={{ fill: "var(--tension)", opacity: 0.25 }}
        />
      )}
      <path
        d={curve}
        fill="none"
        strokeWidth={1.75}
        strokeLinejoin="round"
        className="stroke-foreground"
        clipPath={`url(#in-${id})`}
      />
      <path
        d={curve}
        fill="none"
        strokeWidth={2.25}
        strokeLinejoin="round"
        clipPath={`url(#above-${id})`}
        style={{ stroke: "var(--tension)" }}
      />
      <path
        d={curve}
        fill="none"
        strokeWidth={2.25}
        strokeLinejoin="round"
        clipPath={`url(#below-${id})`}
        style={{ stroke: "var(--tension)" }}
      />
      {pts
        .filter((p) => epOf.has(p.year))
        .map((p) => (
          <g
            key={p.year}
            onClick={() => onPick(epOf.get(p.year)!.start)}
            style={{ cursor: "pointer" }}
          >
            <circle cx={x(p.year)} cy={y(p.value)} r={9} fill="transparent" />
            <circle cx={x(p.year)} cy={y(p.value)} r={2.75} style={{ fill: "var(--tension)" }} />
            <title>{`${p.year}: ${fmt(p.value)}`}</title>
          </g>
        ))}
    </svg>
  );
}
