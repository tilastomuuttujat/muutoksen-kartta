// Skanneri: vertailee koko aineiston skannauksia, jotta päätelmiä voi rajata nopeasti.
// Aineisto: src/data/scanner.json (scripts/skannauskoe/build-scanner.py). Kaikki laskenta on puhtaita
// funktioita, jotta ne voidaan testata. Tulokset ovat järjestysehdokkaita, eivät syy-yhteyksiä.
import raw from "@/data/scanner.json";

export type Det = "a" | "t";
export type ScanSeries = {
  k: string;
  t: string;
  u: string;
  lane: string;
  theme: string;
  y0: number;
  v: (number | null)[];
  f: string;
  dup?: string;
};
type National = { threshold: number; base: number; years: number[]; share: number[]; n: number[] };
type ScannerData = {
  meta: { source: string; lanes: string[]; detectors: Record<Det, string> };
  national: Record<Det, National>;
  series: ScanSeries[];
};

export const SCANNER = raw as unknown as ScannerData;
export const LANES = SCANNER.meta.lanes;
export const DETECTORS: Record<Det, { label: string; short: string; kinds: string; info: string }> = {
  a: { label: "Poikkeamat (shokit)", short: "poikkeama", kinds: "ab", info: SCANNER.meta.detectors.a },
  t: { label: "Käänteet (rakennemuutos)", short: "käänne", kinds: "tb", info: SCANNER.meta.detectors.t },
};

/** Sarjat, joilla ei ole kaksoiskappaleen merkintää. Kaksoiskappaleet voimistaisivat samanaikaisia tapahtumia. */
export const uniqueSeries = (all: ScanSeries[] = SCANNER.series) => all.filter((s) => !s.dup);
export const byKey = (k: string, all: ScanSeries[] = SCANNER.series) => all.find((s) => s.k === k);
/** Saman ilmiön ryhmä: sarja itse ja sen kaksoiskappaleet. */
export const dupGroup = (s: ScanSeries) => s.dup ?? s.k;
export const lastYear = (s: ScanSeries) => s.y0 + s.f.length - 1;

/**
 * Vuodet, joille tunnistin on määritelty, ja onko vuosi tapahtuma.
 * Käänne vaatii viisi vuotta molemmin puolin, joten sarjan alku ja loppu jäävät pois.
 */
export function eventsOf(s: ScanSeries, det: Det): Map<number, boolean> {
  const out = new Map<number, boolean>();
  const kinds = DETECTORS[det].kinds;
  for (let i = 0; i < s.f.length; i++) {
    const c = s.f[i]!;
    if (c === ".") continue;
    if (det === "t" && (i < 5 || i + 5 >= s.f.length)) continue;
    out.set(s.y0 + i, kinds.includes(c));
  }
  return out;
}

/** Koko aineiston vuodet, joina tapahtumien osuus ylittää sattuman rajan. */
export function crisisYears(det: Det): number[] {
  const n = SCANNER.national[det];
  return n.years.filter((_, i) => n.share[i]! > n.threshold);
}

type Pair = { years: number[]; target: boolean[]; cand: boolean[] };

/** Yhteiset vuodet yhtenäisenä jaksona. Pois rajatut tai määrittelemättömät vuodet ovat "ei tapahtumaa". */
export function alignPair(target: ScanSeries, cand: ScanSeries, det: Det, exclude: Set<number> = new Set()): Pair | null {
  const et = eventsOf(target, det), ec = eventsOf(cand, det);
  const from = Math.max(target.y0, cand.y0), to = Math.min(lastYear(target), lastYear(cand));
  if (to - from < 19) return null;
  const years: number[] = [], t: boolean[] = [], c: boolean[] = [];
  let shared = 0;
  for (let y = from; y <= to; y++) {
    const a = et.get(y), b = ec.get(y);
    if (a !== undefined && b !== undefined) shared++;
    const off = exclude.has(y);
    years.push(y);
    t.push(!off && a === true);
    c.push(!off && b === true);
  }
  return shared >= 20 ? { years, target: t, cand: c } : null;
}

export type LeadResult = {
  s: ScanSeries;
  mode: Mode;
  n: number; // kohteen tapahtumat
  before: number; // joista ehdokkaalla tapahtuma 1..w vuotta aiemmin
  after: number; // joista ehdokkaalla tapahtuma 1..w vuotta myöhemmin
  same: number; // samana vuonna (yhteinen shokki)
  score: number; // tapahtumat: (before − after) / n; muutokset: |r edellä| − |r jäljessä|
  pLead: number; // ehdokas edellä (tapahtumat: merkkitesti; muutokset: viivekorrelaatio)
  pLag: number; // kohde edellä
  qLead: number;
  qLag: number;
  r?: number; // vuosimuutokset: ehdokas edellä, korrelaatio vahvimmalla viiveellä (etumerkki = suunta)
  k?: number; // vahvin viive vuosina
  rLag?: number; // kohde edellä
  kLag?: number;
};

/** Binomijakauman yläpää P(X ≥ k), X ~ Bin(n, 1/2). */
export function binomUpper(k: number, n: number): number {
  if (k <= 0) return 1;
  let p = 0, c = 1; // c = C(n, i)
  for (let i = 0; i <= n; i++) {
    if (i >= k) p += c;
    c = (c * (n - i)) / (i + 1);
  }
  return Math.min(1, p / 2 ** n);
}

/**
 * Järjestystesti tapahtumille: niistä kohteen tapahtumista, joiden lähellä ehdokkaalla on tapahtuma vain
 * toisella puolella, kuinka moni on "ehdokas ensin"? Ilman suuntaa jakautuma olisi puoliksi (merkkitesti).
 * Samana vuonna sattuvat yhteiset shokit eivät vaikuta tunnuslukuun.
 */
export function leadLag(target: ScanSeries, cand: ScanSeries, det: Det, w: number, exclude?: Set<number>) {
  const p = alignPair(target, cand, det, exclude);
  if (!p) return null;
  const nc = p.cand.filter(Boolean).length;
  const m = p.cand.length;
  let n = 0, onlyBefore = 0, onlyAfter = 0, before = 0, after = 0, same = 0;
  for (let i = 0; i < m; i++) {
    if (!p.target[i]) continue;
    n++;
    let b = false, a = false;
    for (let d = 1; d <= w; d++) {
      if (i - d >= 0 && p.cand[i - d]) b = true;
      if (i + d < m && p.cand[i + d]) a = true;
    }
    if (p.cand[i]) same++;
    if (b) before++;
    if (a) after++;
    if (b && !a) onlyBefore++;
    if (a && !b) onlyAfter++;
  }
  if (n < 4 || nc < 3) return null;
  const d = onlyBefore + onlyAfter;
  return {
    n, before, after, same,
    score: (before - after) / n,
    pLead: binomUpper(onlyBefore, d),
    pLag: binomUpper(onlyAfter, d),
  };
}

/** Benjamini–Hochberg: väärien löydösten osuus monessa yhtäaikaisessa testissä. */
export function bh(ps: number[]): number[] {
  const idx = ps.map((p, i) => [p, i] as const).sort((a, b) => a[0] - b[0]);
  const q = new Array<number>(ps.length);
  let min = 1;
  for (let r = idx.length - 1; r >= 0; r--) {
    const [p, i] = idx[r]!;
    min = Math.min(min, (p * idx.length) / (r + 1));
    q[i] = min;
  }
  return q;
}

/** Vuosimuutokset: suhteellinen, jos sarja on aina positiivinen, muuten erotus. */
export function changes(s: ScanSeries): Map<number, number> {
  const out = new Map<number, number>();
  const pos = s.v.every((v) => v == null || v > 0);
  for (let i = 1; i < s.v.length; i++) {
    const a = s.v[i - 1], b = s.v[i];
    if (a == null || b == null) continue;
    out.set(s.y0 + i, pos ? b / a - 1 : b - a);
  }
  return out;
}

const quantile = (sorted: number[], q: number) => {
  const p = (sorted.length - 1) * q, lo = Math.floor(p);
  return sorted[lo]! + (sorted[Math.min(lo + 1, sorted.length - 1)]! - sorted[lo]!) * (p - lo);
};

/**
 * Vuosimuutokset vertailukelpoisiksi: rajataan sarjan omaan 5–95 %:n väliin (sotavuodet eivät hallitse),
 * ja poistetaan sarjan oma jatkuvuus AR(1)-suodatuksella, jotta kaksi hidasta trendiä ei näytä yhteydeltä.
 */
export function prewhiten(ch: Map<number, number>): Map<number, number> {
  const vals = [...ch.values()].sort((a, b) => a - b);
  if (vals.length < 10) return new Map();
  const lo = quantile(vals, 0.05), hi = quantile(vals, 0.95);
  const w = new Map<number, number>();
  for (const [y, v] of ch) w.set(y, Math.min(hi, Math.max(lo, v)));
  const mean = [...w.values()].reduce((a, b) => a + b, 0) / w.size;
  let num = 0, den = 0;
  for (const [y, v] of w) {
    const p = w.get(y - 1);
    den += (v - mean) ** 2;
    if (p !== undefined) num += (v - mean) * (p - mean);
  }
  const phi = den ? num / den : 0;
  const out = new Map<number, number>();
  for (const [y, v] of w) {
    const p = w.get(y - 1);
    if (p !== undefined) out.set(y, v - mean - phi * (p - mean));
  }
  return out;
}

const corrAt = (t: Float64Array, c: Float64Array, k: number) => {
  // korrelaatio t[i] ja c[i − k]
  const m = c.length;
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (let i = k; i < m; i++) {
    const x = t[i]!, y = c[i - k]!;
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    n++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
  }
  if (n < 15) return 0;
  const vx = sxx - (sx * sx) / n, vy = syy - (sy * sy) / n;
  return vx > 0 && vy > 0 ? (sxy - (sx * sy) / n) / Math.sqrt(vx * vy) : 0;
};

/**
 * Edeltääkö ehdokkaan vuosimuutos kohteen muutosta (viive 1..w)? Tunnusluku on vahvin itseisarvoinen
 * korrelaatio viiveillä 1..w; vastakkainen suunta lasketaan samoin.
 */
export function leadLagChanges(target: ScanSeries, cand: ScanSeries, w: number, exclude: Set<number> = new Set()) {
  const pt = prewhiten(changes(target)), pc = prewhiten(changes(cand));
  const from = Math.max(target.y0, cand.y0) + 2, to = Math.min(lastYear(target), lastYear(cand));
  const m = to - from + 1;
  if (m < 25) return null;
  const T = new Float64Array(m), C = new Float64Array(m);
  let both = 0;
  for (let i = 0; i < m; i++) {
    const y = from + i, off = exclude.has(y);
    T[i] = !off && pt.has(y) ? pt.get(y)! : NaN;
    C[i] = !off && pc.has(y) ? pc.get(y)! : NaN;
    if (!Number.isNaN(T[i]!) && !Number.isNaN(C[i]!)) both++;
  }
  if (both < 20) return null;
  const best = (a: Float64Array, b: Float64Array) => {
    let r = 0, k = 0;
    for (let d = 1; d <= w; d++) {
      const v = corrAt(a, b, d);
      if (Math.abs(v) > Math.abs(r)) { r = v; k = d; }
    }
    return { r, k };
  };
  const lead = best(T, C), lag = best(C, T);
  // Suodatetut muutokset ovat lähes riippumattomia, joten käytetään Fisherin z-muunnosta ja
  // Šidákin korjausta w:lle kokeillulle viiveelle.
  const pOf = (r: number) => 1 - (1 - normalTwoSided(Math.atanh(Math.min(0.999999, Math.abs(r))) * Math.sqrt(Math.max(1, both - 3)))) ** w;
  return { lead, lag, both, pLead: pOf(lead.r), pLag: pOf(lag.r) };
}

/** Kaksisuuntainen p normaalijakaumasta (Abramowitz–Stegun 7.1.26). */
export function normalTwoSided(z: number): number {
  const x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return Math.max(0, 1 - erf);
}

export type Mode = Det | "m";
export const MODES: Record<Mode, string> = {
  a: "Poikkeamat (shokit)",
  t: "Käänteet (rakennemuutos)",
  m: "Vuosimuutokset (jatkuva)",
};

/** Kaikki ehdokkaat kohdesarjalle. Kohteen omat kaksoiskappaleet jätetään pois. */
export function scanTarget(target: ScanSeries, mode: Mode, w: number, exclude?: Set<number>, all: ScanSeries[] = SCANNER.series): LeadResult[] {
  const g = dupGroup(target);
  const rows: Omit<LeadResult, "qLead" | "qLag">[] = [];
  for (const s of uniqueSeries(all)) {
    if (dupGroup(s) === g) continue;
    if (mode === "m") {
      const r = leadLagChanges(target, s, w, exclude);
      if (r) rows.push({ s, mode, n: r.both, before: 0, after: 0, same: 0, score: Math.abs(r.lead.r) - Math.abs(r.lag.r),
        pLead: r.pLead, pLag: r.pLag, r: r.lead.r, k: r.lead.k, rLag: r.lag.r, kLag: r.lag.k } as Omit<LeadResult, "qLead" | "qLag">);
      continue;
    }
    const r = leadLag(target, s, mode, w, exclude);
    if (r) rows.push({ s, mode, ...r });
  }
  const qa = bh(rows.map((r) => r.pLead)), qb = bh(rows.map((r) => r.pLag));
  return rows.map((r, i) => ({ ...r, qLead: qa[i]!, qLag: qb[i]! }));
}

export type Status = "ehdokas" | "heikko" | "sattumaa";
/** q < 0,1: järjestysehdokas; p < 0,05 mutta q suurempi: heikko (voi olla monen testin sattumaa). */
export const status = (p: number, q: number): Status => (q < 0.1 ? "ehdokas" : p < 0.05 ? "heikko" : "sattumaa");

export type LaneCompare = { lane: string; a: number; b: number; na: number; nb: number };
export type EpisodeCompare = {
  lanes: LaneCompare[];
  onlyA: ScanSeries[];
  onlyB: ScanSeries[];
  both: ScanSeries[];
};

/** Kahden jakson ero: mitkä elämänalueet ja sarjat reagoivat vain toisessa. Jakso = vuosi ± w. */
export function compareEpisodes(det: Det, A: number, B: number, w = 1, all: ScanSeries[] = SCANNER.series): EpisodeCompare {
  const hit = (s: ScanSeries, y: number): boolean | null => {
    const e = eventsOf(s, det);
    let defined = false, any = false;
    for (let d = -w; d <= w; d++) {
      const v = e.get(y + d);
      if (v !== undefined) defined = true;
      if (v) any = true;
    }
    return defined ? any : null;
  };
  const acc = new Map<string, LaneCompare>();
  const onlyA: ScanSeries[] = [], onlyB: ScanSeries[] = [], both: ScanSeries[] = [];
  for (const s of uniqueSeries(all)) {
    const ha = hit(s, A), hb = hit(s, B);
    const l = acc.get(s.lane) ?? { lane: s.lane, a: 0, b: 0, na: 0, nb: 0 };
    if (ha !== null) { l.na++; if (ha) l.a++; }
    if (hb !== null) { l.nb++; if (hb) l.b++; }
    acc.set(s.lane, l);
    if (ha === null || hb === null) continue; // vertailuun vain sarjat, jotka kattavat molemmat jaksot
    if (ha && hb) both.push(s);
    else if (ha) onlyA.push(s);
    else if (hb) onlyB.push(s);
  }
  const lanes = LANES.map((l) => acc.get(l)).filter((l): l is LaneCompare => !!l && (l.na > 0 || l.nb > 0));
  return { lanes, onlyA, onlyB, both };
}

/** Elämänalueen tapahtumaosuus vuosittain (vain vuodet, joilla alueella on vähintään minN sarjaa). */
export function laneShares(lane: string, det: Det, minN = 5, all: ScanSeries[] = SCANNER.series): Map<number, number> {
  const n = new Map<number, number>(), f = new Map<number, number>();
  for (const s of uniqueSeries(all)) {
    if (s.lane !== lane) continue;
    for (const [y, x] of eventsOf(s, det)) {
      n.set(y, (n.get(y) ?? 0) + 1);
      if (x) f.set(y, (f.get(y) ?? 0) + 1);
    }
  }
  const out = new Map<number, number>();
  for (const [y, c] of n) if (c >= minN) out.set(y, (f.get(y) ?? 0) / c);
  return out;
}
