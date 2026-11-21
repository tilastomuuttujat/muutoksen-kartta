// Poikkeamat ("laboratorioarvot"): pure logic for the /poikkeamat page.
//
// Every indicator gets a reference range, and the reader always sees where that range comes from:
//  - "corridor": the project's own pooled Nordic 5–95 % corridor (simulation_normalization_params)
//  - "norm":     an agreed limit, e.g. the EU deficit (−3 % of GDP) and debt (60 % of GDP) limits
//  - "history":  the indicator's own history in Finland, 5–95 % of all observed years
// Trending series are judged by their year-on-year change ("pct" / "diff"), not their level,
// otherwise early years would look abnormal only because the series grows over time.
import { LANES, laneOf, type MapNode } from "./system-map";

export type Transform = "level" | "pct" | "diff";
export type Reference =
  | { kind: "history" }
  | { kind: "corridor"; low: number; high: number; favorable: number; method: string }
  | { kind: "norm"; low: number | null; high: number | null; label: string };
export type Indicator = {
  key: string;
  lane: string;
  name: string;
  title: string;
  unit: string;
  source: string;
  source_url: string;
  interpretation: string;
  transform: Transform;
  reference: Reference;
  values: [number, number][];
};
export type Point = { year: number; value: number };
export type Range = { low: number | null; high: number | null; label: string; basis: string };
export type Episode = {
  start: number;
  end: number;
  dir: "high" | "low";
  peak: Point;
  years: number[];
};

/** The values the reference range is applied to: the level, or the change from the previous year. */
export function assessed(ind: Pick<Indicator, "values" | "transform">): Point[] {
  const v = ind.values;
  if (ind.transform === "level") return v.map(([year, value]) => ({ year, value }));
  const out: Point[] = [];
  for (let i = 1; i < v.length; i++) {
    const [y0, a] = v[i - 1]!,
      [y, b] = v[i]!;
    if (y - y0 !== 1) continue; // only true year-on-year changes
    if (ind.transform === "pct") {
      if (a !== 0) out.push({ year: y, value: (b / a - 1) * 100 });
    } else out.push({ year: y, value: b - a });
  }
  return out;
}

export function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * q,
    lo = Math.floor(i),
    hi = Math.ceil(i);
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (i - lo);
}

export const measureLabel = (t: Transform, unit: string) =>
  t === "pct" ? "vuosimuutos, %" : t === "diff" ? `vuosimuutos${unit ? `, ${unit}` : ""}` : unit;

export function referenceRange(ind: Indicator, pts = assessed(ind)): Range {
  const r = ind.reference;
  if (r.kind === "corridor")
    return {
      low: r.low,
      high: r.high,
      label: "Pohjoismainen vertailualue",
      basis: "Pohjoismaiden havaintojen 5–95 % vaihteluväli (projektin turvallinen käytävä)",
    };
  if (r.kind === "norm")
    return { low: r.low, high: r.high, label: "Sovittu raja-arvo", basis: r.label };
  const s = pts.map((p) => p.value).sort((a, b) => a - b);
  const y0 = pts[0]?.year,
    y1 = pts.at(-1)?.year;
  return {
    low: quantile(s, 0.05),
    high: quantile(s, 0.95),
    label: "Suomen oma historia",
    basis: `Suomen vuosien ${y0}–${y1} 5–95 % vaihteluväli`,
  };
}

export const flag = (v: number, r: Range): "high" | "low" | null =>
  r.high != null && v > r.high ? "high" : r.low != null && v < r.low ? "low" : null;

/** Consecutive abnormal years in the same direction form one episode (e.g. 1991–1993). */
export function episodes(pts: Point[], r: Range): Episode[] {
  const out: Episode[] = [];
  for (const p of pts) {
    const d = flag(p.value, r);
    if (!d) continue;
    const last = out.at(-1);
    if (last && last.dir === d && p.year - last.end === 1) {
      last.end = p.year;
      last.years.push(p.year);
      if (Math.abs(p.value) > Math.abs(last.peak.value)) last.peak = p;
    } else out.push({ start: p.year, end: p.year, dir: d, peak: p, years: [p.year] });
  }
  return out;
}

// ---- Explanations ----

/**
 * Crises whose effect on these indicators is historically undisputed. Only these are shown as
 * confirmed explanations; everything else is a candidate. Editors: add an entry only when the
 * event is the established explanation for the abnormal years of the listed indicators.
 */
export const CONFIRMED: { node: string; from: number; to: number; indicators: string[] }[] = [
  {
    node: "nalkavuodet-1866",
    from: 1866,
    to: 1869,
    indicators: [
      "gapminder.finland.child_mortality_0_5_year_olds_dying_per_1000_born.v20261026",
      "gapminder.finland.children_per_woman_total_fertility.v20261026",
      "fi.statfin15ai.total.b1gmh.b60cef008d",
    ],
  },
  {
    node: "ensimmainen-maailmansota",
    from: 1914,
    to: 1919,
    indicators: [
      "fi.statfin15ai.total.b1gmh.b60cef008d",
      "fi.statfin15ai.total.p61k.eb971a1c0a",
      "fi.statfin15ai.total.p51k.eb971a1c0a",
      "fi.historical20261026.statfin11xy.cpi1914",
    ],
  },
  {
    node: "sisallissota-1918",
    from: 1918,
    to: 1919,
    indicators: [
      "fi.statfin15ai.total.b1gmh.b60cef008d",
      "gapminder.finland.child_mortality_0_5_year_olds_dying_per_1000_born.v20261026",
      "crime.hcs.fi.prison_all_dec31",
      "fi.historical20261026.statfin11xy.cpi1914",
    ],
  },
  {
    node: "1930-luvun-lama-suomessa",
    from: 1929,
    to: 1933,
    indicators: [
      "fi.statfin15ai.total.b1gmh.b60cef008d",
      "fi.statfin15ai.total.p61k.eb971a1c0a",
      "fi.statfin15ai.total.p51k.eb971a1c0a",
    ],
  },
  {
    node: "talvi-ja-jatkosota",
    from: 1939,
    to: 1946,
    indicators: [
      "fi.statfin15ai.total.b1gmh.b60cef008d",
      "fi.statfin15ai.total.p61k.eb971a1c0a",
      "fi.statfin15ai.total.p51k.eb971a1c0a",
      "fi.historical20261026.statfin11xy.cpi1914",
      "gapminder.finland.child_mortality_0_5_year_olds_dying_per_1000_born.v20261026",
      "crime.hcs.fi.prison_all_dec31",
      "gapminder.finland.co2_pcap_terr.v20261026",
    ],
  },
  {
    node: "oljy-kriisi-1973",
    from: 1973,
    to: 1976,
    indicators: ["fi.historical20261026.statfin11xy.cpi1914"],
  },
  {
    node: "1990-luvun-lama",
    from: 1990,
    to: 1994,
    indicators: [
      "fi.statfin15ai.total.b1gmh.b60cef008d",
      "fi.statfin15ai.total.p51k.eb971a1c0a",
      "fi.histlabour.lfs2019.unemployment_rate",
      "fi.histlabour.lfs2019.employment_rate",
      "fi.atlas1960.general_government_balance_gdp",
      "fi.historical20261026.jst.credit_gdp",
      "owid.finland.historical-gov-spending-gdp.v20261026",
      "fi.turning.index1975.household_disposable_real_per_capita",
    ],
  },
  {
    node: "pankkikriisi",
    from: 1991,
    to: 1994,
    indicators: [
      "fi.historical20261026.jst.credit_gdp",
      "fi.statfin15ai.total.p51k.eb971a1c0a",
      "fi.atlas1960.general_government_balance_gdp",
    ],
  },
  {
    node: "finanssikriisi-2008",
    from: 2008,
    to: 2010,
    indicators: [
      "fi.statfin15ai.total.b1gmh.b60cef008d",
      "fi.statfin15ai.total.p61k.eb971a1c0a",
      "fi.statfin15ai.total.p51k.eb971a1c0a",
    ],
  },
  {
    node: "covid-19",
    from: 2020,
    to: 2021,
    indicators: [
      "fi.atlas1960.general_government_balance_gdp",
      "owid.finland.historical-gov-spending-gdp.v20261026",
    ],
  },
];

/** Event-like phenomena can explain a sudden deviation; slow arcs spanning decades cannot pinpoint one. */
const EVENT_TYPES = new Set(["kriisi", "tapahtuma", "uudistus", "instituutio"]);
const LOOKBACK = 2;
const MAX_CRISIS = 8;

export type Explanation = { node: MapNode; status: "confirmed" | "candidate" | "coincident" };

/** Explanations for an episode: confirmed first, then same-life-area candidates, then other events at the same time. */
export function explain(
  ep: Pick<Episode, "start" | "end">,
  ind: Pick<Indicator, "key" | "lane">,
  nodes: MapNode[],
) {
  const lane = LANES.findIndex((l) => l.key === ind.lane);
  // A phenomenon can explain the episode if it starts just before or during it. Ongoing phenomena count only
  // when they are crises of at most MAX_CRISIS years: long-running institutions would "explain" every year.
  const fits = (n: MapNode, a: number, b: number) =>
    (n.year >= a && n.year <= b) ||
    (n.type === "kriisi" &&
      n.year <= b &&
      (n.yearEnd ?? n.year) >= a &&
      (n.yearEnd ?? n.year) - n.year <= MAX_CRISIS);
  const confirmedIds = new Set(
    CONFIRMED.filter(
      (c) => c.indicators.includes(ind.key) && c.from <= ep.end && c.to >= ep.start,
    ).map((c) => c.node),
  );
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const confirmed = [...confirmedIds].map((id) => byId.get(id)).filter((n): n is MapNode => !!n);
  const pool = nodes
    .filter(
      (n) =>
        !confirmedIds.has(n.id) && EVENT_TYPES.has(n.type) && fits(n, ep.start - LOOKBACK, ep.end),
    )
    .sort(
      (a, b) =>
        Number(b.type === "kriisi") - Number(a.type === "kriisi") ||
        b.importance - a.importance ||
        a.year - b.year,
    );
  const candidates = pool.filter((n) => laneOf(n.domains) === lane).slice(0, 3);
  const coincident = pool
    .filter((n) => laneOf(n.domains) !== lane && n.importance >= 4)
    .slice(0, 3);
  return [
    ...confirmed.map((node) => ({ node, status: "confirmed" as const })),
    ...candidates.map((node) => ({ node, status: "candidate" as const })),
    ...coincident.map((node) => ({ node, status: "coincident" as const })),
  ];
}

/** External check: the JST database classifies these years as systemic banking crises. */
export const crisisNear = (ep: Pick<Episode, "start" | "end">, crisisYears: number[]) =>
  crisisYears.filter((y) => y >= ep.start - 1 && y <= ep.end + 1);
