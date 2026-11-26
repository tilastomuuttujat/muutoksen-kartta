// Heijastusaalto (/heijastukset): kuinka suuri osa kunkin kerroksen tilastosarjoista poikkeaa
// tavallisesta (poikkeama tai käänne) vuosittain. Aineisto: src/data/scanner.json (Turso).
import raw from "@/data/scanner.json";

export type ScanSeries = { k: string; t: string; lane: string; y0: number; v: (number | null)[]; f: string; dup?: string };

export const LAYERS = [
  { key: "pinta", label: "Talous ja päätökset", hint: "rahoitus, julkinen talous", lanes: ["Talous ja rahoitus", "Julkinen talous"] },
  { key: "vali", label: "Työ, toimeentulo ja asuminen", hint: "työmarkkinat, tulot, asunnot", lanes: ["Työ ja tuotanto", "Toimeentulo ja eriarvoisuus", "Asuminen ja alueet"] },
  { key: "arki", label: "Arki ja elämänkulku", hint: "perheet, terveys, koulutus, turvallisuus", lanes: ["Väestö ja perhe", "Terveys ja hoiva", "Koulutus ja kulttuuri", "Rikollisuus ja kontrolli"] },
] as const;

export const CRISES = [
  { key: "ww1", label: "1. maailmansota ja sisällissota", start: 1914, end: 1919 },
  { key: "lama30", label: "1930-luvun lama", start: 1929, end: 1933 },
  { key: "sodat", label: "Sodat 1939–45", start: 1939, end: 1945 },
  { key: "oljy", label: "Öljykriisi", start: 1973, end: 1976 },
  { key: "lama90", label: "1990-luvun lama", start: 1990, end: 1994 },
  { key: "fin", label: "Finanssikriisi", start: 2008, end: 2010 },
  { key: "korona", label: "Korona", start: 2020, end: 2021 },
];

export type LayerYear = { year: number; n: number; hits: number; share: number };

/** Osuus kerroksen sarjoista, joilla on vuonna poikkeama tai käänne. Kaksoiskappaleet ohitetaan. */
export function layerShares(series: ScanSeries[], lanes: readonly string[], y0: number, y1: number): LayerYear[] {
  const own = series.filter((s) => !s.dup && lanes.includes(s.lane));
  const out: LayerYear[] = [];
  for (let year = y0; year <= y1; year++) {
    let n = 0, hits = 0;
    for (const s of own) {
      const c = s.f[year - s.y0];
      if (c === undefined || c === ".") continue;
      n++;
      if (c !== "0") hits++;
    }
    out.push({ year, n, hits, share: n >= 5 ? hits / n : 0 });
  }
  return out;
}

/** Kriisin aalto kerroksessa: vuosi, jolloin osuus oli suurin kriisin aikana tai 6 vuotta sen jälkeen. */
export function wavePeak(rows: LayerYear[], start: number, end: number, after = 6): LayerYear | null {
  let best: LayerYear | null = null;
  for (const r of rows) if (r.year >= start && r.year <= end + after && r.n >= 5 && (!best || r.share > best.share)) best = r;
  return best;
}

/** Tavallinen taso: osuuksien mediaani vuosilta, joilla on vähintään 5 sarjaa. */
export function typical(rows: LayerYear[]): number {
  const v = rows.filter((r) => r.n >= 5).map((r) => r.share).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)]! : 0;
}

export const SERIES = (raw as unknown as { series: ScanSeries[] }).series;
