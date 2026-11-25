// Kriisin jälki: jäikö kriisistä pysyvä poikkeama sarjan aiempaan kehitykseen nähden?
// Vertailukohta on kriisiä edeltänyt trendi (ei lähtötaso), ja jokaista kriisiä verrataan samalla
// tavalla laskettuihin tavallisiin vuosiin (lumejaksot). Kaikki laskenta on puhtaita funktioita.
import type { ScanSeries } from "./scanner";

export type Episode = { id: string; label: string; from: number; to: number };
/** Kriisien iskuvuodet: sarjan suurin poikkeama trendistä haetaan tältä väliltä. */
export const EPISODES: Episode[] = [
  { id: "nalka", label: "Nälkävuodet", from: 1866, to: 1868 },
  { id: "1918", label: "Sisällissota", from: 1917, to: 1919 },
  { id: "1930", label: "1930-luvun lama", from: 1929, to: 1932 },
  { id: "sota", label: "Sodat 1939–1945", from: 1939, to: 1945 },
  { id: "lama", label: "1990-luvun lama", from: 1990, to: 1993 },
  { id: "2009", label: "Finanssikriisi", from: 2008, to: 2010 },
  { id: "korona", label: "Pandemia", from: 2020, to: 2021 },
];
export const HORIZONS = [3, 5, 10] as const;
export type Horizon = (typeof HORIZONS)[number];

export const PRE_YEARS = 12; // trendin sovitusjakso ennen iskua
export const MIN_PRE = 8; // havaintoja vähintään
export const MIN_SHOCK = 2; // isku vähintään kahden tavallisen vuosimuutoksen kokoinen

export type Kind = "palasi" | "jalki" | "syveni" | "ylitti";
export const KINDS: Record<Kind, { label: string; info: string }> = {
  palasi: { label: "Palasi trendiin", info: "jäljellä alle kolmannes iskusta" },
  jalki: { label: "Pysyvä jälki", info: "jäljellä kolmannes – 1,2 × iskusta, samaan suuntaan" },
  syveni: { label: "Jälki syveni", info: "poikkeama kasvoi yli 1,2-kertaiseksi" },
  ylitti: { label: "Kääntyi yli", info: "päätyi trendin toiselle puolelle yli kolmanneksen verran" },
};
export const KIND_ORDER: Kind[] = ["syveni", "jalki", "palasi", "ylitti"];

export const classify = (ratio: number): Kind =>
  ratio > 1.2 ? "syveni" : ratio > 1 / 3 ? "jalki" : ratio >= -1 / 3 ? "palasi" : "ylitti";

type Transformed = { log: boolean; at: (y: number) => number | null; scale: number };
const cache = new WeakMap<ScanSeries, Transformed>();

/** Muunnos: logaritmi, jos sarja on aina positiivinen (kasvu suhteellisena), muuten taso. */
export function transform(s: ScanSeries): Transformed {
  const hit = cache.get(s);
  if (hit) return hit;
  const log = s.v.every((v) => v == null || v > 0);
  const at = (y: number) => {
    const v = s.v[y - s.y0];
    return typeof v === "number" && Number.isFinite(v) ? (log ? Math.log(v) : v) : null;
  };
  // Tavallinen vuosimuutos: muunnetun sarjan vuosimuutosten itseisarvojen mediaani koko historiassa.
  const d: number[] = [];
  for (let i = 1; i < s.v.length; i++) {
    const a = at(s.y0 + i - 1), b = at(s.y0 + i);
    if (a !== null && b !== null) d.push(Math.abs(b - a));
  }
  d.sort((x, y) => x - y);
  const scale = d.length ? d[Math.floor((d.length - 1) / 2)]! : 0;
  const out = { log, at, scale };
  cache.set(s, out);
  return out;
}

export type Trace = {
  s: ScanSeries;
  log: boolean;
  scale: number;
  slope: number; // trendin kulmakerroin (muunnetussa asteikossa)
  intercept: number;
  peakYear: number; // suurin poikkeama iskuvälillä
  shock: number; // poikkeama trendistä iskuvuonna, tavallisina vuosimuutoksina
  residual: number; // poikkeama horisontin päässä
  ratio: number;
  kind: Kind;
  endYear: number;
};

/**
 * Yhden sarjan jälki yhdelle iskuvälille. Palauttaa null, jos aineisto ei riitä tai isku on pieni.
 * Trendi sovitetaan vuosille from − PRE_YEARS … from − 1; horisontti lasketaan iskuvälin lopusta.
 */
export function traceAt(s: ScanSeries, from: number, to: number, h: number): Trace | null {
  const { log, at, scale } = transform(s);
  if (!(scale > 0)) return null;
  const pre: [number, number][] = [];
  for (let y = from - PRE_YEARS; y < from; y++) {
    const v = at(y);
    if (v !== null) pre.push([y, v]);
  }
  if (pre.length < MIN_PRE) return null;
  const mx = pre.reduce((a, p) => a + p[0], 0) / pre.length;
  const my = pre.reduce((a, p) => a + p[1], 0) / pre.length;
  const sxx = pre.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  const slope = pre.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / sxx;
  const intercept = my - slope * mx;
  const dev = (y: number) => {
    const v = at(y);
    return v === null ? null : (v - (intercept + slope * y)) / scale;
  };
  let peakYear = 0, shock = 0;
  for (let y = from; y <= to; y++) {
    const d = dev(y);
    if (d !== null && Math.abs(d) > Math.abs(shock)) { shock = d; peakYear = y; }
  }
  if (Math.abs(shock) < MIN_SHOCK) return null;
  const endYear = to + h;
  const residual = dev(endYear);
  if (residual === null) return null;
  const ratio = residual / shock;
  return { s, log, scale, slope, intercept, peakYear, shock, residual, ratio, kind: classify(ratio), endYear };
}

/** Lumejaksot: samanpituiset iskuvälit, joiden iskuväli ja seuranta eivät osu mihinkään kriisiin. */
export function placeboWindows(len: number, h: number, episodes: Episode[] = EPISODES, first = 1850, last = 2025): [number, number][] {
  const out: [number, number][] = [];
  for (let from = first + PRE_YEARS; from + len - 1 + h <= last; from++) {
    const to = from + len - 1;
    // Kriisi ei saa osua trendijaksoon, iskuväliin eikä seurantaan.
    const clash = episodes.some((e) => e.to >= from - PRE_YEARS && e.from <= to + h);
    if (!clash) out.push([from, to]);
  }
  return out;
}

export type SeriesResult = Trace & { placeboN: number; p: number };

/**
 * Kaikki sarjat yhdelle kriisille. Jokaisen sarjan jäännöspoikkeamaa verrataan saman sarjan
 * lumejaksojen jäännöspoikkeamiin: p = osuus lumejaksoista, joissa jäännös oli yhtä suuri tai suurempi.
 */
export function scanEpisode(all: ScanSeries[], e: Episode, h: number): SeriesResult[] {
  const len = e.to - e.from + 1;
  const windows = placeboWindows(len, h);
  const rows: SeriesResult[] = [];
  for (const s of all) {
    if (s.dup) continue;
    const t = traceAt(s, e.from, e.to, h);
    if (!t) continue;
    let n = 0, ge = 0;
    for (const [a, b] of windows) {
      const pt = traceAt(s, a, b, h);
      if (!pt) continue;
      n++;
      if (Math.abs(pt.residual) >= Math.abs(t.residual)) ge++;
    }
    rows.push({ ...t, placeboN: n, p: n >= 19 ? (ge + 1) / (n + 1) : 1 });
  }
  return rows;
}

/** Binomijakauman yläpää P(X ≥ k), X ~ Bin(n, p). */
export function binomTail(k: number, n: number, p: number): number {
  if (k <= 0) return 1;
  let term = (1 - p) ** n, sum = 0; // P(X = 0)
  for (let i = 0; i <= n; i++) {
    if (i >= k) sum += term;
    term = (term * (n - i) * p) / ((i + 1) * (1 - p));
  }
  return Math.min(1, sum);
}

export type RareSummary = { tested: number; rare: number; expected: number; p: number };
/**
 * Kuinka monen sarjan jälki on harvinaisen suuri sarjan omiin tavallisiin vuosiin verrattuna (p < 0,05),
 * ja onko niitä enemmän kuin sattumalta odottaisi (5 % testatuista).
 */
export function rareSummary(rows: SeriesResult[]): RareSummary {
  const tested = rows.filter((r) => r.placeboN >= 19);
  const rare = tested.filter((r) => r.p < 0.05).length;
  return { tested: tested.length, rare, expected: tested.length * 0.05, p: binomTail(rare, tested.length, 0.05) };
}

export type Distribution = { n: number; share: Record<Kind, number> };
export function distribution(traces: { kind: Kind }[]): Distribution {
  const share = { palasi: 0, jalki: 0, syveni: 0, ylitti: 0 } as Record<Kind, number>;
  for (const t of traces) share[t.kind]++;
  for (const k of KIND_ORDER) share[k] = traces.length ? share[k] / traces.length : 0;
  return { n: traces.length, share };
}

export type PlaceboSummary = {
  windows: number;
  /** keskimääräinen osuus ja 5–95 %:n vaihteluväli lumejaksojen välillä */
  mean: Record<Kind, number>;
  lo: Record<Kind, number>;
  hi: Record<Kind, number>;
};

/** Tavallisten vuosien jakauma: jokainen lumejakso antaa oman jakaumansa (vähintään 30 sarjaa). */
export function placeboSummary(all: ScanSeries[], len: number, h: number): PlaceboSummary {
  const per: Record<Kind, number[]> = { palasi: [], jalki: [], syveni: [], ylitti: [] };
  let windows = 0;
  const uniq = all.filter((s) => !s.dup);
  for (const [a, b] of placeboWindows(len, h)) {
    const tr = uniq.flatMap((s) => {
      const t = traceAt(s, a, b, h);
      return t ? [t] : [];
    });
    if (tr.length < 30) continue;
    windows++;
    const d = distribution(tr);
    for (const k of KIND_ORDER) per[k].push(d.share[k]);
  }
  const q = (xs: number[], p: number) => {
    const s = [...xs].sort((x, y) => x - y);
    return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * p)))]! : 0;
  };
  const mean = {} as Record<Kind, number>, lo = {} as Record<Kind, number>, hi = {} as Record<Kind, number>;
  for (const k of KIND_ORDER) {
    mean[k] = per[k].length ? per[k].reduce((a, b) => a + b, 0) / per[k].length : 0;
    lo[k] = q(per[k], 0.05);
    hi[k] = q(per[k], 0.95);
  }
  return { windows, mean, lo, hi };
}

/** Horisontit, joille kriisillä on seurantaa aineiston viimeiseen vuoteen mennessä. */
export const horizonsFor = (e: Episode, last = 2025) => HORIZONS.filter((h) => e.to + h <= last);

/** Trendin arvo alkuperäisessä yksikössä (logaritmi palautetaan). */
export const trendAt = (t: Trace, y: number) => {
  const v = t.intercept + t.slope * y;
  return t.log ? Math.exp(v) : v;
};

/** Poikkeama luettavassa muodossa: prosentteina trendistä (log-sarjat) tai sarjan omissa yksiköissä. */
export const deviationText = (t: Trace, z: number) => {
  const raw = z * t.scale;
  if (t.log) {
    const pct = (Math.exp(raw) - 1) * 100;
    return `${pct > 0 ? "+" : "−"}${Math.abs(pct).toLocaleString("fi-FI", { maximumFractionDigits: Math.abs(pct) < 10 ? 1 : 0 })} %`;
  }
  const a = Math.abs(raw);
  return `${raw > 0 ? "+" : "−"}${a.toLocaleString("fi-FI", { maximumSignificantDigits: 3 })} ${t.s.u}`.trim();
};
