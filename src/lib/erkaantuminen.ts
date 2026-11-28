// Erkaantumiskartta: missä Suomen polku erkani muista Pohjoismaista (docs/erkaantuminen.md).
// Aineisto: src/data/erkaantuminen.json (scripts/erkaantuminen/build.py). Samanaikaisuus ei ole syy.
import raw from "@/data/erkaantuminen.json";

export type Country = "FI" | "SE" | "NO" | "DK";
export type Result = {
  tau: number; F: number; p: number; break: boolean; diverging: boolean; pre: number; post: number;
  gapAtTau: number; gapEnd: number; first: number; last: number; tauRange: [number, number];
  gap: [number, number][]; fit: [number, number][];
  direction?: "huonompaan" | "parempaan" | "neutraali";
  moved?: { own: number; others: number; mover: "Suomi" | "muut" | null } | null;
};
export type Series = {
  id: string; name: string; domain: string; log: boolean; polarity: number; source: string;
  countries: Record<Country, Result | null>; levels: Record<Country, [number, number][]>;
};
export type Cluster = { n: number; K: number; window: [number, number] | null; p: number | null; nullMean?: number; null95?: number };
export type NatureCase = {
  id: string; tau: number; group: string; nHits: number; placeboP90: number; placeboMedian: number; decision: boolean;
  shocks: string[]; breakYears: number[] | null; measurement: boolean | null;
  label: "päätöksenteko" | "ulkoinen isku" | "useita" | "ei laukaisijaa"; hits: [string, string | null, string][];
};
export type Nature = {
  shocks: { id: string; name: string; years: [number, number]; domains: string[] }[];
  keywords: Record<string, string[]>; cases: NatureCase[]; heYears: [number, number]; heCount: number;
};
type Data = {
  nature?: Nature;
  built: string; analysed: Record<Country, number>; dropped: { id: string; name: string; duplicateOf: string }[];
  series: Series[]; clusters: Record<Country | "FI_worse", Cluster>;
};

export const ERK = raw as unknown as Data;
export const COUNTRIES: Country[] = ["FI", "SE", "NO", "DK"];
export const CNAME: Record<Country, string> = { FI: "Suomi", SE: "Ruotsi", NO: "Norja", DK: "Tanska" };

/** Maan erkaantumiset aikajärjestyksessä. */
export const divergences = (c: Country) =>
  ERK.series.filter((s) => s.countries[c]?.diverging).sort((a, b) => a.countries[c]!.tau - b.countries[c]!.tau);

/** Elämänalueet ja niiden erkaantumisvuosien mediaani (Suomi). */
export function domainMedians() {
  const by = new Map<string, number[]>();
  for (const s of divergences("FI")) by.set(s.domain, [...(by.get(s.domain) ?? []), s.countries.FI!.tau]);
  return [...by.entries()].map(([d, ts]) => {
    const a = [...ts].sort((x, y) => x - y);
    const m = a.length % 2 ? a[(a.length - 1) / 2]! : (a[a.length / 2 - 1]! + a[a.length / 2]!) / 2;
    return { domain: d, n: a.length, median: m };
  }).sort((a, b) => a.median - b.median);
}

/** Eron arvo näyttöyksikössä: log-sarjoissa prosenttiero, muuten sarjan oma yksikkö. */
export const gapShown = (s: Series, v: number) => (s.log ? (Math.exp(v) - 1) * 100 : v);

/** Erkaantumisen luonne sarjalle (docs/erkaantuminen.md, luonne). */
export const natureOf = (id: string) => ERK.nature?.cases.find((c) => c.id === id);
export const shockName = (id: string) => ERK.nature?.shocks.find((s) => s.id === id)?.name ?? id;
